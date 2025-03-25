import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import { isEmpty } from "../../utils/genericMethods.js";

export const createBreak = catchAsync(async (req, res, next) => {
    const { email, breakName,breakDescription,breakCode ,breakTimeInMinutes } = req.body;
    try {
      await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
          where:{
            email: email
          },
          include:{
            roles: true
          }
        })

        if (user.roles.some((role) => role.code === "ADMIN") || user.roles.some((role) => role.code === "TEAM_LEAD")) {
            const breakType = await prisma.breakType.create({
                data:{
                    breakName: breakName,
                    breakCode: breakCode,
                    breakDescription: breakDescription,
                    breakTimeInMinutes: breakTimeInMinutes
                }
            })

            return next(new SuccessResponse('Break Created Successfully',200))
        }else{
            return next(new AppError('User not authorized to create breaks',500))
        }
    })
    } catch (error) {
      console.log(error);
      return next(new AppError("There was an error creating break", 400));
    }
  });

  export const deleteBreak = catchAsync(async (req, res, next) => {
    const { breakId } = req.query;
    try {
      await prisma.$transaction(async (prisma) => {

      const breakType = await prisma.breakType.delete({
        where:{
          id: Number(breakId)
        }
      })
  
      return next(new SuccessResponse("Record Deleted Successfully",200))
    })
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: `Error Occurred while deleting record: ${error.message}` });
    }
  });

  export const getBreaksList = catchAsync(async (req, res, next) => {
    const { email } = req.query;
    try {
      await prisma.$transaction(async (prisma) => {

      const user = await prisma.user.findFirst({
        where:{
          email: email
        }, include:{
            roles: true
        }
      })

      let resultList = []

      if (user.roles.some((role) => role.code === "ADMIN") || user.roles.some((role) => role.code === "TEAM_LEAD")) {
        resultList = await prisma.breakType.findMany(
            )
        return res.status(200).json(resultList)

    }else{
        return res.status(200).json(resultList)
    }
  
      return next(new SuccessResponse("Record Deleted Successfully",200))
    })
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: `Error Occurred while deleting record: ${error.message}` });
    }
  });

  export const updateBreak = catchAsync(async (req, res, next) => {
    const { email, breakId, breakName, breakDescription, breakTimeInMinutes } = req.body;
    try {
      await prisma.$transaction(async (prisma) => {

      const user = await prisma.user.findFirst({
        where:{
          email: email
        }, include:{
            roles: true
        }
      })

      if (user.roles.some((role) => role.code === "ADMIN") || user.roles.some((role) => role.code === "TEAM_LEAD")) {
       const updatedBreak = await prisma.breakType.update({
        where:{
          id: Number(breakId)
        },data:{
          breakName: breakName,
          breakDescription: breakDescription,
          breakTimeInMinutes: breakTimeInMinutes
        }
       })
       return next(new SuccessResponse('Record Updated Successfully',200))
    }else{
      return next(new AppError('User not authorized to Update breaks',500))
    }
  
      return next(new SuccessResponse("Record Deleted Successfully",200))
    })
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: `Error Occurred while deleting record: ${error.message}` });
    }
  });

  export const updateBreakTime = catchAsync(async (req, res, next) => {
    const { email, breakTypeCode, breakTypeName,customBreakType, startTime,endTime, breakId } = req.body;
  
    try {
      await prisma.$transaction(async (prisma) => {
        const user = await prisma.user.findFirst({
          where: {
            email: email,
          }
        });

        const todayDate = new Date()
        todayDate.setHours(0,0,0,0)
        const indianTimeISOString = todayDate.toISOString();

        const attendance = await prisma.attendance.findFirst({
          where:{
            userId: user.userId,
            date: indianTimeISOString
          }
        })

        let resultBreakId = 0

        if(breakTypeCode !== 'CUSTOM_BREAK' ){
          const breakType = await prisma.breakType.findFirst({
            where:{
              breakCode: breakTypeCode
            }
          })
          if(!isEmpty(startTime)){
          const breakTaken = await prisma.breaks.create({
            data:{
              userId: user.userId,
              startTime: startTime,
              date: indianTimeISOString,
              attendanceId: attendance.id,
              breakTypeCode: breakTypeCode,
              breakTypeName: breakTypeName,
              breakTypeId: breakType.id,
            }
          })

          resultBreakId = breakTaken.id
        }else{
          const breakTaken = await prisma.breaks.update({
            where:{
              id: Number(breakId)
            },
            data:{
              endTime: endTime,
              breakTimeInMinutes: breakTime
            }
          })
        }
        resultBreakId = breakTaken.id
        }else{
          if(!isEmpty(startTime)){
            const breakTaken = await prisma.breaks.create({
              data:{
                userId: user.userId,
                startTime: startTime,
                date: indianTimeISOString,
                attendanceId: attendance.id,
                breakTypeCode: 'CUSTOM_BREAK',
                breakTypeName: customBreakType,
              }
            })
  
            resultBreakId = breakTaken.id
          }else{

            const breakTime = await prisma.breaks.findFirst({
              where:{
                id: Number(breakId)
              },select:{
                startTime: true
              }
            })

            const startDate = new Date(breakTime.startTime);
            const endDate = new Date(endTime);

            // Calculate the difference in milliseconds
            const differenceInMilliseconds = endDate - startDate;

            // Convert milliseconds to seconds
            const differenceInSeconds = differenceInMilliseconds / 1000;
            console.log("Difference in milliseconds:", differenceInMilliseconds);
            console.log("Difference in seconds:", differenceInSeconds);

            const breakTimeInMinutes = String(Math.floor(differenceInSeconds / 60))
            const remainingSeconds = breakTimeInMinutes % 60;
            console.log(breakTimeInMinutes)
            console.log(remainingSeconds)
            const breakTaken = await prisma.breaks.update({
              where:{
                id: Number(breakId)
              },
              data:{
                endTime: endTime,
                breakTimeInMinutes: `${breakTimeInMinutes}:${remainingSeconds}`
              }
            })
        }
      }

        const result = {
          status: "Success",
          breakId: resultBreakId
        }
      res.status(200).json(result)
      });
    } catch (error) {
      console.log(error);
      return next(new AppError("Error during updating attendance records", 500));
    }
  });