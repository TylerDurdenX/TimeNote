"use client";

import React, { useEffect, useState } from "react";
import India from "@react-map/india";
import Header from "@/components/Header";
const page = () => {
  return (
    <div className="w-full mb-5">
      <div className="flex w-full text-gray-900">
        <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
          <Header
            name="Geo Tracking"
            hasFilters={false}
            hasTeamFilter={false}
          />
        </div>
      </div>
      <div className="flex justify-center items-center min-h-screen w-full">
        <div className="w-full md:w-[100vh] h-[100vh]">
          <India size={800} hoverColor="orange" type="select-single" />
        </div>
      </div>
    </div>
  );
};

export default page;
