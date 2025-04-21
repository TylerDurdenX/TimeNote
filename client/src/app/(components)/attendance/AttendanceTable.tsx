"use client";

import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { useGetUserAttendanceTableDataQuery } from "@/store/api";
import { useTheme } from "next-themes";
import { Button, Chip, CircularProgress } from "@mui/material";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BreakTable from "./BreakTable";
import TimesheetHeader from "../timesheet/TimesheetHeader";
import { CheckCircleIcon, CircleX, History } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/components/Sidebar/nav-user";

type Props = {
  email: string;
  adminFlag: boolean;
};

interface RowData {
  id: number;
  date: string;
  consumedHours: string;
  userId: number;
  username: string;
  projectId?: number;
}

const AttendanceTable = ({ email, adminFlag }: Props) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data, isLoading, error } = useGetUserAttendanceTableDataQuery(
    { email: email, adminFlag: adminFlag, date: selectedDate.toString() },
    { refetchOnMountOrArgChange: true }
  );

  const { theme } = useTheme();

  let isDarkMode = theme === "dark";

  const [open, setOpen] = useState(false);
  const [rowDataUserId, setRowDataUserId] = useState(0);
  const [rowDataUserName, setRowDataUserName] = useState("");

  const handleViewDetails = (row: RowData) => {
    setRowDataUserId(row.userId);
    setRowDataUserName(row.username);
    setOpen(true);
  };

  const handleViewDetailsUser = (row: RowData) => {
    setRowDataUserId(row.userId);
    setRowDataUserName(row.username);
    const [day, month, year] = row.date.split("/").map(Number);
    setSelectedDate(new Date(year, month - 1, day));
    setOpen(true);
  };

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
      ? [
          {
            field: "image",
            headerName: "",
            flex: 0.5,
            renderCell: (params: any) => {
              const rowData = params.row;

              return (
                <Avatar className="h-[40px] mt-1 w-[40px] rounded-full justify-center items-center">
                  <AvatarImage
                    src={rowData.image}
                    alt={rowData.username}
                    loading="lazy"
                  />
                  <AvatarFallback className="absolute inset-0 flex justify-center items-center text-[150%]">
                    {getInitials(rowData.username!)}
                  </AvatarFallback>
                </Avatar>
              );
            },
          },
          { field: "username", headerName: "User Name", flex: 1 },
        ]
      : []),
    {
      field: "date",
      headerName: "Date",
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
      flex: 0.7,
    },
    {
      field: "punchOutTime",
      headerName: "Out Time",
      flex: 0.7,
    },
    {
      field: "status",
      headerName: "User Status",
      flex: 1,
      renderCell: (params) => {
        const status = params.value;

        let icon;
        let text;

        if (status === "active") {
          icon = <CheckCircleIcon style={{ color: "green" }} />;
          text = "Active";
        } else if (status === "inactive") {
          icon = <History style={{ color: "orange" }} />;
          text = "On a Break";
        } else {
          icon = <CircleX style={{ color: "black" }} />;
          text = "Offline";
        }

        // then use it like:
        <Chip icon={icon} label={status} />;

        return (
          <Chip
            variant="outlined"
            color={status === "active" ? "success" : "default"}
            icon={icon}
            label={text}
            size="small"
            sx={{ gap: "4px", paddingLeft: "4px" }}
          />
        );
      },
    },
    {
      field: "duration",
      headerName: "Working Time",
      flex: 1,
    },
    {
      field: "activeTime",
      headerName: "Active Time",
      flex: 1,
    },
    {
      field: "totalIdleTime",
      headerName: "Idle/Break Time",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Break Details",
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
              {adminPageFlag ? (
                <>
                  <Button
                    variant="contained"
                    className="mb-5"
                    color="primary"
                    size="small"
                    onClick={() => handleViewDetails(params.row)}
                    sx={{
                      backgroundColor: "#3f51b5",
                      "&:hover": { backgroundColor: "#2c387e" },
                      borderRadius: "8px",
                    }}
                  >
                    View Details
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    className="mb-5"
                    color="primary"
                    size="small"
                    onClick={() => handleViewDetailsUser(params.row)}
                    sx={{
                      backgroundColor: "#3f51b5",
                      "&:hover": { backgroundColor: "#2c387e" },
                      borderRadius: "8px",
                    }}
                  >
                    View Details
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      },
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
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="my-3 flex justify-center items-center">
          {/* Dialog Content */}
          <DialogContent className="max-w-[65vw] max-h-[80vw] mt-5 mb-5 overflow-y-auto">
            {" "}
            {/* Set width to 70% of viewport height */}
            <DialogHeader>
              <DialogTitle>
                {/* {formatDate(selectedDate.toString())} - {rowDataUserName} */}
                {rowDataUserName}
              </DialogTitle>
              <DialogDescription className="text-gray-700 overflow-y-auto">
                <BreakTable
                  email={email}
                  selectedDate={selectedDate}
                  name={rowDataUserName}
                  userId={rowDataUserId}
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
      <div className="mb-7">
        {adminPageFlag ? (
          <>
            <TimesheetHeader
              hasFilters={true}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </>
        ) : (
          ""
        )}
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
