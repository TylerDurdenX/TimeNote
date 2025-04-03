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
  assignedTo: string;
  setAssignedTo: (assignedTo: string) => void;
  email: string;
};

export function TaskSelectionFilter({
  assignedTo,
  setAssignedTo,
  email,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const frameworks = [
    {
      value: email,
      label: "Assigned To Me",
    },
    {
      value: "X",
      label: "All Tasks",
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[150px] justify-between"
        >
          {assignedTo
            ? frameworks.find((framework) => framework.value === assignedTo)
                ?.label
            : "Select Assigned To"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[150px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {frameworks.map((framework) => (
                <CommandItem
                  key={framework.value} // use value as key for uniqueness
                  value={framework.value}
                  onSelect={() => {
                    // Directly set the assignedTo value or clear it if it's already selected
                    setAssignedTo(framework.value);
                    setOpen(false);
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      assignedTo === framework.value
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
