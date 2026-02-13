import { useEffect, useRef, useState } from "react";
import {
  Search,
  Trash2,
  XCircle,
  MapPin,
  Clock,
  Check
} from "lucide-react";

/* =====================
   TYPES
===================== */
type Employer = {
  name?: string;
  logo?: string;
};

type Job = {
  id: number;
  title: string;
  budget?: string | number;
  city?: string;
  state?: string;
  country?: string;
  status?: boolean | number;
  applicants_count?: number;
  created_at?: string;
  employer?: Employer;
};

export default function Main() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const deleteBtnRef = useRef<HTMLButtonElement | null>(null);

  const token = localStorage.getItem("token");

  /* =====================
     FETCH JOBS
  ===================== */
const fetchJobs = async () => {
  setLoading(true);
  try {
    const res = await fetch("http://localhost:8000/api/v1/admin/jobs", {  // ✅ Added /v1
      headers: {
        "x-api-key": "secret123",  // ✅ Changed to API key (must match your other admin routes)
        Accept: "application/json",
      },
    });

    const data = await res.json();
    if (data.status === "success") {
      setJobs(data.data);
    } else {
      setJobs([]);
    }
  } catch (err) {
    console.error("Failed to fetch jobs", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchJobs();
  }, []);

  /* =====================
     SELECTION
  ===================== */
  const toggleSelectAll = (checked: boolean) => {
    setSelectedJobs(checked ? jobs.map(j => j.id) : []);
  };

  const toggleSelectJob = (id: number) => {
    setSelectedJobs(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  /* =====================
     ACTIONS
  ===================== */
  const approveJobs = async () => {
  if (!selectedJobs.length) return;

  try {
    await fetch("http://localhost:8000/api/v1/admin/jobs/approve", {  // ✅ Added /v1
      method: "POST",
      headers: {
        "x-api-key": "secret123",  // ✅ Changed to API key
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ job_ids: selectedJobs }),
    });

    setSelectedJobs([]);
    fetchJobs();
  } catch (err) {
    console.error("Failed to approve jobs:", err);
  }
};
  const deleteJobs = async () => {
  try {
    await fetch("http://localhost:8000/api/v1/admin/jobs/delete", {  // ✅ Added /v1
      method: "POST",
      headers: {
        "x-api-key": "secret123",  // ✅ Changed to API key
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ job_ids: selectedJobs }),
    });

    setShowDeleteModal(false);
    setSelectedJobs([]);
    fetchJobs();
  } catch (err) {
    console.error("Failed to delete jobs:", err);
  }
};

  /* =====================
     HELPERS
  ===================== */
  const formatPrice = (amount?: string | number) => {
    if (!amount) return "—";
    return `₦${Number(amount).toLocaleString()}`;
  };

  const formatLocation = (job: Job) => {
    return [job.city, job.state, job.country].filter(Boolean).join(", ") || "Remote";
  };

  /* =====================
     RENDER
  ===================== */
  return (
    <>
      <h2 className="mt-10 text-lg font-semibold">Admin Job Management</h2>

      {/* ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between mt-5">
        <div className="flex gap-2">
          <button
            disabled={!selectedJobs.length}
            onClick={approveJobs}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-40"
          >
            <Check className="w-4 h-4 inline mr-1" />
            Approve
          </button>

          <button
            disabled={!selectedJobs.length}
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Delete
          </button>
        </div>

        <div className="relative">
          <input
            className="border rounded px-3 py-2 pr-10"
            placeholder="Search jobs..."
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-sm text-gray-500">
              <th className="px-4">
                <input
                  type="checkbox"
                  checked={jobs.length > 0 && selectedJobs.length === jobs.length}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </th>
              <th className="text-left px-4">Job</th>
              <th className="text-left">Location</th>
              <th className="text-center">Price</th>
              <th className="text-center">Status</th>
              <th className="text-center">Applicants</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map(job => (
              <tr key={job.id} className="bg-white shadow-sm">
                <td className="px-4">
                  <input
                    type="checkbox"
                    checked={selectedJobs.includes(job.id)}
                    onChange={() => toggleSelectJob(job.id)}
                  />
                </td>

                <td className="px-4 py-3">
                  <div className="font-medium">{job.title}</div>
                  <div className="text-xs text-gray-500">
                    {job.employer?.name || "Unknown Company"}
                  </div>
                </td>

                <td className="text-sm">
                  <MapPin className="inline w-3 h-3 mr-1 text-gray-400" />
                  {formatLocation(job)}
                </td>

                <td className="text-center font-semibold">
                  {formatPrice(job.budget)}
                </td>

                <td className="text-center">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      job.status
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {job.status ? "Approved" : "Pending"}
                  </span>
                </td>

                <td className="text-center">
                  <div className="font-semibold">
                    {job.applicants_count ?? 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    <Clock className="inline w-3 h-3 mr-1" />
                    {job.created_at
                      ? new Date(job.created_at).toDateString()
                      : "Recently"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && jobs.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No jobs found.
          </p>
        )}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <XCircle className="w-14 h-14 text-red-600 mx-auto" />
            <h3 className="text-center text-lg font-semibold mt-4">
              Delete selected jobs?
            </h3>
            <p className="text-center text-gray-500 mt-2">
              This action cannot be undone.
            </p>

            <div className="flex justify-center mt-6 gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                ref={deleteBtnRef}
                onClick={deleteJobs}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}