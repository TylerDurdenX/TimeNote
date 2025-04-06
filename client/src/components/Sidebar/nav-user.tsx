"use client";

import { ChevronsUpDown, Sparkles } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { setAuthUser } from "@/store/authSlice";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export const getInitials = (fullName: string): string => {
  const nameParts = fullName.split(" ");
  const initials = nameParts
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials;
};

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const [isHovered, setIsHovered] = useState(false); // State for hover effect
  const [isActive, setIsActive] = useState(false); // State for click effect

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleClick = () => {
    setIsActive(true); // Set as active when clicked
  };

  const handleMenuClose = () => {
    setIsActive(false); // Reset active state
  };

  const userEmail = useSearchParams().get("email");
  const { isMobile } = useSidebar();
  const dispatch = useDispatch();
  const LogOut = async () => {
    // setLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/logout?email=${userEmail}`
      );
      dispatch(setAuthUser(null));
      window.location.href = "/";
      toast.success("Logged Out Successfuly");
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      //setLoading(false);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span
                  className={`truncate font-semibold ${
                    isHovered || isActive ? "text-black" : "text-white"
                  }`}
                >
                  {user.name}
                </span>
                <span
                  className={`truncate text-xs ${
                    isHovered || isActive ? "text-black" : "text-white"
                  }`}
                >
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown
                className={`ml-auto size-4 ${
                  isHovered || isActive ? "text-black" : "text-white"
                }`}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-full">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={LogOut}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
