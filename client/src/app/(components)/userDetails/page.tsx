"use client";

import Header from "@/components/Header";
import React, { useState } from "react";
import UserList from "./usersList";
import UserDetailsSection from "./userDetailsSection";
import UserDetailsLP from "./userDetailsLP";

const page = () => {
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [userId, setUserId] = useState<number>()
  const handleSelectUser = (id: number) => {
    // router.push({
    //   query: {  userId: id }, // Add `param=value` to existing query
    // });
    setUserId(id)
    setIsUserSelected(true); 
  };

  return (
    <>
  <div className="w-full ">
    <div className="flex w-full text-gray-900">
      <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 w-full">
        <Header name="User Details" hasFilters={false} />
      </div>
    </div>
    <div className="flex gap-4 px-4 mr-4    h-full overflow-hidden">
      <div className="w-2/5 p-4 h-[calc(100%-5px)] shadow-lg mb-5 overflow-hidden">
        <UserList onSelectUser={handleSelectUser}/>
      </div>
      <div className="flex w-3/5 p-4 h-[calc(100%-5px)] shadow-lg overflow-hidden items-center justify-center">
        {!isUserSelected ? <UserDetailsLP/> : <UserDetailsSection id={Number(userId)}/>}
      </div>
    </div>
  </div>
</>


    
  );
};

export default page;
