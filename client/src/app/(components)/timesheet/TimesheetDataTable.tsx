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
import { Clock9 } from "lucide-react";
import { CheckCircle } from "@mui/icons-material";
import { Card } from "@/components/ui/card";
import { Button } from "@mui/material";
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

  const columns: GridColDef[] = [
    {
      field: "task",
      headerName: "Comment",
      flex: 1.2,
      renderCell: (params) => {
        const rowData = params.row;
        const linkTo = rowData.projectId
          ? `timesheet/${rowData.projectId}/${rowData.taskCode}?email=${email}`
          : "";
        return (
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
        );
      },
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
      field: "completionPercentage",
      headerName: "Completion Percentage",
      flex: 0.6,
    },
    {
      field: "consumedHours",
      headerName: "Consumed Hours",
      flex: 0.6,
    },
    {
      field: "approvedHours",
      headerName: "Approved Hours",
      flex: 0.6,
    },
    {
      field: "ApprovedFlag",
      headerName: "Approval Status",
      flex: 1,
      renderCell: (params) => {
        // You can access the value of the cell here using params.value
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
      flex: 0.8,
      renderCell: (params) => {
        const rowData = params.row;
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
                      "subTaskId",
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
      <div className="h-full w-full px-4 pb-8 xl:px-6 max-h-[70vh]">
        <DataGrid
          rows={data?.timesheetDataList || []}
          columns={columns}
          className={dataGridClassNames}
        />
      </div>
    </>
  );
};

export default TimesheetDataTable;
