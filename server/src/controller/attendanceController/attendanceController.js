import catchAsync from "../../utils/catchAsync.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import AppError from "../../utils/appError.js";
import { isEmpty } from "../../utils/genericMethods.js";
import { prisma } from "../../server.js";
import { startOfMonth, endOfMonth } from "date-fns";
import moment from 'moment-timezone';

export const updateAttendance = catchAsync(async (req, res, next) => {
  const { punchInTime, punchOutTime, email } = req.body;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          profilePicture: true,
        },
      });

      const currentDateTime = new Date();
      currentDateTime.setHours(0, 0, 0, 0);
      const todayDate = moment().tz('Asia/Kolkata').startOf('day');
      const indianTimeISOString = todayDate.toISOString();

      if (!isEmpty(punchInTime)) {
        const createdAttendance = await prisma.attendance.findFirst({
          where:{
            userId: user.userId,
            date: indianTimeISOString
          }
        })
        if(isEmpty(createdAttendance)){
          const attendance = await prisma.attendance.create({
            data: {
              userId: user.userId,
              username: user.username,
              punchInTime: punchInTime,
              date: indianTimeISOString,
            },
          });
          return next(new SuccessResponse("Record Updated successfully", 200));
        }else{
          return next(new SuccessResponse("Record Updated successfully", 200));

          //return next(new AppError('User Already Punched in',500))
        }
      } else {
        const attendance = await prisma.attendance.update({
          where: {
            userId_date: {
              userId: user.userId,
              date: indianTimeISOString,
            },
          },
          data: {
            punchOutTime: punchOutTime,
          },
        });

        const pendingTasks = await prisma.task.findMany({
          where: {
            assignedUserId: user.userId
          }
        })

        let pendingTaskList = []

        pendingTasks.map((task) => {
          if((task.status === 'Work In Progress') || (task.status === 'Under Review') || (task.status === 'Completed') ){
            const pendingTaskEntry = {
              taskname: task.title,
              taskCode:task.code,
              taskDescription: task.description,
              taskId: task.id
            }
            pendingTaskList.push(pendingTaskEntry)
          }
        })

        if(!isEmpty(pendingTaskList)){
          const result = {
            status: "Success",
            error: null,
            message: "Tasks",
            stack: pendingTaskList,
          }

          res.status(200).json(result)
        }else{
          const result = {
            status: "Success",
            error: null,
            message: "Record Updated successfully",
            stack: null,
          }
        }

        return next(new SuccessResponse("Record Updated successfully", 200));

      }
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during updating attendance records", 500));
  }
});

