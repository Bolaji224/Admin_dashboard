import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import Tippy from "@/components/Base/Tippy";
import { FormInput } from "@/components/Base/Form";
import Pagination from "@/components/Base/Pagination";
import { Dialog } from "@/components/Base/Headless";
import affiliateApi from "@/utils/affiliateApi";
import moment from "moment";

/* ─── Types ─── */

interface Referral {
  id: number;
  affiliate_id: number;
  affiliate_name: string;
  affiliate_email: string;
  referral_code: string;
  referred_name: string | null;
  referred_email: string;
  referral_source: string | null;
  status: "clicked" | "registered" | "qualified" | "converted" | "rejected" | "cancelled";
  conversion_status: string | null;
  conversion_date: string | null;
  commission: number | null;
  commission_status: string | null;
  created_at: string;
}

type StatusFilter =
  | ""
  | "clicked"
  | "registered"
  | "qualified"
  | "converted"
  | "rejected"
  | "cancelled";

/* ─── Maps ─── */

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "" },
  { label: "Clicked", value: "clicked" },
  { label: "Registered", value: "registered" },
  { label: "Qualified", value: "qualified" },
  { label: "Converted", value: "converted" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const referralStatusBadge: Record<string, string> = {
  clicked: "bg-slate-100 text-slate-600",
  registered: "bg-blue-100 text-blue-700",
  qualified: "bg-amber-100 text-amber-700",
  converted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const commissionStatusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

/* ─── Component ─── */

function Main() {
  const navigate = useNavigate();
  const location = useLocation();

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [viewTarget, setViewTarget] = useState<Referral | null>(null);

  // Support ?affiliate_id= from affiliate detail link
  const affiliateIdParam = new URLSearchParams(location.search).get("affiliate_id");

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReferrals = useCallback(
    async (page: number, status: StatusFilter, q: string) => {
      setLoading(true);
      try {
        const params: Record<string, any> = { page };
        if (status) params.status = status;
        if (q.trim()) params.search = q.trim();
        if (affiliateIdParam) params.affiliate_id = affiliateIdParam;

        const res = await affiliateApi.getReferrals(params);
        if (res.data?.status === "success") {
          const d = res.data.data;
          setReferrals(Array.isArray(d.data) ? d.data : []);
          setCurrentPage(d.current_page ?? 1);
          setTotal(d.total ?? 0);
          setLastPage(d.last_page ?? 1);
        } else {
          showToast(res.data?.message || "Failed to load referrals", false);
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || "Failed to load referrals", false);
        setReferrals([]);
      } finally {
        setLoading(false);
      }
    },
    [affiliateIdParam]
  );

  useEffect(() => {
    fetchReferrals(1, statusFilter, "");
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, fetchReferrals]);

  const handleSearch = () => {
    fetchReferrals(1, statusFilter, search);
  };

  const handlePageChange = (p: number) => {
    if (p < 1 || p > lastPage || p === currentPage) return;
    fetchReferrals(p, statusFilter, search);
  };

  return (
    <>
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[9999] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.ok ? "bg-success" : "bg-danger"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <h2 className="mt-10 text-lg font-medium intro-y">Referrals</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500 intro-y">
        All referrals tracked through the Workason Affiliate Programme.
        {affiliateIdParam && (
          <>
            {" "}
            Showing referrals for affiliate{" "}
            <button
              onClick={() => navigate(`/admin/affiliates/${affiliateIdParam}`)}
              className="text-primary hover:underline"
            >
              #{affiliateIdParam}
            </button>
            .{" "}
            <button
              onClick={() => navigate("/admin/referrals")}
              className="text-slate-500 hover:underline text-xs"
            >
              Clear filter
            </button>
          </>
        )}
      </p>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5 mt-3 mb-5 intro-y">
        {STATUS_TABS.map((tab) => (
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
            className="w-72 pr-10 !box"
            placeholder="Search by affiliate, email, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) =>
              e.key === "Enter" && handleSearch()
            }
          />
          <Lucide icon="Search" className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
        </div>
        <Button variant="primary" onClick={handleSearch}>
          Search
        </Button>
        <div className="ml-auto text-sm text-slate-500 hidden md:block">
          {total} referral{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto intro-y">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Lucide icon="Loader" className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            Loading referrals...
          </div>
        ) : referrals.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Lucide icon="Share2" className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No referrals found</p>
            <p className="text-sm mt-1">
              {search ? "Try adjusting your search." : "No referrals in this category yet."}
            </p>
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Affiliate</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Referred User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Source</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Conversion</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Commission</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Comm. Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Date</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref) => (
                <tr key={ref.id}>
                  <td className="bg-white px-5 py-3 rounded-l-lg whitespace-nowrap">
                    <span className="text-xs font-mono text-slate-500">#{ref.id}</span>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div
                      className="font-medium text-sm text-primary hover:underline cursor-pointer"
                      onClick={() => navigate(`/admin/affiliates/${ref.affiliate_id}`)}
                    >
                      {ref.affiliate_name || "—"}
                    </div>
                    <div className="text-xs text-slate-500">{ref.affiliate_email}</div>
                    <code className="text-xs font-mono text-slate-400">{ref.referral_code}</code>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium">{ref.referred_name || "—"}</div>
                    <div className="text-xs text-slate-500">{ref.referred_email}</div>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <span className="text-xs text-slate-500">{ref.referral_source || "—"}</span>
                  </td>
                  <td className="bg-white px-5 py-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                        referralStatusBadge[ref.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {ref.status}
                    </span>
                  </td>
                  <td className="bg-white px-5 py-3 text-center whitespace-nowrap">
                    {ref.conversion_date ? (
                      <div className="text-xs text-success font-medium">
                        {moment(ref.conversion_date).format("DD MMM YYYY")}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="bg-white px-5 py-3 text-right whitespace-nowrap">
                    <span className="text-sm font-medium">
                      {ref.commission != null ? `₦${ref.commission.toLocaleString()}` : "—"}
                    </span>
                  </td>
                  <td className="bg-white px-5 py-3 text-center whitespace-nowrap">
                    {ref.commission_status ? (
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                          commissionStatusBadge[ref.commission_status] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ref.commission_status}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div className="text-sm">{moment(ref.created_at).format("DD MMM YYYY")}</div>
                    <div className="text-xs text-slate-500">
                      {moment(ref.created_at).format("h:mm A")}
                    </div>
                  </td>
                  <td className="bg-white px-5 py-3 rounded-r-lg text-center">
                    <Tippy content="View Referral Details">
                      <button
                        className="flex items-center justify-center w-8 h-8 border border-primary/40 rounded-full text-primary hover:bg-primary/10 transition-colors mx-auto"
                        onClick={() => setViewTarget(ref)}
                      >
                        <Lucide icon="Eye" className="w-4 h-4" />
                      </button>
                    </Tippy>
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
                    p === currentPage ? "box font-medium" : "text-slate-700 hover:bg-slate-100"
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

      {/* Referral Detail Modal */}
      {viewTarget && (
        <Dialog open={!!viewTarget} onClose={() => setViewTarget(null)} size="md">
          <Dialog.Panel>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold">Referral #{viewTarget.id}</h3>
                <button
                  onClick={() => setViewTarget(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <Lucide icon="X" className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Affiliate</div>
                    <div
                      className="font-medium text-primary hover:underline cursor-pointer"
                      onClick={() => {
                        setViewTarget(null);
                        navigate(`/admin/affiliates/${viewTarget.affiliate_id}`);
                      }}
                    >
                      {viewTarget.affiliate_name}
                    </div>
                    <div className="text-xs text-slate-500">{viewTarget.affiliate_email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Affiliate ID</div>
                    <div className="font-medium">#{viewTarget.affiliate_id}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Referral Code</div>
                    <code className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                      {viewTarget.referral_code}
                    </code>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Source</div>
                    <div>{viewTarget.referral_source || "—"}</div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Referred User
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Name</div>
                      <div className="font-medium">{viewTarget.referred_name || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Email</div>
                      <div>{viewTarget.referred_email}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Status & Commission
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Referral Status</div>
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                          referralStatusBadge[viewTarget.status] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {viewTarget.status}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Conversion Date</div>
                      <div>
                        {viewTarget.conversion_date
                          ? moment(viewTarget.conversion_date).format("DD MMM YYYY")
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Commission</div>
                      <div className="font-semibold">
                        {viewTarget.commission != null
                          ? `₦${viewTarget.commission.toLocaleString()}`
                          : "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Commission Status</div>
                      {viewTarget.commission_status ? (
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                            commissionStatusBadge[viewTarget.commission_status] ??
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {viewTarget.commission_status}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 text-xs text-slate-400">
                  Referral Date: {moment(viewTarget.created_at).format("DD MMMM YYYY, h:mm A")}
                </div>
              </div>
            </div>
            <div className="flex justify-end px-6 pb-6">
              <Button variant="outline-secondary" onClick={() => setViewTarget(null)}>
                Close
              </Button>
            </div>
          </Dialog.Panel>
        </Dialog>
      )}
    </>
  );
}

export default Main;
