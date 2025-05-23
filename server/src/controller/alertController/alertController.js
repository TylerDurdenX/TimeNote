import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import SuccessResponse from "../../utils/SuccessResponse.js";

export const getAlerts = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      const alerts = await prisma.alert.findMany({
        where: {
          userId: user.userId,
        },
      });

      res.json(alerts);
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("There was an error fetching alerts", 400));
  }
});

export const deleteAlert = catchAsync(async (req, res, next) => {
  const { alertId } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const alert = await prisma.alert.delete({
        where: {
          id: Number(alertId),
        },
      });

      return next(new SuccessResponse("Record Deleted Successfully", 200));
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Error Occurred while deleting error: ${error.message}`,
    });
  }
});

export const createActiveTimeAlert = catchAsync(async (req, res, next) => {
  const { email, activeTime } = req.body;
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
        const alertConfig = await prisma.alertsConfigurations.create({
          data: {
            type: "ActiveTimeAlert",
            description:
              "Will be triggered for any user having less active hours",
            time: activeTime,
            name: "Active Time Alert",
            userRoles: "ADMIN",
            userId: user.userId,
            alertTriggeredFlag: false,
          },
        });

        return next(
          new SuccessResponse("Configuration saved successfully", 200)
        );
      } else if (user.roles.some((role) => role.code === "TEAM_LEAD")) {
        const alertConfig = await prisma.alertsConfigurations.create({
          data: {
            type: "ActiveTimeAlert",
            name: "Active Time Alert",
            description:
              "Will be triggered for any user having less active hours",
            time: activeTime,
            userRoles: "TEAM_LEAD",
            userId: user.userId,
            alertTriggeredFlag: false,
          },
        });

        return next(
          new SuccessResponse("Configuration saved successfully", 200)
        );
      }
    });
  } catch (error) {
    console.log(error);
    return next(
      new AppError("There was an error creating ACtive Time alert", 400)
    );
  }
});

export const getConfiguredAlerts = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      const configuredAlerts = await prisma.alertsConfigurations.findMany({
        where: {
          userId: user.userId,
        },
      });

      res.status(200).json(configuredAlerts);
    });
  } catch (error) {
    console.log(error);
    return next(
      new AppError("There was an error creating ACtive Time alert", 400)
    );
  }
});

export const deleteAlertConfiguration = catchAsync(async (req, res, next) => {
  const { alertId } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const deleteConfig = await prisma.alertsConfigurations.delete({
        where: {
          id: Number(alertId),
        },
      });

      return next(new SuccessResponse("Record deleted successfuly", 200));
    });
  } catch (error) {
    console.log(error);
    return next(
      new AppError("There was an error creating ACtive Time alert", 400)
    );
  }
});

export const updateAlertConfiguration = catchAsync(async (req, res, next) => {
  const {
    id,
    activeHours,
    timesheetHours,
    completionPercentage,
    email,
    alertType,
  } = req.body;
  try {
    await prisma.$transaction(async (prisma) => {
      if (alertType === "ActiveTimeAlert") {
        const updatedAlertConfig = await prisma.alertsConfigurations.update({
          where: {
            id: Number(id),
          },
          data: {
            time: activeHours,
          },
        });
      } else if (alertType === "TimesheetAlert") {
        const updatedAlertConfig = await prisma.alertsConfigurations.update({
          where: {
            id: Number(id),
          },
          data: {
            time: timesheetHours,
          },
        });
      } else if (alertType === "ProjectTimelineAlert") {
        const updatedAlertConfig = await prisma.alertsConfigurations.update({
          where: {
            id: Number(id),
          },
          data: {
            percentageCompletion: completionPercentage,
            description: `Will be triggered for any project having less Progress than ${completionPercentage}% after completion of ${completionPercentage}% project time`,
          },
        });
      }

      return next(new SuccessResponse("Record updated successfuly", 200));
    });
  } catch (error) {
    console.log(error);
    return next(
      new AppError("There was an error creating ACtive Time alert", 400)
    );
  }
});

export const createTimesheetAlert = catchAsync(async (req, res, next) => {
  const { email, timesheetHours } = req.body;
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
        const alertConfig = await prisma.alertsConfigurations.create({
          data: {
            type: "TimesheetAlert",
            description:
              "Will be triggered for any user having less logged hours",
            time: timesheetHours,
            name: "Timesheet Alert",
            userRoles: "ADMIN",
            userId: user.userId,
            alertTriggeredFlag: false,
          },
        });

        return next(
          new SuccessResponse("Configuration saved successfully", 200)
        );
      } else if (user.roles.some((role) => role.code === "TEAM_LEAD")) {
        const alertConfig = await prisma.alertsConfigurations.create({
          data: {
            type: "TimesheetAlert",
            name: "Timesheet Alert",
            description:
              "Will be triggered for any user having less logged hours",
            time: activeTime,
            userRoles: "TEAM_LEAD",
            userId: user.userId,
            alertTriggeredFlag: false,
          },
        });

        return next(
          new SuccessResponse("Configuration saved successfully", 200)
        );
      }
    });
  } catch (error) {
    console.log(error);
    return next(
      new AppError("There was an error creating ACtive Time alert", 400)
    );
  }
});

export const createProjectTimelineAlert = catchAsync(async (req, res, next) => {
  const { email, completionPercentage } = req.body;
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
        const alertConfig = await prisma.alertsConfigurations.create({
          data: {
            type: "ProjectTimelineAlert",
            description: `Will be triggered for any project having less Progress than ${completionPercentage}% after completion of ${completionPercentage}% project time`,
            percentageCompletion: completionPercentage,
            name: "Project Timeline Alert",
            userRoles: "ADMIN",
            userId: user.userId,
            alertTriggeredFlag: false,
          },
        });

        return next(
          new SuccessResponse("Configuration saved successfully", 200)
        );
      } else if (user.roles.some((role) => role.code === "PROJECT_MANAGER")) {
        const alertConfig = await prisma.alertsConfigurations.create({
          data: {
            type: "ProjectTimelineAlert",
            name: "Project Timeline Alert",
            description: `Will be triggered for any project having less Progress than ${completionPercentage}% after completion of ${completionPercentage}% project time`,
            percentageCompletion: completionPercentage,
            userRoles: "PROJECT_MANAGER",
            userId: user.userId,
            alertTriggeredFlag: false,
          },
        });

        return next(
          new SuccessResponse("Configuration saved successfully", 200)
        );
      }
    });
  } catch (error) {
    console.log(error);
    return next(
      new AppError("There was an error creating ACtive Time alert", 400)
    );
  }
});
