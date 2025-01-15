"use client";

import Header from "@/components/Header";
import React from "react";
import { MyResponsiveCalendar } from "./CalendarChart";
import { UserScrollArea } from "./UsersScrollArea";
import { LchartMulti } from "../Dashboard/LchartMulti";

type Props = {};

const Productivity = (props: Props) => {
  return (
    <>
      <div className="w-full">
        <div className="flex w-full  text-gray-900">
          <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 ">
            <Header name="Productivity" hasFilters={true} />
          </div>
        </div>
        <div className="flex h-[calc(100vh)] w-[calc(100vw)] gap-4 px-4 max-w-full">
          {/* Left 40% Area */}
          <div className="flex-[0_0_40%] h-full">
            <div className="h-full ">
              <UserScrollArea />
            </div>
          </div>

          {/* Right 60% Area */}
          <div className="flex-[0_0_60%] flex flex-col h-full">
            {/* Top half of the 60% */}
            <div className="flex-1 ">
              <MyResponsiveCalendar />
            </div>

            {/* Bottom half of the 60% */}
            <div className="flex-1">
              <LchartMulti />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Productivity;
