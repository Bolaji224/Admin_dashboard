import _ from "lodash";
import clsx from "clsx";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import fakerData from "@/utils/faker";
import Button from "@/components/Base/Button";
import Pagination from "@/components/Base/Pagination";
import { FormInput, FormSelect } from "@/components/Base/Form";
import TinySlider, { TinySliderElement } from "@/components/Base/TinySlider";
import Lucide from "@/components/Base/Lucide";
import Tippy from "@/components/Base/Tippy";
import Litepicker from "@/components/Base/Litepicker";
import ReportDonutChart from "@/components/ReportDonutChart";
import ReportLineChart from "@/components/ReportLineChart";
import ReportPieChart from "@/components/ReportPieChart";
import ReportDonutChart1 from "@/components/ReportDonutChart1";
import SimpleLineChart1 from "@/components/SimpleLineChart1";
import LeafletMap from "@/components/LeafletMap";
import { Menu } from "@/components/Base/Headless";
import Table from "@/components/Base/Table";

function Main() {
  const [salesReportFilter, setSalesReportFilter] = useState<string>();
  const importantNotesRef = useRef<TinySliderElement>();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const prevImportantNotes = () => {
    importantNotesRef.current?.tns.goTo("prev");
  };
  const nextImportantNotes = () => {
    importantNotesRef.current?.tns.goTo("next");
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
  `${import.meta.env.VITE_API_URL}/admin/dashboard`,
        {
          headers: {
            "X-API-Key": "secret123",
          },
        }
      );

      setDashboardData(res.data);
    } catch (err: any) {
      console.error("Dashboard Fetch Error:", err);
      console.error("Error Response:", err.response?.data);
      console.error("Error Status:", err.response?.status);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-600 dark:text-slate-200">
        Loading dashboard...
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-10 text-center">
        <div className="text-red-500 mb-4">
          {error || "Failed to load dashboard data"}
        </div>
        <Button onClick={fetchDashboard} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  const { overview = {}, revenue = {}, recent_payments = [] } = dashboardData;

  return (
    <div className="grid grid-cols-12 gap-6">
  <div className="col-span-12">
        <div className="grid grid-cols-12 gap-6">
          {/* BEGIN: General Report */}
          <div className="col-span-12 mt-8">
            <div className="flex items-center h-10 intro-y">
              <h2 className="mr-5 text-lg font-medium truncate">
                General Report
              </h2>
              <button
                onClick={fetchDashboard}
                className="flex items-center ml-auto text-primary"
              >
                <Lucide icon="RefreshCcw" className="w-4 h-4 mr-3" /> Reload
                Data
              </button>
            </div>
            <div className="grid grid-cols-12 gap-6 mt-5">
              {/* JOBS POSTED */}
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div
                  className={clsx([
                    "relative zoom-in",
                    "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
                  ])}
                >
                  <div className="p-5 box">
                    <div className="flex">
                      <Lucide
                        icon="Briefcase"
                        className="w-[28px] h-[28px] text-primary"
                      />
                      <div className="ml-auto">
                        <Tippy
                          as="div"
                          className="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                          content="Total jobs posted"
                        >
                          <Lucide icon="ChevronUp" className="w-4 h-4 ml-0.5" />
                        </Tippy>
                      </div>
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {overview?.jobs ?? 0}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      Total Jobs Posted
                    </div>
                  </div>
                </div>
              </div>

              {/* APPLICATIONS */}
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div
                  className={clsx([
                    "relative zoom-in",
                    "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
                  ])}
                >
                  <div className="p-5 box">
                    <div className="flex">
                      <Lucide
                        icon="FileText"
                        className="w-[28px] h-[28px] text-pending"
                      />
                      <div className="ml-auto">
                        <Tippy
                          as="div"
                          className="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                          content="Total applications"
                        >
                          <Lucide icon="ChevronUp" className="w-4 h-4 ml-0.5" />
                        </Tippy>
                      </div>
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {overview?.applications ?? 0}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      Job Applications
                    </div>
                  </div>
                </div>
              </div>

              {/* EMPLOYERS */}
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div
                  className={clsx([
                    "relative zoom-in",
                    "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
                  ])}
                >
                  <div className="p-5 box">
                    <div className="flex">
                      <Lucide
                        icon="Building2"
                        className="w-[28px] h-[28px] text-warning"
                      />
                      <div className="ml-auto">
                        <Tippy
                          as="div"
                          className="cursor-pointer bg-danger py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                          content="Registered employers"
                        >
                          <Lucide
                            icon="ChevronDown"
                            className="w-4 h-4 ml-0.5"
                          />
                        </Tippy>
                      </div>
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {overview?.employers ?? 0}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      Registered Employers
                    </div>
                  </div>
                </div>
              </div>

              {/* CANDIDATES */}
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div
                  className={clsx([
                    "relative zoom-in",
                    "before:box before:absolute before:inset-x-3 before:mt-3 before:h-full before:bg-slate-50 before:content-['']",
                  ])}
                >
                  <div className="p-5 box">
                    <div className="flex">
                      <Lucide
                        icon="Users"
                        className="w-[28px] h-[28px] text-success"
                      />
                      <div className="ml-auto">
                        <Tippy
                          as="div"
                          className="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                          content="Registered candidates"
                        >
                          <Lucide icon="ChevronUp" className="w-4 h-4 ml-0.5" />
                        </Tippy>
                      </div>
                    </div>
                    <div className="mt-6 text-3xl font-medium leading-8">
                      {overview?.candidates ?? 0}
                    </div>
                    <div className="mt-1 text-base text-slate-500">
                      Registered Candidates
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* END: General Report */}

          {/* BEGIN: Sales Report */}
          <div className="col-span-12 mt-8 lg:col-span-6">
            <div className="items-center block h-10 intro-y sm:flex">
              <h2 className="mr-5 text-lg font-medium truncate">
                Revenue Report
              </h2>
              <div className="relative mt-3 sm:ml-auto sm:mt-0 text-slate-500">
                <Lucide
                  icon="Calendar"
                  className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3"
                />
                <Litepicker
                  value={salesReportFilter}
                  onChange={(e) => {
                    setSalesReportFilter(e.target.value);
                  }}
                  options={{
                    autoApply: false,
                    singleMode: false,
                    numberOfColumns: 2,
                    numberOfMonths: 2,
                    showWeekNumbers: true,
                    dropdowns: {
                      minYear: 1990,
                      maxYear: null,
                      months: true,
                      years: true,
                    },
                  }}
                  className="pl-10 sm:w-56 !box"
                />
              </div>
            </div>
            <div className="p-5 mt-12 intro-y box sm:mt-5">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex">
                  <div>
                    <div className="text-lg font-medium text-primary dark:text-slate-300 xl:text-xl">
                      ₦{revenue?.this_month ?? 0}
                    </div>
                    <div className="mt-0.5 text-slate-500">This Month</div>
                  </div>
                  <div className="w-px h-12 mx-4 border border-r border-dashed border-slate-200 dark:border-darkmode-300 xl:mx-5"></div>
                  <div>
                    <div className="text-lg font-medium text-slate-500 xl:text-xl">
                      ₦{revenue?.last_month ?? 0}
                    </div>
                    <div className="mt-0.5 text-slate-500">Last Month</div>
                  </div>
                </div>
                <Menu className="mt-5 md:ml-auto md:mt-0">
                  <Menu.Button
                    as={Button}
                    variant="outline-secondary"
                    className="font-normal"
                  >
                    Filter Revenue
                    <Lucide icon="ChevronDown" className="w-4 h-4 ml-2" />
                  </Menu.Button>
                  <Menu.Items className="w-44 h-40 overflow-y-auto">
                    <Menu.Item>Subscriptions</Menu.Item>
                    <Menu.Item>Employer Ads</Menu.Item>
                    <Menu.Item>Boosted Jobs</Menu.Item>
                    <Menu.Item>Candidate Premium</Menu.Item>
                  </Menu.Items>
                </Menu>
              </div>
              <div
                className={clsx([
                  "relative",
                  "before:content-[''] before:block before:absolute before:w-16 before:left-0 before:top-0 before:bottom-0 before:ml-10 before:mb-7 before:bg-gradient-to-r before:from-white before:via-white/80 before:to-transparent before:dark:from-darkmode-600",
                  "after:content-[''] after:block after:absolute after:w-16 after:right-0 after:top-0 after:bottom-0 after:mb-7 after:bg-gradient-to-l after:from-white after:via-white/80 after:to-transparent after:dark:from-darkmode-600",
                ])}
              >
                <ReportLineChart height={275} className="mt-6 -mb-6" />
              </div>
            </div>
          </div>
          {/* END: Sales Report */}

          {/* BEGIN: Weekly Top Seller */}
          <div className="col-span-12 mt-8 sm:col-span-6 lg:col-span-3">
            <div className="flex items-center h-10 intro-y">
              <h2 className="mr-5 text-lg font-medium truncate">
                Candidate Demographics
              </h2>
              <a href="#" className="ml-auto truncate text-primary">
                Show More
              </a>
            </div>
            <div className="p-5 mt-5 intro-y box">
              <div className="mt-3">
                <ReportPieChart height={213} />
              </div>
              <div className="mx-auto mt-8 w-52 sm:w-auto">
                <div className="flex items-center">
                  <div className="w-2 h-2 mr-3 rounded-full bg-primary"></div>
                  <span className="truncate">18 - 25 Years old</span>
                  <span className="ml-auto font-medium">48%</span>
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 mr-3 rounded-full bg-pending"></div>
                  <span className="truncate">26 - 40 Years old</span>
                  <span className="ml-auto font-medium">37%</span>
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 mr-3 rounded-full bg-warning"></div>
                  <span className="truncate">&gt;= 40 Years old</span>
                  <span className="ml-auto font-medium">15%</span>
                </div>
              </div>
            </div>
          </div>
          {/* END: Weekly Top Seller */}

          {/* BEGIN: Job Status */}
          <div className="col-span-12 mt-8 sm:col-span-6 lg:col-span-3">
            <div className="flex items-center h-10 intro-y">
              <h2 className="mr-5 text-lg font-medium truncate">
                Job Status Summary
              </h2>
              <a href="#" className="ml-auto truncate text-primary">
                Show More
              </a>
            </div>
            <div className="p-5 mt-5 intro-y box">
              <div className="mt-3">
                <ReportDonutChart height={213} />
              </div>
              <div className="mx-auto mt-8 w-52 sm:w-auto">
                <div className="flex items-center">
                  <div className="w-2 h-2 mr-3 rounded-full bg-primary"></div>
                  <span className="truncate">Active Jobs</span>
                  <span className="ml-auto font-medium">62%</span>
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 mr-3 rounded-full bg-pending"></div>
                  <span className="truncate">Pending Review</span>
                  <span className="ml-auto font-medium">23%</span>
                </div>
                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 mr-3 rounded-full bg-warning"></div>
                  <span className="truncate">Expired Jobs</span>
                  <span className="ml-auto font-medium">15%</span>
                </div>
              </div>
            </div>
          </div>
          {/* END: Job Status */}



          {/* BEGIN: Recent Payments */}

          {/* END: Recent Payments */}

          {/* BEGIN: General Stats */}
          <div className="grid grid-cols-12 col-span-12 gap-6 mt-8">
            <div className="col-span-12 sm:col-span-6 2xl:col-span-3 intro-y">
              <div className="p-5 box zoom-in">
                <div className="flex items-center">
                  <div className="flex-none w-2/4">
                    <div className="text-lg font-medium truncate">
                      Total Jobs
                    </div>
                    <div className="mt-1 text-slate-500">
                      {overview?.jobs ?? 0} Jobs
                    </div>
                  </div>
                  <div className="relative flex-none ml-auto">
                    <ReportDonutChart1 width={90} height={90} />
                    <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full font-medium">
                      {overview?.jobs ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-6 2xl:col-span-3 intro-y">
              <div className="p-5 box zoom-in">
                <div className="flex">
                  <div className="mr-3 text-lg font-medium truncate">
                    Applications
                  </div>
                  <div className="flex items-center px-2 py-1 ml-auto text-xs truncate rounded-full cursor-pointer bg-slate-100 dark:bg-darkmode-400 text-slate-500">
                    {overview?.applications ?? 0} Total
                  </div>
                </div>
                <div className="mt-1">
                  <SimpleLineChart1 height={58} className="-ml-1" />
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-6 2xl:col-span-3 intro-y">
              <div className="p-5 box zoom-in">
                <div className="flex items-center">
                  <div className="flex-none w-2/4">
                    <div className="text-lg font-medium truncate">
                      Employers
                    </div>
                    <div className="mt-1 text-slate-500">
                      {overview?.employers ?? 0} Registered
                    </div>
                  </div>
                  <div className="relative flex-none ml-auto">
                    <ReportDonutChart1 width={90} height={90} />
                    <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full font-medium">
                      {overview?.employers ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12 sm:col-span-6 2xl:col-span-3 intro-y">
              <div className="p-5 box zoom-in">
                <div className="flex">
                  <div className="mr-3 text-lg font-medium truncate">
                    Candidates
                  </div>
                  <div className="flex items-center px-2 py-1 ml-auto text-xs truncate rounded-full cursor-pointer bg-slate-100 dark:bg-darkmode-400 text-slate-500">
                    {overview?.candidates ?? 0} Registered
                  </div>
                </div>
                <div className="mt-1">
                  <SimpleLineChart1 height={58} className="-ml-1" />
                </div>
              </div>
            </div>
          </div>
          {/* END: General Stats */}

        
          {/* END: Weekly Top Products */}
        </div>
      </div>

   
    </div>
  );
}

export default Main;