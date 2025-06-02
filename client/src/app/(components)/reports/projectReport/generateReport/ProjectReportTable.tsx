"use client";

import Header from "@/components/Header";
import React, { useMemo, useCallback } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Button } from "@mui/material";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  ExternalLink,
  Calendar,
  Clock,
  User,
  Building,
  FileText,
  Activity,
} from "lucide-react";
import TableView from "@/app/(components)/projectsDashboard/[id]/Table";

interface ProjectData {
  id: string | number;
  name: string;
  clientName: string;
  description: string;
  status: string;
  startDate: string;
  dueDate: string;
  projectManager: string;
  estimatedHours: string;
  consumedHours: string;
  hoursOverrun: string;
}

interface ProjectReportTableProps {
  email: string;
  closedProjectFlag: boolean;
  data: ProjectData[];
}

const ProjectReportTable: React.FC<ProjectReportTableProps> = ({
  data,
  email,
  closedProjectFlag,
}) => {
  // Clear persisted root data on component mount
  React.useEffect(() => {
    localStorage.removeItem("persist:root");
  }, []);

  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Memoized handlers to prevent unnecessary re-renders
  const handleProjectClick = useCallback((projectId: string | number) => {
    sessionStorage.setItem("projectId", String(projectId));
  }, []);

  const handleViewTasksClick = useCallback(
    (projectId: string | number, projectName: string) => {
      sessionStorage.setItem("projectName", projectName);
      sessionStorage.setItem("projectId", String(projectId));
    },
    []
  );

  // Status badge renderer
  const renderStatusBadge = useCallback((status: string) => {
    const getStatusColor = (status: string) => {
      switch (status?.toLowerCase()) {
        case "completed":
        case "done":
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "in progress":
        case "active":
          return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        case "pending":
        case "waiting":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        case "cancelled":
        case "stopped":
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      }
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
          status
        )}`}
      >
        <Activity className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  }, []);

  // Hours renderer with formatting
  const renderHours = useCallback(
    (hours: string, type: "estimated" | "consumed" | "overrun") => {
      const getHoursColor = (type: string) => {
        switch (type) {
          case "estimated":
            return "text-blue-600 dark:text-blue-400";
          case "consumed":
            return "text-green-600 dark:text-green-400";
          case "overrun":
            return "text-red-600 dark:text-red-400";
          default:
            return "text-gray-600 dark:text-gray-400";
        }
      };

      return (
        <div className={`flex items-center font-mono ${getHoursColor(type)}`}>
          <Clock className="w-3 h-3 mr-1" />
          {hours || "00:00:00"}
        </div>
      );
    },
    []
  );

  // Memoized column definitions
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Project Name",
        flex: 1,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
          <div className="flex items-center">
            <FileText className="w-4 h-4 mr-2 text-gray-500" />
            <Link
              href={`project/${params.row.id}?email=${email}`}
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-medium transition-colors duration-200 flex items-center group"
              onClick={() => handleProjectClick(params.row.id)}
            >
              <span className="truncate">{params.value}</span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        ),
      },
      {
        field: "clientName",
        headerName: "Client Name",
        flex: 1,
        minWidth: 150,
        renderCell: (params: GridRenderCellParams) => (
          <div className="flex items-center">
            <Building className="w-4 h-4 mr-2 text-gray-500" />
            <span className="truncate">{params.value}</span>
          </div>
        ),
      },
      {
        field: "description",
        headerName: "Project Description",
        flex: 1.5,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
          <div
            className="text-sm text-gray-600 mt-4 dark:text-gray-300 line-clamp-2"
            title={params.value}
          >
            {params.value}
          </div>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 0.8,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams) =>
          renderStatusBadge(params.value),
      },
      {
        field: "startDate",
        headerName: "Start Date",
        flex: 0.8,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams) => (
          <div className="flex mt-4 items-center text-sm">
            <Calendar className="w-3 h-3 mr-1 text-gray-500" />
            {params.value}
          </div>
        ),
      },
      {
        field: "dueDate",
        headerName: "Due Date",
        flex: 0.8,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams) => (
          <div className="flex items-center mt-4 text-sm">
            <Calendar className="w-3 h-3 mr-1 text-gray-500" />
            {params.value}
          </div>
        ),
      },
      {
        field: "projectManager",
        headerName: "Project Manager",
        flex: 1,
        minWidth: 150,
        renderCell: (params: GridRenderCellParams) => (
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-gray-500" />
            <span className="truncate">{params.value}</span>
          </div>
        ),
      },
      {
        field: "estimatedHours",
        headerName: "Estimated Hours",
        flex: 0.9,
        minWidth: 130,
        renderCell: (params: GridRenderCellParams) =>
          renderHours(params.value, "estimated"),
      },
      {
        field: "consumedHours",
        headerName: "Consumed Hours",
        flex: 0.9,
        minWidth: 130,
        renderCell: (params: GridRenderCellParams) =>
          renderHours(params.value, "consumed"),
      },
      {
        field: "hoursOverrun",
        headerName: "Hours Overrun",
        flex: 0.9,
        minWidth: 130,
        renderCell: (params: GridRenderCellParams) =>
          renderHours(params.value, "overrun"),
      },
      {
        field: "id",
        headerName: "View Tasks",
        flex: 0.8,
        minWidth: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams) => (
          <div className="flex justify-center items-center h-full">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="contained"
                  size="small"
                  className="!text-white !bg-gradient-to-r !from-blue-500 !to-blue-600 hover:!from-blue-600 hover:!to-blue-700 !px-4 !py-2 !rounded-lg !shadow-md !transition-all !duration-200 hover:!shadow-lg hover:!scale-105 !min-w-0"
                  onClick={() =>
                    handleViewTasksClick(params.row.id, params.row.name)
                  }
                  startIcon={<Eye className="w-4 h-4" />}
                >
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[95vw] lg:max-w-[90vw] max-h-[90vh] overflow-hidden">
                <DialogHeader className="border-b pb-4">
                  <DialogTitle className="flex items-center text-lg font-semibold">
                    <FileText className="w-5 h-5 mr-2" />
                    {params.row.name} - Tasks Overview
                  </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto max-h-[70vh] py-4">
                  <TableView
                    projectId={params.row.id}
                    sprint=""
                    assignedTo=""
                    priority=""
                    isTaskOrSubTask="Task"
                    openViewOnly={true}
                  />
                </div>

                <DialogFooter className="border-t pt-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-gray-500">
                      Project ID: {params.row.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      Status: {renderStatusBadge(params.row.status)}
                    </div>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ),
      },
    ],
    [
      email,
      handleProjectClick,
      handleViewTasksClick,
      renderStatusBadge,
      renderHours,
    ]
  );

  // Memoized data processing
  const processedData = useMemo(() => {
    return data || [];
  }, [data]);

  const hasData = processedData.length > 0;

  return (
    <div className="h-full w-full">
      <div className="px-4 xl:px-6">
        <div className="py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Header name="Project Report" isSmallText />
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {hasData
                ? `${processedData.length} projects`
                : "No projects found"}
            </div>
          </div>
        </div>

        <Card className="mt-4 shadow-sm border-0">
          <div className="relative">
            {!hasData && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 z-10 rounded-lg">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Projects Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {closedProjectFlag
                      ? "No closed projects match your current filters."
                      : "No active projects match your current filters."}
                  </p>
                </div>
              </div>
            )}

            <DataGrid
              rows={processedData}
              columns={columns}
              className={dataGridClassNames}
              sx={{
                ...dataGridSxStyles(isDarkMode),
                minHeight: hasData ? "auto" : 400,
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.04)"
                    : "rgba(0, 0, 0, 0.04)",
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: `1px solid ${
                    isDarkMode
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(0, 0, 0, 0.12)"
                  }`,
                },
              }}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
              autoHeight={hasData ? true : false}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProjectReportTable;
