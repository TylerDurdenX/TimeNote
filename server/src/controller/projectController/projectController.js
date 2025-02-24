import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import { isEmpty } from "../../utils/genericMethods.js";
import SuccessResponse from "../../utils/SuccessResponse.js";

export const createProject = catchAsync(async (req, res, next) => {
  const { title,clientName, description,projectCode, startDate, endDate, projectManager } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: projectManager,
      },
    });
    console.log(user.email)
    const newProject = await prisma.project.create({
      data: {
        name : title,
        description,
        clientName: clientName,
        code: projectCode,
        startDate,
        endDate,
        projectManager: user.userId,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Project created successfully",
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error creating Project", 400));
  }
});

export const getProjects = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      include: {
        roles: true,
      },
    });

    if (user.roles.some((role) => role.code === "ADMIN")) {
      let resultList= [];
      const projects = await prisma.project.findMany({
        include: {
          tasks: true,
          user: {
            select: {
              username: true, 
            },
          },
        },
      });
      
      projects.map((project) => {
        if (isEmpty(project.tasks)) {
          resultList.push({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
            clientName : project.clientName,
            projectManager: project.user.username,
            completionStatus: 0
          });
        }else{
          resultList.push({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
            clientName : project.clientName,
            projectManager: project.user.username,
            completionStatus: (() => {
              const tasksList = project.tasks;
              const totalTasks = tasksList.length;
              let completedTasksCount = 0;
          
              tasksList.forEach((task) => {
                if (task.status === 'Closed') {
                  completedTasksCount += 1; 
                }
              });
          
              return ((completedTasksCount / totalTasks) * 100).toFixed(2); 
            })()
          });
          
        }
      });
      return res.status(200).json(resultList)
    } else {
      let resultList= [];
      let projectList= [];
      const projects = await prisma.project.findMany({
        include: {
          tasks: true,
          users: true,
          user: true
        },
      });


      projects.map((project) => {
        project.users.map((user) => {
          if(user.email === email){
            projectList.push(project)
          }
        })
        if(project.user.email === email){
          projectList.push(project)
        }
      })
      
      projectList.map((project) => {
        if (isEmpty(project.tasks)) {
          resultList.push({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
            clientName : project.clientName,
            projectManager: project.user.username,
            completionStatus: 0
          });
        }else{
          resultList.push({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
            clientName : project.clientName,
            projectManager: project.user.username,
            completionStatus: (() => {
              const tasksList = project.tasks;
              const totalTasks = tasksList.length;
              let completedTasksCount = 0;
          
              tasksList.forEach((task) => {
                if (task.status === 'Completed') {
                  completedTasksCount += 1; 
                }
              });
          
              return ((completedTasksCount / totalTasks) * 100).toFixed(2); 
            })()
          });
          
        }
      });
      return res.status(200).json(resultList)
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error getting Projects List", 400));
  }
});

export const getProjectTasks = catchAsync(async (req, res, next) => {
  const { id, sprint, assignedTo, priority , isTaskOrSubTask, email} = req.query;
  try{
    const user = await prisma.user.findFirst({
      where: {
        email: email
      }, 
      include: {
        roles: true
      }
    })
    if(user.roles.some((role) => role.code === "ADMIN")){
      if(isTaskOrSubTask==='Task'){
        let whereCondition = {
          projectId: Number(id),
        };
      
        if (!isEmpty(sprint)) {
          whereCondition.sprintId = Number(sprint);
        }
      
        let assignedUserId;
        if (!isEmpty(assignedTo)) {
          const user = await prisma.user.findFirst({
            where: {
              email: assignedTo,
            },
          });
          if (user) {
            assignedUserId = user.userId;
            whereCondition.assignedUserId = assignedUserId; 
          }
        }
      
        if (!isEmpty(priority)) {
          whereCondition.priority = priority;
        }
      
        const tasks = await prisma.task.findMany({
          where: whereCondition,
          include: {
            author: {
              select: {
                username: true,
              },
            },
            assignee: {
              include: {
                profilePicture: {
                  select: {
                    base64: true,
                  },
                },
              },
            },
            comments: true,
          },
        });

        const currentDateTime = new Date()
      
        tasks.map((task) => {
          const assignee = task.assignee
            const {
              password,
              designation,
              phoneNumber,
              reportsToId,
              resetPasswordOTP,
              otpExpires,
              createdAt,
              updatedAt,
              ...newAssignee
            } = task.assignee;
            task.assignee = newAssignee;

            let hoursOverrun = 0
            let totalHours =0
            let consumedHours = 0

            totalHours += task.points
            if(task.inProgressStartTime === null || task.inProgressStartTime === undefined){
              if(task.inProgressTimeinMinutes !== null || task.inProgressTimeinMinutes !== undefined){
                consumedHours += Math.floor(Number(task.inProgressTimeinMinutes) / 60);
              }
            }else{
              const differenceInMilliseconds = currentDateTime.getTime() - new Date(task.inProgressStartTime).getTime();
              const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
              const progressTime = Number(task.inProgressTimeinMinutes || 0) + differenceInMinutes;
              consumedHours += Math.floor(progressTime / 60);
            }

            if(consumedHours > totalHours){
              hoursOverrun = Math.abs(consumedHours - totalHours)
            }

            task.consumedHours = consumedHours
            task.hoursOverrun = hoursOverrun
          })
      
        res.json(tasks);
      }else{
        let whereCondition = {
          projectId: Number(id),
        };
      
        if (!isEmpty(sprint)) {
          whereCondition.sprintId = Number(sprint);
        }
      
        let assignedUserId;
        if (!isEmpty(assignedTo)) {
          const user = await prisma.user.findFirst({
            where: {
              email: assignedTo,
            },
          });
          if (user) {
            assignedUserId = user.userId;
            whereCondition.assignedUserId = assignedUserId; 
          }
        }
      
        if (!isEmpty(priority)) {
          whereCondition.priority = priority;
        }
      
        const tasks = await prisma.task.findMany({
          where: whereCondition,
          include: {
            author: {
              select: {
                username: true,
              },
            },
            assignee: {
              include: {
                profilePicture: {
                  select: {
                    base64: true,
                  },
                },
              },
            },
            comments: true,
            subTasks: {
              include: {
                assignee: {
                  include: {
                    profilePicture: {
                      select: {
                        base64: true
                      }
                    }
                  }
                },
                author: {
                  select: {
                    username: true,
                  },
                },
                comments: true
              }
            }
          },
        });
      
        const subTaskList = tasks.map(item => item.subTasks);

        const flattenedList = subTaskList.filter(list => list.length > 0).flat();
        let filteredList
        if(assignedTo!=='X'){
          filteredList = flattenedList.filter(item => item.assignee.email === email);
        }else if(assignedTo!==''){
          filteredList = flattenedList
        }else{
          filteredList = flattenedList
        }

        filteredList.map((subTask) => {
          const assignee = subTask.assignee
            const {
              password,
              designation,
              phoneNumber,
              reportsToId,
              resetPasswordOTP,
              otpExpires,
              createdAt,
              updatedAt,
              ...newAssignee
            } = subTask.assignee;
            subTask.assignee = newAssignee;
        })
      
        res.json(filteredList);
      }
      
    }else{

    }
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error getting Tasks", 400));
  }
});

