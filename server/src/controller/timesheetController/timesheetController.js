import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import { isEmpty } from "../../utils/genericMethods.js";

export const getTimesheetData = catchAsync(async (req, res, next) => {
    const { email, date} = req.query;
    try {
      await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
          where: {
            email: email
          }
        })
  
        const timesheetDataList = await prisma.timesheet.findMany({
            where: {
                    userId: user.userId,
                    date: getTodayDateInISO(new Date(date))
            }
        })         
        let formattedTime = ''
        let totalMinutes = 0;

        if(!isEmpty(timesheetDataList)){
          timesheetDataList.map((timesheet) => {
            if(!isEmpty(timesheet.approvedHours)){
              const [hours, minutes] = timesheet.approvedHours.split(':').map(Number);
              totalMinutes += hours * 60 + minutes;
            }
          })
        }
        
        const totalHours = Math.floor(totalMinutes / 60); 
        const remainingMinutes = totalMinutes % 60; 

        formattedTime = `${totalHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;

        const result = {
          timesheetDataList : timesheetDataList,
          totalTime: formattedTime
        }

        return res.status(200).json(result)
      })
    } catch (error) {
      console.log(error)
      return next(new AppError('Error during getting Timesheet Entries',200))
    }
  });

  export const viewTimesheetData = catchAsync(async (req, res, next) => {
    const { name, date} = req.query;
    try {
      await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
          where: {
            username: name
          }
        })
  
        const timesheetDataList = await prisma.timesheet.findMany({
            where: {
                    userId: user.userId,
                    date: getTodayDateInISO(new Date(date))
            }
        })         
        console.log(getTodayDateInISO(new Date(date)))
        let formattedTime = ''
        let totalMinutes = 0;

        if(!isEmpty(timesheetDataList)){
          timesheetDataList.map((timesheet) => {
            const [hours, minutes] = timesheet.consumedHours.split(':').map(Number);
            totalMinutes += hours * 60 + minutes;
          })
        }
        
        const totalHours = Math.floor(totalMinutes / 60); 
        const remainingMinutes = totalMinutes % 60; 

        formattedTime = `${totalHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;

        const result = {
          timesheetDataList : timesheetDataList,
          totalTime: formattedTime
        }

        return res.status(200).json(result)
      })
    } catch (error) {
      console.log('Error during getTimesheetData' + error)
      return next(new AppError('Error during getting Timesheet Entries',200))
    }
  });

  function getTodayDateInISO(date) {
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0'); 

    const formattedDate = `${year}-${month}-${day}`;

    const dateInIST = new Date(formattedDate + "T00:00:00+05:30");
    return dateInIST.toISOString(); 
}

  function updateTimesheetData(inputString,updatedEntry, approveRejectFlag) {
    let objectsString = inputString;

    let newObject = updatedEntry

    let objectsArray = parseData(objectsString);

    let objectIndex = objectsArray.findIndex(obj => 
        obj.task === newObject.task && obj.consumedHours === newObject.consumedHours && obj.approvalStatus === newObject.approvalStatus
    );

    if (objectIndex !== -1) {
        objectsArray[objectIndex].approvalStatus = 'NA'; 
    }

    let updatedObjectsString = objectsArray.map(obj => JSON.stringify(obj)).join(', ');

    return updatedObjectsString
  }

  export const createTimesheetEntry = catchAsync(async (req, res, next) => {
    const { task, completionPercentage, consumedHours, date, email} = req.body;
    try {
      await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
          where:{
            email: email
          }
        })

        let approveFlag = ""

        if(isEmpty(user.reportsToId)){
          approveFlag = "NA"
          const newTimesheetEntry = await prisma.timesheet.create({
            data: {
              task : task,
              consumedHours: consumedHours,
              approvedHours: consumedHours,
              ApprovedFlag: approveFlag,
              userId: user.userId,
              username: user.username,
              date: getTodayDateInISO(new Date(date))
            }
          })
        }else{
          approveFlag = "NO"
          const newTimesheetEntry = await prisma.timesheet.create({
            data: {
              task : task,
              consumedHours: consumedHours,
              ApprovedFlag: approveFlag,
              userId: user.userId,
              username: user.username,
              date: getTodayDateInISO(new Date(date))
            }
          })
        }
        
        return next(new SuccessResponse('Entry Created Successfully',200))
      })
    } catch (error) {
      console.log('Error during createTimesheetEntry' + error)
      return next(new AppError('Error during getting Timesheet Entries',200))
    }
  });

  export const getPendingTimesheetData = catchAsync(async (req, res, next) => {
    const { email, date} = req.query;
    try {
      await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
          where: {
            email: email
          }
        })

        const reportingUserIdList = await prisma.user.findMany({
          where: {
            reportsToId: user.userId
          },
          select:{
            userId: true,
            username: true
          }
        })

        let idList = []
        reportingUserIdList.map((user) => {
          idList.push(user.userId)
        })
  
        const timesheetData = await prisma.timesheet.findMany({
            where: {
                    userId: {
                      in: idList
                    }
            }
        })
        
        let resultList = []
        timesheetData.map((timesheet) => {
          if(timesheet.ApprovedFlag === "NO"){
            resultList.push(timesheet)
          }
        })

        return res.status(200).json(resultList)
      })
    } catch (error) {
      console.log('Error during getPendingTimesheetData' + error)
      return next(new AppError('Error during getting Pending Timesheet Entries',500))
    }
  });

  export const getUsersTimesheetData = catchAsync(async (req, res, next) => {
    const { email, date} = req.query;
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

          const timesheetDataList = await prisma.timesheet.findMany({
            where: {
              date: getTodayDateInISO(new Date(date))
            }
          })


          const timeToMinutes = (time) => {
            if(time){
              const [hours, minutes] = time.split(':').map(Number);
              return hours * 60 + minutes;
            }else{
              return 0
            }
          };
          
          // Helper function to convert total minutes back to "HH:MM" format
          const minutesToTime = (minutes) => {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
          };
          
          // Group by userId and sum consumedHours
          const groupedData = timesheetDataList.reduce((acc, current) => {
            const existingUser = acc.find(item => item.userId === current.userId);
          
            // Convert current consumedHours to minutes
            const currentMinutes = timeToMinutes(current.consumedHours);
            const currentApprovedMinutes = timeToMinutes(current.approvedHours);
          
            if (existingUser) {
              // If the user already exists, add the consumedHours
              existingUser.totalMinutes += currentMinutes;
              existingUser.totalApprovedMinutes += currentApprovedMinutes
            } else {
              // If the user doesn't exist, create a new entry
              acc.push({
                userId: current.userId,
                username: current.username,
                totalMinutes: currentMinutes,
                totalApprovedMinutes: currentApprovedMinutes
              });
            }
            return acc;
          }, []);
          
          // Convert total minutes back to "HH:MM" and create the final output with unique IDs
          const finalData = groupedData.map((user, index) => {
            return {
              id: index + 1,  // Use the index + 1 to generate unique ids for each user
              consumedHours: minutesToTime(user.totalMinutes),
              approvedHours: minutesToTime(user.totalApprovedMinutes),
              userId: user.userId,
              username: user.username,
            };
          });

          res.status(200).json(finalData)

        }else{
          const reportingUserIdList = await prisma.user.findMany({
            where: {
              reportsToId: user.userId
            },
            select:{
              userId: true,
              username: true
            }
          })

        let idList = []
        reportingUserIdList.map((user) => {
          idList.push(user.userId)
        })
  
        const timesheetData = await prisma.timesheet.findMany({
            where: {
                    userId: {
                      in: idList
                    }
            }
        })

        // let resultList = []
        // timesheetData.map((timesheet) => {
        //   if(timesheet.ApprovedFlag === "NO"){
        //     resultList.push(timesheet)
        //   }
        // })

        // return res.status(200).json(resultList)
        }

        

      })
    } catch (error) {
      console.log(error)
      return next(new AppError('Error during getting Pending Timesheet Entries',500))
    }
  });


  export const updateTimesheet = catchAsync(async (req, res, next) => {
    const {id, approveRejectFlag,approvedHours, email} = req.query;

    try {
      await prisma.$transaction(async (prisma) => {


        if(approveRejectFlag === 'true'){
          const updatedtimesheet = await prisma.timesheet.update({
            where: {
              id: Number(id)
            },
            data:{
              ApprovedFlag: "NA",
              approvedHours: String(approvedHours)
            }
          })
          return next(new SuccessResponse("Record Approved successfully",200))
        }else{
          const timesheetEntry = await prisma.timesheet.findFirst({
            where: {
              id: Number(id)
            }
          })
          const deletedtimesheet = await prisma.timesheet.delete({
            where: {
              id: Number(id)
            }
          })

          const alert = await prisma.alert.create({
            data: {
              title: `Timesheet Rejected`,
              description: `task : ${timesheetEntry.task}, consumed Hours: ${timesheetEntry.consumedHours}`,
              triggeredDate: new Date().toISOString(),
              userId: timesheetEntry.userId
            }
          })
          return next(new SuccessResponse("Record Rejected successfully",200))
        }
      })
    } catch (error) {
      console.log('Error during updateTimesheet' + error)
      return next(new AppError('Error during getting Pending Timesheet Entries',500))
    }
  });

  export const updateTimesheetRecords = catchAsync(async (req, res, next) => {
    const { email,taskCompletion} = req.body;
    try {
      // await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
          where:{
            email: email
          }
        })

        let approveFlag = "NO"
        if(isEmpty(user.reportsToId)){
          approveFlag = "NA"
        }else{
          approveFlag = "NO"
        }

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);  

        const endOfDay = new Date(startOfDay);
        endOfDay.setHours(23, 59, 59, 999);

        const todayDate = new Date()
        todayDate.setHours(0,0,0,0)

        taskCompletion.map( async (task) => {

          const taskActivityList = await prisma.taskActivity.findMany({
            where: {
              AND:[{
                taskId: Number(task.taskId)
              },
            {
              userId: user.userId
            },
            {
              date:{
                gte: startOfDay, 
                lte: endOfDay
              }
            }
            ]
             
            }
          })

          let consumedHours = 0

          const filteredEntries = taskActivityList.filter(entry => entry.activity === ' Started Task Progress' || entry.activity === ' Paused Task Progress');

          let totalTimeDifference = 0;

          for (let i = 0; i < filteredEntries.length; i += 2) {
            const start = filteredEntries[i];
            const end = filteredEntries[i + 1];
          
            if (start.activity === ' Started Task Progress' && end.activity === ' Paused Task Progress') {
              const timeDifference = end.date - start.date; 
              totalTimeDifference += timeDifference; 
            }
          }

          if (totalTimeDifference) {
            
            const hours = Math.floor(totalTimeDifference / (1000 * 60 * 60));
            const minutes = Math.floor((totalTimeDifference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((totalTimeDifference % (1000 * 60)) / 1000);

            const formattedMinutes = minutes.toString().padStart(2, '0');
          
            consumedHours = `${hours}:${formattedMinutes}`;
          }else{
            consumedHours = '0:00'
          }


          const newConfig = await prisma.timesheet.upsert({
            where: {
              taskId_date: {
                taskId:Number(task.taskId),
                date:todayDate,
              }
            },
            update: {
              task : task.Comment,
                consumedHours: String(consumedHours),
                ApprovedFlag: approveFlag,
                userId: user.userId,
                username: user.username,
                completionPercentage: task.Completed,
                taskCode: task.taskCode,
            },
            create: {
                task : task.Comment,
                consumedHours: String(consumedHours),
                ApprovedFlag: approveFlag,
                userId: user.userId,
                username: user.username,
                completionPercentage: task.Completed,
                taskCode: task.taskCode,
                taskId: Number(task.taskId),
                date: todayDate
            },
          });
        })

        return next(new SuccessResponse('Timesheet Records Updated Successfully',200))
      // })
    } catch (error) {
      console.log(error)
      return next(new AppError('Error during updateTimesheetRecords',200))
    }
  });