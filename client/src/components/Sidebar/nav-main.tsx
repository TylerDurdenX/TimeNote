"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

interface Item {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: Item[]; // Nested items, similar to the structure of the parent `items`
}

interface Props {
  items: Item[]; // Array of `Item` objects
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isItem1Open: boolean;
}

export function NavMain({
  items,
  activeTab,
  setActiveTab,
  isItem1Open,
}: Props) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={isItem1Open}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} className="text-white">
                  {item.icon && <item.icon className="text-white mb-0.5" />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-white" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem
                      key={subItem.title}
                      className={`${
                        subItem.url.split("?")[0].replace("/", "") === activeTab
                          ? "bg-gray-200 text-black rounded-lg"
                          : "text-white rounded-xl"
                      } group`} // Add group class here
                    >
                      <SidebarMenuSubButton
                        onClick={() => {
                          setActiveTab(
                            subItem.url.split("?")[0].replace("/", "")
                          );
                        }}
                        asChild
                        className={`${
                          subItem.url.split("?")[0].replace("/", "") ===
                          activeTab
                            ? "bg-gray-200 text-black rounded-xl"
                            : "bg-transparent text-white hover:bg-gray-100 hover:text-black hover:text-black rounded-xl"
                        }`} // Hover styles for both text and icon
                      >
                        <Link
                          href={subItem.url}
                          className="flex items-center space-x-2"
                        >
                          {subItem.icon && (
                            <div
                              className={`${
                                subItem.url.split("?")[0].replace("/", "") ===
                                activeTab
                                  ? "text-black"
                                  : "text-white hover:text-black"
                              }`}
                            >
                              <subItem.icon className="h-4 w-4" />
                            </div>
                          )}
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