export const getProjectUsers = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  let resultList =[]
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        users: true
      }
    });
    if(project.users){
    const usersList = project.users
    usersList.map((user) => {
      const {
        email,
        password,
        designation,
        phoneNumber,
        profilePictureId,
        reportsToId,
        resetPasswordOTP,
        otpExpires,
        createdAt,
        updatedAt,
        ...newObj
      } = user;
      resultList.push(newObj)
    })
    res.status(200).json(resultList);
    }
    return next(new AppError("No User Found", 400));
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error getting Users in Project", 400));
  }
});

export const createTask = catchAsync(async (req, res, next) => {
  const { title, description, status, priority, points, startDate, dueDate, tags, assignedUserId, authorUserId,sprintId, projectId } = req.body;
  try {

    const authorUser = await prisma.user.findFirst({
      where:{
        email: authorUserId
      }
    })
    const date = new Date(startDate); 
    const isoStartTime = date.toISOString();
    const endDate = new Date(dueDate); 
    const isoDueTime = endDate.toISOString();

    const result = await prisma.$transaction(async (prisma) => {

      const project = await prisma.project.findFirst({
        where: {
          id: projectId
        }
      })

    const task = await prisma.task.create({
      data:{
        title,
      description,
      status,
      priority,
      tags,
      startDate: isoStartTime,
      dueDate: isoDueTime,
      points: Number(points),
      projectId: projectId,
      authorUserId: authorUser.userId,
      sprintId: Number(sprintId),
      assignedUserId: Number(assignedUserId)
      }
    })

    const taskCode = project.code + (String(task.id).padStart(6, '0'))
    
    if(task){
      const taskActivity = await prisma.taskActivity.create({
        data: {
          taskId: task.id,
          userId: authorUser.userId,
          username: authorUser.username,
          date: indianTimeISOString,
          activity: ` created task : ${taskCode}`
        }
      })
    }

    const updatedTask = await prisma.task.update({
      where:{
        id: task.id,
      },
      data: {
        code: taskCode
      }
    })

    const currentDateTime = new Date();
    const indianTimeISOString = currentDateTime.toISOString();

    const taskHistory = await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        userId: Number(assignedUserId),
        startDate: indianTimeISOString,
        sprint: sprintId,
        time: "0,0,0,0,0",
      }
    })
  
    if (taskHistory && task) {
      return next(new SuccessResponse("Task Created Successfully", 200));
    }
    return next(new AppError("Error creating task please try after some time", 400));
  })
  return next(new AppError("Error creating task please try after some time", 400));
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error creating Task", 400));
  }
});

function calculateHoursPassed(providedDateStr) {
  const providedDate = new Date(providedDateStr);
  const currentDate = new Date();
  const timeDifference = currentDate - providedDate; 
  const hoursPassed = timeDifference / (1000 * 60 * 60);
  const roundedHours = Math.round(hoursPassed * 10) / 10;

  return roundedHours;
}

export const updateTaskProgress = catchAsync(async (req, res, next) => {
  const { taskId, progressStart } = req.query;

  const result = await prisma.$transaction(async (prisma) => {

    const currentDateTime = new Date();
    const indianTimeISOString = currentDateTime.toISOString();

    if(progressStart === 'true'){

      await prisma.task.update({
        where:{
          id: Number(taskId)
        }, data: {
          inProgressStartTime: currentDateTime
        }
      })

      const task = await prisma.task.findFirst({
        where: {
          id: Number(taskId)
        }, 
        include: {
          assignee: {
            select: {
              userId: true,
              username: true
            }
          }
        }
      })

      if(task){
        const taskActivity = await prisma.taskActivity.create({
          data: {
            taskId: task.id,
            userId: task.assignee.userId,
            username: task.assignee.username,
            date: indianTimeISOString,
            activity: ` Started Task Progress`
          }
        })
      }

      return next(new SuccessResponse("Task Updated Successfully", 200))
    }else{
    const taskToBeUpdated = await prisma.task.findFirst({
      where: {
        id: Number(taskId)
      }
    })

    const differenceInMilliseconds = currentDateTime - new Date(taskToBeUpdated.inProgressStartTime);
    const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
    const progressTime = Number(taskToBeUpdated.inProgressTimeinMinutes || 0) + differenceInMinutes

    await prisma.task.update({
      where:{
        id: Number(taskId)
      },data: {
        inProgressStartTime: null,
        inProgressTimeinMinutes: String(progressTime)
      }
    })

    const task = await prisma.task.findFirst({
      where: {
        id: Number(taskId)
      }, 
      include: {
        assignee: {
          select: {
            userId: true,
            username: true
          }
        }
      }
    })

    if(task){
      const taskActivity = await prisma.taskActivity.create({
        data: {
          taskId: task.id,
          userId: task.assignee.userId,
          username: task.assignee.username,
          date: indianTimeISOString,
          activity: ` Paused Task Progress`
        }
      })
    }

    return next(new SuccessResponse("Task updated Successfully",200))
  }
  })
})

