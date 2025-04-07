import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import { formatTime } from "../attendanceController/attendanceController.js";
import SuccessResponse from "../../utils/SuccessResponse.js";

export const addscreenshots = catchAsync(async (req, res, next) => {
  const { email, base64, time } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    const date = new Date(time);

    // Format the time as HH:mm (24-hour format)
    const hours = String(date.getHours()).padStart(2, "0"); // Ensure 2 digits for hours
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const formattedTime = `${hours}:${minutes}`;

    const newScreenshot = await prisma.screenshots.create({
      data: {
        username: user.username,
        time: formattedTime,
        base64: base64,
        date: time,
        user: {
          connect: { userId: user.userId },
        },
      },
    });

    return next(new SuccessResponse("Screenshot saved successfully", 200));
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error saving screenshot", 400));
  }
});

export const getScreenshots = catchAsync(async (req, res, next) => {
  const { userId, page = 1, limit = 12, from, to } = req.query;

  try {
    if (Number(userId) === 0) {
      const filters = {};

      if (from && from !== "2000-01-01T00:00:00Z") {
        filters.date = {
          gte: new Date(from),
          lte: to ? new Date(to) : undefined,
        };
      }

      const screenshotsCount = await prisma.screenshots.count({
        where: filters,
      });
      const screenshotList = await prisma.screenshots.findMany({
        where: filters,
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });

      const totalPages = Math.ceil(screenshotsCount / limit);

      res.status(200).json({
        screenshotList,
        totalPages,
        currentPage: page,
        totalItems: screenshotsCount,
        limit,
      });
    } else {
      const user = await prisma.user.findFirst({
        where: {
          userId: Number(userId),
        },
      });

      if (!user) {
        return next(new AppError("User Not Found", 404));
      }

      const filters = {
        userId: user.userId,
      };

      if (from && from !== "2000-01-01T00:00:00Z") {
        filters.date = {
          gte: new Date(from),
          lte: to ? new Date(to) : undefined,
        };
      }

      const screenshotsCount = await prisma.screenshots.count({
        where: filters,
      });
      const screenshotList = await prisma.screenshots.findMany({
        where: filters,
        skip: (page - 1) * limit,
        take: parseInt(limit),
      });

      const totalPages = Math.ceil(screenshotsCount / limit);

      res.status(200).json({
        screenshotList,
        totalPages,
        currentPage: page,
        totalItems: screenshotsCount,
        limit,
      });
    }
  } catch (error) {
    console.log(error);
    return next(new AppError("There was an error fetching screenshots", 400));
  }
});