export const getAttendanceData = catchAsync(async (req, res, next) => {
  const { email, title } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          roles: true,
        },
      });

      if (user.roles.some((role) => role.code === "ADMIN")) {
        const customer = await prisma.customer.findFirst();

        const currentDateTime = new Date();
        currentDateTime.setHours(0, 0, 0, 0);
        const todayDate = moment().tz('Asia/Kolkata').startOf('day');
        const indianTimeISOString = todayDate.toISOString();

        const attendanceRecords = await prisma.attendance.findMany({
          where: {
            date: indianTimeISOString,
          },
        });

        const timeToMinutes = (time) => {
          const [hours, minutes] = time.split(":").map(Number);
          return hours * 60 + minutes;
        };

        const isDateTimeInRange = (timeRange, dateTime) => {
          // Parse the time range string into start and end times (e.g., "9:30-10:30" -> [9:30, 10:30])
          const [startTime, endTime] = timeRange.split("-");

          // Convert the start and end times into minutes for easy comparison
          const startMinutes = timeToMinutes(startTime);
          const endMinutes = timeToMinutes(endTime);

          // Convert the Prisma DateTime string to a JavaScript Date object
          const date = new Date(dateTime);

          // Get the minutes from the Prisma DateTime
          const currentMinutes = date.getHours() * 60 + date.getMinutes();

          // Check if the current time is before the start time or after the end time
          if (currentMinutes < startMinutes) {
            return "Before Start Time"; // Before Start Time
          } else if (currentMinutes > endMinutes) {
            return "After End Time"; // 'After End Time'
          } else {
            return "Within Time Range"; //'Within Time Range'
          }
        };

        if (title === "On Time Arrivals") {
          let record = 0;
          const workStartTime = 9;
          const workEndTime = 18;

          const usersList = await prisma.user.findMany();

          attendanceRecords.map((attendance) => {
            usersList.map((user) => {
              if (user.userId === attendance.userId) {
                if (
                  user.workingHours !== null &&
                  user.workingHours !== undefined &&
                  !isEmpty(user.workingHours)
                ) {
                  const prismaDateTime = attendance.punchInTime;
                  const timeRange = user.workingHours;

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) ===
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                } else {
                  const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                  const timeRange = "9:00-18:00";

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) ===
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                }
              }
            });
          });

          const result = {
            usersCount: record,
            totalUsersCount: customer.Allowed_User_Count,
          };

          return res.status(200).json(result);
        } else if (title === "Late Arrivals") {
          let record = 0;
          const workStartTime = 9;
          const workEndTime = 18;

          const usersList = await prisma.user.findMany();

          attendanceRecords.map((attendance) => {
            usersList.map((user) => {
              if (user.userId === attendance.userId) {
                if (
                  user.workingHours !== null &&
                  user.workingHours !== undefined &&
                  !isEmpty(user.workingHours)
                ) {
                  const prismaDateTime = attendance.punchInTime;
                  const timeRange = user.workingHours;

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) !==
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                } else {
                  const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                  const timeRange = "9:00-18:00";

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) !==
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                }
              }
            });
          });

          const result = {
            usersCount: record,
            totalUsersCount: customer.Allowed_User_Count,
          };

          return res.status(200).json(result);
        }
      }

      const result = {
        usersCount: 0,
        totalUsersCount: 0,
      };

      return res.status(200).json(result);
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("Error during calculating attendance data", 500));
  }
});

