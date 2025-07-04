import { prisma } from "../server.js";
import catchAsync from "../utils/catchAsync.js";
import generateOtp from "../utils/generateOtp.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/email.js";
import AppError from "../utils/appError.js";
import bcrypt from "bcryptjs";
import { isEmpty } from "../utils/genericMethods.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user.userId);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only secure this when in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
  };

  res.cookie("token", token, cookieOptions);

  user.password = null;

  res.status(statusCode).json({
    status: "success",
    message,
    // token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const { email, password, username, phoneNumber, designation, base64Image } =
    req.body;
  try {
    await prisma.$transaction(async (prisma) => {
      const customerData = await prisma.customer.findFirst();
      const userCount = await prisma.user.count();
      if (Number(customerData.Allowed_User_Count) === userCount) {
        return next(new AppError("User Limit Reached", 500));
      }

      const existingUserEmail = await prisma.user.findMany({
        where: {
          email: email,
        },
      });

      const existingUser = await prisma.user.findMany({
        where: {
          AND: [
            {
              username: {
                equals: username,
              },
            },
          ],
        },
      });

      if (existingUser.length > 0)
        return next(new AppError("Username already exists", 500));
      if (existingUserEmail.length > 0)
        return next(new AppError("Email already exists", 500));

      const hashedPassword = await bcrypt.hash(password, 12);

      if (!isEmpty(base64Image)) {
        const profilePic = await prisma.profilePicture.create({
          data: {
            base64: base64Image,
          },
        });

        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            username,
            designation,
            phoneNumber,
            profilePictureId: profilePic.id,
          },
        });

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
      } else {
        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            username,
            designation,
            phoneNumber,
          },
        });

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
      }
    });
  } catch (error) {
    console.log(error);
    return next(new AppError("Some Error Occurred", 500));
  }
});

export const resendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.user;

  if (!email) {
    return next(new AppError("Email is required to send Otp", 400));
  }

  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!user) {
    return next(new AppError("User Not Found", 404));
  }

  const newOtp = generateOtp();

  user.otp = newOtp;
  user.otpExpires = Date.now() + 24 * 60 * 60 * 1000;
  await prisma.user.update({
    where: {
      email: email,
    },
  });

  try {
    await sendEmail({
      email: user.email,
      subject: "Resend OTP",
      html: `<h1>Your new OTP is : ${newOtp}</h1>`,
    });

    res.status(200).json({
      status: "success",
      message: "A new Otp has been sent to your email",
    });
  } catch (err) {
    return next(
      new AppError(
        "There is an error sending the email! Please try again later",
        500
      )
    );
  }
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    include: {
      roles: {
        select: {
          code: true,
        },
      },
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

  await prisma.user.update({
    where: {
      userId: user.userId,
    },
    data: {
      isLoggedIn: true,
    },
  });

  createSendToken(user, 200, res, "Login Successful");
});

export const logout = catchAsync(async (req, res, next) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });

  try {
    const { email } = req.query;
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        isLoggedIn: false,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  }
});

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (!user) {
    return next(new AppError("No user found", 400));
  }

  const otp = generateOtp();
  try {
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        resetPasswordOTP: otp,
        otpExpires: (Date.now() + 300000).toString(), // 5 mins
      },
    });

    await sendEmail({
      email: user.email,
      subject: "Passowrd Reset OTP (Valid for 5 mins)",
      html: `<h1>Your password reset OTP is : ${otp}</h1>`,
    });

    res.status(200).json({
      status: "success",
      message: "password rest OTP is sent to your mail id",
    });
  } catch (error) {
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        resetPasswordOTP: null,
        otpExpires: null,
      },
    });
    console.log(error);
    return next(
      new AppError(
        "There was an error sending the email! Please try again later",
        400
      )
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, password, passwordConfirm } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email: email,
      resetPasswordOTP: otp,
    },
  });

  if (!user) {
    return next(new AppError("User not found", 400));
  }

  if (Date.now() > user.otpExpires) {
    return next(new AppError("OTP expired", 400));
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      password: hashedPassword,
      resetPasswordOTP: null,
      otpExpires: null,
    },
  });

  createSendToken(user, 200, res, "Password reset successfully");
});
