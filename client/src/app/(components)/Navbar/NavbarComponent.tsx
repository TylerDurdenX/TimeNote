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
    <div className="flex left-0  right-0 items-center  space-x-4 ">
                <div className="flex gap-4 items-center">
                        <div className="relative flex items-center w-[250px]">
                          {/* Search Icon */}
                          <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white cursor-pointer"
                            aria-label="Search"
                          />
                          {/* Search Input */}
                          <input
                            className="w-full rounded-xl border border-gray-300 bg-gray-100 p-2 pt-2 mt-1 pl-10 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-white"
                            type="search"
                            placeholder="Search..."
                            aria-label="Search Input"
                          />
                        </div>
                      </div>
              </div>
  )
}

export default NavbarComponent