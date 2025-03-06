'use client'

import React, { useState } from "react";
import Header from "@/components/Header";
import { Card } from "./Card";
import { AttendancePC } from "../Dashboard/AttendancePC";
import { LchartInter } from "../Dashboard/LchartInter";
import { LchartMulti } from "../Dashboard/LchartMulti";
import { useSearchParams } from "next/navigation";
import { DualChart } from "./DualChart";

const App: React.FC = () => {

  const email = useSearchParams().get('email')

  const [onTimeCount, setonTimeCount] = useState('')
  const [lateCount, setLateCount] = useState('')
  const [onTimeList, setOnTimeList] = useState<any[]>()
  const [lateArrivalList, setLateArrivalList] = useState<any[]>()

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="w-full mb-5">
        <div className="flex w-full text-gray-900">
          <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
            <Header
              name="Attendance"
              hasFilters={false}
              hasTeamFilter={false}
              buttonName="Add User"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-4 ">
        <div className="w-1/2 p-4 overflow-hidden">
          <Card
            title="On Time Arrivals"
            chartId="onTimeChart"
            email={email!}
            onTimeCount={onTimeCount}
            setOnTimeCount={setonTimeCount}
            lateCount={lateCount}
            setLateCount={setLateCount}
            setOnTimeList={setOnTimeList}
            setLateArrivalList={setLateArrivalList}
          />
        </div>  
        <div className="w-1/2 p-4 overflow-hidden justify-center">
          <Card
            title="Late Arrivals"
            chartId="lateArrivalsChart"
            email={email!}
            onTimeCount={onTimeCount}
            setOnTimeCount={setonTimeCount}
            lateCount={lateCount}
            setLateCount={setLateCount}
            setOnTimeList={setOnTimeList}
            setLateArrivalList={setLateArrivalList}
          />
        </div>
      </div>
      <div className="grid grid-rows-1 grid-cols-[35%_65%] ">
        <div className="p-4">
          <div>
            <AttendancePC onTimeCount={onTimeCount} lateCount={lateCount}/>
          </div>
        </div>
        <div className="p-4">
          <div>
            <DualChart onTimeList={onTimeList!} lateArrivalList={lateArrivalList!}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
