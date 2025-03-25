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
import { getAlertCount, getUser, getUserCount, updateUserProfilePicture } from "../controller/dashboardController.js";
import { checkRoleCode, createAuthority, createRole, getAuthorities } from "../controller/settingsController.js";
import { getListOfObjects, getUserDetails, getUserHierarchyData, getUsersList, mapRolesToUser, updateUserBasicDetailsData, updateUserDetailsData } from "../controller/UserDetailsController.js";
import { createTeam, getBreaksForTeam, getProjectsForTeam, getSelectedBreaksForTeam, getSelectedProjectsForTeam, getTeamLeads, getTeamsList, updateTeamsConfigurationData } from "../controller/teamController/controller.js";
import { addComment, addSubTaskComment, closeCompletedTask, createBulkTasks, createProject, createSprint, createSubTask, createTask, deleteAttachment, deleteProjectAttachment, downloadAttachment, downloadProjectAttachment, getMentionedUsers, getProject, getProjectHoursEstimation, getProjectManagers, getProjects, getProjectSprint, getProjectTasks, getProjectTasksCalendar, getProjectUsers, getSprint, getSubTask, getSubTaskComments, getTask, getTaskActivity, getTaskComments, getTaskHistory, getUserData, updateProject, updateProjectSprint, updateProjectStatus, updateSubTask, updateTask, updateTaskAssignee, updateTaskProgress, updateTaskStatus, uploadAttachment, uploadProjectAttachment, uploadSubTaskAttachment } from "../controller/projectController/projectController.js";
import { addscreenshots, getScreenshots } from "../controller/LiveTracking/screenshotController.js";
import { getLiveStreamUsers, getUsersForUserFilter } from "../controller/LiveTracking/liveStreamController.js";
import {createAutoReportConfig, deleteAutoReportConfig, getAutoReportConfig } from "../controller/reportsController/controller.js";
import { deleteAlert, getAlerts } from "../controller/alertController/alertController.js";
import { createTimesheetEntry, getPendingTimesheetData, getTimesheetData, getUsersTimesheetData, updateTimesheet, updateTimesheetRecords, viewTimesheetData } from "../controller/timesheetController/timesheetController.js";
import { updateCustomerData } from "../middleware/customerController.js";
import { authenticateThirdParty } from "../middleware/generateToken.js";
import { getAdminRole, getAttendanceData, getAttendanceLCData, getBreakData, getUserAttendanceData, getUserAttendanceTableData, updateAttendance} from "../controller/attendanceController/attendanceController.js";
import { signInUser, signupTP } from "../controller/thirdPartyController/thirdPartyController.js";
import { createBreak, deleteBreak, getBreaksList, updateBreak, updateBreakTime } from "../controller/breakController/breakController.js";
const router = express.Router();

