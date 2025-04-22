import catchAsync from "../../utils/catchAsync.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import AppError from "../../utils/appError.js";
import { isEmpty } from "../../utils/genericMethods.js";
import { prisma } from "../../server.js";
import { startOfMonth, endOfMonth } from "date-fns";
import moment from "moment-timezone";
import sharp from "sharp";

export const updateAttendance = catchAsync(async (req, res, next) => {
  const { punchInTime, punchOutTime, email, geoLocation, city } = req.body;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          profilePicture: true,
        },
      });

      const currentDateTime = new Date();
      currentDateTime.setHours(0, 0, 0, 0);
      const todayDate = moment().tz("Asia/Kolkata").startOf("day");
      const indianTimeISOString = todayDate.toISOString();

      if (!isEmpty(punchInTime)) {
        let idleTimeOut = 0;
        if (user.idleTimeOut !== null) {
          const numbers = user.idleTimeOut.match(/\d+/g);
          if (numbers !== null) {
            idleTimeOut = numbers[0];
          }
        } else {
          return next(new AppError("configuration not done"));
        }

        const createdAttendance = await prisma.attendance.findFirst({
          where: {
            userId: user.userId,
            date: indianTimeISOString,
          },
        });

        if (isEmpty(createdAttendance)) {
          const attendance = await prisma.attendance.create({
            data: {
              userId: user.userId,
              username: user.username,
              punchInTime: punchInTime,
              date: indianTimeISOString,
              geoLocation: geoLocation,
              city: city,
            },
          });

          await prisma.user.update({
            where: {
              userId: user.userId,
            },
            data: {
              userStatus: "active",
            },
          });

          const result = {
            status: "Success",
            error: "",
            message: "Record Updated successfully",
            stack: "",
            idleTimeout: idleTimeOut,
          };

          return res.status(200).json(result);
        } else {
          if (!isEmpty())
            await prisma.attendance.update({
              where: {
                id: createdAttendance.id,
              },
              data: {
                punchOutTime: null,
              },
            });

          const result = {
            status: "Success",
            error: "",
            message: "Record Updated successfully",
            stack: "",
            idleTimeout: idleTimeOut,
          };
          return res.status(200).json(result);
        }
      } else {
        const attendance = await prisma.attendance.update({
          where: {
            userId_date: {
              userId: user.userId,
              date: indianTimeISOString,
            },
          },
          data: {
            punchOutTime: punchOutTime,
          },
        });

        await prisma.user.update({
          where: {
            userId: user.userId,
          },
          data: {
            userStatus: "offline",
          },
        });

        const taskStatusList = ["Closed", "To Do"];
        const subTaskStatusList = ["Completed", "To Do"];

        const pendingTasks = await prisma.task.findMany({
          where: {
            assignedUserId: user.userId,
            status: {
              notIn: taskStatusList,
            },
          },
        });

        const pendingSubTasks = await prisma.subtask.findMany({
          where: {
            assignedUserId: user.userId,
            status: {
              notIn: subTaskStatusList,
            },
          },
        });

        let pendingTaskList = [];
        let pendingSubTaskList = [];

        pendingTasks.map((task) => {
          if (
            task.status === "Work In Progress" ||
            task.status === "Under Review" ||
            task.status === "Completed"
          ) {
            const pendingTaskEntry = {
              taskname: task.title,
              taskCode: task.code,
              taskDescription: task.description,
              taskId: task.id,
            };
            pendingTaskList.push(pendingTaskEntry);
          }
        });

        pendingSubTasks.map((subTask) => {
          if (
            subTask.status === "Work In Progress" ||
            subTask.status === "Under Review"
          ) {
            const pendingSubTaskEntry = {
              subTaskname: subTask.title,
              subTaskCode: subTask.code,
              subTaskDescription: subTask.description,
              subTaskId: subTask.id,
            };
            pendingSubTaskList.push(pendingSubTaskEntry);
          }
        });

        if (!isEmpty(pendingTaskList) || !isEmpty(pendingSubTaskList)) {
          const result = {
            status: "Success",
            error: null,
            message: "Tasks",
            stack: {
              tasks: pendingTaskList,
              subTasks: pendingSubTaskList,
            },
          };

          res.status(200).json(result);
        } else {
          const result = {
            status: "Success",
            error: null,
            message: "Record Updated successfully",
            stack: {
              tasks: null,
              subTasks: null,
            },
          };

          res.status(200).json(result);
        }
      }
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during updating attendance records", 500));
  }
});

export const getAttendanceData = catchAsync(async (req, res, next) => {
  const { email, title } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          roles: true,
        },
      });

      if (user.roles.some((role) => role.code === "ADMIN")) {
        const customer = await prisma.customer.findFirst();

        const currentDateTime = new Date();
        currentDateTime.setHours(0, 0, 0, 0);
        const todayDate = moment().tz("Asia/Kolkata").startOf("day");
        const indianTimeISOString = todayDate.toISOString();

        const attendanceRecords = await prisma.attendance.findMany({
          where: {
            date: indianTimeISOString,
          },
        });

        const timeToMinutes = (time) => {
          const [hours, minutes] = time.split(":").map(Number);
          return hours * 60 + minutes;
        };

        const isDateTimeInRange = (timeRange, dateTime) => {
          // Parse the time range string into start and end times (e.g., "9:30-10:30" -> [9:30, 10:30])
          const [startTime, endTime] = timeRange.split("-");

          // Convert the start and end times into minutes for easy comparison
          const startMinutes = timeToMinutes(startTime);
          const endMinutes = timeToMinutes(endTime);

          // Convert the Prisma DateTime string to a JavaScript Date object
          const date = new Date(dateTime);

          // Get the minutes from the Prisma DateTime
          const currentMinutes = date.getHours() * 60 + date.getMinutes();

          // Check if the current time is before the start time or after the end time
          if (currentMinutes < startMinutes) {
            return "Before Start Time"; // Before Start Time
          } else if (currentMinutes > endMinutes) {
            return "After End Time"; // 'After End Time'
          } else {
            return "Within Time Range"; //'Within Time Range'
          }
        };

        if (title === "On Time Arrivals") {
          let record = 0;
          const workStartTime = 9;
          const workEndTime = 18;

          const usersList = await prisma.user.findMany();

          attendanceRecords.map((attendance) => {
            usersList.map((user) => {
              if (user.userId === attendance.userId) {
                if (
                  user.workingHours !== null &&
                  user.workingHours !== undefined &&
                  !isEmpty(user.workingHours)
                ) {
                  const prismaDateTime = attendance.punchInTime;
                  const timeRange = user.workingHours;

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) ===
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                } else {
                  const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                  const timeRange = "9:00-18:00";

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) ===
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                }
              }
            });
          });

          const result = {
            usersCount: record,
            totalUsersCount: customer.Allowed_User_Count,
          };

          return res.status(200).json(result);
        } else if (title === "Late Arrivals") {
          let record = 0;
          const workStartTime = 9;
          const workEndTime = 18;

          const usersList = await prisma.user.findMany();

          attendanceRecords.map((attendance) => {
            usersList.map((user) => {
              if (user.userId === attendance.userId) {
                if (
                  user.workingHours !== null &&
                  user.workingHours !== undefined &&
                  !isEmpty(user.workingHours)
                ) {
                  const prismaDateTime = attendance.punchInTime;
                  const timeRange = user.workingHours;

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) !==
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                } else {
                  const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                  const timeRange = "9:00-18:00";

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) !==
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                }
              }
            });
          });

          const result = {
            usersCount: record,
            totalUsersCount: customer.Allowed_User_Count,
          };

          return res.status(200).json(result);
        }
      }

      const result = {
        usersCount: 0,
        totalUsersCount: 0,
      };

      return res.status(200).json(result);
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Error during calculating attendance data", 500));
  }
});

