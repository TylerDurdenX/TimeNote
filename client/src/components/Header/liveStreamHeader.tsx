import React from "react";
import { Cast, FilterX } from "lucide-react";
import { Button } from "@mui/material";
import { UserSelectionFilter } from "./UserSelectionFilter";

type Props = {
  name: string;
  buttonComponent?: any;
  isSmallText?: boolean;
  hasFilters?: boolean;
  clearFilter: () => void;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  email: string;
};

const LiveStreamHeader = ({
  name,
  buttonComponent,
  isSmallText = false,
  hasFilters,
  email,
  clearFilter,
  setValue,
  value,
}: Props) => {
  return (
    <div className="flex relative w-full pl-5 h-[20px] mb-1 items-center justify-between">
      <h1
        className={`${
          isSmallText ? "text-lg" : "text-2xl"
        } font-semibold dark:text-white flex items-center`}
      >
        <Cast className="mr-2" />
        {name}
      </h1>

      {hasFilters && (
        <div className="flex items-center space-x-4 mr-5 overflow-x-hidden">
          <UserSelectionFilter
            setValue={setValue}
            value={value}
            email={email}
          />

          <Button
            className="bg-gray-200 hover:bg-gray-100"
            onClick={clearFilter}
          >
            <FilterX className="text-gray-800" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default LiveStreamHeader;
