import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import { isEmpty } from "../../utils/genericMethods.js";

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
              user: {
                connect: { userId: user.userId }  // Nested object to connect to the existing user.
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


export const getScreenshots = catchAsync(async(req, res, next) => {
    const {email} = req.query
    
    

    
  
    try {
      if(isEmpty(email)){
        const screenshotList = await prisma.screenshots.findMany({
          take: 10, // This limits the result to 10 rows
        });
  
        res.status(200).json(screenshotList)
  
      
    }
    } catch (error) {
      console.log(error)
      return next(new AppError('There was an error fetching user details', 400))
    }
  
  })
