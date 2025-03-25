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
          }        
        })
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

  export const getProjectsForTeam = catchAsync(async (req, res, next) => {
    try {
      await prisma.$transaction(async (prisma) => {

        let projectsListResult = []

          const excludedParam = ['Closed'];
          
          const projects = await prisma.project.findMany({
            where:{
              status: {
                notIn: excludedParam
              }
            }
          })

          projects.map((project) => {
            const result = {
              id: project.id,
              title: project.name
            }
            projectsListResult.push(result)
          })
          res.status(200).json(projectsListResult)

        })
    } catch (error) {
      console.log(error);
      return next(new AppError("There was an error getting Projects List", 400));
    }
  });

  export const getSelectedProjectsForTeam = catchAsync(async (req, res, next) => {
    const { teamId} = req.query
    try {
      await prisma.$transaction(async (prisma) => {

        let projectsListResult = []
          
        const team = await prisma.team.findFirst({
          where:{
            id: Number(teamId)
          },include:{
            projects:{
              select:{
                id: true,
                name: true
              }
            }
          }
        })

        console.log(team.projects)

          team.projects.map((project) => {
            const result = {
              id: project.id,
              title: project.name
            }
            projectsListResult.push(result)
          })
          res.status(200).json(projectsListResult)

        })
    } catch (error) {
      console.log(error);
      return next(new AppError("There was an error getting Projects List", 400));
    }
  });

  export const getBreaksForTeam = catchAsync(async (req, res, next) => {
    const { email} = req.query
    try {
      await prisma.$transaction(async (prisma) => {

        let breaksListResult = []

          
          const breaksList = await prisma.breakType.findMany({})

          breaksList.map((breaks) => {
            const result = {
              id: breaks.id,
              title: breaks.breakName
            }
            breaksListResult.push(result)
          })
          res.status(200).json(breaksListResult)

        })
    } catch (error) {
      console.log(error);
      return next(new AppError("There was an error getting Projects List", 400));
    }
  });

  export const getSelectedBreaksForTeam = catchAsync(async (req, res, next) => {
    const { teamId} = req.query
    try {
      await prisma.$transaction(async (prisma) => {

        let breaksListResult = []

        const team = await prisma.team.findFirst({
          where:{
            id: Number(teamId)
          },include:{
            breakTypes:{
              select:{
                id: true,
                breakName: true
              }
            }
          }
        })

          team.breakTypes.map((breaks) => {
            const result = {
              id: breaks.id,
              title: breaks.breakName
            }
            breaksListResult.push(result)
          })
          res.status(200).json(breaksListResult)

        })
    } catch (error) {
      console.log(error);
      return next(new AppError("There was an error getting Projects List", 400));
    }
  });

  export const updateTeamsConfigurationData = catchAsync(async (req, res, next) => {
    const { email, teamId} = req.query
    const {breaks, projects} = req.body
    try {
      const result = await prisma.$transaction(async (prisma) => {

        const teamIdNum = Number(teamId)

        const userslist = await prisma.user.findMany({
          where:{
            teams: {
              some: {
                id: teamIdNum
              }
            }
          }, include:{
            projects: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })

        if(!isEmpty(projects)){
        let projectsToConnect= []
        const newProjectIdList = projects.map((project) => project.id);

        newProjectIdList.map((project) => {
          
        })

        const updatePromises = userslist.map(async (user) => {
          let projectIdList = user.projects.map((project) => project.id);
          
          // Find the projects that need to be connected (projects not already associated)
          projectsToConnect = newProjectIdList.filter(
            (newProjectId) => !projectIdList.includes(newProjectId)
          );
      
          // If there are projects to connect, update the user
          if (projectsToConnect.length > 0) {
            await prisma.user.update({
              where: { email: user.email },
              data: {
                projects: {
                  connect: projectsToConnect.map((projectId) => ({ id: projectId })),
                },
              },
            });
          }
        });
      
        // Wait for all update promises to finish
        await Promise.all(updatePromises);

        const updatedTeam = await prisma.team.update({
          where:{
            id: teamIdNum
          },data: {
            projects: {
              connect: projectsToConnect.map(id => ({ id })),
            },
          },
        })
      }

      if(!isEmpty(breaks)){

        const newBreakTypeIdList = breaks.map((breakObj) => breakObj.id);

        const breakTypeIdList = await prisma.team.findFirst({
          where:{
            id: teamIdNum
          },include:{
            breakTypes: {
              select:{
                id: true
              }
            }
          }
        })

        const updatedTeam = await prisma.team.update({
          where:{
            id: teamIdNum
          },data: {
            breakTypes: {
              disconnect: breakTypeIdList.breakTypes.map(breakObj => ({ id: breakObj.id })),
              connect: newBreakTypeIdList.map(id => ({ id })),
            },
          },
        })
      }


       return next(new SuccessResponse('Data Saved Successfully',200))

        })
    } catch (error) {
      console.log(error);
      return next(new AppError("There was an error saving Teams Configuration", 400));
    }
  });