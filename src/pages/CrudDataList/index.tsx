import { useState, useRef, useEffect } from "react";
import axios from "@/utils/axios";

function Main() {
  const [resolveConfirmationModal, setResolveConfirmationModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const resolveButtonRef = useRef<HTMLButtonElement | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedJobs(disputes.map((_, i) => i));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (index: number) => {
    setSelectedJobs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent": return "bg-red-100 text-red-700";
      case "high":   return "bg-orange-100 text-orange-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low":    return "bg-green-100 text-green-700";
      default:       return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":      return "text-amber-600";
      case "Under Review": return "text-blue-600";
      case "Resolved":     return "text-green-600";
      case "Closed":       return "text-gray-600";
      default:             return "text-gray-600";
    }
  };

const fetchDisputes = async () => {
  try {
    const res = await axios.get("/admin/reports", {
      headers: { "x-api-key": "secret123" },
    });
    console.log("Disputes data:", JSON.stringify(res.data.data?.[0])); // 👈 shows first dispute shape
    setDisputes(res.data.data || []);
  } catch (err) {
    console.error("Failed to fetch disputes:", err);
  }
};

 const handleResolve = async () => {
    if (!selectedDispute) return;
    
    // ← Update UI immediately
    setDisputes((prev) =>
        prev.map((d) =>
            d.id === selectedDispute.id ? { ...d, status: "Resolved" } : d
        )
    );
    setResolveConfirmationModal(false);
    setSelectedDispute(null);

    // ← Then call API in background
    try {
        await axios.post(`/admin/reports/${selectedDispute.id}/resolve`, {}, {
            headers: { "x-api-key": "secret123" },
        });
    } catch (err) {
        console.error("Failed to resolve dispute:", err);
        // Optionally revert if API fails
        setDisputes((prev) =>
            prev.map((d) =>
                d.id === selectedDispute.id ? { ...d, status: "Pending" } : d
            )
        );
    }
};

  useEffect(() => {
    fetchDisputes();
  }, []);

  // ✅ Helper to get the "reported by" info
  const getReportedBy = (dispute: any) => {
    return {
      name: dispute.full_name || "—",
      email: dispute.email,
      phone: dispute.phone,
      role: dispute.user_type === "employer" ? "Employer" : "Candidate",
      roleColor: dispute.user_type === "employer"
        ? "bg-blue-100 text-blue-700"
        : "bg-green-100 text-green-700",
    };
  };

  // ✅ Helper to get the "reported against" info
  const getReportedAgainst = (dispute: any) => {
    if (dispute.user_type === "employer") {
      // Employer reporting a candidate
      return {
        name: dispute.candidate_name || null,
        label: "Candidate",
        labelColor: "bg-green-100 text-green-700",
      };
    } else {
      // Candidate reporting an employer
      return {
        name: dispute.employer_name || null,
        label: "Employer",
        labelColor: "bg-blue-100 text-blue-700",
      };
    }
  };

  return (
    <div className="p-5">
      <h2 className="mt-10 text-lg font-medium">Dispute List</h2>

      <div className="flex flex-wrap items-center justify-between mt-5 mb-3">
        <button className="shadow-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
          Assign Selected
        </button>
        <div className="text-slate-500 hidden xl:block">
          Showing 1 to {disputes.length} of {disputes.length} entries
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-5 py-3 text-left font-medium">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedJobs.length === disputes.length && disputes.length > 0}
                />
              </th>
              {/* ✅ Clear column headers */}
              <th className="px-5 py-3 text-left font-medium">REPORTED BY</th>
              <th className="px-5 py-3 text-left font-medium">REPORTED AGAINST</th>
              <th className="px-5 py-3 text-left font-medium">CATEGORY</th>
              <th className="px-5 py-3 text-center font-medium">PRIORITY</th>
              <th className="px-5 py-3 text-center font-medium">STATUS</th>
              <th className="px-5 py-3 text-left font-medium">DESCRIPTION</th>
              <th className="px-5 py-3 text-center font-medium">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-5 text-gray-500">
                  No disputes found.
                </td>
              </tr>
            ) : (
              disputes.map((dispute, index) => {
                const reportedBy = getReportedBy(dispute);
                const reportedAgainst = getReportedAgainst(dispute);

                return (
                  <tr key={index}>
                    <td className="bg-white px-5 py-3 rounded-l-lg">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(index)}
                        onChange={() => handleSelectJob(index)}
                      />
                    </td>

                    {/* ✅ REPORTED BY */}
                    <td className="bg-white px-5 py-3">
                      <div className="font-medium">{reportedBy.name}</div>
                      <div className="text-xs text-slate-500">{reportedBy.email}</div>
                      <div className="text-xs text-slate-400">{reportedBy.phone}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-medium ${reportedBy.roleColor}`}>
                        {reportedBy.role}
                      </span>
                    </td>

                    {/* ✅ REPORTED AGAINST — shows employer or candidate clearly */}
                    <td className="bg-white px-5 py-3">
                      {reportedAgainst.name ? (
                        <div>
                          <span className={`text-xs px-2 py-0.5 rounded-full inline-block font-medium mb-1 ${reportedAgainst.labelColor}`}>
                            {reportedAgainst.label}
                          </span>
                          <div className="font-medium text-gray-800">
                            {reportedAgainst.name}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not specified</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="bg-white px-5 py-3">
                      <div className="text-sm text-gray-700">
                        {dispute.dispute_category || "—"}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[150px]">
                        {dispute.subject}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="bg-white px-5 py-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${getPriorityColor(dispute.priority)}`}>
                        {dispute.priority
                          ? dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)
                          : "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="bg-white px-5 py-3 text-center">
                      <span className={`font-medium ${getStatusColor(dispute.status)}`}>
                        {dispute.status || "Pending"}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="bg-white px-5 py-3 max-w-[200px]">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {dispute.description || "—"}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="bg-white px-5 py-3 text-center rounded-r-lg">
                      {dispute.status !== "Resolved" ? (
                        <button
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setResolveConfirmationModal(true);
                          }}
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Resolved</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Resolve Modal */}
      {resolveConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 text-center">
            <div className="text-xl font-semibold mb-2">Resolve Dispute?</div>
            {selectedDispute && (
              <p className="text-sm text-gray-500 mb-4">
                {/* ✅ Modal also shows correct context */}
                <strong>{selectedDispute.full_name}</strong>
                {" "}({selectedDispute.user_type === "employer" ? "Employer" : "Candidate"})
                {" "}reported against{" "}
                <strong>
                  {selectedDispute.user_type === "employer"
                    ? selectedDispute.candidate_name
                    : selectedDispute.employer_name}
                </strong>
              </p>
            )}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setResolveConfirmationModal(false);
                  setSelectedDispute(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                ref={resolveButtonRef}
                onClick={handleResolve}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Main;