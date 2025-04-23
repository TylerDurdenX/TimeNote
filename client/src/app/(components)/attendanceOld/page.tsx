"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { Card } from "./Card";
import { AttendancePC } from "../Dashboard/AttendancePC";
import { useSearchParams } from "next/navigation";
import { DualChart } from "./DualChart";
import CircularLoading from "@/components/Sidebar/loading";
import { AttendancePCUser } from "./AttendancePCUser";
import AttendanceTable from "./AttendanceTable";
import { useGetAdminRoleQuery } from "@/store/api";

const App: React.FC = () => {
  const email = sessionStorage.getItem("email");

  const [onTimeCount, setonTimeCount] = useState("");
  const [lateCount, setLateCount] = useState("");
  const [onTimeList, setOnTimeList] = useState<any[]>();
  const [lateArrivalList, setLateArrivalList] = useState<any[]>();

  const [isCard1Loaded, setIsCard1Loaded] = useState(false);
  const [isCard2Loaded, setIsCard2Loaded] = useState(false);

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

  const userEmail = useSearchParams().get("email");

  const { data, isLoading } = useGetAdminRoleQuery(
    { email: userEmail! },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <>
      {isLoading ? (
        <CircularLoading />
      ) : (
        <>
          <>
            {data?.admin ? (
              <div className="w-full min-h-screen ">
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
                      setIsCard1Loaded={setIsCard1Loaded}
                      setIsCard2Loaded={setIsCard2Loaded}
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
                      setIsCard1Loaded={setIsCard1Loaded}
                      setIsCard2Loaded={setIsCard2Loaded}
                    />
                  </div>
                </div>
                <div className="grid grid-rows-1 grid-cols-[35%_65%] ">
                  <div className="p-4">
                    <div>
                      {isCard1Loaded && isCard2Loaded ? (
                        <AttendancePC
                          onTimeCount={onTimeCount}
                          lateCount={lateCount}
                        />
                      ) : (
                        <CircularLoading />
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div>
                      {isCard1Loaded &&
                      isCard2Loaded &&
                      onTimeList?.length !== 0 &&
                      lateArrivalList?.length !== 0 ? (
                        <DualChart
                          onTimeList={onTimeList!}
                          lateArrivalList={lateArrivalList!}
                        />
                      ) : (
                        <CircularLoading />
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4 ">
                  <div className="h-full w-full overflow-hidden">
                    <AttendanceTable email={email!} adminFlag={true} />
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
                        <AttendanceTable email={email!} adminFlag={false} />
                        {/* {(isCard1Loaded && isCard2Loaded && (onTimeList?.length !== 0) && (lateArrivalList?.length !== 0)) ? <DualChart onTimeList={onTimeList!} lateArrivalList={lateArrivalList!}/> : <CircularLoading/>} */}
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
};

export default App;
