"use client";

import React from "react";
import ProjectsHeader from "./ProjectsHeader";
import ProjectsTable from "./ProjectsTable";
import { useSearchParams } from "next/navigation";

const page = () => {
  const userEmail = useSearchParams().get("email");
  localStorage.removeItem("persist:root");

  return (
    <div className="w-full sm:flex-row space-y-0 aspect-auto">
      <div className="flex w-full text-gray-900">
        <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 w-full">
          <ProjectsHeader name="Projects" buttonName="Create New Project" />
        </div>
      </div>
      <div className="flex gap-4 px-4 mr-4 h-full overflow-hidden">
        <ProjectsTable email={userEmail!} />
      </div>
    </div>
  );
};

export default page;
