"use client";
import React from "react";
import Header from "@/components/Header";
import { HbarChart } from "./HbarChart";
import { LchartMulti } from "./LchartMulti";
import { AttendancePC } from "./AttendancePC";
import { LchartInter } from "./LchartInter";
import { ActivityTrend } from "./ActivityTrend";
import { ProductivityTrend } from "./ProductivityTrend";
import { ProductivityStats } from "./ProductivityStats";
import { ActivityStats } from "./ActivityStats";

const Dashboard = () => {
  return (
    <>
      <div className="w-full h-full">
        <div className="flex w-full text-gray-900 flex-col h-full">
          <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 w-full">
            <Header name="Dashboard" hasFilters={true} hasTeamFilter={true} />
          </div>

          <div className="grid grid-rows-1 grid-cols-[40%_60%] ">
            <div className="p-4 ">
              <div>
                <HbarChart />
              </div>
            </div>
            <div className="p-4 ">
              <div>
                <LchartMulti />
              </div>
            </div>
          </div>
          <div className="grid grid-rows-1 grid-cols-[35%_65%] ">
            <div className="p-4">
              <div>
                <AttendancePC/>
              </div>
            </div>
            <div className="p-4">
              <div>
                <LchartInter />
              </div>
            </div>
          </div>
          <div className="grid grid-rows-1 grid-cols-[50%_50%] ">
            <div className="p-4">
              <div>
                <ProductivityStats/>
              </div>
            </div>
            <div className="p-4">
              <div>
                <ActivityStats />
              </div>
            </div>
          </div>
          <div className="grid grid-rows-1 grid-cols-[40%_60%] ">
            <div className="p-4">
              <div>
                <ActivityTrend/>
              </div>
            </div>
            <div className="p-4">
              <div>
                <ProductivityTrend />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
