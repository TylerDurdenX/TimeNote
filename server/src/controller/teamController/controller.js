import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";
import { prisma } from "../../server.js";
import SuccessResponse from "../../utils/SuccessResponse.js";
import { isEmpty } from "../../utils/genericMethods.js";

export const createTeam = catchAsync(async (req, res, next) => {
    const {name, description,teamLeadName, teamLeadEmail, email} = req.body
    try {
      const result = await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
          where: {
            email: email
          },include:{
            roles: {
              select: {
                code: true
              }
            }
          }
        })

        const team = await prisma.team.findFirst({
          where:{
            name: name
          }
        })

        if(!isEmpty(team)){
          return next(new AppError('Team with same name exists',500))
        }else{

        if(user.roles.some((role) => role.code === "ADMIN") || user.roles.some((role) => role.code === "PROJECT_MANAGER")  || 
          user.roles.some((role) => role.code === "TEAM_LEAD")){
          const newTeam = await prisma.team.create({
             data:{
               name, 
               description ,
               teamLeaderEmail: teamLeadEmail,
               teamLeaderName: teamLeadName
             }
           })
          }else{
            return next(new AppError('Not authorized to create Teams',500))
          }
        }

      return next(new SuccessResponse('Team created successfully',200))
        })
    } catch (error) {
      console.log(error);
      return next(new AppError("There was an error getting Users List", 400));
    }
  });

  export const getTeamsList = catchAsync(async (req, res, next) => {
    const {email} = req.query
    try {
      const result = await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
          where: {
            email: email
          },include:{
            roles: {
              select: {
                code: true
              }
            }
          }
        })
        
        let teamsList = []
        console.log(user.roles)
        if(user.roles.some((role) => role.code === "ADMIN")){
          const teams = await prisma.team.findMany()
          teams.map((team) => {
            teamsList.push(team)
          })

          res.status(200).json(teamsList)
          }else{
            if(!isEmpty(user.teams)){
              user.teams.map((team) => {
                if(team.teamLeaderEmail === email){
                  teamsList.push(team)
                }
              })
              res.status(200).json(teamsList)
            }else{
              res.status(200).json(teamsList)
            }
          }        })
    } catch (error) {
      console.log(error);
      return next(new AppError("There was an error getting Teams List", 400));
    }
  });

  export const getTeamLeads = catchAsync(async (req, res, next) => {
    const { email} = req.query
    try {
      const result = await prisma.$transaction(async (prisma) => {

        const user = await prisma.user.findFirst({
          where: {
            email: email
          },include:{
            roles: {
              select: {
                code: true
              }
            }
          }
        })

        let usersListResult = []

        if(user.roles.some((role) => role.code === "ADMIN") || user.roles.some((role) => role.code === "TEAM_LEAD") ){
          const usersList = await prisma.user.findMany({
            where:{
              roles:{
                some:{
                  code: 'TEAM_LEAD'
                }
              },
            },include:{
              roles: true
            }
           })

           usersList.map((user) => {
            const reultObj = {
              name: user.username,
              email: user.email
            }
            usersListResult.push(reultObj)
           })
           res.status(200).json(usersListResult)

          }else{
            res.status(200).json(usersListResult)
          }
        

      return next(new SuccessResponse('Team created successfully',200))
        })
    } catch (error) {
      console.error('Error during createTeam' + error);
      return next(new AppError("There was an error getting Users List", 400));
    }
  });