import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Popper } from "@mui/material";
import {
  useGetSelectedBreakTypeForTeamsQuery,
  useGetSelectedProjectForTeamsQuery,
} from "@/store/api";
import {
  BreaksForTeams,
  ProjectListForTeamResponse,
  ProjectNamesResponse,
} from "@/store/interfaces";

type Props = {
  projectFlag: boolean;
  userEmail: string;
  selectedList: ProjectListForTeamResponse[];
  projectsList: ProjectNamesResponse[];
  setSelectedProjects: React.Dispatch<React.SetStateAction<any[]>>;
};

export default function LimitTags({
  projectFlag,
  selectedList,
  userEmail,
  projectsList,
  setSelectedProjects,
}: Props) {
  const [value, setValue] = React.useState<any[]>(selectedList);

  const handleProjectFieldChange = (_event: any, newValue: any[]) => {
    setValue(newValue);
    setSelectedProjects(newValue);
  };

  React.useEffect(() => {
    if (selectedList.length === 0) {
      setValue([]);
    }
  }, [selectedList]);

  return (
    <div className="w-[40%] mb-2 ml-5">
      <Autocomplete
        multiple
        id="tags-outlined"
        className="w-[100%]"
        options={projectsList!}
        getOptionLabel={(option) => option.name}
        value={value}
        limitTags={2}
        isOptionEqualToValue={(option, value) => option.name === value.name}
        onChange={handleProjectFieldChange}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label={"Projects"}
            // placeholder={label}
          />
        )}
      />
    </div>
  );
}
