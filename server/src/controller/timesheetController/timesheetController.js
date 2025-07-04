import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import { isEmpty } from "../../utils/genericMethods.js";
import moment from "moment-timezone";

export const getTimesheetData = catchAsync(async (req, res, next) => {
  const { email, date } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      const timesheetDataList = await prisma.timesheet.findMany({
        where: {
          userId: user.userId,
          date: getTodayDateInISO(new Date(date)),
        },
      });
      let formattedTime = "";
      let totalMinutes = 0;

      if (!isEmpty(timesheetDataList)) {
        timesheetDataList.map((timesheet) => {
          if (!isEmpty(timesheet.approvedHours)) {
            const [hours, minutes] = timesheet.approvedHours
              .split(":")
              .map(Number);
            totalMinutes += hours * 60 + minutes;
          }
        });
      }

      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;

      formattedTime = `${totalHours
        .toString()
        .padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}`;

      const result = {
        timesheetDataList: timesheetDataList,
        totalTime: formattedTime,
      };

      return res.status(200).json(result);
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during getting Timesheet Entries", 200));
  }
});

export const viewTimesheetData = catchAsync(async (req, res, next) => {
  const { name, date } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          username: name,
        },
      });

      const timesheetDataList = await prisma.timesheet.findMany({
        where: {
          userId: user.userId,
          date: getTodayDateInISO(new Date(date)),
        },
      });
      console.log(getTodayDateInISO(new Date(date)));
      let formattedTime = "";
      let totalMinutes = 0;

      if (!isEmpty(timesheetDataList)) {
        timesheetDataList.map((timesheet) => {
          const [hours, minutes] = timesheet.consumedHours
            .split(":")
            .map(Number);
          totalMinutes += hours * 60 + minutes;
        });
      }

      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;

      formattedTime = `${totalHours
        .toString()
        .padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}`;

      const result = {
        timesheetDataList: timesheetDataList,
        totalTime: formattedTime,
      };

      return res.status(200).json(result);
    });
  } catch (error) {
    console.log("Error during getTimesheetData" + error);
    return next(new AppError("Error during getting Timesheet Entries", 200));
  }
});

function getTodayDateInISO(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  const dateInIST = new Date(formattedDate + "T00:00:00+05:30");
  return dateInIST.toISOString();
}

function updateTimesheetData(inputString, updatedEntry, approveRejectFlag) {
  let objectsString = inputString;

  let newObject = updatedEntry;

  let objectsArray = parseData(objectsString);

  let objectIndex = objectsArray.findIndex(
    (obj) =>
      obj.task === newObject.task &&
      obj.consumedHours === newObject.consumedHours &&
      obj.approvalStatus === newObject.approvalStatus
  );

  if (objectIndex !== -1) {
    objectsArray[objectIndex].approvalStatus = "NA";
  }

  let updatedObjectsString = objectsArray
    .map((obj) => JSON.stringify(obj))
    .join(", ");

  return updatedObjectsString;
}

export const createTimesheetEntry = catchAsync(async (req, res, next) => {
  const { task, completionPercentage, consumedHours, date, email } = req.body;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      let approveFlag = "";

      if (isEmpty(user.reportsToId)) {
        approveFlag = "NA";
        const newTimesheetEntry = await prisma.timesheet.create({
          data: {
            task: task,
            consumedHours: consumedHours,
            approvedHours: consumedHours,
            ApprovedFlag: approveFlag,
            userId: user.userId,
            username: user.username,
            date: getTodayDateInISO(new Date(date)),
          },
        });
      } else {
        approveFlag = "NO";
        const newTimesheetEntry = await prisma.timesheet.create({
          data: {
            task: task,
            consumedHours: consumedHours,
            ApprovedFlag: approveFlag,
            userId: user.userId,
            username: user.username,
            date: getTodayDateInISO(new Date(date)),
          },
        });
      }

      return next(new SuccessResponse("Entry Created Successfully", 200));
    });
  } catch (error) {
    console.log("Error during createTimesheetEntry" + error);
    return next(new AppError("Error during getting Timesheet Entries", 200));
  }
});

