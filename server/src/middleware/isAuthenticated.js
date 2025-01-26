import jwt from 'jsonwebtoken'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import {prisma} from "../server.js"

const isAuthenticated = catchAsync(async (req, res, next) => {
    console.log('Middleware called');
  
    try {
      // Get token from cookies
      const cookieString = req.headers.cookie;
      const cookies = cookieString
        .split(';')
        .map(cookie => cookie.trim())
        .reduce((acc, cookie) => {
          const [name, value] = cookie.split('=');
          acc[name] = value;
          return acc;
        }, {});
  
      const token = cookies.token; // Access the token from cookies
      console.log('Token:', token);
  
      if (!token) {
        return next(new AppError('You are not logged in. Please log in to access', 401));
      }
  
      // Verify token and handle expiration error
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        if (err.name === 'TokenExpiredError') {
          return next(new AppError('Your session has expired. Please log in again.', 401));
        } else {
          return next(new AppError('Invalid token. Please log in again.', 401));
        }
      }
  
      console.log(decoded)
      // Find the user from the database based on the decoded token info
      const currentUser = await prisma.user.findUnique({
        where: {
          userId: decoded.id, // Assuming `userId` is in the decoded token
        },
      });
  
      if (!currentUser) {
        return next(new AppError('The user does not exist', 401));
      }
  
      console.log('Decoded token:', decoded);
      req.user = currentUser;
      next();
  
    } catch (err) {
      console.log('Error in authentication middleware:', err);
      return next(new AppError(err.message || 'An error occurred', 401));
    }
  });

export default isAuthenticated