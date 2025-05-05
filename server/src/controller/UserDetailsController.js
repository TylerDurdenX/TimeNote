import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { prisma } from "../server.js";
import { isEmpty, extractTitles } from "../utils/genericMethods.js";
import SuccessResponse from "../utils/SuccessResponse.js";
import { getFinancialYearRange } from "./leaveController/leaveController.js";
import { compressBase64 } from "./attendanceController/attendanceController.js";

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
        let resultList = [];
        const usersList = await prisma.user.findMany({
          where: whereCondition,
          select: {
            userId: true,
            username: true,
            designation: true,
            userStatus: true,
            profilePicture: {
              select: {
                base64: true,
              },
            },
          },
          skip: (pageNumber - 1) * pageSize, // Skip the first (page - 1) * limit users
          take: pageSize,
        });

        await Promise.all(
          usersList.map(async (userObj) => {
            if (!isEmpty(userObj.profilePicture)) {
              const compressedBase64 = await compressBase64(
                userObj.profilePicture.base64,
                25
              );

              userObj.profilePicture.base64 = compressedBase64;
            }
            resultList.push(userObj);
          })
        );

        return res.status(200).json(resultList);
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
              userStatus: true,
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
              userStatus: true,
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

          let resultList = [];
          await Promise.all(
            updatedUsersList.map(async (userObj) => {
              if (!isEmpty(userObj.profilePicture)) {
                const compressedBase64 = await compressBase64(
                  userObj.profilePicture.base64,
                  25
                );

                userObj.profilePicture.base64 = compressedBase64;
              }
              resultList.push(userObj);
            })
          );

          return res.status(200).json(resultList);
        } else {
          delete whereCondition.projects;
          whereCondition.reportsToId = user.userId;

          const usersList = await prisma.user.findMany({
            where: whereCondition,
            select: {
              userId: true,
              username: true,
              designation: true,
              userStatus: true,
              profilePicture: {
                select: {
                  base64: true,
                },
              },
            },
            skip: (pageNumber - 1) * pageSize, // Skip the first (page - 1) * limit users
            take: pageSize,
          });
          let resultList = [];
          await Promise.all(
            usersList.map(async (userObj) => {
              if (!isEmpty(userObj.profilePicture)) {
                const compressedBase64 = await compressBase64(
                  userObj.profilePicture.base64,
                  25
                );

                userObj.profilePicture.base64 = compressedBase64;
              }
              resultList.push(userObj);
            })
          );

          return res.status(200).json(resultList);
        }
      } else {
        const usersList = await prisma.user.findMany({
          where: {
            reportsToId: user.userId,
          },
          select: {
            userId: true,
            username: true,
            designation: true,
            userStatus: true,
            profilePicture: {
              select: {
                base64: true,
              },
            },
          },
          skip: (pageNumber - 1) * pageSize, // Skip the first (page - 1) * limit users
          take: pageSize,
        });
        let resultList = [];
        await Promise.all(
          usersList.map(async (userObj) => {
            if (!isEmpty(userObj.profilePicture)) {
              const compressedBase64 = await compressBase64(
                userObj.profilePicture.base64,
                25
              );

              userObj.profilePicture.base64 = compressedBase64;
            }
            resultList.push(userObj);
          })
        );

        return res.status(200).json(resultList);
      }
    });
  } catch (error) {
    console.log(error);
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
        where: {
          email: email,
        },
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
    console.log(error);
    return next(
      new AppError("There was an error fetching user details : " + error, 400)
    );
  }
});
export const getUserPersonalDetails = catchAsync(async (req, res, next) => {
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
          userDetails: true,
        },
      });

      const { startDate, endDate } = getFinancialYearRange();

      const leavesTaken = await prisma.leaves.findMany({
        where: {
          userId: user.userId,
          date: {
            gte: startDate,
            lte: endDate,
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

      if (newObj.userDetails) {
        newObj.userDetails.claimedLeaves = String(leavesTaken.length);
      }
      return res.status(200).json(newObj);
    });
  } catch (error) {
    console.log(error);
    return next(
      new AppError("There was an error fetching user details : " + error, 400)
    );
  }
});

