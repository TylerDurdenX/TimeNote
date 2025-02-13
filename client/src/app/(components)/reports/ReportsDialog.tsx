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

type Props = {
  name: string;
};

const ReportsDialog = ({ name }: Props) => {
  const [projectTeam, setProjectTeam] = useState("");
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

    const [fromDate, setFromDate] = useState<string>("2000-01-01T00:00:00Z");
    const [toDate, setToDate] = useState<string>("2000-01-01T00:00:00Z");

  const logDateRange = () => {
    if (date?.from && date?.to) {
      const newFromDate = new Date(date.from);
      newFromDate.setDate(newFromDate.getDate() + 1);

      const newToDate = new Date(date.to);
      newToDate.setDate(newToDate.getDate() + 1);

      setFromDate(newFromDate.toISOString().split("T")[0]);
      setToDate(newToDate.toISOString().split("T")[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate {name}</CardTitle>
        <CardDescription>
          Please provide the below data and click on Generate Report Button to
          download the report.
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
                              <Label className="text-center">Time Frame</Label>
                              <DatePickerWithRange
                                          date={date}
                                          setDate={setDate!}
                                          onRangeSelect={logDateRange!}
                                          
                                        />
                                    </div>
      </CardContent>

      <CardFooter>
        <Button className="ml-auto">Generate Report</Button>
      </CardFooter>
    </Card>
  );
};

export default ReportsDialog;