export const updateTaskStatus = catchAsync(async (req, res, next) => {
  const { taskId, email } = req.query;
  const { status } = req.body;

  const result = await prisma.$transaction(async (prisma) => {

  try {

    const currentDateTime = new Date();
    const indianTimeISOString = currentDateTime.toISOString();

    const task = await prisma.task.findFirst({
      where:{
        id: Number(taskId)
      },
      include:{
        assignee: {
          select: {
            userId: true,
            email: true,
            username: true
          }
        }
      }
    })

    if(task.assignee.email !== email){
      return next(new AppError(`Cannot update Task assigned to other people`, 500))
    }

    if(task.status === 'To Do' && ( status === 'Under Review' || status === 'Completed')){
      return next(new AppError(`Cannot change status from "To Do" to : ${status}`, 500))
    }

    if(task.status === 'Work In Progress' && ( status === 'To Do' || status === 'Completed')){
      return next(new AppError(`Cannot change status from "Work In Progress" to : ${status}`, 500))
    }

    if(task.status === 'Under Review' && ( status === 'To Do' || status === 'Work In Progress')){
      return next(new AppError(`Cannot change status from "Under Reviews" to : ${status}`, 500))
    }

    if(task.status === 'Completed' && ( status === 'To Do' || status === 'Work In Progress' || status === 'Under Reviews')){
      return next(new AppError(`Cannot change status from "Completed" to : ${status}`, 500))
    }

    if(task.inProgressStartTime === null){
      const updatedTask = await prisma.task.update({
        where: {
          id: Number(taskId),
        },
        data:{
            status: status
        }
      });

      if(updatedTask){
        const taskActivity = await prisma.taskActivity.create({
          data: {
            taskId: updatedTask.id,
            userId: task.assignee.userId,
            username: task.assignee.username,
            date: indianTimeISOString,
            activity: ` updated status to : ${updatedTask.status}`
          }
        })
      }
  
      const taskHistoryList = await prisma.taskHistory.findMany({
        where: {
          taskId: updatedTask.id
        }
      })
   
      taskHistoryList.sort((a, b) => b.id - a.id);
      let [toDo, WIP, underReview, completed, closed] = taskHistoryList[0].time.split(',').map(Number);
  
      let newTimeString = ""
  
      const date = taskHistoryList[0].startDate;  
  
      switch(task.status){
        case  "To Do" : {
          const hours = Math.abs(calculateHoursPassed(date)).toFixed(2);
          toDo = toDo + hours
          newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
          break;
        }
        case  "Work In Progress" : {
          const hours = Math.abs(calculateHoursPassed(date)).toFixed(2);
          WIP = WIP + hours
          newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
          break;
        }
        case  "Under Review" : {
          const hours = Math.abs(calculateHoursPassed(date)).toFixed(2);
          underReview = underReview + hours
          newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
          break;
        }
        case  "Completed" : {
          const hours = Math.abs(calculateHoursPassed(date)).toFixed(2);
          completed = completed + hours
          newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
          break;
        }
      }
  
      const updatedTaskHistory = await prisma.taskHistory.update({
        where: {
          id: taskHistoryList[0].id
        },
        data: {
          time: newTimeString,
          startDate: indianTimeISOString
        }
      })
  
      return next(new SuccessResponse("Task status updated Successfully", 200));
    }else{
      const currentDateTimeNow = new Date();
      const differenceInMilliseconds = currentDateTimeNow - new Date(task.inProgressStartTime);
      const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
      const progressTime = Number(task.inProgressTimeinMinutes || 0) + differenceInMinutes;

      const updatedTask = await prisma.task.update({
        where: {
          id: Number(taskId),
        },
        data:{
            status: status,
            inProgressStartTime: null,
            inProgressTimeinMinutes: String(progressTime)
        }
      });

      if(updatedTask){
        const taskActivity = await prisma.taskActivity.create({
          data: {
            taskId: updatedTask.id,
            userId: task.assignee.userId,
            username: task.assignee.username,
            date: indianTimeISOString,
            activity: ` updated status to : ${updatedTask.status}`
          }
        })
      }
  
      const taskHistoryList = await prisma.taskHistory.findMany({
        where: {
          taskId: updatedTask.id
        }
      })
   
      taskHistoryList.sort((a, b) => b.id - a.id);
      let [toDo, WIP, underReview, completed, closed] = taskHistoryList[0].time.split(',').map(Number);
  
      let newTimeString = ""
  
      const date = taskHistoryList[0].startDate;  
  
      switch(task.status){
        case  "To Do" : {
          const hours = Math.abs(calculateHoursPassed(date)).toFixed(2);
          toDo = toDo + hours
          newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
          break;
        }
        case  "Work In Progress" : {
          const hours = Math.abs(calculateHoursPassed(date)).toFixed(2);
          WIP = WIP + hours
          newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
          break;
        }
        case  "Under Review" : {
          const hours = Math.abs(calculateHoursPassed(date)).toFixed(2);
          underReview = underReview + hours
          newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
          break;
        }
        case  "Completed" : {
          const hours = Math.abs(calculateHoursPassed(date)).toFixed(2);
          completed = completed + hours
          newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
          break;
        }
      }
  
      const currentDateTime = new Date();
      const indianTimeISOString = currentDateTime.toISOString();
  
      const updatedTaskHistory = await prisma.taskHistory.update({
        where: {
          id: taskHistoryList[0].id
        },
        data: {
          time: newTimeString,
          startDate: indianTimeISOString
        }
      })
  
      return next(new SuccessResponse("Task status updated Successfully", 200));
    }

    
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }
  })
  return next(new AppError("Some Error Occurred", 500))
});

export const updateTaskAssignee = catchAsync(async (req, res, next) => {
  const { taskId } = req.query;
  const { email } = req.query;
  try {
    const currentDateTime = new Date();
    const currentTimeISOString = currentDateTime.toISOString();
  const result = await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.findFirst({
      where: {
        email: email
      }
    })

    const taskToBeUpdated = await prisma.task.findFirst({
      where:{
        id: Number(taskId)
      },
      include: {
        assignee: {
          select: {
            userId: true,
            username: true
          }
        }
      }
    })

    if(user.userId === taskToBeUpdated.assignedUserId){
      return next(new AppError("Task already assigned to same person", 500))
    }

    if(taskToBeUpdated.inProgressStartTime === null){
      const updatedTask = await prisma.task.update({
        where: {
          id: Number(taskId),
        },
        data:{
            assignedUserId: user.userId
        }
      });

      if(updatedTask){
        const taskActivity = await prisma.taskActivity.create({
          data: {
            taskId: updatedTask.id,
            userId: user.userId,
            username: user.username,
            date: currentTimeISOString,
            activity: ` Assigned the task to : [${user.username}]`
          }
        })
      }
    
    }else{
      const currentDateTimeNow = new Date();
      const differenceInMilliseconds = currentDateTimeNow - new Date(taskToBeUpdated.inProgressStartTime);
      const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
      const progressTime = Number(taskToBeUpdated.inProgressTimeinMinutes || 0) + differenceInMinutes

      const updatedTask = await prisma.task.update({
        where: {
          id: Number(taskId),
        },
        data:{
            assignedUserId: user.userId,
            inProgressStartTime: null,
            inProgressTimeinMinutes: String(progressTime)
        }
      });
      console.log('yes')
      if(updatedTask){
        const taskActivity = await prisma.taskActivity.create({
          data: {
            taskId: updatedTask.id,
            userId: taskToBeUpdated.assignee.userId,
            username: taskToBeUpdated.assignee.username,
            date: currentTimeISOString,
            activity: ` Assigned the task to : [${user.username}]`
          }
        })
      }
      const taskHistoryList = await prisma.taskHistory.findMany({
        where: {
          taskId: updatedTask.id
        }
      })
  
  
      taskHistoryList.sort((a, b) => b.id - a.id);
      let [toDo, WIP, underReview, completed, closed] = taskHistoryList[0].time.split(',').map(Number);
  
      let newTimeString = ""
      switch(updatedTask.status){
        case  "To Do" : {
          const hours = Math.abs(calculateHoursPassed(taskHistoryList[0].startDate)).toFixed(2);
          const newtoDo = toDo + hours
          newTimeString = [String(newtoDo), String(WIP), String(underReview), String(completed), String(closed)].join(',');
          break;
        }
        case  "Work In Progress" : {
          const hours = Math.abs(calculateHoursPassed(taskHistoryList[0].startDate)).toFixed(2);
          WIP = WIP + hours
          newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
          break;
        }
        case  "Under Review" : {
          const hours = Math.abs(calculateHoursPassed(taskHistoryList[0].startDate)).toFixed(2);
          underReview = underReview + hours
          newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
          break;
        }
        case  "Completed" : {
          const hours = Math.abs(calculateHoursPassed(taskHistoryList[0].startDate)).toFixed(2);
          completed = completed + hours
          newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
          break;
        }
        default: {
          console.log("Unknown task status: ", updatedTask.status);
        }
      }
  
      const currentDateTime = new Date();
      const indianTimeISOString = currentDateTime.toISOString();
  
      const updatedTaskHistory = await prisma.taskHistory.update({
        where: {
          id: taskHistoryList[0].id
        },
        data: {
          time: newTimeString,
          endDate: indianTimeISOString
        }
      })
  
      const taskHistory = await prisma.taskHistory.create({
        data: {
          taskId: updatedTask.id,
          userId: user.userId,
          startDate: indianTimeISOString,
          sprint: String(updatedTask.sprintId),
          time: "0,0,0,0,0",
        }
      })
  
      return next(new SuccessResponse("Task updated Successfully",200));
    }
  
})
} catch (error) {
  console.log(error)
  return next(new AppError('Some Error occurred',500));
}
});

