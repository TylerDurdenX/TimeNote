"use client";

import Header from "@/components/Header";
import React from "react";
import UserList from "./usersList";
import UserDetailsSection from "./userDetailsSection";

const page = () => {
    return (
        <>
          <div className="flex-1 flex h-[calc(100vh-64px)] justify-center  p-4  md:p-8 overflow-hidden">
          <div className='pb-6 pt-6 lg:pb-4 lg:pt-8 '>
            <Header name='Screenshots' hasFilters={false}/>
        </div> 
      
            <div className="flex-1 bg-blue-200 flex h-[calc(100vh-64px)] justify-center items-center p-4  md:p-8 overflow-hidden">
  <h1 className="text-white text-center text-xl sm:text-2xl md:text-3xl">
    This div takes up the entire screen and is responsive!This div takes up the entire screen and is responsive!This div takes up the entire screen and is responsive!
  </h1>
  
</div>
</div>

            {/* <div className="flex gap-2 pl-1 bg-blue-400 max-w-full  overflow-hidden"> */}
              {/* <div className="flex-shrink-0  w-2/5 bg-blue-200 p-4 h-full overflow-hidden">
              <UserList/>
                
              </div>
      
              <div className=" w-3/5 bg-red-200 p-4 h-full overflow-hidden">
                flex-shrink-0  w-[calc(100%)] bg-blue-200 p-4 h-full overflow-hiddenflex-shrink-0  w-[calc(100%)] bg-blue-200 p-4 h-full overflow-hidden
                <UserDetailsSection/>
              </div>*/}
            
          
        </>
      );
      
      
};

export default page;
