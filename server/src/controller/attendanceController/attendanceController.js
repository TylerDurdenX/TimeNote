import catchAsync from "../../utils/catchAsync.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import AppError from "../../utils/appError.js";
import { isEmpty } from "../../utils/genericMethods.js";
import { prisma } from "../../server.js";

  export const updateAttendance = catchAsync(async (req, res, next) => {
    const {punchInTime, punchOutTime, email} = req.body;

    try {
      await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
            where: {
                email: email
            },
            include: {
                profilePicture: true
            }
        })

        const currentDateTime = new Date();
        currentDateTime.setHours(0, 0, 0, 0);
        const indianTimeISOString = currentDateTime.toISOString();

        if(!isEmpty(punchInTime)){
            const attendance = await prisma.attendance.create({
                data: {
                    userId: user.userId,
                    punchInTime: punchInTime,
                    date: indianTimeISOString
                }
            })
        }else{
            const attendance = await prisma.attendance.update({
                where: {
                    userId_date : {
                        userId: user.userId,
                        date: indianTimeISOString
                    }
                },
                data: {
                    punchOutTime: punchOutTime
                }
            })
        }

          return next(new SuccessResponse("Record Updated successfully",200))

      })
    } catch (error) {
      console.log('Error during updating attendance records' + error)
      return next(new AppError('Error during updating attendance records',500))
    }
  });