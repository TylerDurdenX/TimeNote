"use client";

import * as React from "react";
import { Check, ChevronsUpDown, SquarePen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  useGetProjectSprintQuery,
  useGetSprintQuery,
  useUpdateProjectSprintMutation,
} from "@/store/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { CircularProgress } from "@mui/material";

type Props = {
  sprint: string;
  setSprint: (assignedTo: string) => void;
  projectId: string;
};

export function SprintFilter({ sprint, setSprint, projectId }: Props) {
  const [open, setOpen] = React.useState(false);

  const [isOpen, setIsOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [sprintId, setSprintId] = React.useState(0);
  const [updateSprint, { isLoading: isLoadingUpdateSprint }] =
    useUpdateProjectSprintMutation();

  const isFormValid = () => {
    return title && description && startDate && endDate;
  };

  const userEmail = sessionStorage.getItem("email");
  const projectName = sessionStorage.getItem("projectName");

  const { data, isLoading, isError } = useGetSprintQuery({
    projectId: projectId,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = {
      title: title!,
      description: description!,
      startDate: startDate!,
      endDate: endDate!,
      sprintId: Number(sprintId)!,
      email: userEmail!,
      projectName: projectName!,
    };
    try {
      const response = await updateSprint(formData);
      if (
        // @ts-ignore
        response.error?.data.status === "Fail" ||
        // @ts-ignore
        response.error?.data.status === "Error"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        toast.success(response.data?.message!);
      }
      setOpen(false);
      setSprintId(0);
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message.message);
      console.error("Error creating sprint:", err.data.Message);
    }
  };

  const {
    data: sprintData,
    isLoading: loading,
    refetch,
  } = useGetProjectSprintQuery(
    { sprintId: sprintId },
    { refetchOnMountOrArgChange: true }
  );

  React.useEffect(() => {
    refetch;

    if (sprintData) {
      setTitle(sprintData?.title!);
      setDescription(sprintData?.description!);
      const formattedStartDate = new Date(sprintData?.startDate!)
        .toISOString()
        .split("T")[0];
      setStartDate(formattedStartDate);
      const formattedEndDate = new Date(sprintData?.endDate!)
        .toISOString()
        .split("T")[0];
      setEndDate(formattedEndDate);
    }
  }, [sprintId, sprintData]);

  return (
    <Popover open={open} onOpenChange={(isOpen) => setOpen(isOpen)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[180px] justify-between"
        >
          {sprint
            ? data?.find((s) => s.id === Number(sprint))?.title
            : "Select Sprint"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {data?.map((sprintItem) => (
                <CommandItem
                  key={sprintItem.id}
                  value={String(sprintItem.id)}
                  onSelect={(currentValue) => {
                    setSprint(currentValue === sprint ? "" : currentValue);
                    setOpen(false); // Close Popover on selection
                  }}
                >
                  {sprintItem.title}
                  {/* Open Dialog on Edit */}
                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                      <button
                        className="ml-auto"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent event from propagating to the parent CommandItem
                          setIsOpen(true); // Open the dialog
                          setSprintId(sprintItem.id);
                        }}
                      >
                        <SquarePen />
                      </button>
                    </DialogTrigger>
                    {loading ? (
                      <CircularProgress />
                    ) : (
                      <DialogContent
                        className="sm:max-w-[42vw] lg:max-w-[42vw] max-h-[29vw] overflow-auto"
                        onClick={(e) => e.stopPropagation()} // Prevent event propagation from DialogContent
                      >
                        <DialogHeader>
                          <DialogTitle className="mb-2">
                            Update Sprint
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                          <div className="grid gap-4 py-3">
                            <div className="grid grid-cols-8 items-center gap-4 mr-1">
                              <Label className="text-center">
                                Sprint Title
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="col-span-7"
                                required
                              />

                              <Label className="text-center">
                                Description
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-7 shadow border"
                                required
                              />
                              <Label className="text-center">
                                Start Date
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="col-span-3"
                                required
                              />

                              <Label className="text-center">
                                End Date
                                <span className="text-red-500 ml-1">*</span>
                              </Label>
                              <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="col-span-3"
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <button
                              type="submit"
                              className={`flex w-200px mt-7 justify-center bg-blue-600 rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
                          hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
                            !isFormValid() || isLoadingUpdateSprint
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                              disabled={!isFormValid() || isLoadingUpdateSprint}
                            >
                              {isLoadingUpdateSprint
                                ? "Updating..."
                                : "Update Sprint"}
                            </button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    )}
                  </Dialog>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
