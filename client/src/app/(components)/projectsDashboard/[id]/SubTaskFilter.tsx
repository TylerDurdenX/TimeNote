"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  isTaskOrSubTask: string;
  setIsTaskOrSubTask: (isTask: string) => void;
  email: string;
  setPriority: (priorityName: string) => void;
};

export function SubTaskFilter({
  isTaskOrSubTask,
  setIsTaskOrSubTask,
  email,
  setPriority,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const frameworks = [
    {
      value: "Task",
      label: "Task",
    },
    {
      value: "SubTask",
      label: "Sub Task",
    },
  ];

  React.useEffect(() => {
    sessionStorage.setItem("isTask", "1");
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[130px] justify-between"
        >
          {isTaskOrSubTask
            ? frameworks.find(
                (framework) => framework.value === isTaskOrSubTask
              )?.label
            : "Task"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[130px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.label}
                  value={framework.value}
                  onSelect={(currentValue) => {
                    setIsTaskOrSubTask(currentValue);
                    sessionStorage.setItem(
                      "isTask",
                      currentValue === "Task" ? "1" : "0"
                    );
                    if (currentValue === "SubTask") {
                      setPriority("");
                    }
                    setOpen(false);
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      isTaskOrSubTask === framework.value
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
  );
}
