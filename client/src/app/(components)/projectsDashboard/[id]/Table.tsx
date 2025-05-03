"use client";

import Header from "@/components/Header";
import { useGetProjectTasksQuery } from "@/store/api";
import React from "react";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TaskPage from "./TaskPage";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
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
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        startDate: task.startDate,
        dueDate: task.dueDate,
        points: task.points,
        assigneeName: task.assignee.username,
        assigneeEmail: task.assignee.email,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(flattenedTasks || []);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, "tasks-export.xlsx");
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
