import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";

export const createProject = catchAsync(async (req, res, next) => {
    const {name, description} = req.body
    try {
      const newProject = await prisma.project.create({
            data:{
              name, description 
            }
          })
  
          res.status(200).json({
            status: "success",
            message: "Project created successfully"
          })
    } catch (error) {
      console.error(error);
      return next(new AppError("There was an error getting Users List", 400));
    }
  });