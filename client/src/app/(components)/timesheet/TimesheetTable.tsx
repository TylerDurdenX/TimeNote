"use client";

import Header from "@/components/Header";
import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames } from "@/lib/utils";
import { Button, DialogTitle, Chip } from "@mui/material";
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
import {
  Clock9,
  PlusSquare,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { CheckCircle } from "@mui/icons-material";
import { TimesheetResponse } from "@/store/interfaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const validateTimeFormat = (time: string): boolean => {
    const regex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
    return regex.test(time);
  };

  const validatePercentage = (percentage: string): boolean => {
    const num = parseFloat(percentage);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  const isFormValid = (): boolean => {
    return (
      task.trim() !== "" &&
      date !== "" &&
      validateTimeFormat(consumedHours) &&
      (completionPercentage === "" || validatePercentage(completionPercentage))
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isFormValid()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const formData = {
      task: task.trim(),
      completionPercentage: completionPercentage || "0",
      consumedHours: consumedHours,
      date: date,
      email: email,
    };

    try {
      const response = await createTimesheetEntry(formData);

      // Reset form
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
        toast.error(
          // @ts-ignore
          response.error?.data.message || "Failed to create timesheet entry"
        );
      } else {
        // @ts-ignore
        toast.success(
          response.data?.message || "Timesheet entry created successfully"
        );
      }
      setIsOpen(false);
    } catch (err: any) {
      toast.error(
        err?.data?.message || "An error occurred while creating the entry"
      );
      console.error("Error creating timesheet entry:", err);
    }
  };

  const renderApprovalStatus = (value: string) => {
    if (value === "NA" || value === "YES") {
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
          Pending
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600">
          <AlertCircle className="w-3 h-3 mr-1" />
          Unknown
        </Badge>
      );
    }
  };

  const columns: GridColDef[] = [
    {
      field: "task",
      headerName: "Task Description",
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Dialog>
          <DialogTrigger asChild>
            <button className="text-blue-600 underline font-medium hover:text-blue-800 transition-colors duration-200 text-left line-clamp-2">
              {params.value}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Task Description
              </DialogTitle>
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
      field: "completionPercentage",
      headerName: "Progress",
      flex: 0.8,
      minWidth: 100,
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
      field: "consumedHours",
      headerName: "Hours",
      flex: 0.6,
      minWidth: 80,
      renderCell: (params) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {params.value}
        </span>
      ),
    },
    {
      field: "approvedHours",
      headerName: "Approved",
      flex: 0.6,
      minWidth: 80,
      renderCell: (params) => (
        <span className="font-mono text-sm bg-green-50 text-green-700 px-2 py-1 rounded">
          {params.value || "-"}
        </span>
      ),
    },
    {
      field: "ApprovedFlag",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => renderApprovalStatus(params.value),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.8,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => {
        if (params.row.taskId !== null) {
          return (
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
                View
              </Button>
            </Link>
          );
        } else if (params.row.subTaskId !== null) {
          return (
            <Link href={`/subTask/${params.row.subTaskCode}?email=${email}`}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Eye className="w-4 h-4" />}
                onClick={() =>
                  sessionStorage.setItem("taskId", String(params.row.subTaskId))
                }
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition-all duration-200"
              >
                Sub Task
              </Button>
            </Link>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Data Grid Section */}
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-0">
          <div className="h-full w-full">
            <DataGrid
              rows={data?.timesheetDataList || []}
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

      {/* Add Entry Button */}
      <div className="flex justify-center">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlusSquare className="w-5 h-5" />}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              Add Timesheet Entry
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Add New Timesheet Entry
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Fill in the details below to add a new entry to your timesheet.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="space-y-4">
                {/* Task Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="task"
                    className="text-sm font-medium text-gray-700"
                  >
                    Task Description <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="task"
                    value={task}
                    onChange={(e: any) => setTask(e.target.value)}
                    placeholder="Describe the task you worked on..."
                    className="w-full border"
                    required
                  />
                </div>

                {/* Date and Hours Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="date"
                      className="text-sm font-medium text-gray-700"
                    >
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="hours"
                      className="text-sm font-medium text-gray-700"
                    >
                      Hours Worked <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="hours"
                      value={consumedHours}
                      onChange={(e) => setConsumedHours(e.target.value)}
                      placeholder="HH:MM (e.g., 08:30)"
                      pattern="^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$"
                      required
                    />
                  </div>
                </div>

                {/* Completion Percentage */}
                <div className="space-y-2">
                  <Label
                    htmlFor="percentage"
                    className="text-sm font-medium text-gray-700"
                  >
                    Completion Percentage
                  </Label>
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={completionPercentage}
                    onChange={(e) => setCompletionPercentage(e.target.value)}
                    placeholder="0-100"
                  />
                </div>
              </div>

              <DialogFooter className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isFormValid() || isLoading}
                  className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 ${
                    !isFormValid() || isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:shadow-md"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    "Submit for Approval"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TimesheetTable;
