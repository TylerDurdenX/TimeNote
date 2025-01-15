"use client";

import * as React from "react";
import Sideheader from "./side-header";
import { useState } from "react";
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  UsersRound,
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
  Settings2,
  SquareTerminal,
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
import axios from "axios";
import store from "@/store/store";

const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: LaptopMinimal,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userEmail = useSearchParams().get("email");
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
            title: "Screenshots",
            url: `/Dashboard/screenshots?email=${userEmail}`,
            icon: ScreenShare,
          },
          {
            title: "Timeline",
            url: "/liveStream",
            icon: Cast,
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

    const { data, isLoading, error } = useGetUserQuery({ email: userEmail!});
    return (
      <Sidebar collapsible="icon" {...props} variant="floating">
        <SidebarHeader>
          <TeamSwitcher teams={mockData.teams} />
        </SidebarHeader>
        <SidebarContent>
          <NavProjects projects={mockData.Dashboard} />
          <NavMain items={mockData.liveTracking} />
          <NavProjects projects={mockData.items1} />
          <NavMain items={mockData.projects} />
          <NavProjects projects={mockData.items2} />
          {/* <NavMain items={data.navMain} /> */}
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data?.user || defaultUser} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  
}
