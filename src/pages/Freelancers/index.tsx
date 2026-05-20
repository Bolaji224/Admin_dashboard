import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "@/utils/axios";
import Button from "@/components/Base/Button";
import { FormInput, FormSelect } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Freelancer {
  id: number;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  title?: string | null;
  experience?: string | null;
  bio: string | null;
  email?: string | null;
  avatar?: string | null;
  skills?: string | null;
  city?: string | null;
  country?: string | null;
  is_approved: boolean;
  joined_at?: string;
  cv?: string | null;
  smartcv?: string | null;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
}

type Tab = "all" | "approved" | "pending";

/* ─── Helper ─────────────────────────────────────────────────────────────── */

const avatarSrc = (f: Freelancer) =>
  f.avatar ??
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    f.first_name || f.name || "User"
  )}&background=random`;

const displayName = (f: Freelancer) =>
  f.first_name || f.name || "Unnamed Freelancer";

/* ─── Main Component ─────────────────────────────────────────────────────── */

function Main() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [selected, setSelected] = useState<Freelancer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  /* ─── Toast ─────────────────────────────────────────────────────────────── */

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ─── Fetch ──────────────────────────────────────────────────────────────── */

  const fetchFreelancers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("/v1/admin/freelancers");
      if (res.data?.status === "success") {
        setFreelancers(Array.isArray(res.data.data) ? res.data.data : []);
        setStats(res.data.stats ?? { total: 0, approved: 0, pending: 0 });
      }
    } catch (err: any) {
      console.error("Fetch error:", err.response?.data || err.message);
      showToast("Failed to load freelancers", false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFreelancers();
  }, [fetchFreelancers]);

  /* ─── Approve / Revoke ───────────────────────────────────────────────────── */

  const handleApprove = async (id: number) => {
    setApproving(id);
    try {
      const res = await axios.post(`/v1/admin/freelancers/${id}/approve`);
      if (res.data?.status === "success") {
        setFreelancers((prev) =>
          prev.map((f) => (f.id === id ? { ...f, is_approved: true } : f))
        );
        setStats((s) => ({ ...s, approved: s.approved + 1, pending: Math.max(0, s.pending - 1) }));
        setSelected((prev) => (prev?.id === id ? { ...prev, is_approved: true } : prev));
        showToast("Freelancer approved successfully!");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to approve freelancer", false);
    } finally {
      setApproving(null);
    }
  };

  const handleRevoke = async (id: number) => {
    setApproving(id);
    try {
      const res = await axios.post(`/v1/admin/freelancers/${id}/revoke`);
      if (res.data?.status === "success") {
        setFreelancers((prev) =>
          prev.map((f) => (f.id === id ? { ...f, is_approved: false } : f))
        );
        setStats((s) => ({ ...s, approved: Math.max(0, s.approved - 1), pending: s.pending + 1 }));
        setSelected((prev) => (prev?.id === id ? { ...prev, is_approved: false } : prev));
        showToast("Approval revoked.");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to revoke approval", false);
    } finally {
      setApproving(null);
    }
  };

  /* ─── Filter ─────────────────────────────────────────────────────────────── */

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return freelancers.filter((f) => {
      if (tab === "approved" && !f.is_approved) return false;
      if (tab === "pending" && f.is_approved) return false;
      if (!q) return true;
      return (
        (f.name ?? "").toLowerCase().includes(q) ||
        (f.first_name ?? "").toLowerCase().includes(q) ||
        (f.email ?? "").toLowerCase().includes(q) ||
        (f.experience ?? "").toLowerCase().includes(q) ||
        (f.skills ?? "").toLowerCase().includes(q)
      );
    });
  }, [freelancers, tab, search]);

  /* ─── Render ─────────────────────────────────────────────────────────────── */

  return (
    <>
      {/* Toast notification */}
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
      <h2 className="mt-10 text-lg font-medium intro-y">
        Freelancer Approvals
      </h2>
      <p className="mt-1 mb-6 text-sm text-slate-500 intro-y">
        Review and approve freelancers before they appear in the Talent Vault.
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-12 gap-4 mt-2 intro-y">
        {[
          { label: "Total Freelancers", value: stats.total, icon: "Users" as const, color: "text-primary" },
          { label: "Approved", value: stats.approved, icon: "CheckCircle" as const, color: "text-success" },
          { label: "Pending Review", value: stats.pending, icon: "Clock" as const, color: "text-warning" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="col-span-12 sm:col-span-4">
            <div className="box p-5 flex items-center">
              <div className="mr-auto">
                <div className="text-2xl font-bold leading-none">{value}</div>
                <div className="text-slate-500 text-sm mt-1">{label}</div>
              </div>
              <Lucide icon={icon} className={`w-10 h-10 ${color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          {/* Tab buttons */}
          <div className="flex gap-1 mr-4">
            {(["all", "approved", "pending"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                  tab === t
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t}
                <span className="ml-1.5 text-xs opacity-75">
                  ({t === "all" ? stats.total : t === "approved" ? stats.approved : stats.pending})
                </span>
              </button>
            ))}
          </div>

          <div className="hidden mx-auto md:block text-slate-500">
            Showing {filtered.length} freelancer{filtered.length !== 1 ? "s" : ""}
          </div>

          {/* Search */}
          <div className="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-0">
            <div className="relative w-56 text-slate-500">
              <FormInput
                type="text"
                className="w-56 pr-10 !box"
                placeholder="Search by name, skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Lucide
                icon="Search"
                className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"
              />
            </div>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="col-span-12 py-16 text-center text-slate-500">
            <Lucide icon="Loader" className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            Loading freelancers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-12 py-16 text-center text-slate-500">
            <Lucide icon="Users" className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No freelancers found</p>
            <p className="text-sm mt-1">
              {search ? "Try adjusting your search." : "No freelancers in this category yet."}
            </p>
          </div>
        ) : (
          filtered.map((f) => (
            <div
              key={f.id}
              className="col-span-12 intro-y md:col-span-6 lg:col-span-4"
            >
              <div className="box relative">
                {/* Card header */}
                <div className="flex items-start px-5 pt-5">
                  <div className="flex flex-col items-center w-full lg:flex-row">
                    <div className="w-16 h-16 image-fit flex-shrink-0">
                      <img
                        alt={displayName(f)}
                        className="rounded-full object-cover w-full h-full"
                        src={avatarSrc(f)}
                      />
                    </div>

                    <div className="mt-3 text-center lg:ml-4 lg:text-left lg:mt-0 min-w-0">
                      <div className="font-medium truncate">{displayName(f)}</div>
                      <div className="text-slate-500 text-xs mt-0.5 truncate">
                        {f.experience ?? f.title ?? "No title"}
                      </div>
                      {(f.city || f.country) && (
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5 lg:justify-start justify-center">
                          <Lucide icon="MapPin" className="w-3 h-3" />
                          {[f.city, f.country].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`absolute top-3 right-10 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      f.is_approved
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {f.is_approved ? "Approved" : "Pending"}
                  </span>

                  {/* Action menu */}
                  <Menu className="absolute top-0 right-0 mt-3 mr-3">
                    <Menu.Button as="a" className="block w-5 h-5">
                      <Lucide icon="MoreHorizontal" className="w-5 h-5 text-slate-500" />
                    </Menu.Button>
                    <Menu.Items className="w-40">
                      <Menu.Item onClick={() => { setSelected(f); setDetailOpen(true); }}>
                        <Lucide icon="Eye" className="w-4 h-4 mr-2" /> View Details
                      </Menu.Item>
                      {!f.is_approved ? (
                        <Menu.Item onClick={() => handleApprove(f.id)}>
                          <Lucide icon="ShieldCheck" className="w-4 h-4 mr-2 text-success" />
                          <span className="text-success">Approve</span>
                        </Menu.Item>
                      ) : (
                        <Menu.Item onClick={() => handleRevoke(f.id)}>
                          <Lucide icon="ShieldOff" className="w-4 h-4 mr-2 text-danger" />
                          <span className="text-danger">Revoke</span>
                        </Menu.Item>
                      )}
                    </Menu.Items>
                  </Menu>
                </div>

                {/* Bio */}
                <div className="px-5 pt-3 pb-2 text-center lg:text-left">
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {f.bio ?? "No bio provided"}
                  </p>
                  {f.skills && (
                    <div className="flex flex-wrap gap-1 mt-2 justify-center lg:justify-start">
                      {f.skills.split(",").slice(0, 3).map((s, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full"
                        >
                          {s.trim()}
                        </span>
                      ))}
                      {f.skills.split(",").length > 3 && (
                        <span className="text-xs text-slate-400">
                          +{f.skills.split(",").length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card footer */}
                <div className="p-5 text-center border-t lg:text-right border-slate-200/60">
                  <Button
                    variant="outline-secondary"
                    className="px-2 py-1 mr-2"
                    onClick={() => { setSelected(f); setDetailOpen(true); }}
                  >
                    <Lucide icon="Eye" className="w-3 h-3 mr-1" />
                    Details
                  </Button>

                  {!f.is_approved ? (
                    <Button
                      variant="success"
                      className="px-2 py-1"
                      disabled={approving === f.id}
                      onClick={() => handleApprove(f.id)}
                    >
                      <Lucide icon="ShieldCheck" className="w-3 h-3 mr-1" />
                      {approving === f.id ? "…" : "Approve"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline-danger"
                      className="px-2 py-1"
                      disabled={approving === f.id}
                      onClick={() => handleRevoke(f.id)}
                    >
                      <Lucide icon="ShieldOff" className="w-3 h-3 mr-1" />
                      {approving === f.id ? "…" : "Revoke"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── Detail Modal ──────────────────────────────────────────────────── */}
      {selected && (
        <Dialog
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          size="md"
        >
          <Dialog.Panel>
            {/* Modal header */}
            <div className="flex items-center px-5 py-4 border-b border-slate-200/60">
              <h2 className="font-semibold text-base">Freelancer Details</h2>
              <button
                className="ml-auto text-slate-400 hover:text-slate-600"
                onClick={() => setDetailOpen(false)}
              >
                <Lucide icon="X" className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 image-fit flex-shrink-0">
                  <img
                    src={avatarSrc(selected)}
                    alt={displayName(selected)}
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>
                <div>
                  <div className="font-semibold text-lg">{displayName(selected)}</div>
                  <div className="text-slate-500 text-sm">{selected.email}</div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${
                      selected.is_approved
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    <Lucide
                      icon={selected.is_approved ? "CheckCircle" : "Clock"}
                      className="w-3 h-3"
                    />
                    {selected.is_approved ? "Approved" : "Pending Review"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {selected.experience && (
                  <div className="flex gap-2 items-start">
                    <Lucide icon="Briefcase" className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-slate-700">{selected.experience}</span>
                  </div>
                )}
                {(selected.city || selected.country) && (
                  <div className="flex gap-2 items-start">
                    <Lucide icon="MapPin" className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-slate-700">
                      {[selected.city, selected.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
                {selected.bio && (
                  <div className="flex gap-2 items-start">
                    <Lucide icon="FileText" className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-slate-700 leading-relaxed">{selected.bio}</span>
                  </div>
                )}
                {selected.skills && (
                  <div className="flex gap-2 items-start">
                    <Lucide icon="Tag" className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {selected.skills.split(",").map((s, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(selected.cv || selected.smartcv) && (
                  <div className="flex gap-2 items-start pt-1">
                    <Lucide icon="FileText" className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-2">
                      {selected.cv && (
                        <a
                          href={selected.cv}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition font-medium"
                        >
                          <Lucide icon="Download" className="w-3 h-3" />
                          Download CV
                        </a>
                      )}
                      {selected.smartcv && (
                        <a
                          href={selected.smartcv}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-success/10 hover:bg-success/20 text-success px-3 py-1.5 rounded-lg transition font-medium"
                        >
                          <Lucide icon="FileText" className="w-3 h-3" />
                          View SmartCV
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {selected.joined_at && (
                  <div className="flex gap-2 items-center text-slate-400 text-xs pt-1">
                    <Lucide icon="Calendar" className="w-3.5 h-3.5" />
                    Joined {selected.joined_at}
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-slate-200/60">
              <Button
                variant="outline-secondary"
                onClick={() => setDetailOpen(false)}
              >
                Close
              </Button>
              {!selected.is_approved ? (
                <Button
                  variant="success"
                  disabled={approving === selected.id}
                  onClick={() => handleApprove(selected.id)}
                >
                  <Lucide icon="ShieldCheck" className="w-4 h-4 mr-1.5" />
                  {approving === selected.id ? "Approving…" : "Approve Freelancer"}
                </Button>
              ) : (
                <Button
                  variant="outline-danger"
                  disabled={approving === selected.id}
                  onClick={() => handleRevoke(selected.id)}
                >
                  <Lucide icon="ShieldOff" className="w-4 h-4 mr-1.5" />
                  {approving === selected.id ? "Revoking…" : "Revoke Approval"}
                </Button>
              )}
            </div>
          </Dialog.Panel>
        </Dialog>
      )}
    </>
  );
}

export default Main;
