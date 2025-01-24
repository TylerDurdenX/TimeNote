import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { prisma } from "../server.js";
import {isEmpty, extractTitles} from "../utils/genericMethods.js"

//get list of users form the table
export const getUsersList = catchAsync(async (req, res, next) => {
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
      return res.status(200).json(
        await prisma.user.findMany({
          select: {
            userId: true,
            username: true,
            designation: true,
            profilePicture: {
              select: {
                base64: true,
              },
            },
          },
        })
      );
    } else {
      // Case to be handled in case of other users
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error getting Users List", 400));
  }
});

export const mapRolesToUser = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    const roles = await prisma.role.findMany({
      where: {
        code: {
          in: ["ADMIN"],
        },
      },
    });

    try {
      await prisma.user.update({
        where: { email: email },
        data: {
          roles: {
            connect: roles.map((role) => ({ id: role.id })),
          },
        },
      });
      res.status(200).json({
        status: "success",
        message: `Roles updated for user : ${user.username}`,
      });
    } catch (error) {
      console.log(error);
      return next(
        new AppError(
          "There was an error sending the email! Please try again later",
          400
        )
      );
    }
    return res.status(200).json(user.roles);
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error getting authorities", 400));
  }
});

export const getUserDetails = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  try {
    const user = await prisma.user.findFirst({
      where: {
        userId: Number(id),
      },
      include: {
        profilePicture: {
          select: {
            base64: true,
          },
        },
        roles: {
          select: {
            name: true,
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
        },
        reportsTo: {
          select: {
            username: true,
          },
        },
        reports: {
          select: {
            username: true,
          },
        },
      },
    });
    const {
      password,
      profilePictureId,
      reportsToId,
      resetPasswordOTP,
      otpExpires,
      createdAt,
      updatedAt,
      ...newObj
    } = user;
    return res.status(200).json(newObj);
  } catch (error) {
    console.error(error);
    return next(
      new AppError("There was an error fetching user details : " + error, 400)
    );
  }
});

