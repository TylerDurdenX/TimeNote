import catchAsync from "../../utils/catchAsync.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import AppError from "../../utils/appError.js";
import bcrypt from "bcryptjs";
import { prisma } from "../../server.js";
import { isEmpty } from "../../utils/genericMethods.js";
import { createSendToken } from "../authController.js";

export const signInUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  try {
    await prisma.$transaction(async (prisma) => {
      if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
      }

      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
        include: {
          profilePicture: true,
        },
      });

      if (!user) {
        return next(
          new AppError(`No user exists with the email id : ${email}`, 400)
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return next(new AppError("Incorrect email or password", 400));
      }

      const customerData = await prisma.customer.findFirst();

      let result;
      if (user.profilePicture) {
        result = {
          status: "Success",
          error: null,
          message: "Sign In Successful",
          stack: null,
          username: user.username,
          designation: user.designation,
          dpBase64: user.profilePicture.base64,
          orgLogoBase64: customerData.logoBase64 || "",
        };
      } else {
        result = {
          status: "Success",
          error: null,
          message: "Sign In Successful",
          stack: null,
          username: user.username,
          designation: user.designation,
          dpBase64: "",
          orgLogoBase64: customerData.logoBase64 || "",
        };
      }

      //return next(new SuccessResponse(result, 200))
      res.status(200).json(result);
    });
  } catch (error) {
    console.log("Error during Signing in User", error);
    return next(new AppError("Error during Signing in User", 500));
  }
});

export const signOutApplication = catchAsync(async (req, res, next) => {
  const { email } = req.query;

  try {
    await prisma.$transaction(async (prisma) => {
      if (!email) {
        return next(new AppError("Please provide email and password", 400));
      }

      const user = await prisma.user.findFirst({
        where: {
          email: email,
        },
      });

      if (user.allowSignout === true) {
        const result = {
          allowSignout: true,
        };
        res.status(200).json(result);
      } else {
        const result = {
          allowSignout: false,
        };
        res.status(200).json(result);
      }

      //return next(new SuccessResponse(result, 200))
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Error during Signing in User", 500));
  }
});

export const signupTP = catchAsync(async (req, res, next) => {
  const { email, password, username, phoneNumber, designation, roles } =
    req.body;
  try {
    await prisma.$transaction(async (prisma) => {
      const customerData = await prisma.customer.findFirst();
      const userCount = await prisma.user.count();
      if (Number(customerData.Allowed_User_Count) === userCount) {
        return next(new AppError("User Limit Reached", 500));
      }

      const existingUser = await prisma.user.findMany({
        where: {
          OR: [
            {
              email: email,
            },
            { username: username },
          ],
        },
      });

      if (existingUser.length > 0)
        return next(new AppError("Email or Username already exists", 500));

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
          designation,
          phoneNumber,
        },
      });

      if (roles.length > 0) {
        const dbRoles = await prisma.role.findMany({
          where: {
            code: {
              in: roles,
            },
          },
        });

        await prisma.user.update({
          where: {
            email: email,
          },
          data: {
            roles: {
              connect: dbRoles.map((role) => ({ id: role.id })),
            },
          },
        });
      }

      try {
        createSendToken(newUser, 200, res, "Registered Successfully");
      } catch (err) {
        await prisma.user.delete({
          where: {
            email: newUser.email,
          },
        });
        console.log(err);
        return next(
          new AppError(
            "An error occurred while signing up. Please try again later",
            500
          )
        );
      }
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Some Error Occurred", 500));
  }
});
