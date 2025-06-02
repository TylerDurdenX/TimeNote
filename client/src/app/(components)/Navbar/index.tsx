import React, { useEffect } from "react";
import {
  User,
  Moon,
  Search,
  Settings,
  Sun,
  AlertCircleIcon,
  Bell,
  MailIcon,
  ArrowDownToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ApiResponse,
  useGetAlertsCountQuery,
  useGetUsersCountQuery,
} from "@/store/api";
import { useTheme } from "next-themes";
import { ModeToggle } from "@/components/ModeToggle";
import { SheetDemo } from "@/components/SettingsSheet";

import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import Badge from "@mui/material/Badge";
import Link from "next/link";

const Navbar = () => {
  const { setTheme } = useTheme();
  const { data, isLoading, error } = useGetUsersCountQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.log(error);
      const apiError = error as ApiResponse;

      if (Number(apiError.status) === 401) {
        dispatch(setAuthUser(null));
        router.push("/");
        toast.success("Session Timeout, Please log in again!");
      }
    }
  }, [error, dispatch, router]);

  const userEmail = useSearchParams().get("email");

  const { data: alertCountData } = useGetAlertsCountQuery(
    { email: userEmail! },
    { refetchOnMountOrArgChange: true }
  );
  sessionStorage.setItem("userRoles", alertCountData?.roles || "");

  return (
    <div className="flex justify-between items-center bg-white/95 backdrop-blur-sm px-6 h-full border-b border-gray-100 dark:bg-black/95 dark:border-gray-800 shadow-sm">
      <div className="flex items-center space-x-6 ml-auto">
        {/* Notifications Bell */}
        <div className="relative group">
          <Link href={`/alerts?email=${userEmail}`}>
            <div className="relative p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg cursor-pointer">
              <Badge
                color="error"
                badgeContent={Number(alertCountData?.count)}
                max={9}
                sx={{
                  "& .MuiBadge-badge": {
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "0.75rem",
                    minWidth: "20px",
                    height: "20px",
                    animation:
                      alertCountData?.count! > 0 ? "pulse 2s infinite" : "none",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
                  },
                }}
              >
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </Badge>

              {/* Tooltip */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                <div className="text-center">
                  <div className="font-medium">Notifications</div>
                  <div className="text-gray-300">
                    {alertCountData?.count || 0} new alerts
                  </div>
                </div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-700 rotate-45"></div>
              </div>
            </div>
          </Link>
        </div>

        {/* User Profile */}
        <div className="relative group">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg cursor-pointer">
            <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />

            {/* Tooltip */}
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Profile
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-700 rotate-45"></div>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="relative group">
          <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 ease-in-out hover:shadow-lg border border-green-100 dark:border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {data?.availableUsers} / {data?.totalUsers}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Active Users
                </div>
              </div>
            </div>

            {/* Tooltip */}
            <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              <div className="text-center">
                <div className="font-medium">User Status</div>
                <div className="text-gray-300">
                  {data?.availableUsers} of {data?.totalUsers} online
                </div>
              </div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 dark:bg-gray-700 rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Elegant Divider */}
        <div className="hidden md:block">
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        </div>

        {/* Sheet Demo */}
        <div className="relative group">
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 dark:from-gray-800 dark:to-gray-700 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg">
            <SheetDemo />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default Navbar;
