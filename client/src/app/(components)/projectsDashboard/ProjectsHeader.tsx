import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterX, PlusSquare } from "lucide-react";
import { Button } from "@mui/material";
import { DateRange } from "react-day-picker";

type Props = {
  name: string;
  isSmallText?: boolean;
};

const ProjectsHeader = ({ name, isSmallText = false }: Props) => {
  return (
    <div className="flex relative w-full pl-5 h-[20px] mb-1 items-center justify-between">
      <h1
        className={`${
          isSmallText ? "text-lg" : "text-2xl"
        } font-semibold dark:text-white`}
      >
        {name}
      </h1>
      <div className="flex items-center space-x-4 mr-5 overflow-x-hidden">
        <button className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-500">
          <PlusSquare className="h-5 w-5 mr-2 " />
          Create New Project
        </button>
      </div>
    </div>
  );
};

export default ProjectsHeader;
