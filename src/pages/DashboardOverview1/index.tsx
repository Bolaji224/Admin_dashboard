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
      "http://localhost:8000/api/v1/admin/dashboard",
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
    <div className="grid grid-cols-12 gap-6 bg-slate-100/50 dark:bg-darkmode-700 p-6 rounded-xl min-h-screen">
      {/* MAIN SECTION */}
      <div className="col-span-12 2xl:col-span-9">
        <div className="grid grid-cols-12 gap-6">
          {/* HEADER */}
          <div className="col-span-12 mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:h-10 intro-y">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Workason Admin Dashboard
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Monitor job postings, applications, payments and platform
                  growth.
                </p>
              </div>

              <div className="flex items-center sm:ml-auto mt-4 sm:mt-0 gap-3">
                <Button className="flex items-center px-4 py-2 !box text-slate-600 dark:text-slate-300">
                  <Lucide icon="Download" className="w-4 h-4 mr-2" />
                  Export Report
                </Button>

                <Button className="flex items-center px-4 py-2 bg-primary text-white">
                  <Lucide icon="PlusCircle" className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              </div>
            </div>
          </div>

          {/* GENERAL REPORT */}
          <div className="col-span-12 mt-4">
            <div className="flex items-center h-10 intro-y">
              <h2 className="mr-5 text-lg font-semibold truncate text-slate-700 dark:text-slate-200">
                Platform Overview
              </h2>

              <button
                onClick={fetchDashboard}
                className="flex items-center ml-auto text-primary font-medium"
              >
                <Lucide icon="RefreshCcw" className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-12 gap-6 mt-5">
              {/* JOBS POSTED */}
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div className="relative zoom-in">
                  <div className="p-6 box rounded-xl shadow-sm border border-slate-200/50 dark:border-darkmode-400">
                    <div className="flex">
                      <Lucide
                        icon="Briefcase"
                        className="w-7 h-7 text-primary"
                      />
                      <div className="ml-auto">
                        <Tippy
                          as="div"
                          className="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                          content="Jobs total"
                        >
                          <Lucide
                            icon="ChevronUp"
                            className="w-4 h-4 ml-0.5"
                          />
                        </Tippy>
                      </div>
                    </div>

                    <div className="mt-6 text-3xl font-semibold text-slate-800 dark:text-slate-200">
                      {overview?.jobs ?? 0}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      Total Jobs Posted
                    </div>
                  </div>
                </div>
              </div>

              {/* APPLICATIONS */}
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div className="relative zoom-in">
                  <div className="p-6 box rounded-xl shadow-sm border border-slate-200/50 dark:border-darkmode-400">
                    <div className="flex">
                      <Lucide
                        icon="FileText"
                        className="w-7 h-7 text-pending"
                      />
                      <div className="ml-auto">
                        <Tippy
                          as="div"
                          className="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                          content="Applications total"
                        >
                          <Lucide
                            icon="ChevronUp"
                            className="w-4 h-4 ml-0.5"
                          />
                        </Tippy>
                      </div>
                    </div>

                    <div className="mt-6 text-3xl font-semibold text-slate-800 dark:text-slate-200">
                      {overview?.applications ?? 0}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      Job Applications
                    </div>
                  </div>
                </div>
              </div>

              {/* EMPLOYERS */}
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div className="relative zoom-in">
                  <div className="p-6 box rounded-xl shadow-sm border border-slate-200/50 dark:border-darkmode-400">
                    <div className="flex">
                      <Lucide
                        icon="Building2"
                        className="w-7 h-7 text-warning"
                      />
                      <div className="ml-auto">
                        <Tippy
                          as="div"
                          className="cursor-pointer bg-danger py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                          content="Employers total"
                        >
                          <Lucide
                            icon="ChevronDown"
                            className="w-4 h-4 ml-0.5"
                          />
                        </Tippy>
                      </div>
                    </div>

                    <div className="mt-6 text-3xl font-semibold text-slate-800 dark:text-slate-200">
                      {overview?.employers ?? 0}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      Registered Employers
                    </div>
                  </div>
                </div>
              </div>

              {/* CANDIDATES */}
              <div className="col-span-12 sm:col-span-6 xl:col-span-3 intro-y">
                <div className="relative zoom-in">
                  <div className="p-6 box rounded-xl shadow-sm border border-slate-200/50 dark:border-darkmode-400">
                    <div className="flex">
                      <Lucide icon="Users" className="w-7 h-7 text-success" />
                      <div className="ml-auto">
                        <Tippy
                          as="div"
                          className="cursor-pointer bg-success py-[3px] flex rounded-full text-white text-xs pl-2 pr-1 items-center font-medium"
                          content="Candidates total"
                        >
                          <Lucide
                            icon="ChevronUp"
                            className="w-4 h-4 ml-0.5"
                          />
                        </Tippy>
                      </div>
                    </div>

                    <div className="mt-6 text-3xl font-semibold text-slate-800 dark:text-slate-200">
                      {overview?.candidates ?? 0}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      Registered Candidates
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REVENUE REPORT */}
          <div className="col-span-12 mt-8 lg:col-span-6">
            <div className="items-center block h-10 intro-y sm:flex">
              <h2 className="mr-5 text-lg font-semibold truncate text-slate-700 dark:text-slate-200">
                Revenue & Subscription Report
              </h2>

              <div className="relative mt-3 sm:ml-auto sm:mt-0 text-slate-500">
                <Lucide
                  icon="Calendar"
                  className="absolute inset-y-0 left-0 z-10 w-4 h-4 my-auto ml-3"
                />
                <Litepicker
                  value={salesReportFilter}
                  onChange={(e) => setSalesReportFilter(e.target.value)}
                  options={{
                    autoApply: false,
                    singleMode: false,
                    numberOfColumns: 2,
                    numberOfMonths: 2,
                    showWeekNumbers: true,
                    dropdowns: {
                      minYear: 2020,
                      maxYear: null,
                      months: true,
                      years: true,
                    },
                  }}
                  className="pl-10 sm:w-56 !box rounded-xl"
                />
              </div>
            </div>

            <div className="p-6 mt-12 intro-y box rounded-xl sm:mt-5">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex">
                  <div>
                    <div className="text-xl font-semibold text-primary dark:text-slate-300">
                      £{revenue?.this_month ?? 0}
                    </div>
                    <div className="mt-0.5 text-slate-500 text-sm">
                      This Month
                    </div>
                  </div>

                  <div className="w-px h-12 mx-4 border border-r border-dashed border-slate-200 dark:border-darkmode-300 xl:mx-5"></div>

                  <div>
                    <div className="text-xl font-semibold text-slate-500">
                     £{revenue?.last_month ?? 0}
                    </div>
                    <div className="mt-0.5 text-slate-500 text-sm">
                      Last Month
                    </div>
                  </div>
                </div>

                <Menu className="mt-5 md:ml-auto md:mt-0">
                  <Menu.Button
                    as={Button}
                    variant="outline-secondary"
                    className="font-normal rounded-xl"
                  >
                    Filter Revenue
                    <Lucide icon="ChevronDown" className="w-4 h-4 ml-2" />
                  </Menu.Button>

                  <Menu.Items className="w-44 h-40 overflow-y-auto rounded-xl">
                    <Menu.Item>Subscriptions</Menu.Item>
                    <Menu.Item>Employer Ads</Menu.Item>
                    <Menu.Item>Boosted Jobs</Menu.Item>
                    <Menu.Item>Candidate Premium</Menu.Item>
                  </Menu.Items>
                </Menu>
              </div>

              <div className="mt-8">
                <ReportLineChart height={275} className="mt-6 -mb-6" />
              </div>
            </div>
          </div>

          {/* USER DISTRIBUTION */}
          <div className="col-span-12 mt-8 sm:col-span-6 lg:col-span-3">
            <div className="flex items-center h-10 intro-y">
              <h2 className="mr-5 text-lg font-semibold truncate text-slate-700 dark:text-slate-200">
                Candidate Demographics
              </h2>
              <a href="#" className="ml-auto truncate text-primary font-medium">
                View
              </a>
            </div>

            <div className="p-6 mt-5 intro-y box rounded-xl">
              <div className="mt-3">
                <ReportPieChart height={213} />
              </div>

              <div className="mx-auto mt-8 w-52 sm:w-auto text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 mr-3 rounded-full bg-primary"></div>
                  <span className="truncate">18 - 25 Years</span>
                  <span className="ml-auto font-semibold">48%</span>
                </div>

                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 mr-3 rounded-full bg-pending"></div>
                  <span className="truncate">26 - 40 Years</span>
                  <span className="ml-auto font-semibold">37%</span>
                </div>

                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 mr-3 rounded-full bg-warning"></div>
                  <span className="truncate">40+ Years</span>
                  <span className="ml-auto font-semibold">15%</span>
                </div>
              </div>
            </div>
          </div>

          {/* JOB STATUS */}
          <div className="col-span-12 mt-8 sm:col-span-6 lg:col-span-3">
            <div className="flex items-center h-10 intro-y">
              <h2 className="mr-5 text-lg font-semibold truncate text-slate-700 dark:text-slate-200">
                Job Status Summary
              </h2>
              <a href="#" className="ml-auto truncate text-primary font-medium">
                View
              </a>
            </div>

            <div className="p-6 mt-5 intro-y box rounded-xl">
              <div className="mt-3">
                <ReportDonutChart height={213} />
              </div>

              <div className="mx-auto mt-8 w-52 sm:w-auto text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 mr-3 rounded-full bg-primary"></div>
                  <span className="truncate">Active Jobs</span>
                  <span className="ml-auto font-semibold">62%</span>
                </div>

                <div className="flex items-center mt-4">
                  <div className="w-2 h-2 mr-3 rounded-full bg-warning"></div>
                  <span className="truncate">Expired Jobs</span>
                  <span className="ml-auto font-semibold">15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="col-span-12 2xl:col-span-3">
        <div className="pb-10 -mb-10 2xl:border-l border-slate-200 dark:border-darkmode-400">
          <div className="grid grid-cols-12 2xl:pl-6 gap-x-6 2xl:gap-x-0 gap-y-6">
            {/* PAYMENTS */}
            <div className="col-span-12 mt-3 md:col-span-6 xl:col-span-4 2xl:col-span-12 2xl:mt-8">
              <div className="flex items-center h-10 intro-x">
                <h2 className="mr-5 text-lg font-semibold truncate text-slate-700 dark:text-slate-200">
                  Recent Payments
                </h2>
              </div>

              <div className="mt-5">
                {recent_payments?.length > 0 ? (
                  recent_payments.map((payment: any, index: number) => (
                    <div key={index} className="intro-x">
                      <div className="flex items-center px-5 py-4 mb-3 box zoom-in rounded-xl">
                        <div className="ml-4 mr-auto">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {payment.user?.name ?? "Unknown User"}
                          </div>
                          <div className="text-slate-500 text-xs mt-1">
                            {payment.type ?? "Payment"}
                          </div>
                        </div>

                        <div className="text-success font-semibold">
                          +₦{payment.amount ?? 0}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No recent payments</p>
                )}

                <a
                  href="#"
                  className="block w-full py-3 text-center border border-dotted rounded-xl intro-x border-slate-300 dark:border-darkmode-300 text-slate-500 text-sm"
                >
                  View All Payments
                </a>
              </div>
            </div>

            {/* IMPORTANT NOTES */}
            <div className="col-span-12 mt-3 md:col-span-6 xl:col-span-12 xl:col-start-1 xl:row-start-1 2xl:col-start-auto 2xl:row-start-auto">
              <div className="flex items-center h-10 intro-x">
                <h2 className="mr-auto text-lg font-semibold truncate text-slate-700 dark:text-slate-200">
                  Admin Alerts
                </h2>

                <Button
                  className="px-2 mr-2 border-slate-300 text-slate-600 dark:text-slate-300"
                  onClick={prevImportantNotes}
                >
                  <Lucide icon="ChevronLeft" className="w-4 h-4" />
                </Button>

                <Button
                  className="px-2 border-slate-300 text-slate-600 dark:text-slate-300"
                  onClick={nextImportantNotes}
                >
                  <Lucide icon="ChevronRight" className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-5 intro-x">
                <div className="box zoom-in rounded-xl">
                  <TinySlider
                    getRef={(el) => {
                      importantNotesRef.current = el;
                    }}
                  >
                    <div className="p-6">
                      <div className="text-base font-semibold truncate text-slate-800 dark:text-slate-200">
                        Pending Employer Verification
                      </div>
                      <div className="mt-1 text-slate-400 text-xs">
                        3 hours ago
                      </div>
                      <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        12 employers are waiting for verification approval.
                        Review submitted documents.
                      </div>

                      <div className="flex mt-5 font-medium">
                        <Button
                          variant="primary"
                          className="px-3 py-2 rounded-xl"
                        >
                          Review
                        </Button>

                        <Button
                          variant="outline-secondary"
                          className="px-3 py-2 ml-auto rounded-xl"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="text-base font-semibold truncate text-slate-800 dark:text-slate-200">
                        Job Reports Submitted
                      </div>
                      <div className="mt-1 text-slate-400 text-xs">
                        9 hours ago
                      </div>
                      <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        4 job posts have been reported by candidates. Check
                        complaints and take action.
                      </div>

                      <div className="flex mt-5 font-medium">
                        <Button
                          variant="primary"
                          className="px-3 py-2 rounded-xl"
                        >
                          View Reports
                        </Button>

                        <Button
                          variant="outline-secondary"
                          className="px-3 py-2 ml-auto rounded-xl"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="text-base font-semibold truncate text-slate-800 dark:text-slate-200">
                        Subscription Renewals Due
                      </div>
                      <div className="mt-1 text-slate-400 text-xs">
                        1 day ago
                      </div>
                      <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        27 employer subscriptions are due for renewal in the
                        next 7 days.
                      </div>

                      <div className="flex mt-5 font-medium">
                        <Button
                          variant="primary"
                          className="px-3 py-2 rounded-xl"
                        >
                          View List
                        </Button>

                        <Button
                          variant="outline-secondary"
                          className="px-3 py-2 ml-auto rounded-xl"
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </TinySlider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;