export const getListOfObjects = catchAsync(async (req, res, next) => {
  const { entityName } = req.query;
  try {
    if (entityName === "Project") {
      const result = await prisma.$queryRaw`
  SELECT name AS title, 1 AS misc 
  FROM "Project"`;
      return res.status(200).json(result);
    } else if (entityName === "Team") {
      const result = await prisma.$queryRaw`
      SELECT name AS title, 1 AS misc 
      FROM "Team"`;
      return res.status(200).json(result);
    } else if (entityName === "Role") {
      const result = await prisma.$queryRaw`
      SELECT code AS title, 1 AS misc 
      FROM "Role"`;
      return res.status(200).json(result);
    } else {
      const result = await prisma.$queryRaw`
       SELECT username AS title, email AS misc 
       FROM "User"`;
      return res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
    return next(
      new AppError("There was an error fetching user details : " + error, 400)
    );
  }
});

export const updateUserDetailsData = catchAsync(async (req, res, next) => {
  const { reportsTo, projects, teams, roles} = req.body;
  const {email} = req.query
  
  try {
    // Using Prisma transaction to wrap the operations
    const result = await prisma.$transaction(async (prisma) => {

      
      if(!isEmpty(projects)){
        const dbroject = await prisma.project.findMany({
          where:{
            name: {
              in: extractTitles(projects),}
          }
        });

        const currentProjects = await prisma.user.findUnique({
          where: { email: email },
          select: { projects: { select: { id: true } } },
        });
        await prisma.user.update({
          where: { email: email },
          data: {
            projects: {
              disconnect: currentProjects?.projects.map(project => ({ id: project.id })),
              connect: dbroject.map((project) => ({ id: project.id })),
            },
          },
        });
    }else{
      const currentProjects = await prisma.user.findUnique({
        where: { email: email },
        select: { projects: { select: { id: true } } },
      });
      await prisma.user.update({
        where: { email: email },
        data: {
          projects: {
            disconnect: currentProjects?.projects.map(project => ({ id: project.id })),
          },
        },
      });
    }
      
    if(!isEmpty(teams)){
      const dbTeams = await prisma.team.findMany({
        where:{
          name: {
            in: extractTitles(teams),}
        }
      });
      
      const currentTeams = await prisma.user.findUnique({
        where: { email: email },
        select: { teams: { select: { id: true } } },
      });
      await prisma.user.update({
        where: { email: email },
        data: {
          teams: {
            disconnect: currentTeams?.teams.map(team => ({ id: team.id })),
            connect: dbTeams.map((team) => ({ id: team.id })),
          },
        },
      });
    }else{
      const currentTeams = await prisma.user.findUnique({
        where: { email: email },
        select: { teams: { select: { id: true } } },
      });
      await prisma.user.update({
        where: { email: email },
        data: {
          teams: {
            disconnect: currentTeams?.teams.map(team => ({ id: team.id }))
          },
        },
      });
    }

    if(!isEmpty(roles)){
      const dbRoles = await prisma.role.findMany({
        where:{
          code: {
            in: extractTitles(roles),}
        }
      });
      const currentRoles = await prisma.user.findUnique({
        where: { email: email },
        select: { roles: { select: { id: true } } },
      });
      await prisma.user.update({
        where: { email: email },
        data: {
          roles: {
            disconnect: currentRoles?.roles.map(role => ({ id: role.id })),
            connect: dbRoles.map((role) => ({ id: role.id })),
          },
        },
      });
    }else{
      const currentRoles = await prisma.user.findUnique({
        where: { email: email },
        select: { roles: { select: { id: true } } },
      });
      if(currentRoles){
        await prisma.user.update({
          where: { email: email },
          data: {
            roles: {
              disconnect: currentRoles?.roles.map(role => ({ id: role.id }))
            },
          },
        });
      }
      
    }

    if(!isEmpty(reportsTo)){

      const manager = await prisma.user.findFirst({
        where: {
          email: reportsTo
        }
      })
      
      await prisma.user.update({
        where: { email: email },
        data: {
          reportsTo: {
            connect: {
              userId: manager.userId
            }
          }
        }, 
      });
    }else{
      await prisma.user.update({
        where: { email: email },
        data: {
          reportsTo: {
            disconnect: true,  // Removes the reporting relationship
          }, 
        },
      });
    }

      //return [project1, project2, project3]; // Return the result if needed
    });

    
  } catch (error) {
    console.error('Transaction failed:', error);
      return next(new AppError("There was an error updating user details", error));
  } finally {
    await prisma.$disconnect();
  }
  res.status(200).json({
    status: "success",
    message: `Details updated for user`,
  });
});

  export const getUserHierarchyData = catchAsync(async (req, res, next) => {
    const { userId } = req.query;
    try {
      let userList = []

      let user = await prisma.user.findFirst({
        where: {
          userId: Number(userId),
        },
        include: {
          profilePicture :{
            select: {
              base64: true,
            },
          }
        }
      });

      let selectedUser = user

      if(!user){
        return next(
          new AppError("No User Found : " , 302)
        );
      }

      const {
        password,
        profilePictureId,
        resetPasswordOTP,
        otpExpires,
        createdAt,
        updatedAt,
        email,
        phoneNumber,
        ...newObj
      } = user;
      userList.push(newObj)
      while(!isEmpty(user.reportsToId)){
        let otherUser = await prisma.user.findFirst({
          where: {
            userId: user.reportsToId,
          },
          include: {
            profilePicture :{
              select: {
                base64: true,
              },
            }
          }
        });
        if(otherUser){
        const {
          password,
          profilePictureId,
          resetPasswordOTP,
          otpExpires,
          createdAt,
          updatedAt,
          email,
          phoneNumber,
          ...newObj
        } = otherUser;
        userList.push(newObj)
        user = otherUser
      }else{
        break
      }
      }

      const reportingUsersList = await prisma.user.findMany({
        where : {
          reportsTo: selectedUser
        }, include: {
          profilePicture :{
            select: {
              base64: true,
            },
          }
        }
      })      

      if(reportingUsersList){

        for (let i = 0; i < reportingUsersList.length; i++) {
          const {
            password,
            profilePictureId,
            resetPasswordOTP,
            otpExpires,
            createdAt,
            updatedAt,
            email,
            phoneNumber,
            ...newObj
          } = reportingUsersList[i];
          userList.push(newObj)
        }
      }

      return res.status(200).json(userList);
    } catch (error) {
      console.error(error);
      return next(
        new AppError("There was an error fetching user hierarchy Data : " + error, 400)
      );
    }
  });