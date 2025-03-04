import jwt from 'jsonwebtoken'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import {prisma} from "../server.js"

export const generateToken = catchAsync(async (req, res, next) => {
  
    try {
        const { clientId } = req.body; 

        if (!clientId) {
          return res.status(400).json({ message: 'Client ID is required' });
        }

        if(clientId !== process.env.CLIENT_SECRET){
            return res.status(400).json({ message: 'Client ID is not valid' });
        }

        // Example payload for third-party service
        const payload = {
          clientId,
          role: 'third_party_service',  // Define roles based on your use case
        };
      
        // Sign and generate the token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2m' });
      
        return res.json({ token });
  
    } catch (err) {
      console.log('Error in generating token:', err);
      return next(new AppError(err.message || 'An error occurred', 401));
    }
  });

export  const authenticateThirdParty = (req, res, next) => {
    const token = req.headers['token'];
  
    if (!token) {
      return next(new AppError('Authorization token is missing', 401));
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // You can further validate decoded token here, e.g., check the role
      if (decoded.role !== 'third_party_service') {
        return next(new AppError('Invalid role in token', 403)); // Forbidden error
      }
  
      // Attach the decoded user info to the request for further processing
      req.thirdParty = decoded;
      next()
    } catch (error) {
        console.log(error)
      return next(new AppError('Invalid or expired token', 401)); // Unauthorized
    }
  };