export const getAttendanceLCData = catchAsync(async (req, res, next) => {
  const { email, title } = req.query;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      include: {
        roles: true,
      },
    });
    const getPreviousWeekdays = () => {
      const weekdays = []; // To store the weekdays
      // const currentDate = new Date();
      // currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 for comparison
      const todayDate = moment().tz("Asia/Kolkata").startOf("day");
      const currentDate = todayDate.toISOString();

      // Start from the current date and look backward
      let dateIterator = new Date(currentDate);

      // Loop until we get 5 weekdays
      while (weekdays.length < 5) {
        // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const dayOfWeek = dateIterator.getDay();

        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // If it's a weekday, push it to the weekdays array in ISOString format
          weekdays.push(dateIterator.toISOString());
        }

        // Move to the previous day
        dateIterator.setDate(dateIterator.getDate() - 1);
      }

      // Reverse to make the order ascending from Monday to Friday
      return weekdays.reverse();
    };

    // Get the previous 5 weekdays in ISOString format
    const previousWeekdays = getPreviousWeekdays();

    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const isDateTimeInRange = (timeRange, dateTime) => {
      // Parse the time range string into start and end times (e.g., "9:30-10:30" -> [9:30, 10:30])
      const [startTime, endTime] = timeRange.split("-");

      // Convert the start and end times into minutes for easy comparison
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);

      // Convert the Prisma DateTime string to a JavaScript Date object
      const date = new Date(dateTime);

      // Get the minutes from the Prisma DateTime
      const currentMinutes = date.getHours() * 60 + date.getMinutes();

      // Check if the current time is before the start time or after the end time
      if (currentMinutes < startMinutes) {
        return "Before Start Time"; // Before Start Time
      } else if (currentMinutes > endMinutes) {
        return "After End Time"; // 'After End Time'
      } else {
        return "Within Time Range"; //'Within Time Range'
      }
    };

    if (user.roles.some((role) => role.code === "ADMIN")) {
      let finalRresult = [];

      for (const previousWeekday of previousWeekdays) {
        const attendanceRecords = await prisma.attendance.findMany({
          where: {
            date: previousWeekday,
          },
        });

        if (title === "On Time Arrivals") {
          let record = 0;
          const workStartTime = 9;
          const workEndTime = 18;

          const usersList = await prisma.user.findMany();

          attendanceRecords.map((attendance) => {
            usersList.map((user) => {
              if (user.userId === attendance.userId) {
                if (
                  user.workingHours !== null &&
                  user.workingHours !== undefined &&
                  !isEmpty(user.workingHours)
                ) {
                  const prismaDateTime = attendance.punchInTime;
                  const timeRange = user.workingHours;

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) ===
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                } else {
                  const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                  const timeRange = "9:00-18:00";

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) ===
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                }
              }
            });
          });

          const date = new Date(previousWeekday); // Parse the ISO string into a Date object

          const day = String(date.getDate()).padStart(2, "0"); // Get day and ensure two digits
          const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month and ensure two digits (months are 0-indexed)
          const year = date.getFullYear();

          const result = {
            date: `${day}/${month}/${year}`,
            count: record,
          };
          finalRresult.push(result);
        } else if (title === "Late Arrivals") {
          let record = 0;
          const workStartTime = 9;
          const workEndTime = 18;

          const usersList = await prisma.user.findMany();

          attendanceRecords.map((attendance) => {
            usersList.map((user) => {
              if (user.userId === attendance.userId) {
                if (
                  user.workingHours !== null &&
                  user.workingHours !== undefined &&
                  !isEmpty(user.workingHours)
                ) {
                  const prismaDateTime = attendance.punchInTime;
                  const timeRange = user.workingHours;

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) !==
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                } else {
                  const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                  const timeRange = "9:00-18:00";

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) !==
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                }
              }
            });
          });
          const date = new Date(previousWeekday); // Parse the ISO string into a Date object

          const day = String(date.getDate()).padStart(2, "0"); // Get day and ensure two digits
          const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month and ensure two digits (months are 0-indexed)
          const year = date.getFullYear();

          const result = {
            date: `${day}/${month}/${year}`,
            count: record,
          };

          finalRresult.push(result);
        }
      }
      return res.status(200).json(finalRresult);
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("Error during calculating attendance data", 500));
  }
});

