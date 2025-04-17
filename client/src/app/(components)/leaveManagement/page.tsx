"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaveCalendar from "./LeaveCalendar";
import LeaveStatus from "./LeaveStatus";
import ApproveLeaves from "./ApproveLeaves";

const page = () => {
  const email = useSearchParams().get("email");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState("myTimesheet");

  const userEmail = useSearchParams().get("email");

  const handleTabClick = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <div>
      <div className="w-full mb-5">
        <div className="flex w-full text-gray-900">
          <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
            <Header
              name="Leave Management"
              hasFilters={false}
              hasTeamFilter={false}
            />
          </div>
        </div>

        <div className="flex justify-center items-center h-full w-full mt-5">
          <div className="w-full h-full">
            <Tabs defaultValue="myCalendar" className="full">
              <TabsList className="grid grid-cols-3  w-[500px] ml-5">
                <TabsTrigger
                  value="myCalendar"
                  onClick={() => handleTabClick("myCalendar")}
                >
                  Apply Leaves
                </TabsTrigger>
                <TabsTrigger
                  value="leaveStatus"
                  onClick={() => handleTabClick("leaveStatus")}
                >
                  Leave Status
                </TabsTrigger>
                <TabsTrigger
                  value="approveLeaves"
                  onClick={() => handleTabClick("approveLeaves")}
                >
                  Approve Leaves
                </TabsTrigger>
              </TabsList>
              <TabsContent value="myCalendar" className="w-full mr-5">
                <LeaveCalendar email={userEmail!} />
              </TabsContent>
              <TabsContent value="leaveStatus" className="w-full mr-5">
                <LeaveStatus email={userEmail!} />
              </TabsContent>
              <TabsContent value="approveLeaves">
                <ApproveLeaves email={userEmail!} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
