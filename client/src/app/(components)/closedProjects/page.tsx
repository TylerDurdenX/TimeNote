"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import ProjectsHeader from "../projectsDashboard/ProjectsHeader";
import ProjectsTable from "../projectsDashboard/ProjectsTable";

const page = () => {
  const userEmail = useSearchParams().get("email");
  localStorage.removeItem("persist:root");

  return (
    <div className="w-full sm:flex-row space-y-0 aspect-auto">
      <div className="flex w-full text-gray-900">
        <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 w-full">
          <ProjectsHeader name="Closed Projects" buttonName="" />
        </div>
      </div>
      <div className="flex gap-4 px-4 mr-4 h-full overflow-hidden">
        <ProjectsTable email={userEmail!} closedProjectFlag={true} />
      </div>
    </div>
  );
};

export default page;
