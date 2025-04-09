import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import moment from "moment-timezone";

export const getUsersGeoData = catchAsync(async (req, res, next) => {
  const { date } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      const isoDate = moment
        .tz(date, "Asia/Kolkata")
        .startOf("day")
        .toISOString();

      const attendance = await prisma.attendance.findMany({
        where: {
          date: isoDate,
        },
      });

      let resultList = [];

      attendance.map((attendanceObj) => {
        const numbers = attendanceObj.geoLocation
          ? attendanceObj.geoLocation.split(",").map(Number)
          : [0, 0];

        const const1 = numbers[0];
        const const2 = numbers[1];
        const const3 = 1;
        const const4 = attendanceObj.username;
        const const5 = "";
        const userArray = [const1, const2, const3, const4, const5];
        resultList.push(userArray);
      });

      res.status(200).json(resultList);
    });
  } catch (error) {
    console.log(error);
    return next(
      new AppError("Error during Getting Users Geo Location data", 500)
    );
  }
});
