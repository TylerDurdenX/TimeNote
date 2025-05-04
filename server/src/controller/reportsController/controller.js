import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import { isEmpty } from "../../utils/genericMethods.js";

export const createAutoReportConfig = catchAsync(async (req, res, next) => {
  const {
    email,
    teamName,
    userEmail,
    allUsersFlag,
    reportDuration,
    time,
    period,
    reportName,
  } = req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      const oldConfig = await prisma.autoReports.findFirst({
        where: {
          userId: user.userId,
          ReportName: reportName,
          ReportDuration: reportDuration,
        },
      });

      if (isEmpty(oldConfig)) {
        const newConfiguration = await prisma.autoReports.create({
          data: {
            userId: user.userId,
            userEmail: userEmail,
            ReportDuration: reportDuration,
            ReportName: reportName,
            team: teamName,
            ReportTime: time + period,
            allUsersFlag: allUsersFlag,
          },
        });
      } else {
        return next(
          new AppError("Configuration for this report already present", 500)
        );
      }

      res.status(200).json({
        status: "success",
        message: "Configuration uploaded successfully",
      });
    });
  } catch (error) {
    console.error("Error during createAutoReportConfig" + error);
    return next(
      new AppError("There was an error uploading configuration", 400)
    );
  }
});

export const getAutoReportConfig = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      const autoReports = await prisma.autoReports.findMany({
        where: {
          userId: user.userId,
        },
      });
      res.json(autoReports);
    });
  } catch (error) {
    console.log("Error during getAutoReportConfig" + error);
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }
});

export const deleteAutoReportConfig = catchAsync(async (req, res, next) => {
  const { reportId } = req.query;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const autoReports = await prisma.autoReports.delete({
        where: {
          id: Number(reportId),
        },
      });
      return next(new SuccessResponse("Record Deleted Successfully", 200));
    });
  } catch (error) {
    console.log("Error during deleteAutoReportConfig" + error);
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }
});
