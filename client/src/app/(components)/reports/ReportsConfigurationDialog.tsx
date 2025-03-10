import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster , toast} from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AmPmCarousel, TimeCarousel } from "./TimeCarousal";
import { useCreateAutoReportMutation } from "@/store/api";
import { useSearchParams } from "next/navigation";

type Props = {
  name: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ReportsConfigurationDialog = ({ name, isOpen, setIsOpen }: Props) => {
  const [projectTeam, setProjectTeam] = useState("");
  const [reportDuration, setReportDuration] = useState("");
  const [time, setTime] = useState("");
  const [period, setPeriod] = useState("");
  const isValueSelected = () => {
    return projectTeam && reportDuration && time && period
  };

  const userEmail = useSearchParams().get("email")

    const [createAutoReportConfig, { isLoading}] =
      useCreateAutoReportMutation();

      const saveConfig = async () => {
        const reportConfig = {
          email: userEmail!,
          projectTeam: projectTeam!,
          reportDuration: reportDuration!,
          time: time!,
          period: period!,
          reportName: (name).replace(/\s+/g, '')!
        };
        try {
          const response = await createAutoReportConfig(reportConfig);

          // @ts-ignore
          if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
            // @ts-ignore
            toast.error(response.error?.data.message)
          }else{
            // @ts-ignore
            toast.success(response.data?.message);
          }
        } catch (err: any) {
          toast.error(err.data.message);
          console.error("Error creating role:", err.data.Message);
        }
      };

      const handleSave = () => {
        saveConfig();  
        setIsOpen(false);  
      };

  return (
        <Card>
          <CardHeader>
            <CardTitle>Configure {name}</CardTitle>
            <CardDescription>
              Please provide the below data to configure auto-generation of {name}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="grid grid-cols-8 items-center gap-4 mr-1">
              <Label className="text-center">Team or Project</Label>
              <Select
                value={projectTeam}
                onValueChange={(value) => setProjectTeam(value)}
              >
                <SelectTrigger className="col-span-3 p-2 border rounded-md">
                  <SelectValue placeholder="Team/Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Priority</SelectLabel>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Backlog">Backlog</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label className="text-center">Report Duration</Label>
              <Select
                value={reportDuration}
                onValueChange={(value) => setReportDuration(value)}
              >
                <SelectTrigger className="col-span-3 p-2 border rounded-md">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily Report</SelectItem>
                  <SelectItem value="LastWeek">Last One week</SelectItem>
                  <SelectItem value="LastMonth">Last One Month</SelectItem>
                </SelectContent>
              </Select>
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
        </Card>
      
  );
};

export default ReportsConfigurationDialog;
