import React, { useMemo, useState } from "react";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useGetProjectTasksQuery } from "@/store/api";
import CircularLoading from "@/components/Sidebar/loading";
import { useTheme } from "next-themes";

type Props = {
  projectId: string;
  sprint: string;
  assignedTo: string;
  priority: string;
  isTaskOrSubTask: string;
  email: string;
};

type taskTypeItems = "task" | "milestone" | "project";

const Timeline = ({
  projectId,
  sprint,
  assignedTo,
  priority,
  isTaskOrSubTask,
  email,
}: Props) => {
  localStorage.removeItem("persist:root");
  localStorage.removeItem("ally-supports-cache");

  const { theme } = useTheme();

  let isDarkMode = theme === "dark";
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetProjectTasksQuery({
    projectId,
    sprint,
    assignedTo,
    priority,
    isTaskOrSubTask,
    email: email!,
    page: 1,
    limit: 9999999999,
  });

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttTasks = useMemo(() => {
    if (!tasks || tasks.tasks.length === 0) {
      return [];
    }

    return tasks.tasks
      .filter(
        (task) => task != null && task.startDate && task.dueDate && task.title
      )
      .map((task) => ({
        start: task.startDate ? new Date(task.startDate as string) : new Date(),
        end: task.dueDate ? new Date(task.dueDate as string) : new Date(),
        name: task.title || "Untitled Task",
        id: `Task-${task.id}`,
        type: "task" as taskTypeItems,
        progress: task.points ? (task.points / 10) * 100 : 0,
        isDisabled: false,
      }));
  }, [tasks]);

  if (ganttTasks.length === 0) {
    return <div>No tasks available for the selected project.</div>;
  }

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  if (isLoading)
    return (
      <div>
        <CircularLoading />
      </div>
    );
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <div className="px-4 xl:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 py-5">
        <h1 className="me-2 text-lg font-bold dark:text-white">
          Project Tasks Timeline
        </h1>
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
            tasks={ganttTasks}
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

export default Timeline;
