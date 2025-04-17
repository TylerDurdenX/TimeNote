"use client";

import Header from "@/components/Header";
import React, { useState } from "react";
import UserList from "./usersList";
import UserDetailsSection from "./udComponents/userDetailsSection";
import UserDetailsLP from "./userDetailsLP";
import UserListHR from "./usersListHR";

const Page = () => {
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const handleSelectUser = (id: number) => {
    setIsUserSelected(true);
    setUserId(id);
  };

  localStorage.removeItem("persist:root");
  localStorage.removeItem("ally-supports-cache");

  return (
    <>
      <div className="w-full flex flex-col h-full overflow-hidden">
        <div className="flex w-full text-gray-900">
          <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
            <Header
              name="User Details"
              hasFilters={false}
              hasTeamFilter={false}
              buttonName="Create User"
            />
          </div>
        </div>
        <div className="flex gap-4 px-4 mr-4 h-full">
          <div className="w-full p-4 shadow-lg mb-5 overflow-hidden">
            <UserListHR onSelectUser={handleSelectUser} activeFlag={true} />
          </div>
          {/* <div className="w-3/5 p-4 shadow-lg overflow-hidden justify-center">
            {isUserSelected ? (
              <UserDetailsSection id={userId!} />
            ) : (
              <UserDetailsLP />
            )}
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Page;
