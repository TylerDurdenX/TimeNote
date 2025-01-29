'use client'

import React from "react";
import ProjectsHeader from "./ProjectsHeader";
import ProjectsTable from "./ProjectsTable";

const page = () => {
  return (
    <div className="w-full sm:flex-row space-y-0 aspect-auto">
      <div className="flex w-full text-gray-900">
        <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 w-full">
          <ProjectsHeader name="Projects" />
        </div>
      </div>
      <div className="flex gap-4 px-4 mr-4 h-full overflow-hidden">
          <ProjectsTable id="1"/>
        </div>
    </div>
  );
};

export default page;
