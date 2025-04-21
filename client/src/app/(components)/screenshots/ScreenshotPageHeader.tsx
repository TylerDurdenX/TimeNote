"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterX, ScreenShare } from "lucide-react";
import { Button } from "@mui/material";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/Header/DateRangePicker";
import { UserSelectionFilter } from "@/components/Header/UserSelectionFilter";

type Props = {
  name: string;
  isSmallText?: boolean;
  hasFilters?: boolean;
  hasTeamFilter?: boolean;
  date?: DateRange | undefined;
  setDate?: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  onRangeSelect?: () => void;
  clearFilter?: () => void;
  buttonName?: string;
  hasDateFilter?: boolean;
  setSelectedDate?: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate?: Date;
  selectedtab?: string;
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  email: string;
};

const ScreenshotPageHeader = ({
  name,
  isSmallText = false,
  hasFilters,
  hasTeamFilter,
  date,
  setDate,
  onRangeSelect,
  clearFilter,
  buttonName,
  hasDateFilter,
  setSelectedDate,
  selectedDate,
  selectedtab,
  value,
  setValue,
  email,
}: Props) => {
  let icon;

  switch (name) {
    case "Screenshots":
      icon = <ScreenShare className="mr-2" />;
      break;
  }

  const todayWithMidnightTime = new Date();
  todayWithMidnightTime.setHours(0, 0, 0, 0); // Set the time to 00:00:00

  useEffect(() => {
    if (setSelectedDate) setSelectedDate(new Date(todayWithMidnightTime));
  }, []);

  localStorage.removeItem("ally-supports-cache");
  localStorage.removeItem("persist:root");

  const roles = sessionStorage.getItem("userRoles") || "";
  const [ADMINUser, setADMINUser] = useState(
    roles.split(",").includes("ADMIN")
  );

  return (
    <div className="flex relative w-full pl-5 h-[20px] mb-1 items-center justify-between">
      <h1
        className={`${
          isSmallText ? "text-lg" : "text-2xl"
        } font-semibold dark:text-white flex items-center`}
      >
        {icon}
        {name}
      </h1>

      {hasFilters && (
        <div className="flex items-center space-x-4 mr-5 overflow-x-hidden">
          {hasTeamFilter && (
            <Select>
              <SelectTrigger className="w-[180px] text-gray-800">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>All Projects</SelectLabel>
                  <SelectItem value="apple">TCS</SelectItem>
                  <SelectItem value="banana">Infosys</SelectItem>
                  <SelectItem value="blueberry">KPMG</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          {selectedtab === "userScreenshots" ? (
            <>
              <DatePickerWithRange
                date={date}
                setDate={setDate!}
                onRangeSelect={onRangeSelect!}
              />
              <Button
                className="bg-gray-200 hover:bg-gray-100"
                onClick={clearFilter}
              >
                <FilterX className="text-gray-800" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-4 mr-5 overflow-x-hidden">
                <UserSelectionFilter
                  setValue={setValue}
                  value={value}
                  email={email}
                />

                <Button
                  className="bg-gray-200 hover:bg-gray-100"
                  onClick={clearFilter}
                >
                  <FilterX className="text-gray-800" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ScreenshotPageHeader;
