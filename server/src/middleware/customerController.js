import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { prisma } from "../server.js";
import SuccessResponse from "../utils/SuccessResponse.js";

  export const updateCustomerData = catchAsync(async (req, res, next) => {
    const {customerName, allowedUserCount, plan} = req.body;

    try {
      await prisma.$transaction(async (prisma) => {

        const customer = await prisma.customer.upsert({
            where:{
              Cust_name: customerName 
            },
            update:{
              Cust_name: customerName,
              Plan: plan,
              Allowed_User_Count: String(allowedUserCount)
            },
            create: {
              Cust_name: customerName,
              Plan: plan,
              Allowed_User_Count: String(allowedUserCount),
            }
          })
       
          return next(new SuccessResponse("Record Updated successfully",200))

      })
    } catch (error) {
      console.log('Error during updating customer details' + error)
      return next(new AppError('Error during updating customer details',500))
    }
  });