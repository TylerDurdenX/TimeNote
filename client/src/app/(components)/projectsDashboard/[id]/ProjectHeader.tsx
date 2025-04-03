import { Calendar, Clock, FilterX, Grid3X3, Table } from "lucide-react";
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

  return (
    <div className="px-4 xl:px-4">
      <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 mb-3 mt-3">
        <ProjectSectionHeader
          name={projectName || "Project"}
          buttonName="Create New Sprint"
          email={email}
          projectId={projectId}
        />
      </div>
      <div className="p-2 flex justify-between items-center dark:border-gray-600 rounded-lg">
        <div className="w-full sm:w-[25%] h-8 p-1 bg-green-700 dark:bg-gray-800 rounded-lg flex flex-col items-center">
          <span className="font-semibold text-lg text-center text-white">
            Estimated Hours : {data?.totalHours}
          </span>
        </div>
        <div className="w-full sm:w-[25%] h-8 p-1 bg-[#3f51b5] dark:bg-gray-800 rounded-lg flex flex-col items-center">
          <span className="font-semibold text-lg text-center text-white">
            Total Consumed Hours : {data?.consumedHours}
          </span>
        </div>

        <div className="w-full sm:w-[25%] h-8 p-1 bg-red-500 dark:bg-gray-800 rounded-lg flex flex-col items-center">
          <span className="font-semibold text-lg text-center text-white">
            Total Hours Overrun : {data?.hoursOverrun}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap-reverse mt-2 gap-1 border-y border-gray-200 pb-[4px] pt-1 dark:border-stroke-dark sm:items-center">
        <div className="flex flex-1 items-center gap-1 md:gap-4">
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
          {/* <TabButton
            name="User Workload"
            icon={<BookUser className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          /> */}
        </div>
        <div className="flex items-center gap-2">
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
          {isTaskOrSubTask === "Task" ? (
            <HeaderFilter priority={priority} setPriority={setPriority} />
          ) : (
            ""
          )}
          <TaskSelectionFilter
            assignedTo={assignedTo}
            setAssignedTo={setAssignedTo}
            email={email}
          />

          <Button
            className="bg-gray-200 hover:bg-gray-100"
            onClick={() => {
              setPriority("");
              setAssignedTo("X");
              setSprint("");
              setIsTaskOrSubTask("Task");
            }}
          >
            <FilterX className="text-gray-800" />
          </Button>
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
      className={`relative flex items-center gap-2 px-1 py-2 text-gray-500 after:absolute after:-bottom-[4px] after:left-0 after:h-[1px] after:w-full hover:text-blue-600 dark:text-neutral-500 dark:hover:text-white sm:px-2 lg:px-4 ${
        isActive ? "text-blue-600 after:bg-blue-600 dark:text-white" : ""
      }`}
      onClick={() => setActiveTab(name)}
    >
      {icon}
      {name}
    </button>
  );
};

export default ProjectHeader;
