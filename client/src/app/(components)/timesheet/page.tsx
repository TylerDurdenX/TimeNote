"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TimesheetHeader from "./TimesheetHeader";
import { useGetTimesheetDataQuery } from "@/store/api";
import ApproveTimesheetTable from "./ApproveTimesheetTable";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimesheetTable from "./TimesheetTable";
import UsersTimesheetTable from "./UsersTimesheetTable";

const page = () => {
  const email = useSearchParams().get("email");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refetchFlag, setRefetchFlag] = useState(0);
  const [selectedTab, setSelectedTab] = useState("myTimesheet");

  const { data, isLoading, error, refetch } = useGetTimesheetDataQuery(
    { email: email!, date: selectedDate.toString() },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    refetch();
  }, [refetchFlag]);

  const handleTabClick = (value: string) => {
    setSelectedTab(value);
    // Note: sessionStorage usage removed for Claude.ai compatibility
    console.log("Tab selected:", value);
  };

  // Get initial tab value without sessionStorage
  const getInitialTab = () => {
    return "myTimesheet";
  };

  const tabConfig = [
    {
      value: "myTimesheet",
      label: "My Timesheet",
      icon: "⏰",
      description: "Track your personal time entries",
    },
    {
      value: "approveTimesheet",
      label: "Approve Timesheet",
      icon: "✅",
      description: "Review and approve team timesheets",
    },
    {
      value: "userTimesheet",
      label: "User's Timesheet",
      icon: "👥",
      description: "View individual user timesheets",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timesheet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">⏱️</span>
              </div>
              <div>
                <Header
                  name="Timesheet"
                  hasFilters={false}
                  hasTeamFilter={false}
                />
                <p className="text-gray-600 text-sm mt-1">
                  Manage and track time entries across your organization
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Timesheet Header Controls */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <TimesheetHeader
              hasFilters={true}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              data={data!}
              myTimesheetPage={selectedTab}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <Tabs defaultValue={getInitialTab()} className="w-full">
            {/* Enhanced Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <TabsList className="grid h-16 grid-cols-3 w-full max-w-2xl mx-auto bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                {tabConfig.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    onClick={() => handleTabClick(tab.value)}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm hover:bg-gray-50"
                  >
                    <span className="text-base">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <TabsContent value="myTimesheet" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm">⏰</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        My Timesheet
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Track and manage your personal time entries
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <TimesheetTable
                      email={email!}
                      selectedDate={selectedDate}
                      data={data!}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="approveTimesheet" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">✅</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Approve Timesheet
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Review and approve team member timesheets
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <ApproveTimesheetTable
                      email={email!}
                      selectedDate={selectedDate}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="userTimesheet" className="mt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-sm">👥</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        User's Timesheet
                      </h3>
                      <p className="text-gray-600 text-sm">
                        View and analyze individual user timesheets
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <UsersTimesheetTable
                      email={email!}
                      selectedDate={selectedDate}
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default page;
