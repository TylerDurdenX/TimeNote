"use client";

import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import UserList from "./usersList";
import UserDetailsSection from "./udComponents/userDetailsSection";
import UserDetailsLP from "./userDetailsLP";

const Page = () => {
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const handleSelectUser = (id: number) => {
    setIsUserSelected(true)
    setUserId(id)
  };

  return (
    <>
      <div className="w-full mb-5">
        <div className="flex w-full text-gray-900">
          <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
            <Header name="User Details" hasFilters={false} />
          </div>
        </div>
        <div className="flex gap-4 px-4 mr-4 h-full overflow-hidden">
          <div className="w-2/5 p-4 h-full shadow-lg mb-5 overflow-y-auto">
            <UserList onSelectUser={handleSelectUser} />
          </div>
          <div className="w-3/5 p-4 shadow-lg overflow-hidden justify-center">
          {isUserSelected ? (
          <UserDetailsSection id={userId!}/>
        ) : (
          <UserDetailsLP />
        )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
