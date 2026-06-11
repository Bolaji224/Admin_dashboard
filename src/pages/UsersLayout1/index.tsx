import { useEffect, useState, useCallback } from "react";
import axios from "@/utils/axios";
import Button from "@/components/Base/Button";
import Pagination from "@/components/Base/Pagination";
import { FormInput, FormSelect } from "@/components/Base/Form";
import Progress from "@/components/Base/Progress";
import Lucide from "@/components/Base/Lucide";
import Tippy from "@/components/Base/Tippy";
import { Dialog, Menu } from "@/components/Base/Headless";
import { useNavigate } from "react-router-dom";

interface Employer {
  id: number;
  name: string | null;
  email: string;
  avatar?: string | null;
  is_suspended?: boolean;
}

function Main() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [suspending, setSuspending] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employer | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const navigate = useNavigate();

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEmployers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("admin/employers");
      setEmployers(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error: any) {
      console.error("API ERROR:", error.response?.data || error.message);
      setEmployers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  const handleSuspend = async (id: number) => {
    setSuspending(id);
    try {
      const res = await axios.post(`admin/employers/${id}/suspend`);
      if (res.data?.status === "success") {
        setEmployers((prev) =>
          prev.map((e) => (e.id === id ? { ...e, is_suspended: true } : e))
        );
        showToast("Employer suspended.");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to suspend employer", false);
    } finally {
      setSuspending(null);
    }
  };

  const handleUnsuspend = async (id: number) => {
    setSuspending(id);
    try {
      const res = await axios.post(`admin/employers/${id}/unsuspend`);
      if (res.data?.status === "success") {
        setEmployers((prev) =>
          prev.map((e) => (e.id === id ? { ...e, is_suspended: false } : e))
        );
        showToast("Employer unsuspended.");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to unsuspend employer", false);
    } finally {
      setSuspending(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`admin/employers/${id}`);
      setEmployers((prev) => prev.filter((e) => e.id !== id));
      setDeleteTarget(null);
      showToast("Employer deleted.");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to delete employer", false);
      setDeleteTarget(null);
    }
  };

  const filteredEmployers = employers.filter((emp) => {
    const name = emp.name ?? "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
    );
  });

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

      <h2 className="mt-10 text-lg font-medium intro-y">
        Employers ({filteredEmployers.length})
      </h2>

      <div className="grid grid-cols-12 gap-6 mt-5">
        {/* HEADER */}
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <div className="hidden mx-auto md:block text-slate-500">
            Showing {filteredEmployers.length} employers
          </div>

          <div className="w-full mt-3 sm:w-auto sm:mt-0 sm:ml-auto md:ml-0">
            <div className="relative w-56 text-slate-500">
              <FormInput
                type="text"
                className="w-56 pr-10 !box"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Lucide
                icon="Search"
                className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3"
              />
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="col-span-12 py-10 text-center">
            <Lucide icon="Loader" className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
            Loading employers...
          </div>
        ) : filteredEmployers.length === 0 ? (
          <div className="col-span-12 py-10 text-center text-slate-500">
            No employers found
          </div>
        ) : (
          filteredEmployers.map((emp) => (
            <div key={emp.id} className="col-span-12 intro-y md:col-span-6">
              <div className="box">
                <div className="flex flex-col items-center p-5 border-b lg:flex-row border-slate-200/60">
                  <div className="w-24 h-24 lg:w-12 lg:h-12 image-fit lg:mr-1 flex-shrink-0">
                    <img
                      alt={emp.name || "Employer"}
                      className="rounded-full object-cover w-full h-full"
                      src={
                        emp.avatar ??
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          emp.name || "Employer"
                        )}&background=random`
                      }
                    />
                  </div>

                  <div className="mt-3 text-center lg:ml-2 lg:mr-auto lg:text-left lg:mt-0 min-w-0">
                    <div className="font-medium truncate">{emp.name || "No Name"}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{emp.email}</div>
                    {emp.is_suspended && (
                      <span className="text-xs font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                        Suspended
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 lg:mt-0 flex-shrink-0">
                    <Tippy content={emp.is_suspended ? "Unsuspend Employer" : "Suspend Employer"}>
                      <button
                        className={`flex items-center justify-center w-8 h-8 border rounded-full transition-colors ${
                          emp.is_suspended
                            ? "text-primary border-primary/40 hover:bg-primary/10"
                            : "text-warning border-warning/40 hover:bg-warning/10"
                        }`}
                        disabled={suspending === emp.id}
                        onClick={() =>
                          emp.is_suspended ? handleUnsuspend(emp.id) : handleSuspend(emp.id)
                        }
                      >
                        <Lucide
                          icon={emp.is_suspended ? "RefreshCw" : "Ban"}
                          className="w-4 h-4"
                        />
                      </button>
                    </Tippy>
                    <Tippy content="Delete Employer">
                      <button
                        className="flex items-center justify-center w-8 h-8 border border-danger/40 rounded-full text-danger hover:bg-danger/10 transition-colors"
                        onClick={() => setDeleteTarget(emp)}
                      >
                        <Lucide icon="Trash2" className="w-4 h-4" />
                      </button>
                    </Tippy>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center p-5 lg:flex-nowrap">
                  <div className="w-full mb-4 mr-auto lg:w-1/2 lg:mb-0">
                    <div className="flex text-xs text-slate-500">
                      <div className="mr-auto">Profile Completion</div>
                      <div>—</div>
                    </div>
                    <Progress className="h-1 mt-2">
                      <Progress.Bar className="w-1/2 bg-primary" />
                    </Progress>
                  </div>
                  <Button
                    variant="outline-secondary"
                    className="px-2 py-1"
                    onClick={() => navigate(`/admin/profile-overview-3/${emp.id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* PAGINATION */}
        <div className="flex flex-wrap items-center col-span-12 intro-y sm:flex-row sm:flex-nowrap">
          <Pagination className="w-full sm:w-auto sm:mr-auto">
            <Pagination.Link active>1</Pagination.Link>
          </Pagination>
          <FormSelect className="w-20 mt-3 !box sm:mt-0">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </FormSelect>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteTarget && (
        <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
          <Dialog.Panel>
            <div className="p-5 text-center">
              <Lucide icon="Trash2" className="w-16 h-16 mx-auto mt-3 text-danger" />
              <div className="mt-5 text-xl font-semibold">Are you sure?</div>
              <div className="mt-2 text-slate-500">
                Delete <strong>{deleteTarget.name || deleteTarget.email}</strong>? This cannot be undone.
              </div>
            </div>
            <div className="flex justify-center gap-3 px-5 pb-8">
              <Button variant="outline-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDelete(deleteTarget.id)}>
                Delete
              </Button>
            </div>
          </Dialog.Panel>
        </Dialog>
      )}
    </>
  );
}

export default Main;
