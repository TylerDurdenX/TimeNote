import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AddComment,
  AddSubTaskComment,
  AdminRoleResponse,
  Alert,
  AlertCount,
  AttendanceCardLCResponse,
  AttendanceCardResponse,
  AttendanceCardsResponse,
  AttendanceChartResponse,
  AttendanceReportTableResponse,
  AttendanceUserPCResponse,
  AttendanceUserTableResponse,
  BreakRequest,
  BreakResponse,
  Breaks,
  BreaksForTeams,
  BulkUser,
  ConfiguredReports,
  CreateSprint,
  CreateUserData,
  CustomTableResponse,
  DownloadAttachment,
  DownloadProjectAttachment,
  GeoDataResponse,
  GetProjectTasksCalendarResponse,
  GetProjectTasksResponse,
  LeaveData,
  LeaveResponse,
  ListReq,
  ListResponse,
  LiveStreamResponse,
  MentionedUser,
  PCResponse,
  PendingTimesheetResponse,
  PmUserResponse,
  ProjectFormData,
  ProjectHours,
  ProjectListForTeamResponse,
  ProjectListResponse,
  ProjectNamesResponse,
  ProjectReportListResponse,
  ProjectResponse,
  ProjectUsers,
  ReopenTaskData,
  ReportConfig,
  ScreenshotResponse,
  SprintData,
  SprintResponse,
  SubTaskFormData,
  SubTaskObject,
  Task,
  TaskActivity,
  TaskComments,
  TaskFormData,
  TaskHistory,
  TeamConfiguration,
  TeamFilterResponse,
  TeamLeadResponse,
  TeamRequest,
  Teams,
  timesheetEntry,
  TimesheetReportTableResponse,
  TimesheetResponse,
  UpdateBreakObj,
  UpdateProjectData,
  UpdateSprintObject,
  UpdateSubTaskData,
  UpdateSubTaskStatusData,
  UpdateTaskData,
  UpdateUserData,
  UploadAttachment,
  UploadProjectAttachment,
  UploadSubTaskAttachment,
  UserData,
  UserDetails,
  UserDetailsData,
  UserFilterResponse,
  UserHierarchy,
  UsersListResponse,
} from "./interfaces";
import { AxiosProgressEvent } from "axios";
import { toast } from "react-hot-toast";
import { UserGeoData } from "@/app/(components)/geoTrack/HeatMap";

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}
export interface User {
  name: string;
  email: string;
  avatar: string;
}

interface UserResponse {
  user: User;
}

interface ErrorRes {
  statusCode: number;
  status: string;
}

export interface ApiResponse {
  status: string;
  error: ErrorRes;
  message: string;
  stack: string;
}

export interface UserCountResponse {
  availableUsers: number;
  totalUsers: number;
}

interface CheckCodeResponse {
  flag: boolean;
  message: string;
}

export interface AuthorityResponse {
  name: string;
  code: string;
}

interface Authority {
  name: string;
  code: string;
}

interface CreateRolePayload {
  name: string;
  code: string;
  description: string;
  authorities: Authority[];
}

