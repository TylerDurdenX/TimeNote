"use client";

import { SectionCards } from "@/components/section-cards";

import { useEffect, useState } from "react";
import { AttendancePC } from "../Dashboard/AttendancePC";
import { TabsDemo } from "./TabData";
import AttendanceTable from "../attendanceOld/AttendanceTable";
import { useSearchParams } from "next/navigation";
import { DateRange } from "react-day-picker";
import AttendanceHeader from "./attendanceHeader";
import { Component } from "./lineChart";
import { BarChartComponent } from "./barChart";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { useGetAdminRoleQuery, useGetAttendancePCDataQuery } from "@/store/api";
import CircularLoading from "@/components/Sidebar/loading";
import Header from "@/components/Header";
import { AttendancePCUser } from "../attendanceOld/AttendancePCUser";

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

  const userRolesList = sessionStorage.getItem("userRoles");

  let Admin: boolean = false;

  if (
    userRolesList !== undefined &&
    userRolesList !== null &&
    userRolesList !== ""
  ) {
    // Define the function to check if 'ADMIN' is in the list
    const containsValue = (csvString: string, value: string): boolean => {
      // Split the string by commas to get an array of values
      const valuesArray = csvString.split(",");
      // Check if the value exists in the array
      return valuesArray.includes(value);
    };

    // Call containsValue function to set Admin
    Admin = containsValue(userRolesList, "ADMIN");
  } else {
    console.log("userRolesList is undefined or empty");
  }

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

  const { data: adminData, isLoading: admindataLoading } = useGetAdminRoleQuery(
    { email: userEmail! },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <>
      {admindataLoading ? (
        <CircularLoading />
      ) : (
        <>
          <>
            {adminData?.admin ? (
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
            ) : (
              <>
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
                  <div className="grid grid-rows-1 grid-cols-[35%_65%] ">
                    <div className="p-4">
                      <div>
                        <AttendancePCUser />
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="h-full overflow-hidden">
                        <AttendanceTable email={userEmail!} adminFlag={false} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        </>
      )}
    </>
  );
}
