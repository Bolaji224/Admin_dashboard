import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/utils/axios";
import Lucide from "@/components/Base/Lucide";
import { FormInput } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import moment from "moment";

/* ─── Types ─── */

interface Employer {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

interface FreelancerResult {
  id: number;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  experience: string | null;
  skills: string | null;
  city: string | null;
  country: string | null;
  is_approved: boolean;
  is_suspended: boolean;
}

interface Assignment {
  id: number;
  status: "assigned" | "selected" | "rejected";
  freelancer: FreelancerResult;
}

interface SmartStartDetail {
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
  ref_links: string | null;
  extra_notes: string | null;
  file_urls: string[];
  selected_freelancer_id: number | null;
  employer: Employer;
  assignments: Assignment[];
}

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

/* ─── Helpers ─── */

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const displayName = (f: FreelancerResult) =>
  f.first_name ? `${f.first_name} ${f.last_name ?? ""}`.trim() : f.name;

const getFilename = (url: string) => {
  try {
    return decodeURIComponent(url.split("/").pop() || url);
  } catch {
    return url;
  }
};

/* ─── Component ─── */

function Main() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<SmartStartDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FreelancerResult[]>([]);
  const [searching, setSearching] = useState(false);

  const [selectedPack, setSelectedPack] = useState<FreelancerResult[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* ─── Fetch request ─── */

  const fetchRequest = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`/admin/smartstart/${id}`);
      if (res.data?.status === "success") {
        const req: SmartStartDetail = res.data.data;
        setRequest(req);
        if (req.assignments && req.assignments.length > 0) {
          setSelectedPack(req.assignments.map((a) => a.freelancer));
        }
      }
    } catch {
      showToast("Failed to load request details", false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  /* ─── Freelancer search (debounced 300 ms) ─── */

  const searchFreelancers = async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await axios.get("/admin/freelancers", {
        params: { search: q.trim(), status: "approved" },
      });
      if (res.data?.status === "success") {
        setSearchResults(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch {
      // silently fail — search is best-effort
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      searchFreelancers(value);
    }, 300);
  };

  /* ─── Pack management ─── */

  const addToPack = (f: FreelancerResult) => {
    if (selectedPack.find((p) => p.id === f.id)) return;
    if (selectedPack.length >= 5) return;
    setSelectedPack((prev) => [...prev, f]);
  };

  const removeFromPack = (freelancerId: number) => {
    setSelectedPack((prev) => prev.filter((f) => f.id !== freelancerId));
  };

  /* ─── Submit ─── */

  const handleAssign = async () => {
    if (selectedPack.length < 3) {
      setAssignError("Select at least 3 freelancers before submitting.");
      return;
    }
    setAssignError(null);
    setAssigning(true);
    try {
      const res = await axios.post(`/admin/smartstart/${id}/assign`, {
        freelancer_ids: selectedPack.map((f) => f.id),
      });
      if (res.data?.status === "success") {
        showToast(res.data.message || "Talent Pack assigned successfully!");
        setRequest((prev) =>
          prev ? { ...prev, status: "matched" } : prev
        );
        setSearchQuery("");
        setSearchResults([]);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to assign freelancers. Please try again.";
      setAssignError(msg);
    } finally {
      setAssigning(false);
    }
  };

  /* ─── Confirm payment ─── */

  const handleConfirmPayment = async () => {
    setConfirming(true);
    try {
      const res = await axios.post(`/admin/smartstart/${id}/mark-paid`);
      if (res.data?.status === "success") {
        setRequest((prev) =>
          prev ? { ...prev, payment_status: "paid" } : prev
        );
        showToast("Payment confirmed. You can now assign the Talent Pack.");
      }
    } catch (err: any) {
      showToast(
        err.response?.data?.message || "Failed to confirm payment.",
        false
      );
    } finally {
      setConfirming(false);
    }
  };

  /* ─── Counter colour ─── */

  const counterColor = () => {
    const n = selectedPack.length;
    if (n === 5) return "text-success";
    if (n >= 3) return "text-amber-500";
    return "text-danger";
  };

  /* ─── Loading / not found ─── */

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <Lucide
          icon="Loader"
          className="w-8 h-8 mx-auto mb-3 animate-spin text-primary"
        />
        Loading request...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="py-20 text-center text-slate-500">
        <p className="font-medium">Request not found.</p>
        <button
          onClick={() => navigate("/admin/smartstart")}
          className="mt-4 text-primary hover:underline text-sm"
        >
          ← Back to list
        </button>
      </div>
    );
  }

  const isPaid = request.payment_status === "paid";
  const hasExistingAssignments =
    request.assignments && request.assignments.length > 0;

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

      {/* Back button */}
      <button
        onClick={() => navigate("/admin/smartstart")}
        className="flex items-center gap-1.5 mt-8 text-sm text-slate-500 hover:text-slate-700 intro-y"
      >
        <Lucide icon="ArrowLeft" className="w-4 h-4" />
        Back to SmartStart Requests
      </button>

      {/* Status + payment badges */}
      <div className="flex items-center flex-wrap gap-2 mt-4 mb-6 intro-y">
        <span
          className={`px-3 py-1.5 text-sm rounded-full font-semibold ${
            statusBadgeClass[request.status] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {statusLabel[request.status] ?? request.status}
        </span>
        {isPaid ? (
          <span className="px-3 py-1.5 text-sm rounded-full font-semibold bg-green-100 text-green-700">
            Paid
          </span>
        ) : (
          <span className="px-3 py-1.5 text-sm rounded-full font-semibold bg-amber-100 text-amber-700">
            Awaiting Payment
          </span>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-12 gap-6 intro-y">

        {/* ─── LEFT: Project Brief ─── */}
        <div className="col-span-12 lg:col-span-5">
          <div className="box p-6">

            {/* Employer */}
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-200/60">
              {request.employer?.avatar ? (
                <img
                  src={request.employer.avatar}
                  alt={request.employer.name}
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {getInitials(request.employer?.name || "?")}
                </div>
              )}
              <div>
                <div className="font-semibold text-sm">{request.employer?.name}</div>
                <div className="text-slate-500 text-xs">{request.employer?.email}</div>
              </div>
            </div>

            {/* Project title */}
            <h1 className="text-xl font-bold text-slate-800 mb-3">
              {request.title}
            </h1>

            {/* Type + urgency inline */}
            <div className="flex items-center flex-wrap gap-2 mb-5">
              <span className="text-sm text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {request.project_type}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                  urgencyBadgeClass[request.urgency] ??
                  "bg-slate-100 text-slate-600"
                }`}
              >
                {request.urgency} urgency
              </span>
            </div>

            {/* Description */}
            <div className="mb-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Description
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {request.description}
              </p>
            </div>

            {/* Budget */}
            <div className="mb-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Budget Range
              </div>
              <div className="text-sm font-semibold text-slate-800">
                ₦{(request.budget_min || 0).toLocaleString()} – ₦
                {(request.budget_max || 0).toLocaleString()}
              </div>
            </div>

            {/* Deadline */}
            <div className="mb-5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Deadline
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-700">
                <Lucide icon="Calendar" className="w-3.5 h-3.5 text-slate-400" />
                {request.deadline
                  ? moment(request.deadline).format("DD MMMM YYYY")
                  : "—"}
              </div>
            </div>

            {/* Ref links */}
            {request.ref_links && (
              <div className="mb-5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Reference Links
                </div>
                <div className="space-y-1.5">
                  {request.ref_links
                    .split(/[\n,]+/)
                    .map((l) => l.trim())
                    .filter(Boolean)
                    .map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline break-all"
                      >
                        <Lucide
                          icon="ExternalLink"
                          className="w-3 h-3 flex-shrink-0"
                        />
                        {link}
                      </a>
                    ))}
                </div>
              </div>
            )}

            {/* Extra notes */}
            {request.extra_notes && (
              <div className="mb-5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Extra Notes
                </div>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {request.extra_notes}
                </p>
              </div>
            )}

            {/* Attached files */}
            {request.file_urls && request.file_urls.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Attached Files
                </div>
                <div className="space-y-1.5">
                  {request.file_urls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-slate-700 hover:text-primary bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg transition"
                    >
                      <Lucide
                        icon="Download"
                        className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
                      />
                      <span className="truncate">{getFilename(url)}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT: Assign Talent Pack ─── */}
        <div className="col-span-12 lg:col-span-7">
          <div className="box p-6">

            {/* Unpaid warning banner */}
            {!isPaid && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5">
                <Lucide
                  icon="AlertTriangle"
                  className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-semibold text-amber-800 text-sm">
                    Payment Pending
                  </div>
                  <div className="text-amber-700 text-xs mt-0.5">
                    This request has not been paid yet. Confirm payment below to
                    unlock assignment.
                  </div>
                  <Button
                    variant="warning"
                    className="mt-3 px-4 py-1.5 text-xs"
                    disabled={confirming}
                    onClick={handleConfirmPayment}
                  >
                    {confirming ? (
                      <>
                        <Lucide icon="Loader" className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Confirming…
                      </>
                    ) : (
                      <>
                        <Lucide icon="CheckCircle" className="w-3.5 h-3.5 mr-1.5" />
                        Confirm Payment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Panel content — pointer-events disabled when unpaid */}
            <div className={!isPaid ? "pointer-events-none select-none opacity-60" : ""}>
              <h3 className="font-semibold text-base text-slate-800 mb-1">
                Build the Talent Pack
              </h3>
              <p className="text-sm text-slate-500 mb-5">
                Search and select 3–5 freelancers whose skills match this project.
              </p>

              {/* Replacement warning */}
              {hasExistingAssignments && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-5 text-sm">
                  <Lucide
                    icon="Info"
                    className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5"
                  />
                  <span className="text-blue-700">
                    This pack has already been assigned. Submitting will replace
                    it.
                  </span>
                </div>
              )}

              {/* Search input */}
              <div className="relative mb-3">
                <FormInput
                  type="text"
                  className="w-full pr-10 !box"
                  placeholder="Search by name, email or skills..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {searching ? (
                    <Lucide
                      icon="Loader"
                      className="w-4 h-4 animate-spin text-slate-400"
                    />
                  ) : (
                    <Lucide icon="Search" className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-5 max-h-72 overflow-y-auto">
                  {searchResults.map((f) => {
                    const alreadyAdded = !!selectedPack.find(
                      (p) => p.id === f.id
                    );
                    const packFull = selectedPack.length >= 5;
                    const disabled = alreadyAdded || packFull;
                    const skills = f.skills
                      ? f.skills
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      : [];

                    return (
                      <div
                        key={f.id}
                        className={`flex items-start gap-3 p-3 border-b border-slate-100 last:border-b-0 ${
                          disabled ? "" : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Avatar */}
                        {f.avatar ? (
                          <img
                            src={f.avatar}
                            alt={displayName(f)}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {getInitials(displayName(f) || "?")}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {displayName(f)}
                          </div>
                          <div className="text-xs text-slate-500">{f.email}</div>
                          {(f.city || f.country) && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {[f.city, f.country].filter(Boolean).join(", ")}
                            </div>
                          )}
                          {f.bio && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                              {f.bio.slice(0, 80)}
                            </p>
                          )}
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {skills.slice(0, 4).map((s, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded"
                                >
                                  {s}
                                </span>
                              ))}
                              {skills.length > 4 && (
                                <span className="text-xs text-slate-400">
                                  +{skills.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Add button */}
                        <button
                          onClick={() => !disabled && addToPack(f)}
                          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                            alreadyAdded
                              ? "bg-green-100 text-green-600 cursor-default"
                              : packFull
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-primary text-white hover:bg-primary/90 cursor-pointer"
                          }`}
                        >
                          {alreadyAdded ? "Added ✓" : "+ Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty search state */}
              {searchQuery.trim() && !searching && searchResults.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4 mb-4 bg-slate-50 rounded-lg">
                  No freelancers found for "{searchQuery}"
                </div>
              )}

              {/* Selected pack area */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-slate-700">
                    Selected Pack
                  </div>
                  <div className={`text-sm font-bold ${counterColor()}`}>
                    {selectedPack.length} / 5 selected
                  </div>
                </div>

                {selectedPack.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No freelancers selected yet. Use the search above to add.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedPack.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full pl-1.5 pr-2 py-1"
                      >
                        {f.avatar ? (
                          <img
                            src={f.avatar}
                            alt={displayName(f)}
                            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            {getInitials(displayName(f) || "?")}
                          </div>
                        )}
                        <span className="text-xs font-medium whitespace-nowrap">
                          {displayName(f)}
                        </span>
                        <button
                          onClick={() => removeFromPack(f.id)}
                          className="text-slate-400 hover:text-danger ml-0.5 flex-shrink-0"
                        >
                          <Lucide icon="X" className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Error message */}
              {assignError && (
                <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <Lucide
                    icon="AlertCircle"
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                  />
                  {assignError}
                </div>
              )}

              {/* Submit button */}
              <Button
                variant="primary"
                className="w-full mt-4"
                disabled={selectedPack.length < 3 || assigning}
                onClick={handleAssign}
              >
                {assigning ? (
                  <>
                    <Lucide
                      icon="Loader"
                      className="w-4 h-4 mr-2 animate-spin"
                    />
                    Assigning…
                  </>
                ) : (
                  <>
                    <Lucide icon="Sparkles" className="w-4 h-4 mr-2" />
                    Assign Talent Pack
                  </>
                )}
              </Button>

              {selectedPack.length < 3 && selectedPack.length > 0 && (
                <p className="text-xs text-slate-400 text-center mt-2">
                  Add {3 - selectedPack.length} more freelancer
                  {3 - selectedPack.length !== 1 ? "s" : ""} to enable submission.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Main;
