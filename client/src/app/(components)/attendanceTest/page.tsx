"use client";

import { SectionCards } from "@/components/section-cards";

import { useEffect, useState } from "react";
import { AttendancePC } from "../Dashboard/AttendancePC";
import { TabsDemo } from "./TabData";
import AttendanceTable from "../attendance/AttendanceTable";
import { useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import AttendanceHeader from "./attendanceHeader";
import { Component } from "./lineChart";
import { BarChartComponent } from "./barChart";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { useGetAttendancePCDataQuery } from "@/store/api";

export default function Page() {
  const [teamId, setTeamId] = useState(0);
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const [date, setDate] = useState<DateRange | undefined>({
    from: sevenDaysAgo,
    to: now,
  });
  const [fromDate, setFromDate] = useState<string>(sevenDaysAgo.toISOString());
  const [toDate, setToDate] = useState<string>(now.toISOString());
  const [onTimeCount, setonTimeCount] = useState("");
  const [lateCount, setLateCount] = useState("");
  const [onTimeList, setOnTimeList] = useState<any[]>();
  const [lateArrivalList, setLateArrivalList] = useState<any[]>();

  const logDateRange = () => {
    if (date?.from && date?.to) {
      const newFromDate = new Date(date.from);
      newFromDate.setDate(newFromDate.getDate() + 1);

      const newToDate = new Date(date.to);
      newToDate.setDate(newToDate.getDate() + 1);

      setFromDate(newFromDate.toISOString().split("T")[0]);
      setToDate(newToDate.toISOString().split("T")[0]);
    }
  };

  useEffect(() => {
    if (date?.from && date?.to) {
      const newFromDate = new Date(date.from);
      newFromDate.setDate(newFromDate.getDate());

      const newToDate = new Date(date.to);
      newToDate.setDate(newToDate.getDate());

      setFromDate(newFromDate.toISOString().split("T")[0]);
      setToDate(newToDate.toISOString().split("T")[0]);
    }
  }, [date]);

  const clearFilter = () => {
    setDate(undefined);
    setFromDate("");
    setToDate("");
    setTeamId(0);
  };

  const userEmail = useSearchParams().get("email");

  const { data, isLoading } = useGetAttendancePCDataQuery({
    email: userEmail!,
    teamId: teamId,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="w-full">
        <div className="flex w-full text-gray-900">
          <div className=" pt-1 lg:pt-8 w-full">
            <AttendanceHeader
              name="Attendance"
              hasFilters={true}
              hasTeamFilter={true}
              buttonName="Add User"
              date={date}
              setDate={setDate}
              onRangeSelect={logDateRange}
              clearFilter={clearFilter}
              email={userEmail!}
              value={teamId}
              setValue={setTeamId}
            />
          </div>
        </div>
      </div>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards
            email={userEmail!}
            fromDate={fromDate}
            toDate={toDate}
            teamId={teamId}
          />
          <div className="px-4 lg:px-6">
            {/* <ChartAreaInteractive
              email={userEmail!}
              fromDate={fromDate}
              toDate={toDate}
              teamId={teamId}
            /> */}
            {/* <Component
              email={userEmail!}
              fromDate={fromDate}
              toDate={toDate}
              teamId={teamId}
            /> */}
            <BarChartComponent
              email={userEmail!}
              fromDate={fromDate}
              toDate={toDate}
              teamId={teamId}
            />
          </div>
          <div className="grid grid-rows-1 grid-cols-[35%_65%] ">
            <div className="p-4">
              <div>
                {
                  <AttendancePC
                    onTimeCount={data?.onTime!}
                    lateCount={data?.lateCount!}
                    onLeave={data?.onLeave}
                  />
                }
              </div>
            </div>
            <div className="p-4">
              <div>
                {
                  <TabsDemo
                    userEmail={userEmail!}
                    fromDate={fromDate}
                    toDate={toDate}
                    teamId={teamId}
                  />
                }
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="overflow-hidden">
              <AttendanceTable email={userEmail!} adminFlag={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