export const getUserAttendanceData = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      const startOfCurrentMonth = startOfMonth(new Date());
      const endOfCurrentMonth = endOfMonth(new Date());

      const currentDateTime = new Date();
      currentDateTime.setHours(0, 0, 0, 0);
      const todayDate = moment().tz("Asia/Kolkata").startOf("day");
      const indianTimeISOString = todayDate.toISOString();

      let onTimeCount = 0;
      let lateCount = 0;

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          date: {
            gte: startOfCurrentMonth, // greater than or equal to the start of the current month
            lte: endOfCurrentMonth,
          },
        },
      });

      const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const isDateTimeInRange = (timeRange, dateTime) => {
        // Parse the time range string into start and end times (e.g., "9:30-10:30" -> [9:30, 10:30])
        const [startTime, endTime] = timeRange.split("-");

        // Convert the start and end times into minutes for easy comparison
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);

        // Convert the Prisma DateTime string to a JavaScript Date object
        const date = new Date(dateTime);

        // Get the minutes from the Prisma DateTime
        const currentMinutes = date.getHours() * 60 + date.getMinutes();

        // Check if the current time is before the start time or after the end time
        if (currentMinutes < startMinutes) {
          return "Before Start Time"; // Before Start Time
        } else if (currentMinutes > endMinutes) {
          return "After End Time"; // 'After End Time'
        } else {
          return "Within Time Range"; //'Within Time Range'
        }
      };

      if (true) {
        let record = 0;
        const workStartTime = 9;
        const workEndTime = 18;

        attendanceRecords.map((attendance) => {
          if (user.userId === attendance.userId) {
            if (
              user.workingHours !== null &&
              user.workingHours !== undefined &&
              !isEmpty(user.workingHours)
            ) {
              const prismaDateTime = attendance.punchInTime;
              const timeRange = user.workingHours;

              if (
                isDateTimeInRange(timeRange, prismaDateTime) ===
                "Before Start Time"
              ) {
                record = record + 1;
              }
            } else {
              const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
              const timeRange = "9:00-18:00";

              if (
                isDateTimeInRange(timeRange, prismaDateTime) ===
                "Before Start Time"
              ) {
                record = record + 1;
              }
            }
          }
        });

        onTimeCount = record;
      }
      if (true) {
        let record = 0;
        const workStartTime = 9;
        const workEndTime = 18;

        attendanceRecords.map((attendance) => {
          if (user.userId === attendance.userId) {
            if (
              user.workingHours !== null &&
              user.workingHours !== undefined &&
              !isEmpty(user.workingHours)
            ) {
              const prismaDateTime = attendance.punchInTime;
              const timeRange = user.workingHours;

              if (
                isDateTimeInRange(timeRange, prismaDateTime) !==
                "Before Start Time"
              ) {
                record = record + 1;
              }
            } else {
              const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
              const timeRange = "9:00-18:00";

              if (
                isDateTimeInRange(timeRange, prismaDateTime) !==
                "Before Start Time"
              ) {
                record = record + 1;
              }
            }
          }
        });

        lateCount = record;
      }
      const result = {
        onTimeCount: onTimeCount,
        lateCount: lateCount,
      };

      return res.status(200).json(result);
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error during getting user attendance PC data", 500)
    );
  }
});

export const formatDate = (date) => {
  // Get day, month, and year from the Date object
  const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if day < 10
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based, so we add 1
  const year = date.getFullYear();

  // Return the formatted date as DD/MM/YYYY
  return `${day}/${month}/${year}`;
};

export const formatTime = (date) => {
  // Get hours, minutes, and seconds from the Date object
  if (date === null) {
    return "00:00:00";
  }
  const hours = String(date.getHours()).padStart(2, "0"); // Ensure two-digit format for hours
  const minutes = String(date.getMinutes()).padStart(2, "0"); // Ensure two-digit format for minutes
  const seconds = String(date.getSeconds()).padStart(2, "0"); // Ensure two-digit format for seconds

  // Return the formatted time as HH:mm:ss
  return `${hours}:${minutes}:${seconds}`;
};

const timeToSeconds = (time) => {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const secondsToTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(remainingSeconds).padStart(2, "0")}`;
};

const getTimeDifference = (startTime, endTime) => {
  const startTimeInSeconds = timeToSeconds(startTime);
  const endTimeInSeconds = timeToSeconds(endTime);

  // Calculate the difference
  const durationInSeconds = endTimeInSeconds - startTimeInSeconds;

  // If the result is negative, it means the end time is earlier than the start time (next day scenario)
  if (durationInSeconds < 0) {
    return "End time cannot be earlier than start time.";
  }

  // Convert the duration back to HH:mm:ss format
  return secondsToTime(durationInSeconds);
};

function timeDifference(time1, time2) {
  // Helper function to parse time string into seconds
  if (time1 === "00:00:00") {
    return "00:00:00";
  }
  const parseTime = (time) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Convert times to seconds
  const time1InSeconds = parseTime(time1);
  const time2InSeconds = parseTime(time2);

  // Calculate the difference in seconds
  let diffInSeconds = time1InSeconds - time2InSeconds;

  // Handle negative difference (if time2 > time1, add 24 hours)
  if (diffInSeconds < 0) {
    diffInSeconds += 24 * 3600; // Add 24 hours in seconds
  }

  // Convert the difference back to hours, minutes, seconds
  const hours = Math.floor(diffInSeconds / 3600);
  diffInSeconds %= 3600;
  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;

  // Format the result as hh:mm:ss
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function convertToSeconds(time) {
  if (time) {
    const [minutes, seconds] = time.split(":").map(Number); // Split and convert to integers
    return minutes * 60 + seconds; // Return total seconds
  }
  return "0";
}

// Function to convert total seconds into hh:mm:ss format
function convertToHHMMSS(seconds) {
  const hours = Math.floor(seconds / 3600); // Calculate hours
  const minutes = Math.floor((seconds % 3600) / 60); // Calculate minutes
  const remainingSeconds = seconds % 60; // Calculate remaining seconds

  // Format as hh:mm:ss
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// Function to sum times in mm:ss format
function addTimes(timeList) {
  let totalSeconds = 0;

  // Convert each time to seconds and accumulate the total
  timeList.forEach((time) => {
    totalSeconds += convertToSeconds(time);
  });

  // Convert total seconds back to hh:mm:ss
  return convertToHHMMSS(totalSeconds);
}

export async function compressBase64(base64Str, quality = 40) {
  // Extract MIME and base64 content
  if (isEmpty(base64Str)) {
    return "";
  }
  const matches = base64Str.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid base64 string");

  const mimeType = matches[1];
  const base64Data = matches[2];

  // Convert base64 to buffer
  const imgBuffer = Buffer.from(base64Data, "base64");

  // Compress using sharp
  const compressedBuffer = await sharp(imgBuffer)
    .jpeg({ quality }) // You can also use .png({ quality }) if needed
    .toBuffer();

  // Convert back to base64 string
  return `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;
}

