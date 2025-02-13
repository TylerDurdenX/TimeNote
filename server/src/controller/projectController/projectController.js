import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import { isEmpty } from "../../utils/genericMethods.js";
import SuccessResponse from "../../utils/SuccessResponse.js";

export const createProject = catchAsync(async (req, res, next) => {
  const { title, description, startDate, endDate, projectManager } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: projectManager,
      },
    });
    console.log(user.username);

    const newProject = await prisma.project.create({
      data: {
        name : title,
        description,
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
            status: project.status | "",
            startDate: project.startDate,
            endDate: project.endDate,
            projectManager: project.user.username,
            completionStatus: 0
          });
        }else{
          resultList.push({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status || "In Progress",
            startDate: project.startDate,
            endDate: project.endDate,
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

      console.log(projects)

      projects.map((project) => {
        console.log(project.users)
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
            status: project.status | "",
            startDate: project.startDate,
            endDate: project.endDate,
            projectManager: project.user.username,
            completionStatus: 0
          });
        }else{
          resultList.push({
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status || "In Progress",
            startDate: project.startDate,
            endDate: project.endDate,
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
  const { id, sprint, assignedTo, priority } = req.query;
  try{
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
    })

  res.json(tasks);
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

export const updateTaskStatus = catchAsync(async (req, res, next) => {
  const { taskId, email } = req.query;
  const { status } = req.body;

  const result = await prisma.$transaction(async (prisma) => {

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

    if(task.status === 'Under Reviews' && ( status === 'To Do' || status === 'Work In Progress')){
      return next(new AppError(`Cannot change status from "Under Reviews" to : ${status}`, 500))
    }

    if(task.status === 'Completed' && ( status === 'To Do' || status === 'Work In Progress' || status === 'Under Reviews')){
      return next(new AppError(`Cannot change status from "Completed" to : ${status}`, 500))
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data:{
          status: status
      }
    });

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
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }
  })
  return next(new AppError("Some Error Occurred", 500))
});

export const updateTaskAssignee = catchAsync(async (req, res, next) => {
  const { taskId } = req.query;
  const { email } = req.query;

  const result = await prisma.$transaction(async (prisma) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email
      }
    })

    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data:{
          assignedUserId: user.userId
      }
    });

    const taskHistoryList = await prisma.taskHistory.findMany({
      where: {
        taskId: updatedTask.id
      }
    })


    taskHistoryList.sort((a, b) => b.id - a.id);
    const [toDo, WIP, underReview, completed, closed] = taskHistoryList[0].time.split(',').map(Number);

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

    console.log(newTimeString)
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

    res.json("Task status updated successfully");
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }
})
return next(new AppError("Some Error Occurred", 500))
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

export const addComment = catchAsync(async (req, res, next) => {
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
      taskId,
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
  const { taskId, taskPoints, assignee, taskDescription  } = req.body;

  const result = await prisma.$transaction(async (prisma) => {
  try {

    const user = await prisma.user.findFirst({
      where:{
        username: assignee
      }
    })

    const task = await prisma.task.update({
      where: {
        id: taskId,
      },
      data:{
        description: taskDescription,
        points: taskPoints,
        assignedUserId: user.userId
    }
    });

    const taskHistoryList = await prisma.taskHistory.findMany({
      where: {
        taskId: task.id
      }
    })

    taskHistoryList.sort((a, b) => b.id - a.id);
    let [toDo, WIP, underReview, completed, closed] = taskHistoryList[0].time.split(',').map(Number);

    let newTimeString = ""
    switch(task.status){
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
        taskId: task.id,
        userId: user.userId,
        startDate: indianTimeISOString,
        sprint: String(task.sprintId),
        time: "0,0,0,0,0",
      }
    })

    res.status(200).json({ message: `Task updated Successfully` });
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }
  })
  return next(new AppError("Some Error Occurred", 500))
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
      if(attachment)
      return next(new SuccessResponse("Attachment uploaded Successfully", 200));

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
  const { taskId, isSubTask} = req.query;
  try {
    const isSubTaskBool = Boolean(isSubTask);
    if(isSubTaskBool === true){
      const deletedAttachment = await prisma.attachment.deleteMany({
        where: {
          subTaskId: Number(taskId),  // Replace with the ID of the user to delete
        },
      });
        if(deletedAttachment)
        return next(new AppError("Attachment deleted Successfully", 200));
    }else{
    const deletedAttachment = await prisma.attachment.deleteMany({
      where: {
        taskId: Number(taskId),  // Replace with the ID of the user to delete
      },
    });
      if(deletedAttachment)
      return next(new AppError("Attachment deleted Successfully", 200));
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
    
    // Use for...of to check the status of each subtask
    for (const subTask of task.subTasks) {
      console.log(subTask.status);
    
      // If a subtask is not completed, return an error
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

    taskHistory.map((historyRecord) => {
      const [toDo, WIP, underReview, completed, closed] = historyRecord.time.split(',').map(Number);
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