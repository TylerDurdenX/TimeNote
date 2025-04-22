"use client";

import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  useGetAttendanceCustomTableDataQuery,
  useGetUserAttendanceTableDataQuery,
} from "@/store/api";
import { useTheme } from "next-themes";
import { Button, Chip, CircularProgress } from "@mui/material";
import TimesheetHeader from "../timesheet/TimesheetHeader";
import { CheckCircleIcon, CircleX, History } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/components/Sidebar/nav-user";

type Props = {
  email: string;
  adminFlag: boolean;
  lateFlag: boolean;
  fromDate: string;
  toDate: string;
  teamId: number;
};

interface RowData {
  id: number;
  date: string;
  consumedHours: string;
  userId: number;
  username: string;
  projectId?: number;
}

const HighlightedUsersTable = ({
  email,
  adminFlag,
  lateFlag,
  fromDate,
  toDate,
  teamId,
}: Props) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // const { data, isLoading, error } = useGetAttendanceCustomTableDataQuery(
  //   {
  //     email: email,
  //     fromDate: fromDate,
  //     toDate: toDate,
  //     teamId: teamId,
  //     lateFlag: lateFlag,
  //   },
  //   { refetchOnMountOrArgChange: true }
  // );

  const { theme } = useTheme();

  let isDarkMode = theme === "dark";

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
    ...(lateFlag
      ? [
          {
            field: "lateCount",
            headerName: "Late Count",
            flex: 1,
          },
        ]
      : [
          {
            field: "onTimeCount",
            headerName: "On-Time Count",
            flex: 1,
          },
        ]),

    {
      field: "avgWorkingTime",
      headerName: "Avg Working Time",
      flex: 1,
    },
    {
      field: "avgActiveTime",
      headerName: "Avg Active Time",
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
      <DataGrid
        rows={[]}
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

export default HighlightedUsersTable;
