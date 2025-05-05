import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AmPmCarousel, TimeCarousel } from "./TimeCarousal";
import {
  useCreateAutoReportMutation,
  useGetPMListFilterQuery,
  useGetProjectNamesQuery,
  useGetTeamListFilterQuery,
  useGetUserListFilterQuery,
} from "@/store/api";
import { useSearchParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import LimitTags from "./projectReport/generateReport/AutoComplete";

type Props = {
  name: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ReportsConfigurationDialog = ({ name, isOpen, setIsOpen }: Props) => {
  const [projectTeam, setProjectTeam] = useState("");
  const [reportDuration, setReportDuration] = useState("LastMonth");
  const [time, setTime] = useState("");
  const [period, setPeriod] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [value, setValue] = useState("");
  const [openTeam, setTeamOpen] = useState(false);
  const [dropdownTeamName, setDropdownTeamName] = useState("");
  const [isAllUsersChecked, setIsAllUsersChecked] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<any[]>([]);
  const [projectIdList, setProjectIdList] = useState<number[]>([]);

  useEffect(() => {
    if (Array.isArray(selectedProjects)) {
      const ids = selectedProjects.map((item) => item.id);
      setProjectIdList(ids);
    }
  }, [selectedProjects]);

  const [open, setOpen] = useState(false);
  const isValueSelected = () => {
    return (
      (selectedUserEmail && reportDuration && time && period) ||
      (dropdownTeamName && reportDuration && time && period) ||
      (isAllUsersChecked && reportDuration && time && period)
    );
  };

  const userEmail = useSearchParams().get("email");

  const handleToggle = (checked: boolean) => {
    setIsAllUsersChecked(checked);
    setSelectedUserEmail("");
    setDropdownTeamName("");
  };

  const handleTeamClick = () => {
    setSelectedUserEmail("");
  };

  const [createAutoReportConfig, { isLoading }] = useCreateAutoReportMutation();

  const saveConfig = async () => {
    const reportConfig = {
      email: userEmail!,
      teamName: dropdownTeamName!,
      userEmail: selectedUserEmail,
      reportDuration: reportDuration!,
      allUsersFlag: isAllUsersChecked,
      time: time!,
      period: period!,
      reportName: name.replace(/\s+/g, "")!,
    };
    try {
      const response = await createAutoReportConfig(reportConfig);

      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
        setIsOpen(false);
      } else {
        // @ts-ignore
        toast.success(response.data?.message);
        setIsOpen(false);
      }
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  const { data: teamList } = useGetTeamListFilterQuery(
    {
      email: userEmail!,
    },
    { refetchOnMountOrArgChange: true }
  );
  const { data, error, isSuccess } = useGetUserListFilterQuery({
    email: userEmail!,
  });

  const handleSave = () => {
    saveConfig();
    setIsOpen(false);
  };

  const { data: projectsList } = useGetProjectNamesQuery({
    refetchOnMountOrArgChange: true,
  });
  const { data: PMList } = useGetPMListFilterQuery({
    email: userEmail!,
  });

  return (
    <Card>
      {name === "Project Report" ? (
        <>
          <CardHeader>
            <CardTitle>Configure {name}</CardTitle>
            <CardDescription>
              Please provide the below data to configure auto-generation of{" "}
              {name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-6 items-center gap-4 mr-1">
              <Label className="text-center ml-2">Project Manager</Label>
              <Select
                value={selectedUserEmail}
                onValueChange={(value) => {
                  setSelectedUserEmail(value);
                  setDropdownTeamName("");
                  setIsAllUsersChecked(false);
                }}
              >
                <SelectTrigger className="col-span-2 p-2 border rounded-md">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {PMList?.map((user) => (
                    <SelectItem key={user.userId} value={user.email}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className=""></div>

              <div className=" ml-2">
                <div className="">
                  <Label htmlFor="airplane-mode" className="">
                    All Ongoing Projects
                  </Label>
                </div>
              </div>
              <div className="w-1/6 flex flex-col justify-center gap-4 p-4">
                <div className="">
                  <Switch
                    className="ml-2"
                    id="airplane-mode"
                    checked={isAllUsersChecked}
                    onCheckedChange={handleToggle}
                  />
                </div>
              </div>
              <Label className="text-center">Set Time</Label>
              <TimeCarousel
                time={time}
                setTime={setTime}
                period={period}
                setPeriod={setPeriod}
              />
              <AmPmCarousel
                time={time}
                setTime={setTime}
                period={period}
                setPeriod={setPeriod}
              />
            </div>
          </CardContent>

          <CardFooter>
            <CardDescription>
              The Report will be sent to your email at the configured time
            </CardDescription>
            <Button
              className="ml-auto"
              onClick={handleSave}
              disabled={!isValueSelected()}
            >
              Save Configuration
            </Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader>
            <CardTitle>Configure {name}</CardTitle>
            <CardDescription>
              Please provide the below data to configure auto-generation of{" "}
              {name}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="grid grid-cols-8 items-center gap-4 mr-1">
              <Label className="text-center">Team</Label>
              <Select
                value={dropdownTeamName}
                onValueChange={(value) => {
                  setDropdownTeamName(value);
                  setSelectedUserEmail("");
                  setIsAllUsersChecked(false);
                }}
              >
                <SelectTrigger className="col-span-2 p-2 border rounded-md">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>

                <SelectContent>
                  {teamList?.map((team) => (
                    <SelectItem key={team.id} value={team.name}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Label className="text-center ml-2">User</Label>
              <Select
                value={selectedUserEmail}
                onValueChange={(value) => {
                  setSelectedUserEmail(value);
                  setDropdownTeamName("");
                  setIsAllUsersChecked(false);
                }}
              >
                <SelectTrigger className="col-span-2 p-2 border rounded-md">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {data?.map((user) => (
                    <SelectItem key={user.userId} value={user.email}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <Label className="ml-5 col-span-2 p-2">Report Duration</Label>
          <Select
            value={reportDuration}
            onValueChange={(value) => setReportDuration(value)}
          >
            <SelectTrigger className="col-span-2 p-2 border rounded-md">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LastMonth">Monthly Report</SelectItem>
            </SelectContent>
          </Select> */}
              <div className=" ml-5">
                <div className="">
                  <Label htmlFor="airplane-mode" className="">
                    All Users
                  </Label>
                </div>
              </div>
              <div className="w-1/6 flex flex-col justify-center gap-4 p-4">
                <div className="">
                  <Switch
                    className="ml-5"
                    id="airplane-mode"
                    checked={isAllUsersChecked}
                    onCheckedChange={handleToggle}
                  />
                </div>
              </div>
              <Label className="text-center">Set Time</Label>
              <TimeCarousel
                time={time}
                setTime={setTime}
                period={period}
                setPeriod={setPeriod}
              />
              <AmPmCarousel
                time={time}
                setTime={setTime}
                period={period}
                setPeriod={setPeriod}
              />
            </div>
          </CardContent>

          <CardFooter>
            <CardDescription>
              The Report will be sent to your email at the configured time
            </CardDescription>
            <Button
              className="ml-auto"
              onClick={handleSave}
              disabled={!isValueSelected()}
            >
              Save Configuration
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default ReportsConfigurationDialog;
