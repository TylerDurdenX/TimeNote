"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx-js-style";
import {
  Check,
  ChevronLeft,
  ChevronsUpDown,
  FileDown,
  FilterX,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  useGetPMListFilterQuery,
  useGetProjectNamesQuery,
  useGetProjectReportQuery,
  useGetProjectsQuery,
} from "@/store/api";

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
import LimitTags from "./AutoComplete";
import { Button } from "@/components/ui/button";
import ProjectReportTable from "./ProjectReportTable";
import { cn } from "@/lib/utils";

const page = () => {
  const userEmail = useSearchParams().get("email");

  const { data: projectsList } = useGetProjectNamesQuery({
    refetchOnMountOrArgChange: true,
  });
  const { data, isLoading, error, isSuccess } = useGetPMListFilterQuery({
    email: userEmail!,
  });

  const [dropdownTeamName, setDropdownTeamName] = useState("");
  const [value, setValue] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [downloadUserReportClicked, setDownloadUserReportClicked] = useState(0);
  const [downloadTeamReportClicked, setDownloadTeamReportClicked] = useState(0);
  const [selectedProjects, setSelectedProjects] = useState<any[]>([]);
  const [projectIdList, setProjectIdList] = useState<number[]>([]);
  const [onBlurFlag, setOnBlurFlag] = useState(0);

  useEffect(() => {
    if (Array.isArray(selectedProjects)) {
      const ids = selectedProjects.map((item) => item.id);
      setProjectIdList(ids);
    }
  }, [selectedProjects]);

  const { data: projectData, refetch } = useGetProjectReportQuery(
    { idList: projectIdList!, projectManager: selectedUserEmail },
    { refetchOnMountOrArgChange: true }
  );

  const handleExportToExcel = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const flattenedTasks = projectData?.map((project) => {
      return {
        "Project Name": project.name,
        Description: project.description,
        "Client Name": project.clientName,
        Status: project.status,
        "Start Date (DD/MM/YYYY)": project.startDate,
        "Due Date (DD/MM/YYYY)": project.dueDate,
        "Project Manager": project.projectManager,
        "Estimated Hours (HH:MM:SS)": project.estimatedHours,
        "Consumed Hours (HH:MM:SS)": project.consumedHours,
        "Hours Overrun (HH:MM:SS)": project.hoursOverrun,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(flattenedTasks || []);

    // Apply styles to header row
    const headers = Object.keys(flattenedTasks?.[0] || {});
    headers.forEach((header, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      const cell = worksheet[cellRef];
      if (cell) {
        cell.s = {
          fill: { fgColor: { rgb: "D9D9D9" } }, // Light gray background
          font: { bold: true },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }
    });

    // Apply borders to all data cells
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell) {
          cell.s = {
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          };
        }
      }
    }

    // Create workbook and append sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Set workbook styles
    worksheet["!cols"] = headers.map(() => ({ wch: 20 })); // Set column width

    // Write the file
    XLSX.writeFile(workbook, "project-data-export.xlsx");
  };

  const clearFilter = () => {
    setSelectedUserEmail("");
    setSelectedProjects([]);
  };

  return (
    <>
      <div className="w-full bg-gray-50">
        {/* Header Section */}
        <div className="w-full mb-5">
          <div className="flex w-full text-gray-900">
            <div className=" pt-1 lg:pt-8 w-full">
              <h1
                className={`text-2xl font-semibold dark:text-white flex items-center`}
              >
                <button onClick={() => window.history.back()}>
                  <ChevronLeft className="mr-5" />
                </button>
                Project Report
              </h1>{" "}
            </div>
          </div>
          <div className="mt-5 ml-5 flex items-center">
            <Label className="justify-center col-span-1 mr-3">Project</Label>
            <LimitTags
              projectFlag={true}
              userEmail={userEmail!}
              setSelectedProjects={setSelectedProjects}
              projectsList={projectsList!}
              selectedList={selectedProjects}
            />
            <Label className="text-center ml-7">Project Manager</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-[200px] justify-between col-span-2 ml-3"
                >
                  {selectedUserEmail
                    ? data?.find(
                        (user) => String(user.userId) === selectedUserEmail
                      )?.username
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
                          value={String(user.username)}
                          onSelect={() => {
                            setSelectedUserEmail(String(user.userId));
                            setDropdownTeamName("");
                            setDownloadTeamReportClicked(0);
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
            <Button
              className="bg-gray-200 hover:bg-gray-300 mt-2 ml-4"
              onClick={clearFilter}
            >
              <FilterX className="text-gray-800" />
            </Button>
            <div className="flex ml-auto items-center px-6">
              <button
                className="flex items-center ml-5  text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 whitespace-nowrap"
                style={{ height: "50px", padding: "0 16px" }}
                onClick={handleExportToExcel}
              >
                <FileDown size={25} />
                <span className="ml-2">Export to Excel</span>
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-rows-1 w-full">
          <div className="h-full overflow-hidden">
            <ProjectReportTable
              email={userEmail!}
              closedProjectFlag={false}
              data={projectData!}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
