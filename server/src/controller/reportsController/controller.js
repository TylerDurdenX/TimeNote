import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import SuccessResponse from "../../utils/SuccessResponse.js";

export const createAutoReportConfig = catchAsync(async (req, res, next) => {
    const {email, projectTeam, reportDuration, time, period, reportName} = req.body
    try {
        const user = await prisma.user.findFirst({
            where:{
                email: email
            }
        })

        const newConfig = await prisma.autoReports.upsert({
            where: {
                userId_ReportName_ProjectTeam: { 
                    userId: user.userId,
                    ReportName: reportName,
                    ProjectTeam: projectTeam
                  },
            },
            update: {
              ProjectTeam: projectTeam,
              ReportDuration: reportDuration,
              ReportTime: time + period, 
            },
            create: {
              ReportName: reportName,
              ReportTime: time + period,
              ReportDuration: reportDuration,
              ProjectTeam: projectTeam,
              userId: user.userId,
            },
          });
  
          res.status(200).json({
            status: "success",
            message: "Configuration uploaded successfully"
          })
    } catch (error) {
      console.error(error);
      return next(new AppError("There was an error uploading configuration", 400));
    }
  });

export const getAutoReportConfig = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  try {

    const user = await prisma.user.findFirst({
        where: {
            email: email
        }
    })

    const autoReports = await prisma.autoReports.findMany({
      where: {
        userId: user.userId
      }
    });
    res.json(autoReports);
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }
});

export const deleteAutoReportConfig = catchAsync(async (req, res, next) => {
  const { reportId } = req.query;
  try {
  
    const autoReports = await prisma.autoReports.delete({
      where: {
        id: Number(reportId)
      }
    });
    return next(new SuccessResponse("Record Deleted Successfully",200))
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }
});