"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import UserList from "../userDetails/usersList";
import ScreenshotsLP from "./ScreenshotsLP";
import ScreenshotUP from "./ScreenshotUP";
import { DateRange } from "react-day-picker";

const Page = () => {
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [retriggerlandingPage, setRetriggerlandingPage] = useState<number>(0);

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const handleSelectUser = (id: number) => {
    setIsUserSelected(true);
    setUserId(id);
  };

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

  useEffect(() => {
    if (date?.from && date?.to) {
      const newFromDate = new Date(date.from);
      newFromDate.setDate(newFromDate.getDate() + 1);

      const newToDate = new Date(date.to);
      newToDate.setDate(newToDate.getDate() + 1);

      setFromDate(newFromDate.toISOString().split("T")[0]);
      setToDate(newToDate.toISOString().split("T")[0]);
    }
  }, [date]);

  const clearFilter = () => {
    setDate(undefined);
    setFromDate("");
    setToDate("");
  };

  return (
    <>
      <div className="w-full sm:flex-row space-y-0 aspect-auto">
        <div className="flex w-full text-gray-900">
          <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 w-full">
            <Header
              name="Screenshots"
              hasFilters={true}
              hasTeamFilter={false}
              date={date}
              setDate={setDate}
              onRangeSelect={logDateRange}
              clearFilter={clearFilter}
            />
          </div>
        </div>
        <div className="flex gap-4 px-4 mr-4 h-full overflow-hidden">
          <div className="w-2/5 p-4 h-full shadow-lg mb-5 overflow-y-auto">
            <UserList onSelectUser={handleSelectUser} />
          </div>
          <div className="w-3/5 p-4 shadow-lg overflow-hidden justify-center">
            {isUserSelected ? (
              <ScreenshotUP
                id={userId!}
                from={fromDate!}
                to={toDate!}
                setReRenderPage={setRetriggerlandingPage}
              />
            ) : (
              <ScreenshotsLP
                from={fromDate!}
                to={toDate!}
                setReRenderPage={setRetriggerlandingPage}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
