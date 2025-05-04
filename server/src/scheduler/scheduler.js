import { prisma } from "../server.js";
import XLSX from "xlsx-js-style";
import { isEmpty } from "../utils/genericMethods.js";
import moment from "moment-timezone";
import nodemailer from "nodemailer";
import { DateTime } from "luxon";
import {
  addTimes,
  formatDate,
  formatTime,
  getTimeDifference,
  timeDifference,
} from "../controller/attendanceController/attendanceController.js";

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

export async function sendAutoReport() {
  console.log("scheduler");

  const autoReports = await prisma.autoReports.findMany();

  const now = new Date();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();

  const monthName = month; // Example: passed from somewhere
  const reqYear = year; // You can make this dynamic as needed

  autoReports.map(async (report) => {
    const inputTime = report.ReportTime;

    // Parse "10PM" into a DateTime object in IST
    const nowIST = DateTime.now().setZone("Asia/Kolkata"); // current IST time
    const targetTime = DateTime.fromFormat(inputTime, "ha", {
      zone: "Asia/Kolkata",
    });

    // Attach today's date to target time (important!)
    const fullTargetTime = targetTime.set({
      year: nowIST.year,
      month: nowIST.month,
      day: nowIST.day,
    });

    // Compare
    if (fullTargetTime < nowIST) {
      if (report.reportTriggeredFlag === false) {
        if (report.ReportName === "AttendanceReport") {
          if (!isEmpty(report.userEmail)) {
            let resultList = [];
            const user = await prisma.user.findFirst({
              where: {
                email: report.userEmail,
              },
            });

            const configUser = await prisma.user.findFirst({
              where: {
                userId: report.userId,
              },
            });

            // Convert month name to 0-based index
            const monthIndex = new Date(
              `${monthName} 1, ${reqYear}`
            ).getMonth();

            // Create moment object for the 1st of that month
            const startOfMonth = moment
              .tz({ reqYear, month: monthIndex, day: 1 }, "Asia/Kolkata")
              .startOf("day");
            const isoStartDate = startOfMonth.toISOString();

            // Get the end of that month
            const endOfMonth = startOfMonth
              .clone()
              .endOf("month")
              .startOf("day");
            const isoEndDate = endOfMonth.toISOString();

            const attendanceRecords = await prisma.attendance.findMany({
              where: {
                date: {
                  gte: isoStartDate,
                  lte: isoEndDate,
                },
                userId: user.userId,
              },
              include: {
                breaks: true,
              },
            });

            const finalResult = await Promise.all(
              attendanceRecords.map((attendance, index) => {
                const breakTimeList = attendance.breaks.map(
                  (b) => b.breakTimeInMinutes
                );

                const inTime = attendance.punchInTime
                  ? formatTime(attendance.punchInTime)
                  : "NA";

                const outTime = attendance.punchOutTime
                  ? formatTime(attendance.punchOutTime)
                  : "NA";

                let duration = getTimeDifference(inTime, outTime);
                if (duration.includes("N")) {
                  duration = "00:00:00";
                }

                const breakTime = addTimes(breakTimeList);

                const data = {
                  id: index + 1,
                  userId: attendance.userId,
                  date: formatDate(attendance.date),
                  punchInTime: inTime,
                  punchOutTime: outTime,
                  username: attendance.username,
                  duration: duration,
                  totalIdleTime: breakTime,
                  activeTime: timeDifference(duration, breakTime),
                  place: attendance.city,
                };

                resultList.push(data);
              })
            );
            const flattenedTasks = resultList?.map((attendance) => ({
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
            const headers = Object.keys(
              (flattenedTasks && flattenedTasks[0]) || {}
            );
            headers.forEach((header, index) => {
              const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
              const cell = worksheet[cellRef];
              if (cell) {
                cell.s = {
                  fill: { fgColor: { rgb: "D9D9D9" } },
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
            const range = XLSX.utils.decode_range(worksheet["!ref"]);
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

            // Set column widths
            worksheet["!cols"] = headers.map(() => ({ wch: 20 }));

            // Write to file
            // XLSX.writeFile(workbook, "attendance-data-export.xlsx");
            const buffer = XLSX.write(workbook, {
              bookType: "xlsx",
              type: "buffer",
            });

            const transporter = nodemailer.createTransport({
              service: "Gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            // 4. Send mail with attachment
            const mailOptions = {
              from: `"Lynk247"`,
              to: configUser.email,
              subject: "Attendance Report",
              text: "Please find the attached Excel file.",
              attachments: [
                {
                  filename: "data-export.xlsx",
                  content: buffer,
                  contentType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
              ],
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.error("Error sending mail:", error);
              }
              console.log("Email sent:", info.response);
            });

            await prisma.autoReports.update({
              where: {
                id: report.id,
              },
              data: {
                reportTriggeredFlag: true,
              },
            });
          } else if (report.allUsersFlag === true) {
            const usersList = await prisma.user.findMany();

            const configUser = await prisma.user.findFirst({
              where: {
                userId: report.userId,
              },
            });

            const monthIndex = new Date(
              `${monthName} 1, ${reqYear}`
            ).getMonth();

            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const daysInMonth = new Date(
              currentYear,
              monthIndex + 1,
              0
            ).getDate();

            // Create moment object for the 1st of that month
            const startOfMonth = moment
              .tz({ reqYear, month: monthIndex, day: 1 }, "Asia/Kolkata")
              .startOf("day");
            const isoStartDate = startOfMonth.toISOString();

            // Get the end of that month
            const endOfMonth = startOfMonth
              .clone()
              .endOf("month")
              .startOf("day");
            const isoEndDate = endOfMonth.toISOString();

            const finalResult = await Promise.all(
              usersList.map(async (member, idx) => {
                const attendanceRecords = await prisma.attendance.findMany({
                  where: {
                    date: {
                      gte: isoStartDate,
                      lte: isoEndDate,
                    },
                    userId: member.userId,
                  },
                  include: {
                    breaks: true,
                  },
                });

                let attendanceData = [];

                attendanceRecords.forEach((attendance) => {
                  const breakTimeList = attendance.breaks.map(
                    (b) => b.breakTimeInMinutes
                  );

                  const inTime = attendance.punchInTime
                    ? formatTime(attendance.punchInTime)
                    : "NA";

                  const outTime = attendance.punchOutTime
                    ? formatTime(attendance.punchOutTime)
                    : "NA";

                  let duration = getTimeDifference(inTime, outTime);
                  if (duration.includes("N")) {
                    duration = "00:00:00";
                  }

                  const breakTime = addTimes(breakTimeList);

                  const dateTime = new Date(attendance.date);
                  const day = dateTime.getDate();
                  const obj = {
                    [`date_${day}_A`]: duration,
                    [`date_${day}_B`]: timeDifference(duration, breakTime),
                    [`date_${day}_C`]: breakTime,
                  };
                  attendanceData.push(obj);
                });
                const flattenedData = attendanceData.reduce((acc, curr) => {
                  return { ...acc, ...curr };
                }, {});

                return {
                  id: idx + 1,
                  username: member.username,
                  email: member.email,
                  presentDays: attendanceData.length,
                  ...flattenedData,
                };
              })
            );

            const tempColumns = () => {
              const columnsArray = [];

              // Generate dynamic columns for each day
              for (let day = 1; day <= daysInMonth; day++) {
                const formattedDate = `${String(day).padStart(2, "0")}/${String(
                  month + 1
                ).padStart(2, "0")}/${currentYear}`;

                // Create three subcolumns under each date group
                columnsArray.push(
                  {
                    field: `date_${day}_A`,
                    headerName: "Working Time",
                    width: 100,
                    group: formattedDate,
                  },
                  {
                    field: `date_${day}_B`,
                    headerName: "Active Time",
                    width: 100,
                    group: formattedDate,
                  },
                  {
                    field: `date_${day}_C`,
                    headerName: "Break/Idle Time",
                    width: 100,
                    group: formattedDate,
                  }
                );
              }

              return columnsArray;
            };

            const dynamicColumns = tempColumns();

            // Create column grouping model (this will group the subcolumns under the date)
            const columnGroupingModel = Array.from(
              { length: daysInMonth },
              (_, day) => {
                const formattedDate = `${String(day + 1).padStart(
                  2,
                  "0"
                )}/${String(month + 1).padStart(2, "0")}/${currentYear}`;

                return {
                  groupId: formattedDate, // Group by formatted date
                  children: [
                    { field: `date_${day + 1}_A` },
                    { field: `date_${day + 1}_B` },
                    { field: `date_${day + 1}_C` },
                  ],
                };
              }
            );

            // Static Columns: Columns that are not dynamic
            const staticColumns = [
              { field: "username", headerName: "Username" },
              { field: "email", headerName: "Email" },
              { field: "presentDays", headerName: "Present Days" },
            ];

            // Combine static columns and dynamic columns together
            const allColumns = [...staticColumns, ...dynamicColumns];

            // Prepare the header rows for Excel export
            const firstRow = allColumns.map((col) => ({
              v: col.group || "", // If there’s a group, show it as a header
              s: {
                font: { bold: true },
                fill: { fgColor: { rgb: "D9D9D9" } }, // Gray background
                border: thickBorderVertical,
              },
            }));

            const secondRow = allColumns.map((col) => ({
              v: col.headerName, // Sub-headers for the columns
              s: {
                font: { bold: true },
                fill: { fgColor: { rgb: "F3F3F3" } }, // Light gray
                border: thinBorder,
              },
            }));

            // Data rows
            const dataRows = finalResult.map((row, rowIdx) =>
              allColumns.map((col, colIdx) => {
                const cellValue =
                  row[col.field] !== undefined && row[col.field] !== null
                    ? row[col.field]
                    : "-";
                let cellStyle = { border: {} };

                // Apply border for all columns except Active Time
                if (colIdx % 3 !== 1) {
                  cellStyle = { ...cellStyle, border: thickBorderVertical };
                }

                // Apply left and right borders for first and last columns
                if (colIdx % 3 === 0) {
                  cellStyle = { ...cellStyle, border: leftBorder };
                } else if (colIdx % 3 === 2) {
                  cellStyle = { ...cellStyle, border: rightBorder };
                }

                // Add bottom border for the last row
                if (rowIdx === finalResult.length - 1) {
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

            // Combine all rows into export data
            const exportData = [firstRow, secondRow, ...dataRows];

            // Create a new worksheet with all data
            const ws = XLSX.utils.aoa_to_sheet(exportData);

            // Merges for parent headers
            const merges = [];
            let startCol = staticColumns.length;
            for (let day = 1; day <= daysInMonth; day++) {
              merges.push({
                s: { r: 0, c: startCol },
                e: { r: 0, c: startCol + 2 },
              });
              startCol += 3;
            }
            ws["!merges"] = merges;

            // Column width for auto fit
            ws["!cols"] = allColumns.map(() => ({ wch: 20 }));

            // Create a workbook and append the worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Report");

            const buffer = XLSX.write(wb, {
              bookType: "xlsx",
              type: "buffer",
            });

            const transporter = nodemailer.createTransport({
              service: "Gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            // 4. Send mail with attachment
            const mailOptions = {
              from: `"Lynk247"`,
              to: configUser.email,
              subject: "Attendance Report",
              text: "Please find the attached Excel file.",
              attachments: [
                {
                  filename: "data-export.xlsx",
                  content: buffer,
                  contentType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
              ],
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.error("Error sending mail:", error);
              }
              console.log("Email sent:", info.response);
            });

            await prisma.autoReports.update({
              where: {
                id: report.id,
              },
              data: {
                reportTriggeredFlag: true,
              },
            });
          } else if (!isEmpty(report.team)) {
            const usersList = await prisma.user.findMany();

            const dbTeam = await prisma.team.findFirst({
              where: {
                name: report.team,
              },
              include: {
                members: true,
              },
            });

            const configUser = await prisma.user.findFirst({
              where: {
                userId: report.userId,
              },
            });

            const monthIndex = new Date(
              `${monthName} 1, ${reqYear}`
            ).getMonth();

            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const daysInMonth = new Date(
              currentYear,
              monthIndex + 1,
              0
            ).getDate();

            // Create moment object for the 1st of that month
            const startOfMonth = moment
              .tz({ reqYear, month: monthIndex, day: 1 }, "Asia/Kolkata")
              .startOf("day");
            const isoStartDate = startOfMonth.toISOString();

            // Get the end of that month
            const endOfMonth = startOfMonth
              .clone()
              .endOf("month")
              .startOf("day");
            const isoEndDate = endOfMonth.toISOString();

            const finalResult = await Promise.all(
              dbTeam.members.map(async (member, idx) => {
                const attendanceRecords = await prisma.attendance.findMany({
                  where: {
                    date: {
                      gte: isoStartDate,
                      lte: isoEndDate,
                    },
                    userId: member.userId,
                  },
                  include: {
                    breaks: true,
                  },
                });

                let attendanceData = [];

                attendanceRecords.forEach((attendance) => {
                  const breakTimeList = attendance.breaks.map(
                    (b) => b.breakTimeInMinutes
                  );

                  const inTime = attendance.punchInTime
                    ? formatTime(attendance.punchInTime)
                    : "NA";

                  const outTime = attendance.punchOutTime
                    ? formatTime(attendance.punchOutTime)
                    : "NA";

                  let duration = getTimeDifference(inTime, outTime);
                  if (duration.includes("N")) {
                    duration = "00:00:00";
                  }

                  const breakTime = addTimes(breakTimeList);

                  const dateTime = new Date(attendance.date);
                  const day = dateTime.getDate();
                  const obj = {
                    [`date_${day}_A`]: duration,
                    [`date_${day}_B`]: timeDifference(duration, breakTime),
                    [`date_${day}_C`]: breakTime,
                  };
                  attendanceData.push(obj);
                });
                const flattenedData = attendanceData.reduce((acc, curr) => {
                  return { ...acc, ...curr };
                }, {});

                return {
                  id: idx + 1,
                  username: member.username,
                  email: member.email,
                  presentDays: attendanceData.length,
                  ...flattenedData,
                };
              })
            );

            const tempColumns = () => {
              const columnsArray = [];

              // Generate dynamic columns for each day
              for (let day = 1; day <= daysInMonth; day++) {
                const formattedDate = `${String(day).padStart(2, "0")}/${String(
                  month + 1
                ).padStart(2, "0")}/${currentYear}`;

                // Create three subcolumns under each date group
                columnsArray.push(
                  {
                    field: `date_${day}_A`,
                    headerName: "Working Time",
                    width: 100,
                    group: formattedDate,
                  },
                  {
                    field: `date_${day}_B`,
                    headerName: "Active Time",
                    width: 100,
                    group: formattedDate,
                  },
                  {
                    field: `date_${day}_C`,
                    headerName: "Break/Idle Time",
                    width: 100,
                    group: formattedDate,
                  }
                );
              }

              return columnsArray;
            };

            const dynamicColumns = tempColumns();

            // Create column grouping model (this will group the subcolumns under the date)
            const columnGroupingModel = Array.from(
              { length: daysInMonth },
              (_, day) => {
                const formattedDate = `${String(day + 1).padStart(
                  2,
                  "0"
                )}/${String(month + 1).padStart(2, "0")}/${currentYear}`;

                return {
                  groupId: formattedDate, // Group by formatted date
                  children: [
                    { field: `date_${day + 1}_A` },
                    { field: `date_${day + 1}_B` },
                    { field: `date_${day + 1}_C` },
                  ],
                };
              }
            );

            // Static Columns: Columns that are not dynamic
            const staticColumns = [
              { field: "username", headerName: "Username" },
              { field: "email", headerName: "Email" },
              { field: "presentDays", headerName: "Present Days" },
            ];

            // Combine static columns and dynamic columns together
            const allColumns = [...staticColumns, ...dynamicColumns];

            // Prepare the header rows for Excel export
            const firstRow = allColumns.map((col) => ({
              v: col.group || "", // If there’s a group, show it as a header
              s: {
                font: { bold: true },
                fill: { fgColor: { rgb: "D9D9D9" } }, // Gray background
                border: thickBorderVertical,
              },
            }));

            const secondRow = allColumns.map((col) => ({
              v: col.headerName, // Sub-headers for the columns
              s: {
                font: { bold: true },
                fill: { fgColor: { rgb: "F3F3F3" } }, // Light gray
                border: thinBorder,
              },
            }));

            // Data rows
            const dataRows = finalResult.map((row, rowIdx) =>
              allColumns.map((col, colIdx) => {
                const cellValue =
                  row[col.field] !== undefined && row[col.field] !== null
                    ? row[col.field]
                    : "-";
                let cellStyle = { border: {} };

                // Apply border for all columns except Active Time
                if (colIdx % 3 !== 1) {
                  cellStyle = { ...cellStyle, border: thickBorderVertical };
                }

                // Apply left and right borders for first and last columns
                if (colIdx % 3 === 0) {
                  cellStyle = { ...cellStyle, border: leftBorder };
                } else if (colIdx % 3 === 2) {
                  cellStyle = { ...cellStyle, border: rightBorder };
                }

                // Add bottom border for the last row
                if (rowIdx === finalResult.length - 1) {
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

            // Combine all rows into export data
            const exportData = [firstRow, secondRow, ...dataRows];

            // Create a new worksheet with all data
            const ws = XLSX.utils.aoa_to_sheet(exportData);

            // Merges for parent headers
            const merges = [];
            let startCol = staticColumns.length;
            for (let day = 1; day <= daysInMonth; day++) {
              merges.push({
                s: { r: 0, c: startCol },
                e: { r: 0, c: startCol + 2 },
              });
              startCol += 3;
            }
            ws["!merges"] = merges;

            // Column width for auto fit
            ws["!cols"] = allColumns.map(() => ({ wch: 20 }));

            // Create a workbook and append the worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Report");

            const buffer = XLSX.write(wb, {
              bookType: "xlsx",
              type: "buffer",
            });

            const transporter = nodemailer.createTransport({
              service: "Gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            // 4. Send mail with attachment
            const mailOptions = {
              from: `"Lynk247"`,
              to: configUser.email,
              subject: "Attendance Report",
              text: "Please find the attached Excel file.",
              attachments: [
                {
                  filename: "data-export.xlsx",
                  content: buffer,
                  contentType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
              ],
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.error("Error sending mail:", error);
              }
              console.log("Email sent:", info.response);
            });

            await prisma.autoReports.update({
              where: {
                id: report.id,
              },
              data: {
                reportTriggeredFlag: true,
              },
            });
          }
        }
      }
    } else {
      if (report.reportTriggeredFlag !== false) {
        await prisma.autoReports.update({
          where: {
            id: report.id,
          },
          data: {
            reportTriggeredFlag: false,
          },
        });
      }
    }
  });
}
