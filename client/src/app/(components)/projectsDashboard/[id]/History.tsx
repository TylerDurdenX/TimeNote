"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useSearchParams } from "next/navigation";
import React from "react";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { useGetProjectTasksQuery, useGetTaskHistoryQuery } from "@/store/api";

type Props = {
  taskId: number;
};

const TaskHistory = ({taskId}: Props) => {

  const { data, isLoading: isTaskHistoryLoading, error: isTaskHistoryError } = useGetTaskHistoryQuery({ taskId: taskId },
    {
      refetchOnMountOrArgChange: true
    }
  );
    

  const formatDate = (dateString: string) => {
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
        return params.value ;
      },
    },
    {
      field: "WIP",
      headerName: "Work In Progress",
      flex: 0.6,
      renderCell: (params) => {
        return params.value
      },
    },
    {
      field: "underReview",
      headerName: "Under Review",
      flex: 0.5,
      renderCell: (params) => params.value
    },
    {
      field: "completed",
      headerName: "Completed",
      flex: 0.5,
      renderCell: (params) => params.value 
    },
    {
        field: "totalTime",
        headerName: "Total Time (in Days)",
        flex: 0.8,
        renderCell: (params) => params.value
      },
  ];

  const isDarkMode = false;

  if (isTaskHistoryLoading) return <div>Loading...</div>;
  if (isTaskHistoryError) return <div>An error occurred while fetching tasks</div>;

  return (
    <div className="h-540px e-full px-4 pb-8 xl:px-6">
      <DataGrid
        rows={data || []}
        columns={columns}
        className={dataGridClassNames}
        sx={dataGridSxStyles(isDarkMode)}
      />
    </div>
  );
};
export default TaskHistory;
