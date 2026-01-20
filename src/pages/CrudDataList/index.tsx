import _ from "lodash";
import { useState, useRef } from "react";
import {
  Printer,
  FileText,
  Search,
  Plus,
  CheckSquare,
  Trash2,
  XCircle,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  AlertCircle,
  MessageSquare,
  Eye,
} from "lucide-react";

// Mock data for disputes
const mockDisputes = Array.from({ length: 9 }, (_, i) => ({
  id: `DSP${4000 + i}`,
  user: {
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    avatar: `https://i.pravatar.cc/150?img=${i + 20}`,
  },
  orderNumber: `ORD${10000 + Math.floor(Math.random() * 90000)}`,
  category: [
    "Product Quality",
    "Delivery Issue",
    "Payment Problem",
    "Service Complaint",
    "Wrong Item",
    "Damaged Item",
  ][Math.floor(Math.random() * 6)],
  priority: ["Low", "Medium", "High", "Urgent"][
    Math.floor(Math.random() * 4)
  ],
  amount: `$${(Math.random() * 500 + 50).toFixed(2)}`,
  createdDate: new Date(
    Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000
  ).toLocaleDateString(),
  status: ["Pending", "Under Review", "Resolved", "Closed"][
    Math.floor(Math.random() * 4)
  ],
  messages: Math.floor(Math.random() * 15 + 1),
  assignedTo: ["Admin A", "Admin B", "Admin C", "Unassigned"][
    Math.floor(Math.random() * 4)
  ],
  description: "Customer complaint regarding order...",
}));

function Main() {
  const [resolveConfirmationModal, setResolveConfirmationModal] =
    useState(false);
  const resolveButtonRef = useRef<HTMLButtonElement | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedJobs(mockDisputes.map((_, i) => i));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (index: number) => {
    if (selectedJobs.includes(index)) {
      setSelectedJobs(selectedJobs.filter((i) => i !== index));
    } else {
      setSelectedJobs([...selectedJobs, index]);
    }
  };

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

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Dispute List</h2>

      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y xl:flex-nowrap">
          <button className="mr-2 shadow-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
            Assign Selected
          </button>

          <div className="hidden mx-auto xl:block text-slate-500">
            Showing 1 to 10 of {mockDisputes.length} entries
          </div>
        </div>

        <div className="col-span-12 overflow-auto intro-y 2xl:overflow-visible">
          <table className="w-full border-separate border-spacing-y-[10px] -mt-2">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left font-medium">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedJobs.length === mockDisputes.length}
                  />
                </th>
                <th className="px-5 py-3 text-left font-medium">USER</th>
                <th className="px-5 py-3 text-center font-medium">CATEGORY</th>
                <th className="px-5 py-3 text-center font-medium">PRIORITY</th>
                <th className="px-5 py-3 text-center font-medium">STATUS</th>
                <th className="px-5 py-3 text-center font-medium">AMOUNT</th>
                <th className="px-5 py-3 text-center font-medium">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {mockDisputes.map((dispute, index) => (
                <tr key={index}>
                  <td className="bg-white px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(index)}
                      onChange={() => handleSelectJob(index)}
                    />
                  </td>

                  <td className="bg-white px-5 py-3">
                    <div className="font-medium">{dispute.user.name}</div>
                    <div className="text-xs text-slate-500">
                      {dispute.user.email}
                    </div>
                  </td>

                  <td className="bg-white px-5 py-3 text-center">
                    {dispute.category}
                  </td>

                  <td className="bg-white px-5 py-3 text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded ${getPriorityColor(
                        dispute.priority
                      )}`}
                    >
                      {dispute.priority}
                    </span>
                  </td>

                  <td className="bg-white px-5 py-3 text-center">
                    <span className={getStatusColor(dispute.status)}>
                      {dispute.status}
                    </span>
                  </td>

                  <td className="bg-white px-5 py-3 text-center">
                    {dispute.amount}
                  </td>

                  <td className="bg-white px-5 py-3 text-center">
                    <button
                      className="text-green-600"
                      onClick={() => setResolveConfirmationModal(true)}
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {resolveConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 text-center">
            <div className="text-xl mb-4">Resolve Dispute?</div>
            <button
              onClick={() => setResolveConfirmationModal(false)}
              className="mr-2 px-4 py-2 border rounded"
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
      )}
    </>
  );
}

export default Main;
