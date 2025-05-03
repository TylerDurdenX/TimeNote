"use client";

import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { useGetUserAttendanceReportDataQuery } from "@/store/api";
import * as XLSX from "xlsx-js-style";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type Props = {
  email: string;
  month: string;
  downloadUserReport: number;
};

const AttendanceReportTable = ({ email, month, downloadUserReport }: Props) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const { data, isLoading, error, refetch } =
    useGetUserAttendanceReportDataQuery(
      { email: email, month, year: String(currentYear) },
      { refetchOnMountOrArgChange: true }
    );

  useEffect(() => {
    refetch;
  }, [email]);

  const { theme } = useTheme();

  let isDarkMode = theme === "dark";

  const [open, setOpen] = useState(false);
  const [rowDataUserId, setRowDataUserId] = useState(0);
  const [rowDataUserName, setRowDataUserName] = useState("");

  useEffect(() => {
    if (downloadUserReport > 0) {
      const flattenedTasks = data?.map((attendance) => ({
        "User Name": attendance.username,
        Date: attendance.date,
        "Punch In Time": attendance.punchInTime,
        "Punch Out Time": attendance.punchOutTime,
        "Working Time": attendance.duration,
        "Active Time": attendance.activeTime,
        "Idle/BreakTime": attendance.totalIdleTime,
      }));

      const worksheet = XLSX.utils.json_to_sheet(flattenedTasks || []);

      // Apply styles to header row
      const headers = Object.keys(flattenedTasks?.[0] || {});
      headers.forEach((header, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
        const cell = worksheet[cellRef];
        if (cell) {
          cell.s = {
            fill: { fgColor: { rgb: "D9D9D9" } }, // Light gray background
            font: { bold: true },
            border: {
              top: { style: "thin", color: { rgb: "000000" } },
              bottom: { style: "thin", color: { rgb: "000000" } },
              left: { style: "thin", color: { rgb: "000000" } },
              right: { style: "thin", color: { rgb: "000000" } },
            },
          };
        }
      });

      // Apply borders to all data cells
      const range = XLSX.utils.decode_range(worksheet["!ref"]!);
      for (let R = 1; R <= range.e.r; ++R) {
        for (let C = 0; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellAddress];
          if (cell) {
            cell.s = {
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } },
              },
            };
          }
        }
      }

      // Create workbook and append sheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Set workbook styles
      worksheet["!cols"] = headers.map(() => ({ wch: 20 })); // Set column width

      // Write the file
      XLSX.writeFile(workbook, "attendance-data-export.xlsx");
    }
  }, [downloadUserReport]);

  const userRolesList = useSelector((state: RootState) => state.userRoles);

  // const userRolesList = sessionStorage.getItem("userRoles");

  let adminPageFlag: boolean = false;

  if (
    userRolesList.userRoles !== undefined &&
    userRolesList.userRoles !== null &&
    userRolesList.userRoles !== ""
  ) {
    // Define the function to check if 'ADMIN' is in the list
    const containsValue = (csvString: string, value: string): boolean => {
      // Split the string by commas to get an array of values
      const valuesArray = csvString.split(",");
      // Check if the value exists in the array
      return valuesArray.includes(value);
    };

    // Call containsValue function to set Admin
    adminPageFlag = containsValue(userRolesList.userRoles, "ADMIN");
  } else {
    console.log("userRolesList is undefined or empty");
  }

  const columns: GridColDef[] = [
    ...(true ? [{ field: "username", headerName: "User Name", flex: 1 }] : []),
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
        return dateString;
      },
    },
    {
      field: "punchInTime",
      headerName: "Punch In Time",
      flex: 0.7,
    },
    {
      field: "punchOutTime",
      headerName: "Punch Out Time",
      flex: 0.7,
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
      <div className="mb-7"> </div>
      <Card>
        <DataGrid
          rows={data || []}
          columns={columns}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </Card>
    </div>
  );
};

export default AttendanceReportTable;