export const getPendingTimesheetData = catchAsync(async (req, res, next) => {
  const { email, date } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      const reportingUserIdList = await prisma.user.findMany({
        where: {
          reportsToId: user.userId,
        },
        select: {
          userId: true,
          username: true,
        },
      });

      let idList = [];
      reportingUserIdList.map((user) => {
        idList.push(user.userId);
      });

      const timesheetData = await prisma.timesheet.findMany({
        where: {
          userId: {
            in: idList,
          },
        },
      });

      let resultList = [];
      timesheetData.map((timesheet) => {
        if (timesheet.ApprovedFlag === "NO") {
          resultList.push(timesheet);
        }
      });

      return res.status(200).json(resultList);
    });
  } catch (error) {
    console.log(error);
    return next(
      new AppError("Error during getting Pending Timesheet Entries", 500)
    );
  }
});

export const getUsersTimesheetData = catchAsync(async (req, res, next) => {
  const { email, date } = req.query;
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
        const timesheetDataList = await prisma.timesheet.findMany({
          where: {
            date: getTodayDateInISO(new Date(date)),
          },
        });

        const timeToMinutes = (time) => {
          if (time) {
            const [hours, minutes] = time.split(":").map(Number);
            return hours * 60 + minutes;
          } else {
            return 0;
          }
        };

        // Helper function to convert total minutes back to "HH:MM" format
        const minutesToTime = (minutes) => {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return `${hours.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}`;
        };

        // Group by userId and sum consumedHours
        const groupedData = timesheetDataList.reduce((acc, current) => {
          const existingUser = acc.find(
            (item) => item.userId === current.userId
          );

          // Convert current consumedHours to minutes
          const currentMinutes = timeToMinutes(current.consumedHours);
          const currentApprovedMinutes = timeToMinutes(current.approvedHours);

          if (existingUser) {
            // If the user already exists, add the consumedHours
            existingUser.totalMinutes += currentMinutes;
            existingUser.totalApprovedMinutes += currentApprovedMinutes;
          } else {
            // If the user doesn't exist, create a new entry
            acc.push({
              userId: current.userId,
              username: current.username,
              totalMinutes: currentMinutes,
              totalApprovedMinutes: currentApprovedMinutes,
            });
          }
          return acc;
        }, []);

        // Convert total minutes back to "HH:MM" and create the final output with unique IDs
        const finalData = groupedData.map((user, index) => {
          return {
            id: index + 1, // Use the index + 1 to generate unique ids for each user
            consumedHours: minutesToTime(user.totalMinutes),
            approvedHours: minutesToTime(user.totalApprovedMinutes),
            userId: user.userId,
            username: user.username,
          };
        });

        res.status(200).json(finalData);
      } else {
        const reportingUserIdList = await prisma.user.findMany({
          where: {
            reportsToId: user.userId,
          },
          select: {
            userId: true,
            username: true,
          },
        });

        let idList = [];
        reportingUserIdList.map((user) => {
          idList.push(user.userId);
        });

        const timesheetData = await prisma.timesheet.findMany({
          where: {
            userId: {
              in: idList,
            },
          },
        });

        // let resultList = []
        // timesheetData.map((timesheet) => {
        //   if(timesheet.ApprovedFlag === "NO"){
        //     resultList.push(timesheet)
        //   }
        // })

        // return res.status(200).json(resultList)
      }
    });
  } catch (error) {
    console.log(error);
    return next(
      new AppError("Error during getting Pending Timesheet Entries", 500)
    );
  }
});