export const getTaskComments = catchAsync(async (req, res, next) => {
  const { taskId } = req.query;
  let resultList = []
  try {
      const task = await prisma.task.findFirst({
        where: {
          id: Number(taskId),
        },
        include:{
          comments: true
        }
      });
      if(task){
        const commentsList = task.comments
        commentsList.map((comment) => {
          const newObj = {
            id: comment.id,
            text: comment.text,
            username: comment.username,
            commentTime: comment.commentTime
          }
          resultList.push(newObj)
        })
      }
      res.json(resultList);
    
    
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }

});

export const getSubTaskComments = catchAsync(async (req, res, next) => {
  const { subTaskId, } = req.query;
  let resultList = []
  try {
      const subTask = await prisma.subtask.findFirst({
        where: {
          id: Number(subTaskId),
        },
        include:{
          comments: true
        }
      });
      if(subTask){
        const commentsList = subTask.comments
        commentsList.map((comment) => {
          const newObj = {
            id: comment.id,
            text: comment.text,
            username: comment.username,
            commentTime: comment.commentTime
          }
          resultList.push(newObj)
        })
      }
      res.json(resultList);
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }

});

function extractTextInBrackets(str) {
  // Regular expression to match text inside square brackets
  const regex = /\[([^\]]+)\]/g;
  let matches = [];
  let match;

  // Using the regex to find all matches
  while ((match = regex.exec(str)) !== null) {
    // Push the matched text (inside the brackets) to the matches array
    matches.push(match[1]);
  }

  return matches;
}

export const addComment = catchAsync(async (req, res, next) => {
  const { text, taskId, userEmail, commentTime, taskCode } = req.body;
  try {
    await prisma.$transaction(async (prisma) => {

    const user = await prisma.user.findFirst({
      where:{
        email: userEmail
      }
    })
    const result = extractTextInBrackets(text);
    const userList = await prisma.user.findMany({
      where:{
        username: {
          in: result
        }
      }
    })

    if(!isEmpty(userList)){
      userList.map( async(u) => {
        const alert = await prisma.alert.create({
          data: {
            title: "Mentioned in Comment",
            description: `${u.username} mentioned you in task :${taskCode}`,
            triggeredDate: commentTime,
            userId: u.userId
          }
        })
      })
    }
    
    const comment = await prisma.comment.create({
      data:{
        text,
      taskId,
      userId: user.userId,
      username: user.username,
      commentTime,
      }
    })

    res.json(comment);
  })
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error adding Comment", 400));
  }
});

export const addSubTaskComment = catchAsync(async (req, res, next) => {
  const { text, taskId, userEmail, commentTime } = req.body;
  try {

    const user = await prisma.user.findFirst({
      where:{
        email: userEmail
      }
    })
    
    const comment = await prisma.comment.create({
      data:{
        text,
      subtaskId: taskId,
      userId: user.userId,
      username: user.username,
      commentTime,
      }
    })

    res.json(comment);
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error creating Task", 400));
  }
});

export const createSprint = catchAsync(async (req, res, next) => {
  const { title, description, startDate, endDate, email, projectId} = req.body;
  try {

    const user = await prisma.user.findFirst({
      where:{
        email: email
      },
      include:{
        roles: true
      }
    })
    
    const project = await prisma.project.findFirst({
      where:{
        id: projectId
      }
    })

    if(project.projectManager === user.userId){
      const date = new Date(startDate); 
      const isoStartTime = date.toISOString();
      const endDay = new Date(endDate); 
      const isoEndTime = endDay.toISOString();
      const sprint = await prisma.sprint.create({
        data:{
          title,
        description,
        startDate: isoStartTime,
        endDate: isoEndTime,
        projectId: projectId
        }
      })
      if(sprint)
      return next(new AppError("Sprint Created Successfully", 200));
    }else{
      return next(new AppError("Only Project Manager can create New Sprint", 400));
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error creating Task", 400));
  }
});

export const getSprint = catchAsync(async (req, res, next) => {
  const { projectId} = req.query;
  try {
    let resultList =[]
    const sprintList = await prisma.sprint.findMany({
      where:{
        projectId: Number(projectId)
      }
    })

    sprintList.map((sprint) => {
      const {
        description,
        startDate,
        endDate,
        projectId,
        ...newObj
      } = sprint;
      resultList.push(newObj)
    })


    res.status(200).json(resultList)

  } catch (error) {
    console.error(error);
    return next(new AppError("There was an getting Sprints", 400));
  }
});

export const getProjectManagers = catchAsync(async (req, res, next) => {
  try {

    let ProjectManagerList = []

    const PmRole = await prisma.role.findFirst({
      where:{
        code: "PROJECT_MANAGER"
      }
    })
    
    const usersList = await prisma.user.findMany({
      include:{
        roles: true
      }
    })

    usersList.forEach((user) => {
      user.roles.forEach((role) => {
        if (role.id === PmRole.id) {
          const {
            email,
            password,
            designation,
            phoneNumber,
            profilePictureId,
            reportsToId,
            resetPasswordOTP,
            otpExpires,
            createdAt,
            updatedAt,
            roles,
            ...newObj
          } = user;
          ProjectManagerList.push(newObj);
        }
      });
    });    

    res.status(200).json(ProjectManagerList)

  } catch (error) {
    console.error(error);
    return next(new AppError("There was an getting Project Manager Users", 400));
  }
});

export const getTask = catchAsync(async (req, res, next) => {
  const { taskId } = req.query;
  let resultList = []
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: Number(taskId),
      },
      include:{
        comments: true,
        attachments: true,
        author: {
          select: {
            username: true
          }
        },
        subTasks: {
          include: {
            assignee:{
              select: {
                username: true
              }
            },
            author: {
              select: {
                username: true
              }
            }
          }
        },
        assignee:{
          select:{
            username: true
          }
        }
      }
    });
    if(task){
      const commentsList = task.comments
      commentsList.map((comment) => {
        const newObj = {
          id: comment.id,
          text: comment.text,
          username: comment.username,
          commentTime: comment.commentTime
        }
        resultList.push(newObj)
      })
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }

});

