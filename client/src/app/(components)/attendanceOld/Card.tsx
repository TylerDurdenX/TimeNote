import React, { useEffect } from "react";
import { AttendanceChart } from "./AttendanceChart";
import { useGetAttendanceDataQuery } from "@/store/api";

interface CardProps {
  title: string;
  chartId: string;
  email: string;
  onTimeCount: string;
  setOnTimeCount: (tab: string) => void;
  lateCount: string;
  setLateCount: (tab: string) => void;
  setOnTimeList: (tab: any[]) => void;
  setLateArrivalList: (tab: any[]) => void;
  setIsCard1Loaded: (tab: boolean) => void;
  setIsCard2Loaded: (tab: boolean) => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  chartId,
  email,
  onTimeCount,
  setOnTimeCount,
  lateCount,
  setLateCount,
  setOnTimeList,
  setIsCard1Loaded,
  setIsCard2Loaded,
  setLateArrivalList,
}) => {
  localStorage.removeItem("persist:root");

  const { data, isLoading } = useGetAttendanceDataQuery(
    { email: email, title: title },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (title === "On Time Arrivals") {
      setOnTimeCount(String(data?.usersCount));
    }
    if (title === "Late Arrivals") {
      setLateCount(String(data?.usersCount));
    }
  }, []);

  useEffect(() => {
    if (!isLoading && data) {
      if (title === "Late Arrivals") {
        setIsCard2Loaded(true);
      }
      if (title === "On Time Arrivals") {
        setIsCard1Loaded(true);
      }
    }
  }, [isLoading, data]);

  return (
    <div className="w-full p-4 border rounded-lg shadow-md bg-white">
      <div className="grid grid-cols-9 gap-4">
        {/* Title and Users List (First 2 Columns) */}
        <div className="col-span-2">
          <h2 className="text-xl font-semibold mb-4">{title}</h2>
          <div className="font-bold text-4xl">
            {data?.usersCount} / {data?.totalUsersCount}
          </div>
        </div>

        {/* Chart Placeholder (Remaining 7 Columns) */}
        <div className="col-span-7">
          <div className="h-48 bg-gray-200 rounded-md">
            {/* This can be replaced with your actual chart */}
            <p className="text-center text-gray-600 " />
            <AttendanceChart
              email={email}
              title={title}
              setOnTimeList={setOnTimeList}
              setLateArrivalList={setLateArrivalList}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
