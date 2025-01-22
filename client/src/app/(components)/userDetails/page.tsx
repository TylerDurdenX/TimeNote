"use client";

import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import UserList from "./usersList";
import UserDetailsSection from "./udComponents/userDetailsSection";
import UserDetailsLP from "./userDetailsLP";
import { usePathname, useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const handleSelectUser = (id: number) => {
    const currentUrl = new URL(window.location.href);
    const currentParams = new URLSearchParams(currentUrl.search);
    setIsUserSelected(true)
    setUserId(id)
    console.log("page : " + id)
    const newUrl = `${
      currentUrl.origin
    }/userDetails/${id}?${currentParams.toString()}`;
    //router.push(newUrl);
  };

  return (
    <>
      <div className="w-full mb-5">
        <div className="flex w-full text-gray-900">
          <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 w-full">
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
