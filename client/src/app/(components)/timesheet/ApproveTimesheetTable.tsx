"use client";

import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames } from "@/lib/utils";
import { Button, Input } from "@mui/material";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock9, CheckCircle2, XCircle, Eye, User } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Cancel, CheckCircle } from "@mui/icons-material";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useGetPendingTimesheetDataQuery,
  useUpdateTimesheetEntryMutation,
} from "@/store/api";
import Link from "next/link";

type Props = {
  email: string;
  selectedDate: Date;
};

interface RowData {
  id: number;
  consumedHours: string;
  userId: number;
  username: string;
  projectId?: number;
}

const ApproveTimesheetTable = ({ email, selectedDate }: Props) => {
  const [open, setOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [updateTimesheet] = useUpdateTimesheetEntryMutation();
  const [selectedId, setSelectedId] = useState(0);
  const [rowDataUserName, setRowDataUserName] = useState("");

  const {
    data: pendingTimesheetEntry,
    isLoading,
    error,
  } = useGetPendingTimesheetDataQuery(
    { email: email!, date: selectedDate.toString() },
    { refetchOnMountOrArgChange: true }
  );

  const validateTimeFormat = (time: string): boolean => {
    const regex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
    return regex.test(time);
  };

  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);

  const formatTime = (input: string): string => {
    if (/^\d+$/.test(input)) {
      return `${input}:00`;
    }

    const timePattern = /^\d{1,2}:[0-5][0-9]$/;
    if (timePattern.test(input)) {
      return input;
    }
    return input;
  };

  const handleApprove = async (id: number, hours: string) => {
    const approvedHours = formatTime(hours);

    if (!validateTimeFormat(approvedHours)) {
      toast.error("Approved Hours not Valid");
    } else {
      try {
        const response = await updateTimesheet({
          id: id,
          email: email!,
          approvedHours: approvedHours,
          approveRejectFlag: true,
        });

        if (
          // @ts-ignore
          response.error?.data.status === "Error" ||
          // @ts-ignore
          response.error?.data.status === "Fail"
        ) {
          // @ts-ignore
          toast.error(response.error?.data.message);
        } else {
          // @ts-ignore
          toast.success(response.data?.message);
        }
      } catch (err: any) {
        toast.error(err.data.message);
        console.error("Error Approving Timesheet record:", err.data.Message);
      }
    }
  };

  const handleReject = async (id: number) => {
    setSelectedId(id);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDeleteConfirmation = async () => {
    if (selectedId !== null) {
      try {
        const response = await updateTimesheet({
          id: Number(selectedId),
          email: email!,
          approvedHours: "",
          approveRejectFlag: false,
        });

        if (
          // @ts-ignore
          response.error?.data.status === "Error" ||
          // @ts-ignore
          response.error?.data.status === "Fail"
        ) {
          // @ts-ignore
          toast.error(response.error?.data.message);
        } else {
          // @ts-ignore
          toast.success(response.data?.message);
        }
      } catch (err: any) {
        toast.error(err.data.message);
        console.error("Error deleting Timesheet record:", err.data.Message);
      }
      setOpen(false);
      setSelectedId(0);
    }
  };

  const renderApprovalStatus = (value: string) => {
    if (value === "NA") {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    } else if (value === "NO") {
      return (
        <Badge
          variant="secondary"
          className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        >
          <Clock9 className="w-3 h-3 mr-1" />
          Pending for approval
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
  };

  const getUserInitials = (username: string): string => {
    return username
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const columns: GridColDef[] = [
    {
      field: "task",
      headerName: "Task Description",
      flex: 1.5,
      renderCell: (params) => (
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-blue-600 underline font-medium hover:text-blue-800 transition-colors duration-200 text-left line-clamp-2">
              {params.value}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <DialogDescription className="text-xl font-semibold text-gray-900">
                Task Description
              </DialogDescription>
            </DialogHeader>
            <Card className="mt-4">
              <CardContent className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {params.value}
                </p>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      ),
    },
    {
      field: "taskName",
      headerName: "Task Name",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "projectName",
      headerName: "Project",
      flex: 1,
      minWidth: 120,
    },
    {
      field: "username",
      headerName: "User",
      flex: 1.2,
      minWidth: 140,
      renderCell: (params) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
              {getUserInitials(params.value)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-gray-700">{params.value}</span>
        </div>
      ),
    },
    {
      field: "completionPercentage",
      headerName: "Progress",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 mt-3">
          <div className="w-12 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, params.value || 0))}%`,
              }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {params.value || 0}%
          </span>
        </div>
      ),
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {formatDate(params.value)}
        </span>
      ),
    },
    {
      field: "consumedHours",
      headerName: "Consumed",
      flex: 0.8,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
          {params.value}
        </span>
      ),
    },
    {
      field: "approvedHours",
      headerName: "Approved Hours",
      flex: 1.2,
      minWidth: 110,
      editable: true,
      renderCell: (params) => (
        <div className="w-full">
          <Input
            value={params.value}
            className="bg-white border-gray-300 rounded-md text-sm h-8 font-mono"
            placeholder="HH:MM"
            onChange={(event) => {
              const newValue = event.target.value;
              params.api.setEditCellValue({ ...params, value: newValue });
            }}
          />
        </div>
      ),
    },
    {
      field: "ApprovedFlag",
      headerName: "Status",
      flex: 1.2,
      minWidth: 140,
      renderCell: (params) => renderApprovalStatus(params.value),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center space-x-2 py-1">
          {/* Approve Button */}
          <Button
            variant="contained"
            size="small"
            onClick={() =>
              handleApprove(params.row.id, params.row.approvedHours)
            }
            startIcon={<CheckCircle2 className="w-4 h-4" />}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-all duration-200"
          >
            Approve
          </Button>

          {/* Reject Button */}
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleReject(params.row.id)}
                startIcon={<XCircle className="w-4 h-4" />}
                className="bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition-all duration-200"
              >
                Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader className="space-y-3">
                <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                  Confirm Rejection
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  Are you sure you want to reject this timesheet record? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex space-x-2">
                <AlertDialogCancel
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirmation}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
    {
      field: "action2",
      headerName: "View Task",
      flex: 0.8,
      sortable: false,
      renderCell: (params) => {
        if (params.row.taskId !== null) {
          return (
            <div className="w-full flex justify-center">
              <Link href={`/task/${params.row.taskId}?email=${email}`}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Eye className="w-4 h-4" />}
                  onClick={() =>
                    sessionStorage.setItem("taskId", String(params.row.taskId))
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all duration-200"
                >
                  Task
                </Button>
              </Link>
            </div>
          );
        } else if (params.row.subTaskId !== null) {
          return (
            <div className="w-full flex justify-center">
              <Link href={`/subTask/${params.row.subTaskCode}?email=${email}`}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Eye className="w-4 h-4" />}
                  onClick={() =>
                    sessionStorage.setItem(
                      "taskId",
                      String(params.row.subTaskId)
                    )
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition-all duration-200"
                >
                  Sub Task
                </Button>
              </Link>
            </div>
          );
        } else {
          return null;
        }
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        <span className="ml-3 text-gray-600">
          Loading pending timesheets...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 m-4">
        <div className="flex items-center space-x-3 text-red-600">
          <XCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Error Loading Data</h3>
            <p className="text-sm text-gray-600">
              Failed to load pending timesheet entries.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock9 className="w-5 h-5 mr-2 text-blue-600" />
            Pending Timesheet Approvals
          </CardTitle>
          <p className="text-sm text-gray-600">
            Review and approve timesheet entries for{" "}
            {formatDate(selectedDate.toString())}
          </p>
        </CardHeader>
      </Card>

      {/* Data Grid */}
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-0">
          <div className="h-full w-full">
            <DataGrid
              rows={pendingTimesheetEntry || []}
              columns={columns}
              className={`${dataGridClassNames} border-0`}
              autoHeight
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApproveTimesheetTable;