export const getUserAttendanceTableData = catchAsync(async (req, res, next) => {
  const { email, adminFlag, date } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      if (adminFlag === "true") {
        let idList = [];

        const userIdList = await prisma.user.findMany({
          include: {
            profilePicture: {
              select: {
                base64: true,
              },
            },
          },
        });

        userIdList.map((user) => {
          idList.push(user.userId);
        });
        //const date = new Date(date); // Or you can pass any date string here
        const todayDate = moment(date).tz("Asia/Kolkata").startOf("day");
        const isoDate = todayDate.toISOString();

        const attendanceRecords = await prisma.attendance.findMany({
          where: {
            date: isoDate,
            userId: {
              in: idList,
            },
          },
          include: {
            breaks: true,
          },
        });

        const finalResult = await Promise.all(
          attendanceRecords.map(async (attendance, index) => {
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

            const userObj = userIdList.find(
              (u) => u.userId === attendance.userId
            );

            let compressedBase64 = "";
            if (userObj?.profilePicture?.base64) {
              compressedBase64 = await compressBase64(
                userObj.profilePicture.base64,
                20
              );
            }

            const breakTime = addTimes(breakTimeList);

            return {
              id: index + 1,
              userId: attendance.userId,
              date: formatDate(attendance.date),
              punchInTime: inTime,
              punchOutTime: outTime,
              status: userObj?.userStatus ?? "Unknown",
              image: compressedBase64,
              username: attendance.username,
              duration: duration,
              totalIdleTime: breakTime,
              activeTime: timeDifference(duration, breakTime),
              place: attendance.city,
            };
          })
        );

        return res.status(200).json(finalResult);
      } else {
        const startOfCurrentMonth = startOfMonth(new Date());
        const endOfCurrentMonth = endOfMonth(new Date());

        const attendanceRecords = await prisma.attendance.findMany({
          where: {
            date: {
              gte: startOfCurrentMonth,
              lte: endOfCurrentMonth,
            },
            userId: user.userId,
          },
        });

        let finalResult = [];
        let id = 1;

        attendanceRecords.map((attendance) => {
          let inTime = "NA";
          let outTime = "NA";
          if (attendance.punchInTime) {
            inTime = formatTime(attendance.punchInTime);
          }

          if (attendance.punchOutTime) {
            outTime = formatTime(attendance.punchOutTime);
          }
          const result = {
            id: id,
            userId: user.userId,
            date: formatDate(attendance.date),
            punchInTime: inTime,
            punchOutTime: outTime,
            duration: getTimeDifference(inTime, outTime),
            place: attendance.city,
          };
          id = id + 1;
          finalResult.push(result);
        });

        return res.status(200).json(finalResult);
      }
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error during getting user attendance PC data", 500)
    );
  }
});

export const getAdminRole = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          roles: true,
        },
      });

      if (user.roles.some((role) => role.code === "ADMIN")) {
        const result = {
          admin: true,
        };
        return res.status(200).json(result);
      } else {
        const result = {
          admin: false,
        };
        return res.status(200).json(result);
      }
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Error during getting user Admin role", 500));
  }
});

export const getBreakData = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          teams: true,
        },
      });

      let teamsList = [];

      user.teams.map((team) => {
        teamsList.push(team.name);
      });

      const breakTypeList = await prisma.team.findMany({
        where: {
          name: {
            in: teamsList,
          },
        },
        include: {
          breakTypes: {
            select: {
              id: true,
              breakName: true,
              breakCode: true,
              breakDescription: true,
              breakTimeInMinutes: true,
            },
          },
        },
      });

      let resultList = [];

      const customObj = {
        breakName: "Custom Break",
        breakCode: "CUSTOM_BREAK",
        breakDuration: "00",
      };

      resultList.push(customObj);

      breakTypeList.map((breakType) => {
        breakType.breakTypes.map((breakObj) => {
          const result = {
            breakName: breakObj.breakName,
            breakCode: breakObj.breakCode,
            breakDuration: breakObj.breakTimeInMinutes,
          };
          resultList.push(result);
        });
      });

      const uniqueObjects = resultList.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.breakCode === value.breakCode)
      );

      const breaks = {
        breaks: uniqueObjects,
      };

      return res.status(200).json(breaks);
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error during getting user attendance PC data", 500)
    );
  }
});

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const isDateTimeInRange = (timeRange, dateTime) => {
  // Parse the time range string into start and end times (e.g., "9:30-10:30" -> [9:30, 10:30])
  const [startTime, endTime] = timeRange.split("-");

  // Convert the start and end times into minutes for easy comparison
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Convert the Prisma DateTime string to a JavaScript Date object
  const date = new Date(dateTime);

  // Get the minutes from the Prisma DateTime
  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  // Check if the current time is before the start time or after the end time
  if (currentMinutes < startMinutes) {
    return "Before Start Time"; // Before Start Time
  } else {
    return "After Start Time"; //'Within Time Range'
  }
};

