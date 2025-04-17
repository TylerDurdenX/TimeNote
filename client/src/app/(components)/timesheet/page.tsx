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
    sessionStorage.setItem("timesheetSelectedTab", value);
  };

  return (
    <div>
      <div className="w-full mb-5">
        <div className="flex w-full text-gray-900">
          <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
            <Header name="Timesheet" hasFilters={false} hasTeamFilter={false} />
          </div>
        </div>
        <div className="w-full flex items-center justify-center mt-5 mb-5">
          <TimesheetHeader
            hasFilters={true}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            data={data!}
            myTimesheetPage={selectedTab}
          />
        </div>
        <div className="flex justify-center items-center h-full w-full">
          <div className="w-full h-full">
            <Tabs
              defaultValue={
                sessionStorage.getItem("timesheetSelectedTab") || "myTimesheet"
              }
              className="full"
            >
              <TabsList className="grid grid-cols-3  w-[500px] ml-5">
                <TabsTrigger
                  value="myTimesheet"
                  onClick={() => handleTabClick("myTimesheet")}
                >
                  My TimeSheet
                </TabsTrigger>
                <TabsTrigger
                  value="approveTimesheet"
                  onClick={() => handleTabClick("approveTimesheet")}
                >
                  Approve Timesheet
                </TabsTrigger>
                <TabsTrigger
                  value="userTimesheet"
                  onClick={() => handleTabClick("userTimesheet")}
                >
                  User's Timesheet
                </TabsTrigger>
              </TabsList>
              <TabsContent value="myTimesheet" className="w-full mr-5">
                <TimesheetTable
                  email={email!}
                  selectedDate={selectedDate}
                  data={data!}
                />
              </TabsContent>
              <TabsContent value="approveTimesheet" className="w-full mr-5">
                <ApproveTimesheetTable
                  email={email!}
                  selectedDate={selectedDate}
                />
              </TabsContent>
              <TabsContent value="userTimesheet">
                <UsersTimesheetTable
                  email={email!}
                  selectedDate={selectedDate}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
