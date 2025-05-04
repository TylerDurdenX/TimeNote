import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import { isEmpty } from "../../utils/genericMethods.js";
import moment from "moment-timezone";
import { formatTime } from "../attendanceController/attendanceController.js";

export const createBreak = catchAsync(async (req, res, next) => {
  const { email, breakName, breakDescription, breakCode, breakTimeInMinutes } =
    req.body;
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

      if (
        user.roles.some((role) => role.code === "ADMIN") ||
        user.roles.some((role) => role.code === "TEAM_LEAD")
      ) {
        const breakType = await prisma.breakType.create({
          data: {
            breakName: breakName,
            breakCode: breakCode,
            breakDescription: breakDescription,
            breakTimeInMinutes: breakTimeInMinutes,
          },
        });

        return next(new SuccessResponse("Break Created Successfully", 200));
      } else {
        return next(new AppError("User not authorized to create breaks", 500));
      }
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("There was an error creating break", 400));
  }
});

export const deleteBreak = catchAsync(async (req, res, next) => {
  const { breakId } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const breakType = await prisma.breakType.delete({
        where: {
          id: Number(breakId),
        },
      });

      return next(new SuccessResponse("Record Deleted Successfully", 200));
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Error Occurred while deleting record: ${error.message}`,
    });
  }
});

export const getBreaksList = catchAsync(async (req, res, next) => {
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

      let resultList = [];

      if (
        user.roles.some((role) => role.code === "ADMIN") ||
        user.roles.some((role) => role.code === "TEAM_LEAD")
      ) {
        resultList = await prisma.breakType.findMany();
        return res.status(200).json(resultList);
      } else {
        return res.status(200).json(resultList);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Error Occurred while deleting record: ${error.message}`,
    });
  }
});

