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
} from 'lucide-react';

interface Employer {
  id: number;
  name: string;
  email: string;
}

interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Milestone {
  id: number;
  title: string;
  percentage: number;
  amount: number;
  status: string;
}

interface Payment {
  id: number;
  employer_id: number;
  candidate_id: number;
  amount: string;
  employer_pays_total?: string;
  freelancer_receives?: string;
  platform_commission?: string;
  platform_fee?: string;
  platform_vat?: string;
  type: 'escrow' | 'milestone';
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  payment_method: string;
  paid_at: string | null;
  created_at: string;
  employer?: Employer;
  candidate?: Candidate;
  milestones?: Milestone[];
}

interface PaginatedResponse {
  data: Payment[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

// Fee Breakdown Badge Component
const FeeBreakdownBadge: React.FC<{ payment: Payment }> = ({ payment }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const baseAmount = parseFloat(payment.amount);
  const employerTotal = payment.employer_pays_total ? parseFloat(payment.employer_pays_total) : baseAmount;
  const freelancerReceives = payment.freelancer_receives ? parseFloat(payment.freelancer_receives) : baseAmount;
  const platformCommission = payment.platform_commission ? parseFloat(payment.platform_commission) : 0;
  const platformFee = payment.platform_fee ? parseFloat(payment.platform_fee) : 0;
  const platformVAT = payment.platform_vat ? parseFloat(payment.platform_vat) : 0;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-blue-600 hover:text-blue-800 underline"
      >
        {showDetails ? 'Hide' : 'Show'} Fees
      </button>

      {showDetails && (
        <div className="absolute z-10 top-6 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-xs w-64">
          <div className="font-semibold text-gray-800 mb-2 border-b pb-1">Fee Breakdown</div>
          
          {/* Base Amount */}
          <div className="flex justify-between text-gray-700 mb-1">
            <span>Base Amount:</span>
            <span className="font-medium">₦{baseAmount.toLocaleString()}</span>
          </div>

          {/* Employer Side */}
          <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2 mb-2">
            <div className="font-semibold text-blue-800 mb-1 text-[10px]">EMPLOYER PAYS</div>
            <div className="flex justify-between text-gray-600">
              <span>Platform Fee (5%):</span>
              <span>₦{platformFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>VAT on Fee:</span>
              <span>₦{(platformFee * 0.075).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-blue-700 mt-1 pt-1 border-t border-blue-300">
              <span>Total Paid:</span>
              <span>₦{employerTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Freelancer Side */}
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <div className="font-semibold text-green-800 mb-1 text-[10px]">FREELANCER RECEIVES</div>
            <div className="flex justify-between text-gray-600">
              <span>Commission (20%):</span>
              <span className="text-red-600">-₦{platformCommission.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>VAT on Commission:</span>
              <span className="text-red-600">-₦{(platformCommission * 0.075).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-green-700 mt-1 pt-1 border-t border-green-300">
              <span>Net Received:</span>
              <span>₦{freelancerReceives.toLocaleString()}</span>
            </div>
          </div>

          {/* Platform Total */}
          {platformVAT > 0 && (
            <div className="mt-2 pt-2 border-t text-gray-500">
              <div className="flex justify-between">
                <span>Platform Total:</span>
                <span className="font-medium">₦{(platformCommission + platformFee + platformVAT).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AdminPaymentsPanel: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('pending');
  const [filterType, setFilterType] = useState<'all' | 'escrow' | 'milestone'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectConfirmation, setRejectConfirmation] = useState<Payment | null>(null);
  const [approveConfirmation, setApproveConfirmation] = useState<Payment | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPayments(1);
  }, [filterStatus, filterType, searchQuery]);

  const fetchPayments = async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        status: filterStatus,
        type: filterType,
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await axiosAdmin.get(
        `/v1/admin/payments?${params.toString()}`
      );

      if (response?.data?.data) {
        const paginatedData = response.data as PaginatedResponse;
        setPayments(paginatedData.data);
        setCurrentPage(paginatedData.current_page);
        setLastPage(paginatedData.last_page);
      } else {
        console.error('Error loading payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (payment: Payment) => {
    setProcessingId(payment.id);
    try {
      const response = await axiosAdmin.post('/v1/admin/approve-payment', {
        payment_id: payment.id,
      });

      if (response?.data?.status === 'success') {
        const freelancerReceives = payment.freelancer_receives 
          ? parseFloat(payment.freelancer_receives).toLocaleString()
          : parseFloat(payment.amount).toLocaleString();
        
        alert(`✓ Payment approved!\n₦${freelancerReceives} released to ${payment.candidate?.first_name}`);
        setApproveConfirmation(null);
        fetchPayments(currentPage);
      } else {
        alert(`✗ Error: ${response?.data?.error || 'Failed to approve payment'}`);
      }
    } catch (error: any) {
      console.error('Error approving payment:', error);
      alert(`✗ Error: ${error?.response?.data?.error || error?.message || 'Failed to approve payment'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPayment = async (payment: Payment) => {
    setProcessingId(payment.id);
    try {
      const response = await axiosAdmin.post('/v1/admin/reject-payment', {
        payment_id: payment.id,
      });

      if (response?.data?.status === 'success') {
        alert('✓ Payment rejected successfully');
        setRejectConfirmation(null);
        fetchPayments(currentPage);
      } else {
        alert(`✗ Error: ${response?.data?.error || 'Failed to reject payment'}`);
      }
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      alert(`✗ Error: ${error?.response?.data?.error || error?.message || 'Failed to reject payment'}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredPayments = payments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-amber-600 bg-amber-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'escrow'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-purple-100 text-purple-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Pending Employer Payments</h2>
      
      {/* Filters Section */}
      <div className="grid grid-cols-12 gap-4 mt-5">
        <div className="col-span-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm w-full sm:w-auto"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="all">All Statuses</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as any);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm w-full sm:w-auto"
            >
              <option value="all">All Types</option>
              <option value="escrow">Escrow</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>

          {/* Entry Count */}
          <div className="hidden md:flex mx-auto text-slate-500 text-sm">
            Showing {payments.length} entries
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-auto sm:ml-auto">
            <div className="relative">
              <input
                type="text"
                className="w-full sm:w-56 pr-10 pl-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Search employer, candidate, ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block col-span-12 overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No payments found</p>
            </div>
          ) : (
            <table className="w-full border-separate border-spacing-y-[10px] -mt-2">
              <thead>
                <tr>
                  <th className="border-b-0 whitespace-nowrap px-3 py-3 text-left font-medium text-xs uppercase">
                    Employer
                  </th>
                  <th className="border-b-0 whitespace-nowrap px-3 py-3 text-left font-medium text-xs uppercase">
                    Candidate
                  </th>
                  <th className="border-b-0 whitespace-nowrap px-3 py-3 text-center font-medium text-xs uppercase">
                    Amount
                  </th>
                  <th className="border-b-0 whitespace-nowrap px-3 py-3 text-center font-medium text-xs uppercase">
                    Type
                  </th>
                  <th className="border-b-0 whitespace-nowrap px-3 py-3 text-center font-medium text-xs uppercase">
                    Reference
                  </th>
                  <th className="border-b-0 whitespace-nowrap px-3 py-3 text-center font-medium text-xs uppercase">
                    Date
                  </th>
                  <th className="border-b-0 whitespace-nowrap px-3 py-3 text-center font-medium text-xs uppercase">
                    Status
                  </th>
                  <th className="border-b-0 whitespace-nowrap px-3 py-3 text-center font-medium text-xs uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="intro-x">
                    <td className="bg-white rounded-l-[0.6rem] shadow-[5px_3px_5px_#00000005] px-3 py-3">
                      <div className="max-w-[150px]">
                        <div className="font-medium text-sm truncate">
                          {payment.employer?.name}
                        </div>
                        <div className="text-slate-500 text-xs truncate">
                          {payment.employer?.email}
                        </div>
                      </div>
                    </td>

                    <td className="bg-white shadow-[5px_3px_5px_#00000005] px-3 py-3">
                      <div className="max-w-[150px]">
                        <div className="font-medium text-sm truncate">
                          {payment.candidate?.first_name} {payment.candidate?.last_name}
                        </div>
                        <div className="text-slate-500 text-xs truncate">
                          {payment.candidate?.email}
                        </div>
                      </div>
                    </td>

                    <td className="bg-white text-center shadow-[5px_3px_5px_#00000005] px-3 py-3">
                      <div className="space-y-1">
                        <div className="font-semibold text-base text-green-600 whitespace-nowrap">
                          ₦{parseFloat(payment.amount).toLocaleString()}
                        </div>
                        {payment.employer_pays_total && (
                          <div className="text-xs text-gray-500">
                            Employer paid: ₦{parseFloat(payment.employer_pays_total).toLocaleString()}
                          </div>
                        )}
                        {payment.freelancer_receives && (
                          <div className="text-xs text-blue-600">
                            Candidate gets: ₦{parseFloat(payment.freelancer_receives).toLocaleString()}
                          </div>
                        )}
                        <FeeBreakdownBadge payment={payment} />
                      </div>
                    </td>

                    <td className="bg-white text-center shadow-[5px_3px_5px_#00000005] px-3 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getTypeBadge(payment.type)}`}>
                        {payment.type === 'escrow' ? 'Escrow' : 'Milestone'}
                      </span>
                      {payment.type === 'milestone' && payment.milestones && payment.milestones.length > 0 && (
                        <div className="mt-2 text-left bg-slate-50 p-2 rounded border border-slate-200 text-xs">
                          <div className="font-semibold text-slate-700 mb-1">Steps:</div>
                          {payment.milestones.map((m, idx) => (
                            <div key={m.id} className="text-slate-600 py-0.5">
                              {idx + 1}. {m.title} - {m.percentage}% (₦{parseFloat(m.amount.toString()).toLocaleString()})
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="bg-white text-center shadow-[5px_3px_5px_#00000005] px-3 py-3">
                      <div className="font-mono text-xs text-slate-600 max-w-[120px] truncate mx-auto" title={payment.reference}>
                        {payment.reference}
                      </div>
                    </td>

                    <td className="bg-white text-center shadow-[5px_3px_5px_#00000005] px-3 py-3">
                      <div className="text-xs whitespace-nowrap">{formatDate(payment.created_at)}</div>
                    </td>

                    <td className="bg-white shadow-[5px_3px_5px_#00000005] px-3 py-3">
                      <div className="flex items-center justify-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </td>

                    <td className="bg-white rounded-r-[0.6rem] shadow-[5px_3px_5px_#00000005] px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {payment.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => setApproveConfirmation(payment)}
                              disabled={processingId === payment.id}
                              className="flex items-center text-green-600 hover:text-green-800 disabled:text-gray-400 text-xs px-2 py-1"
                              title="Approve Payment"
                            >
                              <DollarSign className="w-3 h-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectConfirmation(payment)}
                              disabled={processingId === payment.id}
                              className="flex items-center text-red-600 hover:text-red-800 disabled:text-gray-400 text-xs px-2 py-1"
                              title="Reject Payment"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 text-xs">
                            {payment.status === 'completed' ? 'Approved' : 'Rejected'}
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

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden col-span-12 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No payments found</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-lg shadow-sm p-4 space-y-3">
                {/* Header with Status */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{payment.employer?.name}</div>
                    <div className="text-xs text-gray-500 truncate">{payment.employer?.email}</div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 whitespace-nowrap ${getStatusColor(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>

                {/* Details */}
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Candidate:</span>
                    <span className="font-medium text-gray-900 truncate ml-2">
                      {payment.candidate?.first_name} {payment.candidate?.last_name}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount:</span>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        ₦{parseFloat(payment.amount).toLocaleString()}
                      </div>
                      {payment.employer_pays_total && (
                        <div className="text-xs text-gray-500">
                          Paid: ₦{parseFloat(payment.employer_pays_total).toLocaleString()}
                        </div>
                      )}
                      {payment.freelancer_receives && (
                        <div className="text-xs text-blue-600">
                          Gets: ₦{parseFloat(payment.freelancer_receives).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fee Breakdown in Mobile */}
                  {(payment.platform_commission || payment.platform_fee) && (
                    <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 mb-1">Fee Breakdown</div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        {payment.platform_fee && (
                          <div>
                            <span className="text-gray-500">Employer Fee:</span>
                            <div className="font-medium">₦{parseFloat(payment.platform_fee).toLocaleString()}</div>
                          </div>
                        )}
                        {payment.platform_commission && (
                          <div>
                            <span className="text-gray-500">Platform Cut:</span>
                            <div className="font-medium">₦{parseFloat(payment.platform_commission).toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Type:</span>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(payment.type)}`}>
                      {payment.type === 'escrow' ? 'Escrow' : 'Milestone'}
                    </span>
                  </div>

                  {payment.type === 'milestone' && payment.milestones && payment.milestones.length > 0 && (
                    <div className="mt-2 bg-slate-50 p-3 rounded border border-slate-200">
                      <div className="font-semibold text-slate-700 text-xs mb-2">Milestone Steps:</div>
                      <div className="space-y-1">
                        {payment.milestones.map((m, idx) => (
                          <div key={m.id} className="text-xs text-slate-600 flex justify-between">
                            <span>{idx + 1}. {m.title}</span>
                            <span className="font-medium">{m.percentage}% (₦{parseFloat(m.amount.toString()).toLocaleString()})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Reference:</span>
                    <span className="font-mono text-xs text-gray-600 truncate ml-2">{payment.reference}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date:</span>
                    <span className="text-gray-900 text-xs">{formatDate(payment.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                {payment.status === 'pending' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setApproveConfirmation(payment)}
                      disabled={processingId === payment.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:bg-gray-400"
                    >
                      <DollarSign className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectConfirmation(payment)}
                      disabled={processingId === payment.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:bg-gray-400"
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
          <div className="col-span-12 flex items-center justify-center sm:justify-start">
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => fetchPayments(1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchPayments(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
                  const page = currentPage + i - 2;
                  return page > 0 && page <= lastPage ? (
                    <button
                      key={page}
                      onClick={() => fetchPayments(page)}
                      className={`px-3 py-2 border border-gray-300 text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white hover:bg-gray-50'
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
                onClick={() => fetchPayments(Math.min(lastPage, currentPage + 1))}
                disabled={currentPage === lastPage}
                className="p-2 border border-gray-300 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchPayments(lastPage)}
                disabled={currentPage === lastPage}
                className="p-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                title="Last Page"
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
              <div className="mt-5 text-2xl font-semibold">Approve Payment?</div>
              <div className="mt-2 text-slate-500">
                Release{' '}
                <strong className="text-green-600">
                  ₦{approveConfirmation.freelancer_receives 
                    ? parseFloat(approveConfirmation.freelancer_receives).toLocaleString()
                    : parseFloat(approveConfirmation.amount).toLocaleString()}
                </strong>{' '}
                to{' '}
                <strong>
                  {approveConfirmation.candidate?.first_name}{' '}
                  {approveConfirmation.candidate?.last_name}
                </strong>
                ?
              </div>
              {approveConfirmation.employer_pays_total && (
                <div className="mt-3 text-xs text-gray-500">
                  (Employer paid: ₦{parseFloat(approveConfirmation.employer_pays_total).toLocaleString()})
                </div>
              )}
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
                onClick={() => approvePayment(approveConfirmation)}
                disabled={processingId === approveConfirmation.id}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md"
              >
                {processingId === approveConfirmation.id ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-5 text-center">
              <XCircle className="w-16 h-16 mx-auto mt-3 text-red-600" />
              <div className="mt-5 text-2xl font-semibold">Are you sure?</div>
              <div className="mt-2 text-slate-500">
                Do you really want to reject this payment from{' '}
                <strong>{rejectConfirmation.employer?.name}</strong>?
                <br />
                <span className="text-sm text-red-600 mt-1 inline-block">This process cannot be undone.</span>
              </div>
            </div>
            <div className="px-5 pb-8 text-center flex gap-3 justify-center">
              <button
                onClick={() => setRejectConfirmation(null)}
                disabled={processingId === rejectConfirmation.id}
                className="px-6 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectPayment(rejectConfirmation)}
                disabled={processingId === rejectConfirmation.id}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md"
              >
                {processingId === rejectConfirmation.id ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPaymentsPanel;