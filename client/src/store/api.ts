import { code } from "@nextui-org/theme";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Project {
    id: number
    name : string
    description ? : string
    startDate ? : string
    endDate ? : string
}
export interface User{
    name: string,
    email: string,
    avatar: string,
}

interface UserResponse {
    user: User;
}

interface ErrorRes {
    statusCode: number,
    status: string
}

interface ApiResponse {
    status: string,
    error: ErrorRes,
    message: string,
    stack: string
}

export interface UserCountResponse{
    availableUsers: number,
    totalUsers: number
}

interface CheckCodeResponse {
    flag: boolean,
    message: string,
}

export interface AuthorityResponse {
    name: string,
    code: string,
}

interface Authority {
    name: string;
    code: string;
  }
  
  // Define the request payload for creating a role
  interface CreateRolePayload {
    name: string;
    code: string;
    description: string;
    authorities: Authority[]; // Assuming authorities is an array of authority objects
  }

export const api = createApi({
    baseQuery: fetchBaseQuery({baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL}),
    reducerPath: "api",
    tagTypes: ["UserCount", "User", "RoleCode", "Authority"],
    endpoints: (build) => ({
        getUsersCount: build.query<UserCountResponse,void>({
            query: ()=> "api/user/getUserCount",
            providesTags: ["UserCount"]
        }),
        updateProfilePicture: build.mutation<ApiResponse, {email: string, base64: string}>({
            query: ({ email, base64 }) => {
                const requestBody = JSON.stringify({ base64 });
                console.log('Request Body:', requestBody); // Debug log
                return {
                    url: `api/user/updatePP?email=${email}`,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: requestBody,
                };
            },
            invalidatesTags : ["User"]
        }),
        getUser: build.query<UserResponse,{email: string}>({
            query: ({ email }) => {
                const url = `api/user/getUser?email=${email}`;
                console.log('Request URL:', url);
                return url;
              },
            providesTags: ["User"]
        }),
        getAuthorities: build.query<AuthorityResponse[],void>({
            query: () => {
                const url = `api/user/getAuthorities`;
                return url;
              },
            providesTags: ["Authority"]
        }),
        checkRoleCode: build.query<CheckCodeResponse,{code: string}>({
            query: ({ code }) => {
                const requestBody = JSON.stringify({ code });
                return {
                    url: `api/user/checkRoleCode?code=${code}`,
                    method: "GET",
                };
              },
              providesTags: ["RoleCode"]
        }),
        createRole: build.mutation<ApiResponse,CreateRolePayload>({
            query: (payload) => {
                return {
                    url: `api/user/createRole`,
                    method: "POST",
                    body: payload,
                };
              }
        }),
        
    }),
});


export const {useGetUsersCountQuery,
    useGetAuthoritiesQuery, useUpdateProfilePictureMutation, useGetUserQuery, useCheckRoleCodeQuery,
    useCreateRoleMutation
} =api