"use client";

import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames } from "@/lib/utils";
import { Button, DialogTitle } from "@mui/material";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { useGetUsersTimesheetDataQuery } from "@/store/api";
import TimesheetDataTable from "./TimesheetDataTable";

type Props = {
  email: string;
  selectedDate: Date;
};

interface RowData {
  id: number;
  consumedHours: string;
  userId: number;
  username: string;
  projectId?: number;
}

const UsersTimesheetTable = ({ email, selectedDate }: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
  const [rowDataUserName, setRowDataUserName] = useState("");

  const handleViewDetails = (row: RowData) => {
    setSelectedRow(row);
    setRowDataUserName(row.username);
    setOpen(true);
  };

  const {
    data: usersTimesheetEntry,
    isLoading,
    error,
  } = useGetUsersTimesheetDataQuery(
    { email: email!, date: selectedDate.toString() },
    { refetchOnMountOrArgChange: true }
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const columns: GridColDef[] = [
    {
      field: "username",
      headerName: "User",
      flex: 1.5,
    },
    {
      field: "consumedHours",
      headerName: "Logged Hours",
      flex: 1,
    },
    {
      field: "approvedHours",
      headerName: "Approved Hours",
      flex: 1,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => {
        return formatDate(selectedDate.toString());
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => {
        const rowData = params.row;
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
            <div className="my-3 flex justify-center items-center">
              <Button
                variant="contained"
                className="mb-5"
                color="primary"
                size="small"
                onClick={() => handleViewDetails(params.row)} // Passing the current row's data
                sx={{
                  backgroundColor: "#3f51b5", // Blue color
                  "&:hover": { backgroundColor: "#2c387e" },
                  borderRadius: "8px",
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="my-3 flex justify-center items-center">
          {/* Dialog Content */}
          <DialogContent className="max-w-[65vw] max-h-[80vw] mt-5 mb-5 overflow-y-auto">
            {" "}
            {/* Set width to 70% of viewport height */}
            <DialogHeader>
              <DialogTitle>
                {formatDate(selectedDate.toString())} - {rowDataUserName}
              </DialogTitle>
              <DialogDescription className="text-gray-700 overflow-y-auto">
                <TimesheetDataTable
                  email={email}
                  selectedDate={selectedDate}
                  name={rowDataUserName}
                  dialogFlag={true}
                />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => setOpen(false)}
                variant="contained"
                sx={{
                  backgroundColor: "#3f51b5", // Blue color
                  "&:hover": { backgroundColor: "#2c387e" },
                  borderRadius: "8px",
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </div>
      </Dialog>
      <div className="h-full w-full px-4 pb-8 xl:px-6">
        <DataGrid
          rows={usersTimesheetEntry || []}
          columns={columns}
          className={dataGridClassNames}
        />
      </div>
    </>
  );
};

export default UsersTimesheetTable;
