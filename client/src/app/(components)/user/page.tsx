"use client";

import { getInitials } from "@/components/Sidebar/nav-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useGetUserDataQuery } from "@/store/api";
import { ChevronLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import Organization from "../userDetails/udComponents/Organization";
import CircularLoading from "@/components/Sidebar/loading";

const page = () => {
  const username = sessionStorage.getItem("userName");

  const {
    data: dataUser,
    isLoading,
    error,
  } = useGetUserDataQuery(
    { username: username! },
    { refetchOnMountOrArgChange: true }
  );

  const [startingUserId, setStartingUserId] = useState(dataUser?.userId!);

  useEffect(() => {
    setStartingUserId(dataUser?.userId!);
  }, [dataUser]);

  if (isLoading) {
    return (
      <div>
        <CircularLoading />
      </div>
    );
  }

  if (error) {
    return <div>Error loading user data</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mt-7 bg-gray-200 ml-3 w-[90px] rounded-md shadow-md hover:bg-gray-300 transition-all"
        onClick={() => window.history.back()}
      >
        <ChevronLeft className="mr-2" /> Back
      </Button>

      {/* First Row: User Info Section */}
      <div className="flex p-6 mt-4 bg-white rounded-lg shadow-sm">
        <div className="flex w-full space-x-6">
          {/* Avatar Section */}
          <div className="w-1/4 flex justify-center items-center">
            <Avatar className="h-36 w-36 rounded-full shadow-lg">
              <AvatarImage
                src={dataUser?.profilePicture?.base64}
                alt={dataUser?.username}
              />
              <AvatarFallback className="rounded-lg text-6  xl text-white bg-[#003366]">
                {getInitials(dataUser?.username || "XX")}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User Details Section */}
          <div className="w-3/4 flex flex-col justify-center gap-6">
            <div className="grid grid-cols-4 gap-8">
              {/* Username */}
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-semibold text-gray-600">Username</p>
                <p className="text-lg font-medium">{dataUser?.username}</p>
              </div>

              {/* Email */}
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-semibold text-gray-600">Email</p>
                <p className="text-lg font-medium">{dataUser?.email}</p>
              </div>

              {/* Phone */}
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-semibold text-gray-600">Phone</p>
                <p className="text-lg font-medium">{dataUser?.phoneNumber}</p>
              </div>

              {/* Designation */}
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-semibold text-gray-600">
                  Designation
                </p>
                <p className="text-lg font-medium">{dataUser?.designation}</p>
              </div>
            </div>

            {/* Projects and Teams Section in the Same Line */}
            <div className="flex space-x-6 mt-4">
              {/* Projects Section */}
              <div className="flex flex-col space-y-2 w-1/2">
                <p className="font-semibold text-gray-600">Projects</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  {dataUser?.projects?.map((project, index) => (
                    <li key={index} className="text-sm">
                      {project.name}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Teams Section */}
              <div className="flex flex-col space-y-2 w-1/2">
                <p className="font-semibold text-gray-600">Teams</p>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  {dataUser?.teams?.map((team, index) => (
                    <li key={index} className="text-sm">
                      {team.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Gray Line */}

      {/* Second Row: Organization Section */}
      <div className="flex-1 p-6 bg-white rounded-lg shadow-xl mt-6 mb-4 transition-transform transform">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8 flex items-center justify-start space-x-3">
          {/* Optional Icon */}
          <span className="text-2xl text-blue-600">
            <i className="fas fa-sitemap"></i>
          </span>
          <span>Organization Chart</span>
        </h1>

        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
          {/* The organization component can go here */}
          <Organization
            startingUserId={startingUserId!}
            setStartingUserId={setStartingUserId}
          />
        </div>
      </div>
    </div>
  );
};

export default page;
