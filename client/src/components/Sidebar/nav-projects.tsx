"use client";

import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useEffect } from "react";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}

export function NavProjects({ activeTab, setActiveTab, projects }: Props) {
  const currentUrl = window.location.href;

  useEffect(() => {
    if (activeTab === "") {
      const path = window.location.pathname;
      setActiveTab(path.slice(1));
    }
    [currentUrl];
  });

  return (
    <SidebarGroup>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              onClick={() => {
                setActiveTab(item.url.split("?")[0].replace("/", ""));
              }}
              asChild
              className={`${
                item.url.split("?")[0].replace("/", "") === activeTab
                  ? "bg-gray-200 text-black"
                  : "bg-transparent text-white"
              }`}
            >
              <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
