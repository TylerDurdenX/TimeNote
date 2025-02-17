"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useGetSprintQuery } from "@/store/api"

type Props = {
  sprint: string
  setSprint: (assignedTo: string) => void
  projectId: string
}

export function SprintFilter({sprint, setSprint, projectId}: Props) {
  const [open, setOpen] = React.useState(false)

  const {data, isLoading, isError} = useGetSprintQuery({projectId: projectId })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[150px] justify-between"
        >
          {sprint
      ? data?.find((s) => s.id === Number(sprint))?.title
      : "Select Sprint"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[150px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {data?.map((sprintItem) => (
                <CommandItem
                key={sprintItem.title}
                value={String(sprintItem.id)}
                onSelect={(currentValue) => {
                  setSprint(currentValue === sprint ? "" : currentValue);
                  setOpen(false);
                }}
              >
                {sprintItem.title}
                <Check
                  className={cn(
                    "ml-auto",
                    sprint === sprintItem.title ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
