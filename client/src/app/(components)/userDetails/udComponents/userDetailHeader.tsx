import React from "react";
import { UserCog, GitFork } from "lucide-react";

type Props = {
  activeTab: string;
  setActiveTab: (tabName: string) => void;
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
      className={`relative flex items-center gap-2 px-1 py-2 text-gray-500 after:absolute after:-bottom-[9px] after:left-0 after:h-[1px] after:w-full hover:text-blue-600 dark:text-neutral-500 dark:hover:text-white sm:px-2 lg:px-4 ${
        isActive ? "text-blue-600 after:bg-blue-600 dark:text-white" : ""
      }`}
      onClick={() => setActiveTab(name)}
    >
      {icon}
      {name}
    </button>
  );
};

const UserDetailHeader = ({ activeTab, setActiveTab }: Props) => {
  return (
    <div className="flex-wrap-reverse gap-2 border-b border-gray-200 pb-[8px] pt-2 dark:border-stroke-dark md:items-center">
      <div className="flex self-start flex-1 items-center gap-2 md:gap-4">
        <TabButton
          name="User Settings"
          icon={<UserCog className="h-5 w-5" />}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />
        <TabButton
          name="Organization"
          icon={<GitFork className="h-5 w-5 transform rotate-180" />}
          setActiveTab={setActiveTab}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
};

export default UserDetailHeader;
