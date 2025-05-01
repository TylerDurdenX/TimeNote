"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSelector, useDispatch } from "react-redux";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useGetTeamListFilterQuery,
  useGetUserListFilterQuery,
} from "@/store/api";
import { Check, ChevronLeft, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import toast from "react-hot-toast";

const ReportsDialog = () => {
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [teamId, setTeamId] = useState("");
  const [thisMonthTeamSwitch, setThisMonthTeamSwitch] = useState(false);
  const [thisMonthUserSwitch, setThisMonthUserSwitch] = useState(false);
  const [thisMonthSwitch, setThisMonthSwitch] = useState(false);

  const userEmail = useSearchParams().get("email");

  const [fromDate, setFromDate] = useState<string>("2000-01-01T00:00:00Z");
  const [toDate, setToDate] = useState<string>("2000-01-01T00:00:00Z");
  const [fromTeamDate, setFromTeamDate] = useState<string>(
    "2000-01-01T00:00:00Z"
  );
  const [toTeamDate, setToTeamDate] = useState<string>("2000-01-01T00:00:00Z");

  const [fromUserDate, setFromUserDate] = useState<string>(
    "2000-01-01T00:00:00Z"
  );
  const [toUserDate, setToUserDate] = useState<string>("2000-01-01T00:00:00Z");

  const [value, setValue] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [openTeam, setTeamOpen] = React.useState(false);

  const handleTeamSwitchChange = (checked: boolean) => {
    setThisMonthTeamSwitch(checked);
    setFromTeamDate("");
    setToTeamDate("");
  };

  const handleSwitchChange = (checked: boolean) => {
    setThisMonthSwitch(checked);
    setFromDate("");
    setToDate("");
  };

  const handleUserSwitchChange = (checked: boolean) => {
    setThisMonthUserSwitch(checked);
    setFromUserDate("");
    setToUserDate("");
  };

  const isFormValid = () => {
    if (thisMonthUserSwitch === true) {
      return selectedUserEmail;
    } else {
      return selectedUserEmail && fromUserDate && toUserDate;
    }
  };

  const { data, isLoading, error, isSuccess } = useGetUserListFilterQuery({
    email: userEmail!,
  });

  const { data: teamList } = useGetTeamListFilterQuery(
    {
      email: userEmail!,
    },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <>
      <div className="flex w-full text-gray-900">
        <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
          <h1
            className={`text-2xl font-semibold dark:text-white flex items-center`}
          >
            <button onClick={() => window.history.back()}>
              <ChevronLeft className="mr-5" />
            </button>
            Attendance Report
          </h1>{" "}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generate Attendance Report</CardTitle>
          <CardDescription>
            Please provide the below data and click on generate report button to
            generate the report.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="grid grid-cols-12 items-center gap-4 mr-1">
            <Label className="text-center">
              User <span className="text-red-500 ml-1">*</span>
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between col-span-2"
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
            <Label className="text-center">
              From{" "}
              {thisMonthUserSwitch === false ? (
                <span className="text-red-500 ml-1">*</span>
              ) : (
                ""
              )}
            </Label>
            <Input
              type="date"
              value={fromUserDate}
              onChange={(e) => setFromUserDate(e.target.value)}
              className="col-span-2"
            />
            <Label className="text-center">
              To{" "}
              {thisMonthUserSwitch === false ? (
                <span className="text-red-500 ml-1">*</span>
              ) : (
                ""
              )}
            </Label>
            <Input
              type="date"
              value={toUserDate}
              onChange={(e) => setToUserDate(e.target.value)}
              className="col-span-2"
            />
            <Label className="text-center col-span-1">This Month</Label>
            <Switch
              className="col-span-1"
              id="airplane-mode"
              checked={thisMonthUserSwitch}
              onCheckedChange={handleUserSwitchChange}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Link
            href={`/reports/attendanceReport/generateReport?email=${userEmail}`}
            className="ml-auto"
          >
            <Button className="ml-auto">Generate Report</Button>
          </Link>
        </CardFooter>
      </Card>
      <div style={{ display: "flex", alignItems: "center", margin: "1rem 0" }}>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ccc" }} />
        <span style={{ margin: "0 1rem", color: "#888" }}>OR</span>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ccc" }} />
      </div>
      <Card>
        <CardHeader>
          <CardDescription>Generate Report based on Team</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="grid grid-cols-12 items-center gap-4 mr-1">
            <Label className="text-center col-span-1">
              Team <span className="text-red-500 ml-1">*</span>
            </Label>
            <Popover open={openTeam} onOpenChange={setTeamOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[200px] justify-between col-span-2"
                >
                  {teamId !== ""
                    ? teamList?.find((team) => String(team.id) === teamId)?.name
                    : "Find Team"}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 ">
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
                            setTeamId(String(team.id));
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
            <Label className="text-center col-span-1">
              From
              {thisMonthTeamSwitch === false ? (
                <span className="text-red-500 ml-1">*</span>
              ) : (
                ""
              )}
            </Label>
            <Input
              type="date"
              value={fromTeamDate}
              onChange={(e) => setFromTeamDate(e.target.value)}
              className="col-span-2"
            />
            <Label className="text-center col-span-1">
              To
              {thisMonthTeamSwitch === false ? (
                <span className="text-red-500 ml-1">*</span>
              ) : (
                ""
              )}
            </Label>
            <Input
              type="date"
              value={toTeamDate}
              onChange={(e) => setToTeamDate(e.target.value)}
              className="col-span-2"
            />
            <Label className="text-center col-span-1">This Month</Label>
            <Switch
              className="col-span-1"
              id="airplane-mode"
              checked={thisMonthTeamSwitch}
              onCheckedChange={handleTeamSwitchChange}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Link
            href={`/reports/attendanceReport/generateReport?email=${userEmail}`}
            className="ml-auto"
          >
            <Button className="ml-auto">Generate Report</Button>
          </Link>
        </CardFooter>
      </Card>
      <div style={{ display: "flex", alignItems: "center", margin: "1rem 0" }}>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ccc" }} />
        <span style={{ margin: "0 1rem", color: "#888" }}>OR</span>
        <hr style={{ flex: 1, border: "none", borderTop: "1px solid #ccc" }} />
      </div>
      <Card>
        <CardHeader>
          <CardDescription>Generate report for all Users</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="grid grid-cols-8 items-center gap-4 mr-1">
            <Label className="text-center col-span-1">From</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="col-span-2"
            />
            <Label className="text-center col-span-1">To</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="col-span-2"
            />
            <Label className="text-center col-span-1">This Month</Label>
            <Switch
              className="col-span-1"
              id="airplane-mode"
              checked={thisMonthSwitch}
              onCheckedChange={handleSwitchChange}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Link
            href={`/reports/attendanceReport/generateReport?email=${userEmail}`}
            className="ml-auto"
          >
            <Button className="ml-auto">Generate Report</Button>
          </Link>{" "}
        </CardFooter>
      </Card>
    </>
  );
};

export default ReportsDialog;
