"use client";

import Header from "@/components/Header";
import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Button, Chip, Avatar } from "@mui/material";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { useGetProjectsQuery } from "@/store/api";
import {
  CalendarDays,
  User,
  Eye,
  Briefcase,
  Target,
  ExternalLink,
} from "lucide-react";

type Props = {
  email: string;
  closedProjectFlag: boolean;
};

const ProjectsTable = ({ email, closedProjectFlag }: Props) => {
  localStorage.removeItem("persist:root");

  const { data, isLoading, error } = useGetProjectsQuery(
    { email: email, closedFlag: closedProjectFlag },
    { refetchOnMountOrArgChange: true }
  );

  const { theme } = useTheme();
  let isDarkMode = theme === "dark";

  // Enhanced status color mapping
  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "completed":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-800 dark:text-green-200",
          border: "border-green-200 dark:border-green-700",
        };
      case "in progress":
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-800 dark:text-blue-200",
          border: "border-blue-200 dark:border-blue-700",
        };
      case "pending":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-800 dark:text-yellow-200",
          border: "border-yellow-200 dark:border-yellow-700",
        };
      case "on hold":
        return {
          bg: "bg-gray-100 dark:bg-gray-900/30",
          text: "text-gray-800 dark:text-gray-200",
          border: "border-gray-200 dark:border-gray-700",
        };
      case "cancelled":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-800 dark:text-red-200",
          border: "border-red-200 dark:border-red-700",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-900/30",
          text: "text-gray-800 dark:text-gray-200",
          border: "border-gray-200 dark:border-gray-700",
        };
    }
  };

  // Enhanced completion status colors
  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return "#10b981"; // green-500
    if (percentage >= 70) return "#3b82f6"; // blue-500
    if (percentage >= 50) return "#f59e0b"; // amber-500
    if (percentage >= 25) return "#ef4444"; // red-500
    return "#6b7280"; // gray-500
  };

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Project",
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => (
        <div className="flex items-center space-x-3 py-2">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`project/${params.row.id}?email=${email}`}
              rel="noopener noreferrer"
              className="group"
              onClick={() => {
                sessionStorage.setItem("projectId", params.row.id);
              }}
            >
              <p className="text-sm font-semibold text-blue-500 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
                {params.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Click to view details
              </p>
            </Link>
          </div>
        </div>
      ),
    },
    {
      field: "clientName",
      headerName: "Client",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 py-2">
          <Avatar
            sx={{ width: 32, height: 32, fontSize: 14 }}
            className="bg-gradient-to-r from-purple-400 to-pink-400"
          >
            {params.value?.charAt(0)?.toUpperCase() || "C"}
          </Avatar>
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {params.value || "N/A"}
          </span>
        </div>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <div className="py-2">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {params.value || "No description available"}
          </p>
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const statusColors = getStatusColor(params.value);
        return (
          <div className="flex items-center justify-center h-full py-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
            >
              {params.value || "Unknown"}
            </span>
          </div>
        );
      },
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const date = new Date(params.value);
        const formattedDate = date.toISOString().split("T")[0];
        const isValidDate = !isNaN(date.getTime());

        return (
          <div className="flex items-center space-x-2 py-2">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {isValidDate ? formattedDate : "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      field: "endDate",
      headerName: "Due Date",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        const date = new Date(params.value);
        const formattedDate = date.toISOString().split("T")[0];
        const isValidDate = !isNaN(date.getTime());
        const isOverdue = isValidDate && date < new Date();

        return (
          <div className="flex items-center space-x-2 py-2">
            <CalendarDays
              className={`w-4 h-4 ${
                isOverdue ? "text-red-500" : "text-gray-400"
              }`}
            />
            <span
              className={`text-sm ${
                isOverdue
                  ? "text-red-600 dark:text-red-400 font-medium"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {isValidDate ? formattedDate : "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      field: "projectManager",
      headerName: "Manager",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 py-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {params.value || "Unassigned"}
          </span>
        </div>
      ),
    },
    {
      field: "completionStatus",
      headerName: "Progress",
      flex: 1.2,
      minWidth: 160,
      renderCell: (params) => {
        const completion = params.value || 0;
        const completionPercentage = Math.min(Math.max(completion, 0), 100);
        const progressColor = getCompletionColor(completionPercentage);

        return (
          <div className="flex items-center space-x-3 py-2 w-full">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {completionPercentage}%
                </span>
                <Target className="w-3 h-3 text-gray-400" />
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 shadow-inner">
                <div
                  className="h-2.5 rounded-full shadow-sm transition-all duration-300 ease-in-out"
                  style={{
                    backgroundColor: progressColor,
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      },
    },
    {
      field: "id",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        return (
          <div className="flex justify-center items-center h-full py-2">
            <Link href={`/projectsDashboard/${params.value}?email=${email}`}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Eye className="w-4 h-4" />}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transform transition-all duration-200 ease-in-out hover:scale-105 normal-case"
                onClick={() => {
                  sessionStorage.setItem("projectName", params.row.name);
                  sessionStorage.setItem("projectId", params.row.id);
                }}
              >
                View
              </Button>
            </Link>
          </div>
        );
      },
    },
  ];

  const enhancedDataGridStyles = {
    ...dataGridSxStyles(isDarkMode),
    "& .MuiDataGrid-root": {
      border: "none",
      borderRadius: "12px",
      overflow: "hidden",
    },
    "& .MuiDataGrid-main": {
      borderRadius: "12px",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: isDarkMode ? "rgb(17, 24, 39)" : "rgb(249, 250, 251)",
      borderBottom: `2px solid ${
        isDarkMode ? "rgb(55, 65, 81)" : "rgb(229, 231, 235)"
      }`,
      fontWeight: 600,
      fontSize: "0.875rem",
      color: isDarkMode ? "rgb(243, 244, 246)" : "rgb(55, 65, 81)",
    },
    "& .MuiDataGrid-columnHeader": {
      padding: "16px 8px",
    },
    "& .MuiDataGrid-cell": {
      borderBottom: `1px solid ${
        isDarkMode ? "rgb(55, 65, 81)" : "rgb(229, 231, 235)"
      }`,
      padding: "8px",
    },
    "& .MuiDataGrid-row": {
      "&:hover": {
        backgroundColor: isDarkMode ? "rgb(31, 41, 55)" : "rgb(249, 250, 251)",
        cursor: "pointer",
      },
      "&:nth-of-type(even)": {
        backgroundColor: isDarkMode ? "rgb(17, 24, 39)" : "rgb(255, 255, 255)",
      },
      "&:nth-of-type(odd)": {
        backgroundColor: isDarkMode ? "rgb(31, 41, 55)" : "rgb(248, 250, 252)",
      },
    },
    "& .MuiDataGrid-footerContainer": {
      borderTop: `2px solid ${
        isDarkMode ? "rgb(55, 65, 81)" : "rgb(229, 231, 235)"
      }`,
      backgroundColor: isDarkMode ? "rgb(17, 24, 39)" : "rgb(249, 250, 251)",
    },
  };

  if (isLoading) {
    return (
      <div className="h-full w-full px-4 pb-8 xl:px-6">
        <div className="pt-5">
          <Header name="Projects Table" isSmallText />
        </div>
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-8 gap-4">
                  {[...Array(8)].map((_, j) => (
                    <div
                      key={j}
                      className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full px-4 pb-8 xl:px-6">
        <div className="pt-5">
          <Header name="Projects Table" isSmallText />
        </div>
        <Card className="p-8">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">
              Error loading projects
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full w-full px-4 pb-8 xl:px-6">
      <div className="pt-5 mb-6">
        {/* <Header name="Projects Overview" isSmallText /> */}
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage and track your project portfolio
        </p>
      </div>

      <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="p-1">
          <DataGrid
            rows={data || []}
            columns={columns}
            className={dataGridClassNames}
            sx={enhancedDataGridStyles}
            rowHeight={80}
            // headerHeight={60}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default ProjectsTable;
