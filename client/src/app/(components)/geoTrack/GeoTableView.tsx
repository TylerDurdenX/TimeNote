"use client";

import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { useGetUserAttendanceTableDataQuery } from "@/store/api";
import { useTheme } from "next-themes";
import { Button } from "@mui/material";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TimesheetHeader from "../timesheet/TimesheetHeader";
import BreakTable from "../attendanceOld/BreakTable";

type Props = {
  email: string;
  adminFlag: boolean;
  selectedDate: Date;
};

interface RowData {
  id: number;
  date: string;
  consumedHours: string;
  userId: number;
  username: string;
  projectId?: number;
}

const GeoTableView = ({ email, adminFlag, selectedDate }: Props) => {
  const { data, isLoading, error } = useGetUserAttendanceTableDataQuery(
    { email: email, adminFlag: adminFlag, date: selectedDate.toString() },
    { refetchOnMountOrArgChange: true }
  );

  const { theme } = useTheme();

  let isDarkMode = theme === "dark";

  const [open, setOpen] = useState(false);
  const [rowDataUserId, setRowDataUserId] = useState(0);
  const [rowDataUserName, setRowDataUserName] = useState("");

  const userRolesList = sessionStorage.getItem("userRoles");

  let adminPageFlag: boolean = false;

  if (
    userRolesList !== undefined &&
    userRolesList !== null &&
    userRolesList !== ""
  ) {
    // Define the function to check if 'ADMIN' is in the list
    const containsValue = (csvString: string, value: string): boolean => {
      // Split the string by commas to get an array of values
      const valuesArray = csvString.split(",");
      // Check if the value exists in the array
      return valuesArray.includes(value);
    };

    // Call containsValue function to set Admin
    adminPageFlag = containsValue(userRolesList, "ADMIN");
  } else {
    console.log("userRolesList is undefined or empty");
  }

  const addOneDay = (dateString: string) => {
    // Step 1: Parse the date string "DD/MM/YYYY" into an array of [day, month, year]
    const [day, month, year] = dateString.split("/").map(Number);

    // Ensure valid date parsing
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error("Invalid date string:", dateString);
      return "Invalid date"; // Handle invalid date format
    }

    // Step 2: Create a Date object using the parsed components (month is zero-indexed)
    const date = new Date(year, month - 1, day); // month is zero-based in JS

    // Check if the created date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid Date object:", date);
      return "Invalid date";
    }

    // Step 3: Add one day to the date
    date.setDate(date.getDate() + 1);

    // Step 4: Format the new date back into "DD/MM/YYYY"
    const newDay = String(date.getDate()).padStart(2, "0"); // Ensure two digits
    const newMonth = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits
    const newYear = date.getFullYear();

    // Return the new formatted date
    return `${newDay}/${newMonth}/${newYear}`;
  };

  const columns: GridColDef[] = [
    ...(adminFlag
      ? [{ field: "username", headerName: "User Name", flex: 1 }]
      : []),
    {
      field: "date",
      headerName: "Date (dd/mm/yyyy)",
      flex: 1,
      valueFormatter: (params: string) => {
        const dateString = params;

        if (!dateString) {
          console.error("Date value is missing or undefined");
          return "Invalid date";
        }

        // Use the addOneDay function to add one day and format the date
        return addOneDay(dateString);
      },
    },
    {
      field: "punchInTime",
      headerName: "In Time",
      flex: 1,
    },
    {
      field: "punchOutTime",
      headerName: "Out Time",
      flex: 1.5,
    },
    {
      field: "place",
      headerName: "Place",
      flex: 1,
    },
  ];

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0, // Initial page
    pageSize: 10, // Default rows per page
  });

  const handlePaginationChange = (model: {
    page: number;
    pageSize: number;
  }) => {
    setPaginationModel(model);
  };

  return (
    <div className="h-full w-full px-4 pb-8 xl:px-6">
      <Dialog open={open} onOpenChange={setOpen}></Dialog>
      <div className="mb-7">{adminPageFlag ? <></> : ""}</div>
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

export default GeoTableView;
