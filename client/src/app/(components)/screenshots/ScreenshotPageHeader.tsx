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
import { Button as Bttn } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  CalendarClock,
  CalendarIcon,
  ChartCandlestick,
  ChartNoAxesCombined,
  Coffee,
  FileChartColumnIncreasing,
  FileClock,
  FilterX,
  LaptopMinimal,
  MapPin,
  PlusSquare,
  ScreenShare,
  User,
  User2,
  Users,
  UsersRound,
} from "lucide-react";
import { Button, FormControl } from "@mui/material";
import { DateRange } from "react-day-picker";
import { useCreateUserMutation } from "@/store/api";
import { toast } from "react-hot-toast";
import { DatePickerWithRange } from "@/components/Header/DateRangePicker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/components/Sidebar/nav-user";
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