router.post("/customerDataUpdate",authenticateThirdParty, updateCustomerData);
router.post("/signUp",isAuthenticated, signup);
router.post("resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword); 
router.get("/getUser", getUser);
router.post("/updatePP",isAuthenticated, updateUserProfilePicture);
router.get("/getUserCount",isAuthenticated, getUserCount);
router.post("/createRole", createRole)
router.get("/checkRoleCode", checkRoleCode)
router.get("/getAuthorities", getAuthorities)
router.get("/getUsersList",isAuthenticated, getUsersList)
router.post("/mapRolesToUser", mapRolesToUser)
router.get("/getUserDetails",isAuthenticated, getUserDetails)
router.get("/getList", getListOfObjects)
router.post("/createTeam", createTeam)
router.get('/getTeamsList',getTeamsList)
router.get('/getTeamLeads', getTeamLeads)
router.post("/updateUserSettingsData",isAuthenticated, updateUserDetailsData)
router.post("/updateUserBasicSettingsData", isAuthenticated, updateUserBasicDetailsData)
router.post("/createProject",isAuthenticated, createProject)
router.get("/getUserHierarchyData",isAuthenticated, getUserHierarchyData)
router.post("/saveScreenshot",isAuthenticated, addscreenshots)
router.get("/getScreenshots",isAuthenticated, getScreenshots)
router.get("/getUsersListFilter", getUsersForUserFilter)
router.get("/getLiveStreamUsers", getLiveStreamUsers)
router.get("/getProjects",isAuthenticated, getProjects)
router.get("/getProjectTasks",isAuthenticated, getProjectTasks)
router.get("/getProjectTasksCalendar",isAuthenticated, getProjectTasksCalendar)
router.get("/getProjectUsers",isAuthenticated, getProjectUsers)
router.post("/createTask",isAuthenticated, createTask)
router.patch("/updateTaskStatus",isAuthenticated, updateTaskStatus)
router.patch("/updateTaskAssignee",isAuthenticated, updateTaskAssignee)
router.get("/getComments",isAuthenticated, getTaskComments)
router.post("/addComment",isAuthenticated, addComment)
router.post("/createSprint", createSprint)
router.get("/getSprint",isAuthenticated, getSprint )
router.get("/getPmUsers",isAuthenticated, getProjectManagers)
router.get("/getTask",isAuthenticated, getTask)
router.patch("/updateTask",isAuthenticated, updateTask)
router.patch("/updateSubTask",isAuthenticated, updateSubTask)
router.post("/uploadAttachment",isAuthenticated, uploadAttachment)
router.post("/uploadSubTaskAttachment",isAuthenticated, uploadSubTaskAttachment)
router.delete("/deleteAttachment",isAuthenticated, deleteAttachment)
router.get("/downloadAttachment",isAuthenticated, downloadAttachment)
router.post("/createSubTask",isAuthenticated, createSubTask)
router.get("/getSubTask",isAuthenticated, getSubTask)
router.post("/addSubTaskComment",isAuthenticated, addSubTaskComment)
router.get("/getSubTaskComments",isAuthenticated, getSubTaskComments)
router.patch("/closeCompletedTask",isAuthenticated, closeCompletedTask)
router.get("/getTaskHistory",isAuthenticated, getTaskHistory)
router.post("/createReportsConfig",isAuthenticated, createAutoReportConfig)
router.get("/getConfiguredReports",isAuthenticated, getAutoReportConfig)
router.delete("/deleteConfigReport",isAuthenticated, deleteAutoReportConfig)
router.patch("/startTaskProgress",isAuthenticated, updateTaskProgress)
router.get("/getProjectHoursEstimation",isAuthenticated, getProjectHoursEstimation)
router.get("/getMentionedUsers",isAuthenticated, getMentionedUsers)
router.get("/getAlertCount",isAuthenticated, getAlertCount)
router.get("/getAlert",isAuthenticated, getAlerts)
router.delete("/deleteAlert",isAuthenticated, deleteAlert)
router.get("/getUserData",isAuthenticated, getUserData)
router.get("/getProject",isAuthenticated, getProject)
router.patch("/updateProjectStatus",isAuthenticated, updateProjectStatus)
router.patch("/updateProject",isAuthenticated, updateProject)
router.post("/uploadProjectAttachment",isAuthenticated, uploadProjectAttachment)
router.delete("/deleteProjectAttachment",isAuthenticated, deleteProjectAttachment)
router.get("/downloadProjectAttachment",isAuthenticated, downloadProjectAttachment)
router.post("/createBulkTasks",isAuthenticated, createBulkTasks)
router.get("/getTaskActivity",isAuthenticated, getTaskActivity)
router.get("/getTimesheetData",isAuthenticated, getTimesheetData)
router.get("/viewTimesheetData",isAuthenticated, viewTimesheetData)
router.post("/createTimesheetEntry",isAuthenticated, createTimesheetEntry)
router.get("/getPendingTimesheetData",isAuthenticated, getPendingTimesheetData)
router.patch("/updateTimesheet",isAuthenticated, updateTimesheet)
router.get("/getUsersTimesheetData",isAuthenticated, getUsersTimesheetData)
router.get("/getAttendanceData",isAuthenticated, getAttendanceData)
router.get('/getAttendanceLCData', isAuthenticated, getAttendanceLCData)
router.get('/getUserAttendancePCData', getUserAttendanceData)
router.get('/getUserAttendanceTableData', isAuthenticated, getUserAttendanceTableData)
router.get('/getAdminRole', isAuthenticated, getAdminRole)
router.get('/getProjectSprint', isAuthenticated, getProjectSprint)
router.post('/updateProjectSprint',isAuthenticated, updateProjectSprint)
router.post('/createBreak',isAuthenticated, createBreak)
router.delete('/deleteBreak',isAuthenticated, deleteBreak)
router.get('/getBreaksList', isAuthenticated, getBreaksList)
router.post('/updateBreakObj',isAuthenticated, updateBreak)
router.get('/getProjectsForTeam',isAuthenticated, getProjectsForTeam)
router.get('/getBreaksListForTeams',isAuthenticated, getBreaksForTeam)
router.post('/updateTeamsConfigurationData', isAuthenticated, updateTeamsConfigurationData)
router.get('/getSelectedProjectsForTeam',isAuthenticated, getSelectedProjectsForTeam)
router.get('/getSelectedBreaksForTeam',isAuthenticated, getSelectedBreaksForTeam)

// Third party requests
router.post("/updateAttendance",authenticateThirdParty, updateAttendance);
router.post("/updateTimesheetRecords",authenticateThirdParty, updateTimesheetRecords);
router.post("/signInUser",authenticateThirdParty, signInUser);
router.post("/signUpTP", authenticateThirdParty, signupTP )
router.post("/createAuthority",authenticateThirdParty, createAuthority)
router.get('/takeBreak',authenticateThirdParty, getBreakData)
router.post('/updateBreakTime',authenticateThirdParty, updateBreakTime)


export default router;
