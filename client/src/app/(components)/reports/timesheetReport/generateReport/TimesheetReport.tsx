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
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Download,
  BarChart3,
} from "lucide-react";

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
    {
      field: "username",
      headerName: "User Name",
      width: 150,
      renderHeader: () => (
        <div className="flex items-center font-semibold text-slate-700">
          <Users className="w-4 h-4 mr-2 text-slate-500" />
          User Name
        </div>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
      renderHeader: () => (
        <div className="flex items-center font-semibold text-slate-700">
          <span className="w-4 h-4 mr-2 text-slate-500">@</span>
          Email
        </div>
      ),
    },
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
          renderHeader: () => (
            <div className="flex items-center justify-center font-medium text-slate-600 text-xs">
              <Clock className="w-3 h-3 mr-1 text-blue-500" />
              Logged
            </div>
          ),
          renderCell: (params: GridRenderCellParams) => {
            const isEmpty = !params.value || params.value === "";
            return (
              <div className="flex items-center justify-center h-full">
                <div
                  className={`
                    ${
                      isEmpty
                        ? "text-red-600 bg-red-50 border border-red-200"
                        : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                    } 
                    px-3 py-1.5 rounded-lg text-sm font-medium min-w-[80px] text-center
                    transition-all duration-200 hover:shadow-sm
                  `}
                >
                  {isEmpty && <AlertCircle className="w-3 h-3 inline mr-1" />}
                  {!isEmpty && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  {params.value || "00:00"}
                </div>
              </div>
            );
          },
        },
        {
          field: `${dateField}_B`,
          headerName: "Approved Hours (hh:mm)",
          width: 170,
          renderHeader: () => (
            <div className="flex items-center justify-center font-medium text-slate-600 text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
              Approved
            </div>
          ),
          renderCell: (params: GridRenderCellParams) => {
            const isEmpty = !params.value || params.value === "";
            return (
              <div className="flex items-center justify-center h-full">
                <div
                  className={`
                    ${
                      isEmpty
                        ? "text-amber-700 bg-amber-50 border border-amber-200"
                        : "text-green-700 bg-green-50 border border-green-200"
                    } 
                    px-3 py-1.5 rounded-lg text-sm font-medium min-w-[80px] text-center
                    transition-all duration-200 hover:shadow-sm
                  `}
                >
                  {isEmpty && <Clock className="w-3 h-3 inline mr-1" />}
                  {!isEmpty && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  {params.value || "Pending"}
                </div>
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
      headerName: `${day + 1}`,
      renderHeaderGroup: () => (
        <div className=" flex-col items-center justify-center py-2 bg-gradient-to-b from-slate-50 to-slate-100 rounded-t-lg border-b-2 border-slate-200">
          <span className="font-bold text-slate-700 text-sm">{day + 1}</span>
          <span className="text-xs ml-1 text-slate-500">
            {month.slice(0, 3)}
          </span>
        </div>
      ),
    }));
  }, [daysInMonth, month]);

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

  // Enhanced DataGrid styles
  const modernDataGridStyles = {
    ...dataGridSxStyles(isDarkMode),
    "& .MuiDataGrid-root": {
      borderRadius: "16px",
      border: "1px solid rgb(226 232 240)",
      backgroundColor: "white",
      boxShadow:
        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    },
    "& .MuiDataGrid-main": {
      borderRadius: "16px",
    },
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "rgb(248 250 252)",
      borderBottom: "2px solid rgb(226 232 240)",
      borderRadius: "16px 16px 0 0",
      minHeight: "60px !important",
    },
    "& .MuiDataGrid-columnHeader": {
      padding: "12px 16px",
      "&:focus": {
        outline: "none",
      },
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: 600,
      color: "rgb(51 65 85)",
    },
    "& .MuiDataGrid-cell": {
      padding: "8px 16px",
      borderRight: "1px solid rgb(241 245 249)",
      "&:focus": {
        outline: "none",
      },
    },
    "& .MuiDataGrid-row": {
      "&:hover": {
        backgroundColor: "rgb(248 250 252)",
        transition: "background-color 0.2s ease",
      },
      "&:nth-of-type(even)": {
        backgroundColor: "rgb(253 254 255)",
      },
    },
    "& .MuiDataGrid-footerContainer": {
      borderTop: "2px solid rgb(226 232 240)",
      backgroundColor: "rgb(248 250 252)",
      borderRadius: "0 0 16px 16px",
    },
    "& .MuiDataGrid-columnSeparator": {
      display: "none",
    },
  };

  const getEmptyStateContent = () => (
    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
          <BarChart3 className="w-8 h-8 text-slate-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-amber-600" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        No Data Available
      </h3>
      <p className="text-sm text-slate-500 text-center max-w-sm">
        No timesheet data found for the selected filters. Try adjusting your
        search criteria or check back later.
      </p>
    </div>
  );

  return (
    <div className="h-full w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-blue-800">
                {data?.length || 0}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">
                Report Period
              </p>
              <p className="text-lg font-bold text-emerald-800">
                {month} {currentYear}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">
                Days in Month
              </p>
              <p className="text-2xl font-bold text-purple-800">
                {daysInMonth}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Grid Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-slate-800">
                Timesheet Data - {month} {currentYear}
              </h3>
            </div>
            {isLoading && (
              <div className="flex items-center text-slate-500 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading...
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {error ? (
            <div className="flex items-center justify-center h-64 text-red-500">
              <AlertCircle className="w-6 h-6 mr-2" />
              <span>Error loading data. Please try again.</span>
            </div>
          ) : (
            <div style={{ height: 600, width: "100%" }}>
              <DataGrid
                rows={data || []}
                columns={allColumns}
                className={dataGridClassNames}
                columnGroupingModel={columnGroupingModel}
                sx={modernDataGridStyles}
                loading={isLoading}
                hideFooter={!data || data.length === 0}
                slots={{
                  noRowsOverlay: getEmptyStateContent,
                }}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 25 },
                  },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                disableRowSelectionOnClick
                disableColumnMenu
                disableColumnFilter
                disableColumnSelector
                disableDensitySelector
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimesheetReportTable;
