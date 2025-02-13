"use client";

import * as React from "react";
import { useState } from "react";
import {
  AudioWaveform,
  Command,
  UsersRound,
  Presentation,
  LaptopMinimal,
  MapPin,
  Bell,
  User,
  ChartCandlestick,
  ChartNoAxesCombined,
  BriefcaseBusiness,
  Box,
  ScreenShare,
  Cast,
  Radio,
  FileChartColumnIncreasing,
  PresentationIcon,
  CalendarClock,
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useGetUserQuery} from "@/store/api";
import { useSearchParams } from "next/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userEmail = useSearchParams().get("email");
  const [activeTab, setActiveTab] = useState('');
  const [item1Open, setItem1Open] = useState(false)
  const [item2Open, setItem2Open] = useState(false)


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
          {
            title: "Live Streaming",
            url: `/liveStream?email=${userEmail}`,
            icon: Cast,
          },
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
        name: "Productivity",
        url: `/productivity?email=${userEmail}`,
        icon: ChartNoAxesCombined,
      },
    ],

    items2: [
      {
        name: "Activity",
        url: `/activity?email=${userEmail}`,
        icon: ChartCandlestick,
      },
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
    ],
  };

  const defaultUser ={
    name :"XXXX",
    email: "XXX@XXX.XXX",
    avatar: ""
  }

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
        {
          title: "Live Streaming",
          url: `/liveStream?email=${userEmail}`,
          icon: Cast,
        },
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
              setItem1Open(true)
            }
            return { ...subItem}; // Otherwise, mark it as inactive
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

    const { data, isLoading, error } = useGetUserQuery({ email: userEmail!});
    return (
      <Sidebar collapsible="icon" {...props} variant="floating">
        <SidebarHeader className="bg-[#001742] rounded-t-xl">
          <TeamSwitcher teams={mockData.teams} />
        </SidebarHeader>
        <SidebarContent className="bg-[#001742]">
          <NavProjects projects={mockData.Dashboard} activeTab={activeTab} setActiveTab={setActiveTab}/>
          <NavMain items={items} activeTab={activeTab} setActiveTab={setActiveTab}
           isItem1Open = {item1Open}/>
          <NavProjects projects={mockData.items1} activeTab={activeTab} setActiveTab={setActiveTab}/>
          <NavMain items={mockData.projects} activeTab={activeTab} setActiveTab={setActiveTab}
          isItem1Open = {item2Open} key={item2Open ? "open" : "closed"}/>
          <NavProjects projects={mockData.items2} activeTab={activeTab} setActiveTab={setActiveTab}/>
        </SidebarContent>
        <SidebarFooter
      className="bg-[#001742] rounded-b-xl"
    >
      <NavUser user={data?.user || defaultUser} />
    </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  
}
