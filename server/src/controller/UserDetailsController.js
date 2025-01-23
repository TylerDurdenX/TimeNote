import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { prisma } from "../server.js";

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
