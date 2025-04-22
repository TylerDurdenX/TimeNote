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
import { Clock9 } from "lucide-react";
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
import { Card } from "@/components/ui/card";
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

  function validateTimeFormat(time: string) {
    const regex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
    return regex.test(time);
  }

  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);

  const handleViewDetails = (row: RowData) => {
    setSelectedRow(row);
    setRowDataUserName(row.username);
    setIsViewOpen(true);
  };

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

  async function handleApprove(id: number, hours: string) {
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
  }

  async function handleReject(id: number) {
    setSelectedId(id);
  }

  const formatDate = (dateString: string) => {
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

  const columns: GridColDef[] = [
    {
      field: "task",
      headerName: "Comments",
      flex: 1.5,
      renderCell: (params) => (
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-blue-600 underline font-medium text-lg hover:text-blue-700 transition-colors">
              {params.value}
            </button>
          </DialogTrigger>

          <DialogContent className="max-w-[50vw] max-h-[85vh] overflow-y-auto p-4 bg-gray-50 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogDescription className="text-2xl font-semibold text-gray-800">
                Task Description
              </DialogDescription>
            </DialogHeader>
            <Card className="p-5 bg-white shadow-md rounded-lg mt-4 min-h-[150px] flex text-gray-600">
              <div className="">{params.value}</div>
            </Card>
          </DialogContent>
        </Dialog>
      ),
    },
    {
      field: "taskName",
      headerName: "TaskName",
      flex: 0.6,
    },
    {
      field: "projectName",
      headerName: "Project Name",
      flex: 0.6,
    },
    {
      field: "username",
      headerName: "User",
      flex: 1,
    },
    {
      field: "completionPercentage",
      headerName: "Completion Percentage",
      flex: 1,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 0.7,
      renderCell: (params) => {
        return formatDate(params.value);
      },
    },
    {
      field: "consumedHours",
      headerName: "Consumed Hours",
      flex: 1,
    },
    {
      field: "approvedHours",
      headerName: "Approved Hours",
      flex: 1,
      editable: true,
      renderCell: (params) => {
        return (
          <Input
            value={params.value} // Display the current cell value
            className=" mb-3 bg-white"
            placeholder="0:00"
            onChange={(event) => {
              // Update the value directly on the cell change
              const newValue = event.target.value;
              params.api.setEditCellValue({ ...params, value: newValue });
            }}
          />
        );
      },
    },
    {
      field: "ApprovedFlag",
      headerName: "Approval Status",
      flex: 1.4,
      renderCell: (params) => {
        if (params.value === "NA") {
          return (
            <>
              <CheckCircle style={{ color: "green" }} /> Approved
            </>
          );
        } else if (params.value === "NO") {
          return (
            <>
              <div className="flex items-center">
                <Clock9 style={{ color: "red" }} />{" "}
                <span className="ml-2">Pending for approval</span>
              </div>
            </>
          );
        } else {
          return (
            <>
              <CheckCircle style={{ color: "green" }} /> Approved
            </>
          );
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      renderCell: (params) => {
        return (
          <div
            style={{
              display: "flex",
              gap: "15px",
              justifyContent: "center",
              alignItems: "center",
            }}
            className="mt-2"
          >
            {/* Approve Button */}
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() =>
                handleApprove(params.row.id, params.row.approvedHours)
              }
              startIcon={<CheckCircle />}
              sx={{
                backgroundColor: "#4caf50", // Green color
                "&:hover": { backgroundColor: "#45a049" },
                borderRadius: "8px",
              }}
            >
              Approve
            </Button>

            {/* Reject Button */}
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleReject(params.row.id)}
                  startIcon={<Cancel />}
                  sx={{
                    backgroundColor: "#f44336", // Red color
                    "&:hover": { backgroundColor: "#e53935" },
                    borderRadius: "8px",
                  }}
                >
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-700">
                    Do you want to reject this timesheet record?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    No
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirmation}>
                    Yes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
    {
      field: "action2",
      headerName: "View Task",
      flex: 1,
      renderCell: (params) => {
        if (params.row.taskId !== null) {
          return (
            <div
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "center",
                alignItems: "center",
              }}
              className=" w-full"
            >
              <Link href={`/task/${params.row.taskId}?email=${email}`}>
                <Button
                  variant="contained"
                  className="mb-5"
                  color="primary"
                  size="small"
                  onClick={() =>
                    sessionStorage.setItem("taskId", String(params.row.taskId))
                  } // Passing the current row's data
                  sx={{
                    backgroundColor: "#3f51b5", // Blue color
                    "&:hover": { backgroundColor: "#2c387e" },
                    borderRadius: "8px",
                  }}
                >
                  View Task
                </Button>
              </Link>
            </div>
          );
        } else if (params.row.subTaskId !== null) {
          return (
            <div
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "center",
                alignItems: "center",
              }}
              className=" w-full"
            >
              <Link href={`/subTask/${params.row.subTaskCode}?email=${email}`}>
                <Button
                  variant="contained"
                  className="mb-5"
                  color="primary"
                  size="small"
                  onClick={() =>
                    sessionStorage.setItem(
                      "taskId",
                      String(params.row.subTaskId)
                    )
                  } // Passing the current row's data
                  sx={{
                    backgroundColor: "#3f51b5", // Blue color
                    "&:hover": { backgroundColor: "#2c387e" },
                    borderRadius: "8px",
                  }}
                >
                  View Sub Task
                </Button>
              </Link>
            </div>
          );
        } else {
          return "";
        }
      },
    },
  ];

  return (
    <>
      <div className="h-full w-full px-4 pb-8 xl:px-6">
        <DataGrid
          rows={pendingTimesheetEntry || []}
          columns={columns}
          className={dataGridClassNames}
        />
      </div>
    </>
  );
};

export default ApproveTimesheetTable;
