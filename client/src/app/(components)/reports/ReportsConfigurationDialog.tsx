import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/Header/DateRangePicker";
import { Autocomplete, Stack, TextField } from "@mui/material";

type Props = {
  name: string;
};

const ReportsConfigurationDialog = ({ name }: Props) => {
  const [projectTeam, setProjectTeam] = useState("");
  const [reportDuration, setReportDuration] = useState("");

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
                                onValueChange={(value) =>
                                  setProjectTeam(value)
                                }
                              >
                                <SelectTrigger className="col-span-3 p-2 border rounded-md">
                                  <SelectValue placeholder="Team/Project" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Priority</SelectLabel>
                                    <SelectItem value="Urgent">
                                      Urgent
                                    </SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">
                                      Medium
                                    </SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Backlog">
                                      Backlog
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <Label className="text-center">Report Duration</Label>
                              <Select
                                value={reportDuration}
                                onValueChange={(value) =>
                                  setReportDuration(value)
                                }
                              >
                                <SelectTrigger className="col-span-3 p-2 border rounded-md">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Daily">
                                      Daily Report
                                    </SelectItem>
                                    <SelectItem value="LastWeek">Last One week</SelectItem>
                                    <SelectItem value="LastMonth">
                                      Last One Month
                                    </SelectItem>
                                    
                                </SelectContent>
                              </Select>
                              {/* <Stack spacing={3} className="w-[100%]">
      <Autocomplete
        multiple
        id="tags-standard"
        limitTags={2}
        options={[]}
        // onChange={}
        getOptionLabel={(option) => option.title}
        value={value} 
        isOptionEqualToValue={(option, value) => option.title === value.title}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label={label}
            placeholder={placeholder}
          />
        )}
      />
    </Stack> */}
                              </div>
      </CardContent>

      <CardFooter>
        <CardDescription>
            The Report will be sent to the email of configured people daily at 8 PM
        </CardDescription>
        <Button className="ml-auto">Save Configuration</Button>
      </CardFooter>
    </Card>
  );
};

export default ReportsConfigurationDialog;
