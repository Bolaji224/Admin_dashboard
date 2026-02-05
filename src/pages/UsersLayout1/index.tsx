import { useEffect, useState } from "react";
import axios from "@/utils/axios"; // Ensure baseURL points to your API
import Button from "@/components/Base/Button";
import Pagination from "@/components/Base/Pagination";
import { FormInput, FormSelect } from "@/components/Base/Form";
import Progress from "@/components/Base/Progress";
import Lucide from "@/components/Base/Lucide";
import Tippy from "@/components/Base/Tippy";
import { Menu } from "@/components/Base/Headless";
import { useNavigate } from "react-router-dom";


interface Employer {
  id: number;
  name: string | null;
  email: string;
  avatar?: string | null;
}

function Main() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();


  // 🔹 FETCH EMPLOYERS
 const fetchEmployers = async () => {
  setLoading(true);
  try {
    const res = await axios.get("/v1/admin/employers", {  // ✅ Added /v1
      headers: {
        "x-api-key": "secret123",
      },
    });

    setEmployers(Array.isArray(res.data?.data) ? res.data.data : []);
  } catch (error: any) {
    console.error("API ERROR:", error.response?.data || error.message);
    setEmployers([]);
  } finally {
    setLoading(false);
  }
};

  // 🔹 CALL API ON LOAD
  useEffect(() => {
    fetchEmployers();
  }, []);

  // 🔹 FILTER EMPLOYERS BASED ON SEARCH
  const filteredEmployers = employers.filter((emp) => {
    const name = emp.name ?? "";
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">
        Employers ({filteredEmployers.length})
      </h2>

      <div className="grid grid-cols-12 gap-6 mt-5">
        {/* HEADER */}
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y sm:flex-nowrap">
          <Button variant="primary" className="mr-2 shadow-md">
            Add New Employer
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
                  <div className="w-24 h-24 lg:w-12 lg:h-12 image-fit lg:mr-1">
                    <img
                      alt={emp.name || "Employer"}
                      className="rounded-full"
                      src={
                        emp.avatar ??
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          emp.name || "Employer"
                        )}`
                      }
                    />
                  </div>

                  <div className="mt-3 text-center lg:ml-2 lg:mr-auto lg:text-left lg:mt-0">
                    <div className="font-medium">{emp.name || "No Name"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{emp.email}</div>
                  </div>

                  <div className="flex mt-3 lg:mt-0">
                    <Tippy content="Suspend Employer">
                      <button className="flex items-center justify-center w-8 h-8 border rounded-full text-slate-400">
                        <Lucide icon="Ban" className="w-4 h-4" />
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

                  <Button variant="primary" className="px-2 py-1 mr-2">
                    Message
                  </Button>
                  <Button
  variant="outline-secondary"
  className="px-2 py-1"
  onClick={() => navigate("/profile-overview-3")}
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
    </>
  );
}

export default Main;