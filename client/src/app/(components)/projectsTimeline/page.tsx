"use client";

import React, { useMemo, useState } from "react";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useSearchParams } from "next/navigation";
import { useGetProjectsQuery } from "@/store/api";
import Header from "@/components/Header";

type taskTypeItems = "task" | "milestone" | "project";

const ProjectsTimeline = () => {
  const isDarkMode = 1;

  const userEmail = useSearchParams().get("email");
  const {
    data: projects,
    isLoading,
    error,
  } = useGetProjectsQuery({ email: userEmail! });

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttProjects = useMemo(() => {
    if (!projects || projects.length === 0) {
      return [];
    }

    return projects
      .filter(
        (project) =>
          project != null &&
          project.startDate &&
          project.endDate &&
          project.name
      )
      .map((project) => ({
        start: project.startDate
          ? new Date(project.startDate as string)
          : new Date(),
        end: project.endDate ? new Date(project.endDate as string) : new Date(),
        name: project.name || "Untitled Project",
        id: `Task-${project.id}`,
        type: "project" as taskTypeItems,
        progress: project.completionStatus,
        isDisabled: false,
      }));
  }, [projects]);

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>An error occurred while fetching tasks</div>;

  if (ganttProjects.length === 0) {
    return <div>No Projects available.</div>;
  }

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  return (
    <div className="px-4 xl:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 py-5 ">
        <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 w-full">
          <Header
            name="Project Tasks Timeline"
            hasFilters={false}
            hasTeamFilter={false}
          />
        </div>
        <div className="relative inline-block w-64">
          <select
            className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 pr-8 py-2 leading-right shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
            value={displayOptions.viewMode}
            onChange={handleViewModeChange}
          >
            <option value={ViewMode.Day}>Day</option>
            <option value={ViewMode.Week}>Week</option>
            <option value={ViewMode.Month}>Month</option>
          </select>
        </div>
      </div>
      <div className="overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white">
        <div className="timeline">
          <Gantt
            tasks={ganttProjects}
            {...displayOptions}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="100px"
            barBackgroundColor={isDarkMode ? "#101214" : "#aeb8c2"}
            barBackgroundSelectedColor={isDarkMode ? "#000" : "#9ba1a6"}
          />
        </div>
        <div className="px-4 pb-5 pt-1"></div>
      </div>
    </div>
  );
};

export default ProjectsTimeline;