export const updateTask = catchAsync(async (req, res, next) => {
  const { taskId, taskPoints, assignee, taskDescription } = req.body;
  
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          username: assignee,
        },
      });

      const taskToBeUpdated = await prisma.task.findFirst({
        where: {
          id: taskId,
        }, include: {
          assignee: {
            select: {
              username: true,
              userId: true
            }
          }
        },
      });

      if (!user || !taskToBeUpdated) {
        throw new Error('User or Task not found');
      }

      if (taskToBeUpdated.assignedUserId === user.userId) {
        // Update task if user is the same as assigned user
        const updatedTask = await prisma.task.update({
          where: {
            id: taskId,
          },
          data: {
            description: taskDescription,
            points: taskPoints,
          },
        });

        let descriptionError =""

        if(taskToBeUpdated.description != updatedTask.description && taskToBeUpdated.points != updatedTask.points){
          descriptionError = "updated Task Description and Task Points"
        }else
        if(taskToBeUpdated.description != updatedTask.description){
          descriptionError = "updated Task Description"
        }else
        if(taskToBeUpdated.points != updatedTask.points){
          descriptionError = "updated Task Points"
        }

        const currentDateTime = new Date();
        const indianTimeISOString = currentDateTime.toISOString();
        
        if(updatedTask){
          const taskActivity = await prisma.taskActivity.create({
            data: {
              taskId: updatedTask.id,
              userId: taskToBeUpdated.assignee.userId,
              username: taskToBeUpdated.assignee.username,
              date: indianTimeISOString,
              activity: ` ${descriptionError}`
            }
          })
        }

        return res.status(200).json({ message: 'Task updated successfully' });
      } else {
        // Handle case when task is not in progress
        if (taskToBeUpdated.inProgressStartTime === null) {
          const updatedTask = await prisma.task.update({
            where: {
              id: taskId,
            },
            data: {
              description: taskDescription,
              points: taskPoints,
              assignedUserId: user.userId,
            },
          });

        let descriptionError =""

        if(taskToBeUpdated.description !== updatedTask.description && taskToBeUpdated.points !== updatedTask.points){
          descriptionError = "updated Task Description and Task Points"
        }else
        if(taskToBeUpdated.description !== updatedTask.description){
          descriptionError = "updated Task Description"
        }else
        if(taskToBeUpdated.points !== updatedTask.points){
          descriptionError = "updated Task Points"
        }

        const currentDateTime = new Date();
        const currentTimeISOString = currentDateTime.toISOString();

        if(updatedTask && !isEmpty(descriptionError)){
          const taskActivity = await prisma.taskActivity.create({
            data: {
              taskId: updatedTask.id,
              userId: taskToBeUpdated.assignee.userId,
              username: taskToBeUpdated.assignee.username,
              date: currentTimeISOString,
              activity: ` ${descriptionError}`
            }
          })
        }

        if(taskToBeUpdated.assignedUserId !== updatedTask.assignedUserId){
          const taskActivity = await prisma.taskActivity.create({
            data: {
              taskId: updatedTask.id,
              userId: taskToBeUpdated.assignee.userId,
              username: taskToBeUpdated.assignee.username,
              date: currentTimeISOString,
              activity: ` Assigned the task to : [${user.username}]`
            }
          })
        }

          // Update task history
          const taskHistoryList = await prisma.taskHistory.findMany({
            where: {
              taskId: taskId,
            },
          });

          taskHistoryList.sort((a, b) => b.id - a.id);

          let [toDo, WIP, underReview, completed, closed] = taskHistoryList[0].time.split(',').map(Number);

          let newTimeString = '';
          switch (taskToBeUpdated.status) {
            case 'To Do': {
              const hours = Math.abs(calculateHoursPassed(taskHistoryList[0].startDate)).toFixed(2);
              const newToDo = toDo + hours;
              newTimeString = [String(newToDo), String(WIP), String(underReview), String(completed), String(closed)].join(',');
              break;
            }
            case 'Work In Progress': {
              const hours = Math.abs(calculateHoursPassed(taskHistoryList[0].startDate)).toFixed(2);
              WIP = WIP + hours;
              newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
              break;
            }
            case 'Under Review': {
              const hours = Math.abs(calculateHoursPassed(taskHistoryList[0].startDate)).toFixed(2);
              underReview = underReview + hours;
              newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
              break;
            }
            case 'Completed': {
              const hours = Math.abs(calculateHoursPassed(taskHistoryList[0].startDate)).toFixed(2);
              completed = completed + hours;
              newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
              break;
            }
            default: {
              console.log('Unknown task status:', taskToBeUpdated.status);
            }
          }

          const indianTimeISOString = currentDateTime.toISOString();

          await prisma.taskHistory.update({
            where: {
              id: taskHistoryList[0].id,
            },
            data: {
              time: newTimeString,
              endDate: indianTimeISOString,
            },
          });

          await prisma.taskHistory.create({
            data: {
              taskId: taskId,
              userId: user.userId,
              startDate: indianTimeISOString,
              sprint: String(taskToBeUpdated.sprintId),
              time: '0,0,0,0,0',
            },
          });

          return res.status(200).json({ message: 'Task updated successfully' });
        } else {
          // Calculate the progress time if in progress
          const currentDateTime = new Date();
          const differenceInMilliseconds = currentDateTime - new Date(taskToBeUpdated.inProgressStartTime);
          const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
          const progressTime = Number(taskToBeUpdated.inProgressTimeinMinutes || 0) + differenceInMinutes;

          const updatedTask = await prisma.task.update({
            where: {
              id: taskId,
            },
            data: {
              description: taskDescription,
              points: taskPoints,
              assignedUserId: user.userId,
              inProgressStartTime: null,
              inProgressTimeinMinutes: String(progressTime),
            },
          });

          let descriptionError =""

          if(taskToBeUpdated.description !== updatedTask.description && taskToBeUpdated.points !== updatedTask.points){
            descriptionError = "updated Task Description and Task Points"
          }else
          if(taskToBeUpdated.description !== updatedTask.description){
            descriptionError = "updated Task Description"
          }else
          if(taskToBeUpdated.points !== updatedTask.points){
            descriptionError = "updated Task Points"
          }
          const currentTimeISOString = currentDateTime.toISOString();
  
          if(updatedTask && !isEmpty(descriptionError)){
            const taskActivity = await prisma.taskActivity.create({
              data: {
                taskId: updatedTask.id,
                userId: taskToBeUpdated.assignee.userId,
                username: taskToBeUpdated.assignee.username,
                date: currentTimeISOString,
                activity: ` ${descriptionError}`
              }
            })
          }
  
          if(taskToBeUpdated.assignedUserId !== updatedTask.assignedUserId){
            const taskActivity = await prisma.taskActivity.create({
              data: {
                taskId: updatedTask.id,
                userId: taskToBeUpdated.assignee.userId,
                username: taskToBeUpdated.assignee.username,
                date: currentTimeISOString,
                activity: ` Assigned the task to : [${user.username}]`
              }
            })
          }

          // Update task history
          const taskHistoryList = await prisma.taskHistory.findMany({
            where: {
              taskId: taskId,
            },
          });

          taskHistoryList.sort((a, b) => b.id - a.id);

          let [toDo, WIP, underReview, completed, closed] = taskHistoryList[0].time.split(',').map(Number);

          let newTimeString = '';
          switch (taskToBeUpdated.status) {
            case 'To Do': {
              const hours = Math.abs(calculateHoursPassed(taskHistoryList[0].startDate)).toFixed(2);
              const newToDo = toDo + hours;
              newTimeString = [String(newToDo), String(WIP), String(underReview), String(completed), String(closed)].join(',');
              break;
            }
            case 'Work In Progress': {
              const hours = Math.abs(calculateHoursPassed(taskHistoryList[0].startDate)).toFixed(2);
              WIP = WIP + hours;
              newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
              break;
            }
            case 'Under Review': {
              const hours = Math.abs(calculateHoursPassed(taskHistoryList[0].startDate)).toFixed(2);
              underReview = underReview + hours;
              newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
              break;
            }
            case 'Completed': {
              const hours = Math.abs(calculateHoursPassed(taskHistoryList[0].startDate)).toFixed(2);
              completed = completed + hours;
              newTimeString = [toDo, WIP, underReview, completed, closed].join(',');
              break;
            }
            default: {
              console.log('Unknown task status:', taskToBeUpdated.status);
            }
          }

          const indianTimeISOString = currentDateTime.toISOString();

          await prisma.taskHistory.update({
            where: {
              id: taskHistoryList[0].id,
            },
            data: {
              time: newTimeString,
              endDate: indianTimeISOString,
            },
          });

          await prisma.taskHistory.create({
            data: {
              taskId: taskId,
              userId: user.userId,
              startDate: indianTimeISOString,
              sprint: String(taskToBeUpdated.sprintId),
              time: '0,0,0,0,0',
            },
          });

          return res.status(200).json({ message: 'Task updated successfully' });
        }
      }
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error occurred during task update:', error);

    // Respond with a proper error message
    res.status(500).json({ message: `Error occurred: ${error.message}` });

    // If you are using custom error handling middleware, you can propagate the error further
    return next(new AppError('Some error occurred', 500));
  }
});

