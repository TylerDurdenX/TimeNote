import express from "express";
import {
  forgotPassword,
  login,
  logout,
  resendOtp,
  resetPassword,
  signup,
} from "../controller/authController.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getUser, getUserCount, updateUserProfilePicture } from "../controller/dashboardController.js";
import { checkRoleCode, createAuthority, createRole, getAuthorities } from "../controller/settingsController.js";
import { getListOfObjects, getUserDetails, getUsersList, mapRolesToUser } from "../controller/UserDetailsController.js";
import { createTeam } from "../controller/teamController/controller.js";

const router = express.Router();

router.post("/signUp", signup);
router.post("resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword); 
router.get("/getUser", getUser);
router.post("/updatePP", updateUserProfilePicture);
router.get("/getUserCount", getUserCount);
router.post("/createRole", createRole)
router.post("/createAuthority", createAuthority)
router.get("/checkRoleCode", checkRoleCode)
router.get("/getAuthorities", getAuthorities)
router.get("/getUsersList", getUsersList)
router.post("/mapRolesToUser", mapRolesToUser)
router.get("/getUserDetails", getUserDetails)
router.get("/getList", getListOfObjects)
router.post("/createTeam", createTeam)



export default router;
