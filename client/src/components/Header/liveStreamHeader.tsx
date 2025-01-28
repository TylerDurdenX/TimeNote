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

const LiveStreamHeader = ({
  name,
  buttonComponent,
  isSmallText = false,
  hasFilters,
  hasTeamFilter,
}: Props) => {
  return (
    <div className="flex relative w-full pl-5 h-[20px] mb-1 items-center justify-between">
      <h1
        className={`${
          isSmallText ? "text-lg" : "text-2xl"
        } font-semibold dark:text-white`}
      >
        {name}
      </h1>

      
    </div>
  );
};

export default LiveStreamHeader;
