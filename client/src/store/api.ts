import { code } from "@nextui-org/theme";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ListResponse,
  LiveStreamResponse,
  ScreenshotResponse,
  Team,
  UserDetails,
  UserFilterResponse,
  UserHierarchy,
  UsersListResponse,
} from "./interfaces";

import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "api",
  tagTypes: [
    "UserCount",
    "User",
    "RoleCode",
    "Authority",
    "UsersList",
    "UsersData",
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
        console.log("Request URL:", url);
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
    updateUserSettingsData: build.mutation<
      ApiResponse,
      {
        email: string;
        reportingUsers: ListResponse[];
        reportsTo: string;
        projects: ListResponse[];
        teams: ListResponse[];
        roles: ListResponse[];
      }
    >({
      query: ({ email, reportingUsers, reportsTo, projects, teams, roles }) => {
        const requestBody = JSON.stringify({
          reportingUsers,
          reportsTo,
          projects,
          teams,
          roles,
        });
        console.log("Request Body:", requestBody); // Debug log
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
  useGetLiveStreamUsersQuery
} = api;
