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
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetUserListFilterQuery } from "@/store/api";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Props = {
  name: string;
  email: string;
};

const ReportsDialog = ({ name, email }: Props) => {
  const [projectTeam, setProjectTeam] = useState("");
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [fromDate, setFromDate] = useState<string>("2000-01-01T00:00:00Z");
  const [toDate, setToDate] = useState<string>("2000-01-01T00:00:00Z");

  const [value, setValue] = React.useState("");

  const [open, setOpen] = React.useState(false);

  const { data, isLoading, error, isSuccess } = useGetUserListFilterQuery({
    email: email!,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate {name}</CardTitle>
        <CardDescription>
          Please provide the below data and click on generate report button to
          download the report.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="grid grid-cols-10 items-center gap-4 mr-1">
          <Label className="text-center">User</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between col-span-2"
              >
                {value
                  ? data?.find((framework) => framework.username === value)
                      ?.username
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
                        value={user.username}
                        onSelect={(currentValue) => {
                          setValue(currentValue);
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
          <Label className="text-center">From</Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="col-span-2"
          />
          <Label className="text-center">To</Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="col-span-2"
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
