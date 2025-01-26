import React, { useEffect } from "react";
import { User, Moon, Search, Settings, Sun } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ApiResponse, useGetUsersCountQuery } from "@/store/api";
import { useTheme } from "next-themes";
import { ModeToggle } from "@/components/ModeToggle";
import { SheetDemo } from "@/components/SettingsSheet";

import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";


const Navbar = () => {
  const { setTheme } = useTheme();
  const { data, isLoading, error } = useGetUsersCountQuery(undefined, { refetchOnMountOrArgChange: true });

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.log(error)
      console.log('new')
      const apiError = error as ApiResponse;

      if (Number(apiError.status) === 401) {
        dispatch(setAuthUser(null));
        router.push("/");
        toast.success("Session Timeout, Please log in again!");
      }
    }
  }, [error, dispatch, router]);

  return (
    <div className="flex justify-between bg-white px-4 h-auto dark:bg-gray-800">
      {/* Left section: Search bar */}
      

      {/* Right section: Buttons, User Info, and Mode Toggle */}
      <div className="flex items-center space-x-4 ml-auto">
        {/* Download Button */}
        <div className="h-min w-min rounded p-2">
          <Button className="bg-indigo-600 text-white border-0 p-2.5 rounded-xl w-[120px] text-base cursor-pointer hover:bg-indigo-500">
            Download
          </Button>
        </div>

        {/* User Icon */}
        <div className="h-min w-min rounded p-2 mt-1.5">
          <User className="h-6 w-6 cursor-pointer dark:text-white" />
        </div>

        {/* User Statistics */}
        <div className="h-min rounded pr-10 mt-1.5">
          <h2>{data?.availableUsers} / {data?.totalUsers}</h2>
        </div>

        {/* Divider */}
        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] mt-2 bg-gray-200 md:inline-block"></div>

        {/* Mode Toggle */}
        <ModeToggle />

        {/* Sheet Demo */}
        <div className="h-min w-min pr-6 rounded mt-1.5 p-2 hover:bg-gray-100">
          <SheetDemo />
        </div>
      </div>
    </div>
  );
};



export default Navbar;
