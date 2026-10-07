import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import Tippy from "@/components/Base/Tippy";
import { FormInput, FormSelect } from "@/components/Base/Form";
import Pagination from "@/components/Base/Pagination";
import { Dialog } from "@/components/Base/Headless";
import affiliateApi from "@/utils/affiliateApi";
import moment from "moment";

interface Affiliate {
  id: number;
  user_id: number;
  name: string;
  email: string;
  avatar: string | null;
  referral_code: string;
  total_referrals: number;
  conversions: number;
  commission_earned: number;
  commission_paid: number;
  pending_commission: number;
  status: "active" | "pending" | "suspended" | "disabled";
  joined_at: string;
}

type StatusFilter = "" | "active" | "pending" | "suspended" | "disabled";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
  { label: "Disabled", value: "disabled" },
];

const statusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
  disabled: "bg-slate-100 text-slate-600",
};

type ConfirmAction = {
  affiliate: Affiliate;
  action: "suspend" | "activate" | "disable";
};

function Main() {
  const navigate = useNavigate();

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [actioning, setActioning] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAffiliates = useCallback(
    async (page: number, status: StatusFilter, q: string) => {
      setLoading(true);
      try {
        const params: Record<string, any> = { page };
        if (status) params.status = status;
        if (q.trim()) params.search = q.trim();

        const res = await affiliateApi.getAffiliates(params);
        if (res.data?.status === "success") {
          const d = res.data.data;
          setAffiliates(Array.isArray(d.data) ? d.data : []);
          setCurrentPage(d.current_page ?? 1);
          setTotal(d.total ?? 0);
          setLastPage(d.last_page ?? 1);
        } else {
          showToast(res.data?.message || "Failed to load affiliates", false);
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || "Failed to load affiliates", false);
        setAffiliates([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAffiliates(1, statusFilter, "");
    setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, fetchAffiliates]);

  const handleSearch = () => {
    fetchAffiliates(1, statusFilter, search);
  };

  const handlePageChange = (p: number) => {
    if (p < 1 || p > lastPage || p === currentPage) return;
    fetchAffiliates(p, statusFilter, search);
  };

  const handleStatusAction = async () => {
    if (!confirm) return;
    const { affiliate, action } = confirm;
    const statusMap: Record<string, string> = {
      suspend: "suspended",
      activate: "active",
      disable: "disabled",
    };
    setActioning(true);
    try {
      const res = await affiliateApi.updateAffiliateStatus(affiliate.id, statusMap[action]);
      if (res.data?.status === "success") {
        setAffiliates((prev) =>
          prev.map((a) =>
            a.id === affiliate.id
              ? { ...a, status: statusMap[action] as Affiliate["status"] }
              : a
          )
        );
        showToast(`Affiliate ${action}d successfully.`);
      } else {
        showToast(res.data?.message || "Action failed", false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Action failed", false);
    } finally {
      setActioning(false);
      setConfirm(null);
    }
  };

  const actionLabel: Record<string, { label: string; icon: string; btnVariant: string }> = {
    suspend: { label: "Suspend Affiliate", icon: "Ban", btnVariant: "danger" },
    activate: { label: "Reactivate Affiliate", icon: "RefreshCw", btnVariant: "success" },
    disable: { label: "Disable Affiliate", icon: "XCircle", btnVariant: "danger" },
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

      <h2 className="mt-10 text-lg font-medium intro-y">Affiliates</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500 intro-y">
        Manage all registered affiliates on the Workason platform.
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

      {/* Search bar */}
      <div className="flex flex-wrap items-center gap-2 mb-5 intro-y">
        <div className="relative text-slate-500">
          <FormInput
            type="text"
            className="w-72 pr-10 !box"
            placeholder="Search by name, email or referral code..."
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
          {total} affiliate{total !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto intro-y">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <Lucide icon="Loader" className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            Loading affiliates...
          </div>
        ) : affiliates.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Lucide icon="Users" className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No affiliates found</p>
            <p className="text-sm mt-1">
              {search ? "Try adjusting your search." : "No affiliates in this category yet."}
            </p>
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Affiliate</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Referral Code</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Referrals</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Conversions</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Earned</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Paid</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Pending</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Joined</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map((aff) => (
                <tr key={aff.id}>
                  <td className="bg-white px-5 py-3 rounded-l-lg whitespace-nowrap">
                    <span className="text-xs font-mono text-slate-500">#{aff.id}</span>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      {aff.avatar ? (
                        <img
                          src={aff.avatar}
                          alt={aff.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(aff.name || "A").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm">{aff.name || "—"}</div>
                        <div className="text-xs text-slate-500">{aff.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <span className="font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">
                      {aff.referral_code}
                    </span>
                  </td>
                  <td className="bg-white px-5 py-3 text-center whitespace-nowrap">
                    <span className="text-sm font-medium">{aff.total_referrals ?? 0}</span>
                  </td>
                  <td className="bg-white px-5 py-3 text-center whitespace-nowrap">
                    <span className="text-sm font-medium">{aff.conversions ?? 0}</span>
                  </td>
                  <td className="bg-white px-5 py-3 text-right whitespace-nowrap">
                    <span className="text-sm font-medium">
                      ₦{(aff.commission_earned ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="bg-white px-5 py-3 text-right whitespace-nowrap">
                    <span className="text-sm text-success font-medium">
                      ₦{(aff.commission_paid ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="bg-white px-5 py-3 text-right whitespace-nowrap">
                    <span className="text-sm text-warning font-medium">
                      ₦{(aff.pending_commission ?? 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="bg-white px-5 py-3 text-center whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${
                        statusBadge[aff.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {aff.status}
                    </span>
                  </td>
                  <td className="bg-white px-5 py-3 whitespace-nowrap">
                    <div className="text-sm">{moment(aff.joined_at).format("DD MMM YYYY")}</div>
                    <div className="text-xs text-slate-500">
                      {moment(aff.joined_at).format("h:mm A")}
                    </div>
                  </td>
                  <td className="bg-white px-5 py-3 rounded-r-lg">
                    <div className="flex items-center justify-center gap-1.5">
                      <Tippy content="View Details">
                        <button
                          className="flex items-center justify-center w-8 h-8 border border-primary/40 rounded-full text-primary hover:bg-primary/10 transition-colors"
                          onClick={() => navigate(`/admin/affiliates/${aff.id}`)}
                        >
                          <Lucide icon="Eye" className="w-4 h-4" />
                        </button>
                      </Tippy>

                      {aff.status !== "suspended" && aff.status !== "disabled" && (
                        <Tippy content="Suspend Affiliate">
                          <button
                            className="flex items-center justify-center w-8 h-8 border border-warning/40 rounded-full text-warning hover:bg-warning/10 transition-colors"
                            onClick={() => setConfirm({ affiliate: aff, action: "suspend" })}
                          >
                            <Lucide icon="Ban" className="w-4 h-4" />
                          </button>
                        </Tippy>
                      )}

                      {aff.status === "suspended" && (
                        <Tippy content="Reactivate Affiliate">
                          <button
                            className="flex items-center justify-center w-8 h-8 border border-success/40 rounded-full text-success hover:bg-success/10 transition-colors"
                            onClick={() => setConfirm({ affiliate: aff, action: "activate" })}
                          >
                            <Lucide icon="RefreshCw" className="w-4 h-4" />
                          </button>
                        </Tippy>
                      )}

                      {aff.status !== "disabled" && (
                        <Tippy content="Disable Affiliate">
                          <button
                            className="flex items-center justify-center w-8 h-8 border border-danger/40 rounded-full text-danger hover:bg-danger/10 transition-colors"
                            onClick={() => setConfirm({ affiliate: aff, action: "disable" })}
                          >
                            <Lucide icon="XCircle" className="w-4 h-4" />
                          </button>
                        </Tippy>
                      )}

                      {aff.status === "disabled" && (
                        <Tippy content="Reactivate Affiliate">
                          <button
                            className="flex items-center justify-center w-8 h-8 border border-success/40 rounded-full text-success hover:bg-success/10 transition-colors"
                            onClick={() => setConfirm({ affiliate: aff, action: "activate" })}
                          >
                            <Lucide icon="RefreshCw" className="w-4 h-4" />
                          </button>
                        </Tippy>
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
          <FormSelect className="w-20 !box">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </FormSelect>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirm && (
        <Dialog open={!!confirm} onClose={() => !actioning && setConfirm(null)} size="sm">
          <Dialog.Panel>
            <div className="p-5 text-center">
              <Lucide
                icon={actionLabel[confirm.action].icon as any}
                className={`w-16 h-16 mx-auto mt-3 ${
                  confirm.action === "activate" ? "text-success" : "text-danger"
                }`}
              />
              <div className="mt-5 text-xl font-semibold">
                {actionLabel[confirm.action].label}?
              </div>
              <div className="mt-2 text-slate-500 text-sm">
                {confirm.action === "suspend" &&
                  "This will prevent this affiliate from earning commissions from new qualifying referrals."}
                {confirm.action === "activate" &&
                  "This will restore the affiliate's ability to earn commissions."}
                {confirm.action === "disable" &&
                  "This will permanently disable this affiliate account. This action is reversible by an admin."}
              </div>
              <div className="mt-1 font-medium text-sm">
                {confirm.affiliate.name || confirm.affiliate.email}
              </div>
            </div>
            <div className="flex justify-center gap-3 px-5 pb-8">
              <Button
                variant="outline-secondary"
                onClick={() => setConfirm(null)}
                disabled={actioning}
              >
                Cancel
              </Button>
              <Button
                variant={confirm.action === "activate" ? "success" : "danger"}
                onClick={handleStatusAction}
                disabled={actioning}
              >
                {actioning ? (
                  <>
                    <Lucide icon="Loader" className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  actionLabel[confirm.action].label
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
