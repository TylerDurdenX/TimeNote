'use client'

import Header from "@/components/Header";

import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles, } from "@/lib/utils";
import { Button } from "@mui/material";
import { useGetProjectsQuery, useGetUserAttendanceTableDataQuery } from "@/store/api";
import Link from "next/link";
import { useTheme } from "next-themes";

type Props = {
  email: string;
};;

const AttendanceTable = ({ email }: Props) => {

  const { data, isLoading, error} = useGetUserAttendanceTableDataQuery(
    { email: email },
  );

  const {theme} = useTheme()

  let isDarkMode = theme==="dark"


const columns: GridColDef[] = [
  {
    field: "date",
    headerName: "Date",
    flex: 1,
  },  
  {
    field: "punchInTime",
    headerName: "In Time",
    flex: 1
  },
  {
    field: "punchOutTime",
    headerName: "Out Time",
    flex: 1.5
  },
  {
    field: "duration",
    headerName: "Duration",
    flex: 1
  },
]

  return (
    <div className="h-full w-full px-4 pb-8 xl:px-6">

      <DataGrid
        rows={data || []}
        columns={columns}
        className={dataGridClassNames}
        sx={dataGridSxStyles(isDarkMode)}
      />
    </div>
  );
};

export default AttendanceTable;