function getPercentageChange(from, to) {
  if (from === 0) {
    if (to === 0) return "0.00%";
    return "100%"; // or return "100.00%" based on your preference
  }

  const change = ((to - from) / Math.abs(from)) * 100;
  const rounded = Number(change.toFixed(2));

  if (isNaN(rounded)) return "0.00%";

  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

function formatMinutesToHHMMSS(totalMinutes) {
  if (totalMinutes === 0) {
    return "00:00:00";
  }
  const totalSeconds = totalMinutes * 60;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = (totalSeconds % 60).toFixed(0);

  const pad = (num) => String(num).padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export const getAttendanceCardsResponse = catchAsync(async (req, res, next) => {
  const { email, from, to, teamId } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          roles: true,
        },
      });

      if (user.roles.some((role) => role.code === "ADMIN")) {
        if (isEmpty(from) || isEmpty(to)) {
          const attendanceRecordsinRange = await prisma.attendance.findMany({
            include: {
              breaks: true,
            },
          });
          let record = 0;
          let lateArrival = 0;
          let diffInMilliseconds = 0;
          let breakTime = 0;
          let usersList;
          if (teamId === "0") {
            usersList = await prisma.user.findMany();
          } else {
            const team = await prisma.team.findFirst({
              where: {
                id: Number(teamId),
              },
              include: {
                members: true,
              },
            });

            usersList = team.members;
          }

          attendanceRecordsinRange.map((attendance) => {
            usersList.map((user) => {
              if (user.userId === attendance.userId) {
                if (
                  user.workingHours !== null &&
                  user.workingHours !== undefined &&
                  !isEmpty(user.workingHours)
                ) {
                  const prismaDateTime = attendance.punchInTime;
                  const timeRange = user.workingHours;

                  const status = isDateTimeInRange(timeRange, prismaDateTime);

                  if (status === "Before Start Time") {
                    record = record + 1;
                  }
                  if (status === "After Start Time") {
                    lateArrival = lateArrival + 1;
                  }

                  if (
                    attendance.punchInTime !== null &&
                    attendance.punchOutTime !== null
                  ) {
                    diffInMilliseconds =
                      diffInMilliseconds +
                      (attendance.punchOutTime?.getTime() -
                        attendance.punchInTime?.getTime());
                  }

                  const totalBreakTimeInMinutes = attendance.breaks.reduce(
                    (sum, b) => {
                      const [minStr, secStr] = (
                        b.breakTimeInMinutes || "0:00"
                      ).split(":");
                      const minutes = parseInt(minStr, 10);
                      const seconds = parseInt(secStr, 10);

                      const totalMinutes =
                        (isNaN(minutes) ? 0 : minutes) +
                        (isNaN(seconds) ? 0 : seconds / 60);

                      return sum + totalMinutes;
                    },
                    0
                  );

                  breakTime = breakTime + totalBreakTimeInMinutes;
                } else {
                  const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                  const timeRange = "9:00-18:00";
                  const status = isDateTimeInRange(timeRange, prismaDateTime);

                  if (status === "Before Start Time") {
                    record = record + 1;
                  }
                  if (status === "After Start Time") {
                    lateArrival = lateArrival + 1;
                  }

                  if (
                    attendance.punchInTime !== null &&
                    attendance.punchOutTime !== null
                  ) {
                    diffInMilliseconds =
                      diffInMilliseconds +
                      (attendance.punchOutTime?.getTime() -
                        attendance.punchInTime?.getTime());
                  }

                  const totalBreakTimeInMinutes = attendance.breaks.reduce(
                    (sum, b) => {
                      const [minStr, secStr] = (
                        b.breakTimeInMinutes || "0:00"
                      ).split(":");
                      const minutes = parseInt(minStr, 10);
                      const seconds = parseInt(secStr, 10);

                      const totalMinutes =
                        (isNaN(minutes) ? 0 : minutes) +
                        (isNaN(seconds) ? 0 : seconds / 60);

                      return sum + totalMinutes;
                    },
                    0
                  );

                  breakTime = breakTime + totalBreakTimeInMinutes;
                }
              }
            });
          });
          const avgDiffInMinutess = (
            diffInMilliseconds /
            attendanceRecordsinRange.length /
            (1000 * 60)
          ).toFixed(2);

          const result = {
            onTimeArrival: record,
            onTimePercentage: "0",
            lateArrival: lateArrival,
            lateArrivalPercentage: "0",
            avgActiveTime: formatMinutesToHHMMSS(avgDiffInMinutess),
            avgActiveTimePercentage: "0",
            breakTime: formatMinutesToHHMMSS(breakTime),
            breakTimePercentage: "0",
          };

          return res.status(200).json(result);
        }

        const formattedDate1 = moment
          .tz(from, "Asia/Kolkata")
          .startOf("day")
          .toISOString();
        const formattedDate2 = moment
          .tz(to, "Asia/Kolkata")
          .startOf("day")
          .toISOString();

        const diffInDays = moment(to).diff(moment(from), "days") + 1; // +1 to include both dates

        // Calculate previous range
        const prevStart = moment(from).subtract(diffInDays, "days");
        const prevEnd = moment(from).subtract(1, "day");

        const formattedDate3 = moment
          .tz(prevStart, "Asia/Kolkata")
          .startOf("day")
          .toISOString();
        const formattedDate4 = moment
          .tz(prevEnd, "Asia/Kolkata")
          .startOf("day")
          .toISOString();

        const attendanceRecordsinRange = await prisma.attendance.findMany({
          where: {
            date: {
              gte: formattedDate1,
              lte: formattedDate2,
            },
          },
          include: {
            breaks: true,
          },
        });

        const attendanceRecordsPrev = await prisma.attendance.findMany({
          where: {
            date: {
              gte: formattedDate3,
              lte: formattedDate4,
            },
          },
          include: {
            breaks: true,
          },
        });

        let record = 0;
        let previousRecord = 0;
        let lateArrival = 0;
        let previousLateArrivals = 0;
        let diffInMilliseconds = 0;
        let previousDiffinMilliseconds = 0;
        let breakTime = 0;
        let previousBreakTime = 0;
        let usersList;
        if (teamId === "0") {
          usersList = await prisma.user.findMany();
        } else {
          const team = await prisma.team.findFirst({
            where: {
              id: Number(teamId),
            },
            include: {
              members: true,
            },
          });

          usersList = team.members;
        }

        attendanceRecordsinRange.map((attendance) => {
          usersList.map((user) => {
            if (user.userId === attendance.userId) {
              if (
                user.workingHours !== null &&
                user.workingHours !== undefined &&
                !isEmpty(user.workingHours)
              ) {
                const prismaDateTime = attendance.punchInTime;
                const timeRange = user.workingHours;

                const status = isDateTimeInRange(timeRange, prismaDateTime);

                if (status === "Before Start Time") {
                  record = record + 1;
                }
                if (status === "After Start Time") {
                  lateArrival = lateArrival + 1;
                }

                if (
                  attendance.punchInTime !== null &&
                  attendance.punchOutTime !== null
                ) {
                  diffInMilliseconds =
                    diffInMilliseconds +
                    (attendance.punchOutTime?.getTime() -
                      attendance.punchInTime?.getTime());
                }

                const totalBreakTimeInMinutes = attendance.breaks.reduce(
                  (sum, b) => {
                    const [minStr, secStr] = (
                      b.breakTimeInMinutes || "0:00"
                    ).split(":");
                    const minutes = parseInt(minStr, 10);
                    const seconds = parseInt(secStr, 10);

                    const totalMinutes =
                      (isNaN(minutes) ? 0 : minutes) +
                      (isNaN(seconds) ? 0 : seconds / 60);

                    return sum + totalMinutes;
                  },
                  0
                );

                breakTime = breakTime + totalBreakTimeInMinutes;
              } else {
                const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                const timeRange = "9:00-18:00";
                const status = isDateTimeInRange(timeRange, prismaDateTime);

                if (status === "Before Start Time") {
                  record = record + 1;
                }
                if (status === "After Start Time") {
                  lateArrival = lateArrival + 1;
                }

                if (
                  attendance.punchInTime !== null &&
                  attendance.punchOutTime !== null
                ) {
                  diffInMilliseconds =
                    diffInMilliseconds +
                    (attendance.punchOutTime?.getTime() -
                      attendance.punchInTime?.getTime());
                }

                const totalBreakTimeInMinutes = attendance.breaks.reduce(
                  (sum, b) => {
                    const [minStr, secStr] = (
                      b.breakTimeInMinutes || "0:00"
                    ).split(":");
                    const minutes = parseInt(minStr, 10);
                    const seconds = parseInt(secStr, 10);

                    const totalMinutes =
                      (isNaN(minutes) ? 0 : minutes) +
                      (isNaN(seconds) ? 0 : seconds / 60);

                    return sum + totalMinutes;
                  },
                  0
                );

                breakTime = breakTime + totalBreakTimeInMinutes;
              }
            }
          });
        });

        attendanceRecordsPrev.map((attendance) => {
          usersList.map((user) => {
            if (user.userId === attendance.userId) {
              if (
                user.workingHours !== null &&
                user.workingHours !== undefined &&
                !isEmpty(user.workingHours)
              ) {
                const prismaDateTime = attendance.punchInTime;
                const timeRange = user.workingHours;

                const status = isDateTimeInRange(timeRange, prismaDateTime);
                if (status === "Before Start Time") {
                  previousRecord = previousRecord + 1;
                }
                if (status === "After Start Time") {
                  previousLateArrivals = previousLateArrivals + 1;
                }

                const totalBreakTimeInMinutes = attendance.breaks.reduce(
                  (sum, b) => {
                    const [minStr, secStr] = (
                      b.breakTimeInMinutes || "0:00"
                    ).split(":");
                    const minutes = parseInt(minStr, 10);
                    const seconds = parseInt(secStr, 10);

                    const totalMinutes =
                      (isNaN(minutes) ? 0 : minutes) +
                      (isNaN(seconds) ? 0 : seconds / 60);

                    return sum + totalMinutes;
                  },
                  0
                );

                previousBreakTime = previousBreakTime + totalBreakTimeInMinutes;

                if (
                  attendance.punchInTime !== null &&
                  attendance.punchOutTime !== null
                ) {
                  previousDiffinMilliseconds =
                    previousDiffinMilliseconds +
                    (attendance.punchOutTime?.getTime() -
                      attendance.punchInTime?.getTime());
                }
              } else {
                const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                const timeRange = "9:00-18:00";

                const status = isDateTimeInRange(timeRange, prismaDateTime);

                if (status === "Before Start Time") {
                  previousRecord = previousRecord + 1;
                }

                if (status === "After Start Time") {
                  previousLateArrivals = previousLateArrivals + 1;
                }

                const totalBreakTimeInMinutes = attendance.breaks.reduce(
                  (sum, b) => {
                    const [minStr, secStr] = (
                      b.breakTimeInMinutes || "0:00"
                    ).split(":");
                    const minutes = parseInt(minStr, 10);
                    const seconds = parseInt(secStr, 10);

                    const totalMinutes =
                      (isNaN(minutes) ? 0 : minutes) +
                      (isNaN(seconds) ? 0 : seconds / 60);

                    return sum + totalMinutes;
                  },
                  0
                );

                previousBreakTime = previousBreakTime + totalBreakTimeInMinutes;

                if (
                  attendance.punchInTime !== null &&
                  attendance.punchOutTime !== null
                ) {
                  previousDiffinMilliseconds =
                    previousDiffinMilliseconds +
                    (attendance.punchOutTime?.getTime() -
                      attendance.punchInTime?.getTime());
                }
              }
            }
          });
        });

        const avgDiffInMinutess = (
          diffInMilliseconds /
          attendanceRecordsinRange.length /
          (1000 * 60)
        ).toFixed(2);

        const avgPrevDiffInMinutes = (
          previousDiffinMilliseconds /
          attendanceRecordsPrev.length /
          (1000 * 60)
        ).toFixed(2);

        const result = {
          onTimeArrival: record,
          onTimePercentage: getPercentageChange(previousRecord, record),
          lateArrival: lateArrival,
          lateArrivalPercentage: getPercentageChange(
            previousLateArrivals,
            lateArrival
          ),
          avgActiveTime: formatMinutesToHHMMSS(avgDiffInMinutess),
          avgActiveTimePercentage: getPercentageChange(
            avgPrevDiffInMinutes,
            avgDiffInMinutess
          ),
          breakTime: formatMinutesToHHMMSS(breakTime),
          breakTimePercentage: getPercentageChange(
            previousBreakTime,
            breakTime
          ),
        };

        return res.status(200).json(result);
      }
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during calculating attendance data", 500));
  }
});