export const updateTimesheet = catchAsync(async (req, res, next) => {
  const { id, approveRejectFlag, approvedHours, email } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      if (approveRejectFlag === "true") {
        const updatedtimesheet = await prisma.timesheet.update({
          where: {
            id: Number(id),
          },
          data: {
            ApprovedFlag: "NA",
            approvedHours: String(approvedHours),
          },
        });
        return next(new SuccessResponse("Record Approved successfully", 200));
      } else {
        const timesheetEntry = await prisma.timesheet.findFirst({
          where: {
            id: Number(id),
          },
        });
        const deletedtimesheet = await prisma.timesheet.delete({
          where: {
            id: Number(id),
          },
        });

        const alert = await prisma.alert.create({
          data: {
            title: `Timesheet Rejected`,
            description: `task : ${timesheetEntry.task}, consumed Hours: ${timesheetEntry.consumedHours}`,
            triggeredDate: new Date().toISOString(),
            userId: timesheetEntry.userId,
          },
        });
        return next(new SuccessResponse("Record Rejected successfully", 200));
      }
    });
  } catch (error) {
    console.log("Error during updateTimesheet" + error);
    return next(
      new AppError("Error during getting Pending Timesheet Entries", 500)
    );
  }
});

export const updateTimesheetRecords = catchAsync(async (req, res, next) => {
  const { email, taskCompletion } = req.body;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      let approveFlag = "NO";
      if (isEmpty(user.reportsToId)) {
        approveFlag = "NA";
      } else {
        approveFlag = "NO";
      }

      const today = new Date();
      const startOfDay = moment(today)
        .tz("Asia/Kolkata")
        .startOf("day")
        .toDate();
      const endOfDay = moment(today).tz("Asia/Kolkata").endOf("day").toDate();
      const todayDate = moment()
        .tz("Asia/Kolkata")
        .startOf("day")
        .toISOString();

      const taskListObj = taskCompletion.tasks;
      const subTaskListObj = taskCompletion.subTasks;

      await Promise.all(
        taskListObj.map(async (task) => {
          const taskActivityList = await prisma.taskActivity.findMany({
            where: {
              AND: [
                {
                  taskId: Number(task.taskId),
                },
                {
                  userId: user.userId,
                },
                {
                  date: {
                    gte: startOfDay,
                    lte: endOfDay,
                  },
                },
              ],
            },
          });

          const taskObj = await prisma.task.findFirst({
            where: {
              id: Number(task.taskId),
            },
            include: {
              project: {
                select: {
                  name: true,
                },
              },
            },
          });

          let consumedHours = 0;

          const filteredEntries = taskActivityList.filter(
            (entry) =>
              entry.activity === " Started Task Progress" ||
              entry.activity === " Paused Task Progress"
          );

          let totalTimeDifference = 0;

          for (let i = 0; i < filteredEntries.length; i += 2) {
            const start = filteredEntries[i];
            const end = filteredEntries[i + 1];

            if (
              start.activity === " Started Task Progress" &&
              end.activity === " Paused Task Progress"
            ) {
              const timeDifference = end.date - start.date;
              totalTimeDifference += timeDifference;
            }
          }

          if (totalTimeDifference) {
            const hours = Math.floor(totalTimeDifference / (1000 * 60 * 60));
            const minutes = Math.floor(
              (totalTimeDifference % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor(
              (totalTimeDifference % (1000 * 60)) / 1000
            );

            const formattedMinutes = minutes.toString().padStart(2, "0");

            consumedHours = `${hours}:${formattedMinutes}`;
          } else {
            consumedHours = "0:00";
          }

          const newConfig = await prisma.timesheet.upsert({
            where: {
              taskId_date: {
                taskId: Number(task.taskId),
                date: todayDate,
              },
            },
            update: {
              task: task.Comment,
              consumedHours: String(consumedHours),
              ApprovedFlag: approveFlag,
              userId: user.userId,
              username: user.username,
              completionPercentage: task.Completed,
              taskCode: task.taskCode,
            },
            create: {
              task: task.Comment,
              consumedHours: String(consumedHours),
              ApprovedFlag: approveFlag,
              userId: user.userId,
              username: user.username,
              completionPercentage: task.Completed,
              taskCode: task.taskCode,
              taskId: Number(task.taskId),
              taskName: taskObj.title,
              projectName: taskObj.project.name,
              date: todayDate,
            },
          });
        })
      );

      await Promise.all(
        subTaskListObj.map(async (subTask) => {
          const subTaskActivityList = await prisma.subTaskActivity.findMany({
            where: {
              AND: [
                {
                  subTaskId: Number(subTask.subTaskId),
                },
                {
                  userId: user.userId,
                },
                {
                  date: {
                    gte: startOfDay,
                    lte: endOfDay,
                  },
                },
              ],
            },
          });

          const subTaskObj = await prisma.subtask.findFirst({
            where: {
              id: Number(subTask.subTaskId),
            },
            include: {
              task: {
                select: {
                  project: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          });

          let consumedHours = 0;

          const filteredEntries = subTaskActivityList.filter(
            (entry) =>
              entry.activity === " Started Task Progress" ||
              entry.activity === " Paused Task Progress"
          );

          let totalTimeDifference = 0;

          for (let i = 0; i < filteredEntries.length; i += 2) {
            const start = filteredEntries[i];
            const end = filteredEntries[i + 1];

            if (
              start.activity === " Started Task Progress" &&
              end.activity === " Paused Task Progress"
            ) {
              const timeDifference = end.date - start.date;
              totalTimeDifference += timeDifference;
            }
          }

          if (totalTimeDifference) {
            const hours = Math.floor(totalTimeDifference / (1000 * 60 * 60));
            const minutes = Math.floor(
              (totalTimeDifference % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor(
              (totalTimeDifference % (1000 * 60)) / 1000
            );

            const formattedMinutes = minutes.toString().padStart(2, "0");

            consumedHours = `${hours}:${formattedMinutes}`;
          } else {
            consumedHours = "0:00";
          }

          const newConfig = await prisma.timesheet.upsert({
            where: {
              subTaskId_date: {
                subTaskId: Number(subTask.subTaskId),
                date: todayDate,
              },
            },
            update: {
              task: subTask.subTaskComment,
              consumedHours: String(consumedHours),
              ApprovedFlag: approveFlag,
              userId: user.userId,
              username: user.username,
              completionPercentage: subTask.subTaskCompleted,
              taskCode: subTask.subTaskCode,
            },
            create: {
              task: subTask.subTaskComment,
              consumedHours: String(consumedHours),
              ApprovedFlag: approveFlag,
              userId: user.userId,
              username: user.username,
              completionPercentage: subTask.subTaskCompleted,
              subTaskCode: subTask.subTaskCode,
              subTaskId: Number(subTask.subTaskId),
              taskName: subTaskObj.title,
              projectName: subTaskObj.task.project.name,
              date: todayDate,
            },
          });
        })
      );

      return next(
        new SuccessResponse("Timesheet Records Updated Successfully", 200)
      );
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during updateTimesheetRecords", 200));
  }
});

export const getUserTimesheetTeamReportData = catchAsync(
  async (req, res, next) => {
    const { teamName, month, email, year } = req.query;
    try {
      await prisma.$transaction(async (prisma) => {
        if (!isEmpty(teamName) && teamName !== "undefined") {
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

          const team = await prisma.team.findFirst({
            where: {
              name: teamName,
            },
            include: {
              members: {
                select: {
                  userId: true,
                },
              },
            },
          });

          let usersIdList = [];

          team.members.map((member) => {
            usersIdList.push(member.userId);
          });

          const usersList = await prisma.user.findMany({
            where: {
              userId: {
                in: usersIdList,
              },
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
          return res.status(200).json(finalResultList);
        } else if (!isEmpty(email) && email !== undefined) {
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

          const user = await prisma.user.findFirst({
            where: {
              email: email,
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
          }

          return res.status(200).json(finalResultList);
        } else {
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

          const usersList = await prisma.user.findMany({
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
          return res.status(200).json(finalResultList);
        }
      });
    } catch (error) {
      console.error(error);
      return next(
        new AppError("Error during getting user attendance PC data", 500)
      );
    }
  }
);
