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

  export const getAttendanceData = catchAsync(async (req, res, next) => {
    const {email,  title} = req.query;

    try {
      await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
            where: {
                email: email
            },
            include: {
                roles: true
            }
        })

        if(user.roles.some((role) => role.code === "ADMIN")){

            const customer = await prisma.customer.findFirst()

                const currentDateTime = new Date();
                currentDateTime.setHours(0, 0, 0, 0);
                const indianTimeISOString = currentDateTime.toISOString();
        
                const attendanceRecords = await prisma.attendance.findMany({
                    where:{
                        date: indianTimeISOString
                    }
                })
        
                const timeToMinutes = (time) => {
                    const [hours, minutes] = time.split(":").map(Number);
                    return hours * 60 + minutes;
                  };
        
                  const isDateTimeInRange = (timeRange, dateTime) => {
                    // Parse the time range string into start and end times (e.g., "9:30-10:30" -> [9:30, 10:30])
                    const [startTime, endTime] = timeRange.split('-');
                    
                    // Convert the start and end times into minutes for easy comparison
                    const startMinutes = timeToMinutes(startTime);
                    const endMinutes = timeToMinutes(endTime);
                    
                    // Convert the Prisma DateTime string to a JavaScript Date object
                    const date = new Date(dateTime);
                    
                    // Get the minutes from the Prisma DateTime
                    const currentMinutes = date.getHours() * 60 + date.getMinutes();
                    
                    // Check if the current time is before the start time or after the end time
                    if (currentMinutes < startMinutes) {
                      return 'Before Start Time'; // Before Start Time
                    } else if (currentMinutes > endMinutes) {
                      return 'After End Time'; // 'After End Time'
                    } else {
                      return 'Within Time Range'; //'Within Time Range'
                    }
                  };

            if(title === 'On Time Arrivals'){
        
                let record = 0
                const workStartTime = 9; 
                const workEndTime = 18;
        
                const usersList = await prisma.user.findMany()
        
                attendanceRecords.map((attendance) => {
                    usersList.map((user) => {
                        if(user.userId === attendance.userId){
                            if(user.workingHours !== null && user.workingHours !== undefined && !isEmpty(user.workingHours)){
                                const prismaDateTime = attendance.punchInTime 
                                const timeRange = user.workingHours
        
                                if((isDateTimeInRange(timeRange, prismaDateTime)) === 'Before Start Time'){
                                    record = record +1
                                }
                            }else{
                                const prismaDateTime = attendance.punchInTime // Replace with your actual Prisma DateTime
                                const timeRange = "9:00-18:00"
        
                                if((isDateTimeInRange(timeRange, prismaDateTime)) === 'Before Start Time'){
                                    record = record +1
                                }
                            }
                        }
                    })
                })
        
                const result = {
                    usersCount : record,
                    totalUsersCount: customer.Allowed_User_Count
                }
                
                return res.status(200).json(result)
            }else if (title === 'Late Arrivals'){
                let record = 0
                const workStartTime = 9; 
                const workEndTime = 18;
        
                const usersList = await prisma.user.findMany()
        
                attendanceRecords.map((attendance) => {
                    usersList.map((user) => {
                        if(user.userId === attendance.userId){
                            if(user.workingHours !== null && user.workingHours !== undefined && !isEmpty(user.workingHours)){
                                const prismaDateTime = attendance.punchInTime 
                                const timeRange = user.workingHours
        
                                if((isDateTimeInRange(timeRange, prismaDateTime)) !== 'Before Start Time'){
                                    record = record +1
                                }
                            }else{
                                const prismaDateTime = attendance.punchInTime // Replace with your actual Prisma DateTime
                                const timeRange = "9:00-18:00"
        
                                if((isDateTimeInRange(timeRange, prismaDateTime)) !== 'Before Start Time'){
                                    record = record +1
                                }
                            }
                        }
                    })
                })
        
                const result = {
                    usersCount : record,
                    totalUsersCount: customer.Allowed_User_Count
                }
                
                return res.status(200).json(result)
            }

            
        }

        const result = {
            usersCount : 0,
            totalUsersCount: 0
        }
        
        return res.status(200).json(result)

        
      })
    } catch (error) {
      console.error(error)
      return next(new AppError('Error during calculating attendance data',500))
    }
  });


  export const getAttendanceLCData = catchAsync(async (req, res, next) => {
    const {email,  title} = req.query;

    try {

        const user = await prisma.user.findFirst({
            where: {
                email: email
            },
            include: {
                roles: true
            }
        })
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
            const [startTime, endTime] = timeRange.split('-');
            
            // Convert the start and end times into minutes for easy comparison
            const startMinutes = timeToMinutes(startTime);
            const endMinutes = timeToMinutes(endTime);
            
            // Convert the Prisma DateTime string to a JavaScript Date object
            const date = new Date(dateTime);
            
            // Get the minutes from the Prisma DateTime
            const currentMinutes = date.getHours() * 60 + date.getMinutes();
            
            // Check if the current time is before the start time or after the end time
            if (currentMinutes < startMinutes) {
              return 'Before Start Time'; // Before Start Time
            } else if (currentMinutes > endMinutes) {
              return 'After End Time'; // 'After End Time'
            } else {
              return 'Within Time Range'; //'Within Time Range'
            }
          };
          

          

        if(user.roles.some((role) => role.code === "ADMIN")){

            let finalRresult = []


            for (const previousWeekday of previousWeekdays) {
            const attendanceRecords = await prisma.attendance.findMany({
                        where:{
                            date: previousWeekday
                        }
                    })

                    if(title === 'On Time Arrivals'){
        
                        let record = 0
                        const workStartTime = 9; 
                        const workEndTime = 18;
                
                        const usersList = await prisma.user.findMany()
                
                        attendanceRecords.map((attendance) => {
                            usersList.map((user) => {
                                if(user.userId === attendance.userId){
                                    if(user.workingHours !== null && user.workingHours !== undefined && !isEmpty(user.workingHours)){
                                        const prismaDateTime = attendance.punchInTime 
                                        const timeRange = user.workingHours
                
                                        if((isDateTimeInRange(timeRange, prismaDateTime)) === 'Before Start Time'){
                                            record = record +1
                                        }
                                    }else{
                                        const prismaDateTime = attendance.punchInTime // Replace with your actual Prisma DateTime
                                        const timeRange = "9:00-18:00"
                
                                        if((isDateTimeInRange(timeRange, prismaDateTime)) === 'Before Start Time'){
                                            record = record +1
                                        }
                                    }
                                }
                            })
                        })

                        const date = new Date(previousWeekday);  // Parse the ISO string into a Date object
  
                        const day = String(date.getDate()).padStart(2, '0');  // Get day and ensure two digits
                        const month = String(date.getMonth() + 1).padStart(2, '0');  // Get month and ensure two digits (months are 0-indexed)
                        const year = date.getFullYear();
                
                        const result = {
                            date : `${day}/${month}/${year}`,
                            count: record
                        }
                        finalRresult.push(result)
                        
                    }else if (title === 'Late Arrivals'){
                        let record = 0
                        const workStartTime = 9; 
                        const workEndTime = 18;
                
                        const usersList = await prisma.user.findMany()
                
                        attendanceRecords.map((attendance) => {
                            usersList.map((user) => {
                                if(user.userId === attendance.userId){
                                    if(user.workingHours !== null && user.workingHours !== undefined && !isEmpty(user.workingHours)){
                                        const prismaDateTime = attendance.punchInTime 
                                        const timeRange = user.workingHours
                
                                        if((isDateTimeInRange(timeRange, prismaDateTime)) !== 'Before Start Time'){
                                            record = record +1
                                        }
                                    }else{
                                        const prismaDateTime = attendance.punchInTime // Replace with your actual Prisma DateTime
                                        const timeRange = "9:00-18:00"
                
                                        if((isDateTimeInRange(timeRange, prismaDateTime)) !== 'Before Start Time'){
                                            record = record +1
                                        }
                                    }
                                }
                            })
                        })
                        const date = new Date(previousWeekday);  // Parse the ISO string into a Date object
  
                        const day = String(date.getDate()).padStart(2, '0');  // Get day and ensure two digits
                        const month = String(date.getMonth() + 1).padStart(2, '0');  // Get month and ensure two digits (months are 0-indexed)
                        const year = date.getFullYear();
                
                        const result = {
                            date : `${day}/${month}/${year}`,
                            count: record
                        }

                        finalRresult.push(result)
                        
                    }

                } 
                return res.status(200).json(finalRresult)
        }

    } catch (error) {
      console.error(error)
      return next(new AppError('Error during calculating attendance data',500))
    }
  });