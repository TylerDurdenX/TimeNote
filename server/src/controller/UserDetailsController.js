import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { prisma } from "../server.js";
import { isEmpty, extractTitles } from "../utils/genericMethods.js";

//get list of users form the table
export const getUsersList = catchAsync(async (req, res, next) => {
  const { email, page, limit, searchQuery } = req.query;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          roles: true,
        },
      });

      let whereCondition = {};

      if (!isEmpty(searchQuery) && searchQuery !== "undefined") {
        whereCondition.username = {
          startsWith: searchQuery.toLowerCase(), // Case insensitive comparison
          mode: "insensitive", // This makes the comparison case-insensitive in Prisma
        };
      }

      if (user.roles.some((role) => role.code === "ADMIN")) {
        return res.status(200).json(
          await prisma.user.findMany({
            where: whereCondition,
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
            skip: (pageNumber - 1) * pageSize, // Skip the first (page - 1) * limit users
            take: pageSize,
          })
        );
      } else if (user.roles.some((role) => role.code === "PROJECT_MANAGER")) {
        const projects = await prisma.project.findMany({
          where: {
            projectManager: user.userId,
          },
        });

        if (!isEmpty(projects)) {
          let projectIdList = [];

          projects.map((project) => {
            projectIdList.push(project.id);
          });

          whereCondition.projects = {
            some: {
              id: {
                in: projectIdList,
              },
            },
          };

          const usersList = await prisma.user.findMany({
            where: {
              projects: {
                some: {
                  id: {
                    in: projectIdList,
                  },
                },
              },
            },
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
            skip: (pageNumber - 1) * pageSize, // Skip the first (page - 1) * limit users
            take: pageSize,
          });

          delete whereCondition.projects;

          whereCondition.reportsToId = user.userId;

          const reportingUsersList = await prisma.user.findMany({
            where: whereCondition,
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
            skip: (pageNumber - 1) * pageSize, // Skip the first (page - 1) * limit users
            take: pageSize,
          });

          const mergedList = [
            ...new Map(
              [...usersList, ...reportingUsersList].map((item) => [
                item.userId,
                item,
              ])
            ).values(),
          ];

          const updatedUsersList = mergedList.filter(
            (userlist) => userlist.userId !== user.userId
          );

          return res.status(200).json(updatedUsersList);
        } else {
          delete whereCondition.projects;
          whereCondition.reportsToId = user.userId;

          return res.status(200).json(
            await prisma.user.findMany({
              where: whereCondition,
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
              skip: (pageNumber - 1) * pageSize, // Skip the first (page - 1) * limit users
              take: pageSize,
            })
          );
        }
      } else {
        return res.status(200).json(
          await prisma.user.findMany({
            where: {
              reportsToId: user.userId,
            },
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
            skip: (pageNumber - 1) * pageSize, // Skip the first (page - 1) * limit users
            take: pageSize,
          })
        );
      }
    });
  } catch (error) {
    console.error("Error during getUsersList" + error);
    return next(new AppError("There was an error getting Users List", 400));
  }
});

export const mapRolesToUser = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  try {
    const result = await prisma.$transaction(async (prisma) => {
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
      return res.status(200).json(user.roles);
    });
  } catch (error) {
    console.error("Error during mapRolesToUser" + error);
    return next(new AppError("There was an error getting authorities", 400));
  }
});

export const getUserDetails = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  try {
    const result = await prisma.$transaction(async (prisma) => {
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
    });
  } catch (error) {
    console.error("Error during getUserDetails" + error);
    return next(
      new AppError("There was an error fetching user details : " + error, 400)
    );
  }
});