export const getAttendanceChartResponse = catchAsync(async (req, res, next) => {
  const { email, from, to, teamId } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          roles: true,
        },
      });

      if (user.roles.some((role) => role.code === "ADMIN")) {
        if (isEmpty(from) || isEmpty(to)) {
          const attendanceRecordsinRange = await prisma.attendance.findMany();
          let onTimeArrivalCount = 0;
          let lateArrivalCount = 0;
          let resultList = [];
          let usersList;
          if (teamId === "0") {
            usersList = await prisma.user.findMany();
          } else {
            const team = await prisma.team.findFirst({
              where: {
                id: Number(teamId),
              },
              include: {
                members: true,
              },
            });

            usersList = team.members;
          }

          const dateList = [
            ...new Set(
              attendanceRecordsinRange.map(
                (item) => new Date(item.date).toISOString().split("T")[0]
              )
            ),
          ];

          dateList.map((date) => {
            const dateConst = date;
            attendanceRecordsinRange.map((attendance) => {
              if (date === attendance.date.toISOString().split("T")[0]) {
                usersList.map((user) => {
                  if (user.userId === attendance.userId) {
                    if (
                      user.workingHours !== null &&
                      user.workingHours !== undefined &&
                      !isEmpty(user.workingHours)
                    ) {
                      const prismaDateTime = attendance.punchInTime;
                      const timeRange = user.workingHours;

                      const status = isDateTimeInRange(
                        timeRange,
                        prismaDateTime
                      );

                      if (status === "Before Start Time") {
                        onTimeArrivalCount = onTimeArrivalCount + 1;
                      }
                      if (status === "After Start Time") {
                        lateArrivalCount = lateArrivalCount + 1;
                      }
                    } else {
                      const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                      const timeRange = "9:00-18:00";
                      const status = isDateTimeInRange(
                        timeRange,
                        prismaDateTime
                      );

                      if (status === "Before Start Time") {
                        onTimeArrivalCount = onTimeArrivalCount + 1;
                      }
                      if (status === "After Start Time") {
                        lateArrivalCount = lateArrivalCount + 1;
                      }
                    }
                  }
                });
              }
            });
            const obj = {
              date: dateConst,
              desktop: onTimeArrivalCount,
              mobile: lateArrivalCount,
            };

            resultList.push(obj);
            onTimeArrivalCount = 0;
            lateArrivalCount = 0;
          });
          return res.status(200).json(resultList);
        }

        const formattedDate1 = moment
          .tz(from, "Asia/Kolkata")
          .startOf("day")
          .toISOString();
        const formattedDate2 = moment
          .tz(to, "Asia/Kolkata")
          .startOf("day")
          .toISOString();

        const attendanceRecordsinRange = await prisma.attendance.findMany({
          where: {
            date: {
              gte: formattedDate1,
              lte: formattedDate2,
            },
          },
        });

        const dateList = [
          ...new Set(
            attendanceRecordsinRange.map(
              (item) => new Date(item.date).toISOString().split("T")[0]
            )
          ),
        ];

        let onTimeArrivalCount = 0;
        let lateArrivalCount = 0;
        let resultList = [];

        let usersList;
        if (teamId === "0") {
          usersList = await prisma.user.findMany();
        } else {
          const team = await prisma.team.findFirst({
            where: {
              id: Number(teamId),
            },
            include: {
              members: true,
            },
          });

          usersList = team.members;
        }

        dateList.map((date) => {
          const dateConst = date;
          attendanceRecordsinRange.map((attendance) => {
            if (date === attendance.date.toISOString().split("T")[0]) {
              usersList.map((user) => {
                if (user.userId === attendance.userId) {
                  if (
                    user.workingHours !== null &&
                    user.workingHours !== undefined &&
                    !isEmpty(user.workingHours)
                  ) {
                    const prismaDateTime = attendance.punchInTime;
                    const timeRange = user.workingHours;

                    const status = isDateTimeInRange(timeRange, prismaDateTime);

                    if (status === "Before Start Time") {
                      onTimeArrivalCount = onTimeArrivalCount + 1;
                    }
                    if (status === "After Start Time") {
                      lateArrivalCount = lateArrivalCount + 1;
                    }
                  } else {
                    const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                    const timeRange = "9:00-18:00";
                    const status = isDateTimeInRange(timeRange, prismaDateTime);

                    if (status === "Before Start Time") {
                      onTimeArrivalCount = onTimeArrivalCount + 1;
                    }
                    if (status === "After Start Time") {
                      lateArrivalCount = lateArrivalCount + 1;
                    }
                  }
                }
              });
            }
          });
          const obj = {
            date: dateConst,
            desktop: onTimeArrivalCount,
            mobile: lateArrivalCount,
          };

          resultList.push(obj);
          onTimeArrivalCount = 0;
          lateArrivalCount = 0;
        });

        return res.status(200).json(resultList);
      }
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during calculating attendance data", 500));
  }
});

