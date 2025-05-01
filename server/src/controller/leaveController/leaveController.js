import catchAsync from "../../utils/catchAsync.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import AppError from "../../utils/appError.js";
import { isEmpty } from "../../utils/genericMethods.js";
import { prisma } from "../../server.js";
import moment from "moment-timezone";
import { formatDate } from "../attendanceController/attendanceController.js";

export const getFinancialYearRange = () => {
  const today = new Date();
  const year =
    today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;

  const startDate = new Date(year, 3, 1); // April 1st
  const endDate = new Date(year + 1, 2, 31, 23, 59, 59, 999); // March 31st, 11:59:59 PM

  return { startDate, endDate };
};

const getDatesBetween = (fromDate, toDate) => {
  const dates = [];
  const current = moment(fromDate).tz("Asia/Kolkata").startOf("day");

  const end = moment(toDate).tz("Asia/Kolkata").startOf("day");

  while (current.isSameOrBefore(end)) {
    dates.push(current.toISOString()); // Will be midnight IST in ISO (UTC) format
    current.add(1, "day");
  }

  return dates;
};

export const createLeave = catchAsync(async (req, res, next) => {
  const { date, description, email, fromDate, title, toDate } = req.body;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          userDetails: true,
        },
      });

      let approvalStatus = "NO";

      if (isEmpty(user.reportsToId)) {
        approvalStatus = "YES";
      }

      const { startDate, endDate } = getFinancialYearRange();

      const leavesTaken = await prisma.leaves.findMany({
        where: {
          userId: user.userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      let totalLeaves = 100000;
      if (!isEmpty(user.userDetails)) {
        totalLeaves = Number(user.userDetails.totalLeaves);
      }

      if (leavesTaken.length >= totalLeaves) {
        return next(new AppError("Already utilized all leaves", 500));
      }

      if (!isEmpty(toDate)) {
        const days = getDatesBetween(new Date(fromDate), new Date(toDate));
        console.log(days);

        const entries = days.map((date) => ({
          leaveType: title,
          description: description,
          date: date,
          userId: user.userId,
          username: user.username,
          approvalStatus: approvalStatus,
        }));

        await prisma.leaves.createMany({
          data: entries,
        });
      } else {
        const currentDateTime = new Date();
        currentDateTime.setHours(0, 0, 0, 0);
        const todayDate = moment().tz("Asia/Kolkata").startOf("day");
        const indianTimeISOString = todayDate.toISOString();

        await prisma.leaves.create({
          data: {
            leaveType: title,
            description: description,
            date: indianTimeISOString,
            userId: user.userId,
            username: user.username,
            approvalStatus: approvalStatus,
          },
        });
      }
      return next(new SuccessResponse("Leave applied Successfully", 200));
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during updating attendance records", 500));
  }
});

export const getLeaves = catchAsync(async (req, res, next) => {
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

      const today = new Date();

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);

      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(today.getMonth() + 6);

      if (user.roles.some((role) => role.code === "ADMIN")) {
        const leaves = await prisma.leaves.findMany({
          where: {
            date: {
              gte: sixMonthsAgo,
              lte: sixMonthsLater,
            },
          },
        });

        return res.status(200).json(leaves);
      } else {
        const leaves = await prisma.leaves.findMany({
          where: {
            userId: user.userId,
            date: {
              gte: sixMonthsAgo,
              lte: sixMonthsLater,
            },
          },
        });

        return res.status(200).json(leaves);
      }
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during getting leave records", 500));
  }
});

export const getLeavesApprovalData = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      const users = await prisma.user.findMany({
        where: {
          reportsToId: user.userId,
        },
        select: {
          userId: true,
        },
      });

      let userIdList = [];

      users.map((user) => {
        userIdList.push(user.userId);
      });

      const leaves = await prisma.leaves.findMany({
        where: {
          userId: {
            in: userIdList,
          },
          approvalStatus: "NO",
        },
      });

      return res.status(200).json(leaves);
    });
  } catch (error) {
    console.log(error);
    return next(
      new AppError("Error during getting leave approval records", 500)
    );
  }
});

export const updateLeave = catchAsync(async (req, res, next) => {
  const { email, id, approveRejectFlag } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      if (approveRejectFlag === "true") {
        const leave = await prisma.leaves.update({
          where: {
            id: Number(id),
          },
          data: {
            approvalStatus: "YES",
          },
        });

        const currentDateTime = new Date();

        await prisma.alert.create({
          data: {
            title: "Leave approved",
            description: `${
              user.username
            } approved your leave for date ${formatDate(leave.date)}`,
            triggeredDate: currentDateTime,
            userId: leave.userId,
          },
        });
      } else {
        const leave = await prisma.leaves.delete({
          where: {
            id: Number(id),
          },
        });

        const currentDateTime = new Date();

        await prisma.alert.create({
          data: {
            title: "Leave rejected",
            description: `${
              user.username
            } rejected your leave for date ${formatDate(leave.date)}`,
            triggeredDate: currentDateTime,
            userId: leave.userId,
          },
        });
      }

      return next(new SuccessResponse("Leave updated successfully", 200));
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during updating attendance records", 500));
  }
});
