import jwt from 'jsonwebtoken'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import {prisma} from "../server.js"

const isAuthenticated = catchAsync(async(req, res, next) => {
    console.log('middleware called')
    try{
    const token = req.headers.cookie.token || req.headers.authorization?.split(" ")[1]
    if(!token){
        return next(new AppError('You are not logged in. Please log in to access', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const currentUser = prisma.user.findMany({
        where: {
            userId: decoded.userId
        }
    })

    if(!currentUser){
        return next(new AppError('The user does not exist', 401))
    }

    console.log(decoded)

    req.user= currentUser
    next()
}catch(err){
    console.log(err)
    return next(new AppError(err, 401))
}
})

export default isAuthenticated