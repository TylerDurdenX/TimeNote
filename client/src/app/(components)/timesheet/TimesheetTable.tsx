"use client";

import Header from "@/components/Header";

import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames } from "@/lib/utils";
import { Button, DialogTitle } from "@mui/material";
import { useCreateTimesheetEntryMutation } from "@/store/api";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Clock9, PlusSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { CheckCircle } from "@mui/icons-material";
import { TimesheetResponse } from "@/store/interfaces";
import { Card } from "@/components/ui/card";

type Props = {
  email: string;
  selectedDate: Date;
  data: TimesheetResponse;
};

const TimesheetTable = ({ email, selectedDate, data }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [task, setTask] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState("");
  const [consumedHours, setConsumedHours] = useState("");
  const [date, setDate] = useState("");

  const [createTimesheetEntry, { isLoading }] =
    useCreateTimesheetEntryMutation();

  function validateTimeFormat(time: string) {
    const regex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
    return regex.test(time);
  }

  const isFormValid = () => {
    return task && date && validateTimeFormat(consumedHours);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = {
      task: task,
      completionPercentage: completionPercentage,
      consumedHours: consumedHours,
      date: date,
      email: email,
    };
    try {
      const response = await createTimesheetEntry(formData);
      setTask("");
      setCompletionPercentage("");
      setConsumedHours("");
      setDate("");

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
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  const columns: GridColDef[] = [
    {
      field: "task",
      headerName: "Comment",
      flex: 1.5,
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
      flex: 1.5,
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
          rows={data?.timesheetDataList || []}
          columns={columns}
          className={dataGridClassNames}
        />
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center justify-center">
            <button className="flex items-center justify-center rounded-md bg-blue-800 px-3 py-2 text-white hover:bg-blue-500">
              <PlusSquare className="h-5 w-5 mr-2" />
              Add Timesheet Entry
            </button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[42vw] lg:max-w-[42vw] h-[26vw]">
          <DialogHeader>
            <DialogTitle className="mb-2">Add Task in Timesheet</DialogTitle>
          </DialogHeader>

          <div
            className="relative w-full h-full overflow-auto"
            // style={{
            //   paddingTop: "20.575%",
            // }}
          >
            <div className="top-0 left-0 w-[calc(100%)] h-full">
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-3">
                  <div className="grid grid-cols-8 items-center gap-4 mr-1">
                    <Label className="text-center col-span-2">
                      Task Description
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      className="col-span-6"
                      placeholder="Enter the task detail"
                      required
                    />
                    <Label className="text-center col-span-2">
                      Task Date<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      value={date}
                      type="date"
                      placeholder="Enter consumed hours in the format HH:MM"
                      onChange={(e) => setDate(e.target.value)}
                      className="col-span-6"
                    />
                    <Label className="text-center col-span-2">
                      Completion Percentage
                    </Label>
                    <Input
                      value={completionPercentage}
                      placeholder="Enter a value between 0 to 100"
                      onChange={(e) => setCompletionPercentage(e.target.value)}
                      className="col-span-6"
                    />
                    <Label className="text-center col-span-2">
                      Consumed Hours<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      value={consumedHours}
                      placeholder="Enter consumed hours in the format HH:MM"
                      onChange={(e) => setConsumedHours(e.target.value)}
                      className="col-span-6"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <button
                    type="submit"
                    className={`flex w-200px mt-7 justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
                                hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
                                  !isFormValid() || isLoading
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                }`}
                    disabled={!isFormValid() || isLoading}
                  >
                    {isLoading ? "Creating..." : "Send For Approval"}
                  </button>
                </DialogFooter>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimesheetTable;
