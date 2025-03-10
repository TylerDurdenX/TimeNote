import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AddComment,
  AddSubTaskComment,
  AdminRoleResponse,
  Alert,
  AlertCount,
  AttendanceCardLCResponse,
  AttendanceCardResponse,
  AttendanceUserPCResponse,
  AttendanceUserTableResponse,
  ConfiguredReports,
  CreateSprint,
  CreateUserData,
  DownloadAttachment,
  DownloadProjectAttachment,
  GetProjectTasksResponse,
  ListResponse,
  LiveStreamResponse,
  MentionedUser,
  PendingTimesheetResponse,
  PmUserResponse,
  ProjectFormData,
  ProjectHours,
  ProjectListResponse,
  ProjectResponse,
  ProjectUsers,
  ReportConfig,
  ScreenshotResponse,
  SprintResponse,
  SubTaskFormData,
  SubTaskObject,
  Task,
  TaskActivity,
  TaskComments,
  TaskFormData,
  TaskHistory,
  TimesheetData,
  timesheetEntry,
  TimesheetResponse,
  UpdateProjectData,
  UpdateSubTaskData,
  UpdateTaskData,
  UploadAttachment,
  UploadProjectAttachment,
  UploadSubTaskAttachment,
  UserData,
  UserDetails,
  UserFilterResponse,
  UserHierarchy,
  UsersListResponse,
} from "./interfaces";
import { AxiosProgressEvent } from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from "react-router-dom";
import { useRouter } from "next/router";


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
      credentials: 'include',
    })(args, api, extraOptions);

    if (result.error?.status === 401) {
      toast.error('Your session has expired. Please log in again.');
      window.location.href = '/'
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
    "Timesheet",
    "PendingTimesheet"
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
      { email: string }
    >({
      query: ({ email }) => {
        const encodedEmail = encodeURIComponent(email);
        const url = `api/user/getUsersList?email=${encodedEmail}`;
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
    getUserData: build.query< UserData, { username: string }>({
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
    }),
    getUserListFilter: build.query<
    UserFilterResponse[],
      { email: string }
    >({
      query: ({ email }) => {
        const url = `api/user/getUsersListFilter?email=${email}`;
        return url;
      },
    }),
    getLiveStreamUsers: build.query<
    LiveStreamResponse[],
      { email: string, username: string }
    >({
      query: ({ email, username }) => {
        const url = `api/user/getLiveStreamUsers?email=${email}&username=${username}`;
        return url;
      },
    }),
    getProject: build.query<
    ProjectResponse,
      { projectId: number}
    >({
      query: ({ projectId,}) => {
        const url = `api/user/getProject?projectId=${projectId}`;
        return url;
      },
      providesTags: ["Project"],
    }),
    getProjects: build.query<
    ProjectListResponse[],
      { email: string}
    >({
      query: ({ email,}) => {
        const url = `api/user/getProjects?email=${email}`;
        return url;
      },
      providesTags: ["ProjectsList"],
    }),
    getProjectTasks: build.query<
    GetProjectTasksResponse,
      { projectId: string, sprint: string, assignedTo: string, priority: string, isTaskOrSubTask: string, email: string, page: number, limit: number,}
    >({
      query: ({ projectId, sprint, assignedTo, priority, isTaskOrSubTask, email, page, limit}) => {
        const url = `api/user/getProjectTasks?id=${projectId}&sprint=${sprint}&assignedTo=${assignedTo}&priority=${priority}&isTaskOrSubTask=${isTaskOrSubTask}&email=${email}&page=${page}&limit=${limit}`;
        return url;
      },
      providesTags: ["Tasks"],
    }),
    getTaskComments: build.query<
    TaskComments[],
      { taskId: number, email: string}
    >({
      query: ({ taskId,email,}) => {
        const url = `api/user/getComments?taskId=${taskId}&email=${email}`;
        return url;
      },
      providesTags: ["Comment"],
    }),
    getSubTaskComments: build.query<
    TaskComments[],
      { subTaskId: number, email: string}
    >({
      query: ({ subTaskId,email,}) => {
        const url = `api/user/getSubTaskComments?subTaskId=${subTaskId}&email=${email}`;
        return url;
      },
      providesTags: ["SubTaskComment"],
    }),
    addComment: build.mutation<
    ApiResponse[],
      AddComment
    >({
      query: (comment) => ({
        url: "api/user/addComment",
        method: "POST",
        body: comment,
      }),
      invalidatesTags: ["Comment","Tasks", "AlertCount"],
    }),
    addSubTaskComment: build.mutation<
    ApiResponse[],
    AddSubTaskComment
    >({
      query: (comment) => ({
        url: "api/user/addSubTaskComment",
        method: "POST",
        body: comment,
      }),
      invalidatesTags: ["SubTaskComment","SubTask"],
    }),
    getProjectUsers: build.query<
    ProjectUsers[],
      { projectId: string}
    >({
      query: ({ projectId,}) => {
        const url = `api/user/getProjectUsers?id=${projectId}`;
        return url;
      },
    }),
    updateTaskStatus: build.mutation<ApiResponse, {taskId: number, status: string, email: string}>({
      query: ({taskId, status, email})=> ({
          url: `api/user/updateTaskStatus?taskId=${taskId}&email=${email}`,
          method: "PATCH",
          body: {status},
      }), 
      invalidatesTags : ["Tasks", "Task"]
  }),
  updateTimesheetEntry: build.mutation<ApiResponse, {id: number, email: string, approveRejectFlag: boolean}>({
    query: ({id,  email, approveRejectFlag})=> ({
        url: `api/user/updateTimesheet?id=${id}&email=${email}&approveRejectFlag=${approveRejectFlag}`,
        method: "PATCH",
    }), 
    invalidatesTags : ["PendingTimesheet"]
}),
  updateProjectStatus: build.mutation<ApiResponse, {projectId: number, status: string, email: string}>({
    query: ({projectId, status, email})=> ({
        url: `api/user/updateProjectStatus?projectId=${projectId}&email=${email}`,
        method: "PATCH",
        body: {status},
    }), 
    invalidatesTags : ["Project"]
}),
  closeTask: build.mutation<ApiResponse, {taskId: number, email: string}>({
    query: ({taskId, email})=> ({
        url: `api/user/closeCompletedTask?taskId=${taskId}&email=${email}`,
        method: "PATCH",
    }), 
    invalidatesTags : ["Tasks", "TaskActivity", "TaskHistory","Task"]
}),
  updateTaskAssignee: build.mutation<Task, {taskId: number, email: string}>({
    query: ({taskId, email})=> ({
        url: `api/user/updateTaskAssignee?taskId=${taskId}&email=${email}`,
        method: "PATCH",
    }), 
    invalidatesTags : ["Tasks", "Task","TaskHistory"]
}),
updateTaskProgress: build.mutation<ApiResponse, {taskId: number, progressStart: boolean}>({
  query: ({taskId, progressStart})=> ({
      url: `api/user/startTaskProgress?taskId=${taskId}&progressStart=${progressStart}`,
      method: "PATCH",
  }), 
  invalidatesTags : ["Task","ProjectHours", "TaskActivity"]
}),
updateTask: build.mutation<ApiResponse, UpdateTaskData>({
  query: (body)=> ({
      url: `api/user/updateTask`,
      method: "PATCH",
      body: body,
  }), 
  invalidatesTags : ["Tasks", "Task", "TaskHistory", "TaskActivity"]
}),
updateProject: build.mutation<ApiResponse, UpdateProjectData>({
  query: (body)=> ({
      url: `api/user/updateProject`,
      method: "PATCH",
      body: body,
  }), 
  invalidatesTags : ["Project"]
}),
updateSubTask: build.mutation<ApiResponse, UpdateSubTaskData >({
  query: (body)=> ({
      url: `api/user/updateSubTask`,
      method: "PATCH",
      body: body,
  }), 
  invalidatesTags : ["Task", "SubTask", "Tasks"]
}),
uploadAttachment: build.mutation<ApiResponse, UploadAttachment>({
  query: (body)=> ({
      url: `api/user/uploadAttachment`,
      method: "POST",
      body: body,
      async onUploadProgress(progressEvent: AxiosProgressEvent) {
        // Calculate progress as percentage
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          return progress; // Return progress percentage
        }
      },
  }), 
  invalidatesTags : ["Task", "TaskActivity"]
}),
uploadProjectAttachment: build.mutation<ApiResponse, UploadProjectAttachment>({
  query: (body)=> ({
      url: `api/user/uploadProjectAttachment`,
      method: "POST",
      body: body,
      async onUploadProgress(progressEvent: AxiosProgressEvent) {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          return progress; 
        }
      },
  }), 
  invalidatesTags : ["Project"]
}),
uploadSubTaskAttachment: build.mutation<ApiResponse, UploadSubTaskAttachment>({
  query: (body)=> ({
      url: `api/user/uploadSubTaskAttachment`,
      method: "POST",
      body: body,
      async onUploadProgress(progressEvent: AxiosProgressEvent) {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          return progress; 
        }
      },
  }), 
  invalidatesTags : ["SubTask"]
}),
  createTask: build.mutation<ApiResponse, TaskFormData>({
    query: (task)=> ({
        url: "api/user/createTask",
        method: "POST",
        body: task,
    }), 
    invalidatesTags : ["Tasks"]
}),
createBulkTasks: build.mutation<ApiResponse, TaskFormData[]>({
  query: (tasks)=> ({
      url: "api/user/createBulkTasks",
      method: "POST",
      body: tasks,
  }), 
  invalidatesTags : ["Tasks", "ProjectHours"]
}),
createUser: build.mutation<ApiResponse, CreateUserData>({
  query: (user)=> ({
      url: "api/user/signUp",
      method: "POST",
      body: user,
  }), 
  invalidatesTags : ["UsersList","UserCount"]
}),
createTimesheetEntry: build.mutation<ApiResponse, timesheetEntry>({
  query: (timesheetEntry)=> ({
      url: "api/user/createTimesheetEntry",
      method: "POST",
      body: timesheetEntry,
  }), 
  invalidatesTags : ["Timesheet"]
}),
createAutoReport: build.mutation<ApiResponse, ReportConfig>({
  query: (reportConfig)=> ({
      url: "api/user/createReportsConfig",
      method: "POST",
      body: reportConfig,
  }), 
  invalidatesTags : ["AutoReports"]
}),
getConfiguredReports: build.query<ConfiguredReports[], { email: string}>({
  query: ({ email,}) => {
    const url = `api/user/getConfiguredReports?email=${email}`;
    return url;
  },
  providesTags : ["AutoReports"]
}),
getTimesheetData: build.query<TimesheetResponse, { email: string, date: string}>({
  query: ({ email,date}) => {
    const url = `api/user/getTimesheetData?email=${email}&date=${date}`;
    return url;
  },
  providesTags : ["Timesheet"]
}),
getAttendanceData: build.query<AttendanceCardResponse, { email: string, title: string}>({
  query: ({ email,title}) => {
    const url = `api/user/getAttendanceData?email=${email}&title=${title}`;
    return url;
  },
}),
getUserAttendanceData: build.query<AttendanceUserPCResponse, { email: string}>({
  query: ({ email}) => {
    const url = `api/user/getUserAttendancePCData?email=${email}`;
    return url;
  },
}),
getUserAttendanceTableData: build.query<AttendanceUserTableResponse[], { email: string}>({
  query: ({ email}) => {
    const url = `api/user/getUserAttendanceTableData?email=${email}`;
    return url;
  },
}),
getAttendanceLineChartData: build.query<AttendanceCardLCResponse[], { email: string, title: string}>({
  query: ({ email,title}) => {
    const url = `api/user/getAttendanceLCData?email=${email}&title=${title}`;
    return url;
  },
}),
viewTimesheetData: build.query<TimesheetResponse, { name: string, date: string}>({
  query: ({ name,date}) => {
    const url = `api/user/viewTimesheetData?name=${name}&date=${date}`;
    return url;
  },
}),
getPendingTimesheetData: build.query<PendingTimesheetResponse[], { email: string, date: string}>({
  query: ({ email,date}) => {
    const url = `api/user/getPendingTimesheetData?email=${email}&date=${date}`;
    return url;
  },
  providesTags : ["PendingTimesheet"]
}),
getUsersTimesheetData: build.query<PendingTimesheetResponse[], { email: string, date: string}>({
  query: ({ email,date}) => {
    const url = `api/user/getUsersTimesheetData?email=${email}&date=${date}`;
    return url;
  },
}),
getAlertsCount: build.query<AlertCount, { email: string}>({
  query: ({ email,}) => {
    const url = `api/user/getAlertCount?email=${email}`;
    return url;
  },
  providesTags : ["AlertCount"]
}),
getAlerts: build.query<Alert[], { email: string}>({
  query: ({ email,}) => {
    const url = `api/user/getAlert?email=${email}`;
    return url;
  },
  providesTags: ["Alert"]
}),
deleteConfigReports: build.mutation<ApiResponse, { reportId: number}>({
  query: ({reportId})=> ({
    url: `api/user/deleteConfigReport?reportId=${reportId}`,
    method: "DELETE",
}), 
  invalidatesTags : ["AutoReports"]
}),
deleteTriggeredAlerts: build.mutation<ApiResponse, { alertId: number}>({
  query: ({alertId})=> ({
    url: `api/user/deleteAlert?alertId=${alertId}`,
    method: "DELETE",
}), 
  invalidatesTags : ["Alert", "AlertCount"]
}),
createSubTask: build.mutation<ApiResponse, SubTaskFormData>({
  query: (task)=> ({
      url: "api/user/createSubTask",
      method: "POST",
      body: task,
  }), 
  invalidatesTags : ["Task"]
}),
createProject: build.mutation<ApiResponse, ProjectFormData>({
  query: (project)=> ({
      url: "api/user/createProject",
      method: "POST",
      body: project,
  }), 
  invalidatesTags : ["ProjectsList"]
}),
createSprint: build.mutation<ApiResponse, CreateSprint>({
  query: (body)=> ({
      url: "api/user/createSprint",
      method: "POST",
      body: body,
  }), 
  invalidatesTags : ["SprintCount"]
}),
getSprint: build.query<SprintResponse[], { projectId: string}>({
  query: ({ projectId,}) => {
    const url = `api/user/getSprint?projectId=${projectId}`;
    return url;
  },
  providesTags : ["SprintCount"]
}),
getProjectHoursEstimation: build.query<ProjectHours, { projectId: number}>({
  query: ({ projectId,}) => {
    const url = `api/user/getProjectHoursEstimation?projectId=${projectId}`;
    return url;
  },
  providesTags : ["ProjectHours"]
}),
getMentionedUsers: build.query<MentionedUser[], { name: string}>({
  query: ({ name,}) => {
    const url = `api/user/getMentionedUsers?name=${name}`;
    return url;
  },
}),
getTaskHistory: build.query<TaskHistory[], { taskId: number}>({
  query: ({ taskId,}) => {
    const url = `api/user/getTaskHistory?taskId=${taskId}`;
    return url;
  },
  providesTags : ["TaskHistory"]
}),
getTaskActivity: build.query<TaskActivity[], { taskId: number}>({
  query: ({ taskId,}) => {
    const url = `api/user/getTaskActivity?taskId=${taskId}`;
    return url;
  },
  providesTags : ["TaskActivity"]
}),
deleteAttachment: build.mutation<ApiResponse, { taskId: number, isSubTask: boolean, email: string}>({
  query: ({taskId, isSubTask, email})=> ({
    url: `api/user/deleteAttachment?taskId=${taskId}&isSubTask=${isSubTask}&email=${email}`,
    method: "DELETE",
}), 
  invalidatesTags : ["Task", "SubTask","TaskActivity"]
}),
deleteProjectAttachment: build.mutation<ApiResponse, { attachmentId: number, email: string, projectId: number}>({
  query: ({attachmentId, email,projectId})=> ({
    url: `api/user/deleteProjectAttachment?attachmentId=${attachmentId}&email=${email}&projectId=${projectId}`,
    method: "DELETE",
}), 
  invalidatesTags : ["Project"]
}),
downloadAttachment: build.mutation<DownloadAttachment, { taskId: number, isSubTask: boolean}>({
  query: ({taskId})=> ({
    url: `api/user/downloadAttachment?taskId=${taskId}`,
    method: "GET",
}), 
}),
downloadProjectAttachment: build.mutation<DownloadProjectAttachment, { attachmentId: number}>({
  query: ({attachmentId})=> ({
    url: `api/user/downloadProjectAttachment?attachmentId=${attachmentId}`,
    method: "GET",
}), 
}),
getTask: build.query<Task, { taskId: number}>({
  query: ({ taskId,}) => {
    const url = `api/user/getTask?taskId=${taskId}`;
    return url;
  },
  providesTags : ["Task"]
}),
getSubTask: build.query<SubTaskObject, { subTaskId: number}>({
  query: ({ subTaskId,}) => {
    const url = `api/user/getSubTask?subTaskId=${subTaskId}`;
    return url;
  },
  providesTags : ["SubTask"]
}),
getAdminRole: build.query<AdminRoleResponse, { email: string}>({
  query: ({ email,}) => {
    const url = `api/user/getAdminRole?email=${email}`;
    return url;
  },
}),
getProjectManager: build.query<PmUserResponse[], {}>({
  query: () => {
    const url = `api/user/getPmUsers`;
    return url;
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
        selectedTimeOut: string
        workingHours: string
        isSignoutEnabled: boolean
        isProfilePicModificationEnabled: boolean
      }
    >({
      query: ({ email, reportingUsers, reportsTo, projects, teams, roles, selectedTimeOut, workingHours, isSignoutEnabled, isProfilePicModificationEnabled }) => {
        const requestBody = JSON.stringify({
          reportingUsers,
          reportsTo,
          projects,
          teams,
          roles,
          selectedTimeOut,
          workingHours,
          isSignoutEnabled,
          isProfilePicModificationEnabled
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
        userId: number,
        email: string;
        username: string;
        designation: string;
        phone: string;
      }
    >({
      query: ({ email, userId, username, designation, phone}) => {
        const requestBody = JSON.stringify({
          userId,
          email,
          username,
          designation,
          phone
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
  useUpdateUserBasicSettingsDataMutation
} = api;
