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
import { FileDown, Eye, Calendar, Clock, User, Flag, Tag } from "lucide-react";
import CircularLoading from "@/components/Sidebar/loading";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  // Remove localStorage operations for Claude environment compatibility
  // localStorage.removeItem("persist:root");
  // localStorage.removeItem("ally-supports-cache");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      Urgent: {
        variant: "destructive" as const,
        className:
          "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400",
        icon: "🔴",
      },
      High: {
        variant: "secondary" as const,
        className:
          "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400",
        icon: "🟠",
      },
      Medium: {
        variant: "outline" as const,
        className:
          "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400",
        icon: "🟡",
      },
      Low: {
        variant: "secondary" as const,
        className:
          "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400",
        icon: "🟢",
      },
    };
    return configs[priority as keyof typeof configs] || configs.Medium;
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      "To Do": {
        bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        text: "#ffffff",
        icon: "📋",
      },
      "Work In Progress": {
        bg: "linear-gradient(135deg, #10b981, #059669)",
        text: "#ffffff",
        icon: "⚡",
      },
      "Under Review": {
        bg: "linear-gradient(135deg, #f59e0b, #d97706)",
        text: "#ffffff",
        icon: "👀",
      },
      Completed: {
        bg: "linear-gradient(135deg, #6b7280, #374151)",
        text: "#ffffff",
        icon: "✅",
      },
    };
    return configs[status as keyof typeof configs] || configs["To Do"];
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Task Title",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 py-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></div>
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => (
        <div className="py-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {params.value || "No description provided"}
          </p>
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      minWidth: 140,
      renderCell: (params) => {
        const config = getStatusConfig(params.value);
        return (
          <div className="flex items-center justify-center py-2">
            <span
              className="inline-flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-semibold shadow-sm"
              style={{
                background: config.bg,
                color: config.text,
              }}
            >
              <span>{config.icon}</span>
              <span>{params.value}</span>
            </span>
          </div>
        );
      },
    },
    {
      field: "priority",
      headerName: "Priority",
      flex: 0.6,
      minWidth: 120,
      renderCell: (params) => {
        const config = getPriorityConfig(params.value);
        return (
          <div className="flex items-center justify-center py-2">
            <Badge className={`${config.className} font-medium`}>
              <span className="mr-1">{config.icon}</span>
              {params.value}
            </Badge>
          </div>
        );
      },
    },
    {
      field: "tags",
      headerName: "Tags",
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex items-center space-x-1 py-2">
          <Tag size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {params.value || "No tags"}
          </span>
        </div>
      ),
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 py-2">
          <Calendar size={14} className="text-green-500" />
          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
            {formatDate(params.value)}
          </span>
        </div>
      ),
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 py-2">
          <Calendar size={14} className="text-red-500" />
          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
            {formatDate(params.value)}
          </span>
        </div>
      ),
    },
    {
      field: "points",
      headerName: "Est. Hours",
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <div className="flex items-center justify-center py-2">
          <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full px-2 py-1 text-xs font-semibold">
            {params.value}h
          </div>
        </div>
      ),
    },
    {
      field: "consumedHours",
      headerName: "Consumed",
      flex: 0.6,
      minWidth: 100,
      renderCell: (params) => (
        <div className="flex items-center space-x-1 py-2">
          <Clock size={14} className="text-orange-500" />
          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: "hoursOverrun",
      headerName: "Overrun",
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => {
        const overrunValue = parseFloat(params.value) || 0;
        return (
          <div className="flex items-center justify-center py-2">
            {overrunValue > 0 ? (
              <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-full px-2 py-1 text-xs font-semibold">
                +{params.value}h
              </div>
            ) : (
              <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full px-2 py-1 text-xs font-semibold">
                On Track
              </div>
            )}
          </div>
        );
      },
    },
    {
      field: "assignee",
      headerName: "Assignee",
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 py-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
            {params.value?.username || "Unassigned"}
          </span>
        </div>
      ),
    },
    {
      field: "taskId",
      headerName: "Actions",
      flex: 0.7,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <div className="flex justify-center items-center h-full">
            {openViewOnly === true ? (
              <Link href={`/task/${params.row.code}?email=${userEmail}`}>
                <Button
                  variant="contained"
                  size="small"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-medium px-4 py-2 rounded-lg shadow-lg transform transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-xl"
                  onClick={() => {
                    // sessionStorage.setItem("taskId", params.row.id);
                  }}
                  startIcon={<Eye size={16} />}
                >
                  View
                </Button>
              </Link>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="contained"
                    size="small"
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-medium px-4 py-2 rounded-lg shadow-lg transform transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-xl"
                    startIcon={<Eye size={16} />}
                  >
                    View
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[85vw] max-h-[85vh] mt-5 mb-5 overflow-y-auto rounded-xl border-0 shadow-2xl">
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
    const month = String(date.getMonth() + 1).padStart(2, "0");
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

    // Apply modern styles to header row
    const headers = Object.keys(flattenedTasks?.[0] || {});
    headers.forEach((header, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      const cell = worksheet[cellRef];
      if (cell) {
        cell.s = {
          fill: { fgColor: { rgb: "2563EB" } }, // Blue background
          font: { bold: true, color: { rgb: "FFFFFF" } }, // White text
          border: {
            top: { style: "thin", color: { rgb: "1E40AF" } },
            bottom: { style: "thin", color: { rgb: "1E40AF" } },
            left: { style: "thin", color: { rgb: "1E40AF" } },
            right: { style: "thin", color: { rgb: "1E40AF" } },
          },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    });

    // Apply alternating row colors to data cells
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let R = 1; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (cell) {
          cell.s = {
            fill: { fgColor: { rgb: R % 2 === 0 ? "F8FAFC" : "FFFFFF" } }, // Alternating rows
            border: {
              top: { style: "thin", color: { rgb: "E2E8F0" } },
              bottom: { style: "thin", color: { rgb: "E2E8F0" } },
              left: { style: "thin", color: { rgb: "E2E8F0" } },
              right: { style: "thin", color: { rgb: "E2E8F0" } },
            },
            alignment: { vertical: "center" },
          };
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks Export");

    // Set modern column widths
    worksheet["!cols"] = headers.map((header) => {
      const width = Math.max(header.length + 5, 15);
      return { wch: Math.min(width, 50) };
    });

    XLSX.writeFile(
      workbook,
      `${isTaskOrSubTask}-export-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const { theme } = useTheme();
  let isDarkMode = theme === "dark";

  const getRowClassName = (params: GridRowParams) => {
    const overrunValue = parseFloat(params.row.hoursOverrun) || 0;
    if (overrunValue > 0) {
      return "bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors duration-200";
    }
    return "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <CircularLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">
            ⚠️ Error Loading Tasks
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            An error occurred while fetching tasks. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full px-4 pb-8 xl:px-6 space-y-6">
      {/* Header Section */}
      <div className="pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
          <Header name="Tasks Overview" isSmallText />
          <Badge
            variant="outline"
            className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium"
          >
            {tasks?.tasks?.length || 0} {isTaskOrSubTask}(s)
          </Badge>
        </div>

        <button
          className="flex items-center justify-center text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-xl font-medium"
          onClick={handleExportToExcel}
        >
          <FileDown size={20} className="mr-2" />
          <span>Export to Excel</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Tasks",
            value: tasks?.tasks?.length || 0,
            color: "blue",
            icon: "📊",
          },
          {
            label: "Completed",
            value:
              tasks?.tasks?.filter((t) => t.status === "Completed").length || 0,
            color: "green",
            icon: "✅",
          },
          {
            label: "In Progress",
            value:
              tasks?.tasks?.filter((t) => t.status === "Work In Progress")
                .length || 0,
            color: "orange",
            icon: "⚡",
          },
          {
            label: "Overrun",
            value:
              tasks?.tasks?.filter((t) => parseFloat(t.hoursOverrun) > 0)
                .length || 0,
            color: "red",
            icon: "⚠️",
          },
        ].map((stat, index) => (
          <Card
            key={index}
            className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Grid */}
      <Card className="border-0 shadow-lg rounded-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 py-4 px-6">
          <div className="flex items-center space-x-2">
            <Flag size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {isTaskOrSubTask} Details
            </h3>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataGrid
            rows={tasks?.tasks || []}
            columns={columns}
            className={`${dataGridClassNames} border-0`}
            sx={{
              ...dataGridSxStyles(isDarkMode),
              "& .MuiDataGrid-cell": {
                borderColor: "rgba(0, 0, 0, 0.05)",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: isDarkMode ? "#1f2937" : "#f8fafc",
                borderBottom: "2px solid rgba(59, 130, 246, 0.1)",
                "& .MuiDataGrid-columnHeader": {
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: isDarkMode ? "#f3f4f6" : "#374151",
                },
              },
              "& .MuiDataGrid-row": {
                "&:hover": {
                  backgroundColor: isDarkMode
                    ? "rgba(59, 130, 246, 0.05)"
                    : "rgba(59, 130, 246, 0.02)",
                },
              },
            }}
            getRowClassName={getRowClassName}
            disableColumnMenu
            // disableSelectionOnClick
            autoHeight
            rowHeight={72}
            // headerHeight={56}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TableView;
