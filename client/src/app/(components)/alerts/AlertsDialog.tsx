import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  useCreateActiveTimeAlertMutation,
  useCreateProjectTimelineAlertMutation,
  useCreateTimesheetAlertMutation,
} from "@/store/api";

type Props = {
  name: string;
  email: string;
  setIsOpen: (isOpen: boolean) => void;
};

const AlertsDialog = ({ name, email, setIsOpen }: Props) => {
  const [value, setValue] = React.useState("");
  const [timesheetHours, setTimesheetHours] = React.useState("");
  const [activeHours, setActiveHours] = React.useState("");
  const [createActiveTimeALert, isLoading] = useCreateActiveTimeAlertMutation();
  const [createTimesheetAlert] = useCreateTimesheetAlertMutation();
  const [createProjectTimelineAlert] = useCreateProjectTimelineAlertMutation();

  const handleActiveTimeSubmit = async () => {
    const data = {
      email: email!,
      activeTime: activeHours!,
    };
    try {
      const response = await createActiveTimeALert(data);
      setActiveHours("");

      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        // @ts-ignore
        toast.success(response.data?.message);
      }
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating Alert:", err.data.Message);
    }
  };

  const handleTimesheetAlertSubmit = async () => {
    const data = {
      email: email!,
      timesheetHours: timesheetHours!,
    };
    try {
      const response = await createTimesheetAlert(data);
      setTimesheetHours("");

      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        // @ts-ignore
        toast.success(response.data?.message);
      }
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating Alert:", err.data.Message);
    }
  };

  const handleProjectTimelineAlertSubmit = async () => {
    const data = {
      email: email!,
      completionPercentage: value!,
    };
    try {
      const response = await createProjectTimelineAlert(data);
      setTimesheetHours("");

      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        // @ts-ignore
        toast.success(response.data?.message);
      }
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating Alert:", err.data.Message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Only allow digits
    if (/^\d*$/.test(input)) {
      const num = parseInt(input, 10);

      if (input === "" || (!isNaN(num) && num < 100)) {
        setValue(input);
      } else {
        toast.error("Number must be less than 100");
      }
    } else {
      toast.error("Only digits are allowed");
    }
  };

  const handleTimesheetHoursChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = e.target.value;

    // Only allow digits
    if (/^\d*$/.test(input)) {
      const num = parseInt(input, 10);

      if (input === "" || (!isNaN(num) && num < 10)) {
        setTimesheetHours(input);
      } else {
        toast.error("Number must be less than 10");
      }
    } else {
      toast.error("Only digits are allowed");
    }
  };

  const handleActiveHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Only allow digits
    if (/^\d*$/.test(input)) {
      const num = parseInt(input, 10);

      if (input === "" || (!isNaN(num) && num < 10)) {
        setActiveHours(input);
      } else {
        toast.error("Number must be less than 10");
      }
    } else {
      toast.error("Only digits are allowed");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Configure {name}</CardTitle>
          <CardDescription>
            Please provide the below data and click on save configuration to
            create a new alert.
          </CardDescription>
        </CardHeader>
        {name === "Project Timeline Alert" ? (
          <>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-5 items-center gap-4 mr-1">
                <Label className="text-center">% Completion</Label>
                <Input
                  placeholder="Please enter digits"
                  value={value}
                  onChange={handleChange}
                  className="col-span-3"
                />
                <div></div>
              </div>
            </CardContent>

            <CardFooter>
              {value !== "" ? (
                <div className="mr-5">
                  Alert will be triggered when {value}% project time is passed
                  and the completion status of any project is not {value}%
                </div>
              ) : (
                ""
              )}
              <Button
                className="ml-auto"
                onClick={handleProjectTimelineAlertSubmit}
              >
                Save Configuration
              </Button>
            </CardFooter>
          </>
        ) : (
          ""
        )}
        {name === "Timesheet Alert" ? (
          <>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-5 items-center gap-4 mr-1">
                <Label className="text-center">Logged Hours</Label>
                <Input
                  placeholder="Please enter a digit"
                  value={timesheetHours}
                  onChange={handleTimesheetHoursChange}
                  className="col-span-3"
                />
                <div></div>
              </div>
            </CardContent>

            <CardFooter>
              {timesheetHours !== "" ? (
                <div className="mr-5">
                  Alert will be triggered when any user has less than{" "}
                  {timesheetHours} hours logged for a working day
                </div>
              ) : (
                ""
              )}
              <Button className="ml-auto" onClick={handleTimesheetAlertSubmit}>
                Save Configuration
              </Button>
            </CardFooter>
          </>
        ) : (
          ""
        )}
        {name === "Active Time Alert" ? (
          <>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-5 items-center gap-4 mr-1">
                <Label className="text-center">Active Hours</Label>
                <Input
                  placeholder="Please enter a digit"
                  value={activeHours}
                  onChange={handleActiveHoursChange}
                  className="col-span-3"
                />
                <div></div>
              </div>
            </CardContent>

            <CardFooter>
              {activeHours !== "" ? (
                <div className="mr-5">
                  Alert will be triggered when any user has less than{" "}
                  {activeHours} hours of active time logged for a working day
                </div>
              ) : (
                ""
              )}
              <Button className="ml-auto" onClick={handleActiveTimeSubmit}>
                Save Configuration
              </Button>
            </CardFooter>
          </>
        ) : (
          ""
        )}
      </Card>
    </>
  );
};

export default AlertsDialog;
