import _ from "lodash";
import { useState, useRef } from "react";
import { Printer, FileText, Search, Plus, CheckSquare, Trash2, XCircle, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, DollarSign } from "lucide-react";

// Mock data for pending withdrawals
const mockWithdrawals = Array.from({ length: 9 }, (_, i) => {
  const methodType = ['Bank Transfer', 'PayPal', 'Crypto'][Math.floor(Math.random() * 3)];
  const bankDetails = methodType === 'Bank Transfer' ? {
    bankName: ['Chase Bank', 'Wells Fargo', 'Bank of America', 'Citibank'][Math.floor(Math.random() * 4)],
    accountName: `User ${i + 1}`,
    accountNumber: `****${Math.floor(1000 + Math.random() * 9000)}`,
    routingNumber: `${Math.floor(100000000 + Math.random() * 900000000)}`
  } : null;

  return {
    id: `WD${1000 + i}`,
    user: {
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      avatar: `https://i.pravatar.cc/150?img=${i + 1}`
    },
    amount: (Math.random() * 5000 + 100).toFixed(2),
    method: methodType,
    bankDetails: bankDetails,
    date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    status: ['Pending', 'Processing'][Math.floor(Math.random() * 2)],
    isPending: Math.random() > 0.3
  };
});

function Main() {
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const deleteButtonRef = useRef(null);

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Pending Withdrawals</h2>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <button className="mr-2 shadow-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
            Process Selected
          </button>
          <div className="relative">
            <button className="px-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-md h-10 w-10 flex items-center justify-center">
              <span className="flex items-center justify-center w-5 h-5">
                <Plus className="w-4 h-4" />
              </span>
            </button>
          </div>
          <div className="hidden mx-auto md:block text-slate-500">
            Showing 1 to 10 of 150 entries
          </div>
          <div className="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-0">
            <div className="relative w-56 text-slate-500">
              <input
                type="text"
                className="w-56 pr-10 border border-gray-300 rounded-md px-3 py-2"
                placeholder="Search..."
              />
              <Search className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
            </div>
          </div>
        </div>
        {/* BEGIN: Data List */}
        <div className="col-span-12 overflow-auto intro-y lg:overflow-visible">
          <table className="w-full border-separate border-spacing-y-[10px] -mt-2">
            <thead>
              <tr>
                <th className="border-b-0 whitespace-nowrap px-5 py-3 text-left font-medium">
                  USER
                </th>
                <th className="border-b-0 whitespace-nowrap px-5 py-3 text-left font-medium">
                  WITHDRAWAL ID
                </th>
                <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium">
                  AMOUNT
                </th>
                <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium">
                  METHOD
                </th>
                <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium">
                  DATE
                </th>
                <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium">
                  STATUS
                </th>
                <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {mockWithdrawals.map((withdrawal, index) => (
                <tr key={index} className="intro-x">
                  <td className="bg-white rounded-l-[0.6rem] border-r-0 shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600">
                    <div className="flex items-center">
                      <div className="w-10 h-10 image-fit zoom-in">
                        <img
                          alt={withdrawal.user.name}
                          className="rounded-full shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)] dark:shadow-[0px_0px_0px_2px_#3f4865,_1px_1px_5px_rgba(0,0,0,0.32)]"
                          src={withdrawal.user.avatar}
                        />
                      </div>
                      <div className="ml-4">
                        <a href="#" className="font-medium whitespace-nowrap">
                          {withdrawal.user.name}
                        </a>
                        <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5">
                          {withdrawal.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="bg-white border-x-0 shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600">
                    <span className="font-medium text-slate-600">{withdrawal.id}</span>
                  </td>
                  <td className="bg-white border-x-0 text-center shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600">
                    <span className="font-semibold text-lg">${withdrawal.amount}</span>
                  </td>
                  <td className="bg-white border-x-0 text-center shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600">
                    <div className="font-medium">{withdrawal.method}</div>
                    {withdrawal.bankDetails && (
                      <div className="mt-2 text-xs text-slate-600 text-left bg-slate-50 p-2 rounded border border-slate-200">
                        <div className="font-semibold mb-1">Bank Details:</div>
                        <div><span className="font-medium">Bank:</span> {withdrawal.bankDetails.bankName}</div>
                        <div><span className="font-medium">Account:</span> {withdrawal.bankDetails.accountName}</div>
                        <div><span className="font-medium">Number:</span> {withdrawal.bankDetails.accountNumber}</div>
                        <div><span className="font-medium">Routing:</span> {withdrawal.bankDetails.routingNumber}</div>
                      </div>
                    )}
                  </td>
                  <td className="bg-white border-x-0 text-center shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600">
                    {withdrawal.date}
                  </td>
                  <td className="bg-white w-40 border-x-0 shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600">
                    <div
                      className={`flex items-center justify-center ${
                        withdrawal.status === 'Pending' ? 'text-amber-600' : 'text-blue-600'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      {withdrawal.status}
                    </div>
                  </td>
                  <td className="bg-white w-56 rounded-r-[0.6rem] border-l-0 shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600 relative before:absolute before:inset-y-0 before:left-0 before:my-auto before:block before:h-8 before:w-px before:bg-slate-200 before:dark:bg-darkmode-400">
                    <div className="flex items-center justify-center">
                      <a className="flex items-center mr-3 text-blue-600 hover:text-blue-800" href="#">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Approve
                      </a>
                      <a
                        className="flex items-center text-red-600 hover:text-red-800"
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          setDeleteConfirmationModal(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Reject
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* END: Data List */}
        {/* BEGIN: Pagination */}
        <div className="flex flex-wrap items-center col-span-12 intro-y sm:flex-row sm:flex-nowrap">
          <div className="flex w-full sm:w-auto sm:mr-auto">
            <button className="px-3 py-2 border border-gray-300 rounded-l-md bg-white hover:bg-gray-50">
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-2 border-t border-b border-gray-300 bg-white hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-2 border-t border-b border-gray-300 bg-white hover:bg-gray-50">...</button>
            <button className="px-3 py-2 border-t border-b border-gray-300 bg-white hover:bg-gray-50">1</button>
            <button className="px-3 py-2 border-t border-b border-gray-300 bg-blue-600 text-white">2</button>
            <button className="px-3 py-2 border-t border-b border-gray-300 bg-white hover:bg-gray-50">3</button>
            <button className="px-3 py-2 border-t border-b border-gray-300 bg-white hover:bg-gray-50">...</button>
            <button className="px-3 py-2 border-t border-b border-gray-300 bg-white hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-r-md bg-white hover:bg-gray-50">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
          <select className="w-20 mt-3 border border-gray-300 rounded-md px-2 py-2 bg-white sm:mt-0">
            <option>10</option>
            <option>25</option>
            <option>35</option>
            <option>50</option>
          </select>
        </div>
        {/* END: Pagination */}
      </div>
      {/* BEGIN: Delete Confirmation Modal */}
      {deleteConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-5 text-center">
              <XCircle className="w-16 h-16 mx-auto mt-3 text-red-600" />
              <div className="mt-5 text-3xl">Are you sure?</div>
              <div className="mt-2 text-slate-500">
                Do you really want to reject this withdrawal? <br />
                This process cannot be undone.
              </div>
            </div>
            <div className="px-5 pb-8 text-center">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmationModal(false);
                }}
                className="w-24 mr-1 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                className="w-24 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                ref={deleteButtonRef}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
      {/* END: Delete Confirmation Modal */}
    </>
  );
}

export default Main;