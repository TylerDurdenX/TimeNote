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
import { getListOfObjects, getUserDetails, getUserHierarchyData, getUsersList, mapRolesToUser, updateUserDetailsData } from "../controller/UserDetailsController.js";
import { createTeam } from "../controller/teamController/controller.js";
import { addComment, addSubTaskComment, closeCompletedTask, createProject, createSprint, createSubTask, createTask, deleteAttachment, downloadAttachment, getProjectManagers, getProjects, getProjectTasks, getProjectUsers, getSprint, getSubTask, getSubTaskComments, getTask, getTaskComments, updateSubTask, updateTask, updateTaskAssignee, updateTaskStatus, uploadAttachment, uploadSubTaskAttachment } from "../controller/projectController/projectController.js";
import { addscreenshots, getScreenshots } from "../controller/LiveTracking/screenshotController.js";
import { getLiveStreamUsers, getUsersForUserFilter } from "../controller/LiveTracking/liveStreamController.js";

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
router.post("/updateUserSettingsData", updateUserDetailsData)
router.post("/createProject", createProject)
router.get("/getUserHierarchyData", getUserHierarchyData)
router.post("/saveScreenshot", addscreenshots)
router.get("/getScreenshots", getScreenshots)
router.get("/getUsersListFilter", getUsersForUserFilter)
router.get("/getLiveStreamUsers", getLiveStreamUsers)
router.get("/getProjects", getProjects)
router.get("/getProjectTasks", getProjectTasks)
router.get("/getProjectUsers", getProjectUsers)
router.post("/createTask", createTask)
router.patch("/updateTaskStatus", updateTaskStatus)
router.patch("/updateTaskAssignee", updateTaskAssignee)
router.get("/getComments", getTaskComments)
router.post("/addComment", addComment)
router.post("/createSprint", createSprint)
router.get("/getSprint", getSprint )
router.get("/getPmUsers", getProjectManagers)
router.get("/getTask", getTask)
router.patch("/updateTask", updateTask)
router.patch("/updateSubTask", updateSubTask)
router.post("/uploadAttachment", uploadAttachment)
router.post("/uploadSubTaskAttachment", uploadSubTaskAttachment)
router.delete("/deleteAttachment", deleteAttachment)
router.get("/downloadAttachment", downloadAttachment)
router.post("/createSubTask", createSubTask)
router.get("/getSubTask", getSubTask)
router.post("/addSubTaskComment", addSubTaskComment)
router.get("/getSubTaskComments", getSubTaskComments)
router.patch("/closeCompletedTask", closeCompletedTask)


export default router;
