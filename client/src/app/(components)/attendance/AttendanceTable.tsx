'use client'

import Header from "@/components/Header";

import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles, } from "@/lib/utils";
import { useGetUserAttendanceTableDataQuery } from "@/store/api";
import { useTheme } from "next-themes";

type Props = {
  email: string;
  adminFlag: boolean
};;

const AttendanceTable = ({ email, adminFlag }: Props) => {

  const { data, isLoading, error} = useGetUserAttendanceTableDataQuery(
    { email: email, adminFlag: adminFlag },{refetchOnMountOrArgChange: true}
  );

  const {theme} = useTheme()

  let isDarkMode = theme==="dark"


const columns: GridColDef[] = [
  ...(adminFlag ? [
    { field: 'username', headerName: 'User Name', flex: 1 },
  ] : []),
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

const [paginationModel, setPaginationModel] = React.useState({
  page: 0,        // Initial page
  pageSize: 10,   // Default rows per page
});

const handlePaginationChange = (model: { page: number; pageSize: number }) => {
  setPaginationModel(model);
};

  return (
    <div className="h-full w-full px-4 pb-8 xl:px-6">
<div className="">
        <Header name="Attendance Records" isSmallText />
      </div>
        <DataGrid
          rows={data || []}
          columns={columns}
          className={dataGridClassNames}
          pagination
      paginationModel={paginationModel}
      onPaginationModelChange={handlePaginationChange}
          sx={dataGridSxStyles(isDarkMode)}
        />
    </div>
  );
};

export default AttendanceTable;
