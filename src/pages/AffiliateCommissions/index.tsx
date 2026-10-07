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

interface Commission {
  id: number;
  affiliate_id: number;
  affiliate_name: string;
  affiliate_email: string;
  referral_id: number | null;
  transaction_ref: string | null;
  amount: number;
  status: "pending" | "approved" | "paid" | "rejected" | "cancelled";
  created_at: string;
  approved_at: string | null;
  paid_at: string | null;
}

type StatusFilter = "" | "pending" | "approved" | "paid" | "rejected" | "cancelled";
type ConfirmActionType = "approve" | "reject" | "pay";

/* ─── Maps ─── */

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Paid", value: "paid" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const statusBadge: Record<string, string> = {
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

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirm, setConfirm] = useState<{ commission: Commission; action: ConfirmActionType } | null>(null);
  const [actioning, setActioning] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const affiliateIdParam = new URLSearchParams(location.search).get("affiliate_id");

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCommissions = useCallback(
    async (page: number, status: StatusFilter, q: string) => {
      setLoading(true);
      try {
        const params: Record<string, any> = { page };
        if (status) params.status = status;
        if (q.trim()) params.search = q.trim();
        if (affiliateIdParam) params.affiliate_id = affiliateIdParam;

        const res = await affiliateApi.getCommissions(params);
        if (res.data?.status === "success") {
          const d = res.data.data;
          setCommissions(Array.isArray(d.data) ? d.data : []);
          setCurrentPage(d.current_page ?? 1);
          setTotal(d.total ?? 0);
          setLastPage(d.last_page ?? 1);
        } else {
          showToast(res.data?.message || "Failed to load commissions", false);
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || "Failed to load commissions", false);
        setCommissions([]);
      } finally {
        setLoading(false);
      }
    },
    [affiliateIdParam]
  );

  useEffect(() => {
    fetchCommissions(1, statusFilter, "");
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, fetchCommissions]);

  const handleSearch = () => {
    fetchCommissions(1, statusFilter, search);
  };

  const handlePageChange = (p: number) => {
    if (p < 1 || p > lastPage || p === currentPage) return;
    fetchCommissions(p, statusFilter, search);
  };

  const handleAction = async () => {
    if (!confirm) return;
    const { commission, action } = confirm;
    setActioning(true);
    try {
      let res;
      if (action === "approve") {
        res = await affiliateApi.approveCommission(commission.id);
      } else if (action === "reject") {
        res = await affiliateApi.rejectCommission(commission.id, rejectReason || undefined);
      } else {
        res = await affiliateApi.payCommission(commission.id);
      }

      if (res.data?.status === "success") {
        const newStatus: Record<ConfirmActionType, Commission["status"]> = {
          approve: "approved",
          reject: "rejected",
          pay: "paid",
        };
        setCommissions((prev) =>
          prev.map((c) =>
            c.id === commission.id ? { ...c, status: newStatus[action] } : c
          )
        );
        showToast(res.data.message || `Commission ${action}d successfully.`);
      } else {
        showToast(res.data?.message || "Action failed", false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Action failed", false);
    } finally {
      setActioning(false);
      setConfirm(null);
      setRejectReason("");
    }
  };

  const actionConfig: Record<
    ConfirmActionType,
    { title: string; desc: string; icon: string; variant: string }
  > = {
    approve: {
      title: "Approve Commission",
      desc: "This will mark the commission as approved and make it eligible for payment.",
      icon: "BadgeCheck",
      variant: "success",
    },
    reject: {
      title: "Reject Commission",
      desc: "This will reject the commission. The affiliate will not receive payment.",
      icon: "XCircle",
      variant: "danger",
    },
    pay: {
      title: "Mark as Paid",
      desc: "This will mark the commission as paid and record the payment date.",
      icon: "Wallet",
      variant: "primary",
    },
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

      <h2 className="mt-10 text-lg font-medium intro-y">Commissions</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500 intro-y">
        Manage affiliate commission records. Approve, reject, or mark commissions as paid.
        {affiliateIdParam && (
          <>
            {" "}Showing commissions for affiliate{" "}
            <button
              onClick={() => navigate(`/admin/affiliates/${affiliateIdParam}`)}
              className="text-primary hover:underline"
            >
              #{affiliateIdParam}
            </button>.{" "}
            <button
              onClick={() => navigate("/admin/affiliate-commissions")}
              className="text-slate-500 hover:underline text-xs"
            >
              Clear filter
            </button>
          </>
        )}
      </p>

      {/* Status tabs */}
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
            placeholder="Search by affiliate name or email..."
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
          {total} commission{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto intro-y">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Lucide icon="Loader" className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            Loading commissions...
          </div>
        ) : commissions.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Lucide icon="DollarSign" className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No commissions found</p>
            <p className="text-sm mt-1">
              {search ? "Try adjusting your search." : "No commissions in this category yet."}
            </p>
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Affiliate</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Referral</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Transaction</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Amount</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Created</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Approved</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Paid</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((com) => (
                <tr key={com.id}>
                  <td className="bg-white px-5 py-3 rounded-l-lg whitespace-nowrap">
                    <span className="text-xs font-mono text-slate-500">#{com.id}</span>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div
                      className="font-medium text-sm text-primary hover:underline cursor-pointer"
                      onClick={() => navigate(`/admin/affiliates/${com.affiliate_id}`)}
                    >
                      {com.affiliate_name || "—"}
                    </div>
                    <div className="text-xs text-slate-500">{com.affiliate_email}</div>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    {com.referral_id ? (
                      <span className="text-xs font-mono text-slate-600">#{com.referral_id}</span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    {com.transaction_ref ? (
                      <span className="text-xs font-mono text-slate-600 truncate max-w-[120px] block">
                        {com.transaction_ref}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="bg-white px-5 py-3 text-right whitespace-nowrap">
                    <span className="text-sm font-semibold">
                      ₦{com.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="bg-white px-5 py-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                        statusBadge[com.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {com.status}
                    </span>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div className="text-sm">{moment(com.created_at).format("DD MMM YYYY")}</div>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div className="text-sm">
                      {com.approved_at ? moment(com.approved_at).format("DD MMM YYYY") : "—"}
                    </div>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div className="text-sm">
                      {com.paid_at ? moment(com.paid_at).format("DD MMM YYYY") : "—"}
                    </div>
                  </td>
                  <td className="bg-white px-5 py-3 rounded-r-lg">
                    <div className="flex items-center justify-center gap-1.5">
                      {com.status === "pending" && (
                        <>
                          <Tippy content="Approve Commission">
                            <button
                              className="flex items-center justify-center w-8 h-8 border border-success/40 rounded-full text-success hover:bg-success/10 transition-colors"
                              onClick={() => setConfirm({ commission: com, action: "approve" })}
                            >
                              <Lucide icon="Check" className="w-4 h-4" />
                            </button>
                          </Tippy>
                          <Tippy content="Reject Commission">
                            <button
                              className="flex items-center justify-center w-8 h-8 border border-danger/40 rounded-full text-danger hover:bg-danger/10 transition-colors"
                              onClick={() => setConfirm({ commission: com, action: "reject" })}
                            >
                              <Lucide icon="X" className="w-4 h-4" />
                            </button>
                          </Tippy>
                        </>
                      )}
                      {com.status === "approved" && (
                        <Tippy content="Mark as Paid">
                          <button
                            className="flex items-center justify-center w-8 h-8 border border-primary/40 rounded-full text-primary hover:bg-primary/10 transition-colors"
                            onClick={() => setConfirm({ commission: com, action: "pay" })}
                          >
                            <Lucide icon="Wallet" className="w-4 h-4" />
                          </button>
                        </Tippy>
                      )}
                      {(com.status === "paid" ||
                        com.status === "rejected" ||
                        com.status === "cancelled") && (
                        <span className="text-xs text-slate-400">—</span>
                      )}
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

      {/* Confirmation Dialog */}
      {confirm && (
        <Dialog open={!!confirm} onClose={() => !actioning && setConfirm(null)} size="sm">
          <Dialog.Panel>
            <div className="p-5 text-center">
              <Lucide
                icon={actionConfig[confirm.action].icon as any}
                className={`w-16 h-16 mx-auto mt-3 ${
                  confirm.action === "approve"
                    ? "text-success"
                    : confirm.action === "pay"
                    ? "text-primary"
                    : "text-danger"
                }`}
              />
              <div className="mt-5 text-xl font-semibold">
                {actionConfig[confirm.action].title}
              </div>
              <div className="mt-2 text-slate-500 text-sm">
                {actionConfig[confirm.action].desc}
              </div>
              <div className="mt-1 font-semibold text-lg">
                ₦{confirm.commission.amount.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">{confirm.commission.affiliate_name}</div>

              {confirm.action === "reject" && (
                <div className="mt-4 text-left">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Reason (optional)
                  </label>
                  <FormInput
                    type="text"
                    className="w-full !box"
                    placeholder="Enter rejection reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-center gap-3 px-5 pb-8">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setConfirm(null);
                  setRejectReason("");
                }}
                disabled={actioning}
              >
                Cancel
              </Button>
              <Button
                variant={actionConfig[confirm.action].variant as any}
                onClick={handleAction}
                disabled={actioning}
              >
                {actioning ? (
                  <>
                    <Lucide icon="Loader" className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  actionConfig[confirm.action].title
                )}
              </Button>
            </div>
          </Dialog.Panel>
        </Dialog>
      )}
    </>
  );
}

export default Main;
