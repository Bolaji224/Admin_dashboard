import React, { useState, useEffect } from 'react';
import axiosAdmin from '../../utils/axios';
import {
  Search,
  CheckSquare,
  Trash2,
  XCircle,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  DollarSign,
  User,
} from 'lucide-react';

interface Withdrawal {
  id: number;
  user_id: number;
  wallet_id: number;
  amount: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: 'pending' | 'approved' | 'rejected';
  reference: string;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
  };
}

interface PaginatedResponse {
  data: Withdrawal[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const AdminWithdrawalsPanel: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [approveConfirmation, setApproveConfirmation] = useState<Withdrawal | null>(null);
  const [rejectConfirmation, setRejectConfirmation] = useState<{
    withdrawal: Withdrawal | null;
    reason: string;
  }>({
    withdrawal: null,
    reason: '',
  });
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchWithdrawals(1);
  }, [filterStatus]);

  const fetchWithdrawals = async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        status: filterStatus,
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axiosAdmin.get(`/v1/admin/withdrawals?${params.toString()}`);

      if (response?.data?.data) {
        const paginatedData = response.data as PaginatedResponse;
        setWithdrawals(paginatedData.data);
        setCurrentPage(paginatedData.current_page);
        setLastPage(paginatedData.last_page);
        setTotalWithdrawals(paginatedData.total);
      } else if (Array.isArray(response.data)) {
        setWithdrawals(response.data);
        setLastPage(1);
        setTotalWithdrawals(response.data.length);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      alert('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const approveWithdrawal = async (withdrawal: Withdrawal) => {
    setProcessingId(withdrawal.id);
    try {
      const response = await axiosAdmin.post('/v1/admin/approve-withdrawal', {
        withdrawal_id: withdrawal.id,
      });

      if (response?.data?.status === 'success') {
        alert(`✓ Withdrawal approved!\n₦${parseFloat(withdrawal.amount).toLocaleString()} will be sent to ${withdrawal.account_name}\n\nBank: ${withdrawal.bank_name}\nAccount: ${withdrawal.account_number}`);
        setApproveConfirmation(null);
        fetchWithdrawals(currentPage);
      } else {
        alert(`✗ Error: ${response?.data?.error || 'Failed to approve withdrawal'}`);
      }
    } catch (error: any) {
      console.error('Error approving withdrawal:', error);
      alert(`✗ Error: ${error?.response?.data?.error || error?.message || 'Failed to approve withdrawal'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const rejectWithdrawal = async () => {
    if (!rejectConfirmation.reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    const withdrawal = rejectConfirmation.withdrawal!;
    setProcessingId(withdrawal.id);

    try {
      const response = await axiosAdmin.post('/v1/admin/reject-withdrawal', {
        withdrawal_id: withdrawal.id,
        reason: rejectConfirmation.reason,
      });

      if (response?.data?.status === 'success') {
        alert('✓ Withdrawal rejected successfully');
        setRejectConfirmation({ withdrawal: null, reason: '' });
        fetchWithdrawals(currentPage);
      } else {
        alert(`✗ Error: ${response?.data?.error || 'Failed to reject withdrawal'}`);
      }
    } catch (error: any) {
      console.error('Error rejecting withdrawal:', error);
      alert(`✗ Error: ${error?.response?.data?.error || error?.message || 'Failed to reject withdrawal'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchWithdrawals(1);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-amber-600';
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Pending Withdrawals</h2>

      <div className="grid grid-cols-12 gap-6 mt-5">
        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as any);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Statuses</option>
          </select>

          <div className="hidden mx-auto md:block text-slate-500 text-sm">
            Showing {withdrawals.length} of {totalWithdrawals} entries
          </div>

          <div className="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-0">
            <div className="relative w-56 text-slate-500">
              <input
                type="text"
                className="w-56 pr-10 border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Search user, reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search
                className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3 cursor-pointer"
                onClick={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block col-span-12 overflow-auto intro-y">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading withdrawals...</p>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No withdrawals found</p>
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-y-[10px] -mt-2">
              <thead>
                <tr>
                  <th className="border-b-0 whitespace-nowrap px-5 py-3 text-left font-medium text-xs uppercase">
                    User
                  </th>
                  <th className="border-b-0 whitespace-nowrap px-5 py-3 text-left font-medium text-xs uppercase">
                    Reference
                  </th>
                  <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium text-xs uppercase">
                    Amount
                  </th>
                  <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium text-xs uppercase">
                    Bank Details
                  </th>
                  <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium text-xs uppercase">
                    Date
                  </th>
                  <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium text-xs uppercase">
                    Status
                  </th>
                  <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium text-xs uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="intro-x">
                    <td className="bg-white rounded-l-[0.6rem] shadow-[5px_3px_5px_#00000005] px-5 py-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {withdrawal.user?.avatar ? (
                            <img
                              src={withdrawal.user.avatar}
                              alt={withdrawal.user.first_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="ml-4 max-w-[150px]">
                          <div className="font-medium whitespace-nowrap truncate">
                            {withdrawal.user?.first_name} {withdrawal.user?.last_name}
                          </div>
                          <div className="text-slate-500 text-xs whitespace-nowrap truncate">
                            {withdrawal.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="bg-white shadow-[5px_3px_5px_#00000005] px-5 py-3">
                      <span className="font-mono text-xs text-slate-600">{withdrawal.reference}</span>
                    </td>

                    <td className="bg-white text-center shadow-[5px_3px_5px_#00000005] px-5 py-3">
                      <span className="font-semibold text-lg text-green-600">
                        ₦{parseFloat(withdrawal.amount).toLocaleString()}
                      </span>
                    </td>

                    <td className="bg-white text-center shadow-[5px_3px_5px_#00000005] px-5 py-3">
                      <div className="text-left bg-slate-50 p-2 rounded border border-slate-200 text-xs max-w-[200px]">
                        <div className="font-semibold mb-1">Bank Details:</div>
                        <div>
                          <span className="font-medium">Bank:</span> {withdrawal.bank_name}
                        </div>
                        <div>
                          <span className="font-medium">Name:</span> {withdrawal.account_name}
                        </div>
                        <div>
                          <span className="font-medium">Account:</span> {withdrawal.account_number}
                        </div>
                      </div>
                    </td>

                    <td className="bg-white text-center shadow-[5px_3px_5px_#00000005] px-5 py-3">
                      <div className="text-xs">{formatDate(withdrawal.created_at)}</div>
                    </td>

                    <td className="bg-white shadow-[5px_3px_5px_#00000005] px-5 py-3">
                      <div className={`flex items-center justify-center ${getStatusColor(withdrawal.status)}`}>
                        <CheckSquare className="w-4 h-4 mr-2" />
                        {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                      </div>
                    </td>

                    <td className="bg-white rounded-r-[0.6rem] shadow-[5px_3px_5px_#00000005] px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {withdrawal.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => setApproveConfirmation(withdrawal)}
                              disabled={processingId === withdrawal.id}
                              className="flex items-center text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 px-2 py-1"
                            >
                              <DollarSign className="w-3 h-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectConfirmation({ withdrawal, reason: '' })}
                              disabled={processingId === withdrawal.id}
                              className="flex items-center text-xs text-red-600 hover:text-red-800 disabled:text-gray-400 px-2 py-1"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {withdrawal.status === 'approved' ? 'Processed' : 'Rejected'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden col-span-12 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading withdrawals...</p>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No withdrawals found</p>
            </div>
          ) : (
            withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {withdrawal.user?.avatar ? (
                        <img
                          src={withdrawal.user.avatar}
                          alt={withdrawal.user.first_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {withdrawal.user?.first_name} {withdrawal.user?.last_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{withdrawal.user?.email}</div>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 whitespace-nowrap ${getStatusColor(withdrawal.status)}`}>
                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span className="font-semibold text-green-600">₦{parseFloat(withdrawal.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference:</span>
                    <span className="font-mono text-xs text-gray-600">{withdrawal.reference}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <div className="font-semibold text-xs mb-2">Bank Details:</div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div>Bank: {withdrawal.bank_name}</div>
                      <div>Name: {withdrawal.account_name}</div>
                      <div>Account: {withdrawal.account_number}</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="text-xs text-gray-900">{formatDate(withdrawal.created_at)}</span>
                  </div>
                </div>

                {withdrawal.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setApproveConfirmation(withdrawal)}
                      disabled={processingId === withdrawal.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:bg-gray-400"
                    >
                      <DollarSign className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectConfirmation({ withdrawal, reason: '' })}
                      disabled={processingId === withdrawal.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:bg-gray-400"
                    >
                      <Trash2 className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center col-span-12 intro-y justify-center sm:justify-start">
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => {
                  setCurrentPage(1);
                  fetchWithdrawals(1);
                }}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const p = Math.max(1, currentPage - 1);
                  setCurrentPage(p);
                  fetchWithdrawals(p);
                }}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                  const page = currentPage + i - 2;
                  return page > 0 && page <= lastPage ? (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        fetchWithdrawals(page);
                      }}
                      className={`px-3 py-2 border border-gray-300 text-sm ${
                        currentPage === page ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ) : null;
                })}
              </div>

              <div className="sm:hidden flex items-center px-3 py-2 border border-gray-300 bg-white text-sm">
                {currentPage} / {lastPage}
              </div>

              <button
                onClick={() => {
                  const p = Math.min(lastPage, currentPage + 1);
                  setCurrentPage(p);
                  fetchWithdrawals(p);
                }}
                disabled={currentPage === lastPage}
                className="p-2 border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentPage(lastPage);
                  fetchWithdrawals(lastPage);
                }}
                disabled={currentPage === lastPage}
                className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Approve Confirmation Modal */}
      {approveConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-5 text-center">
              <CheckSquare className="w-16 h-16 mx-auto mt-3 text-green-600" />
              <div className="mt-5 text-2xl font-semibold">Approve Withdrawal?</div>
              <div className="mt-2 text-slate-500">
                Transfer ₦{parseFloat(approveConfirmation.amount).toLocaleString()} to:
                <br />
                <strong>{approveConfirmation.account_name}</strong>
                <br />
                {approveConfirmation.bank_name} - {approveConfirmation.account_number}
              </div>
            </div>
            <div className="px-5 pb-8 text-center flex gap-3 justify-center">
              <button
                onClick={() => setApproveConfirmation(null)}
                disabled={processingId === approveConfirmation.id}
                className="px-6 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => approveWithdrawal(approveConfirmation)}
                disabled={processingId === approveConfirmation.id}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md"
              >
                {processingId === approveConfirmation.id ? 'Processing...' : 'Approve & Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectConfirmation.withdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-5">
              <div className="text-center">
                <XCircle className="w-16 h-16 mx-auto mt-3 text-red-600" />
                <div className="mt-5 text-2xl font-semibold">Reject Withdrawal?</div>
                <div className="mt-2 text-slate-500">
                  Withdrawing ₦{parseFloat(rejectConfirmation.withdrawal.amount).toLocaleString()} to{' '}
                  <strong>{rejectConfirmation.withdrawal.account_name}</strong>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (required)
                </label>
                <textarea
                  value={rejectConfirmation.reason}
                  onChange={(e) =>
                    setRejectConfirmation({ ...rejectConfirmation, reason: e.target.value })
                  }
                  placeholder="Please explain why this withdrawal is being rejected..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {rejectConfirmation.reason.length}/500 characters
                </p>
              </div>
            </div>

            <div className="px-5 pb-8 flex gap-3 justify-center">
              <button
                onClick={() => setRejectConfirmation({ withdrawal: null, reason: '' })}
                disabled={!!processingId}
                className="px-6 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={rejectWithdrawal}
                disabled={!!processingId || !rejectConfirmation.reason.trim()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md"
              >
                {processingId === rejectConfirmation.withdrawal?.id ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminWithdrawalsPanel;