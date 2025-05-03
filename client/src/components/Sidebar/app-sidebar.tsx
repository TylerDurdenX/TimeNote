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
    teams: [
      {
        name: "Lynk 247",
        logo: Box,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
      {
        name: "Evil Corp.",
        logo: Command,
        plan: "Free",
      },
    ],

    Dashboard: [
      {
        name: "Dashboard",
        url: `/Dashboard?email=${userEmail}`,
        icon: LaptopMinimal,
      },
    ],

    liveTracking: [
      {
        title: "Live Tracking",
        url: "#",
        icon: Radio,
        isActive: false,
        items: [
          {
            title: "Screenshots",
            url: `/screenshots?email=${userEmail}`,
            icon: ScreenShare,
          },
          // {
          //   title: "Live Streaming",
          //   url: `/liveStream?email=${userEmail}`,
          //   icon: Cast,
          // },
          {
            title: "Geo Tracking",
            url: `/geoTrack?email=${userEmail}`,
            icon: MapPin,
          },
        ],
      },
    ],

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

    items1: [
      {
        name: "Attendance",
        url: `/attendance?email=${userEmail}`,
        icon: UsersRound,
      },
      {
        name: "Leave Management",
        url: `/leaveManagement?email=${userEmail}`,
        icon: CalendarCheck,
      },
      // {
      //   name: "Productivity",
      //   url: `/productivity?email=${userEmail}`,
      //   icon: ChartNoAxesCombined,
      // },
    ],

    items2: [
      // {
      //   name: "Activity",
      //   url: `/activity?email=${userEmail}`,
      //   icon: ChartCandlestick,
      // },
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
      {
        name: "Teams",
        url: `/teams?email=${userEmail}`,
        icon: Users,
      },
      {
        name: "Breaks",
        url: `/breaks?email=${userEmail}`,
        icon: Coffee,
      },
    ],
  };

  const defaultUser = {
    name: "XXXX",
    email: "XXX@XXX.XXX",
    avatar: "",
  };

  const [items, setItems] = useState([
    {
      title: "Live Tracking",
      url: "#",
      icon: Radio,
      isActive: false,
      items: [
        {
          title: "Screenshots",
          url: `/screenshots?email=${userEmail}`,
          icon: ScreenShare,
        },
        // {
        //   title: "Live Streaming",
        //   url: `/liveStream?email=${userEmail}`,
        //   icon: Cast,
        // },
        {
          title: "Geo Tracking",
          url: `/geoTrack?email=${userEmail}`,
          icon: MapPin,
        },
      ],
    },
    // Add other items here as needed
  ]);

  React.useEffect(() => {
    const updateItemsOnLoad = () => {
      const updatedItems = items.map((item) => {
        if (item.items) {
          item.items = item.items.map((subItem) => {
            // Check if the activeTab matches any subItem's URL
            if (subItem.url.split("?")[0].replace("/", "") === activeTab) {
              setItem1Open(true);
            }
            return { ...subItem }; // Otherwise, mark it as inactive
          });
        }
        return item;
      });
      // Update the items list after checking activeTab
      setItems(updatedItems);
    };

    updateItemsOnLoad(); // Call the function to update the items on page load
  }, [activeTab]);

  const [isHovered, setIsHovered] = useState(false);

  const userRoles = useSelector((state: RootState) => state.userRoles);
  const userRolesList = userRoles.userRoles;
  let adminPageFlag: boolean = false;

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

  let updatedList = mockData.items2;

  console.log(adminPageFlag);

  if (adminPageFlag === false) {
    updatedList = mockData.items2.filter((item) => item.name !== "Reports");
  }

  const { data, isLoading, error } = useGetUserQuery({ email: userEmail! });
  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader className="bg-[#001742] rounded-t-xl">
        <TeamSwitcher teams={mockData.teams} />
      </SidebarHeader>
      <SidebarContent className="bg-[#001742]">
        {/* <NavProjects projects={mockData.Dashboard} activeTab={activeTab} setActiveTab={setActiveTab}/> */}
        {adminPageFlag === true ? (
          <>
            <NavMain
              items={items}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isItem1Open={item1Open}
            />
          </>
        ) : (
          ""
        )}

        <NavProjects
          projects={mockData.items1}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
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
