import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import { isEmpty } from "../../utils/genericMethods.js";

export const createProject = catchAsync(async (req, res, next) => {
  const { name, description, startDate, endDate, projectManager } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: projectManager,
      },
    });
    console.log(user.username);

    const newProject = await prisma.project.create({
      data: {
        name,
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
              username: true, // Only select the 'username' from the related 'User' model
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
          console.log('yes')
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
                  completedTasksCount += 1;  // increment the count
                }
              });
          
              return ((completedTasksCount / totalTasks) * 100).toFixed(2);  // return the calculated completion percentage
            })()
          });
          
        }
      });
      return res.status(200).json(resultList)
    } else {
      // Case to be handled in case of other users
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error getting Projects List", 400));
  }
});

export const getProjectTasks = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: Number(id),
      },
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
        project: true
      },
    });
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
  const { title, description, status, priority, points, startDate, dueDate, tags, assignedUserId, authorUserId, projectId } = req.body;
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
      assignedUserId: Number(assignedUserId)
      }
    })

    res.json(task);
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error creating Task", 400));
  }
});

export const updateTaskStatus = catchAsync(async (req, res, next) => {
  const { taskId } = req.query;
  const { status } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data:{
          status: status
      }
    });
    res.json("Task status updated successfully");
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }

});

export const updateTaskAssignee = catchAsync(async (req, res, next) => {
  const { taskId } = req.query;
  const { email } = req.query;

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
    res.json("Task status updated successfully");
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
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