export const updateSubTask = catchAsync(async (req, res, next) => {
  const { subTaskId,subTaskStatus, subTaskAssignee, subTaskDescription  } = req.body;

  try {

    const user = await prisma.user.findFirst({
      where:{
        username: subTaskAssignee
      }
    })

    if(!isEmpty(subTaskStatus)){
      const subTask = await prisma.subtask.findFirst({
        where:{
          id: subTaskId
        }
      })

      if(subTask.status === 'To Do' && ( subTaskStatus === 'Under Review' || subTaskStatus === 'Completed')){
        return next(new AppError(`Cannot change status from "To Do" to : ${subTaskStatus}`, 500))
      }

      if(subTask.status === 'Work In Progress' && ( subTaskStatus === 'To Do' || subTaskStatus === 'Completed')){
        return next(new AppError(`Cannot change status from "Work In Progress" to : ${subTaskStatus}`, 500))
      }

      if(subTask.status === 'Under Reviews' && ( subTaskStatus === 'To Do' || subTaskStatus === 'Work In Progress')){
        return next(new AppError(`Cannot change status from "Under Reviews" to : ${subTaskStatus}`, 500))
      }

      if(subTask.status === 'Completed' && ( subTaskStatus === 'To Do' || subTaskStatus === 'Work In Progress' || subTaskStatus === 'Under Reviews')){
        return next(new AppError(`Cannot change status from "Completed" to : ${subTaskStatus}`, 500))
      }
    }

    const subTask = await prisma.subtask.update({
      where: {
        id: subTaskId,
      },
      data:{
        description: subTaskDescription,
        status: subTaskStatus,
        assignedUserId: user.userId
    }
    });
    res.status(200).json({ message: `Task updated Successfully` });
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }

});

export const uploadAttachment = catchAsync(async (req, res, next) => {
  const { fileBase64, fileName, taskId, uploadedBy,} = req.body;
  try {
    await prisma.$transaction(async (prisma) => {

      const currentDateTime = new Date();
      const indianTimeISOString = currentDateTime.toISOString();

    const user = await prisma.user.findFirst({
      where:{
        email: uploadedBy
      }
    })

      const attachment = await prisma.attachment.create({
        data:{
          fileBase64: fileBase64,
        fileName: fileName,
        taskId: taskId,
        uploadedById: user.userId
        }
      })
      if(attachment){
          const taskActivity = await prisma.taskActivity.create({
            data: {
              taskId: Number(taskId),
              userId: user.userId,
              username: user.username,
              date: indianTimeISOString,
              activity: ` Uploaded an attachment : ${attachment.fileName}`
            }
          })
        
      }
      return next(new SuccessResponse("Attachment uploaded Successfully", 200));
    })
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error uploading Attachment", 400));
  }
});

export const uploadSubTaskAttachment = catchAsync(async (req, res, next) => {
  const { fileBase64, fileName, subTaskId, uploadedBy,} = req.body;
  try {

    const user = await prisma.user.findFirst({
      where:{
        email: uploadedBy
      }
    })

      const attachment = await prisma.attachment.create({
        data:{
          fileBase64: fileBase64,
        fileName: fileName,
        subTaskId: subTaskId,
        uploadedById: user.userId
        }
      })
      if(attachment)
      return next(new SuccessResponse("Attachment uploaded Successfully", 200));

  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error uploading Attachment", 400));
  }
});

