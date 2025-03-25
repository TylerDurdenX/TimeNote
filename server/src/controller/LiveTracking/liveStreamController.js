import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import { isEmpty } from "../../utils/genericMethods.js";

export const getUsersForUserFilter = catchAsync(async (req, res, next) => {
    const { email } = req.query;
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          roles: true,
        },
      });
  
      if (user.roles.some((role) => role.code === "ADMIN")) {
        return res.status(200).json(
          await prisma.user.findMany({
            select: {
              username: true,
              email: true,
            },
          })
        );
      } else {
        // Case to be handled in case of other users
      }
    } catch (error) {
      console.error(error);
      return next(new AppError("There was an error getting Users List", 400));
    }
  });

  export const getLiveStreamUsers = catchAsync(async (req, res, next) => {
    const { email, username } = req.query;
    try {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          roles: true,
        },
      });
  
      if (user.roles.some((role) => role.code === "ADMIN")) {
        let result =[]
        if(isEmpty(username)){
          result = await prisma.user.findMany({
            include: {
              screenshot: {
                orderBy: {
                  date: 'desc',
                },
                take: 1, // Only take the latest screenshot for each user
              },
            },
          })
          if(result){
            const expectedOutput = result.map(user => {
              return {
                email: user.email,  // Assuming you want the email without the domain part (you can adjust this)
                username: user.username,
                screenshot: user.screenshot.length > 0 ? { base64: user.screenshot[0].base64 } : {}
              };
            });
            return res.status(200).json(expectedOutput)
          }
        }else{
          result = await prisma.user.findMany({
            where: {
              username: username
            },
            include: {
              screenshot: {
                orderBy: {
                  date: 'desc',
                },
                take: 1, // Only take the latest screenshot for each user
              },
            },
          })
          if(result){
            const expectedOutput = result.map(user => {
              return {
                email: user.email,  // Assuming you want the email without the domain part (you can adjust this)
                username: user.username,
                screenshot: user.screenshot.length > 0 ? { base64: user.screenshot[0].base64 } : {}
              };
            });
            return res.status(200).json(expectedOutput)
          }
        }

        return next(new AppError("No result", 302))
      } else {
        // Case to be handled in case of other users
      }
    } catch (error) {
      console.error(error);
      return next(new AppError("There was an error getting Users List", 400));
    }
  });