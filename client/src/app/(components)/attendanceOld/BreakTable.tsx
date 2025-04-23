"use client";

import React from "react";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { dataGridClassNames } from "@/lib/utils";
import { useViewBreakDataQuery, useViewTimesheetDataQuery } from "@/store/api";
import CircularLoading from "@/components/Sidebar/loading";

type Props = {
  email: string;
  selectedDate: Date;
  name: string;
  userId: number;
};

const BreakTable = ({ email, selectedDate, name, userId }: Props) => {
  const { data, isLoading, error, refetch } = useViewBreakDataQuery(
    { userId: userId, date: String(selectedDate) },
    { refetchOnMountOrArgChange: true }
  );

  const getRowClassName = (params: GridRowParams) => {
    let breakTimeOverrunInMinutes = 0; // Default to 0 minutes

    // Check if the breakTimeOverrun is in mm:ss format
    if (params.row.breakTimeOverrun.includes(":")) {
      const [minutes, seconds] = params.row.breakTimeOverrun
        .split(":")
        .map(Number);
      // Convert the break time to minutes (including seconds converted to minutes)
      breakTimeOverrunInMinutes = minutes + seconds / 60;
    } else {
      // If it's just a single value (e.g., "0"), treat it as minutes
      breakTimeOverrunInMinutes = Number(params.row.breakTimeOverrun);
    }

    // Apply the custom class if breakTimeOverrun is greater than 0
    if (breakTimeOverrunInMinutes > 0) {
      return "bg-red-100"; // Add the custom class if breakTimeOverrun > 0
    }
    return ""; // Return empty string for default style
  };

  const columns: GridColDef[] = [
    {
      field: "breakType",
      headerName: "Break Name",
      flex: 1,
    },
    {
      field: "breakStartTime",
      headerName: "Start Time",
      flex: 0.6,
    },
    {
      field: "breakEndTime",
      headerName: "End Time",
      flex: 0.6,
    },
    {
      field: "breakTimeInMinutes",
      headerName: "Break Time (mm:ss)",
      flex: 1,
    },
    {
      field: "breakTimeConfigured",
      headerName: "Configured Break Time (mm:ss)",
      flex: 1,
    },
    {
      field: "breakTimeOverrun",
      headerName: "Break Time Overrun (mm:ss)",
      flex: 1,
    },
  ];

  return (
    <>
      {isLoading ? (
        <CircularLoading />
      ) : (
        <div className="h-full w-full px-4 pb-8 xl:px-6 max-h-[70vh] mt-5">
          <DataGrid
            rows={data || []}
            columns={columns}
            className={dataGridClassNames}
            getRowClassName={getRowClassName}
          />
        </div>
      )}
    </>
  );
};

export default BreakTable;
