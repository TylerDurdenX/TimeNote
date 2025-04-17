"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGetTimesheetDataQuery } from "@/store/api";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserSettingsHR from "./userDetailsHR";
import { ChevronLeft } from "lucide-react";
import UserPersonalDetails from "./UserPersonalDetails";
import HierarchyPage from "../../userDetails/udComponents/Organization";

const page = () => {
  const email = useSearchParams().get("email");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState("myTimesheet");

  const { data, isLoading, error, refetch } = useGetTimesheetDataQuery(
    { email: email!, date: selectedDate.toString() },
    { refetchOnMountOrArgChange: true }
  );

  const handleTabClick = (value: string) => {
    setSelectedTab(value);
    // sessionStorage.setItem("timesheetSelectedTab", value);
  };

  localStorage.removeItem("persist:root");
  localStorage.removeItem("ally-supports-cache");

  const url = window.location.href;
  const urlParams = new URL(url);
  const id = urlParams.pathname.split("/")[2];
  const emailParam = urlParams.searchParams.get("email");
  const [startingUserId, setStartingUserId] = useState(Number(id));

  useEffect(() => {
    setStartingUserId(Number(id));
  }, [id]);

  return (
    <div>
      <div className="w-full mb-5">
        <div className="w-full flex items-center justify-center mt-5 mb-5">
          <button onClick={() => window.history.back()}>
            <ChevronLeft className="mr-5 ml-5" />
          </button>
          <Header
            name="User Details"
            hasFilters={false}
            hasTeamFilter={false}
          />
        </div>
        <div className="flex justify-center items-center h-full w-full mt-5">
          <div className="w-full h-full">
            <Tabs defaultValue="userDetails" className="full">
              <TabsList className="grid grid-cols-3  w-[600px] ml-5">
                <TabsTrigger
                  value="userDetails"
                  onClick={() => handleTabClick("userDetails")}
                >
                  User Settings
                </TabsTrigger>
                <TabsTrigger
                  value="userPersonalDetails"
                  onClick={() => handleTabClick("userPersonalDetails")}
                >
                  User Details
                </TabsTrigger>
                <TabsTrigger
                  value="organization"
                  onClick={() => handleTabClick("organization")}
                >
                  Organization
                </TabsTrigger>
              </TabsList>
              <TabsContent value="userDetails" className="w-full mr-5">
                <UserSettingsHR id={Number(id)} />
              </TabsContent>
              <TabsContent value="userPersonalDetails" className="w-full mr-5">
                <UserPersonalDetails id={startingUserId} />
              </TabsContent>
              <TabsContent value="organization" className="w-full mr-5">
                <HierarchyPage
                  startingUserId={startingUserId}
                  setStartingUserId={setStartingUserId}
                />{" "}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
