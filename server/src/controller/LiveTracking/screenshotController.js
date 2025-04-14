import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import { formatTime } from "../attendanceController/attendanceController.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import { isEmpty } from "../../utils/genericMethods.js";

export const addscreenshots = catchAsync(async (req, res, next) => {
  const { email, screenshots } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    function convertTime(time) {
      // Example: converts "14:30" => "14:30:00"
      const date = new Date(time);

      // Format the time as HH:mm (24-hour format)
      const hours = String(date.getHours()).padStart(2, "0"); // Ensure 2 digits for hours
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const formattedTime = `${hours}:${minutes}`;
      return formattedTime;
    }

    if (!isEmpty(screenshots)) {
      screenshots.map((screenshot) => {
        const date = new Date(screenshot.time);

        // Format the time as HH:mm (24-hour format)
        const hours = String(date.getHours()).padStart(2, "0"); // Ensure 2 digits for hours
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const formattedTime = `${hours}:${minutes}`;
      });
    }

    const formattedScreenshots = screenshots.map((screenshot) => ({
      username: user.username,
      time: convertTime(screenshot.time), // convert the time here
      base64: screenshot.base64, // use the base64 string directly
      date: screenshot.time, // assuming `time` is a date variable you're using
      userId: user.userId, // save the foreign key manually
    }));

    const newScreenshots = await prisma.screenshots.createMany({
      data: formattedScreenshots,
      skipDuplicates: true, // optional
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
        orderBy: {
          date: "desc", // Replace 'createdAt' with the field you want to sort by
        },
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
        orderBy: {
          date: "desc", // Replace 'createdAt' with the field you want to sort by
        },
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

export const getFlaggedScreenshots = catchAsync(async (req, res, next) => {
  const { userId, page = 1, limit = 20 } = req.query;

  try {
    if (Number(userId) === 0) {
      const filters = {};

      const screenshotsCount = await prisma.screenshots.count({
        where: {
          flag: true,
        },
      });
      const screenshotList = await prisma.screenshots.findMany({
        where: {
          flag: true,
        },
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: {
          date: "desc", // Replace 'createdAt' with the field you want to sort by
        },
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
        flag: true,
      };

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

export const updateScreenshot = catchAsync(async (req, res, next) => {
  const { id, flag } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      let actualFlag =
        flag === "false" || flag === "null" || flag === "undefined"
          ? false
          : flag;

      if (!actualFlag) {
        await prisma.screenshots.update({
          where: {
            id: Number(id),
          },
          data: {
            flag: true,
          },
        });
      } else {
        await prisma.screenshots.update({
          where: {
            id: Number(id),
          },
          data: {
            flag: false,
          },
        });
      }

      return next(
        new SuccessResponse("Screenshot flag updated Successfully!", 200)
      );
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("There was an error fetching screenshots", 400));
  }
});
