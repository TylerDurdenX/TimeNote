import catchAsync from "../utils/catchAsync.js";
import { prisma } from "../server.js";
import AppError from "../utils/appError.js";

export const getUser = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: { profilePicture: true },
      });

      if (!dbUser) {
        return next(new AppError("No user found", 400));
      }

      if (dbUser.profilePicture) {
        res.status(200).json({
          user: {
            name: dbUser.username,
            email: dbUser.email,
            avatar: dbUser.profilePicture.base64,
          },
        });
      } else {
        res.status(200).json({
          user: {
            name: dbUser.username,
            email: dbUser.email,
            avatar: "",
          },
        });
      }
    });
  } catch (error) {
    console.log("Error during getUser" + error);
    return next(new AppError("There was an error fetching user details", 400));
  }
});

export const updateUserProfilePicture = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  const { base64 } = req.body;
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: { profilePicture: true },
      });

      if (user.profilePictureId === null) {
        await prisma.profilePicture.create({
          data: {
            user: {
              connect: { userId: user.userId }, // Nested object to connect to the existing user.
            },
            base64: base64,
          },
        });

        res.status(200).json({
          status: "success",
          message: `Profile picture updated for user : ${user.username}`,
        });
      } else {
        await prisma.profilePicture.update({
          where: { id: user.profilePicture.id },
          data: { base64 },
        });

        res.status(200).json({
          status: "success",
          message: `Profile picture updated for user : ${user.username}`,
        });
      }
    });
  } catch (error) {
    console.log("Error during updateUserProfilePicture" + error);
    return next(new AppError("There was an error getting alert count", 400));
  }
});

export const getUserCount = catchAsync(async (req, res, next) => {
  const result = await prisma.$queryRaw`
    SELECT count(*) FROM public."User"
UNION ALL
SELECT "Allowed_User_Count"::bigInt FROM public."Customer";
  `;
  const usersData = result.map((item) => Number(item.count));
  res.status(200).json({
    availableUsers: usersData[0],
    totalUsers: usersData[1],
  });
});

export const getAlertCount = catchAsync(async (req, res, next) => {
  const { email } = req.query;
  try {
    await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          roles: true
        }
      });

      let roleList = []
      user.roles.map((role) => {
        roleList.push(role.code)
      })

      const alerts = await prisma.alert.findMany({
        where: {
          userId: user.userId,
        },
      });

      const result = {
        count: alerts.length,
        roles: roleList.toString()
      }

      res.json(result);
    });
  } catch (error) {
    console.error("Error during getAlertCount" + error);
    return next(new AppError("There was an error getting alert count", 400));
  }
});