export const api = createApi({
  baseQuery: async (args, api, extraOptions) => {
    // Perform the API request
    const result = await fetchBaseQuery({
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
      credentials: "include",
    })(args, api, extraOptions);

    if (result.error?.status === 401) {
      toast.error("Your session has expired. Please log in again.");
      window.location.href = "/";
      return result;
    }

    return result;
  },
  reducerPath: "api",
  tagTypes: [
    "UserCount",
    "User",
    "RoleCode",
    "Authority",
    "UsersList",
    "UsersData",
    "ProjectsList",
    "Tasks",
    "Comment",
    "SprintCount",
    "Task",
    "SubTask",
    "SubTaskComment",
    "TaskHistory",
    "AutoReports",
    "ProjectHours",
    "AlertCount",
    "Alert",
    "Project",
    "TaskActivity",
    "SubTaskActivity",
    "Timesheet",
    "PendingTimesheet",
    "Breaks",
    "Screenshots",
    "FlaggedScreenshots",
    "UsersDetails",
    "LeaveData",
    "LeaveApprovalData",
  ],
  endpoints: (build) => ({
    getUsersCount: build.query<UserCountResponse, void>({
      query: () => "api/user/getUserCount",
      providesTags: ["UserCount"],
    }),
    updateProfilePicture: build.mutation<
      ApiResponse,
      { email: string; base64: string }
    >({
      query: ({ email, base64 }) => {
        const requestBody = JSON.stringify({ base64 });
        return {
          url: `api/user/updatePP?email=${email}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
        };
      },
      invalidatesTags: ["User"],
    }),
    getUser: build.query<UserResponse, { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getUser?email=${email}`;
        return url;
      },
      providesTags: ["User"],
    }),
    getAuthorities: build.query<AuthorityResponse[], void>({
      query: () => {
        const url = `api/user/getAuthorities`;
        return url;
      },
      providesTags: ["Authority"],
    }),
    checkRoleCode: build.query<CheckCodeResponse, { code: string }>({
      query: ({ code }) => {
        return {
          url: `api/user/checkRoleCode?code=${code}`,
          method: "GET",
        };
      },
      providesTags: ["RoleCode"],
    }),
    createRole: build.mutation<ApiResponse, CreateRolePayload>({
      query: (payload) => {
        return {
          url: `api/user/createRole`,
          method: "POST",
          body: payload,
        };
      },
    }),
    getUsersList: build.query<
      UsersListResponse[] | ApiResponse,
      { email: string; page: number; limit: number; searchQuery: string }
    >({
      query: ({ email, page, limit, searchQuery }) => {
        const encodedEmail = encodeURIComponent(email);
        const url = `api/user/getUsersList?email=${encodedEmail}&page=${page}&limit=${limit}&searchQuery=${searchQuery}`;
        return url;
      },
      providesTags: ["UsersList"],
    }),
    getUserDetails: build.query<UserDetails, { id: number }>({
      query: ({ id }) => {
        const url = `api/user/getUserDetails?id=${id}`;
        return url;
      },
      providesTags: ["UsersData"],
    }),
    getUserPersonalDetails: build.query<UserDetailsData, { id: number }>({
      query: ({ id }) => {
        const url = `api/user/getUserPersonalDetails?id=${id}`;
        return url;
      },
      providesTags: ["UsersDetails"],
    }),
    getUserData: build.query<UserData, { username: string }>({
      query: ({ username }) => {
        const url = `api/user/getUserData?username=${username}`;
        return url;
      },
    }),
    getObjectList: build.query<ListResponse[], { entityName: string }>({
      query: ({ entityName }) => {
        const url = `api/user/getList?entityName=${entityName}`;
        return url;
      },
    }),
    getUserHierarchyData: build.query<UserHierarchy[], { userId: number }>({
      query: ({ userId }) => {
        const url = `api/user/getUserHierarchyData?userId=${userId}`;
        return url;
      },
    }),
    getScreenshots: build.query<
      ScreenshotResponse,
      { userId: number; page: number; limit: number; from: string; to: string }
    >({
      query: ({ userId, page, limit, from, to }) => {
        const url = `api/user/getScreenshots?userId=${userId}&page=${page}&limit=${limit}&from=${from}&to=${to}`;
        return url;
      },
      providesTags: ["Screenshots"],
    }),
    getFlaggedScreenshots: build.query<
      ScreenshotResponse,
      { userId: number; page: number; limit: number }
    >({
      query: ({ userId, page, limit }) => {
        const url = `api/user/getFlaggedScreenshots?userId=${userId}&page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ["FlaggedScreenshots"],
    }),
    getUserListFilter: build.query<UserFilterResponse[], { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getUsersListFilter?email=${email}`;
        return url;
      },
    }),
    getPMListFilter: build.query<UserFilterResponse[], { email: string }>({
      query: () => {
        const url = `api/user/getPMListFilter`;
        return url;
      },
    }),
    getTeamListFilter: build.query<TeamFilterResponse[], { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getTeamsListFilter?email=${email}`;
        return url;
      },
    }),
    getLiveStreamUsers: build.query<
      LiveStreamResponse[],
      { email: string; username: string }
    >({
      query: ({ email, username }) => {
        const url = `api/user/getLiveStreamUsers?email=${email}&username=${username}`;
        return url;
      },
    }),
    getProject: build.query<ProjectResponse, { projectId: number }>({
      query: ({ projectId }) => {
        const url = `api/user/getProject?projectId=${projectId}`;
        return url;
      },
      providesTags: ["Project"],
    }),
    getAttendanceCardsData: build.query<
      AttendanceCardsResponse,
      { email: string; fromDate: string; toDate: string; teamId: number }
    >({
      query: ({ email, fromDate, toDate, teamId }) => {
        const url = `api/user/getAttendanceCardsResponse?email=${email}&from=${fromDate}&to=${toDate}&teamId=${teamId}`;
        return url;
      },
    }),
    getAttendanceChartData: build.query<
      AttendanceChartResponse[],
      { email: string; fromDate: string; toDate: string; teamId: number }
    >({
      query: ({ email, fromDate, toDate, teamId }) => {
        const url = `api/user/getAttendanceChartResponse?email=${email}&from=${fromDate}&to=${toDate}&teamId=${teamId}`;
        return url;
      },
    }),
    getAttendancePCData: build.query<
      PCResponse,
      { email: string; teamId: number }
    >({
      query: ({ email, teamId }) => {
        const url = `api/user/getAttendancePCResponse?email=${email}&teamId=${teamId}`;
        return url;
      },
    }),
    getAttendanceCustomTableData: build.query<
      CustomTableResponse[],
      {
        email: string;
        fromDate: string;
        toDate: string;
        teamId: number;
        lateFlag: boolean;
      }
    >({
      query: ({ email, fromDate, toDate, teamId, lateFlag }) => {
        const url = `api/user/getAttendanceCustomtableResponse?email=${email}&from=${fromDate}&to=${toDate}&teamId=${teamId}&lateFlag=${lateFlag}`;
        return url;
      },
    }),
    getProjects: build.query<
      ProjectListResponse[],
      { email: string; closedFlag: boolean }
    >({
      query: ({ email, closedFlag }) => {
        const url = `api/user/getProjects?email=${email}&closedFlag=${closedFlag}`;
        return url;
      },
      providesTags: ["ProjectsList"],
    }),
    getProjectReport: build.query<
      ProjectReportListResponse[],
      { idList: number[]; projectManager: string }
    >({
      query: ({ idList, projectManager }) => {
        const url = `api/user/getProjectReport?idList=${idList}&projectManager=${projectManager}`;
        return url;
      },
    }),
    getProjectNames: build.query<ProjectNamesResponse[], {}>({
      query: () => {
        const url = `api/user/getProjectNames`;
        return url;
      },
    }),
    getProjectForTeams: build.query<
      ProjectListForTeamResponse[],
      { email: string }
    >({
      query: ({ email }) => {
        const url = `api/user/getProjectsForTeam?email=${email}`;
        return url;
      },
    }),
    getSelectedProjectForTeams: build.query<
      ProjectListForTeamResponse[],
      { teamId: number }
    >({
      query: ({ teamId }) => {
        const url = `api/user/getSelectedProjectsForTeam?teamId=${teamId}`;
        return url;
      },
    }),
    getSelectedBreakTypeForTeams: build.query<
      BreaksForTeams[],
      { teamId: number }
    >({
      query: ({ teamId }) => {
        const url = `api/user/getSelectedBreaksForTeam?teamId=${teamId}`;
        return url;
      },
    }),
    getProjectTasks: build.query<
      GetProjectTasksResponse,
      {
        projectId: string;
        sprint: string;
        assignedTo: string;
        priority: string;
        isTaskOrSubTask: string;
        email: string;
        page: number;
        limit: number;
      }
    >({
      query: ({
        projectId,
        sprint,
        assignedTo,
        priority,
        isTaskOrSubTask,
        email,
        page,
        limit,
      }) => {
        const url = `api/user/getProjectTasks?id=${projectId}&sprint=${sprint}&assignedTo=${assignedTo}&priority=${priority}&isTaskOrSubTask=${isTaskOrSubTask}&email=${email}&page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ["Tasks"],
    }),
    getProjectTasksCalendar: build.query<
      GetProjectTasksCalendarResponse[],
      {
        projectId: string;
        sprint: string;
        assignedTo: string;
        priority: string;
        isTaskOrSubTask: string;
        email: string;
        page: number;
        limit: number;
      }
    >({
      query: ({
        projectId,
        sprint,
        assignedTo,
        priority,
        isTaskOrSubTask,
        email,
        page,
        limit,
      }) => {
        const url = `api/user/getProjectTasksCalendar?id=${projectId}&sprint=${sprint}&assignedTo=${assignedTo}&priority=${priority}&isTaskOrSubTask=${isTaskOrSubTask}&email=${email}&page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ["Tasks"],
    }),
    getTaskComments: build.query<
      TaskComments[],
      { taskId: number; email: string }
    >({
      query: ({ taskId, email }) => {
        const url = `api/user/getComments?taskId=${taskId}&email=${email}`;
        return url;
      },
      providesTags: ["Comment"],
    }),
    getTeams: build.query<Teams[], { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getTeamsList?&email=${email}`;
        return url;
      },
    }),
    getBreaks: build.query<Breaks[], { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getBreaksList?&email=${email}`;
        return url;
      },
      providesTags: ["Breaks"],
    }),
    getBreaksForTeams: build.query<BreaksForTeams[], { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getBreaksListForTeams?&email=${email}`;
        return url;
      },
    }),
    getTeamsConfiguration: build.query<
      TeamConfiguration,
      { email: string; teamId: number }
    >({
      query: ({ email, teamId }) => {
        const url = `api/user/getTeamsConfiguration?&email=${email}&teamId=${teamId}`;
        return url;
      },
    }),
    getSubTaskComments: build.query<
      TaskComments[],
      { subTaskId: number; email: string }
    >({
      query: ({ subTaskId, email }) => {
        const url = `api/user/getSubTaskComments?subTaskId=${subTaskId}&email=${email}`;
        return url;
      },
      providesTags: ["SubTaskComment"],
    }),
    addComment: build.mutation<ApiResponse[], AddComment>({
      query: (comment) => ({
        url: "api/user/addComment",
        method: "POST",
        body: comment,
      }),
      invalidatesTags: ["Comment", "Tasks", "AlertCount"],
    }),
    addSubTaskComment: build.mutation<ApiResponse[], AddSubTaskComment>({
      query: (comment) => ({
        url: "api/user/addSubTaskComment",
        method: "POST",
        body: comment,
      }),
      invalidatesTags: ["SubTaskComment", "SubTask"],
    }),
    getProjectUsers: build.query<ProjectUsers[], { projectId: string }>({
      query: ({ projectId }) => {
        const url = `api/user/getProjectUsers?id=${projectId}`;
        return url;
      },
    }),
    updateScreenshotFlag: build.mutation<
      ApiResponse,
      { screenshotId: number; flag: boolean }
    >({
      query: ({ screenshotId, flag }) => ({
        url: `api/user/updateScreenshotFlag?id=${screenshotId}&flag=${flag}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Screenshots", "FlaggedScreenshots"],
    }),
    updateTaskStatus: build.mutation<
      ApiResponse,
      { taskId: number; status: string; email: string }
    >({
      query: ({ taskId, status, email }) => ({
        url: `api/user/updateTaskStatus?taskId=${taskId}&email=${email}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Tasks", "Task"],
    }),
    updateTimesheetEntry: build.mutation<
      ApiResponse,
      {
        id: number;
        email: string;
        approvedHours: string;
        approveRejectFlag: boolean;
      }
    >({
      query: ({ id, email, approveRejectFlag, approvedHours }) => ({
        url: `api/user/updateTimesheet?id=${id}&email=${email}&approveRejectFlag=${approveRejectFlag}&approvedHours=${approvedHours}`,
        method: "PATCH",
      }),
      invalidatesTags: ["PendingTimesheet"],
    }),
    updateLeave: build.mutation<
      ApiResponse,
      {
        leaveId: number;
        email: string;
        approveRejectFlag: boolean;
      }
    >({
      query: ({ leaveId, email, approveRejectFlag }) => ({
        url: `api/user/updateLeave?id=${leaveId}&email=${email}&approveRejectFlag=${approveRejectFlag}`,
        method: "PATCH",
      }),
      invalidatesTags: ["LeaveApprovalData"],
    }),
    updateProjectStatus: build.mutation<
      ApiResponse,
      { projectId: number; status: string; email: string }
    >({
      query: ({ projectId, status, email }) => ({
        url: `api/user/updateProjectStatus?projectId=${projectId}&email=${email}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Project"],
    }),
    closeTask: build.mutation<ApiResponse, { taskId: number; email: string }>({
      query: ({ taskId, email }) => ({
        url: `api/user/closeCompletedTask?taskId=${taskId}&email=${email}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Tasks", "TaskActivity", "TaskHistory", "Task"],
    }),
    updateTaskAssignee: build.mutation<Task, { taskId: number; email: string }>(
      {
        query: ({ taskId, email }) => ({
          url: `api/user/updateTaskAssignee?taskId=${taskId}&email=${email}`,
          method: "PATCH",
        }),
        invalidatesTags: ["Tasks", "Task", "TaskHistory"],
      }
    ),
    updateTaskProgress: build.mutation<
      ApiResponse,
      { taskId: number; email: string; progressStart: boolean }
    >({
      query: ({ taskId, email, progressStart }) => ({
        url: `api/user/startTaskProgress?taskId=${taskId}&progressStart=${progressStart}&email=${email}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Task", "ProjectHours", "TaskActivity"],
    }),
    updateSubTaskProgress: build.mutation<
      ApiResponse,
      { taskId: number; email: string; progressStart: boolean }
    >({
      query: ({ taskId, email, progressStart }) => ({
        url: `api/user/startSubTaskProgress?taskId=${taskId}&progressStart=${progressStart}&email=${email}`,
        method: "PATCH",
      }),
      invalidatesTags: ["SubTask", "SubTaskActivity"],
    }),
    updateTask: build.mutation<ApiResponse, UpdateTaskData>({
      query: (body) => ({
        url: `api/user/updateTask`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Tasks", "Task", "TaskHistory", "TaskActivity"],
    }),
    updateUserData: build.mutation<ApiResponse, UpdateUserData>({
      query: (body) => ({
        url: `api/user/updateUserData`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["UsersDetails"],
    }),
    reopenTask: build.mutation<ApiResponse, ReopenTaskData>({
      query: (body) => ({
        url: `api/user/reopenTask`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Task", "TaskHistory", "TaskActivity", "Comment"],
    }),
    updateProject: build.mutation<ApiResponse, UpdateProjectData>({
      query: (body) => ({
        url: `api/user/updateProject`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Project"],
    }),
    updateSubTask: build.mutation<ApiResponse, UpdateSubTaskData>({
      query: (body) => ({
        url: `api/user/updateSubTask`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["SubTask", "SubTaskActivity"],
    }),
    updateSubTaskStatus: build.mutation<ApiResponse, UpdateSubTaskStatusData>({
      query: (body) => ({
        url: `api/user/updateSubTaskStatus`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Tasks"],
    }),
    uploadAttachment: build.mutation<ApiResponse, UploadAttachment>({
      query: (body) => ({
        url: `api/user/uploadAttachment`,
        method: "POST",
        body: body,
        async onUploadProgress(progressEvent: AxiosProgressEvent) {
          // Calculate progress as percentage
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            return progress; // Return progress percentage
          }
        },
      }),
      invalidatesTags: ["Task", "TaskActivity"],
    }),
    uploadProjectAttachment: build.mutation<
      ApiResponse,
      UploadProjectAttachment
    >({
      query: (body) => ({
        url: `api/user/uploadProjectAttachment`,
        method: "POST",
        body: body,
        async onUploadProgress(progressEvent: AxiosProgressEvent) {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            return progress;
          }
        },
      }),
      invalidatesTags: ["Project"],
    }),
    uploadSubTaskAttachment: build.mutation<
      ApiResponse,
      UploadSubTaskAttachment
    >({
      query: (body) => ({
        url: `api/user/uploadSubTaskAttachment`,
        method: "POST",
        body: body,
        async onUploadProgress(progressEvent: AxiosProgressEvent) {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            return progress;
          }
        },
      }),
      invalidatesTags: ["SubTask", "SubTaskActivity"],
    }),
    createTask: build.mutation<ApiResponse, TaskFormData>({
      query: (task) => ({
        url: "api/user/createTask",
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Tasks"],
    }),
    createLeave: build.mutation<ApiResponse, LeaveData>({
      query: (leaveData) => ({
        url: "api/user/createLeave",
        method: "POST",
        body: leaveData,
      }),
      invalidatesTags: ["LeaveData"],
    }),
    createTeam: build.mutation<ApiResponse, TeamRequest>({
      query: (teamReq) => ({
        url: "api/user/createTeam",
        method: "POST",
        body: teamReq,
      }),
    }),
    createBreak: build.mutation<ApiResponse, BreakRequest>({
      query: (breakReq) => ({
        url: "api/user/createBreak",
        method: "POST",
        body: breakReq,
      }),
    }),
    createBulkTasks: build.mutation<ApiResponse, TaskFormData[]>({
      query: (tasks) => ({
        url: "api/user/createBulkTasks",
        method: "POST",
        body: tasks,
      }),
      invalidatesTags: ["Tasks", "ProjectHours"],
    }),
    createBulkUsers: build.mutation<ApiResponse, BulkUser[]>({
      query: (tasks) => ({
        url: "api/user/createBulkUsers",
        method: "POST",
        body: tasks,
      }),
      invalidatesTags: ["UsersList"],
    }),
    createUser: build.mutation<ApiResponse, CreateUserData>({
      query: (user) => ({
        url: "api/user/signUp",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["UsersList", "UserCount"],
    }),
    createTimesheetEntry: build.mutation<ApiResponse, timesheetEntry>({
      query: (timesheetEntry) => ({
        url: "api/user/createTimesheetEntry",
        method: "POST",
        body: timesheetEntry,
      }),
      invalidatesTags: ["Timesheet"],
    }),
    createAutoReport: build.mutation<ApiResponse, ReportConfig>({
      query: (reportConfig) => ({
        url: "api/user/createReportsConfig",
        method: "POST",
        body: reportConfig,
      }),
      invalidatesTags: ["AutoReports"],
    }),
    getConfiguredReports: build.query<ConfiguredReports[], { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getConfiguredReports?email=${email}`;
        return url;
      },
      providesTags: ["AutoReports"],
    }),
    getTimesheetData: build.query<
      TimesheetResponse,
      { email: string; date: string }
    >({
      query: ({ email, date }) => {
        const url = `api/user/getTimesheetData?email=${email}&date=${date}`;
        return url;
      },
      providesTags: ["Timesheet"],
    }),
    getLeaveData: build.query<LeaveResponse[], { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getLeaveData?email=${email}`;
        return url;
      },
      providesTags: ["LeaveData"],
    }),
    getLeaveApprovalData: build.query<LeaveResponse[], { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getLeaveApprovalData?email=${email}`;
        return url;
      },
      providesTags: ["LeaveApprovalData"],
    }),
    getUsersGeoData: build.query<UserGeoData[], { date: string }>({
      query: ({ date }) => {
        const url = `api/user/getUsersGeoData?date=${date}`;
        return url;
      },
    }),
    getTotalTaskTime: build.query<string, { taskId: string }>({
      query: ({ taskId }) => {
        const url = `api/user/getTotalTaskTime?taskId=${taskId}`;
        return url;
      },
    }),
    getAttendanceData: build.query<
      AttendanceCardResponse,
      { email: string; title: string }
    >({
      query: ({ email, title }) => {
        const url = `api/user/getAttendanceData?email=${email}&title=${title}`;
        return url;
      },
    }),
    getUserAttendanceData: build.query<
      AttendanceUserPCResponse,
      { email: string }
    >({
      query: ({ email }) => {
        const url = `api/user/getUserAttendancePCData?email=${email}`;
        return url;
      },
    }),
    getUserAttendanceTableData: build.query<
      AttendanceUserTableResponse[],
      { email: string; adminFlag: boolean; date: string }
    >({
      query: ({ email, adminFlag, date }) => {
        const url = `api/user/getUserAttendanceTableData?email=${email}&adminFlag=${adminFlag}&date=${date}`;
        return url;
      },
    }),
    getUserAttendanceReportData: build.query<
      AttendanceReportTableResponse[],
      { email: string; month: string; year: string }
    >({
      query: ({ email, month, year }) => {
        const url = `api/user/getUserAttendanceReportData?email=${email}&month=${month}&year=${year}`;
        return url;
      },
    }),
    getUserAttendanceTeamReportData: build.query<
      AttendanceReportTableResponse[],
      {
        teamName: string;
        month: string;
        year: string;
      }
    >({
      query: ({ teamName, month, year }) => {
        const url = `api/user/getUserAttendanceTeamReportData?teamName=${teamName}&month=${month}&year=${year}`;
        return url;
      },
    }),
    getUserTimesheetTeamReportData: build.query<
      TimesheetReportTableResponse[],
      {
        teamName: string;
        month: string;
        email: string;
        year: string;
      }
    >({
      query: ({ teamName, month, email, year }) => {
        const url = `api/user/getUserTimesheetTeamReportData?teamName=${teamName}&month=${month}&email=${email}&year=${year}`;
        return url;
      },
    }),
    getAttendanceLineChartData: build.query<
      AttendanceCardLCResponse[],
      { email: string; title: string }
    >({
      query: ({ email, title }) => {
        const url = `api/user/getAttendanceLCData?email=${email}&title=${title}`;
        return url;
      },
    }),
    viewTimesheetData: build.query<
      TimesheetResponse,
      { name: string; date: string }
    >({
      query: ({ name, date }) => {
        const url = `api/user/viewTimesheetData?name=${name}&date=${date}`;
        return url;
      },
    }),
    viewBreakData: build.query<
      BreakResponse[],
      { userId: number; date: string }
    >({
      query: ({ userId, date }) => {
        const url = `api/user/viewBreaksheetData?userId=${userId}&date=${date}`;
        return url;
      },
    }),
    getPendingTimesheetData: build.query<
      PendingTimesheetResponse[],
      { email: string; date: string }
    >({
      query: ({ email, date }) => {
        const url = `api/user/getPendingTimesheetData?email=${email}&date=${date}`;
        return url;
      },
      providesTags: ["PendingTimesheet"],
    }),
    getUsersTimesheetData: build.query<
      PendingTimesheetResponse[],
      { email: string; date: string }
    >({
      query: ({ email, date }) => {
        const url = `api/user/getUsersTimesheetData?email=${email}&date=${date}`;
        return url;
      },
    }),
    getAlertsCount: build.query<AlertCount, { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getAlertCount?email=${email}`;
        return url;
      },
      providesTags: ["AlertCount"],
    }),
    getAlerts: build.query<Alert[], { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getAlert?email=${email}`;
        return url;
      },
      providesTags: ["Alert"],
    }),
    deleteConfigReports: build.mutation<ApiResponse, { reportId: number }>({
      query: ({ reportId }) => ({
        url: `api/user/deleteConfigReport?reportId=${reportId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AutoReports"],
    }),
    deleteTriggeredAlerts: build.mutation<ApiResponse, { alertId: number }>({
      query: ({ alertId }) => ({
        url: `api/user/deleteAlert?alertId=${alertId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Alert", "AlertCount"],
    }),
    deleteBreak: build.mutation<ApiResponse, { breakId: number }>({
      query: ({ breakId }) => ({
        url: `api/user/deleteBreak?breakId=${breakId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Breaks"],
    }),
    createSubTask: build.mutation<ApiResponse, SubTaskFormData>({
      query: (task) => ({
        url: "api/user/createSubTask",
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Task"],
    }),
    createProject: build.mutation<ApiResponse, ProjectFormData>({
      query: (project) => ({
        url: "api/user/createProject",
        method: "POST",
        body: project,
      }),
      invalidatesTags: ["ProjectsList"],
    }),
    createSprint: build.mutation<ApiResponse, CreateSprint>({
      query: (body) => ({
        url: "api/user/createSprint",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["SprintCount"],
    }),
    getSprint: build.query<SprintResponse[], { projectId: string }>({
      query: ({ projectId }) => {
        const url = `api/user/getSprint?projectId=${projectId}`;
        return url;
      },
      providesTags: ["SprintCount"],
    }),
    getTeamLeads: build.query<TeamLeadResponse[], { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getTeamLeads?email=${email}`;
        return url;
      },
    }),
    getProjectHoursEstimation: build.query<ProjectHours, { projectId: number }>(
      {
        query: ({ projectId }) => {
          const url = `api/user/getProjectHoursEstimation?projectId=${projectId}`;
          return url;
        },
        providesTags: ["ProjectHours"],
      }
    ),
    getProjectSprint: build.query<SprintData, { sprintId: number }>({
      query: ({ sprintId }) => {
        const url = `api/user/getProjectSprint?sprintId=${sprintId}`;
        return url;
      },
    }),
    updateProjectSprint: build.mutation<ApiResponse, UpdateSprintObject>({
      query: (updateSprintObject) => ({
        url: "api/user/updateProjectSprint",
        method: "POST",
        body: updateSprintObject,
      }),
      invalidatesTags: ["Tasks", "SprintCount"],
    }),
    updateBreakDetails: build.mutation<ApiResponse, UpdateBreakObj>({
      query: (updateBreakObject) => ({
        url: "api/user/updateBreakObj",
        method: "POST",
        body: updateBreakObject,
      }),
      invalidatesTags: ["Breaks"],
    }),
    getMentionedUsers: build.query<MentionedUser[], { name: string }>({
      query: ({ name }) => {
        const url = `api/user/getMentionedUsers?name=${name}`;
        return url;
      },
    }),
    getTaskHistory: build.query<TaskHistory[], { taskId: number }>({
      query: ({ taskId }) => {
        const url = `api/user/getTaskHistory?taskId=${taskId}`;
        return url;
      },
      providesTags: ["TaskHistory"],
    }),
    getTaskActivity: build.query<TaskActivity[], { taskId: number }>({
      query: ({ taskId }) => {
        const url = `api/user/getTaskActivity?taskId=${taskId}`;
        return url;
      },
      providesTags: ["TaskActivity"],
    }),
    getSubTaskActivity: build.query<TaskActivity[], { taskId: number }>({
      query: ({ taskId }) => {
        const url = `api/user/getSubTaskActivity?taskId=${taskId}`;
        return url;
      },
      providesTags: ["SubTaskActivity"],
    }),
    deleteAttachment: build.mutation<
      ApiResponse,
      { taskId: number; isSubTask: boolean; email: string }
    >({
      query: ({ taskId, isSubTask, email }) => ({
        url: `api/user/deleteAttachment?taskId=${taskId}&isSubTask=${isSubTask}&email=${email}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task", "SubTask", "TaskActivity", "SubTaskActivity"],
    }),
    deleteProjectAttachment: build.mutation<
      ApiResponse,
      { attachmentId: number; email: string; projectId: number }
    >({
      query: ({ attachmentId, email, projectId }) => ({
        url: `api/user/deleteProjectAttachment?attachmentId=${attachmentId}&email=${email}&projectId=${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),
    downloadAttachment: build.mutation<
      DownloadAttachment,
      { taskId: number; isSubTask: boolean }
    >({
      query: ({ taskId }) => ({
        url: `api/user/downloadAttachment?taskId=${taskId}`,
        method: "GET",
      }),
    }),
    downloadProjectAttachment: build.mutation<
      DownloadProjectAttachment,
      { attachmentId: number }
    >({
      query: ({ attachmentId }) => ({
        url: `api/user/downloadProjectAttachment?attachmentId=${attachmentId}`,
        method: "GET",
      }),
    }),
    getTask: build.query<Task, { taskId: number }>({
      query: ({ taskId }) => {
        const url = `api/user/getTask?taskId=${taskId}`;
        return url;
      },
      providesTags: ["Task"],
    }),
    getSubTask: build.query<SubTaskObject, { subTaskId: number }>({
      query: ({ subTaskId }) => {
        const url = `api/user/getSubTask?subTaskId=${subTaskId}`;
        return url;
      },
      providesTags: ["SubTask"],
    }),
    getAdminRole: build.query<AdminRoleResponse, { email: string }>({
      query: ({ email }) => {
        const url = `api/user/getAdminRole?email=${email}`;
        return url;
      },
    }),
    getProjectManager: build.query<PmUserResponse[], "">({
      query: () => {
        const url = `api/user/getPmUsers`;
        return url;
      },
    }),
    updateTeamsConfigurationData: build.mutation<
      ApiResponse,
      {
        email: string;
        teamId: number;
        projects: ListReq[];
        breaks: ListReq[];
        idleTimeout: string;
        allowPictureModification: boolean;
        workingHours: string;
      }
    >({
      query: ({
        email,
        teamId,
        projects,
        breaks,
        idleTimeout,
        allowPictureModification,
        workingHours,
      }) => {
        const requestBody = JSON.stringify({
          projects,
          breaks,
          idleTimeout,
          allowPictureModification,
          workingHours,
        });
        return {
          url: `api/user/updateTeamsConfigurationData?email=${email}&teamId=${teamId}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
        };
      },
    }),
    updateUserSettingsData: build.mutation<
      ApiResponse,
      {
        email: string;
        reportingUsers: ListResponse[];
        reportsTo: string;
        projects: ListResponse[];
        teams: ListResponse[];
        roles: ListResponse[];
        selectedTimeOut: string;
        workingHours: string;
        isSignoutEnabled: boolean;
        isProfilePicModificationEnabled: boolean;
      }
    >({
      query: ({
        email,
        reportingUsers,
        reportsTo,
        projects,
        teams,
        roles,
        selectedTimeOut,
        workingHours,
        isSignoutEnabled,
        isProfilePicModificationEnabled,
      }) => {
        const requestBody = JSON.stringify({
          reportingUsers,
          reportsTo,
          projects,
          teams,
          roles,
          selectedTimeOut,
          workingHours,
          isSignoutEnabled,
          isProfilePicModificationEnabled,
        });
        return {
          url: `api/user/updateUserSettingsData?email=${email}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
        };
      },
      invalidatesTags: ["UsersData"],
    }),
    updateUserBasicSettingsData: build.mutation<
      ApiResponse,
      {
        userId: number;
        email: string;
        username: string;
        designation: string;
        phone: string;
      }
    >({
      query: ({ email, userId, username, designation, phone }) => {
        const requestBody = JSON.stringify({
          userId,
          email,
          username,
          designation,
          phone,
        });
        return {
          url: `api/user/updateUserBasicSettingsData?email=${email}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
        };
      },
      invalidatesTags: ["UsersData"],
    }),
  }),
});

export const {
  useGetUsersCountQuery,
  useGetAuthoritiesQuery,
  useUpdateProfilePictureMutation,
  useGetUserQuery,
  useCheckRoleCodeQuery,
  useCreateRoleMutation,
  useGetUsersListQuery,
  useGetUserDetailsQuery,
  useGetObjectListQuery,
  useUpdateUserSettingsDataMutation,
  useGetUserHierarchyDataQuery,
  useGetScreenshotsQuery,
  useGetUserListFilterQuery,
  useGetLiveStreamUsersQuery,
  useGetProjectsQuery,
  useGetProjectTasksQuery,
  useUpdateTaskStatusMutation,
  useGetProjectUsersQuery,
  useCreateTaskMutation,
  useUpdateTaskAssigneeMutation,
  useGetTaskCommentsQuery,
  useAddCommentMutation,
  useCreateSprintMutation,
  useGetSprintQuery,
  useCreateProjectMutation,
  useGetProjectManagerQuery,
  useGetTaskQuery,
  useUpdateTaskMutation,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
  useDownloadAttachmentMutation,
  useCreateSubTaskMutation,
  useGetSubTaskQuery,
  useAddSubTaskCommentMutation,
  useGetSubTaskCommentsQuery,
  useUploadSubTaskAttachmentMutation,
  useUpdateSubTaskMutation,
  useCloseTaskMutation,
  useGetTaskHistoryQuery,
  useCreateAutoReportMutation,
  useGetConfiguredReportsQuery,
  useDeleteConfigReportsMutation,
  useUpdateTaskProgressMutation,
  useGetProjectHoursEstimationQuery,
  useGetMentionedUsersQuery,
  useGetAlertsCountQuery,
  useGetAlertsQuery,
  useDeleteTriggeredAlertsMutation,
  useGetUserDataQuery,
  useGetProjectQuery,
  useUpdateProjectStatusMutation,
  useUpdateProjectMutation,
  useUploadProjectAttachmentMutation,
  useDeleteProjectAttachmentMutation,
  useDownloadProjectAttachmentMutation,
  useCreateBulkTasksMutation,
  useGetTaskActivityQuery,
  useGetTimesheetDataQuery,
  useCreateTimesheetEntryMutation,
  useGetPendingTimesheetDataQuery,
  useUpdateTimesheetEntryMutation,
  useGetUsersTimesheetDataQuery,
  useCreateUserMutation,
  useViewTimesheetDataQuery,
  useGetAttendanceDataQuery,
  useGetAttendanceLineChartDataQuery,
  useGetUserAttendanceDataQuery,
  useGetUserAttendanceTableDataQuery,
  useGetAdminRoleQuery,
  useUpdateUserBasicSettingsDataMutation,
  useGetProjectSprintQuery,
  useUpdateProjectSprintMutation,
  useGetProjectTasksCalendarQuery,
  useCreateTeamMutation,
  useGetTeamsQuery,
  useGetTeamLeadsQuery,
  useCreateBreakMutation,
  useDeleteBreakMutation,
  useGetBreaksQuery,
  useUpdateBreakDetailsMutation,
  useGetProjectForTeamsQuery,
  useGetBreaksForTeamsQuery,
  useUpdateTeamsConfigurationDataMutation,
  useGetSelectedBreakTypeForTeamsQuery,
  useGetSelectedProjectForTeamsQuery,
  useViewBreakDataQuery,
  useUpdateSubTaskProgressMutation,
  useGetSubTaskActivityQuery,
  useGetTotalTaskTimeQuery,
  useUpdateSubTaskStatusMutation,
  useGetTeamsConfigurationQuery,
  useGetUsersGeoDataQuery,
  useReopenTaskMutation,
  useUpdateScreenshotFlagMutation,
  useGetFlaggedScreenshotsQuery,
  useGetUserPersonalDetailsQuery,
  useUpdateUserDataMutation,
  useCreateLeaveMutation,
  useGetLeaveDataQuery,
  useGetLeaveApprovalDataQuery,
  useUpdateLeaveMutation,
  useCreateBulkUsersMutation,
  useGetAttendanceCardsDataQuery,
  useGetTeamListFilterQuery,
  useGetAttendanceChartDataQuery,
  useGetAttendancePCDataQuery,
  useGetAttendanceCustomTableDataQuery,
  useGetUserAttendanceReportDataQuery,
  useGetUserAttendanceTeamReportDataQuery,
  useGetUserTimesheetTeamReportDataQuery,
  useGetProjectNamesQuery,
  useGetPMListFilterQuery,
  useGetProjectReportQuery,
} = api;