export const getAttendanceLCData = catchAsync(async (req, res, next) => {
  const { email, title } = req.query;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      include: {
        roles: true,
      },
    });
    const getPreviousWeekdays = () => {
      const weekdays = []; // To store the weekdays
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 for comparison

      // Start from the current date and look backward
      let dateIterator = new Date(currentDate);

      // Loop until we get 5 weekdays
      while (weekdays.length < 5) {
        // Get the current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const dayOfWeek = dateIterator.getDay();

        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // If it's a weekday, push it to the weekdays array in ISOString format
          weekdays.push(dateIterator.toISOString());
        }

        // Move to the previous day
        dateIterator.setDate(dateIterator.getDate() - 1);
      }

      // Reverse to make the order ascending from Monday to Friday
      return weekdays.reverse();
    };

    // Get the previous 5 weekdays in ISOString format
    const previousWeekdays = getPreviousWeekdays();

    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const isDateTimeInRange = (timeRange, dateTime) => {
      // Parse the time range string into start and end times (e.g., "9:30-10:30" -> [9:30, 10:30])
      const [startTime, endTime] = timeRange.split("-");

      // Convert the start and end times into minutes for easy comparison
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);

      // Convert the Prisma DateTime string to a JavaScript Date object
      const date = new Date(dateTime);

      // Get the minutes from the Prisma DateTime
      const currentMinutes = date.getHours() * 60 + date.getMinutes();

      // Check if the current time is before the start time or after the end time
      if (currentMinutes < startMinutes) {
        return "Before Start Time"; // Before Start Time
      } else if (currentMinutes > endMinutes) {
        return "After End Time"; // 'After End Time'
      } else {
        return "Within Time Range"; //'Within Time Range'
      }
    };

    if (user.roles.some((role) => role.code === "ADMIN")) {
      let finalRresult = [];

      for (const previousWeekday of previousWeekdays) {
        const attendanceRecords = await prisma.attendance.findMany({
          where: {
            date: previousWeekday,
          },
        });

        if (title === "On Time Arrivals") {
          let record = 0;
          const workStartTime = 9;
          const workEndTime = 18;

          const usersList = await prisma.user.findMany();

          attendanceRecords.map((attendance) => {
            usersList.map((user) => {
              if (user.userId === attendance.userId) {
                if (
                  user.workingHours !== null &&
                  user.workingHours !== undefined &&
                  !isEmpty(user.workingHours)
                ) {
                  const prismaDateTime = attendance.punchInTime;
                  const timeRange = user.workingHours;

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) ===
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                } else {
                  const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                  const timeRange = "9:00-18:00";

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) ===
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                }
              }
            });
          });

          const date = new Date(previousWeekday); // Parse the ISO string into a Date object

          const day = String(date.getDate()).padStart(2, "0"); // Get day and ensure two digits
          const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month and ensure two digits (months are 0-indexed)
          const year = date.getFullYear();

          const result = {
            date: `${day}/${month}/${year}`,
            count: record,
          };
          finalRresult.push(result);
        } else if (title === "Late Arrivals") {
          let record = 0;
          const workStartTime = 9;
          const workEndTime = 18;

          const usersList = await prisma.user.findMany();

          attendanceRecords.map((attendance) => {
            usersList.map((user) => {
              if (user.userId === attendance.userId) {
                if (
                  user.workingHours !== null &&
                  user.workingHours !== undefined &&
                  !isEmpty(user.workingHours)
                ) {
                  const prismaDateTime = attendance.punchInTime;
                  const timeRange = user.workingHours;

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) !==
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                } else {
                  const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
                  const timeRange = "9:00-18:00";

                  if (
                    isDateTimeInRange(timeRange, prismaDateTime) !==
                    "Before Start Time"
                  ) {
                    record = record + 1;
                  }
                }
              }
            });
          });
          const date = new Date(previousWeekday); // Parse the ISO string into a Date object

          const day = String(date.getDate()).padStart(2, "0"); // Get day and ensure two digits
          const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month and ensure two digits (months are 0-indexed)
          const year = date.getFullYear();

          const result = {
            date: `${day}/${month}/${year}`,
            count: record,
          };

          finalRresult.push(result);
        }
      }
      return res.status(200).json(finalRresult);
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("Error during calculating attendance data", 500));
  }
});

