"use client";

import Header from "@/components/Header";
import { useGetProjectTasksQuery } from "@/store/api";
import React from "react";
import * as XLSX from "xlsx-js-style";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TaskPage from "./TaskPage";
import { useSearchParams } from "next/navigation";
import { Button } from "@mui/material";
import { FileDown } from "lucide-react";
import CircularLoading from "@/components/Sidebar/loading";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import SubTaskPage from "./(SubTask)/SubTaskPage";
import Link from "next/link";

type Props = {
  projectId: string;
  sprint: string;
  assignedTo: string;
  priority: string;
  isTaskOrSubTask: string;
  openViewOnly: boolean;
};

const TableView = ({
  projectId,
  sprint,
  assignedTo,
  priority,
  isTaskOrSubTask,
  openViewOnly,
}: Props) => {
  const userEmail = useSearchParams().get("email");
  localStorage.removeItem("persist:root");
  localStorage.removeItem("ally-supports-cache");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      flex: 0.8,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.9,
      renderCell: (params) => {
        let bgColor, textColor;

        switch (params.value) {
          case "To Do":
            bgColor = "#2563EB";
            textColor = "#ffffff";
            break;
          case "Work In Progress":
            bgColor = "#059669";
            textColor = "#ffffff";
            break;
          case "Under Review":
            bgColor = "#D97706";
            textColor = "#ffffff";
            break;
          case "Completed":
            bgColor = "#000000";
            textColor = "#ffffff";
            break;
          default:
            bgColor = "#E5E7EB";
            textColor = "#000000";
        }

        return (
          <span
            className="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
            style={{
              backgroundColor: bgColor,
              color: textColor,
            }}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.6,
      renderCell: (params) => {
        const priority = params.value;

        let bgColor, textColor;

        switch (priority) {
          case "Urgent":
            bgColor = "bg-red-200";
            textColor = "text-red-700";
            break;
          case "High":
            bgColor = "bg-orange-200";
            textColor = "text-orange-700";
            break;
          case "Medium":
            bgColor = "bg-yellow-200";
            textColor = "text-yellow-700";
            break;
          case "Low":
            bgColor = "bg-green-200";
            textColor = "text-green-700";
            break;
          default:
            bgColor = "bg-blue-200";
            textColor = "text-blue-700";
        }

        return (
          <span
            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${bgColor} ${textColor}`}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      field: "tags",
      headerName: "Tags",
      flex: 0.8,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 0.6,
      renderCell: (params) => {
        return formatDate(params.value);
      },
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 0.6,
      renderCell: (params) => {
        return formatDate(params.value);
      },
    },
    {
      field: "points",
      headerName: "Estimated",
      flex: 0.5,
    },
    {
      field: "consumedHours",
      headerName: "Consumed",
      flex: 0.6,
    },
    {
      field: "hoursOverrun",
      headerName: "Overrun",
      flex: 0.5,
    },
    {
      field: "assignee",
      headerName: "Assignee",
      flex: 0.8,
      renderCell: (params) => params.value.username || "Unassigned",
    },
    {
      field: "taskId",
      headerName: "",
      flex: 0.7,
      renderCell: (params) => {
        return (
          <div className="flex justify-center items-center h-full">
            {openViewOnly === true ? (
              <>
                <Link href={`/task/${params.row.code}?email=${userEmail}`}>
                  <Button
                    variant="contained"
                    className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-6 py-2 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105"
                    onClick={() => {
                      sessionStorage.setItem("taskId", params.row.id);
                    }}
                  >
                    View
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Dialog>
                  <div className="my-3 flex justify-between">
                    <DialogTrigger asChild>
                      <Button
                        variant="contained"
                        className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-6 py-2 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105"
                      >
                        View
                      </Button>
                    </DialogTrigger>
                  </div>
                  <DialogContent className="max-w-[85vw] mt-5 mb-5 overflow-y-auto">
                    {isTaskOrSubTask === "Task" ? (
                      <TaskPage
                        taskId={params.row.id}
                        email={userEmail!}
                        projectId={params.row.projectId}
                      />
                    ) : (
                      <SubTaskPage
                        subTaskId={params.row.id}
                        email={userEmail!}
                        projectId={params.row.projectId}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const {
    data: tasks,
    isLoading,
    error,
  } = useGetProjectTasksQuery(
    {
      projectId: projectId,
      sprint,
      assignedTo,
      priority,
      isTaskOrSubTask,
      email: userEmail!,
      page: 1,
      limit: 9999999999,
    },
    { refetchOnMountOrArgChange: true }
  );

  const formatDateToDDMMYYYY = (isoDate: string): string => {
    const date = new Date(isoDate);

    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", isoDate);
      return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const removeColumns = (data: any[], columnsToExclude: string[]) => {
    return data.map((item) => {
      let newItem = { ...item };
      columnsToExclude.forEach((col) => {
        delete newItem[col];
      });
      return newItem;
    });
  };

  const handleExportToExcel = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const columnsToExclude = [
      "projectId",
      "authorUserId",
      "assignedUserId",
      "sprintId",
      "author",
      "comments",
    ];
    const filteredData = removeColumns(tasks?.tasks || [], columnsToExclude);

    const flattenedTasks = filteredData.map((task) => {
      return {
        Title: task.title,
        Description: task.description,
        "Task Status": task.status,
        "Task Priority": task.priority,
        Tags: task.tags,
        "Start Date (DD/MM/YYYY)": formatDateToDDMMYYYY(task.startDate),
        "Due Date (DD/MM/YYYY)": formatDateToDDMMYYYY(task.dueDate),
        "Estimated Hours": task.points,
        "Consumed Hours (HH:MM:SS)": task.consumedHours,
        "Hours Overrun (HH:MM:SS)": task.hoursOverrun,
        "Assignee Name": task.assignee.username,
        "Assignee Email": task.assignee.email,
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
  const { theme } = useTheme();

  let isDarkMode = theme === "dark";

  const getRowClassName = (params: GridRowParams) => {
    if (params.row.hoursOverrun !== 0) {
      if (isTaskOrSubTask === "Task") {
        return "bg-red-100";
      }
    }
    return ""; // Return empty string for default style
  };

  if (isLoading)
    return (
      <div>
        <CircularLoading />
      </div>
    );
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <div className="h-full px-4 pb-8 xl:px-6">
      <div className="pt-5 flex justify-between items-center mb-2">
        <Header name="Table" isSmallText />

        <button
          className="flex items-center justify-center text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-6 py-2 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 whitespace-nowrap"
          style={{ height: "50px", padding: "0 16px" }}
          onClick={handleExportToExcel}
        >
          <FileDown size={25} />
          <span className="ml-2">Export to Excel</span>
        </button>
      </div>
      <Card>
        <DataGrid
          rows={tasks?.tasks || []}
          columns={columns}
          className={dataGridClassNames}
          //sx={dataGridSxStyles(isDarkMode)}
          getRowClassName={getRowClassName}
        />
      </Card>
    </div>
  );
};

export default TableView;
