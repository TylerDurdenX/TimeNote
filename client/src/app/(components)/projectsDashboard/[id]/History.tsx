"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useMemo, useCallback } from "react";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { useGetTaskHistoryQuery } from "@/store/api";
import { Task } from "@/store/interfaces";
import CircularLoading from "@/components/Sidebar/loading";
import { useTheme } from "next-themes";
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  BarChart3,
} from "lucide-react";

type Props = {
  taskId: number;
  estimatedHours: string;
  task?: Task;
  fullPageFlag: boolean;
};

const TaskHistory = ({ taskId, estimatedHours, task, fullPageFlag }: Props) => {
  const {
    data: taskHistoryData,
    isLoading: isTaskHistoryLoading,
    error: isTaskHistoryError,
  } = useGetTaskHistoryQuery(
    { taskId: taskId },
    { refetchOnMountOrArgChange: true }
  );

  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Format date utility function
  const formatDate = useCallback((dateString: string) => {
    if (!dateString || dateString === "") {
      return "N/A";
    }

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }

      return date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(",", "");
    } catch (error) {
      return "Invalid Date";
    }
  }, []);

  // Calculate time metrics
  const timeMetrics = useMemo(() => {
    if (!task) {
      return {
        consumedHours: 0,
        hoursOverrun: 0,
        estimatedHoursNum: Number(estimatedHours) || 0,
      };
    }

    const currentDateTime = new Date();
    let consumedHours = 0;

    if (task.inProgressStartTime === null) {
      consumedHours = Math.floor(
        Number(task.inProgressTimeinMinutes || 0) / 60
      );
    } else {
      const differenceInMilliseconds =
        currentDateTime.getTime() -
        new Date(task.inProgressStartTime).getTime();
      const differenceInMinutes = Math.floor(
        differenceInMilliseconds / (1000 * 60)
      );
      const progressTime =
        Number(task.inProgressTimeinMinutes || 0) + differenceInMinutes;
      consumedHours = Math.floor(progressTime / 60);
    }

    const estimatedHoursNum = Number(estimatedHours) || 0;
    const hoursOverrun = Math.max(0, consumedHours - estimatedHoursNum);

    return { consumedHours, hoursOverrun, estimatedHoursNum };
  }, [task, estimatedHours]);

  // DataGrid columns configuration
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "username",
        headerName: "User Name",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-medium">
              {params.value || "Unknown User"}
            </span>
          </div>
        ),
      },
      {
        field: "assignedFrom",
        headerName: "Task Assigned From",
        flex: 1,
        minWidth: 150,
        renderCell: (params) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span>{formatDate(params.value)}</span>
          </div>
        ),
      },
      {
        field: "assignedTill",
        headerName: "Task Assigned Till",
        flex: 1,
        minWidth: 150,
        renderCell: (params) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span>{formatDate(params.value)}</span>
          </div>
        ),
      },
      {
        field: "toDo",
        headerName: "To Do",
        flex: 0.5,
        minWidth: 80,
        renderCell: (params) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              {params.value || 0}
            </span>
          </div>
        ),
      },
      {
        field: "WIP",
        headerName: "Work In Progress",
        flex: 0.6,
        minWidth: 100,
        renderCell: (params) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
              {params.value || 0}
            </span>
          </div>
        ),
      },
      {
        field: "underReview",
        headerName: "Under Review",
        flex: 0.5,
        minWidth: 90,
        renderCell: (params) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {params.value || 0}
            </span>
          </div>
        ),
      },
      {
        field: "completed",
        headerName: "Completed",
        flex: 0.5,
        minWidth: 90,
        renderCell: (params) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              {params.value || 0}
            </span>
          </div>
        ),
      },
      {
        field: "totalTime",
        headerName: "Total Time (Days)",
        flex: 0.8,
        minWidth: 120,
        renderCell: (params) => (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="font-medium">{params.value || 0}</span>
          </div>
        ),
      },
    ],
    [formatDate]
  );

  // Metric card component
  const MetricCard = ({
    title,
    value,
    unit,
    icon: Icon,
    bgColor,
    textColor,
    iconColor,
  }: {
    title: string;
    value: number;
    unit: string;
    icon: React.ElementType;
    bgColor: string;
    textColor: string;
    iconColor: string;
  }) => (
    <div
      className={`p-6 ${bgColor} dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor} dark:text-gray-300`}>
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value} {unit}
          </p>
        </div>
        <div className={`p-3 ${iconColor} rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isTaskHistoryLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <CircularLoading />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading task history...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isTaskHistoryError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Task History
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            An error occurred while fetching task history data
          </p>
        </div>
      </div>
    );
  }

  const sortedData = [...(taskHistoryData || [])].sort((a, b) => a.id - b.id);

  return (
    <div className="space-y-6 px-4 pb-8 xl:px-6 mt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Task History & Metrics
        </h2>
      </div>

      {/* Data Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Assignment History
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track task assignments and status changes over time
          </p>
        </div>

        <div className="h-96">
          <DataGrid
            rows={sortedData}
            columns={columns}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
            disableColumnFilter={true}
            disableRowSelectionOnClick={true}
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
          />
        </div>
      </div>

      {/* Metrics Cards - Only show when fullPageFlag is true */}
      {fullPageFlag && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Estimated Hours"
            value={timeMetrics.estimatedHoursNum}
            unit="hours"
            icon={Clock}
            bgColor="bg-green-50"
            textColor="text-green-700"
            iconColor="bg-green-500"
          />

          <MetricCard
            title="Total Consumed Hours"
            value={timeMetrics.consumedHours}
            unit="hours"
            icon={TrendingUp}
            bgColor="bg-yellow-50"
            textColor="text-yellow-700"
            iconColor="bg-yellow-500"
          />

          <MetricCard
            title="Hours Overrun"
            value={timeMetrics.hoursOverrun}
            unit="hours"
            icon={AlertTriangle}
            bgColor="bg-red-50"
            textColor="text-red-700"
            iconColor="bg-red-500"
          />
        </div>
      )}

      {/* Summary Card */}
      {fullPageFlag && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Task Performance Summary
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Efficiency:
                </span>
                <span
                  className={`font-medium ${
                    timeMetrics.hoursOverrun === 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {timeMetrics.hoursOverrun === 0 ? "On Track" : "Over Budget"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Progress Rate:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {timeMetrics.estimatedHoursNum > 0
                    ? Math.round(
                        (timeMetrics.consumedHours /
                          timeMetrics.estimatedHoursNum) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Records:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {sortedData.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Status:
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Active Tracking
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskHistory;
