import catchAsync from "../../utils/catchAsync.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import AppError from "../../utils/appError.js";
import bcrypt from 'bcryptjs'
import { prisma } from "../../server.js";

export const signInUser = catchAsync(async(req,res, next) => {
    const {email,password} = req.body

    try{
        await prisma.$transaction(async (prisma) => {
        if(!email || !password){
            return next(new AppError('Please provide email and password', 400))
          }
        
          const user = await prisma.user.findFirst({
            where:{
              email:email
            },include:{
              profilePicture: true
            }
          })
        
          if(!user){
            return next(new AppError(`No user exists with the email id : ${email}`, 400))
          }
          
          const isPasswordValid = await bcrypt.compare(password, user.password);
        
          if(!isPasswordValid){
            return next(new AppError('Incorrect email or password', 400))
          }
        
          let result 
          if(user.profilePicture){
            result = {
                status: "Success",
                error: null,
                message: "Sign In Successful",
                stack: null,
                username: user.username,
                designation: user.designation,
                base64: user.profilePicture.base64
            }
          }else{
            result = {
                status: "Success",
                error: null,
                message: "Sign In Successful",
                stack: null,
                username: user.username,
                designation: user.designation,
                base64: ''
            }
          }
      
          //return next(new SuccessResponse(result, 200))
          res.status(200).json(result)
        })
    }catch(error){
        console.log('Error during Signing in User', error)
        return next(new AppError('Error during Signing in User',500))
    }
  
  })