export const deleteAttachment = catchAsync(async (req, res, next) => {
  const { taskId, isSubTask, email} = req.query;
  try {
    if(isSubTask === 'true'){
      const deletedAttachment = await prisma.attachment.deleteMany({
        where: {
          subTaskId: Number(taskId),  
        }, 
      });
        if(deletedAttachment)
        return next(new SuccessResponse("Attachment deleted Successfully", 200));
    }else{
      const attachment = await prisma.attachment.findFirst({
        where: {
          taskId: Number(taskId),  
        },
      });
    const deletedAttachment = await prisma.attachment.deleteMany({
      where: {
        taskId: Number(taskId),  
      },
    });
      if(deletedAttachment){
        const currentDateTime = new Date();
        const indianTimeISOString = currentDateTime.toISOString();
        const user = await prisma.user.findFirst({
          where:{
            email: email
          },
          select:{
            userId: true,
            username: true
          }
        })
        const taskActivity = await prisma.taskActivity.create({
          data: {
            taskId: Number(taskId),
            userId: user.userId,
            username: user.username,
            date: indianTimeISOString,
            activity: ` deleted an attachment : ${attachment.fileName}`
          }
      })
    }
      return next(new SuccessResponse("Attachment deleted Successfully", 200));
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error deleting Attachment", 400));
  }
});

export const downloadAttachment = catchAsync(async (req, res, next) => {
  const { taskId, isSubTask} = req.query;
  const isSubTaskBool = Boolean(isSubTask);
  try {
    if(isSubTaskBool === true){
      const downloadAttachment = await prisma.attachment.findFirst({
        where: {
          subTaskId: Number(taskId),  // Replace with the ID of the user to delete
        },
      });
        if(downloadAttachment)
        return res.status(200).json(downloadAttachment);
    }else{
    const downloadAttachment = await prisma.attachment.findFirst({
      where: {
        taskId: Number(taskId),  // Replace with the ID of the user to delete
      },
    });
      if(downloadAttachment)
      return res.status(200).json(downloadAttachment);
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error downloading Attachment", 400));
  }
});

export const createSubTask = catchAsync(async (req, res, next) => {
  const { title, taskId, status, startDate , sprintId, dueDate, description, authorUserId, assignedUserId} = req.body;
  try {

    const authorUser = await prisma.user.findFirst({
      where:{
        email: authorUserId
      }
    })
    const date = new Date(startDate); 
    const isoStartTime = date.toISOString();
    const endDate = new Date(dueDate); 
    const isoDueTime = endDate.toISOString();
    const subTask = await prisma.subtask.create({
      data:{
        title,
      description,
      status,
      taskId,
      startDate: isoStartTime,
      dueDate: isoDueTime,
      authorUserId: authorUser.userId,
      assignedUserId: Number(assignedUserId)
      }
    })
    return next(new SuccessResponse("SubTask Created Successfully", 200));

  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error creating Task", 400));
  }
});

export const getSubTask = catchAsync(async (req, res, next) => {
  const { subTaskId } = req.query;
  let resultList = []
  try {
    const subTask = await prisma.subtask.findFirst({
      where: {
        id: Number(subTaskId),
      },
      include:{
        comments: true,
        attachments: true,
        author: {
          select: {
            username: true
          }
        },
        assignee:{
          select:{
            username: true
          }
        }
      }
    });
    res.json(subTask);
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }

});

export const closeCompletedTask = catchAsync(async (req, res, next) => {
  const { taskId, email } = req.query;

  try {

    const task = await prisma.task.findFirst({
      where:{
        id: Number(taskId)
      },
      include:{
        assignee: {
          select: {
            email: true
          }
        },
        subTasks: true
      }
    })

    if (task.assignee.email !== email) {
      return next(new AppError("Cannot close Task assigned to other people", 500));
    }

    if(task.status !== 'Completed'){
      return next(new AppError(`Cannot close Task at "${task.status}" state`, 500));
    }
    
    for (const subTask of task.subTasks) {
    
      if (subTask.status !== "Completed") {
        return next(new AppError("Please complete all the subTasks before closing this task", 500));
      }
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data:{
          status: "Closed"
      }
    });
    return next(new SuccessResponse("Task Closed Successfully", 200));
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }

});

export const getTaskHistory = catchAsync(async (req, res, next) => {
  const { taskId } = req.query;

  await prisma.$transaction(async (prisma) => {

  try {
    const task = await prisma.task.findFirst({
      where: {
        id: Number(taskId)
      }
    })

    const taskHistory = await prisma.taskHistory.findMany({
      where: {
        taskId: Number(taskId),
      }, include:{
        user: {
          select: {
            username: true
          }
        }
      }
    });
    
    const resultList = []

    taskHistory.sort((a, b) => a.id - b.id);
    const currentDateTime = new Date()
    let hoursPassed =0 

    taskHistory.map((historyRecord, index) => {
      let [toDo, WIP, underReview, completed, closed] = historyRecord.time.split(',').map(Number);
      if (index === taskHistory.length - 1) {
        const differenceInMilliseconds = currentDateTime.getTime() - new Date(historyRecord.startDate).getTime();
            const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
            hoursPassed = Math.floor(differenceInMinutes / 60);
        switch(task.status){
          case  "To Do" : {
            const hours = Math.abs(hoursPassed);
            toDo = toDo + hours
            break;
          }
          case  "Work In Progress" : {
            const hours = Math.abs(hoursPassed);
            WIP = WIP + hours
            break;
          }
          case  "Under Review" : {
            const hours = Math.abs(hoursPassed);
            underReview = underReview + hours
            break;
          }
          case  "Completed" : {
            const hours = Math.abs(hoursPassed);
            completed = completed + hours
            break;
          }
        }
      }
      const result = {
        id: historyRecord.id,
        username: historyRecord.user.username,
        assignedFrom: historyRecord.startDate,
        assignedTill: historyRecord.endDate || "" ,
        toDo: toDo,
        WIP: WIP,
        underReview: underReview,
        completed: completed,
        closed: closed,
        totalTime: ((toDo + WIP + underReview+ completed + closed) / 24).toFixed(2)
      }
      resultList.push(result)
    })

    return res.status(200).json(resultList)

  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }
  })
  return next(new AppError("Some error occurred, please try after some time", 500))

});

export const getProjectHoursEstimation = catchAsync(async (req, res, next) => {
  const { projectId } = req.query;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const taskList = await prisma.task.findMany({
        where: {
          projectId: Number(projectId),
        }
      });

      let totalHours = 0
      let consumedHours = 0 
      const currentDateTime = new Date()

      taskList.forEach((task) => {
        totalHours += task.points;

        if (task.inProgressTimeinMinutes !== null && task.inProgressTimeinMinutes !== undefined) {
          // Ensure inProgressTimeinMinutes is a valid number and convert minutes to hours
          consumedHours += Math.floor(Number(task.inProgressTimeinMinutes) / 60);
        } else {
          // Ensure inProgressStartTime is valid
          if (task.inProgressStartTime) {
            const differenceInMilliseconds = currentDateTime.getTime() - new Date(task.inProgressStartTime).getTime();
            const differenceInMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
            
            // If inProgressTimeinMinutes is null, assume 0 and add the calculated difference
            const progressTime = Number(task.inProgressTimeinMinutes || 0) + differenceInMinutes;
            consumedHours += Math.floor(progressTime / 60);
          }
        }
      });


      let hoursOverrun = 0
      if(consumedHours > totalHours){
        hoursOverrun = Math.abs(consumedHours - totalHours)
      }

      const result = {
        totalHours: totalHours,
        consumedHours: consumedHours,
        hoursOverrun: hoursOverrun
      };
      res.json(result);
    })
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }

});

export const getMentionedUsers = catchAsync(async (req, res, next) => {
  const { name } = req.query;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const userList = await prisma.user.findMany({
        where: {
          username: {
            startsWith: name,
            mode: 'insensitive',
          },
        },
        select: {
          userId: true,
          username: true,
        },
        take: 5, 
      });
      
      res.json(userList);
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }

});

export const getUserData = catchAsync(async (req, res, next) => {
  const { username } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
        include: {
          profilePicture: {
            select: {
              base64: true,
            },
          },
          projects: {
            select: {
              name: true,
            },
          },
          teams: {
            select: {
              name: true,
            },
          }
        },
      });
      res.json(user);
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }

});

export const getProject = catchAsync(async (req, res, next) => {
  const { projectId } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const project = await prisma.project.findFirst({
        where: {
          id : Number(projectId)
        },
        include: {
          user: {
            select: {
              username: true
            }
          }
        }
      })

      const projectAttachmentList = await prisma.projectAttachments.findMany({
        where: {
          projectId: Number(projectId)
        }
      })

      const result = {
        id: project.id,
        projectName: project.name,
        projectDescription: project.description,
        projectCode: project.code,
        clientName: project.clientName,
        startDate: project.startDate,
        dueDate: project.endDate,
        status: project.status,
        projectManager: project.user.username,
        projectAttachments: projectAttachmentList
      };
      res.json(result);
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }
});

