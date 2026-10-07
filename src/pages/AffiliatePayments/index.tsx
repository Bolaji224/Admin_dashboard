import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { FormInput } from "@/components/Base/Form";
import Pagination from "@/components/Base/Pagination";
import affiliateApi from "@/utils/affiliateApi";
import moment from "moment";

/* ─── Types ─── */

interface AffiliatePayment {
  id: number;
  affiliate_id: number;
  affiliate_name: string;
  affiliate_email: string;
  commission_amount: number;
  payment_amount: number;
  status: "pending" | "processing" | "paid" | "failed" | "cancelled";
  payment_date: string | null;
  payment_reference: string | null;
  created_at: string;
}

type StatusFilter = "" | "pending" | "processing" | "paid" | "failed" | "cancelled";

/* ─── Maps ─── */

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

/* ─── Component ─── */

function Main() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState<AffiliatePayment[]>([]);
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

  const fetchPayments = useCallback(
    async (page: number, status: StatusFilter, q: string) => {
      setLoading(true);
      try {
        const params: Record<string, any> = { page };
        if (status) params.status = status;
        if (q.trim()) params.search = q.trim();

        const res = await affiliateApi.getPayments(params);
        if (res.data?.status === "success") {
          const d = res.data.data;
          setPayments(Array.isArray(d.data) ? d.data : []);
          setCurrentPage(d.current_page ?? 1);
          setTotal(d.total ?? 0);
          setLastPage(d.last_page ?? 1);
        } else {
          showToast(res.data?.message || "Failed to load payments", false);
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || "Failed to load payments", false);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPayments(1, statusFilter, "");
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, fetchPayments]);

  const handleSearch = () => {
    fetchPayments(1, statusFilter, search);
  };

  const handlePageChange = (p: number) => {
    if (p < 1 || p > lastPage || p === currentPage) return;
    fetchPayments(p, statusFilter, search);
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

      <h2 className="mt-10 text-lg font-medium intro-y">Affiliate Payments</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500 intro-y">
        Payment history for all affiliate commission disbursements.
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
            placeholder="Search by affiliate name, email or reference..."
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
          {total} payment record{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto intro-y">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Lucide icon="Loader" className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            Loading payment records...
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Lucide icon="Wallet" className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No payment records found</p>
            <p className="text-sm mt-1">
              {search ? "Try adjusting your search." : "No payments in this category yet."}
            </p>
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Affiliate</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Commission</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Payment Amount</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Payment Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Reference</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Created</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((pmt) => (
                <tr key={pmt.id}>
                  <td className="bg-white px-5 py-3 rounded-l-lg whitespace-nowrap">
                    <span className="text-xs font-mono text-slate-500">#{pmt.id}</span>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div
                      className="font-medium text-sm text-primary hover:underline cursor-pointer"
                      onClick={() => navigate(`/admin/affiliates/${pmt.affiliate_id}`)}
                    >
                      {pmt.affiliate_name || "—"}
                    </div>
                    <div className="text-xs text-slate-500">{pmt.affiliate_email}</div>
                  </td>
                  <td className="bg-white px-5 py-3 text-right whitespace-nowrap">
                    <span className="text-sm">
                      ₦{(pmt.commission_amount ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="bg-white px-5 py-3 text-right whitespace-nowrap">
                    <span className="text-sm font-semibold">
                      ₦{(pmt.payment_amount ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="bg-white px-5 py-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                        statusBadge[pmt.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {pmt.status}
                    </span>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    {pmt.payment_date ? (
                      <div>
                        <div className="text-sm">{moment(pmt.payment_date).format("DD MMM YYYY")}</div>
                        <div className="text-xs text-slate-500">
                          {moment(pmt.payment_date).format("h:mm A")}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    {pmt.payment_reference ? (
                      <span className="font-mono text-xs text-slate-600 truncate block max-w-[140px]">
                        {pmt.payment_reference}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="bg-white px-5 py-3 rounded-r-lg whitespace-nowrap">
                    <div className="text-sm">{moment(pmt.created_at).format("DD MMM YYYY")}</div>
                    <div className="text-xs text-slate-500">
                      {moment(pmt.created_at).format("h:mm A")}
                    </div>
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
    </>
  );
}

export default Main;
