'use client'

import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles, } from "@/lib/utils";
import { useGetUserAttendanceTableDataQuery } from "@/store/api";
import { useTheme } from "next-themes";
import { Button } from "@mui/material";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BreakTable from "./BreakTable";
import TimesheetHeader from "../timesheet/TimesheetHeader";

type Props = {
  email: string;
  adminFlag: boolean
};

interface RowData {
  id: number;
  date: string
  consumedHours: string;
  userId: number;
  username: string;
  projectId?: number; 
}

const AttendanceTable = ({ email, adminFlag }: Props) => {

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data, isLoading, error} = useGetUserAttendanceTableDataQuery(
    { email: email, adminFlag: adminFlag, date: selectedDate.toString() },{refetchOnMountOrArgChange: true}
  );

  const {theme} = useTheme()

  let isDarkMode = theme==="dark"

  const [open, setOpen] = useState(false);
  const [rowDataUserId, setRowDataUserId] = useState(0)
  const [rowDataUserName, setRowDataUserName] = useState('')

  const handleViewDetails = (row: RowData) => {
    setRowDataUserId(row.userId)
    setRowDataUserName(row.username)
    setOpen(true); 
  };

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
    headerName: "Working Time",
    flex: 1
  },
  {
    field: "activeTime",
    headerName: "Active Time",
    flex: 1
  },
  {
    field: "totalIdleTime",
    headerName: "Idle/Break Time",
    flex: 1
  },
  {
      field: 'actions',
      headerName: 'Break Details',
      flex: 1,
      renderCell: (params) => {
        const rowData = params.row;
        return (
          <div
            style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            className=" w-full"
          >
          <div className="my-3 flex justify-center items-center">
            <Button
                  variant="contained"
                  className="mb-5"
                  color="primary"
                  size="small"
                  onClick={() => handleViewDetails(params.row)}
                  sx={{
                    backgroundColor: '#3f51b5', 
                    '&:hover': { backgroundColor: '#2c387e' },
                    borderRadius: '8px',
                  }}
                >
                  View Details
                </Button>
                </div>
          </div>
        );
      },
    }
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
      <Dialog open={open} onOpenChange={setOpen}>
                  <div className="my-3 flex justify-center items-center">
                  
        
                  {/* Dialog Content */}
                  <DialogContent className="max-w-[65vw] max-h-[80vw] mt-5 mb-5 overflow-y-auto"> {/* Set width to 70% of viewport height */}
                    <DialogHeader>
                      <DialogTitle>
                        {/* {formatDate(selectedDate.toString())} - {rowDataUserName} */}
                        {rowDataUserName}
                      </DialogTitle>
                      <DialogDescription className="text-gray-700 overflow-y-auto">
                        <BreakTable email={email} selectedDate={selectedDate} name={rowDataUserName} userId={rowDataUserId}/>
                      </DialogDescription>
                    </DialogHeader> 
        
                    <DialogFooter>
                      <Button
                        onClick={() => setOpen(false)}
                        variant="contained"
                        sx={{
                          backgroundColor: '#3f51b5', // Blue color
                          '&:hover': { backgroundColor: '#2c387e' },
                          borderRadius: '8px',
                        }}
                      >
                        Close
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                  </div>
                </Dialog>
<div className="mb-7">
<TimesheetHeader hasFilters={true} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
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
