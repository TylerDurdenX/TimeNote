"use client";

import * as React from "react";
import { useState } from "react";
import {
  AudioWaveform,
  Command,
  UsersRound,
  LaptopMinimal,
  MapPin,
  Bell,
  User,
  BriefcaseBusiness,
  Box,
  ScreenShare,
  Cast,
  Radio,
  PresentationIcon,
  CalendarClock,
  FileClock,
  Users,
  Coffee,
  FileChartColumnIncreasing,
  CalendarCheck,
  MonitorX,
  ChartCandlestick,
  ChartNoAxesCombined,
} from "lucide-react";

import { NavMain } from "@/components/Sidebar/nav-main";
import { NavProjects } from "@/components/Sidebar/nav-projects";
import { NavUser } from "@/components/Sidebar/nav-user";
import { TeamSwitcher } from "@/components/Sidebar/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useGetUserQuery } from "@/store/api";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userEmail = useSearchParams().get("email");
  const [activeTab, setActiveTab] = useState("");
  const [item1Open, setItem1Open] = useState(false);
  const [item2Open, setItem2Open] = useState(false);

  const mockData = {
    projects: [
      {
        title: "Projects",
        url: "#",
        icon: BriefcaseBusiness,
        isActive: false,
        items: [
          {
            title: "Projects Dashboard",
            url: `/projectsDashboard?email=${userEmail}`,
            icon: PresentationIcon,
          },
          {
            title: "Closed Projects",
            url: `/closedProjects?email=${userEmail}`,
            icon: MonitorX,
          },
          {
            title: "Projects Timeline",
            url: `/projectsTimeline?email=${userEmail}`,
            icon: CalendarClock,
          },
        ],
      },
    ],

    items2: [
      {
        name: "User Details",
        url: `/userDetails?email=${userEmail}`,
        icon: User,
      },
      {
        name: "Alerts",
        url: `/alerts?email=${userEmail}`,
        icon: Bell,
      },
      {
        name: "Reports",
        url: `/reports?email=${userEmail}`,
        icon: FileChartColumnIncreasing,
      },
      {
        name: "Timesheet",
        url: `/timesheet?email=${userEmail}`,
        icon: FileClock,
      },
    ],
  };

  const defaultUser = {
    name: "XXXX",
    email: "XXX@XXX.XXX",
    avatar: "",
  };

  const userRoles = useSelector((state: RootState) => state.userRoles);
  const userRolesList = userRoles.userRoles;
  let adminPageFlag: boolean = false;
  let adminPageFlagSession: boolean = false;

  if (
    userRolesList !== undefined &&
    userRolesList !== null &&
    userRolesList !== ""
  ) {
    // Define the function to check if 'ADMIN' is in the list
    const containsValue = (csvString: string, value: string): boolean => {
      // Split the string by commas to get an array of values
      const valuesArray = csvString.split(",");
      // Check if the value exists in the array
      return valuesArray.includes(value);
    };

    // Call containsValue function to set Admin
    adminPageFlag = containsValue(userRolesList, "ADMIN");
  } else {
    console.log("userRolesList is undefined or empty");
  }

  const userRolesSession = sessionStorage.getItem("userRoles");

  if (
    userRolesSession !== undefined &&
    userRolesSession !== null &&
    userRolesSession !== ""
  ) {
    // Define the function to check if 'ADMIN' is in the list
    const containsValue = (csvString: string, value: string): boolean => {
      // Split the string by commas to get an array of values
      const valuesArray = csvString.split(",");
      // Check if the value exists in the array
      return valuesArray.includes(value);
    };

    // Call containsValue function to set Admin
    adminPageFlagSession = containsValue(userRolesList, "ADMIN");
  } else {
    console.log("userRolesList is undefined or empty");
  }

  let updatedList = mockData.items2;

  if (adminPageFlag === false && adminPageFlagSession === false) {
    updatedList = mockData.items2.filter((item) => item.name !== "Reports");
  }

  React.useEffect(() => {
    const userRolesSession = sessionStorage.getItem("userRoles");
    if (
      userRolesSession !== undefined &&
      userRolesSession !== null &&
      userRolesSession !== ""
    ) {
      // Define the function to check if 'ADMIN' is in the list
      const containsValue = (csvString: string, value: string): boolean => {
        // Split the string by commas to get an array of values
        const valuesArray = csvString.split(",");
        // Check if the value exists in the array
        return valuesArray.includes(value);
      };

      // Call containsValue function to set Admin
      adminPageFlagSession = containsValue(userRolesList, "ADMIN");
    } else {
      console.log("userRolesList is undefined or empty");
    }
  });

  const { data, isLoading, error } = useGetUserQuery({ email: userEmail! });
  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader className="bg-[#001742] rounded-t-xl">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="bg-[#001742]">
        <NavMain
          items={mockData.projects}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isItem1Open={item2Open}
          key={item2Open ? "open" : "closed"}
        />
        <NavProjects
          projects={updatedList}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </SidebarContent>
      <SidebarFooter className="bg-[#001742] rounded-b-xl">
        <NavUser user={data?.user || defaultUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
