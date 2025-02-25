import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";

export const addscreenshots = catchAsync(async (req, res, next) => {
    const {email, base64, time, } = req.body
    try {

        const user = await prisma.user.findUnique({
            where: { email: email },
          });
          console.log(user.username)
      const newScreenshot = await prisma.screenshots.create({
            data:{
              username : user.username,
              time: time,
              base64: base64,
              date: new Date('2025-01-29T00:00:00Z'),
              user: {
                connect: { userId: user.userId }  
              },
            }
          })
  
          res.status(200).json({
            status: "success",
            message: "Screenshot saved successfully"
          })
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
  
        if (from && from !== '2000-01-01T00:00:00Z') {
          filters.date = {
            gte: new Date(from), 
            lte: to ? new Date(to) : undefined, 
          };
        }
  
        const screenshotsCount = await prisma.screenshots.count({ where: filters });
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
          return next(new AppError('User Not Found', 404));
        }
  
        const filters = {
          userId: user.userId,
        };
  
        if (from && from !== '2000-01-01T00:00:00Z') {
          filters.date = {
            gte: new Date(from), 
            lte: to ? new Date(to) : undefined, 
          };
        }
  
        const screenshotsCount = await prisma.screenshots.count({ where: filters });
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
      return next(new AppError('There was an error fetching screenshots', 400));
    }
  });
  
  
