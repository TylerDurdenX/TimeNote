import {
  Calendar,
  Clock,
  FilterX,
  Grid3X3,
  Table,
  TrendingUp,
  Timer,
  AlertTriangle,
  ChartPie,
} from "lucide-react";
import React, { useEffect } from "react";
import { TaskSelectionFilter } from "./TaskSelectionFilter";
import { Button } from "@mui/material";
import { HeaderFilter } from "./HeaderFilter";
import { SprintFilter } from "./SprintFilter";
import ProjectSectionHeader from "./ProjectSectionHeader";
import { SubTaskFilter } from "./SubTaskFilter";
import { useGetProjectHoursEstimationQuery } from "@/store/api";

type Props = {
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  priority: string;
  setPriority: (priorityName: string) => void;
  assignedTo: string;
  setAssignedTo: (assignedTo: string) => void;
  sprint: string;
  setSprint: (assignedTo: string) => void;
  email: string;
  projectId: number;
  isTaskOrSubTask: string;
  setIsTaskOrSubTask: (isTask: string) => void;
};

const ProjectHeader = ({
  activeTab,
  setActiveTab,
  priority,
  setPriority,
  assignedTo,
  setAssignedTo,
  sprint,
  setSprint,
  email,
  projectId,
  isTaskOrSubTask,
  setIsTaskOrSubTask,
}: Props) => {
  const projectName = sessionStorage.getItem("projectName");

  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const { data } = useGetProjectHoursEstimationQuery(
    { projectId },
    { refetchOnMountOrArgChange: true }
  );

  const clearAllFilters = () => {
    setPriority("");
    setAssignedTo("X");
    setSprint("");
    setIsTaskOrSubTask("Task");
  };

  return (
    <div className=" bg-gradient-to-br from-slate-50 via-white to-blue-50 px-6">
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="pt-8 pb-6">
          <ProjectSectionHeader
            name={projectName || "Project"}
            buttonName="Create New Sprint"
            email={email}
            projectId={projectId}
          />
        </div>

        {/* Modern Stats Cards */}
        <div className="mb-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Estimated Hours Card */}
            <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-teal-600/20"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Estimated Hours</h3>
                    <p className="text-sm opacity-90">
                      Total project estimation
                    </p>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full "></div>
                  <div className="text-right">
                    <div className="text-3xl font-bold mb-1">
                      {data?.totalHours || 0}
                    </div>
                    <div className="text-sm opacity-80">hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consumed Hours Card */}
            <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-transparent to-purple-600/20"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Timer className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Consumed Hours</h3>
                    <p className="text-sm opacity-90">Hours worked so far</p>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full "></div>
                  <div className="text-right">
                    <div className="text-3xl font-bold mb-1">
                      {data?.consumedHours || 0}
                    </div>
                    <div className="text-sm opacity-80">hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours Overrun Card */}
            <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-pink-600 to-rose-700 opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 via-transparent to-rose-600/20"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Hours Overrun</h3>
                    <p className="text-sm opacity-90">Time exceeded estimate</p>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full "></div>
                  <div className="text-right">
                    <div className="text-3xl font-bold mb-1">
                      {data?.hoursOverrun || 0}
                    </div>
                    <div className="text-sm opacity-80">hours</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Filters Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="p-2">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              {/* Tab Navigation */}
              <div className="flex flex-wrap items-center gap-2">
                <TabButton
                  name="Kanban Board"
                  icon={<Grid3X3 className="h-5 w-5" />}
                  setActiveTab={setActiveTab}
                  activeTab={activeTab}
                />
                <TabButton
                  name="Timeline"
                  icon={<Clock className="h-5 w-5" />}
                  setActiveTab={setActiveTab}
                  activeTab={activeTab}
                />
                <TabButton
                  name="Table"
                  icon={<Table className="h-5 w-5" />}
                  setActiveTab={setActiveTab}
                  activeTab={activeTab}
                />
                <TabButton
                  name="Calendar"
                  icon={<Calendar className="h-5 w-5" />}
                  setActiveTab={setActiveTab}
                  activeTab={activeTab}
                />
                <TabButton
                  name="Workload"
                  icon={<ChartPie className="h-5 w-5" />}
                  setActiveTab={setActiveTab}
                  activeTab={activeTab}
                />
              </div>

              {/* Filters Section */}
              {activeTab !== "Workload" ? (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 p-1 bg-gray-50/80 rounded-xl border border-gray-200/50">
                      <SubTaskFilter
                        isTaskOrSubTask={isTaskOrSubTask}
                        setIsTaskOrSubTask={setIsTaskOrSubTask}
                        setPriority={setPriority}
                        email={email}
                      />
                      <SprintFilter
                        sprint={sprint}
                        setSprint={setSprint}
                        projectId={String(projectId)}
                      />
                      {isTaskOrSubTask === "Task" && (
                        <HeaderFilter
                          priority={priority}
                          setPriority={setPriority}
                        />
                      )}
                      <TaskSelectionFilter
                        assignedTo={assignedTo}
                        setAssignedTo={setAssignedTo}
                        email={email}
                      />
                    </div>

                    {/* Clear Filters Button */}
                    <button
                      onClick={clearAllFilters}
                      className="group relative overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 hover:from-red-50 hover:to-red-100 text-gray-700 hover:text-red-600 px-4 py-2.5 rounded-xl border border-gray-300/50 hover:border-red-300/50 transition-all duration-300 hover:shadow-lg hover:scale-105 font-medium"
                    >
                      <div className="flex items-center gap-2">
                        <FilterX className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                        <span>Clear Filters</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-red-400/10 to-red-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  setActiveTab: (tabName: string) => void;
  activeTab: string;
};

const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name;

  return (
    <button
      className={`group relative flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
        isActive
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
          : "bg-gray-50/80 text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 border border-gray-200/50 hover:border-blue-200/50"
      }`}
      onClick={() => setActiveTab(name)}
    >
      <div
        className={`transition-transform duration-300 ${
          isActive ? "scale-110" : "group-hover:scale-110"
        }`}
      >
        {icon}
      </div>
      <span className="whitespace-nowrap">{name}</span>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white rounded-full opacity-80"></div>
      )}

      {/* Hover effect */}
      {!isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
      )}
    </button>
  );
};

export default ProjectHeader;
