import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import { prisma } from "../server.js";

const isAuthenticated = catchAsync(async (req, res, next) => {
  try {
    // Get token from cookies
    const cookieString = req.headers.cookie;
    console.log(cookieString);
    const cookies = cookieString
      .split(";")
      .map((cookie) => cookie.trim())
      .reduce((acc, cookie) => {
        const [name, value] = cookie.split("=");
        acc[name] = value;
        return acc;
      }, {});

    const token = cookies.token; // Access the token from cookies

    if (!token) {
      return next(
        new AppError("You are not logged in. Please log in to access", 401)
      );
    }

    // Verify token and handle expiration error
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(
          new AppError("Your session has expired. Please log in again.", 401)
        );
      } else {
        return next(new AppError("Invalid token. Please log in again.", 401));
      }
    }

    // Find the user from the database based on the decoded token info
    const currentUser = await prisma.user.findUnique({
      where: {
        userId: decoded.id, // Assuming `userId` is in the decoded token
      },
    });

    if (!currentUser) {
      return next(new AppError("The user does not exist", 401));
    }

    if (currentUser.isLoggedIn !== true) {
      return next(new AppError("Invalid token. Please log in again.", 401));
    }

    const newToken = jwt.sign(
      { id: currentUser.userId }, // You can include more data if necessary
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN } // Set the expiry according to your preference
    );

    // Update the cookie with the new token and expiration time
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
    };

    res.cookie("token", newToken, cookieOptions);

    req.user = currentUser;
    next();
  } catch (err) {
    console.log("Error in authentication middleware:", err);
    return next(new AppError(err.message || "An error occurred", 401));
  }
});

export default isAuthenticated;
