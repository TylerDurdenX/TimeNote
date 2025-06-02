import React, { useMemo, useState } from "react";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useGetProjectTasksQuery } from "@/store/api";
import CircularLoading from "@/components/Sidebar/loading";
import { useTheme } from "next-themes";
import {
  Calendar,
  ChevronDown,
  Clock,
  BarChart3,
  Zap,
  AlertCircle,
} from "lucide-react";

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
  const isDarkMode = theme === "dark";

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
        progress: task.points ? Math.min((task.points / 10) * 100, 100) : 0,
        isDisabled: false,
      }));
  }, [tasks]);

  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  const getViewModeIcon = (viewMode: ViewMode) => {
    switch (viewMode) {
      case ViewMode.Day:
        return <Clock className="w-4 h-4" />;
      case ViewMode.Week:
        return <Calendar className="w-4 h-4" />;
      case ViewMode.Month:
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <CircularLoading />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse opacity-20"></div>
            </div>
            <p className="text-gray-600 font-medium">
              Loading timeline data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-red-200/50 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Error Loading Timeline
          </h3>
          <p className="text-gray-600">
            An error occurred while fetching tasks. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (ganttTasks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Tasks Available
          </h3>
          <p className="text-gray-600">
            No tasks found for the selected project criteria.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Project Timeline
                    </h1>
                    <p className="text-blue-100 text-sm">Track progress</p>
                  </div>
                </div>

                {/* View Mode Selector */}
                <div className="relative">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                    <div className="flex items-center gap-2 px-3 py-2 text-white">
                      {getViewModeIcon(displayOptions.viewMode!)}
                      <span className="text-sm font-medium">View:</span>
                    </div>
                    <div className="relative">
                      <select
                        className="appearance-none bg-white/20 backdrop-blur-sm text-white border border-white/30 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 cursor-pointer"
                        value={displayOptions.viewMode}
                        onChange={handleViewModeChange}
                      >
                        <option value={ViewMode.Day} className="text-gray-800">
                          Day View
                        </option>
                        <option value={ViewMode.Week} className="text-gray-800">
                          Week View
                        </option>
                        <option
                          value={ViewMode.Month}
                          className="text-gray-800"
                        >
                          Month View
                        </option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200/50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <span className="text-gray-600">
                      Total Tasks:{" "}
                      <span className="font-semibold text-gray-800">
                        {ganttTasks.length}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600"></div>
                    <span className="text-gray-600">
                      Current View:{" "}
                      <span className="font-semibold text-gray-800">
                        {displayOptions.viewMode}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-6">
            <div className="timeline-container relative">
              <div
                className="gantt-wrapper rounded-xl overflow-hidden border border-gray-200/50"
                style={{
                  background: isDarkMode
                    ? "linear-gradient(135deg, #1f2937 0%, #111827 100%)"
                    : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                }}
              >
                <Gantt
                  tasks={ganttTasks}
                  {...displayOptions}
                  columnWidth={
                    displayOptions.viewMode === ViewMode.Month ? 150 : 100
                  }
                  listCellWidth="120px"
                  barBackgroundColor={
                    isDarkMode
                      ? "linear-gradient(135deg, #374151 0%, #4b5563 100%)"
                      : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                  }
                  barBackgroundSelectedColor={
                    isDarkMode
                      ? "linear-gradient(135deg, #1f2937 0%, #374151 100%)"
                      : "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)"
                  }
                  barProgressColor="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  barProgressSelectedColor="linear-gradient(135deg, #047857 0%, #065f46 100%)"
                  projectProgressColor="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  projectProgressSelectedColor="linear-gradient(135deg, #b45309 0%, #92400e 100%)"
                  milestoneBackgroundColor="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                  milestoneBackgroundSelectedColor="linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)"
                  // gridLineColor={isDarkMode ? "#374151" : "#e5e7eb"}
                  todayColor="rgba(99, 102, 241, 0.3)"
                  TooltipContent={({ task, fontSize, fontFamily }) => (
                    <div
                      className="bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 p-4 max-w-xs"
                      style={{ fontSize, fontFamily }}
                    >
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {task.name}
                        </h4>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Start:</span>
                            <span className="font-medium">
                              {task.start.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>End:</span>
                            <span className="font-medium">
                              {task.end.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Progress:</span>
                            <span className="font-medium">
                              {Math.round(task.progress || 0)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
                            style={{ width: `${task.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .gantt-wrapper .gantt-table {
          background: ${isDarkMode ? "#1f2937" : "#ffffff"} !important;
          border-radius: 12px 0 0 12px !important;
        }

        .gantt-wrapper .gantt-header {
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 100%
          ) !important;
          color: white !important;
          font-weight: 600 !important;
          border-radius: 12px 12px 0 0 !important;
        }

        .gantt-wrapper .gantt-row-odd {
          background: ${isDarkMode
            ? "rgba(55, 65, 81, 0.3)"
            : "rgba(248, 250, 252, 0.8)"} !important;
        }

        .gantt-wrapper .gantt-row-even {
          background: ${isDarkMode
            ? "rgba(31, 41, 55, 0.5)"
            : "rgba(255, 255, 255, 0.9)"} !important;
        }

        .gantt-wrapper .gantt-task-bar {
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          border: 2px solid rgba(255, 255, 255, 0.2) !important;
        }

        .gantt-wrapper .gantt-task-bar:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .gantt-wrapper .gantt-vertical-line {
          stroke: ${isDarkMode ? "#374151" : "#e5e7eb"} !important;
          stroke-width: 1 !important;
        }

        .gantt-wrapper .gantt-today-line {
          stroke: #6366f1 !important;
          stroke-width: 2 !important;
          opacity: 0.7 !important;
        }

        .timeline-container {
          min-height: 500px;
        }

        .gantt-wrapper text {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif !important;
        }
      `}</style>
    </div>
  );
};

export default Timeline;
