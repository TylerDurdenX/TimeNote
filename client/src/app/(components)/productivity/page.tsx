"use client";

import Header from "@/components/Header";
import React, { useState } from "react";
import { MyResponsiveCalendar } from "./CalendarChart";
import { UserScrollArea } from "./UsersScrollArea";
import { LchartMulti } from "../Dashboard/LchartMulti";
import { DateRange } from "react-day-picker";
import UserList from "../userDetails/usersList";

type Props = {};

const Productivity = (props: Props) => {
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [fromDate, setFromDate] = useState<string>("2000-01-01T00:00:00Z");
  const [toDate, setToDate] = useState<string>("2000-01-01T00:00:00Z");

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

  const clearFilter = () => {
    setDate(undefined);
    setFromDate("");
    setToDate("");
  };

  const handleSelectUser = (id: number) => {
    setIsUserSelected(true);
    setUserId(id);
  };

  return (
    <>
      <div className="w-full sm:flex-row space-y-0 aspect-auto">
        <div className="flex w-full text-gray-900">
          <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 w-full">
            <Header
              name="Productivity"
              hasFilters={true}
              hasTeamFilter={false}
              date={date}
              setDate={setDate}
              onRangeSelect={logDateRange}
              clearFilter={clearFilter}
            />
          </div>
        </div>
        <div className="flex h-[calc(100vh)] w-[calc(100vw)] gap-4 px-4 max-w-full">
          {/* Left 40% Area */}
          <div className="flex-[0_0_40%] h-full">
            <div className="h-full ">
              <UserList onSelectUser={handleSelectUser} activeFlag={true} />
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
