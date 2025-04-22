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
  useGetLeaveDataQuery,
  useGetPendingTimesheetDataQuery,
  useUpdateTimesheetEntryMutation,
} from "@/store/api";
import Link from "next/link";

type Props = {
  email: string;
};

interface RowData {
  id: number;
  consumedHours: string;
  userId: number;
  username: string;
  projectId?: number;
}

const LeaveStatus = ({ email }: Props) => {
  const [open, setOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [updateTimesheet] = useUpdateTimesheetEntryMutation();
  const [selectedId, setSelectedId] = useState(0);
  const [rowDataUserName, setRowDataUserName] = useState("");

  function validateTimeFormat(time: string) {
    const regex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
    return regex.test(time);
  }

  const { data } = useGetLeaveDataQuery(
    {
      email: email!,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

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
      field: "username",
      headerName: "User Name",
      flex: 1.5,
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
      field: "leaveType",
      headerName: "Title",
      flex: 2,
    },
    {
      field: "description",
      headerName: "Leave Description",
      flex: 3,
    },
    {
      field: "approvalStatus",
      headerName: "Approval Status",
      flex: 1.4,
      renderCell: (params) => {
        if (params.value === "YES") {
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
  ];

  return (
    <>
      <div className="h-full w-full px-4 pb-8 xl:px-6">
        <DataGrid
          rows={data || []}
          columns={columns}
          className={dataGridClassNames}
        />
      </div>
    </>
  );
};

export default LeaveStatus;
