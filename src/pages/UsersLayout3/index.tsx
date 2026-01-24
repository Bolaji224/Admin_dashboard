import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import Button from "@/components/Base/Button";
import Pagination from "@/components/Base/Pagination";
import { FormInput, FormSelect } from "@/components/Base/Form";
import Lucide from "@/components/Base/Lucide";
import { Menu } from "@/components/Base/Headless";

/* ===================== TYPES ===================== */
interface Freelancer {
  id: number;
  name: string | null;
  title: string | null;
  bio: string | null;
  email?: string | null;
  avatar?: string | null;
}

/* ===================== COMPONENT ===================== */
function Main() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ===================== FETCH ===================== */
  const fetchFreelancers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/admin/freelancers", {
        headers: {
          "x-api-key": "secret123",
        },
      });

      setFreelancers(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error: any) {
      console.error("API ERROR:", error.response?.data || error.message);
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, []);

  /* ===================== SEARCH FILTER ===================== */
  const filteredFreelancers = freelancers.filter((f) => {
    const q = search.toLowerCase();

    return (
      (f.name ?? "").toLowerCase().includes(q) ||
      (f.title ?? "").toLowerCase().includes(q) ||
      (f.bio ?? "").toLowerCase().includes(q) ||
      (f.email ?? "").toLowerCase().includes(q)
    );
  });

  /* ===================== RENDER ===================== */
  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">
        Freelancers ({filteredFreelancers.length})
      </h2>

      <div className="grid grid-cols-12 gap-6 mt-5">
        {/* HEADER */}
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <Button variant="primary" className="mr-2 shadow-md">
            Add New Freelancer
          </Button>

          <Menu>
            <Menu.Button as={Button} className="px-2 !box">
              <Lucide icon="Plus" className="w-4 h-4" />
            </Menu.Button>
            <Menu.Items className="w-40">
              <Menu.Item>
                <Lucide icon="Users" className="w-4 h-4 mr-2" />
                Add Group
              </Menu.Item>
              <Menu.Item>
                <Lucide icon="MessageCircle" className="w-4 h-4 mr-2" />
                Send Message
              </Menu.Item>
            </Menu.Items>
          </Menu>

          <div className="hidden mx-auto md:block text-slate-500">
            Showing {filteredFreelancers.length} freelancers
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
            Loading freelancers...
          </div>
        ) : filteredFreelancers.length === 0 ? (
          <div className="col-span-12 py-10 text-center text-slate-500">
            No freelancers found
          </div>
        ) : (
          filteredFreelancers.map((f) => (
            <div
              key={f.id}
              className="col-span-12 intro-y md:col-span-6 lg:col-span-4"
            >
              <div className="box">
                <div className="flex items-start px-5 pt-5">
                  <div className="flex flex-col items-center w-full lg:flex-row">
                    <div className="w-16 h-16 image-fit">
                      <img
                        alt={f.name ?? "Freelancer"}
                        className="rounded-full"
                        src={
                          f.avatar ??
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            f.name ?? "User"
                          )}`
                        }
                      />
                    </div>

                    <div className="mt-3 text-center lg:ml-4 lg:text-left lg:mt-0">
                      <div className="font-medium">
                        {f.name ?? "Unnamed Freelancer"}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {f.title ?? "No title"}
                      </div>
                    </div>
                  </div>

                  <Menu className="absolute top-0 right-0 mt-3 mr-5">
                    <Menu.Button as="a" className="block w-5 h-5">
                      <Lucide
                        icon="MoreHorizontal"
                        className="w-5 h-5 text-slate-500"
                      />
                    </Menu.Button>
                    <Menu.Items className="w-40">
                      <Menu.Item>
                        <Lucide icon="FilePenLine" className="w-4 h-4 mr-2" />
                        Edit
                      </Menu.Item>
                      <Menu.Item>
                        <Lucide icon="Trash" className="w-4 h-4 mr-2" />
                        Delete
                      </Menu.Item>
                    </Menu.Items>
                  </Menu>
                </div>

                <div className="p-5 text-center lg:text-left">
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {f.bio ?? "No bio provided"}
                  </p>
                </div>

                <div className="p-5 text-center border-t lg:text-right border-slate-200/60">
                  <Button variant="primary" className="px-2 py-1 mr-2">
                    Message
                  </Button>
                  <Button variant="outline-secondary" className="px-2 py-1">
                    Profile
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* PAGINATION (UI only) */}
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
    </>
  );
}

export default Main;
