import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import Button from "@/components/Base/Button";
import Pagination from "@/components/Base/Pagination";
import { FormInput, FormSelect } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Dialog, Menu } from "@/components/Base/Headless";
import Table from "@/components/Base/Table";
import { FormCheck } from "@/components/Base/Form";
import axios from "@/utils/axios";
import moment from "moment";

function Main() {
  const [activeTab, setActiveTab] = useState<"deposits" | "withdrawals">("deposits");
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionModal, setActionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const actionButtonRef = useRef(null);

  const fetchDeposits = async () => {
    try {
      const res = await axios.get("/admin/payments", {
        headers: { "x-api-key": "secret123" },
      });
      setDeposits(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to fetch deposits:", err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await axios.get("/admin/withdrawals", {
        headers: { "x-api-key": "secret123" },
      });
      setWithdrawals(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to fetch withdrawals:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDeposits(), fetchWithdrawals()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const handleApprove = async () => {
    if (!selectedItem) return;
    try {
      if (activeTab === "deposits") {
        await axios.post("/admin/approve-payment", { payment_id: selectedItem.id }, {
          headers: { "x-api-key": "secret123" },
        });
        fetchDeposits();
      } else {
        await axios.post("/admin/approve-withdrawal", { withdrawal_id: selectedItem.id }, {
          headers: { "x-api-key": "secret123" },
        });
        fetchWithdrawals();
      }
    } catch (err) {
      console.error("Approve failed:", err);
    } finally {
      setActionModal(false);
      setSelectedItem(null);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    try {
      if (activeTab === "deposits") {
        await axios.post("/admin/reject-payment", { payment_id: selectedItem.id }, {
          headers: { "x-api-key": "secret123" },
        });
        fetchDeposits();
      } else {
        await axios.post("/admin/reject-withdrawal", { withdrawal_id: selectedItem.id }, {
          headers: { "x-api-key": "secret123" },
        });
        fetchWithdrawals();
      }
    } catch (err) {
      console.error("Reject failed:", err);
    } finally {
      setActionModal(false);
      setSelectedItem(null);
    }
  };

  const activeData = activeTab === "deposits" ? deposits : withdrawals;

  const filteredData = activeData.filter((item) => {
    const matchSearch =
      !search ||
      (item.user?.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (item.reference ?? "").toLowerCase().includes(search.toLowerCase()) ||
      String(item.id).includes(search);

    const matchStatus =
      !statusFilter ||
      (item.status ?? "").toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
      case "success":
        return "text-success";
      case "pending":
        return "text-warning";
      case "rejected":
      case "failed":
        return "text-danger";
      default:
        return "text-slate-500";
    }
  };

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Transaction List</h2>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mt-5 intro-y">
        {(["deposits", "withdrawals"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearch(""); setStatusFilter(""); }}
            className={clsx(
              "px-5 py-2 rounded-t-lg font-medium text-sm capitalize transition-all",
              activeTab === tab
                ? "bg-white border border-b-0 border-slate-200 text-primary shadow-sm dark:bg-darkmode-600"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-darkmode-700"
            )}
          >
            {tab === "deposits" ? "💰 Deposits" : "💸 Withdrawals"}
            <span className={clsx(
              "ml-2 px-2 py-0.5 rounded-full text-xs font-semibold",
              activeTab === tab ? "bg-primary text-white" : "bg-slate-300 text-slate-600"
            )}>
              {tab === "deposits" ? deposits.length : withdrawals.length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ── Filters ── */}
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y xl:flex-nowrap">
          <div className="flex w-full sm:w-auto gap-2">
            <div className="relative w-48 text-slate-500">
              <FormInput
                type="text"
                className="w-48 pr-10 !box"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Lucide icon="Search" className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
            </div>
            <FormSelect
              className="!box"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </FormSelect>
          </div>
          <div className="hidden mx-auto xl:block text-slate-500">
            Showing {filteredData.length} {activeTab}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="col-span-12 overflow-auto intro-y 2xl:overflow-visible">
          {loading ? (
            <div className="py-10 text-center text-slate-500">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              No {activeTab} found.
            </div>
          ) : (
            <Table className="border-spacing-y-[10px] border-separate -mt-2">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className="border-b-0 whitespace-nowrap">
                    <FormCheck.Input type="checkbox" />
                  </Table.Th>
                  <Table.Th className="border-b-0 whitespace-nowrap">REF / ID</Table.Th>
                  <Table.Th className="border-b-0 whitespace-nowrap">USER</Table.Th>
                  <Table.Th className="border-b-0 whitespace-nowrap text-center">STATUS</Table.Th>
                  <Table.Th className="border-b-0 whitespace-nowrap">DATE</Table.Th>
                  <Table.Th className="border-b-0 whitespace-nowrap text-right">
                    <div className="pr-16">AMOUNT</div>
                  </Table.Th>
                  <Table.Th className="border-b-0 whitespace-nowrap text-center">ACTIONS</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredData.map((item, i) => (
                  <Table.Tr key={item.id ?? i} className="intro-x">
                    <Table.Td className="box w-10 whitespace-nowrap rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                      <FormCheck.Input type="checkbox" />
                    </Table.Td>

                    {/* Ref */}
                    <Table.Td className="box w-40 whitespace-nowrap rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                      <span className="underline decoration-dotted text-primary">
                        #{item.reference ?? item.id}
                      </span>
                    </Table.Td>

                    {/* User */}
                    <Table.Td className="box w-44 whitespace-nowrap rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                      <div className="font-medium">{item.user?.name ?? item.name ?? "—"}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{item.user?.email ?? item.email ?? ""}</div>
                    </Table.Td>

                    {/* Status */}
                    <Table.Td className="box whitespace-nowrap rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                      <div className={clsx("flex items-center justify-center font-medium capitalize", getStatusColor(item.status))}>
                        <Lucide icon="CheckSquare" className="w-4 h-4 mr-1" />
                        {item.status ?? "Pending"}
                      </div>
                    </Table.Td>

                    {/* Date */}
                    <Table.Td className="box whitespace-nowrap rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                      <div>{moment(item.created_at).format("DD MMM YYYY")}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{moment(item.created_at).format("h:mm A")}</div>
                    </Table.Td>

                    {/* Amount */}
                    <Table.Td className="box w-40 whitespace-nowrap rounded-l-none rounded-r-none border-x-0 text-right shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600">
                      <div className="pr-16 font-semibold">
                        ₦{Number(item.amount ?? 0).toLocaleString()}
                      </div>
                    </Table.Td>

                    {/* Actions */}
                    <Table.Td className={clsx([
                      "box rounded-l-none rounded-r-none border-x-0 shadow-[5px_3px_5px_#00000005] first:rounded-l-[0.6rem] first:border-l last:rounded-r-[0.6rem] last:border-r dark:bg-darkmode-600",
                      "before:absolute before:inset-y-0 before:left-0 before:my-auto before:block before:h-8 before:w-px before:bg-slate-200 before:dark:bg-darkmode-400",
                    ])}>
                      <div className="flex items-center justify-center gap-3">
                        {item.status?.toLowerCase() === "pending" ? (
                          <>
                            <button
                              onClick={() => { setSelectedItem(item); setActionType("approve"); setActionModal(true); }}
                              className="flex items-center text-success whitespace-nowrap text-sm font-medium hover:underline"
                            >
                              <Lucide icon="CheckSquare" className="w-4 h-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => { setSelectedItem(item); setActionType("reject"); setActionModal(true); }}
                              className="flex items-center text-danger whitespace-nowrap text-sm font-medium hover:underline"
                            >
                              <Lucide icon="XCircle" className="w-4 h-4 mr-1" />
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={clsx("text-sm font-medium capitalize", getStatusColor(item.status))}>
                            {item.status}
                          </span>
                        )}
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </div>

        {/* ── Pagination ── */}
        <div className="flex flex-wrap items-center col-span-12 intro-y sm:flex-row sm:flex-nowrap">
          <Pagination className="w-full sm:w-auto sm:mr-auto">
            <Pagination.Link>
              <Lucide icon="ChevronsLeft" className="w-4 h-4" />
            </Pagination.Link>
            <Pagination.Link>
              <Lucide icon="ChevronLeft" className="w-4 h-4" />
            </Pagination.Link>
            <Pagination.Link active>1</Pagination.Link>
            <Pagination.Link>
              <Lucide icon="ChevronRight" className="w-4 h-4" />
            </Pagination.Link>
            <Pagination.Link>
              <Lucide icon="ChevronsRight" className="w-4 h-4" />
            </Pagination.Link>
          </Pagination>
          <FormSelect className="w-20 mt-3 !box sm:mt-0">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </FormSelect>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      <Dialog
        open={actionModal}
        onClose={() => { setActionModal(false); setSelectedItem(null); }}
        initialFocus={actionButtonRef}
      >
        <Dialog.Panel>
          <div className="p-5 text-center">
            <Lucide
              icon={actionType === "approve" ? "CheckCircle" : "XCircle"}
              className={clsx("w-16 h-16 mx-auto mt-3", actionType === "approve" ? "text-success" : "text-danger")}
            />
            <div className="mt-5 text-3xl">
              {actionType === "approve" ? "Approve?" : "Reject?"}
            </div>
            <div className="mt-2 text-slate-500">
              {actionType === "approve"
                ? `Approve this ${activeTab === "deposits" ? "deposit" : "withdrawal"} of ₦${Number(selectedItem?.amount ?? 0).toLocaleString()}?`
                : `Reject this ${activeTab === "deposits" ? "deposit" : "withdrawal"} of ₦${Number(selectedItem?.amount ?? 0).toLocaleString()}?`}
            </div>
          </div>
          <div className="px-5 pb-8 text-center flex justify-center gap-3">
            <Button
              variant="outline-secondary"
              onClick={() => { setActionModal(false); setSelectedItem(null); }}
              className="w-24"
            >
              Cancel
            </Button>
            <Button
              ref={actionButtonRef}
              variant={actionType === "approve" ? "success" : "danger"}
              onClick={actionType === "approve" ? handleApprove : handleReject}
              className="w-24"
            >
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
}

export default Main;