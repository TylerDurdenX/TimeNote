"use client";
import React from "react";
import Header from "@/components/Header";
import { HbarChart } from "./HbarChart";
import { LchartMulti } from "./LchartMulti";
import { AttendancePC } from "./AttendancePC";
import { LchartInter } from "./LchartInter";

const Dashboard = () => {
  return (
    <>
      <div className="w-full">
        <div className="flex w-full  text-gray-900">
          <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 ">
            <Header name="Dashboard" hasFilters={true} hasTeamFilter={true}/>
          </div>
        </div>
        <div className="flex gap-4 px-4 mr-4 max-w-full overflow-hidden">
          <div className="flex-[0_0_40%]">
            <HbarChart />
            <div className="mt-4">
              <AttendancePC />
            </div>
          </div>
          <div className="flex-[0_0_60%] overflow-hidden">
            <LchartMulti />
            <div className="mt-4">
              <LchartInter />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