export const getUserAttendanceData = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      const startOfCurrentMonth = startOfMonth(new Date());
      const endOfCurrentMonth = endOfMonth(new Date());

      const currentDateTime = new Date();
      currentDateTime.setHours(0, 0, 0, 0);
      const todayDate = moment().tz('Asia/Kolkata').startOf('day');
      const indianTimeISOString = todayDate.toISOString();

      let onTimeCount = 0;
      let lateCount = 0;

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          date: {
            gte: startOfCurrentMonth, // greater than or equal to the start of the current month
            lte: endOfCurrentMonth,
          },
        },
      });

      const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
      };

      const isDateTimeInRange = (timeRange, dateTime) => {
        // Parse the time range string into start and end times (e.g., "9:30-10:30" -> [9:30, 10:30])
        const [startTime, endTime] = timeRange.split("-");

        // Convert the start and end times into minutes for easy comparison
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);

        // Convert the Prisma DateTime string to a JavaScript Date object
        const date = new Date(dateTime);

        // Get the minutes from the Prisma DateTime
        const currentMinutes = date.getHours() * 60 + date.getMinutes();

        // Check if the current time is before the start time or after the end time
        if (currentMinutes < startMinutes) {
          return "Before Start Time"; // Before Start Time
        } else if (currentMinutes > endMinutes) {
          return "After End Time"; // 'After End Time'
        } else {
          return "Within Time Range"; //'Within Time Range'
        }
      };

      if (true) {
        let record = 0;
        const workStartTime = 9;
        const workEndTime = 18;

        attendanceRecords.map((attendance) => {
          if (user.userId === attendance.userId) {
            if (
              user.workingHours !== null &&
              user.workingHours !== undefined &&
              !isEmpty(user.workingHours)
            ) {
              const prismaDateTime = attendance.punchInTime;
              const timeRange = user.workingHours;

              if (
                isDateTimeInRange(timeRange, prismaDateTime) ===
                "Before Start Time"
              ) {
                record = record + 1;
              }
            } else {
              const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
              const timeRange = "9:00-18:00";

              if (
                isDateTimeInRange(timeRange, prismaDateTime) ===
                "Before Start Time"
              ) {
                record = record + 1;
              }
            }
          }
        });

        onTimeCount = record;
      }
      if (true) {
        let record = 0;
        const workStartTime = 9;
        const workEndTime = 18;

        attendanceRecords.map((attendance) => {
          if (user.userId === attendance.userId) {
            if (
              user.workingHours !== null &&
              user.workingHours !== undefined &&
              !isEmpty(user.workingHours)
            ) {
              const prismaDateTime = attendance.punchInTime;
              const timeRange = user.workingHours;

              if (
                isDateTimeInRange(timeRange, prismaDateTime) !==
                "Before Start Time"
              ) {
                record = record + 1;
              }
            } else {
              const prismaDateTime = attendance.punchInTime; // Replace with your actual Prisma DateTime
              const timeRange = "9:00-18:00";

              if (
                isDateTimeInRange(timeRange, prismaDateTime) !==
                "Before Start Time"
              ) {
                record = record + 1;
              }
            }
          }
        });

        lateCount = record;
      }
      const result = {
        onTimeCount: onTimeCount,
        lateCount: lateCount,
      };

      return res.status(200).json(result);
    });
  } catch (error) {
    console.error(error);
    return next(
      new AppError("Error during getting user attendance PC data", 500)
    );
  }
});

const formatDate = (date) => {
    // Get day, month, and year from the Date object
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if day < 10
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based, so we add 1
    const year = date.getFullYear();
  
    // Return the formatted date as DD/MM/YYYY
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date) => {
    // Get hours, minutes, and seconds from the Date object
    const hours = String(date.getHours()).padStart(2, '0'); // Ensure two-digit format for hours
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Ensure two-digit format for minutes
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Ensure two-digit format for seconds
  
    // Return the formatted time as HH:mm:ss
    return `${hours}:${minutes}:${seconds}`;
  };

  const timeToSeconds = (time) => {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };
  
  const secondsToTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  
  const getTimeDifference = (startTime, endTime) => {
    const startTimeInSeconds = timeToSeconds(startTime);
    const endTimeInSeconds = timeToSeconds(endTime);
  
    // Calculate the difference
    const durationInSeconds = endTimeInSeconds - startTimeInSeconds;
  
    // If the result is negative, it means the end time is earlier than the start time (next day scenario)
    if (durationInSeconds < 0) {
      return "End time cannot be earlier than start time.";
    }
  
    // Convert the duration back to HH:mm:ss format
    return secondsToTime(durationInSeconds);
  };

