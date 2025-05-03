"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DataGrid, GridRenderCellParams } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  useGetTimesheetDataQuery,
  useGetUserAttendanceTeamReportDataQuery,
  useGetUserTimesheetTeamReportDataQuery,
} from "@/store/api";
import * as XLSX from "xlsx-js-style";
import { useTheme } from "next-themes";

type Props = {
  teamName: string;
  month: string;
  userEmail: string;
  downloadTeamReport: number;
};

const TimesheetReportTable = ({
  teamName,
  month,
  userEmail,
  downloadTeamReport,
}: Props) => {
  const { theme } = useTheme();
  let isDarkMode = theme === "dark";

  const columns = [
    { field: "username", headerName: "User Name", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
  ];

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  // Determine the number of days in the current month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const monthIndex = new Date(`${month} 1, ${currentYear}`).getMonth(); // convert name to index
  const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();

  const dynamicColumns = useMemo(() => {
    const columnsArray = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateField = `date_${day}`;

      columnsArray.push(
        {
          field: `${dateField}_A`,
          headerName: "Logged Hours (hh:mm)",
          width: 170,
          renderCell: (params: GridRenderCellParams) => {
            const isEmpty = !params.value || params.value === "";
            return (
              <div
                className={`${
                  isEmpty ? "text-red-600 bg-red-100" : "text-black"
                } p-2`}
              >
                {params.value || "-"}
              </div>
            );
          },
        },
        {
          field: `${dateField}_B`,
          headerName: "Approved Hours (hh:mm)",
          width: 170,
          renderCell: (params: GridRenderCellParams) => {
            const isEmpty = !params.value || params.value === "";
            return (
              <div
                className={`${
                  isEmpty ? "text-red-600 bg-red-100" : "text-black"
                } p-2`}
              >
                {params.value || "-"}
              </div>
            );
          },
        }
      );
    }
    return columnsArray;
  }, [daysInMonth, month, currentYear]);

  // Combine static and dynamic columns
  const allColumns = [...columns, ...dynamicColumns];

  // Define column grouping model
  const columnGroupingModel = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, day) => ({
      groupId: `${day + 1}/${month}/${currentYear}`,
      children: [
        { field: `date_${day + 1}_A` },
        { field: `date_${day + 1}_B` },
      ],
    }));
  }, [daysInMonth]);

  const { data, isLoading, error } = useGetUserTimesheetTeamReportDataQuery(
    {
      teamName,
      month,
      email: userEmail,
      year: String(currentYear),
    },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (downloadTeamReport > 0) {
      exportToExcel(data!, columns, daysInMonth, monthIndex, currentYear); // assuming May (month 4) and 31 days
    }
  }, [downloadTeamReport]);

  // Example usage with your data structure:
  const staticColumns = [
    { field: "username", headerName: "Username" },
    { field: "email", headerName: "Email" },
  ];

  const exportToExcel = (
    rows: any[],
    staticColumns: { field: string; headerName: string }[],
    daysInMonth: number,
    month: number,
    currentYear: number
  ) => {
    const dynamicColumns: {
      field: string;
      headerName: string;
      group: string;
    }[] = [];

    // Generate dynamic columns for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDate = `${String(day).padStart(2, "0")}/${String(
        month + 1
      ).padStart(2, "0")}/${currentYear}`;
      dynamicColumns.push(
        {
          field: `date_${day}_A`,
          headerName: "Logged Hours (hh:mm)",
          group: formattedDate,
        },
        {
          field: `date_${day}_B`,
          headerName: "Approved Hours (hh:mm)",
          group: formattedDate,
        }
      );
    }

    // Combine static and dynamic columns
    const allColumns = [...staticColumns, ...dynamicColumns];

    // 1. First row: Parent headers (group names)
    const firstRow: any[] = allColumns.map((col) =>
      "group" in col
        ? {
            v: col.group,
            s: {
              font: { bold: true },
              fill: { fgColor: { rgb: "D9D9D9" } },
              border: thickBorderVertical,
            },
          }
        : { v: "", s: { border: thickBorderVertical } }
    );

    // 2. Second row: Sub headers (column labels)
    const secondRow: any[] = allColumns.map((col) => ({
      v: col.headerName,
      s: {
        font: { bold: true },
        fill: { fgColor: { rgb: "F3F3F3" } },
        border: thinBorder,
      },
    }));

    // 3. Data rows
    const dataRows = rows.map((row, rowIdx) =>
      allColumns.map((col, colIdx) => {
        const cellValue =
          row[col.field] !== undefined && row[col.field] !== null
            ? row[col.field]
            : "-";
        let cellStyle = { border: {} };

        // Apply borders only for Working Time and Break/Idle Time, not Active Time
        if (colIdx % 2 !== 1) {
          // Apply thick vertical borders for Working Time and Break/Idle Time columns
          cellStyle = { ...cellStyle, border: thickBorderVertical };
        }

        // Apply left and right borders for the first and last column of each date group
        if (colIdx % 2 === 0) {
          // Left border for Working Time column
          cellStyle = { ...cellStyle, border: leftBorder };
        } else if (colIdx % 2 === 2) {
          // Right border for Break/Idle Time column
          cellStyle = { ...cellStyle, border: rightBorder };
        }

        // For the last row, add a bottom border to all columns
        if (rowIdx === rows.length - 1) {
          cellStyle.border = {
            ...cellStyle.border,
            bottom: { style: "thin", color: { rgb: "000000" } },
          };
        }

        return {
          v: cellValue,
          s: cellStyle,
        };
      })
    );

    // Combine all rows for the export
    const exportData = [firstRow, secondRow, ...dataRows];

    // Worksheet
    const ws = XLSX.utils.aoa_to_sheet(exportData);

    // Merge parent header cells for grouped date columns
    const merges: XLSX.Range[] = [];
    let startCol = staticColumns.length;
    for (let day = 1; day <= daysInMonth; day++) {
      merges.push({
        s: { r: 0, c: startCol },
        e: { r: 0, c: startCol + 1 },
      });
      startCol += 2;
    }
    ws["!merges"] = merges;

    // Set column width (auto-adjust to fit content)
    ws["!cols"] = allColumns.map(() => ({ wch: 20 }));

    // Create and write workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, "timesheet-report.xlsx");
  };

  // Styling constants
  const thinBorder = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
  };

  const thickBorderVertical = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
  };

  const leftBorder = {
    left: { style: "thin", color: { rgb: "000000" } },
  };

  const rightBorder = {
    right: { style: "thin", color: { rgb: "000000" } },
  };

  return (
    <div className="h-full w-full px-4 pb-8 xl:px-6">
      <div className="mb-5 flex items-center gap-4"></div>

      <Card>
        <DataGrid
          rows={data || []}
          columns={allColumns}
          className={dataGridClassNames}
          columnGroupingModel={columnGroupingModel}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </Card>
    </div>
  );
};

export default TimesheetReportTable;
