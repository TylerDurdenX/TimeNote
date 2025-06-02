"use client";

import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames } from "@/lib/utils";
import { useViewTimesheetDataQuery } from "@/store/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock9, Eye, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  email: string;
  selectedDate: Date;
  name: string;
  dialogFlag: boolean;
};

const TimesheetDataTable = ({
  email,
  selectedDate,
  name,
  dialogFlag,
}: Props) => {
  const { data, isLoading, error, refetch } = useViewTimesheetDataQuery(
    { name: name, date: selectedDate.toString() },
    { refetchOnMountOrArgChange: true }
  );

  function validateTimeFormat(time: string) {
    const regex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
    return regex.test(time);
  }

  const getCompletionBadgeColor = (percentage: number) => {
    if (percentage >= 100)
      return "bg-green-100 text-green-800 border-green-200";
    if (percentage >= 75) return "bg-blue-100 text-blue-800 border-blue-200";
    if (percentage >= 50)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const columns: GridColDef[] = [
    {
      field: "task",
      headerName: "Comment",
      flex: 1.4,
      minWidth: 200,
      renderCell: (params) => {
        const rowData = params.row;
        const linkTo = rowData.projectId
          ? `timesheet/${rowData.projectId}/${rowData.taskCode}?email=${email}`
          : "";

        const truncatedText =
          params.value?.length > 50
            ? `${params.value.substring(0, 50)}...`
            : params.value;

        return (
          <Dialog>
            <DialogTrigger asChild>
              <button className="group flex items-center gap-2 text-left p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 w-full">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                    {truncatedText}
                  </div>
                  {params.value?.length > 50 && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Click to view full comment
                    </div>
                  )}
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
              <DialogHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">💬</span>
                  </div>
                  <div>
                    <DialogDescription className="text-xl font-semibold text-gray-900 m-0">
                      Task Description
                    </DialogDescription>
                    <p className="text-sm text-gray-500 mt-1">
                      Detailed task comment and description
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <Card className="mt-4 border-0 shadow-sm">
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl">
                  <div className="prose max-w-none">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                      {params.value}
                    </div>
                  </div>
                </div>
              </Card>
            </DialogContent>
          </Dialog>
        );
      },
    },
    {
      field: "taskName",
      headerName: "Task Name",
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <div className="font-medium text-gray-900 py-2">
          {params.value || "—"}
        </div>
      ),
    },
    {
      field: "projectName",
      headerName: "Project",
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => (
        <div className="flex items-center gap-2 py-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="font-medium text-gray-700">
            {params.value || "—"}
          </span>
        </div>
      ),
    },
    {
      field: "completionPercentage",
      headerName: "Completion",
      flex: 0.7,
      minWidth: 120,
      renderCell: (params) => {
        const percentage = params.value || 0;
        return (
          <div className="py-2">
            <div
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getCompletionBadgeColor(
                percentage
              )}`}
            >
              {percentage}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      field: "consumedHours",
      headerName: "Consumed",
      flex: 0.6,
      minWidth: 100,
      renderCell: (params) => (
        <div className="flex items-center gap-2 py-2">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className="font-medium text-gray-900">
            {params.value || "0"}h
          </span>
        </div>
      ),
    },
    {
      field: "approvedHours",
      headerName: "Approved",
      flex: 0.6,
      minWidth: 100,
      renderCell: (params) => (
        <div className="flex items-center gap-2 py-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="font-medium text-gray-900">
            {params.value || "0"}h
          </span>
        </div>
      ),
    },
    {
      field: "ApprovedFlag",
      headerName: "Status",
      flex: 0.8,
      minWidth: 140,
      renderCell: (params) => {
        if (params.value === "NA") {
          return (
            <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Approved</span>
            </div>
          );
        } else if (params.value === "NO") {
          return (
            <div className="flex items-center gap-2 mt-3 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full border border-orange-200">
              <Clock9 className="w-4 h-4" />
              <span className="text-sm font-medium">Pending</span>
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Approved</span>
            </div>
          );
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => {
        if (params.row.taskId !== null) {
          return (
            <div className="flex justify-center py-2">
              <Link href={`/task/${params.row.taskId}?email=${email}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200"
                  onClick={() => {
                    // Note: sessionStorage usage removed for Claude.ai compatibility
                    console.log("Task ID:", params.row.taskId);
                  }}
                >
                  <Eye className="w-4 h-4" />
                  View Task
                </Button>
              </Link>
            </div>
          );
        } else if (params.row.subTaskId !== null) {
          return (
            <div className="flex justify-center py-2">
              <Link href={`/subTask/${params.row.subTaskCode}?email=${email}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all duration-200"
                  onClick={() => {
                    // Note: sessionStorage usage removed for Claude.ai compatibility
                    console.log("SubTask ID:", params.row.subTaskId);
                  }}
                >
                  <Eye className="w-4 h-4" />
                  Sub Task
                </Button>
              </Link>
            </div>
          );
        } else {
          return (
            <div className="flex justify-center py-2">
              <span className="text-gray-400 text-sm">—</span>
            </div>
          );
        }
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading timesheet data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-red-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-red-600 text-xl">⚠️</span>
          </div>
          <p className="text-red-600 font-medium">Error loading data</p>
          <p className="text-gray-500 text-sm mt-1">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  const hasData = data?.timesheetDataList && data.timesheetDataList.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-sm">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Timesheet Data</h3>
              <p className="text-sm text-gray-600">
                {hasData
                  ? `${data.timesheetDataList.length} entries found`
                  : "No entries found"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>For: {name}</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>{selectedDate.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="h-full w-full max-h-[70vh]">
        {hasData ? (
          <DataGrid
            rows={data.timesheetDataList}
            columns={columns}
            className={`${dataGridClassNames} border-0`}
            disableRowSelectionOnClick
            getRowHeight={() => "auto"}
            sx={{
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f8fafc",
              },
              "& .MuiDataGrid-cell": {
                border: "none",
                borderBottom: "1px solid #f1f5f9",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f8fafc",
                border: "none",
                borderBottom: "2px solid #e2e8f0",
                "& .MuiDataGrid-columnHeader": {
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "#374151",
                },
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: "#ffffff",
              },
            }}
          />
        ) : (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No timesheet data
              </h3>
              <p className="text-gray-500">
                No entries found for the selected date and user.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetDataTable;
