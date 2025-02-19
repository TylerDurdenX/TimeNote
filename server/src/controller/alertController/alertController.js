import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import SuccessResponse from "../../utils/SuccessResponse.js";

export const getAlerts = catchAsync(async (req, res, next) => {
    const { email } = req.query;
    try {
      await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
          where:{
            email: email
          }
        })
  
      const alerts = await prisma.alert.findMany({
        where:{
          userId: user.userId
        }
      })
  
      res.json(alerts);
    })
    } catch (error) {
      console.error(error);
      return next(new AppError("There was an error fetching alerts", 400));
    }
  });

  export const deleteAlert = catchAsync(async (req, res, next) => {
    const { alertId } = req.query;
    try {
      await prisma.$transaction(async (prisma) => {

      const alert = await prisma.alert.delete({
        where:{
          id: Number(alertId)
        }
      })
  
      return next(new SuccessResponse("Record Deleted Successfully",200))
    })
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: `Error Occurred while deleting error: ${error.message}` });
    }
  });