export const saveUserPersonalDetails = catchAsync(async (req, res, next) => {
  const {
    address,
    base64,
    bloodGroup,
    dateOfBirth,
    department,
    designation,
    email,
    emergencyContact,
    employeeGrade,
    employeeId,
    employeeStatus,
    employmentType,
    gender,
    issuedDevices,
    joiningDate,
    personalEmail,
    phoneNumber,
    totalLeaves,
    userId,
    username,
    workLocation,
  } = req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.update({
        where: {
          userId: userId,
        },
        data: {
          email: email,
          username: username,
          designation: designation,
          phoneNumber: phoneNumber,
        },
        include: {
          profilePicture: true,
        },
      });

      if (!isEmpty(base64)) {
        await prisma.profilePicture.update({
          where: { id: user.profilePicture.id },
          data: { base64 },
        });
      }

      if (user.userDetailsId !== null) {
        let dob = null;
        let joinDate = null;
        if (!isEmpty(dateOfBirth)) {
          dob = new Date(dateOfBirth);
        }
        if (!isEmpty(joiningDate)) {
          joinDate = new Date(joiningDate);
        }
        await prisma.userDetails.update({
          where: {
            id: user.userDetailsId,
          },
          data: {
            address: address,
            bloodGroup: bloodGroup,
            dateOfBirth: dob,
            department: department,
            emergencyContact: emergencyContact,
            employeeGrade: employeeGrade,
            employeeId: employeeId,
            employeeStatus: employeeStatus,
            employementType: employmentType,
            gender: gender,
            issuedDevices: issuedDevices,
            joiningDate: joinDate,
            personalEmail: personalEmail,
            totalLeaves: totalLeaves,
            workLocation: workLocation,
          },
        });
      } else {
        let dob = null;
        let joinDate = null;
        if (!isEmpty(dateOfBirth)) {
          dob = new Date(dateOfBirth);
        }
        if (!isEmpty(joiningDate)) {
          joinDate = new Date(joiningDate);
        }
        const userDetails = await prisma.userDetails.create({
          data: {
            address: address,
            bloodGroup: bloodGroup,
            dateOfBirth: dob,
            department: department,
            emergencyContact: emergencyContact,
            employeeGrade: employeeGrade,
            employeeId: employeeId,
            employeeStatus: employeeStatus,
            employementType: employmentType,
            gender: gender,
            issuedDevices: issuedDevices,
            joiningDate: joinDate,
            personalEmail: personalEmail,
            totalLeaves: totalLeaves,
            workLocation: workLocation,
          },
        });

        await prisma.user.update({
          where: {
            userId: userId,
          },
          data: {
            userDetailsId: userDetails.id,
          },
        });
      }

      return next(new SuccessResponse("User data Updated Successfully", 200));
    });
  } catch (error) {
    console.log(error);
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
          where: {
            email: email,
          },
          select: { projects: { select: { id: true } } },
        });
        await prisma.user.update({
          where: {
            email: email,
          },
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
          where: {
            email: email,
          },
          select: { projects: { select: { id: true } } },
        });
        await prisma.user.update({
          where: {
            email: email,
          },
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
          where: {
            email: email,
          },
          select: { teams: { select: { id: true } } },
        });
        await prisma.user.update({
          where: {
            email: email,
          },
          data: {
            teams: {
              disconnect: currentTeams?.teams.map((team) => ({ id: team.id })),
              connect: dbTeams.map((team) => ({ id: team.id })),
            },
          },
        });
      } else {
        const currentTeams = await prisma.user.findUnique({
          where: {
            email: email,
          },
          select: { teams: { select: { id: true } } },
        });
        await prisma.user.update({
          where: {
            email: email,
          },
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
          where: {
            email: email,
          },
          select: { roles: { select: { id: true } } },
        });
        await prisma.user.update({
          where: {
            email: email,
          },
          data: {
            roles: {
              disconnect: currentRoles?.roles?.map((role) => ({ id: role.id })),
              connect: dbRoles.map((role) => ({ id: role.id })),
            },
          },
        });
      } else {
        const currentRoles = await prisma.user.findUnique({
          where: {
            email: email,
          },
          select: { roles: { select: { id: true } } },
        });
        if (currentRoles) {
          await prisma.user.update({
            where: {
              email: email,
            },
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
          where: {
            email: email,
          },
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
          where: {
            email: email,
          },
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

export const createBulkUsers = catchAsync(async (req, res, next) => {
  const usersList = req.body;
  try {
    await prisma.$transaction(async (prisma) => {
      let errorFlag = "";

      const userPromises = usersList.map(async (user) => {
        let joiningDateIsoString = null;
        let dateOfBirthObjISOString = null;
        if (user.joiningDate) {
          const joiningDate = user.joiningDate;
          const joiningDateObj = new Date(joiningDate);
          joiningDateIsoString = joiningDateObj.toISOString();
        }
        if (user.dateOfBirth) {
          const dateOfBirth = user.dateOfBirth;
          const dateOfBirthObj = new Date(dateOfBirth);
          dateOfBirthObjISOString = dateOfBirthObj.toISOString();
        }

        // if (
        //   isNaN(new Date(isoDueDateString).getTime()) ||
        //   isNaN(new Date(isoStartDateString).getTime())
        // ) {
        //   errorFlag = "Please check the data of Start Date and Due Date";
        //   throw new Error("Invalid date format");
        // }

        let oldUser;
        oldUser = await prisma.user.findFirst({
          where: {
            email: user.email,
          },
        });
        if (oldUser !== null) {
          errorFlag = "invalid User mail id";
          throw new Error("Invalid mail id");
        }

        const newUserDetails = await prisma.userDetails.create({
          data: {
            address: user.address,
            employeeId: user.employeeId,
            personalEmail: user.personalEmail,
            bloodGroup: user.bloodGroup,
            employeeGrade: user.employeeGrade,
            gender: user.gender,
            department: user.department,
            joiningDate: joiningDateIsoString,
            dateOfBirth: dateOfBirthObjISOString,
            emergencyContact: user.emergencyContact,
            totalLeaves: user.totalLeaves,
            employeeStatus: user.employeeStatus,
            workLocation: user.workLocation,
            employementType: user.employementType,
            issuedDevices: user.issuedDevices,
          },
        });

        const newUser = await prisma.user.create({
          data: {
            username: user.username,
            email: user.email,
            password: user.password,
            designation: user.designation,
            phoneNumber: user.phoneNumber,
            userDetailsId: newUserDetails.id,
          },
        });
      });

      await Promise.all(userPromises); // Ensure all tasks are processed before finishing

      if (isEmpty(errorFlag)) {
        return next(new SuccessResponse("Users Created Successfully", 200));
      } else {
        return next(new AppError(errorFlag, 500)); // Return the error message
      }
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Unexpected error", 500));
  }
});
