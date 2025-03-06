import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import { prisma } from "../server.js";

export const createRole = catchAsync(async (req, res, next) => {
  const { name, code, description, authorities } = req.body;

  if (
    !name ||
    !code ||
    !description ||
    !Array.isArray(authorities) ||
    !authorities.length > 0
  ) {
    return res
      .status(400)
      .json({
        message:
          "Invalid input. Please provide name, code, description, and authorities.",
      });
  }

  try {
    const authoritiesDb = await prisma.authority.findMany({
      where: {
        code: {
          in: authorities.code,
        },
      },
    });

    const role = await prisma.role.create({
      data: {
        name,
        code,
        description,
        authorities: {
          connect: authoritiesDb.map((authority) => ({ id: authority.id })),
        },
      },
    });

    return res.status(201).json({
      message: "Role created successfully",
      role,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error creating Role", 400));
  }
});

//create Authority
export const createAuthority = catchAsync(async (req, res, next) => {
  const { name, code, description } = req.body;

  try {
    const newAuthoritiy = await prisma.authority.create({
      data: {
        name,
        code,
        description,
      }
    });
    return res.status(201).json({
      message: "Authority created successfully",
      newAuthoritiy,
    });
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error creating Authority", 400));
  }
});

//check if role code is already present
export const checkRoleCode = catchAsync(async (req, res, next) => {
  const {code} = req.query;
  try {
    const result = await prisma.role.findFirst({
      where: {
        code: {
          equals: code, 
          mode: 'insensitive' 
        }
      }
    });
    if(result){
      return res.status(200).json({
        flag: true,
        message: "Code found"
      })
    }else{
      return res.status(200).json({
        flag: false,
        message: "Code not found"
      })
    }
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error searching for role code", 400));
  }
});

//get all the authorities form the table
export const getAuthorities = catchAsync(async (req, res, next) => {
  try {
    const result = await prisma.authority.findMany({
      select:{
        name: true, code: true
      }
    });
    return res.status(200).json(result)
  } catch (error) {
    console.error(error);
    return next(new AppError("There was an error getting authorities", 400));
  }
});