export const getAttendancePCResponse = catchAsync(async (req, res, next) => {
  const { email, teamId } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          roles: true,
        },
      });

      if (user.roles.some((role) => role.code === "ADMIN")) {
        const today = moment.tz("Asia/Kolkata").startOf("day").toISOString();

        const attendanceRecordsinRange = await prisma.attendance.findMany({
          where: {
            date: today,
          },
        });

        let onTimeArrivalCount = 0;
        let lateArrivalCount = 0;

        let usersList;
        if (teamId === "0") {
          usersList = await prisma.user.findMany();
        } else {
          const team = await prisma.team.findFirst({
            where: {
              id: Number(teamId),
            },
            include: {
              members: true,
            },
          });

          usersList = team.members;
        }

        attendanceRecordsinRange.map((attendance) => {
          usersList.map((user) => {
            if (user.userId === attendance.userId) {
              if (
                user.workingHours !== null &&
                user.workingHours !== undefined &&
                !isEmpty(user.workingHours)
              ) {
                const prismaDateTime = attendance.punchInTime;
                const timeRange = user.workingHours;

                const status = isDateTimeInRange(timeRange, prismaDateTime);

                if (status === "Before Start Time") {
                  onTimeArrivalCount = onTimeArrivalCount + 1;
                }
                if (status === "After Start Time") {
                  lateArrivalCount = lateArrivalCount + 1;
                }
              } else {
                const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                const timeRange = "9:00-18:00";
                const status = isDateTimeInRange(timeRange, prismaDateTime);

                if (status === "Before Start Time") {
                  onTimeArrivalCount = onTimeArrivalCount + 1;
                }
                if (status === "After Start Time") {
                  lateArrivalCount = lateArrivalCount + 1;
                }
              }
            }
          });
        });

        const leaveCount = await prisma.leaves.findMany({
          where: {
            date: today,
            approvalStatus: "YES",
          },
        });

        const obj = {
          onTime: onTimeArrivalCount,
          lateCount: lateArrivalCount,
          onLeave: leaveCount.length,
        };

        return res.status(200).json(obj);
      }
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during calculating attendance data", 500));
  }
});

