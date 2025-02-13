"use client";

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';

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

  useEffect(()=> {
    if(activeTab===''){
      const path = window.location.pathname;
      setActiveTab(path.slice(1))
    } [currentUrl]
  })
  
  return (
    <SidebarGroup>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton onClick={() => {setActiveTab(item.url.split('?')[0].replace('/', ''))}}
              asChild
              className={`${
                item.url.split('?')[0].replace('/', '') === activeTab
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
