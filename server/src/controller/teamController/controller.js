import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";

export const createTeam = catchAsync(async (req, res, next) => {
    const {name, description} = req.body
    try {
      const result = await prisma.$transaction(async (prisma) => {

      const newTeam = await prisma.team.create({
            data:{
              name, description 
            }
          })
  
          res.status(200).json({
            status: "success",
            message: "Team created successfully"
          })
        })
    } catch (error) {
      console.error('Error during createTeam' + error);
      return next(new AppError("There was an error getting Users List", 400));
    }
  });