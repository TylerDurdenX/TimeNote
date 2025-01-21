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
  hasTeamFilter?: boolean;
};

const { RangePicker } = DatePicker;

const Header = ({
  name,
  buttonComponent,
  isSmallText = false,
  hasFilters,
  hasTeamFilter,
}: Props) => {
  return (
    <div className="flex relative w-full pl-5 h-[35px] mb-5 items-center justify-between">
      <h1
        className={`${
          isSmallText ? "text-lg" : "text-2xl"
        } font-semibold dark:text-white`}
      >
        {name}
      </h1>

      {/* This div will stick to the right side of the parent */}

      {hasFilters && (
    <div className="flex items-center space-x-4 mr-5 overflow-x-hidden">
      {hasTeamFilter && (
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
      )}
      
      <RangePicker className="text-gray-800" />
      <Button className="bg-gray-200 hover:bg-gray-100">
        <FilterX className="text-gray-800"/>
      </Button>
    </div>
  )}
    </div>
  );
};

export default Header;
