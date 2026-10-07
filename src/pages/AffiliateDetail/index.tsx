import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import { Dialog } from "@/components/Base/Headless";
import affiliateApi from "@/utils/affiliateApi";
import moment from "moment";

/* ─── Types ─── */

interface AffiliateDetail {
  id: number;
  user_id: number;
  name: string;
  email: string;
  avatar: string | null;
  referral_code: string;
  referral_link: string;
  status: "active" | "pending" | "suspended" | "disabled";
  joined_at: string;
  stats: {
    total_referrals: number;
    converted_referrals: number;
    conversion_rate: number;
    commission_earned: number;
    commission_paid: number;
    pending_commission: number;
    approved_commission: number;
  };
  recent_referrals: ReferralItem[];
  recent_commissions: CommissionItem[];
}

interface ReferralItem {
  id: number;
  referred_name: string;
  referred_email: string;
  status: string;
  created_at: string;
  commission: number | null;
}

interface CommissionItem {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  approved_at: string | null;
  paid_at: string | null;
}

/* ─── Badge maps ─── */

const statusBadge: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  suspended: "bg-red-100 text-red-700",
  disabled: "bg-slate-100 text-slate-600",
};

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

type ActionType = "suspend" | "activate" | "disable";

/* ─── Component ─── */

function Main() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [affiliate, setAffiliate] = useState<AffiliateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirm, setConfirm] = useState<ActionType | null>(null);
  const [actioning, setActioning] = useState(false);
  const [copied, setCopied] = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAffiliate = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await affiliateApi.getAffiliate(id);
      if (res.data?.status === "success") {
        setAffiliate(res.data.data);
      } else {
        showToast(res.data?.message || "Failed to load affiliate", false);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to load affiliate details", false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAffiliate();
  }, [fetchAffiliate]);

  const handleStatusAction = async () => {
    if (!confirm || !affiliate) return;
    const statusMap: Record<ActionType, string> = {
      suspend: "suspended",
      activate: "active",
      disable: "disabled",
    };
    setActioning(true);
    try {
      const res = await affiliateApi.updateAffiliateStatus(affiliate.id, statusMap[confirm]);
      if (res.data?.status === "success") {
        setAffiliate((prev) =>
          prev ? { ...prev, status: statusMap[confirm] as AffiliateDetail["status"] } : prev
        );
        showToast(`Affiliate ${confirm}d successfully.`);
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

  const copyReferralLink = () => {
    if (!affiliate?.referral_link) return;
    navigator.clipboard.writeText(affiliate.referral_link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const confirmMessages: Record<ActionType, string> = {
    suspend:
      "This will prevent this affiliate from earning commissions from new qualifying referrals.",
    activate: "This will restore the affiliate's ability to earn commissions.",
    disable:
      "This will disable this affiliate account. Existing commissions will not be affected.",
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Lucide icon="Loader" className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
        Loading affiliate details...
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Lucide icon="AlertCircle" className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Affiliate not found.</p>
        <button
          onClick={() => navigate("/admin/affiliates")}
          className="mt-4 text-primary hover:underline text-sm"
        >
          ← Back to Affiliates
        </button>
      </div>
    );
  }

  const stats = affiliate.stats ?? {};

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

      {/* Back */}
      <button
        onClick={() => navigate("/admin/affiliates")}
        className="flex items-center gap-1.5 mt-8 text-sm text-slate-500 hover:text-slate-700 intro-y"
      >
        <Lucide icon="ArrowLeft" className="w-4 h-4" />
        Back to Affiliates
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mt-5 mb-6 intro-y">
        {affiliate.avatar ? (
          <img
            src={affiliate.avatar}
            alt={affiliate.name}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold flex-shrink-0">
            {(affiliate.name || "A").charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-800">{affiliate.name || "—"}</h2>
          <div className="text-slate-500 text-sm">{affiliate.email}</div>
        </div>
        <span
          className={`ml-2 px-3 py-1.5 text-sm rounded-full font-semibold capitalize ${
            statusBadge[affiliate.status] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {affiliate.status}
        </span>

        {/* Action buttons */}
        <div className="ml-auto flex flex-wrap gap-2">
          {affiliate.status !== "suspended" && affiliate.status !== "disabled" && (
            <Button variant="warning" className="flex items-center gap-2 text-sm" onClick={() => setConfirm("suspend")}>
              <Lucide icon="Ban" className="w-4 h-4" />
              Suspend
            </Button>
          )}
          {affiliate.status === "suspended" && (
            <Button variant="success" className="flex items-center gap-2 text-sm" onClick={() => setConfirm("activate")}>
              <Lucide icon="RefreshCw" className="w-4 h-4" />
              Reactivate
            </Button>
          )}
          {affiliate.status === "disabled" && (
            <Button variant="success" className="flex items-center gap-2 text-sm" onClick={() => setConfirm("activate")}>
              <Lucide icon="RefreshCw" className="w-4 h-4" />
              Reactivate
            </Button>
          )}
          {affiliate.status !== "disabled" && (
            <Button variant="danger" className="flex items-center gap-2 text-sm" onClick={() => setConfirm("disable")}>
              <Lucide icon="XCircle" className="w-4 h-4" />
              Disable
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 intro-y">

        {/* ── LEFT: Profile info ── */}
        <div className="col-span-12 lg:col-span-4">
          <div className="box p-6 mb-6">
            <h3 className="font-semibold text-slate-700 mb-4">Affiliate Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Lucide icon="Hash" className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Affiliate ID</div>
                  <div className="font-medium">#{affiliate.id}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lucide icon="Tag" className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Referral Code</div>
                  <code className="font-mono bg-slate-100 px-2 py-0.5 rounded text-sm">
                    {affiliate.referral_code}
                  </code>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lucide icon="Link" className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-slate-400">Referral Link</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-600 truncate max-w-[160px]">
                      {affiliate.referral_link || "—"}
                    </span>
                    {affiliate.referral_link && (
                      <button
                        onClick={copyReferralLink}
                        className="text-primary hover:text-primary/80 flex-shrink-0"
                      >
                        <Lucide icon={copied ? "Check" : "Copy"} className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lucide icon="Calendar" className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-slate-400">Member Since</div>
                  <div className="font-medium">
                    {moment(affiliate.joined_at).format("DD MMMM YYYY")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats summary */}
          <div className="box p-6">
            <h3 className="font-semibold text-slate-700 mb-4">Performance Summary</h3>
            <div className="space-y-3">
              {[
                { label: "Total Referrals", value: stats.total_referrals ?? 0, icon: "Share2" as const, color: "text-primary" },
                { label: "Converted", value: stats.converted_referrals ?? 0, icon: "CheckCircle" as const, color: "text-success" },
                { label: "Conversion Rate", value: `${stats.conversion_rate ?? 0}%`, icon: "TrendingUp" as const, color: "text-pending" },
                { label: "Commission Earned", value: `₦${(stats.commission_earned ?? 0).toLocaleString()}`, icon: "DollarSign" as const, color: "text-primary" },
                { label: "Commission Paid", value: `₦${(stats.commission_paid ?? 0).toLocaleString()}`, icon: "Wallet" as const, color: "text-success" },
                { label: "Pending Commission", value: `₦${(stats.pending_commission ?? 0).toLocaleString()}`, icon: "Clock" as const, color: "text-warning" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Lucide icon={row.icon} className={`w-4 h-4 ${row.color}`} />
                    {row.label}
                  </div>
                  <div className="font-semibold text-sm">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: History ── */}
        <div className="col-span-12 lg:col-span-8 space-y-6">

          {/* Recent Referrals */}
          <div className="box p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Recent Referrals</h3>
              <button
                onClick={() => navigate(`/admin/referrals?affiliate_id=${affiliate.id}`)}
                className="text-xs text-primary hover:underline"
              >
                View all →
              </button>
            </div>
            {!affiliate.recent_referrals || affiliate.recent_referrals.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Lucide icon="Share2" className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No referrals yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-1.5">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-semibold text-slate-400 uppercase px-3 pb-2">Referred User</th>
                      <th className="text-center text-xs font-semibold text-slate-400 uppercase px-3 pb-2">Status</th>
                      <th className="text-right text-xs font-semibold text-slate-400 uppercase px-3 pb-2">Commission</th>
                      <th className="text-left text-xs font-semibold text-slate-400 uppercase px-3 pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliate.recent_referrals.map((ref) => (
                      <tr key={ref.id}>
                        <td className="bg-slate-50 px-3 py-2 rounded-l-lg">
                          <div className="text-sm font-medium">{ref.referred_name || "—"}</div>
                          <div className="text-xs text-slate-500">{ref.referred_email}</div>
                        </td>
                        <td className="bg-slate-50 px-3 py-2 text-center">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-medium capitalize ${
                              referralStatusBadge[ref.status] ?? "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {ref.status}
                          </span>
                        </td>
                        <td className="bg-slate-50 px-3 py-2 text-right whitespace-nowrap">
                          <span className="text-sm">
                            {ref.commission != null ? `₦${ref.commission.toLocaleString()}` : "—"}
                          </span>
                        </td>
                        <td className="bg-slate-50 px-3 py-2 rounded-r-lg whitespace-nowrap">
                          <div className="text-xs text-slate-500">
                            {moment(ref.created_at).format("DD MMM YYYY")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Commissions */}
          <div className="box p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Recent Commissions</h3>
              <button
                onClick={() => navigate(`/admin/affiliate-commissions?affiliate_id=${affiliate.id}`)}
                className="text-xs text-primary hover:underline"
              >
                View all →
              </button>
            </div>
            {!affiliate.recent_commissions || affiliate.recent_commissions.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Lucide icon="DollarSign" className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No commissions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-1.5">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-semibold text-slate-400 uppercase px-3 pb-2">ID</th>
                      <th className="text-right text-xs font-semibold text-slate-400 uppercase px-3 pb-2">Amount</th>
                      <th className="text-center text-xs font-semibold text-slate-400 uppercase px-3 pb-2">Status</th>
                      <th className="text-left text-xs font-semibold text-slate-400 uppercase px-3 pb-2">Created</th>
                      <th className="text-left text-xs font-semibold text-slate-400 uppercase px-3 pb-2">Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliate.recent_commissions.map((com) => (
                      <tr key={com.id}>
                        <td className="bg-slate-50 px-3 py-2 rounded-l-lg">
                          <span className="text-xs font-mono text-slate-500">#{com.id}</span>
                        </td>
                        <td className="bg-slate-50 px-3 py-2 text-right whitespace-nowrap">
                          <span className="text-sm font-semibold">
                            ₦{com.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="bg-slate-50 px-3 py-2 text-center">
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-medium capitalize ${
                              commissionStatusBadge[com.status] ?? "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {com.status}
                          </span>
                        </td>
                        <td className="bg-slate-50 px-3 py-2 whitespace-nowrap">
                          <div className="text-xs text-slate-500">
                            {moment(com.created_at).format("DD MMM YYYY")}
                          </div>
                        </td>
                        <td className="bg-slate-50 px-3 py-2 rounded-r-lg whitespace-nowrap">
                          <div className="text-xs text-slate-500">
                            {com.paid_at ? moment(com.paid_at).format("DD MMM YYYY") : "—"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirm && (
        <Dialog open={!!confirm} onClose={() => !actioning && setConfirm(null)} size="sm">
          <Dialog.Panel>
            <div className="p-5 text-center">
              <Lucide
                icon={confirm === "activate" ? "RefreshCw" : confirm === "suspend" ? "Ban" : "XCircle"}
                className={`w-16 h-16 mx-auto mt-3 ${
                  confirm === "activate" ? "text-success" : "text-danger"
                }`}
              />
              <div className="mt-5 text-xl font-semibold capitalize">{confirm} Affiliate?</div>
              <div className="mt-2 text-slate-500 text-sm">{confirmMessages[confirm]}</div>
              <div className="mt-1 font-medium text-sm">{affiliate.name || affiliate.email}</div>
            </div>
            <div className="flex justify-center gap-3 px-5 pb-8">
              <Button variant="outline-secondary" onClick={() => setConfirm(null)} disabled={actioning}>
                Cancel
              </Button>
              <Button
                variant={confirm === "activate" ? "success" : "danger"}
                onClick={handleStatusAction}
                disabled={actioning}
              >
                {actioning ? (
                  <>
                    <Lucide icon="Loader" className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <span className="capitalize">{confirm}</span>
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
