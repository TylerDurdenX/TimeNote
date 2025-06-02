"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx-js-style";
import {
  Check,
  ChevronLeft,
  ChevronsUpDown,
  FileDown,
  FilterX,
  User,
  FolderOpen,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  useGetPMListFilterQuery,
  useGetProjectNamesQuery,
  useGetProjectReportQuery,
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

const ProjectReportPage = () => {
  const userEmail = useSearchParams().get("email");

  // API Queries
  const { data: projectsList } = useGetProjectNamesQuery({
    refetchOnMountOrArgChange: true,
  });

  const {
    data: pmListData,
    isLoading,
    error,
    isSuccess,
  } = useGetPMListFilterQuery({
    email: userEmail!,
  });

  // State Management
  const [dropdownTeamName, setDropdownTeamName] = useState("");
  const [value, setValue] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [downloadTeamReportClicked, setDownloadTeamReportClicked] = useState(0);
  const [selectedProjects, setSelectedProjects] = useState<any[]>([]);
  const [projectIdList, setProjectIdList] = useState<number[]>([]);

  // Update project ID list when selected projects change
  useEffect(() => {
    if (Array.isArray(selectedProjects)) {
      const ids = selectedProjects.map((item) => item.id);
      setProjectIdList(ids);
    }
  }, [selectedProjects]);

  // Project report query
  const { data: projectData, refetch } = useGetProjectReportQuery(
    { idList: projectIdList!, projectManager: selectedUserEmail },
    { refetchOnMountOrArgChange: true }
  );

  // Memoized selected user display name
  const selectedUserDisplayName = useMemo(() => {
    if (!selectedUserEmail || !pmListData) return "Find User";
    const user = pmListData.find(
      (user) => String(user.userId) === selectedUserEmail
    );
    return user?.username || "Find User";
  }, [selectedUserEmail, pmListData]);

  // Excel export functionality
  const handleExportToExcel = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (!projectData || projectData.length === 0) {
      console.warn("No data to export");
      return;
    }

    const flattenedTasks = projectData.map((project) => ({
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
    }));

    const worksheet = XLSX.utils.json_to_sheet(flattenedTasks);

    // Apply styles to header row
    const headers = Object.keys(flattenedTasks[0] || {});
    headers.forEach((header, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      const cell = worksheet[cellRef];
      if (cell) {
        cell.s = {
          fill: { fgColor: { rgb: "D9D9D9" } },
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

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Project Report");

    // Set column widths
    worksheet["!cols"] = headers.map(() => ({ wch: 20 }));

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `project-report-${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  // Clear all filters
  const clearFilter = () => {
    setSelectedUserEmail("");
    setSelectedProjects([]);
    setProjectIdList([]);
  };

  // Handle user selection
  const handleUserSelect = (userId: string) => {
    setSelectedUserEmail(userId);
    setDropdownTeamName("");
    setDownloadTeamReportClicked(0);
    setOpen(false);
  };

  // Handle back navigation
  const handleGoBack = () => {
    window.history.back();
  };

  const hasActiveFilters = selectedUserEmail || selectedProjects.length > 0;
  const hasExportableData = projectData && projectData.length > 0;

  return (
    <div className="min-h-screen min-w-full bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="mr-2 p-2 hover:bg-gray-200 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Project Report
            </h1>
          </div>

          {/* Filter Controls */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Project Filter */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                  <FolderOpen className="h-4 w-4" />
                  Projects
                </Label>
                <div className="flex-1 min-w-[200px]">
                  <LimitTags
                    projectFlag={true}
                    userEmail={userEmail!}
                    setSelectedProjects={setSelectedProjects}
                    projectsList={projectsList!}
                    selectedList={selectedProjects}
                  />
                </div>
              </div>

              {/* Project Manager Filter */}
              <div className="flex items-center gap-3 min-w-0">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-700 whitespace-nowrap">
                  <User className="h-4 w-4" />
                  Project Manager
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-[200px] justify-between"
                    >
                      <span className="truncate">
                        {selectedUserDisplayName}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search users..."
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          {pmListData?.map((user) => (
                            <CommandItem
                              key={user.userId}
                              value={user.username}
                              onSelect={() =>
                                handleUserSelect(String(user.userId))
                              }
                            >
                              {user.username}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedUserEmail === String(user.userId)
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
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilter}
                    className="flex items-center gap-2"
                  >
                    <FilterX className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}

                <Button
                  onClick={handleExportToExcel}
                  disabled={!hasExportableData}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileDown className="h-4 w-4" />
                  Export to Excel
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Report Table Section */}
        <main className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="h-full">
            <ProjectReportTable
              email={userEmail!}
              closedProjectFlag={false}
              data={projectData!}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectReportPage;
