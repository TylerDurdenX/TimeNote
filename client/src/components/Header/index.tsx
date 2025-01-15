import React from "react";
import { DatePicker, Space } from "antd";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterX } from "lucide-react";
import { Button } from "@mui/material";

type Props = {
  name: string;
  buttonComponent?: any;
  isSmallText?: boolean;
  hasFilters?: boolean;
  hasTeamFilter?:boolean
};

const { RangePicker } = DatePicker;

const Header = ({
  name,
  buttonComponent,
  isSmallText = false,
  hasFilters,
  hasTeamFilter
}: Props) => {
  return (
    <div className="flex mb-5 w-full ml-5 items-center justify-between">
      <h1
        className={`${
          isSmallText ? "text-lg" : "text-2xl"
        } font-semibold dark:text-white`}
      >
        {name}
      </h1>
      <>
        {hasFilters && hasTeamFilter ? 
        <>
        <div
        className="flex
         absolute right-0 mr-5 items-center space-x-4 "
      >
        <Select>
          <SelectTrigger className="w-[180px] h-[32px] text-gray-800">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>All Projects</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectItem value="grapes">Grapes</SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <RangePicker className="text-gray-800" />
        <Button className="bg-gray-200 hover:bg-gray-100 ">
          <FilterX className="text-gray-800" />
        </Button>
      </div>
      {buttonComponent} </>
        : null}
        {hasFilters ?
         <>
         <div
         className="flex
          absolute right-0 mr-5 items-center space-x-4 "
       >
         <RangePicker className="text-gray-800" />
         <Button className="bg-gray-200 hover:bg-gray-100 ">
           <FilterX className="text-gray-800" />
         </Button>
       </div>
       {buttonComponent} </>
        : null}
        </>
      
    </div>
  );
};

export default Header;