export const updateBreak = catchAsync(async (req, res, next) => {
  const { email, breakId, breakName, breakDescription, breakTimeInMinutes } =
    req.body;
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

      if (
        user.roles.some((role) => role.code === "ADMIN") ||
        user.roles.some((role) => role.code === "TEAM_LEAD")
      ) {
        const updatedBreak = await prisma.breakType.update({
          where: {
            id: Number(breakId),
          },
          data: {
            breakName: breakName,
            breakDescription: breakDescription,
            breakTimeInMinutes: breakTimeInMinutes,
          },
        });
        return next(new SuccessResponse("Record Updated Successfully", 200));
      } else {
        return next(new AppError("User not authorized to Update breaks", 500));
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Error Occurred while deleting record: ${error.message}`,
    });
  }
});

export const updateBreakTime = catchAsync(async (req, res, next) => {
  const {
    email,
    breakTypeCode,
    breakTypeName,
    customBreakType,
    startTime,
    endTime,
    breakId,
  } = req.body;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
      });

      const todayDate = moment().tz("Asia/Kolkata").startOf("day");
      const indianTimeISOString = todayDate.toISOString();

      const attendance = await prisma.attendance.findFirst({
        where: {
          userId: user.userId,
          date: indianTimeISOString,
        },
      });

      let resultBreakId = 0;

      if (breakTypeCode !== "CUSTOM_BREAK") {
        const breakType = await prisma.breakType.findFirst({
          where: {
            breakCode: breakTypeCode,
          },
        });
        if (!isEmpty(startTime)) {
          const breakTaken = await prisma.breaks.create({
            data: {
              userId: user.userId,
              startTime: startTime,
              date: indianTimeISOString,
              attendanceId: attendance.id,
              breakTypeCode: breakTypeCode,
              breakTypeName: breakTypeName,
              breakTypeId: breakType.id,
            },
          });

          await prisma.user.update({
            where: {
              userId: user.userId,
            },
            data: {
              userStatus: "inactive",
            },
          });

          resultBreakId = breakTaken.id;
        } else {
          const breakTime = await prisma.breaks.findFirst({
            where: {
              id: Number(breakId),
            },
            select: {
              startTime: true,
            },
          });

          const startDate = new Date(breakTime.startTime);
          const endDate = new Date(endTime);

          // Calculate the difference in milliseconds
          const differenceInMilliseconds = endDate - startDate;

          // Convert milliseconds to seconds
          const differenceInSeconds = differenceInMilliseconds / 1000;

          // Calculate total minutes
          const totalMinutes = Math.floor(differenceInSeconds / 60);

          // Calculate remaining seconds
          const remainingSeconds = Math.floor(differenceInSeconds % 60);

          const breakTaken = await prisma.breaks.update({
            where: {
              id: Number(breakId),
            },
            data: {
              endTime: endTime,
              breakTimeInMinutes: `${totalMinutes}:${remainingSeconds
                .toString()
                .padStart(2, "0")}`,
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

          resultBreakId = breakTaken.id;
        }
      } else {
        if (!isEmpty(startTime)) {
          const breakTaken = await prisma.breaks.create({
            data: {
              userId: user.userId,
              startTime: startTime,
              date: indianTimeISOString,
              attendanceId: attendance.id,
              breakTypeCode: "CUSTOM_BREAK",
              breakTypeName: customBreakType,
            },
          });

          await prisma.user.update({
            where: {
              userId: user.userId,
            },
            data: {
              userStatus: "inactive",
            },
          });

          resultBreakId = breakTaken.id;
        } else {
          const breakTime = await prisma.breaks.findFirst({
            where: {
              id: Number(breakId),
            },
            select: {
              startTime: true,
            },
          });

          const startDate = new Date(breakTime.startTime);
          const endDate = new Date(endTime);

          // Calculate the difference in milliseconds
          const differenceInMilliseconds = endDate - startDate;

          // Convert milliseconds to seconds
          const differenceInSeconds = differenceInMilliseconds / 1000;

          const breakTimeInMinutes = String(
            Math.floor(differenceInSeconds / 60)
          );
          const remainingSeconds = breakTimeInMinutes % 60;
          const breakTaken = await prisma.breaks.update({
            where: {
              id: Number(breakId),
            },
            data: {
              endTime: endTime,
              breakTimeInMinutes: `${breakTimeInMinutes}:${remainingSeconds}`,
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
        }
      }

      const inProgressTasks = await prisma.task.findMany({
        where: {
          inProgressStartTime: {
            not: null,
          },
          assignedUserId: user.userId,
        },
      });

      const currentDateTime = new Date();
      const indianTimeISOStringForBreak = currentDateTime.toISOString();

      await Promise.all(
        inProgressTasks.map(async (task) => {
          const differenceInMilliseconds =
            currentDateTime - new Date(task.inProgressStartTime);
          const differenceInMinutes = Math.floor(
            differenceInMilliseconds / (1000 * 60)
          );
          const progressTime =
            Number(task.inProgressTimeinMinutes || 0) + differenceInMinutes;
          const updatedTask = await prisma.task.update({
            where: {
              id: task.id,
            },
            data: {
              inProgressStartTime: null,
              inProgressTimeinMinutes: String(progressTime),
            },
          });

          await prisma.taskActivity.create({
            data: {
              taskId: updatedTask.id,
              date: indianTimeISOStringForBreak,
              activity: `System paused the Task Progress (User on a Break)`,
            },
          });
        })
      );
      const userLogout = await prisma.user.update({
        where: {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
        data: {
          isLoggedIn: false,
        },
      });

      const result = {
        status: "Success",
        breakId: resultBreakId,
      };
      res.status(200).json(result);
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during updating attendance records", 500));
  }
});

function subtractTime(minutesStr, timeStr) {
  // Convert the minutesStr (in minutes) to seconds
  if (timeStr === null) {
    return "0";
  }
  let minutesInSeconds = parseInt(minutesStr) * 60;

  // Parse the mm:ss format (timeStr) into minutes and seconds
  let [minutes, seconds] = timeStr.split(":").map((num) => parseInt(num));

  // Convert mm:ss into seconds
  let timeInSeconds = minutes * 60 + seconds;

  // Find the difference
  let diffInSeconds = minutesInSeconds - timeInSeconds;

  // If the timeStr (mm:ss) is larger, calculate the difference
  if (diffInSeconds < 0) {
    let exceededSeconds = Math.abs(diffInSeconds);
    let exceededMinutes = Math.floor(exceededSeconds / 60);
    exceededSeconds = exceededSeconds % 60;

    // Format the difference in mm:ss
    return `${String(exceededMinutes).padStart(2, "0")}:${String(
      exceededSeconds
    ).padStart(2, "0")}`;
  } else {
    return "0";
  }
}

export const getBreaksData = catchAsync(async (req, res, next) => {
  const { userId, date } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const todayDate = moment(date).tz("Asia/Kolkata").startOf("day");
      const isoDate = todayDate.toISOString();

      const breaksList = await prisma.breaks.findMany({
        where: {
          userId: Number(userId),
          date: isoDate,
        },
      });

      let resultList = [];
      let id = 1;

      await Promise.all(
        breaksList.map(async (breakTaken) => {
          let breakTimeConfigured = 0;
          if (breakTaken.breakTypeCode === "CUSTOM_BREAK") {
          } else {
            const breakTypeObj = await prisma.breakType.findFirst({
              where: {
                breakCode: breakTaken.breakTypeCode,
              },
              select: {
                breakTimeInMinutes: true,
              },
            });
            breakTimeConfigured = breakTypeObj.breakTimeInMinutes;
          }
          const breakObj = {
            id: id,
            breakType: breakTaken.breakTypeName,
            breakStartTime: formatTime(breakTaken.startTime),
            breakEndTime: formatTime(breakTaken.endTime),
            breakTimeInMinutes: breakTaken.breakTimeInMinutes,
            breakTimeConfigured: breakTimeConfigured,
            breakTimeOverrun: subtractTime(
              breakTimeConfigured,
              breakTaken.breakTimeInMinutes
            ),
          };
          id = id + 1;
          resultList.push(breakObj);
        })
      );

      return res.status(200).json(resultList);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Error Occurred while fetching record: ${error.message}`,
    });
  }
});

