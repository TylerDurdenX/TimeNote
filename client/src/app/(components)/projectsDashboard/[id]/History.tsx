"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { useGetTaskHistoryQuery } from "@/store/api";
import { Task } from "@/store/interfaces";
import CircularLoading from "@/components/Sidebar/loading";
import { useTheme } from "next-themes";

type Props = {
  taskId: number;
  estimatedHours: string;
  task?: Task;
  fullPageFlag: boolean;
};

const TaskHistory = ({ taskId, estimatedHours, task, fullPageFlag }: Props) => {
  const {
    data,
    isLoading: isTaskHistoryLoading,
    error: isTaskHistoryError,
  } = useGetTaskHistoryQuery(
    { taskId: taskId },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const formatDate = (dateString: string) => {
    if (dateString === "") {
      return "NA";
    }
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    // Extract hours and minutes
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Return formatted date with hours and minutes
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const columns: GridColDef[] = [
    {
      field: "username",
      headerName: "User Name",
      flex: 1,
      renderCell: (params) => {
        return params.value || "";
      },
    },
    {
      field: "assignedFrom",
      headerName: "Task Assigned From",
      flex: 1,
      renderCell: (params) => {
        return formatDate(params.value);
      },
    },
    {
      field: "assignedTill",
      headerName: "Task Assigned Till",
      flex: 1,
      renderCell: (params) => {
        return formatDate(params.value) || "XX";
      },
    },
    {
      field: "toDo",
      headerName: "To Do",
      flex: 0.5,
      renderCell: (params) => {
        return params.value;
      },
    },
    {
      field: "WIP",
      headerName: "Work In Progress",
      flex: 0.6,
      renderCell: (params) => {
        return params.value;
      },
    },
    {
      field: "underReview",
      headerName: "Under Review",
      flex: 0.5,
      renderCell: (params) => params.value,
    },
    {
      field: "completed",
      headerName: "Completed",
      flex: 0.5,
      renderCell: (params) => params.value,
    },
    {
      field: "totalTime",
      headerName: "Total Time (in Days)",
      flex: 0.8,
      renderCell: (params) => params.value,
    },
  ];

  const currentDateTime = new Date();
  let consumedHours = 0;

  if (task?.inProgressStartTime === null) {
    consumedHours = Math.floor(Number(task.inProgressTimeinMinutes) / 60);
  } else {
    const differenceInMilliseconds =
      currentDateTime.getTime() -
      new Date(task?.inProgressStartTime!).getTime();
    const differenceInMinutes = Math.floor(
      differenceInMilliseconds / (1000 * 60)
    );
    const progressTime =
      Number(task?.inProgressTimeinMinutes || 0) + differenceInMinutes;

    consumedHours = Math.floor(progressTime / 60);
  }

  let hoursOverrun = 0;
  const estimatedHoursNum = Number(estimatedHours);
  if (consumedHours > estimatedHoursNum) {
    hoursOverrun = Math.abs(consumedHours - estimatedHoursNum);
  }

  const { theme } = useTheme();

  let isDarkMode = theme === "dark";

  if (isTaskHistoryLoading)
    return (
      <div>
        <CircularLoading />
      </div>
    );
  if (isTaskHistoryError)
    return <div>An error occurred while fetching tasks</div>;

  return (
    <div className="h-540px e-full px-4 pb-8 xl:px-6 mt-4">
      <DataGrid
        rows={[...(data || [])].sort((a, b) => a.id - b.id)}
        columns={columns}
        className={dataGridClassNames}
        sx={dataGridSxStyles(isDarkMode)}
        disableColumnFilter={true}
      />
      {fullPageFlag ? (
        <>
          <div className="mt-4 p-4 bg-green-300 dark:bg-gray-800 rounded-lg flex justify-between items-center">
            <span className="font-semibold text-lg">Estimated Hours</span>
            <span className="font-bold text-lg">{estimatedHoursNum} hours</span>
          </div>
          <div className="mt-4 p-4 bg-yellow-300 dark:bg-gray-800 rounded-lg flex justify-between items-center">
            <span className="font-semibold text-lg">Total Consumed Hours</span>
            <span className="font-bold text-lg">{consumedHours} hours</span>
          </div>
          <div className="mt-4 p-4 bg-red-300 dark:bg-gray-800 rounded-lg flex justify-between items-center">
            <span className="font-semibold text-lg">Total Hours Overrun</span>
            <span className="font-bold text-lg">{hoursOverrun} hours</span>
          </div>
          <div className="mt-4 p-4 flex justify-between items-center"></div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};
export default TaskHistory;