export const getUserAttendanceTableData = catchAsync(async (req, res, next) => {
    const { email, adminFlag } = req.query;
  
    try {
      await prisma.$transaction(async (prisma) => {
        const user = await prisma.user.findFirst({
          where: {
            email: email,
          },
        });

        if(adminFlag === 'true'){
          let idList =[]

          const userIdList = await prisma.user.findMany({
            select: {
              userId: true
            }
          })

          userIdList.map((user) => {
            idList.push(user.userId)
          })
 
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isoDate = today.toISOString();
          const attendanceRecords = await prisma.attendance.findMany({
            where: {
              date: isoDate,
              userId: {
                in: idList
              },
            }
          });

          let finalResult = []
          let id = 1
  
          attendanceRecords.map((attendance) => {
              let inTime = 'NA'
              let outTime = 'NA'
              if(attendance.punchInTime){
                  inTime = formatTime(attendance.punchInTime)
              }
  
              if(attendance.punchOutTime){
                  outTime = formatTime(attendance.punchOutTime)
              }
              const result = {
                  id: id,
                  date: formatDate(attendance.date),
                  punchInTime: inTime,
                  punchOutTime: outTime,
                  username: attendance.username,
                  duration: getTimeDifference(inTime, outTime)
              }
              id= id+ 1
              finalResult.push(result)
          })
    
          return res.status(200).json(finalResult);

        }else{
          const startOfCurrentMonth = startOfMonth(new Date());
          const endOfCurrentMonth = endOfMonth(new Date());
    
          const attendanceRecords = await prisma.attendance.findMany({
            where: {
              date: {
                gte: startOfCurrentMonth, 
                lte: endOfCurrentMonth,
              },
              userId: user.userId
            },
          });
  
          let finalResult = []
          let id = 1
  
          attendanceRecords.map((attendance) => {
              let inTime = 'NA'
              let outTime = 'NA'
              if(attendance.punchInTime){
                  inTime = formatTime(attendance.punchInTime)
              }
  
              if(attendance.punchOutTime){
                  outTime = formatTime(attendance.punchOutTime)
              }
              const result = {
                  id: id,
                  date: formatDate(attendance.date),
                  punchInTime: inTime,
                  punchOutTime: outTime,
                  duration: getTimeDifference(inTime, outTime)
              }
              id= id+ 1
              finalResult.push(result)
          })
    
          return res.status(200).json(finalResult);
        }
  
      });
    } catch (error) {
      console.error(error);
      return next(
        new AppError("Error during getting user attendance PC data", 500)
      );
    }
  });

  export const getAdminRole = catchAsync(async (req, res, next) => {
    const { email } = req.query;
  
    try {
      await prisma.$transaction(async (prisma) => {
        const user = await prisma.user.findFirst({
          where: {
            email: email,
          },include: {
            roles: true
          }
        });

        if(user.roles.some((role) => role.code === "ADMIN")){
          const result = {
            admin: true
          }
          return res.status(200).json(result);

        }else{
          const result = {
            admin: false
          }
          return res.status(200).json(result);
        }
  
  
      });
    } catch (error) {
      console.error(error);
      return next(
        new AppError("Error during getting user Admin role", 500)
      );
    }
  });

  export const getBreakData = catchAsync(async (req, res, next) => {
    const { email } = req.query;
  
    try {
      await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
          where:{
            email:email
          },include:{
            teams: true
          }
        })

        let teamsList = []

        user.teams.map((team) => {
          teamsList.push(team.name)
        })

        console.log(teamsList)

        const breakTypeList = await prisma.team.findMany({
          where:{
            name: {
              in: teamsList
            }
          },include:{
            breakTypes: {
              select:{
                id: true,
                breakName: true,
                breakCode: true,
                breakDescription: true,
                breakTimeInMinutes: true
              }
            }
          }
        })

        let resultList = []

        const customObj =  {
          "breakName": "Custom Break",
          "breakCode": "CUSTOM_BREAK",
          "breakDuration": "00"
      }

      resultList.push(customObj)

        breakTypeList.map((breakType) => {
          breakType.breakTypes.map((breakObj) => {
            const result = {
              breakName: breakObj.breakName,
              breakCode: breakObj.breakCode,
              breakDuration: breakObj.breakTimeInMinutes
            }
            resultList.push(result)
          })
        })

        const uniqueObjects = resultList.filter((value, index, self) => 
          index === self.findIndex((t) => (
            t.breakCode === value.breakCode
          ))
        );

        const breaks = {
          breaks : uniqueObjects
        }

        return res.status(200).json(breaks);
       
      });
    } catch (error) {
      console.error(error);
      return next(
        new AppError("Error during getting user attendance PC data", 500)
      );
    }
  });