import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import { isEmpty } from "../../utils/genericMethods.js";

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
  const { id, sprint, assignedTo, priority } = req.query;
  try{
  let whereCondition = {
    projectId: Number(id),
  };

  // Conditionally add `sprint` to the where condition if it's not null or empty
  if (!isEmpty(sprint)) {
    whereCondition.sprintId = Number(sprint);
  }

  // Conditionally find the user if `assignedTo` is provided and not empty
  let assignedUserId;
  if (!isEmpty(assignedTo)) {
    const user = await prisma.user.findFirst({
      where: {
        email: assignedTo,
      },
    });
    if (user) {
      assignedUserId = user.userId;
      whereCondition.assignedUserId = assignedUserId; // Add to whereCondition if assignedTo is valid
    }
  }

  // Conditionally add `priority` to the where condition if it's not null or empty
  if (!isEmpty(priority)) {
    whereCondition.priority = priority;
  }

  // Perform the query with the dynamically built where condition
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
        subTasks: true,
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

  try {

    const user = await prisma.user.findFirst({
      where:{
        username: assignee
      }
    })

    console.log(assignee)
    console.log(user.username)

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
    res.status(200).json({ message: `Task updated Successfully` });
  } catch (error) {
    res.status(500).json({ message: `Error Occurred : ${error.message}` });
  }

});

export const uploadAttachment = catchAsync(async (req, res, next) => {
  const { fileBase64, fileName, taskId, uploadedBy} = req.body;
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
      return next(new AppError("Attachment uploaded Successfully", 200));

  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error uploading Attachment", 400));
  }
});

export const deleteAttachment = catchAsync(async (req, res, next) => {
  const { taskId,} = req.query;
  try {

    const deletedAttachment = await prisma.attachment.deleteMany({
      where: {
        taskId: Number(taskId),  // Replace with the ID of the user to delete
      },
    });
      if(deletedAttachment)
      return next(new AppError("Attachment deleted Successfully", 200));

  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error deleting Attachment", 400));
  }
});

export const downloadAttachment = catchAsync(async (req, res, next) => {
  const { taskId,} = req.query;
  try {

    const downloadAttachment = await prisma.attachment.findFirst({
      where: {
        taskId: Number(taskId),  // Replace with the ID of the user to delete
      },
    });
      if(downloadAttachment)
      return res.status(200).json(downloadAttachment);

  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error downloading Attachment", 400));
  }
});