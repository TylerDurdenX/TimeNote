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


export default router;
