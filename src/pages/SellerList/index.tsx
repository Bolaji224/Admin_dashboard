import _ from "lodash";
import { useState, useRef } from "react";
import { Printer, FileText, Search, Plus, CheckSquare, Trash2, XCircle, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Briefcase, MapPin, Clock } from "lucide-react";

// Mock data for jobs
const mockJobs = Array.from({ length: 9 }, (_, i) => ({
  id: `JOB${3000 + i}`,
  title: [
    'Senior Frontend Developer',
    'Backend Engineer',
    'Full Stack Developer',
    'UI/UX Designer',
    'DevOps Engineer',
    'Product Manager',
    'Data Analyst',
    'Mobile Developer',
    'QA Engineer'
  ][i],
  company: {
    name: `Company ${String.fromCharCode(65 + i)}`,
    logo: `https://ui-avatars.com/api/?name=Company+${String.fromCharCode(65 + i)}&background=random`,
    email: `hr@company${String.fromCharCode(97 + i)}.com`
  },
  location: ['New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA', 'Boston, MA'][Math.floor(Math.random() * 5)],
  type: ['Full-time', 'Part-time', 'Contract', 'Remote'][Math.floor(Math.random() * 4)],
  salary: `$${(Math.random() * 100 + 50).toFixed(0)}k - $${(Math.random() * 150 + 100).toFixed(0)}k`,
  applicants: Math.floor(Math.random() * 200 + 10),
  posted: `${Math.floor(Math.random() * 30 + 1)} days ago`,
  status: Math.random() > 0.3,
  department: ['Engineering', 'Design', 'Product', 'Marketing', 'Sales'][Math.floor(Math.random() * 5)],
  experience: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead'][Math.floor(Math.random() * 4)]
}));

function Main() {
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const deleteButtonRef = useRef(null);
 const [selectedJobs, setSelectedJobs] = useState<number[]>([]);

  

const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.checked) {
    setSelectedJobs(mockJobs.map((_, i) => i));
  } else {
    setSelectedJobs([]);
  }
};

const handleSelectJob = (index: number) => {
  if (selectedJobs.includes(index)) {
    setSelectedJobs(selectedJobs.filter(i => i !== index));
  } else {
    setSelectedJobs([...selectedJobs, index]);
  }
};


  return (
    <>
      <h2 className="mt-10 text-lg font-medium intro-y">Job List</h2>
      <div className="grid grid-cols-12 gap-6 mt-5">
        <div className="flex flex-wrap items-center col-span-12 mt-2 intro-y xl:flex-nowrap">
          <button className="mr-2 shadow-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
            Add New Job
          </button>
          <div className="relative">
            <button className="px-2 border border-gray-300 bg-white hover:bg-gray-50 rounded-md h-10 w-10 flex items-center justify-center">
              <span className="flex items-center justify-center w-5 h-5">
                <Plus className="w-4 h-4" />
              </span>
            </button>
          </div>
          <div className="hidden mx-auto xl:block text-slate-500">
            Showing 1 to 10 of 150 entries
          </div>
          <div className="flex items-center w-full mt-3 xl:w-auto xl:mt-0">
            <div className="relative w-56 text-slate-500">
              <input
                type="text"
                className="w-56 pr-10 border border-gray-300 rounded-md px-3 py-2"
                placeholder="Search..."
              />
              <Search className="absolute inset-y-0 right-0 w-4 h-4 my-auto mr-3" />
            </div>
            <select className="w-56 ml-2 xl:w-auto border border-gray-300 rounded-md px-3 py-2 bg-white">
              <option>Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        {/* BEGIN: Data List */}
        <div className="col-span-12 overflow-auto intro-y 2xl:overflow-visible">
          <table className="w-full border-separate border-spacing-y-[10px] -mt-2">
            <thead>
              <tr>
                <th className="border-b-0 whitespace-nowrap px-5 py-3 text-left font-medium">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedJobs.length === mockJobs.length}
                  />
                </th>
                <th className="border-b-0 whitespace-nowrap px-5 py-3 text-left font-medium">
                  JOB TITLE
                </th>
                <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium">
                  DEPARTMENT
                </th>
                <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium">
                  LOCATION
                </th>
                <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium">
                  STATUS
                </th>
                <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium">
                  APPLICANTS
                </th>
                <th className="text-center border-b-0 whitespace-nowrap px-5 py-3 font-medium">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {mockJobs.map((job, index) => (
                <tr key={index} className="intro-x">
                  <td className="bg-white w-10 whitespace-nowrap rounded-l-[0.6rem] border-r-0 shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600">
                    <input 
                      type="checkbox"
                      checked={selectedJobs.includes(index)}
                      onChange={() => handleSelectJob(index)}
                    />
                  </td>
                  <td className="bg-white whitespace-nowrap border-x-0 !py-3.5 shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600">
                    <div className="flex items-center">
                      <div className="w-9 h-9 image-fit zoom-in">
                        <img
                          alt={job.company.name}
                          className="border-white rounded-lg shadow-[0px_0px_0px_2px_#fff,_1px_1px_5px_rgba(0,0,0,0.32)] dark:shadow-[0px_0px_0px_2px_#3f4865,_1px_1px_5px_rgba(0,0,0,0.32)]"
                          src={job.company.logo}
                        />
                      </div>
                      <div className="ml-4">
                        <a href="#" className="font-medium whitespace-nowrap">
                          {job.title}
                        </a>
                        <div className="text-slate-500 text-xs whitespace-nowrap mt-0.5">
                          {job.company.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="bg-white whitespace-nowrap border-x-0 shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600">
                    <div className="flex items-center justify-center">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-md">
                        {job.department}
                      </span>
                    </div>
                  </td>
                  <td className="bg-white whitespace-nowrap border-x-0 text-center shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600">
                    <div className="flex items-center justify-center text-sm">
                      <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                      {job.location}
                    </div>
                    <div className="flex items-center justify-center text-xs text-slate-500 mt-1">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {job.type}
                    </div>
                  </td>
                  <td className="bg-white w-40 whitespace-nowrap border-x-0 shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600">
                    <div
                      className={`flex items-center justify-center ${
                        job.status ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      {job.status ? "Active" : "Inactive"}
                    </div>
                  </td>
                  <td className="bg-white whitespace-nowrap border-x-0 text-center shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600">
                    <div className="font-semibold text-lg">{job.applicants}</div>
                    <div className="text-xs text-slate-500 flex items-center justify-center mt-0.5">
                      <Clock className="w-3 h-3 mr-1" />
                      {job.posted}
                    </div>
                  </td>
                  <td className="bg-white w-56 rounded-r-[0.6rem] border-l-0 shadow-[5px_3px_5px_#00000005] px-5 py-3 dark:bg-darkmode-600 relative before:absolute before:inset-y-0 before:left-0 before:my-auto before:block before:h-8 before:w-px before:bg-slate-200 before:dark:bg-darkmode-400">
                    <div className="flex items-center justify-center">
                      <a className="flex items-center mr-3 text-blue-600 hover:text-blue-800" href="#">
                        <CheckSquare className="w-4 h-4 mr-1" />
                        Edit
                      </a>
                      <a
                        className="flex items-center text-red-600 hover:text-red-800"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteConfirmationModal(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
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
                Do you really want to delete this job posting? <br />
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
                Delete
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