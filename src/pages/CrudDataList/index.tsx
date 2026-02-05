import { useState, useRef, useEffect } from "react";
import axios from "@/utils/axios"; // make sure this points to your Axios instance

function Main() {
  const [resolveConfirmationModal, setResolveConfirmationModal] = useState(false);
  const resolveButtonRef = useRef<HTMLButtonElement | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);

  // Select / deselect all rows
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedJobs(disputes.map((_, i) => i));
    } else {
      setSelectedJobs([]);
    }
  };

  // Select / deselect single row
  const handleSelectJob = (index: number) => {
    setSelectedJobs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Priority badge colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700";
      case "High":
        return "bg-orange-100 text-orange-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Status text colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-amber-600";
      case "Under Review":
        return "text-blue-600";
      case "Resolved":
        return "text-green-600";
      case "Closed":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  // Fetch disputes from backend
  const fetchDisputes = async () => {
  console.log("🔍 Fetching disputes..."); // Debug
  try {
    const res = await axios.get("/v1/admin/reports", {
      headers: {
        "x-api-key": "secret123",
      },
    });
    
    console.log("✅ Response received:", res.data); // Debug - see the actual response
    console.log("📊 Data structure:", res.data.data); // Debug - see the data array
    
    // Check your state update logic here
    setDisputes(res.data.data || []); // Adjust based on response structure
    
  } catch (err) {
    console.error("❌ Failed to fetch disputes:", err);
  }
};

  useEffect(() => {
    fetchDisputes();
  }, []);

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
              <th className="px-5 py-3 text-left font-medium">FULL NAME</th>
              <th className="px-5 py-3 text-center font-medium">PRIORITY</th>
              <th className="px-5 py-3 text-center font-medium">STATUS</th>
              <th className="px-5 py-3 text-left font-medium">DESCRIPTION</th>
              <th className="px-5 py-3 text-center font-medium">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {disputes.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-5 text-gray-500">
                  No disputes found.
                </td>
              </tr>
            ) : (
              disputes.map((dispute, index) => (
                <tr key={index}>
                  <td className="bg-white px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(index)}
                      onChange={() => handleSelectJob(index)}
                    />
                  </td>

                 <td>
  <div className="font-medium">{dispute.full_name}</div>
  <div className="text-xs text-slate-500">{dispute.email}</div>
</td>

                  <td className="bg-white px-5 py-3 text-center">
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(dispute.priority)}`}>
                      {dispute.priority || "-"}
                    </span>
                  </td>

                  <td className="bg-white px-5 py-3 text-center">
                    <span className={getStatusColor(dispute.status)}>
  {dispute.status || "Pending"}
</span>

                  </td>

                  <td className="bg-white px-5 py-3">{dispute.description || "-"}</td>

                  <td className="bg-white px-5 py-3 text-center">
                    <button
                      className="text-green-600"
                      onClick={() => setResolveConfirmationModal(true)}
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resolve Modal */}
      {resolveConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 text-center">
            <div className="text-xl mb-4">Resolve Dispute?</div>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setResolveConfirmationModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                ref={resolveButtonRef}
                className="px-4 py-2 bg-green-600 text-white rounded"
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