function getTop4MostFrequentNumbers(arr) {
  // Create an object to track frequencies
  const freqMap = {};

  // Count frequencies of each number in the list
  arr.forEach((num) => {
    freqMap[num] = (freqMap[num] || 0) + 1;
  });

  // Sort the frequency map by the counts in descending order and return the top 4
  return Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1]) // Sort by frequency count (highest first)
    .slice(0, 4) // Take the top 4
    .map(([num, count]) => ({ number: Number(num), count })); // Return an object with number and count
}

// Example usage:
const numbers = [1, 2, 3, 2, 4, 3, 2, 5, 1, 3, 3, 6, 1, 1];
const result = getTop4MostFrequentNumbers(numbers);
console.log(result);

export const getAttendanceCustomTableResponse = catchAsync(
  async (req, res, next) => {
    const { email, from, to, teamId, lateFlag } = req.query;

    try {
      await prisma.$transaction(async (prisma) => {
        const user = await prisma.user.findFirst({
          where: {
            email: email,
          },
          include: {
            roles: true,
          },
        });

        if (user.roles.some((role) => role.code === "ADMIN")) {
          if (isEmpty(from) || isEmpty(to)) {
            const attendanceRecordsinRange = await prisma.attendance.findMany();
            let onTimeArrivalCount = 0;
            let lateArrivalCount = 0;
            let resultList = [];
            let usersList;
            if (teamId === "0") {
              usersList = await prisma.user.findMany();
            } else {
              const team = await prisma.team.findFirst({
                where: {
                  id: Number(teamId),
                },
                include: {
                  members: true,
                },
              });

              usersList = team.members;
            }

            const dateList = [
              ...new Set(
                attendanceRecordsinRange.map(
                  (item) => new Date(item.date).toISOString().split("T")[0]
                )
              ),
            ];

            dateList.map((date) => {
              const dateConst = date;
              attendanceRecordsinRange.map((attendance) => {
                if (date === attendance.date.toISOString().split("T")[0]) {
                  usersList.map((user) => {
                    if (user.userId === attendance.userId) {
                      if (
                        user.workingHours !== null &&
                        user.workingHours !== undefined &&
                        !isEmpty(user.workingHours)
                      ) {
                        const prismaDateTime = attendance.punchInTime;
                        const timeRange = user.workingHours;

                        const status = isDateTimeInRange(
                          timeRange,
                          prismaDateTime
                        );

                        if (status === "Before Start Time") {
                          onTimeArrivalCount = onTimeArrivalCount + 1;
                        }
                        if (status === "After Start Time") {
                          lateArrivalCount = lateArrivalCount + 1;
                        }
                      } else {
                        const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                        const timeRange = "9:00-18:00";
                        const status = isDateTimeInRange(
                          timeRange,
                          prismaDateTime
                        );

                        if (status === "Before Start Time") {
                          onTimeArrivalCount = onTimeArrivalCount + 1;
                        }
                        if (status === "After Start Time") {
                          lateArrivalCount = lateArrivalCount + 1;
                        }
                      }
                    }
                  });
                }
              });
              const obj = {
                date: dateConst,
                desktop: onTimeArrivalCount,
                mobile: lateArrivalCount,
              };

              resultList.push(obj);
              onTimeArrivalCount = 0;
              lateArrivalCount = 0;
            });
            return res.status(200).json(resultList);
          }

          const formattedDate1 = moment
            .tz(from, "Asia/Kolkata")
            .startOf("day")
            .toISOString();
          const formattedDate2 = moment
            .tz(to, "Asia/Kolkata")
            .startOf("day")
            .toISOString();

          const attendanceRecordsinRange = await prisma.attendance.findMany({
            where: {
              date: {
                gte: formattedDate1,
                lte: formattedDate2,
              },
            },
          });

          let onTimeArrivalCount = 0;
          let lateArrivalCount = 0;
          let resultList = [];

          let usersList;
          if (teamId === "0") {
            usersList = await prisma.user.findMany();
          } else {
            const team = await prisma.team.findFirst({
              where: {
                id: Number(teamId),
              },
              include: {
                members: true,
              },
            });

            usersList = team.members;
          }

          let lateUserIds = [];
          let onTimeUserIds = [];

          attendanceRecordsinRange.map((attendance) => {
            usersList.map((user) => {
              if (user.userId === attendance.userId) {
                if (
                  user.workingHours !== null &&
                  user.workingHours !== undefined &&
                  !isEmpty(user.workingHours)
                ) {
                  const prismaDateTime = attendance.punchInTime;
                  const timeRange = user.workingHours;

                  const status = isDateTimeInRange(timeRange, prismaDateTime);

                  if (status === "Before Start Time") {
                    onTimeArrivalCount = onTimeArrivalCount + 1;
                    onTimeUserIds.push(user.userId);
                  }
                  if (status === "After Start Time") {
                    lateArrivalCount = lateArrivalCount + 1;
                    lateUserIds.push(user.userId);
                  }
                } else {
                  const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                  const timeRange = "9:00-18:00";
                  const status = isDateTimeInRange(timeRange, prismaDateTime);

                  if (status === "Before Start Time") {
                    onTimeArrivalCount = onTimeArrivalCount + 1;
                    onTimeUserIds.push(user.userId);
                  }
                  if (status === "After Start Time") {
                    lateArrivalCount = lateArrivalCount + 1;
                    lateUserIds.push(user.userId);
                  }
                }
              }
            });
          });

          if (lateFlag === "true") {
            const top4LateUsers = getTop4MostFrequentNumbers(lateUserIds);

            const IdList = result.map((item) => item.number);

            const users = await prisma.user.findMany({
              where: {
                userId: {
                  in: IdList,
                },
              },
            });

            let reultList = [];
            users.map((user) => {
              const obj = {
                username: user.username,
                userStatus: user.userStatus,
                lateCount: top4LateUsers.find(
                  (item) => item.number === user.userId
                ),
                avgWorkingTime: "",
              };
            });
          }

          const obj = {
            date: dateConst,
            desktop: onTimeArrivalCount,
            mobile: lateArrivalCount,
          };

          resultList.push(obj);
          onTimeArrivalCount = 0;
          lateArrivalCount = 0;

          return res.status(200).json(resultList);
        }
      });
    } catch (error) {
      console.log(error);
      return next(
        new AppError("Error during calculating attendance data", 500)
      );
    }
  }
);
