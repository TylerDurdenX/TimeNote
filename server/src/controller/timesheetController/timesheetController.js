import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import { isEmpty } from "../../utils/genericMethods.js";


export const getTimesheetData = catchAsync(async (req, res, next) => {
    const { email} = req.query;
    try {
      await prisma.$transaction(async (prisma) => {

        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)); 
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const startOfDayIso = startOfDay.toISOString();
        const endOfDayIso = endOfDay.toISOString();

        const user = await prisma.user.findFirst({
          where: {
            email: email
          }
        })
  
        const timesheetData = await prisma.timesheet.findFirst({
            where: {
                    userId: user.userId,
                    date: {
                        gte: startOfDay, 
                        lte: endOfDay,
                    }
                
            }
        })

        const parsedData = parseData(timesheetData.task);
        console.log(parsedData)
        return res.status(200).json(parsedData)
      })
    } catch (error) {
      console.log(error)
      return next(new AppError('Error during getting Timesheet Entries',200))
    }
  });

  function parseData(inputString) {
    const objectsArray = inputString.split(',');
  
    const result = [];
    console.log(objectsArray)
    let id = 0
    objectsArray.forEach(item => {
        id = id+1
      const [projectId, taskCode, task, completionPercentage,consumedHours, approvalStatus] = item.split('#');
  
      result.push({
        id: id,
        projectId: projectId ? projectId.trim() : projectId,
        taskCode: taskCode ? taskCode.trim(): taskCode,
        task: task ? task.trim(): task,
        completionPercentage: completionPercentage ? completionPercentage.trim(): completionPercentage,
        consumedHours: consumedHours ? consumedHours.trim() : consumedHours,
        approvalStatus: approvalStatus ? approvalStatus.trim(): approvalStatus
      });
    });
  
    return result;
  }