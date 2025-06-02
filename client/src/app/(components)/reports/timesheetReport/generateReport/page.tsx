"use client";

import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronsUpDown,
  FileDown,
  FilterX,
  Calendar,
  Users,
  User,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  useGetTeamListFilterQuery,
  useGetUserListFilterQuery,
} from "@/store/api";
import { cn } from "@/lib/utils";
import TimesheetReportTable from "./TimesheetReport";

const page = () => {
  const userEmail = useSearchParams().get("email");

  const { data: teamList } = useGetTeamListFilterQuery(
    {
      email: userEmail!,
    },
    { refetchOnMountOrArgChange: true }
  );
  const { data, isLoading, error, isSuccess } = useGetUserListFilterQuery({
    email: userEmail!,
  });

  const monthName = new Date().toLocaleString("default", { month: "long" });

  const [openTeam, setTeamOpen] = useState(false);
  const [dropdownTeamName, setDropdownTeamName] = useState("");
  const [value, setValue] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [reportType, setReportType] = useState("2");
  const [open, setOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [downloadUserReportClicked, setDownloadUserReportClicked] = useState(0);
  const [downloadTeamReportClicked, setDownloadTeamReportClicked] = useState(0);

  const [selectedMonth, setSelectedMonth] = useState(monthName);
  const monthsList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const clearFilter = () => {
    setSelectedMonth(monthName);
    setSelectedUserEmail("");
    setReportType("2");
    setDropdownTeamName("");
  };

  const handleExportToExcel = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (reportType === "2") {
      const teamReportClick = downloadTeamReportClicked + 1;
      setDownloadTeamReportClicked(teamReportClick);
    } else {
      const userReportClick = downloadUserReportClicked + 1;
      setDownloadUserReportClicked(userReportClick);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Modern Header with Glass Effect */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors duration-200 group"
              >
                <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:text-slate-900 transition-colors" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                  Timesheet Report
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Generate and export detailed timesheet reports
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Filter Section */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
            <h2 className="text-xl font-semibold text-slate-800">
              Filter Options
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
            {/* User Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center">
                <User className="w-4 h-4 mr-2 text-slate-500" />
                Select User
              </Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-11 bg-slate-50/50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200"
                  >
                    <span className="truncate">
                      {selectedUserEmail
                        ? data?.find(
                            (user) => String(user.email) === selectedUserEmail
                          )?.username
                        : "Choose user..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 shadow-xl border-slate-200">
                  <Command>
                    <CommandInput
                      placeholder="Search users..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandGroup>
                        {data?.map((user) => (
                          <CommandItem
                            key={user.username}
                            value={String(user.username)}
                            onSelect={() => {
                              setSelectedUserEmail(user.email);
                              setDropdownTeamName("");
                              setReportType("2");
                              setDownloadTeamReportClicked(0);
                              setOpen(false);
                            }}
                            className="hover:bg-slate-100"
                          >
                            {user.username}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                value === user.username
                                  ? "opacity-100 text-blue-600"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Month Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                Select Month
              </Label>
              <Popover open={monthOpen} onOpenChange={setMonthOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-11 bg-slate-50/50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200"
                  >
                    <span className="truncate">
                      {selectedMonth
                        ? monthsList?.find(
                            (month) => String(month) === selectedMonth
                          )
                        : "Choose month..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 shadow-xl border-slate-200">
                  <Command>
                    <CommandInput
                      placeholder="Search months..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandGroup>
                        {monthsList?.map((month) => (
                          <CommandItem
                            key={month}
                            value={month}
                            onSelect={() => {
                              setSelectedMonth(month);
                              setMonthOpen(false);
                            }}
                            className="hover:bg-slate-100"
                          >
                            {month}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                value === month
                                  ? "opacity-100 text-blue-600"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filter Button */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-transparent">
                Clear
              </Label>
              <Button
                onClick={clearFilter}
                variant="outline"
                className="h-11 bg-slate-50/50 border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 group"
              >
                <FilterX className="w-4 h-4 group-hover:text-red-600" />
              </Button>
            </div>

            {/* Export Button */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-transparent">
                Export
              </Label>
              <Button
                onClick={handleExportToExcel}
                className="h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 font-medium"
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-slate-800">
                Report Data
              </h3>
            </div>
          </div>

          <div className="p-6">
            {reportType === "2" ? (
              <TimesheetReportTable
                teamName={dropdownTeamName!}
                userEmail={selectedUserEmail}
                month={selectedMonth}
                downloadTeamReport={downloadTeamReportClicked}
              />
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No report data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
