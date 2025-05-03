"use client";

import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronsUpDown,
  FileDown,
  FilterX,
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
    <>
      <div className="w-full bg-gray-50">
        {/* Header Section */}
        <div className="w-full mb-5">
          <div className="flex w-full text-gray-900">
            <div className=" pt-1 lg:pt-8 w-full">
              <h1
                className={`text-2xl font-semibold dark:text-white flex items-center`}
              >
                <button onClick={() => window.history.back()}>
                  <ChevronLeft className="mr-5" />
                </button>
                Timesheet Report
              </h1>{" "}
            </div>
          </div>
          <div className="mt-5 ml-5 flex items-center">
            <Label className="justify-center col-span-1 mr-3">Team</Label>
            <Popover open={openTeam} onOpenChange={setTeamOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-[200px] justify-between"
                >
                  {dropdownTeamName !== ""
                    ? teamList?.find(
                        (team) => String(team.name) === dropdownTeamName
                      )?.name
                    : "Find Team"}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search Team..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No Team found.</CommandEmpty>
                    <CommandGroup>
                      {teamList?.map((team) => (
                        <CommandItem
                          key={team.name}
                          value={String(team.name)}
                          onSelect={() => {
                            setDropdownTeamName(team.name);
                            setSelectedUserEmail("");
                            setReportType("2");
                            setDownloadUserReportClicked(0);
                            setTeamOpen(false);
                          }}
                        >
                          {team.name}
                          <Check
                            className={cn(
                              "ml-auto",
                              value === team.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Label className="text-center ml-7">User</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-[200px] justify-between col-span-2 ml-3"
                >
                  {selectedUserEmail
                    ? data?.find(
                        (user) => String(user.email) === selectedUserEmail
                      )?.username
                    : "Find User"}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 ">
                <Command>
                  <CommandInput placeholder="Search User..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No User found.</CommandEmpty>
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
                        >
                          {user.username}
                          <Check
                            className={cn(
                              "ml-auto",
                              value === user.username
                                ? "opacity-100"
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
            <Label className="text-center ml-7">Select Month</Label>
            <Popover open={monthOpen} onOpenChange={setMonthOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-[200px] justify-between col-span-2 ml-3"
                >
                  {selectedMonth
                    ? monthsList?.find(
                        (month) => String(month) === selectedMonth
                      )
                    : "Select Month "}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 ">
                <Command>
                  <CommandInput placeholder="Search User..." className="h-9" />
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
                        >
                          {month}
                          <Check
                            className={cn(
                              "ml-auto",
                              value === month ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              className="bg-gray-200 hover:bg-gray-300 mt-2 ml-4"
              onClick={clearFilter}
            >
              <FilterX className="text-gray-800" />
            </Button>
            <div className="flex ml-auto items-center px-6">
              <button
                className="flex items-center ml-5  text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 whitespace-nowrap"
                style={{ height: "50px", padding: "0 16px" }}
                onClick={handleExportToExcel}
              >
                <FileDown size={25} />
                <span className="ml-2">Export to Excel</span>
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-rows-1 w-full">
          <div className="h-full overflow-hidden">
            {reportType === "2" ? (
              <>
                <TimesheetReportTable
                  teamName={dropdownTeamName!}
                  userEmail={selectedUserEmail}
                  month={selectedMonth}
                  downloadTeamReport={downloadTeamReportClicked}
                />
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
