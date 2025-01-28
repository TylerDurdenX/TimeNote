"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

interface Props {
  date: DateRange | undefined; // Currently selected date range
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>; // Function to update the date range
  onRangeSelect: () => void;
}

export function DatePickerWithRange({ date, setDate, onRangeSelect  }: Props) {
  const handleRangeChange = (selectedRange: DateRange | undefined) => {
    // Update the parent state with the selected range
    setDate(selectedRange);
    // Trigger the method to log the date range once the user selects a range
    onRangeSelect();
  };

  const handlePopoverClose = () => {
    onRangeSelect(); // Trigger the range select logging method when the popover is closed
  };

  return (
    <div className={cn("grid gap-2")}>
      <Popover  onOpenChange={(open) => !open && handlePopoverClose()}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date?.from && !date?.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={date}
            onSelect={handleRangeChange} // Update the date range in the parent component when a date is selected
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
