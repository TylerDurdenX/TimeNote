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
import { subtractHoursFromTime } from "../controller/projectController/projectController.js";

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

function addTimesReport(time1, time2) {
  const [h1, m1, s1] = time1.split(":").map(Number);
  const [h2, m2, s2] = time2.split(":").map(Number);

  let seconds = s1 + s2;
  let minutes = m1 + m2 + Math.floor(seconds / 60);
  let hours = h1 + h2 + Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  // Pad with zero if needed
  const pad = (n) => n.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatToDDMMYYYY(dateInput) {
  const date = new Date(dateInput);

  // If date is invalid, return a fallback or throw error
  if (isNaN(date)) {
    console.warn("Invalid date format:", dateInput);
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export async function sendAutoReport() {
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
        const configUser = await prisma.user.findFirst({
          where: {
            userId: report.userId,
          },
        });
        if (report.ReportName === "AttendanceReport") {
          if (!isEmpty(report.userEmail)) {
            let resultList = [];
            const user = await prisma.user.findFirst({
              where: {
                email: report.userEmail,
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
                  month
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
                  month
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
        } else if (report.ReportName === "TimesheetReport") {
          let finalResultList = [];
          let id = 1;
          const monthName = month; // Example: passed from somewhere
          const reqYear = year; // You can make this dynamic as needed

          // Convert month name to 0-based index
          const monthIndex = new Date(`${monthName} 1, ${reqYear}`).getMonth();

          // Create moment object for the 1st of that month
          const startOfMonth = moment
            .tz({ reqYear, month: monthIndex, day: 1 }, "Asia/Kolkata")
            .startOf("day");
          const isoStartDate = startOfMonth.toISOString();

          // Get the end of that month
          const endOfMonth = startOfMonth.clone().endOf("month").startOf("day");
          const isoEndDate = endOfMonth.toISOString();

          let usersList = [];

          if (report.allUsersFlag === true) {
            usersList = await prisma.user.findMany({
              include: {
                timesheet: {
                  where: {
                    date: {
                      gte: isoStartDate,
                      lte: isoEndDate,
                    },
                  },
                },
              },
            });
          } else if (!isEmpty(report.team)) {
            const team = await prisma.team.findFirst({
              where: {
                name: report.team,
              },
              include: {
                members: {
                  include: {
                    timesheet: {
                      where: {
                        date: {
                          gte: isoStartDate,
                          lte: isoEndDate,
                        },
                      },
                    },
                  },
                },
              },
            });

            usersList = team.members;
          } else if (!isEmpty(report.userEmail)) {
            usersList = await prisma.user.findMany({
              where: {
                email: report.userEmail,
              },
              include: {
                timesheet: {
                  where: {
                    date: {
                      gte: isoStartDate,
                      lte: isoEndDate,
                    },
                  },
                },
              },
            });
          }

          function timeToMinutes(timeStr) {
            if (!timeStr || typeof timeStr !== "string") return 0;
            const parts = timeStr.split(":");
            if (parts.length !== 2) return 0;
            const [hours, minutes] = parts.map(Number);
            return isNaN(hours) || isNaN(minutes) ? 0 : hours * 60 + minutes;
          }

          // Helper: convert total minutes → "hh:mm"
          function minutesToTime(totalMinutes) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return `${String(hours).padStart(2, "0")}:${String(
              minutes
            ).padStart(2, "0")}`;
          }

          usersList.map((user) => {
            // Group and total separately
            const grouped = {};

            user.timesheet.forEach((item) => {
              const dateKey = new Date(item.date).toISOString().split("T")[0];
              const startMinutes = timeToMinutes(item.consumedHours);
              const endMinutes = timeToMinutes(item.approvedHours);

              if (!grouped[dateKey]) {
                grouped[dateKey] = { totalStart: 0, totalEnd: 0 };
              }

              grouped[dateKey].totalStart += startMinutes;
              grouped[dateKey].totalEnd += endMinutes;
            });

            // Format result
            const result = Object.entries(grouped).map(
              ([date, { totalStart, totalEnd }]) => ({
                date,
                consumedHours: minutesToTime(totalStart),
                approvedHours: minutesToTime(totalEnd),
              })
            );

            const transformed = {};

            result.forEach((item) => {
              const day = String(new Date(item.date).getDate()); // Always 2-digit day
              transformed["id"] = id;
              transformed["username"] = user.username;
              transformed["email"] = user.email;
              transformed[`date_${day}_A`] = item.consumedHours || "";
              transformed[`date_${day}_B`] = item.approvedHours || "";
            });

            if (!isEmpty(transformed)) {
              finalResultList.push(transformed);
            } else {
              const obj = {
                id: id,
                username: user.username,
                email: user.email,
              };
              finalResultList.push(obj);
            }
            id = id + 1;
          });
          // return res.status(200).json(finalResultList);

          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const daysInMonth = new Date(
            currentYear,
            monthIndex + 1,
            0
          ).getDate();

          const tempColumns = () => {
            const columnsArray = [];

            for (let day = 1; day <= daysInMonth; day++) {
              const dateField = `date_${day}`;
              const formattedDate = `${String(day).padStart(2, "0")}/${String(
                month
              ).padStart(2, "0")}/${currentYear}`;

              columnsArray.push(
                {
                  field: `${dateField}_A`,
                  headerName: "Logged Hours (hh:mm)",
                  width: 170,
                  group: formattedDate,
                },
                {
                  field: `${dateField}_B`,
                  headerName: "Approved Hours (hh:mm)",
                  width: 170,
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
              )}/${month}/${currentYear}`;
              return {
                groupId: formattedDate,
                children: [
                  { field: `date_${day + 1}_A` },
                  { field: `date_${day + 1}_B` },
                ],
              };
            }
          );

          // Static Columns: Columns that are not dynamic
          const staticColumns = [
            { field: "username", headerName: "Username" },
            { field: "email", headerName: "Email" },
          ];

          // Combine static columns and dynamic columns together
          const allColumns = [...staticColumns, ...dynamicColumns];

          const firstRow = allColumns.map((col) => ({
            v: col.group || "", // If there’s a group, show it as a header
            s: {
              font: { bold: true },
              fill: { fgColor: { rgb: "D9D9D9" } }, // Gray background
              border: thickBorderVertical,
            },
          }));

          // 2. Second row: Sub headers (column labels)
          const secondRow = allColumns.map((col) => ({
            v: col.headerName,
            s: {
              font: { bold: true },
              fill: { fgColor: { rgb: "F3F3F3" } },
              border: thinBorder,
            },
          }));

          // 3. Data rows
          const dataRows = finalResultList.map((row, rowIdx) =>
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
              if (rowIdx === finalResultList.length - 1) {
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
              e: { r: 0, c: startCol + 1 },
            });
            startCol += 2;
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
            subject: "Timesheet Report",
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
        } else if (report.ReportName === "ProjectReport") {
          let projectsList = [];
          let resultList = [];

          if (!isEmpty(report.userEmail)) {
            const user = await prisma.user.findFirst({
              where: {
                email: report.userEmail,
              },
              select: {
                userId: true,
              },
            });
            projectsList = await prisma.project.findMany({
              where: {
                projectManager: user.userId,
                OR: [{ status: { not: "Closed" } }, { status: null }],
              },
              include: {
                tasks: {
                  include: {
                    subTasks: true,
                  },
                },
                user: true,
              },
            });
          } else {
            projectsList = await prisma.project.findMany({
              where: {
                OR: [{ status: { not: "Closed" } }, { status: null }],
              },
              include: {
                tasks: {
                  include: {
                    subTasks: true,
                  },
                },
                user: true,
              },
            });
          }

          projectsList.map((project) => {
            let estimatedHoursNum = 0;
            let consumedHours = "00:00:00";
            let timeStartFlag = false;

            project.tasks.map((task) => {
              estimatedHoursNum = estimatedHoursNum + Number(task.points);

              let totalTaskTime = "";
              let diff = 0;
              if (task.inProgressStartTime !== null) {
                const targetTime = new Date(task.inProgressStartTime);
                const currentTime = new Date();
                diff += currentTime.getTime() - targetTime.getTime();
                timeStartFlag = true;
              }

              if (task.inProgressTimeinMinutes !== null)
                diff += Number(task.inProgressTimeinMinutes) * 60 * 1000;

              task.subTasks.map((subTask) => {
                // Check if subTask has an inProgressStartTime
                if (subTask.inProgressStartTime !== null) {
                  const targetTime = new Date(subTask.inProgressStartTime);
                  const currentTime = new Date();
                  diff += currentTime.getTime() - targetTime.getTime(); // Add the time difference in ms
                  timeStartFlag = true; // Flag that a time difference was calculated
                }

                // Check if subTask has inProgressTimeinMinutes
                if (subTask.inProgressTimeinMinutes !== null) {
                  diff += Number(subTask.inProgressTimeinMinutes) * 60 * 1000; // Convert minutes to milliseconds
                }
              });

              const seconds = Math.floor(diff / 1000);
              const minutes = Math.floor(seconds / 60);
              const hours = Math.floor(minutes / 60)
                .toString()
                .padStart(2, "0");
              const remainingMinutes = (minutes % 60)
                .toString()
                .padStart(2, "0");
              const remainingSeconds = (seconds % 60)
                .toString()
                .padStart(2, "0");

              totalTaskTime =
                `${hours}:${remainingMinutes}:${remainingSeconds}` +
                (timeStartFlag ? "*" : "");
              consumedHours = addTimesReport(totalTaskTime, consumedHours);
            });

            const obj = {
              id: project.id,
              name: project.name,
              clientName: project.clientName,
              description: project.description,
              status: project.status,
              startDate: formatToDDMMYYYY(project.startDate),
              dueDate: formatToDDMMYYYY(project.endDate),
              projectManager: project.user.username,
              estimatedHours: estimatedHoursNum.toString() + ":00:00",
              consumedHours: consumedHours,
              hoursOverrun: subtractHoursFromTime(
                consumedHours,
                estimatedHoursNum
              ),
              completionStatus: (() => {
                const tasksList = project.tasks;
                const totalTasks = tasksList.length;
                let completedTasksCount = 0;

                tasksList.forEach((task) => {
                  if (task.status === "Closed") {
                    completedTasksCount += 1;
                  }
                });

                return ((completedTasksCount / totalTasks) * 100).toFixed(2);
              })(),
            };
            resultList.push(obj);
          });

          // res.status(200).json(resultList);
          const flattenedTasks = resultList?.map((project) => {
            return {
              "Project Name": project.name,
              Description: project.description,
              "Client Name": project.clientName,
              Status: project.status,
              "Start Date (DD/MM/YYYY)": project.startDate,
              "Due Date (DD/MM/YYYY)": project.dueDate,
              "Project Manager": project.projectManager,
              "Estimated Hours (HH:MM:SS)": project.estimatedHours,
              "Consumed Hours (HH:MM:SS)": project.consumedHours,
              "Hours Overrun (HH:MM:SS)": project.hoursOverrun,
              "Completion Percentage": project.completionStatus,
            };
          });

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

          // Set workbook styles
          worksheet["!cols"] = headers.map(() => ({ wch: 20 })); // Set column width

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
            subject: "Project Report",
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

export async function sendAlerts() {
  const alerts = await prisma.alertsConfigurations.findMany();
  console.log("scheduler");

  alerts.map(async (alert) => {
    if (alert.type === "ActiveTimeAlert" || alert.type === "TimesheetAlert") {
      const nowInIndia = moment.tz("Asia/Kolkata");
      const elevenThirty = moment
        .tz("Asia/Kolkata")
        .set({ hour: 23, minute: 30, second: 0, millisecond: 0 });

      if (nowInIndia.isSameOrAfter(elevenThirty)) {
        if (alert.alertTriggeredFlag === false) {
          if (alert.type === "ActiveTimeAlert") {
            const user = await prisma.user.findFirst({
              where: {
                userId: alert.userId,
              },
              include: {
                roles: true,
              },
            });
            const todayDate = moment().tz("Asia/Kolkata").startOf("day");
            const indianTimeISOString = todayDate.toISOString();
            if (user.roles.some((role) => role.code === "ADMIN")) {
              let usersList = [];
              const attendanceRecords = await prisma.attendance.findMany({
                where: {
                  date: indianTimeISOString,
                },
              });
              attendanceRecords.map((attendance) => {
                if (
                  parseInt(attendance.activeTime.split(":")[0], 10) < alert.time
                ) {
                  usersList.push(attendance.username);
                }
              });

              if (!isEmpty(usersList)) {
                const newAlert = await prisma.alert.create({
                  data: {
                    title: "Active Time Shortfall",
                    description: `The mentioned users have less than ${alert.time} hours of active time #${usersList}`,
                    triggeredDate: indianTimeISOString,
                    userId: alert.userId,
                  },
                });
              }

              const updatedAlert = await prisma.alertsConfigurations.update({
                where: {
                  id: alert.id,
                },
                data: {
                  alertTriggeredFlag: true,
                },
              });
            } else if (user.roles.some((role) => role.code === "TEAM_LEAD")) {
              let usersList = [];

              const team = await prisma.team.findFirst({
                where: {
                  teamLeaderEmail: user.email,
                },
                include: {
                  members: {
                    select: {
                      userId: true,
                    },
                  },
                },
              });

              const attendanceRecords = await prisma.attendance.findMany({
                where: {
                  date: indianTimeISOString,
                  userId: {
                    in: team.members,
                  },
                },
              });

              attendanceRecords.map((attendance) => {
                if (
                  parseInt(attendance.activeTime.split(":")[0], 10) < alert.time
                ) {
                  usersList.push(attendance.username);
                }
              });

              if (!isEmpty(usersList)) {
                const newAlert = await prisma.alert.create({
                  data: {
                    title: "Active Time Shortfall",
                    description: `The mentioned users have less than ${alert.time} hours of active time #${usersList}`,
                    triggeredDate: indianTimeISOString,
                    userId: alert.userId,
                  },
                });
              }

              const updatedAlert = await prisma.alertsConfigurations.update({
                where: {
                  id: alert.id,
                },
                data: {
                  alertTriggeredFlag: true,
                },
              });
            }
          } else if (alert.type === "TimesheetAlert") {
            const user = await prisma.user.findFirst({
              where: {
                userId: alert.userId,
              },
              include: {
                roles: true,
              },
            });
            const todayDate = moment().tz("Asia/Kolkata").startOf("day");
            const indianTimeISOString = todayDate.toISOString();
            if (user.roles.some((role) => role.code === "ADMIN")) {
              let usersList = [];

              const userIdList = await prisma.user.findMany({
                select: {
                  userId: true,
                  username: true,
                },
              });

              const result = await Promise.all(
                userIdList.map(async (user) => {
                  const timesheetRecords = await prisma.timesheet.findMany({
                    where: {
                      date: indianTimeISOString,
                      userId: user.userId,
                    },
                  });

                  let totalMinutes = 0;

                  if (!isEmpty(timesheetRecords)) {
                    timesheetRecords.map((timesheet) => {
                      if (!isEmpty(timesheet.approvedHours)) {
                        const [hours, minutes] = timesheet.approvedHours
                          .split(":")
                          .map(Number);
                        totalMinutes += hours * 60 + minutes;
                      }
                    });
                  } else {
                    if (!usersList.includes(user.username)) {
                      usersList.push(user.username);
                    }
                  }

                  const totalHours = Math.floor(totalMinutes / 60);
                  const remainingMinutes = totalMinutes % 60;

                  if (!isEmpty(timesheetRecords)) {
                    if (totalHours < alert.time) {
                      if (!usersList.push(timesheetRecords[0].username)) {
                        usersList.push(timesheetRecords[0].username);
                      }
                    }
                  }
                })
              );

              if (!isEmpty(usersList)) {
                const date = new Date(todayDate);

                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
                const year = date.getFullYear();
                const formatted = `${day}/${month}/${year}`;

                const newAlert = await prisma.alert.create({
                  data: {
                    title: "Timesheet Hours Shortfall",
                    description: `The mentioned users have less than ${alert.time} hours of logged time in Timesheet for date ${formatted}#${usersList}`,
                    triggeredDate: indianTimeISOString,
                    userId: alert.userId,
                  },
                });
              }

              const updatedAlert = await prisma.alertsConfigurations.update({
                where: {
                  id: alert.id,
                },
                data: {
                  alertTriggeredFlag: true,
                },
              });
            } else if (user.roles.some((role) => role.code === "TEAM_LEAD")) {
              let usersList = [];

              const team = await prisma.team.findFirst({
                where: {
                  teamLeaderEmail: user.email,
                },
                include: {
                  members: {
                    select: {
                      userId: true,
                    },
                  },
                },
              });

              team.members.map(async (user) => {
                const timesheetRecords = await prisma.timesheet.findMany({
                  where: {
                    date: indianTimeISOString,
                    userId: user.userId,
                  },
                });

                let totalMinutes = 0;

                if (!isEmpty(timesheetRecords)) {
                  timesheetRecords.map((timesheet) => {
                    if (!isEmpty(timesheet.approvedHours)) {
                      const [hours, minutes] = timesheet.approvedHours
                        .split(":")
                        .map(Number);
                      totalMinutes += hours * 60 + minutes;
                    }
                  });
                } else {
                  usersList.push(user.username);
                }

                const totalHours = Math.floor(totalMinutes / 60);
                const remainingMinutes = totalMinutes % 60;

                if (totalHours < alert.time) {
                  usersList.push(timesheetRecords[0].username);
                }
              });

              if (!isEmpty(usersList)) {
                const newAlert = await prisma.alert.create({
                  data: {
                    title: "Timesheet Hours Shortfall",
                    description: `The mentioned users have less than ${alert.time} hours of logged time in Timesheet for date ${todayDate}#${usersList}`,
                    triggeredDate: indianTimeISOString,
                    userId: alert.userId,
                  },
                });
              }

              const updatedAlert = await prisma.alertsConfigurations.update({
                where: {
                  id: alert.id,
                },
                data: {
                  alertTriggeredFlag: true,
                },
              });
            }
            // Trigger Alert
          }
        }
      } else {
        if (alert.alertTriggeredFlag === true) {
          const updatedAlert = await prisma.alertsConfigurations.update({
            where: {
              id: alert.id,
            },
            data: {
              alertTriggeredFlag: false,
            },
          });
        }
      }
    } else if (alert.type === "ProjectTimelineAlert") {
    }
  });
}
