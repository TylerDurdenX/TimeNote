import catchAsync from "../utils/catchAsync.js";
import { prisma } from "../server.js";

export const getUser = catchAsync(async(req, res, next) => {
    const {email} = req.query
    console.log('received')
    const dbUser = await prisma.user.findFirst({
      where:{
        email: email
      },
      include: { profilePicture: true}
    })
  
    if(!dbUser){
      return next(new AppError('No user found', 400))
    }
  
    try {
      if(dbUser.profilePicture){
        res.status(200).json({
          user: {
              name: dbUser.username,
              email:dbUser.email,
              avatar: dbUser.profilePicture.base64
          }
        })
      }else{
      res.status(200).json({
        user: {
            name: dbUser.username,
            email:dbUser.email,
            avatar: ""
        }
      })
    }
    } catch (error) {
      console.log(error)
      return next(new AppError('There was an error fetching user details', 400))
    }
  
  })


  export const updateUserProfilePicture = catchAsync(async(req, res, next) => {
    const {email} = req.query
    const {base64} = req.body
    console.log('received PP update req')

    const user = await prisma.user.findFirst({
      where:{
        email:email
      },
      include: { profilePicture: true },
    })
    
    if(user.profilePictureId===null){
      try {
        await prisma.profilePicture.create({
          data:{
            user: {
              connect: { userId: user.userId }  // Nested object to connect to the existing user.
            },
            base64: base64
        }
        })
    
        res.status(200).json({
          status: 'success',
          message: `Profile picture updated for user : ${user.username}`
        })
      } catch (error) {
        console.log(error)
        return next(new AppError('There was an error sending the email! Please try again later', 400))
      }    
    
    }else{
      try{
      await prisma.profilePicture.update({
        where: { id: user.profilePicture.id },
        data: { base64 },
    });
  
      res.status(200).json({
        status: 'success',
        message: `Profile picture updated for user : ${user.username}`
      })
    } catch (error) {
      console.log(error)
      return next(new AppError('There was an error sending the email! Please try again later', 400))
    }    
  
    }
  
  })

  export const getUserCount = catchAsync(async(req, res, next) => {
    const result = await prisma.$queryRaw`
    SELECT count(*) FROM public."User"
UNION ALL
SELECT "Allowed_User_Count"::bigInt FROM public."Customer";
  `;
  const usersData = result.map(item => Number(item.count));
  res.status(200).json({
      availableUsers: usersData[0],
      totalUsers: usersData[1]
    
  })
  })
