"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
import { useGetUserListFilterQuery } from "@/store/api";

type Props = {
  setValue: React.Dispatch<React.SetStateAction<number>>;
  value: number;
  email: string;
};

export function UserSelectionFilter({ setValue, value, email }: Props) {
  const [open, setOpen] = React.useState(false);

  const { data, isLoading, error, isSuccess } = useGetUserListFilterQuery(
    {
      email: email!,
    },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? data?.find((framework) => framework.userId === value)?.username
            : "Select User"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
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
                    setValue(user.userId);
                    setOpen(false);
                  }}
                >
                  {user.username}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === user.userId ? "opacity-100" : "opacity-0"
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
