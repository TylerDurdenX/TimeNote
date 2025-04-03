import React, { useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { FormControl } from "@mui/material";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TimesheetResponse } from "@/store/interfaces";

type Props = {
  hasFilters?: boolean;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  data?: TimesheetResponse;
  myTimesheetPage?: string;
};

const TimesheetHeader = ({
  hasFilters,
  selectedDate,
  setSelectedDate,
  data,
  myTimesheetPage,
}: Props) => {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const todayWithMidnightTime = new Date();
  todayWithMidnightTime.setHours(0, 0, 0, 0); // Set the time to 00:00:00

  useEffect(() => {
    setSelectedDate(new Date(todayWithMidnightTime));
  }, []);

  return (
    <div className="flex relative w-full pl-5 h-[20px] mb-1 items-center justify-between">
      <h1
        className={`text-2xl font-semibold dark:text-white flex items-center`}
      >
        {selectedDate.toDateString()}
      </h1>

      {hasFilters && (
        <div className="flex items-center space-x-4 mr-5 overflow-x-hidden">
          <div className="font-semibold">
            {myTimesheetPage === "myTimesheet" ? (
              <>Total Logged Hours : {data?.totalTime || "00:00"}</>
            ) : (
              ""
            )}
          </div>
          {myTimesheetPage === "approveTimesheet" ? (
            ""
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] pl-3 text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    {selectedDate ? (
                      <>{selectedDate.toDateString()}</>
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </div>
  );
};

export default TimesheetHeader;
