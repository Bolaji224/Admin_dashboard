import { useState, useEffect, useCallback } from "react";
import Lucide from "@/components/Base/Lucide";
import Button from "@/components/Base/Button";
import affiliateApi from "@/utils/affiliateApi";
import clsx from "clsx";

interface AffiliateStats {
  total_affiliates: number;
  active_affiliates: number;
  pending_affiliates: number;
  suspended_affiliates: number;
  total_referrals: number;
  converted_referrals: number;
  total_commission: number;
  pending_commission: number;
  approved_commission: number;
  paid_commission: number;
}

const STAT_CARDS = [
  {
    key: "total_affiliates" as keyof AffiliateStats,
    label: "Total Affiliates",
    icon: "Users" as const,
    color: "text-primary",
  },
  {
    key: "active_affiliates" as keyof AffiliateStats,
    label: "Active Affiliates",
    icon: "UserCheck" as const,
    color: "text-success",
  },
  {
    key: "pending_affiliates" as keyof AffiliateStats,
    label: "Pending Affiliates",
    icon: "Clock" as const,
    color: "text-warning",
  },
  {
    key: "suspended_affiliates" as keyof AffiliateStats,
    label: "Suspended Affiliates",
    icon: "UserX" as const,
    color: "text-danger",
  },
  {
    key: "total_referrals" as keyof AffiliateStats,
    label: "Total Referrals",
    icon: "Share2" as const,
    color: "text-pending",
  },
  {
    key: "converted_referrals" as keyof AffiliateStats,
    label: "Converted Referrals",
    icon: "CheckCircle" as const,
    color: "text-success",
  },
  {
    key: "total_commission" as keyof AffiliateStats,
    label: "Total Commission",
    icon: "DollarSign" as const,
    color: "text-primary",
    isCurrency: true,
  },
  {
    key: "pending_commission" as keyof AffiliateStats,
    label: "Pending Commission",
    icon: "AlertCircle" as const,
    color: "text-warning",
    isCurrency: true,
  },
  {
    key: "approved_commission" as keyof AffiliateStats,
    label: "Approved Commission",
    icon: "BadgeCheck" as const,
    color: "text-pending",
    isCurrency: true,
  },
  {
    key: "paid_commission" as keyof AffiliateStats,
    label: "Paid Commission",
    icon: "Wallet" as const,
    color: "text-success",
    isCurrency: true,
  },
];

function Main() {
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await affiliateApi.getStats();
      if (res.data?.status === "success") {
        setStats(res.data.data);
      } else {
        setError(res.data?.message || "Failed to load statistics");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load affiliate statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatValue = (val: number, isCurrency?: boolean) => {
    if (isCurrency) return `₦${val.toLocaleString()}`;
    return val.toLocaleString();
  };

  return (
    <>
      <div className="flex items-center mt-10 intro-y">
        <h2 className="mr-auto text-lg font-medium">Affiliate Programme Overview</h2>
        <Button variant="outline-secondary" className="flex items-center gap-2" onClick={fetchStats}>
          <Lucide icon="RefreshCcw" className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <p className="mt-1 mb-6 text-sm text-slate-500 intro-y">
        Real-time overview of the Workason Affiliate Programme performance.
      </p>

      {loading ? (
        <div className="py-20 text-center intro-y">
          <Lucide icon="Loader" className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
          Loading statistics...
        </div>
      ) : error ? (
        <div className="py-20 text-center intro-y">
          <Lucide icon="AlertCircle" className="w-12 h-12 mx-auto mb-3 text-danger opacity-70" />
          <p className="font-medium text-slate-700">{error}</p>
          <Button variant="primary" className="mt-4" onClick={fetchStats}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* First row — affiliate counts */}
          <div className="grid grid-cols-12 gap-6 intro-y">
            {STAT_CARDS.slice(0, 4).map((card) => (
              <div key={card.key} className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div
                  className={clsx([
                    "relative zoom-in",
                    "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
                  ])}
                >
                  <div className="p-5 box">
                    <div className="flex">
                      <Lucide icon={card.icon} className={`w-[28px] h-[28px] ${card.color}`} />
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {formatValue(stats?.[card.key] ?? 0, (card as any).isCurrency)}
                    </div>
                    <div className="mt-1 text-base text-slate-500">{card.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second row — referral counts */}
          <div className="grid grid-cols-12 gap-6 mt-6 intro-y">
            {STAT_CARDS.slice(4, 6).map((card) => (
              <div key={card.key} className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div
                  className={clsx([
                    "relative zoom-in",
                    "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
                  ])}
                >
                  <div className="p-5 box">
                    <div className="flex">
                      <Lucide icon={card.icon} className={`w-[28px] h-[28px] ${card.color}`} />
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {formatValue(stats?.[card.key] ?? 0, (card as any).isCurrency)}
                    </div>
                    <div className="mt-1 text-base text-slate-500">{card.label}</div>
                  </div>
                </div>
              </div>
            ))}

            {/* Conversion rate card */}
            <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
              <div
                className={clsx([
                  "relative zoom-in",
                  "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
                ])}
              >
                <div className="p-5 box">
                  <div className="flex">
                    <Lucide icon="TrendingUp" className="w-[28px] h-[28px] text-success" />
                  </div>
                  <div className="mt-6 text-3xl font-medium leading-8">
                    {stats && stats.total_referrals > 0
                      ? `${Math.round((stats.converted_referrals / stats.total_referrals) * 100)}%`
                      : "0%"}
                  </div>
                  <div className="mt-1 text-base text-slate-500">Conversion Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Third row — commission breakdown */}
          <div className="mt-8 intro-y">
            <h3 className="mb-4 font-medium text-slate-700">Commission Breakdown</h3>
            <div className="grid grid-cols-12 gap-6">
              {STAT_CARDS.slice(6).map((card) => (
                <div key={card.key} className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                  <div
                    className={clsx([
                      "relative zoom-in",
                      "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
                    ])}
                  >
                    <div className="p-5 box">
                      <div className="flex">
                        <Lucide icon={card.icon} className={`w-[28px] h-[28px] ${card.color}`} />
                      </div>
                      <div className="mt-6 text-3xl font-medium leading-8">
                        {formatValue(stats?.[card.key] ?? 0, true)}
                      </div>
                      <div className="mt-1 text-base text-slate-500">{card.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Main;
