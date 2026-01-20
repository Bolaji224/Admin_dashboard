import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, User, DollarSign, MapPin, Eye, Ban, Flag, Search, Download } from "lucide-react";

interface ReportedUser {
  name: string;
  email: string;
  avatar: string;
  accountAge: string;
  totalTransactions: number;
}

interface ReportedBy {
  name: string;
  email: string;
}

interface FraudReport {
  id: string;
  reportDate: string;
  reportedUser: ReportedUser;
  reportedBy: ReportedBy;
  fraudType: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  amount: string;
  status: 'Pending Review' | 'Under Investigation' | 'Resolved' | 'Dismissed';
  description: string;
  location: string;
  ipAddress: string;
  evidence: number;
}

function Main() {
  const [selectedReport, setSelectedReport] = useState<FraudReport | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  // Mock data for fraud reports
  const fraudReports: FraudReport[] = [
    {
      id: "FR5001",
      reportDate: "2026-01-18",
      reportedUser: {
        name: "John Suspicious",
        email: "john.sus@example.com",
        avatar: "https://i.pravatar.cc/150?img=30",
        accountAge: "15 days",
        totalTransactions: 45
      },
      reportedBy: {
        name: "Alice Reporter",
        email: "alice@example.com"
      },
      fraudType: "Payment Fraud",
      severity: "High",
      amount: "$2,450.00",
      status: "Under Investigation",
      description: "Multiple chargebacks reported from different cards linked to same IP address",
      location: "Lagos, NG",
      ipAddress: "197.210.xxx.xxx",
      evidence: 3
    },
    {
      id: "FR5002",
      reportDate: "2026-01-17",
      reportedUser: {
        name: "Sarah Scammer",
        email: "sarah.scam@example.com",
        avatar: "https://i.pravatar.cc/150?img=31",
        accountAge: "3 days",
        totalTransactions: 12
      },
      reportedBy: {
        name: "Bob Victim",
        email: "bob@example.com"
      },
      fraudType: "Identity Theft",
      severity: "Critical",
      amount: "$5,200.00",
      status: "Pending Review",
      description: "User created multiple accounts with stolen identity documents",
      location: "Abuja, NG",
      ipAddress: "105.112.xxx.xxx",
      evidence: 5
    },
    {
      id: "FR5003",
      reportDate: "2026-01-16",
      reportedUser: {
        name: "Mike Fraudster",
        email: "mike.fraud@example.com",
        avatar: "https://i.pravatar.cc/150?img=32",
        accountAge: "45 days",
        totalTransactions: 78
      },
      reportedBy: {
        name: "Carol Detector",
        email: "carol@example.com"
      },
      fraudType: "Account Takeover",
      severity: "Medium",
      amount: "$890.00",
      status: "Resolved",
      description: "Unauthorized access detected from foreign IP addresses",
      location: "Port Harcourt, NG",
      ipAddress: "197.255.xxx.xxx",
      evidence: 2
    }
  ];

  const getSeverityColor = (severity: FraudReport['severity']): string => {
    switch(severity) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: FraudReport['status']): string => {
    switch(status) {
      case 'Pending Review': return 'text-amber-600';
      case 'Under Investigation': return 'text-blue-600';
      case 'Resolved': return 'text-green-600';
      case 'Dismissed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: FraudReport['status']): JSX.Element => {
    switch(status) {
      case 'Pending Review': return <Clock className="w-4 h-4" />;
      case 'Under Investigation': return <AlertTriangle className="w-4 h-4" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4" />;
      case 'Dismissed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <>
      <div className="flex items-center mt-8 intro-y">
        <h2 className="mr-auto text-lg font-medium flex items-center">
          <Shield className="w-6 h-6 mr-2 text-blue-600" />
          Fraud Reports Management
        </h2>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
          <div className="p-5 box">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-xs text-slate-500">Critical Reports</div>
                <div className="text-2xl font-medium mt-1">24</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
          <div className="p-5 box">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-xs text-slate-500">Pending Review</div>
                <div className="text-2xl font-medium mt-1">156</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
          <div className="p-5 box">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-xs text-slate-500">Resolved Today</div>
                <div className="text-2xl font-medium mt-1">89</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
          <div className="p-5 box">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-xs text-slate-500">Amount at Risk</div>
                <div className="text-2xl font-medium mt-1">$125k</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="col-span-12 intro-y">
          <div className="p-5 box">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Search by ID, user, or email..."
                />
              </div>
              <select 
                className="px-4 py-2 border border-gray-300 rounded-md bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Review</option>
                <option value="investigating">Under Investigation</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
              <select 
                className="px-4 py-2 border border-gray-300 rounded-md bg-white"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="col-span-12 intro-y">
          <div className="overflow-auto">
            {fraudReports.map((report, index) => (
              <div key={index} className="p-5 mb-3 box intro-y">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Left Section - User Info */}
                  <div className="flex items-start flex-1">
                    <img
                      src={report.reportedUser.avatar}
                      alt={report.reportedUser.name}
                      className="w-12 h-12 rounded-lg shadow-md"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-base">{report.reportedUser.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getSeverityColor(report.severity)}`}>
                          {report.severity}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">{report.reportedUser.email}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          Account: {report.reportedUser.accountAge}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {report.reportedUser.totalTransactions} transactions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section - Report Details */}
                  <div className="flex-1 lg:border-l lg:border-r lg:px-4 border-slate-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">Report ID</div>
                        <div className="font-medium text-sm mt-1">{report.id}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Fraud Type</div>
                        <div className="font-medium text-sm mt-1 flex items-center">
                          <Flag className="w-3 h-3 mr-1 text-red-500" />
                          {report.fraudType}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Amount</div>
                        <div className="font-semibold text-sm mt-1 text-red-600">{report.amount}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Location</div>
                        <div className="font-medium text-sm mt-1 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {report.location}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="text-xs text-slate-500">Description</div>
                      <div className="text-sm mt-1 text-slate-700">{report.description}</div>
                    </div>
                  </div>

                  {/* Right Section - Status & Actions */}
                  <div className="lg:w-48">
                    <div className={`flex items-center font-medium mb-3 ${getStatusColor(report.status)}`}>
                      {getStatusIcon(report.status)}
                      <span className="ml-2 text-sm">{report.status}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-1">Reported: {report.reportDate}</div>
                    <div className="text-xs text-slate-500 mb-3">{report.evidence} evidence files</div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                      <button className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm flex items-center justify-center">
                        <Ban className="w-4 h-4 mr-1" />
                        Ban User
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between mt-5 intro-y">
            <div className="text-slate-500 text-sm">
              Showing 1 to 3 of 150 entries
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-2 border border-gray-300 bg-blue-600 text-white rounded-md">
                1
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Fraud Report Details
                </h3>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-slate-500">Report ID</div>
                  <div className="font-medium mt-1">{selectedReport.id}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Reported Date</div>
                  <div className="font-medium mt-1">{selectedReport.reportDate}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Fraud Type</div>
                  <div className="font-medium mt-1">{selectedReport.fraudType}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Severity Level</div>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(selectedReport.severity)}`}>
                      {selectedReport.severity}
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 mt-4">
                <h4 className="font-semibold mb-3">Reported User Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500">Name</div>
                    <div className="font-medium mt-1">{selectedReport.reportedUser.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Email</div>
                    <div className="font-medium mt-1">{selectedReport.reportedUser.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">IP Address</div>
                    <div className="font-medium mt-1">{selectedReport.ipAddress}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Location</div>
                    <div className="font-medium mt-1">{selectedReport.location}</div>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 mt-4">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-slate-700">{selectedReport.description}</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                Mark as Resolved
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Main;