export const getListOfObjects = catchAsync(async (req, res, next) => {
  const { entityName } = req.query;
  try {
    const result = await prisma.$transaction(async (prisma) => {
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
      SELECT name AS title, 1 AS misc 
      FROM "Role"`;
        return res.status(200).json(result);
      } else {
        const result = await prisma.$queryRaw`
       SELECT username AS title, email AS misc 
       FROM "User"`;
        return res.status(200).json(result);
      }
    });
  } catch (error) {
    console.error("Error during getListOfObjects" + error);
    return next(
      new AppError("There was an error fetching user details : " + error, 400)
    );
  }
});

export const updateUserBasicDetailsData = catchAsync(async (req, res, next) => {
  const { userId, email, username, designation, phone } = req.body;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const userUpdate = await prisma.user.update({
        where: {
          userId: userId,
        },
        data: {
          email: email,
          username: username,
          designation: designation,
          phoneNumber: phone,
        },
      });

      res.status(200).json({
        status: "success",
        message: `UserData Updated Successfully!`,
      });
    });
  } catch (error) {
    console.log(error);
    return next(
      new AppError("There was an error updating basic user details", error)
    );
  } finally {
    await prisma.$disconnect();
  }
});

export const updateUserDetailsData = catchAsync(async (req, res, next) => {
  const {
    reportsTo,
    projects,
    teams,
    roles,
    selectedTimeOut,
    workingHours,
    isSignoutEnabled,
    isProfilePicModificationEnabled,
  } = req.body;
  const { email } = req.query;

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const userUpdate = await prisma.user.update({
        where: {
          email: email,
        },
        data: {
          idleTimeOut: selectedTimeOut,
          workingHours: workingHours,
          allowSignout: isSignoutEnabled,
          pictureModification: isProfilePicModificationEnabled,
        },
      });

      if (!isEmpty(projects)) {
        const dbProject = await prisma.project.findMany({
          where: {
            name: {
              in: extractTitles(projects),
            },
          },
        });

        const currentProjects = await prisma.user.findUnique({
          where: { email: email },
          select: { projects: { select: { id: true } } },
        });
        await prisma.user.update({
          where: { email: email },
          data: {
            projects: {
              disconnect: currentProjects?.projects.map((project) => ({
                id: project.id,
              })),
              connect: dbProject.map((project) => ({ id: project.id })),
            },
          },
        });
      } else {
        const currentProjects = await prisma.user.findUnique({
          where: { email: email },
          select: { projects: { select: { id: true } } },
        });
        await prisma.user.update({
          where: { email: email },
          data: {
            projects: {
              disconnect: currentProjects?.projects.map((project) => ({
                id: project.id,
              })),
            },
          },
        });
      }

      if (!isEmpty(teams)) {
        const dbTeams = await prisma.team.findMany({
          where: {
            name: {
              in: extractTitles(teams),
            },
          },
        });

        const currentTeams = await prisma.user.findUnique({
          where: { email: email },
          select: { teams: { select: { id: true } } },
        });
        await prisma.user.update({
          where: { email: email },
          data: {
            teams: {
              disconnect: currentTeams?.teams.map((team) => ({ id: team.id })),
              connect: dbTeams.map((team) => ({ id: team.id })),
            },
          },
        });
      } else {
        const currentTeams = await prisma.user.findUnique({
          where: { email: email },
          select: { teams: { select: { id: true } } },
        });
        await prisma.user.update({
          where: { email: email },
          data: {
            teams: {
              disconnect: currentTeams?.teams.map((team) => ({ id: team.id })),
            },
          },
        });
      }

      if (!isEmpty(roles)) {
        const dbRoles = await prisma.role.findMany({
          where: {
            name: {
              in: extractTitles(roles),
            },
          },
        });
        const currentRoles = await prisma.user.findUnique({
          where: { email: email },
          select: { roles: { select: { id: true } } },
        });
        await prisma.user.update({
          where: { email: email },
          data: {
            roles: {
              disconnect: currentRoles?.roles?.map((role) => ({ id: role.id })),
              connect: dbRoles.map((role) => ({ id: role.id })),
            },
          },
        });
      } else {
        const currentRoles = await prisma.user.findUnique({
          where: { email: email },
          select: { roles: { select: { id: true } } },
        });
        if (currentRoles) {
          await prisma.user.update({
            where: { email: email },
            data: {
              roles: {
                disconnect: currentRoles?.roles.map((role) => ({
                  id: role.id,
                })),
              },
            },
          });
        }
      }

      if (!isEmpty(reportsTo)) {
        const manager = await prisma.user.findFirst({
          where: {
            email: reportsTo,
          },
        });

        await prisma.user.update({
          where: { email: email },
          data: {
            reportsTo: {
              connect: {
                userId: manager.userId,
              },
            },
          },
        });
      } else {
        await prisma.user.update({
          where: { email: email },
          data: {
            reportsTo: {
              disconnect: true, // Removes the reporting relationship
            },
          },
        });
      }

      res.status(200).json({
        status: "success",
        message: `UserData Updated Successfully!`,
      });
    });
  } catch (error) {
    console.error("Error during updateUserDetailsData:", error);
    return next(
      new AppError("There was an error updating user details", error)
    );
  } finally {
    await prisma.$disconnect();
  }
});

export const getUserHierarchyData = catchAsync(async (req, res, next) => {
  const { userId } = req.query;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      let userList = [];

      let user = await prisma.user.findFirst({
        where: {
          userId: Number(userId),
        },
        include: {
          profilePicture: {
            select: {
              base64: true,
            },
          },
        },
      });

      if (!user) {
        return next(new AppError("No User Found : ", 302));
      }

      let selectedUser = user;

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
      userList.push(newObj);
      while (!isEmpty(user.reportsToId)) {
        let otherUser = await prisma.user.findFirst({
          where: {
            userId: user.reportsToId,
          },
          include: {
            profilePicture: {
              select: {
                base64: true,
              },
            },
          },
        });
        if (otherUser) {
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
          userList.push(newObj);
          user = otherUser;
        } else {
          break;
        }
      }

      const reportingUsersList = await prisma.user.findMany({
        where: {
          reportsTo: selectedUser,
        },
        include: {
          profilePicture: {
            select: {
              base64: true,
            },
          },
        },
      });

      if (reportingUsersList) {
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
          userList.push(newObj);
        }
      }
      return res.status(200).json(userList);
    });
  } catch (error) {
    console.error("Error during getUserHierarchyData" + error);
    return next(
      new AppError(
        "There was an error fetching user hierarchy Data : " + error,
        400
      )
    );
  }
});
