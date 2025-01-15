import React, { useEffect, useState } from 'react'
import { User, Moon, Search, Settings, Sun } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SheetDemo } from '@/components/SettingsSheet';
import { useTheme } from "next-themes"
import { ModeToggle } from '@/components/ModeToggle';
import { useGetUsersCountQuery, UserCountResponse } from '@/store/api';

const NavbarComponent = () => {
  const { setTheme } = useTheme()
  const { data, isLoading, error } = useGetUsersCountQuery( undefined, {refetchOnMountOrArgChange: true});
  
  return (
    <div className="flex top-0 absolute right-0 items-center  space-x-4 ">
                <div className="h-min w-min rounded p-2 ">
                  <Button className="bg-indigo-600 text-white border-0 p-2.5 rounded-xl w-[120px] text-base cursor-pointer hover:bg-indigo-500">
                    Download
                  </Button>
                </div>
                <div className="h-min w-min rounded p-2 mt-1.5">
                  <User className="h-6 w-6 cursor-pointer dark:text-white" />
                </div>
                <div className="h-min  rounded  pr-10 mt-1.5">
                  <h2>{data?.availableUsers} / {data?.totalUsers}</h2>
                </div>
                <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] mt-2 bg-gray-200 md:inline-block"></div>
                {/* <button onClick={() => setTheme("dark")}
                  className="h-min w-min rounded p-2 mt-1.5 hover:bg-gray-100"
                >
                  <Moon className="h-6 w-6 cursor-pointer dark:text-white" />
                </button> */}
                <ModeToggle/>
                <div
                  className="h-min w-min pr-6 rounded mt-1.5 p-2 hover:bg-gray-100"
                >
                  
                  <SheetDemo/>
                </div>
                
              </div>
  )
}

export default NavbarComponent