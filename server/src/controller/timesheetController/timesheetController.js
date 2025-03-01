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
        console.log(timesheetDataList)

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

    // New object with updated fields that you want to place in the list
    let newObject = updatedEntry
    console.log('-----------')
    console.log(updatedEntry)

    // 1. Parse the comma-separated string into an array of objects
    let objectsArray = parseData(objectsString);
    console.log(objectsArray)

    // 2. Find the exact match for the object (whole object)
    let objectIndex = objectsArray.findIndex(obj => 
        obj.task === newObject.task && obj.consumedHours === newObject.consumedHours && obj.approvalStatus === newObject.approvalStatus
    );
    console.log(objectIndex)

    if (objectIndex !== -1) {
        // 3. Update the object manually (for example, updating the 'age' field)
        objectsArray[objectIndex].approvalStatus = 'NA';  // Manually updating the age field
    }

    console.log(objectsArray)

    // 4. Rebuild the comma-separated string
    let updatedObjectsString = objectsArray.map(obj => JSON.stringify(obj)).join(', ');

    console.log(updatedObjectsString); // The updated comma-separated objects string
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
        }else{
          approveFlag = "NO"
        }

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
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
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
          
            if (existingUser) {
              // If the user already exists, add the consumedHours
              existingUser.totalMinutes += currentMinutes;
            } else {
              // If the user doesn't exist, create a new entry
              acc.push({
                userId: current.userId,
                username: current.username,
                totalMinutes: currentMinutes
              });
            }
            return acc;
          }, []);
          
          // Convert total minutes back to "HH:MM" and create the final output with unique IDs
          const finalData = groupedData.map((user, index) => {
            return {
              id: index + 1,  // Use the index + 1 to generate unique ids for each user
              consumedHours: minutesToTime(user.totalMinutes),
              userId: user.userId,
              username: user.username
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

        console.log(timesheetData)
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
      console.log('Error during getUsersTimesheetData' + error)
      return next(new AppError('Error during getting Pending Timesheet Entries',500))
    }
  });


  export const updateTimesheet = catchAsync(async (req, res, next) => {
    const {id, approveRejectFlag,email} = req.query;

    try {
      await prisma.$transaction(async (prisma) => {


        if(approveRejectFlag === 'true'){
          const updatedtimesheet = await prisma.timesheet.update({
            where: {
              id: Number(id)
            },
            data:{
              ApprovedFlag: "NA"
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