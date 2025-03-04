import React, { useEffect } from "react";
import { User, Moon, Search, Settings, Sun, AlertCircleIcon, Bell, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiResponse, useGetAlertsCountQuery, useGetUsersCountQuery } from "@/store/api";
import { useTheme } from "next-themes";
import { ModeToggle } from "@/components/ModeToggle";
import { SheetDemo } from "@/components/SettingsSheet";

import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Badge from '@mui/material/Badge';
import Link from "next/link";

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

  const userEmail = useSearchParams().get("email");

  const {data: alertCountData} = useGetAlertsCountQuery({email: userEmail!}, 
    {refetchOnMountOrArgChange: true}
  )
  sessionStorage.setItem("userRoles", alertCountData?.roles || "")

  return (
    <div className="flex justify-between bg-white px-4 h-full dark:bg-black">
      

      <div className="flex items-center space-x-4 ml-auto">
      <div className="h-min w-min rounded p-2 mt-1.2">
      <Link href={`/alerts?email=${userEmail}`}>
      <Badge color="error" badgeContent={Number(alertCountData?.count)} max={9}>
        <Bell />
      </Badge>
      </Link>
        </div>
              <div className="h-min w-min rounded p-2">
          <Button className="bg-indigo-600 text-white border-0 p-2.5 rounded-xl w-[120px] text-base cursor-pointer hover:bg-indigo-500">
            Download
          </Button>
        </div>

        <div className="h-min w-min rounded p-2 mt-1.2">
          <User className="h-6 w-6 cursor-pointer dark:text-white" />
        </div>

        <div className="h-min rounded pr-10 mt-1.2">
          <h2>{data?.availableUsers} / {data?.totalUsers}</h2>
        </div>

        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] mt-1.3 bg-gray-200 md:inline-block"></div>

        <ModeToggle/>

        <div className="h-min w-min pr-6 rounded mt-1.2 p-2 hover:bg-gray-100">
          <SheetDemo />
        </div>
      </div>
    </div>
  );
};



export default Navbar;
