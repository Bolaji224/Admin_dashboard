import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/utils/axios";
import Lucide from "@/components/Base/Lucide";
import { FormInput } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import Pagination from "@/components/Base/Pagination";
import moment from "moment";

/* ─── Types ─── */

interface Employer {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

interface SmartStartRequest {
  id: number;
  title: string;
  project_type: string;
  description: string;
  budget_min: number;
  budget_max: number;
  deadline: string;
  urgency: "flexible" | "normal" | "urgent";
  status: "pending" | "matched" | "selected" | "completed";
  payment_status: "paid" | "unpaid";
  paid_at: string | null;
  payment_reference: string | null;
  created_at: string;
  employer: Employer;
}

type StatusFilter = "" | "pending" | "matched" | "selected" | "completed";

/* ─── Maps ─── */

const statusLabel: Record<string, string> = {
  pending: "Under Review",
  matched: "Talent Pack Ready",
  selected: "Freelancer Chosen",
  completed: "Completed",
};

const statusBadgeClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  matched: "bg-green-100 text-green-700",
  selected: "bg-blue-100 text-blue-700",
  completed: "bg-slate-100 text-slate-600",
};

const urgencyBadgeClass: Record<string, string> = {
  flexible: "bg-slate-100 text-slate-600",
  normal: "bg-blue-100 text-blue-700",
  urgent: "bg-red-100 text-red-700",
};

/* ─── Tab config ─── */

const TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "" },
  { label: "Under Review", value: "pending" },
  { label: "Talent Pack Ready", value: "matched" },
  { label: "Freelancer Chosen", value: "selected" },
  { label: "Completed", value: "completed" },
];

/* ─── Component ─── */

function Main() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SmartStartRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRequests = useCallback(
    async (page: number, status: StatusFilter, q: string) => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page };
        if (status) params.status = status;
        if (q.trim()) params.search = q.trim();

        const res = await axios.get("/admin/smartstart", { params });
if (res.data?.status === "success") {
          const d = res.data.data;
          setRequests(Array.isArray(d.data) ? d.data : []);
          setCurrentPage(d.current_page ?? 1);
          setTotal(d.total ?? 0);
          const perPage = d.per_page ?? 10;
          setLastPage(d.last_page ?? Math.ceil((d.total ?? 0) / perPage));
        }
      } catch {
        showToast("Failed to load SmartStart requests", false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchRequests(1, statusFilter, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, fetchRequests]);

  const handleSearch = () => {
    fetchRequests(1, statusFilter, search);
  };

  const handlePageChange = (p: number) => {
    if (p < 1 || p > lastPage || p === currentPage) return;
    fetchRequests(p, statusFilter, search);
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.ok ? "bg-success" : "bg-danger"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <h2 className="mt-10 text-lg font-medium intro-y">SmartStart™ Requests</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500 intro-y">
        Review incoming SmartStart briefs and assign Talent Packs to paid employers.
      </p>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 mt-3 mb-5 intro-y">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === tab.value
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-2 mb-5 intro-y">
        <div className="relative text-slate-500">
          <FormInput
            type="text"
            className="w-64 pr-10 !box"
            placeholder="Search project or employer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) =>
              e.key === "Enter" && handleSearch()
            }
          />
          <Lucide
            icon="Search"
            className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"
          />
        </div>
        <Button variant="primary" onClick={handleSearch}>
          Search
        </Button>
        <div className="ml-auto text-sm text-slate-500 hidden md:block">
          {total} request{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto intro-y">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Lucide
              icon="Loader"
              className="w-8 h-8 mx-auto mb-3 animate-spin text-primary"
            />
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Lucide icon="Inbox" className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No SmartStart requests found</p>
            <p className="text-sm mt-1">
              {search
                ? "Try adjusting your search."
                : "No requests in this category yet."}
            </p>
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Employer
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Project
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Budget
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Deadline
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Urgency
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Payment
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Submitted
                </th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr
                  key={req.id}
                  className={req.payment_status === "unpaid" ? "opacity-60" : ""}
                >
                  {/* Employer */}
                  <td className="bg-white px-5 py-3 rounded-l-lg whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      {req.employer?.avatar ? (
                        <img
                          src={req.employer.avatar}
                          alt={req.employer.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(req.employer?.name || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          {req.employer?.name || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {req.employer?.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Project title */}
                  <td className="bg-white px-5 py-3 max-w-[160px]">
                    <div className="font-medium text-sm line-clamp-2">
                      {req.title}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{req.project_type}</div>
                  </td>

                  {/* Budget */}
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium">
                      ₦{(req.budget_min || 0).toLocaleString()} –{" "}
                      ₦{(req.budget_max || 0).toLocaleString()}
                    </div>
                  </td>

                  {/* Deadline */}
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div className="text-sm">
                      {req.deadline
                        ? moment(req.deadline).format("DD MMM YYYY")
                        : "—"}
                    </div>
                  </td>

                  {/* Urgency */}
                  <td className="bg-white px-5 py-3 text-center">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                        urgencyBadgeClass[req.urgency] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {req.urgency}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="bg-white px-5 py-3 text-center">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-medium whitespace-nowrap ${
                        statusBadgeClass[req.status] ??
                        "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {statusLabel[req.status] ?? req.status}
                    </span>
                  </td>

                  {/* Payment */}
                  <td className="bg-white px-5 py-3 text-center whitespace-nowrap">
                    {req.payment_status === "paid" ? (
                      <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-green-100 text-green-700">
                        Paid
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-amber-100 text-amber-700">
                        Awaiting Payment
                      </span>
                    )}
                  </td>

                  {/* Submitted date */}
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div className="text-sm">
                      {moment(req.created_at).format("DD MMM YYYY")}
                    </div>
                    <div className="text-xs text-slate-500">
                      {moment(req.created_at).format("h:mm A")}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="bg-white px-5 py-3 text-center rounded-r-lg">
                    <Button
                      variant="primary"
                      className="px-3 py-1 text-xs whitespace-nowrap"
                      onClick={() => navigate(`/admin/smartstart/${req.id}`)}
                    >
                      Review →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {lastPage > 1 && !loading && (
        <div className="flex items-center mt-5 intro-y">
          <Pagination className="w-full sm:w-auto sm:mr-auto">
            <li className="flex-1 sm:flex-initial">
              <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="min-w-[40px] h-9 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Lucide icon="ChevronLeft" className="w-4 h-4" />
              </button>
            </li>
            {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
              <li key={p} className="flex-1 sm:flex-initial">
                <button
                  onClick={() => handlePageChange(p)}
                  className={`min-w-[40px] h-9 flex items-center justify-center rounded text-sm sm:mr-1 ${
                    p === currentPage
                      ? "box font-medium"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              </li>
            ))}
            <li className="flex-1 sm:flex-initial">
              <button
                disabled={currentPage >= lastPage}
                onClick={() => handlePageChange(currentPage + 1)}
                className="min-w-[40px] h-9 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Lucide icon="ChevronRight" className="w-4 h-4" />
              </button>
            </li>
          </Pagination>
        </div>
      )}
    </>
  );
}

export default Main;
