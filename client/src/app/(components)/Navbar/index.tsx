import React from "react";
import { User, Moon, Search, Settings, Sun } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { useDispatch } from "react-redux";
// import { useAppDispatch, useAppSelector } from '@/app/redux'
//  import { setIsDarkMode, setIsSidebarCollapsed } from '@/app/state'


const Navbar = () => {
//    const dispatch = useDispatch()
  // const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed)
//    const isDarkMode = useAppSelector((state) => state.global.isDarkMode)

return (
  
  <div className="flex justify-between bg-white px-4  h-auto dark:bg-black">
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


  
);

};

export default Navbar;