export const updateProjectStatus = catchAsync(async (req, res, next) => {
  const { projectId, email } = req.query;
  const {status} = req.body
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email
        }
      })

      const project = await prisma.project.findFirst({
        where: {
          id : Number(projectId)
        }
      })

      if(project.projectManager !== user.userId){
        return next(new AppError('Only Project Mananger can edit Project',500))
      }

      const result = await prisma.project.update({
        where: {
          id: Number(projectId)
        },
        data: {
          status: status
        }
      })
      
      return next(new SuccessResponse('Project Updated Successfully',200))
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }
});

export const updateProject = catchAsync(async (req, res, next) => {
  const {email, projectId,projectManager,clientName,projectDescription} = req.body
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email
        }
      })

      const project = await prisma.project.findFirst({
        where: {
          id : Number(projectId)
        }
      })

      if(project.projectManager !== user.userId){
        return next(new AppError('Only Project Mananger can edit Project',500))
      }

      const projectManagerUser = await prisma.user.findFirst({
        where:{
          username : projectManager
        }
      })

      const result = await prisma.project.update({
        where: {
          id: Number(projectId)
        },
        data: {
          projectManager: projectManagerUser.userId,
          clientName: clientName,
          description: projectDescription
        }
      })
      
      return next(new SuccessResponse('Project Updated Successfully',200))
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }
});

export const uploadProjectAttachment = catchAsync(async (req, res, next) => {
  const { fileBase64, fileName, projectId, email,} = req.body;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email
        }
      })

      const project = await prisma.project.findFirst({
        where: {
          id : Number(projectId)
        }
      })

      if(project.projectManager !== user.userId){
        return next(new AppError('Only Project Mananger can upload Attachments',500))
      }

      const attachment = await prisma.projectAttachments.create({
        data: {
          fileBase64: fileBase64,
          fileName: fileName,
          uploadedBy: {
            connect: {userId: user.userId}
          },
          project: {
            connect: {id: projectId}
          }
        }
      })
      
      return next(new SuccessResponse('Attachment Uploaded Successfully',200))
    })
  } catch (error) {
    console.log(error)
    return next(new AppError('Error during file upload',200))
  }
});

export const deleteProjectAttachment = catchAsync(async (req, res, next) => {
  const { attachmentId, email, projectId} = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email
        }
      })

      const project = await prisma.project.findFirst({
        where: {
          id : Number(projectId)
        }
      })

      if(project.projectManager !== user.userId){
        return next(new AppError('Only Project Mananger can upload Attachments',500))
      }

      const attachment = await prisma.projectAttachments.delete({
        where: {
          id: Number(attachmentId)
        }
      })
      
      return next(new SuccessResponse('Attachment Deleted Successfully',200))
    })
  } catch (error) {
    console.log(error)
    return next(new AppError('Error during file deletion',200))
  }
});

export const downloadProjectAttachment = catchAsync(async (req, res, next) => {
  const { attachmentId} = req.query;
  try {
    await prisma.$transaction(async (prisma) => {

      const attachment = await prisma.projectAttachments.findFirst({
        where: {
          id: Number(attachmentId)
        }
      })

      const result = {
        id: attachment.id,
        fileBase64: attachment.fileBase64,
        fileName: attachment.fileName
      }
      return res.status(200).json(result)
    })
  } catch (error) {
    console.log(error)
    return next(new AppError('Error during file deletion',200))
  }
});

export const getTaskActivity = catchAsync(async (req, res, next) => {
  const { taskId} = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      let resultList =[]
      const taskActivityList = await prisma.taskActivity.findMany({
        where: {
          taskId: Number(taskId)
        }
      })

      taskActivityList.map((activity) => {
        resultList.push({
          id: activity.id,
          username: activity.username,
          date: activity.date,
          activity: activity.activity
        });
      })
      
      return res.status(200).json(resultList)
    })
  } catch (error) {
    console.log(error)
    return next(new AppError('Error during getting task activity',200))
  }
});

export const createBulkTasks = catchAsync(async (req, res, next) => {
  const taskList = req.body;
  try {
     await prisma.$transaction(async (prisma) => {
    let errorFlag = "";
  
    const authorUser = await prisma.user.findFirst({
      where: {
        email: taskList[0].authorUserId
      }
    });
  
    const project = await prisma.project.findFirst({
      where: {
        id: taskList[0].projectId
      }
    });
  
      const taskPromises = taskList.map(async (taskObj) => {
        
          const startDate = taskObj.startDate;
          const dateObj = new Date(startDate);
          const isoStartDateString = dateObj.toISOString();
          const endDate = taskObj.dueDate;
          const endDateObj = new Date(endDate);
          const isoDueDateString = endDateObj.toISOString();
          // Validate the start and due dates
          if (isNaN(new Date(isoDueDateString).getTime()) || isNaN(new Date(isoStartDateString).getTime())) {
            errorFlag= 'Please check the data of Start Date and Due Date'
            throw new Error('Invalid date format');
          }
  
        const sprint = await prisma.sprint.findFirst({
          where: {
            title: taskObj.sprintId
          }
        });
  
        let assignee;
          assignee = await prisma.user.findFirst({
            where: {
              email: taskObj.assignedUserId
            }
          });
          if(!assignee){
            errorFlag= 'Please check Assignee mail ids'
            throw new Error('Invalid date format');
          }
  
        if (assignee === null || assignee === undefined) {
          errorFlag = 'Please check Assignee mail ids';
          throw new Error('Please check Assignee mail ids'); 
        }
  
          const task = await prisma.task.create({
            data: {
              title: taskObj.title,
              description: taskObj.description,
              status: "To Do",
              priority: taskObj.priority,
              tags: taskObj.tags,
              startDate: isoStartDateString,
              dueDate: isoDueDateString,
              points: Number(taskObj.points),
              projectId: taskObj.projectId,
              authorUserId: authorUser.userId,
              sprintId: Number(sprint.id),
              assignedUserId: Number(assignee.userId)
            }
          });

          const currentDateTime = new Date();
          const indianTimeISOString = currentDateTime.toISOString();
          const taskCode = project.code + (String(task.id).padStart(6, '0'));

          if(task){
            const taskActivity = await prisma.taskActivity.create({
              data: {
                taskId: task.id,
                userId: authorUser.userId,
                username: authorUser.username,
                date: indianTimeISOString,
                activity: ` created task : ${taskCode}`
              }
            })
          }
  
  
          const updatedTask = await prisma.task.update({
            where: {
              id: task.id,
            },
            data: {
              code: taskCode
            }
          });
  
          const taskHistory = await prisma.taskHistory.create({
            data: {
              taskId: task.id,
              userId: Number(assignee.userId),
              startDate: indianTimeISOString,
              sprint: String(sprint.id),
              time: "0,0,0,0,0",
            }
          });

          if(!task || !updatedTask || !taskHistory){
            errorFlag = 'Error occurred while creating task';
            throw new Error('Error occurred while creating task'); 
          }
      });
  
      await Promise.all(taskPromises); // Ensure all tasks are processed before finishing
  
    if (isEmpty(errorFlag)) {
      return next(new SuccessResponse("Tasks Created Successfully", 200));
    } else {
      return next(new AppError(errorFlag, 500)); // Return the error message
    }
     })
  } catch (error) {
    console.log(error);
    return next(new AppError('Unexpected error', 500));
  }
  
});