export const idleTimeoutUser = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      // const todayDate = moment(date).tz("Asia/Kolkata").startOf("day");
      // const isoDate = todayDate.toISOString();

      const currentTime = moment().tz("Asia/Kolkata");
      const currentDateTime = currentTime.toISOString();

      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
      });

      const tasksList = await prisma.task.findMany({
        where: {
          inProgressStartTime: {
            not: null,
          },
          assignedUserId: user.userId,
        },
      });

      if (!isEmpty(tasksList)) {
        const differenceInMilliseconds =
          currentDateTime - new Date(tasksList[0].inProgressStartTime);
        const differenceInMinutes = Math.floor(
          differenceInMilliseconds / (1000 * 60)
        );
        const progressTime =
          Number(tasksList[0].inProgressTimeinMinutes || 0) +
          differenceInMinutes;

        await prisma.task.update({
          where: {
            id: tasksList[0].id,
          },
          data: {
            inProgressStartTime: null,
            inProgressTimeinMinutes: String(progressTime),
          },
        });

        await prisma.taskActivity.create({
          data: {
            taskId: tasksList[0].id,
            date: indianTimeISOString,
            activity: `System paused the Task Due to Idle Timeout`,
          },
        });
      }

      const subTasksList = await prisma.subtask.findMany({
        where: {
          inProgressStartTime: {
            not: null,
          },
          assignedUserId: user.userId,
        },
      });

      if (!isEmpty(subTasksList)) {
        const differenceInMilliseconds =
          currentDateTime - new Date(subTasksList[0].inProgressStartTime);
        const differenceInMinutes = Math.floor(
          differenceInMilliseconds / (1000 * 60)
        );
        const progressTime =
          Number(subTasksList[0].inProgressTimeinMinutes || 0) +
          differenceInMinutes;

        await prisma.subtask.update({
          where: {
            id: subTasksList[0].id,
          },
          data: {
            inProgressStartTime: null,
            inProgressTimeinMinutes: String(progressTime),
          },
        });

        await prisma.subTaskActivity.create({
          data: {
            subTaskId: subTasksList[0].id,
            date: indianTimeISOString,
            activity: `System paused the Task Due to Idle Timeout`,
          },
        });
      }

      await prisma.user.update({
        where: {
          userId: user.userId,
        },
        data: {
          isLoggedIn: false,
          userStatus: "inactive",
        },
      });

      const todayDate = moment().tz("Asia/Kolkata").startOf("day");
      const indianTimeISOString = todayDate.toISOString();

      const attendance = await prisma.attendance.findFirst({
        where: {
          userId: user.userId,
          date: indianTimeISOString,
        },
      });

      if (isEmpty(attendance)) {
        return next(new AppError("user not punched In", 500));
      }

      let resultBreakId = 0;
      const breakType = await prisma.breakType.findFirst({
        where: {
          breakCode: "CUSTOM_BREAK",
        },
      });
      const breakTaken = await prisma.breaks.create({
        data: {
          userId: user.userId,
          startTime: currentDateTime,
          date: indianTimeISOString,
          attendanceId: attendance.id,
          breakTypeCode: "CUSTOM_BREAK",
          breakTypeName: "Idle Timeout",
        },
      });

      resultBreakId = breakTaken.id;

      const result = {
        status: "Success",
        breakId: resultBreakId,
      };

      return res.status(200).json(result);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Error Occurred : ${error.message}`,
    });
  }
});

export const resumeIdleTimeout = catchAsync(async (req, res, next) => {
  const { email, breakId } = req.body;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: "insensitive",
          },
        },
      });

      const currentDateTime = new Date();
      const todayDate = moment().tz("Asia/Kolkata").startOf("day");
      const indianTimeISOString = todayDate.toISOString();

      const attendance = await prisma.attendance.findFirst({
        where: {
          userId: user.userId,
          date: indianTimeISOString,
        },
      });

      let resultBreakId = 0;

      const breakTime = await prisma.breaks.findFirst({
        where: {
          id: Number(breakId),
        },
        select: {
          startTime: true,
        },
      });

      const startDate = new Date(breakTime.startTime);
      const endDate = new Date(currentDateTime);

      // Calculate the difference in milliseconds
      const differenceInMilliseconds = endDate - startDate;

      // Convert milliseconds to seconds
      const differenceInSeconds = differenceInMilliseconds / 1000;

      const breakTimeInMinutes = String(Math.floor(differenceInSeconds / 60));
      const remainingSeconds = breakTimeInMinutes % 60;
      const breakTaken = await prisma.breaks.update({
        where: {
          id: Number(breakId),
        },
        data: {
          endTime: currentDateTime,
          breakTimeInMinutes: `${breakTimeInMinutes}:${remainingSeconds}`,
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
        breakId: resultBreakId,
      };
      res.status(200).json(result);
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during updating attendance records", 500));
  }
});
