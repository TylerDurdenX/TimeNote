import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Popper } from "@mui/material";
import {
  useGetSelectedBreakTypeForTeamsQuery,
  useGetSelectedProjectForTeamsQuery,
} from "@/store/api";
import { BreaksForTeams, ProjectListForTeamResponse } from "@/store/interfaces";

type Props = {
  projectFlag: boolean;
  userEmail: string;
  teamId: number;
  selectedList: ProjectListForTeamResponse[] | BreaksForTeams[];
  projectsList?: ProjectListForTeamResponse[];
  breaksList?: BreaksForTeams[];
  setSelectedProjects: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedBreaks: React.Dispatch<React.SetStateAction<any[]>>;
};

export default function LimitTags({
  projectFlag,
  teamId,
  selectedList,
  userEmail,
  projectsList,
  breaksList,
  setSelectedBreaks,
  setSelectedProjects,
}: Props) {
  const [value, setValue] = React.useState<any[]>(selectedList);

  const { data: selectedProjects } = useGetSelectedProjectForTeamsQuery(
    { teamId: teamId },
    { refetchOnMountOrArgChange: true }
  );
  const { data: selectedBreaks } = useGetSelectedBreakTypeForTeamsQuery(
    { teamId: teamId },
    { refetchOnMountOrArgChange: true }
  );

  React.useEffect(() => {
    if (projectFlag == true) {
      setValue(selectedProjects || []);
      setSelectedProjects(selectedProjects || []);
    } else {
      setValue(selectedBreaks || []);
    }
  }, [selectedProjects, selectedBreaks]);

  const handleProjectFieldChange = (_event: any, newValue: any[]) => {
    setValue(newValue);
    setSelectedProjects(newValue);
  };

  const handleBreaksFieldChange = (_event: any, newValue: any[]) => {
    setValue(newValue);
    setSelectedBreaks(newValue);
  };

  return (
    <div className="w-full">
      {projectFlag ? (
        <>
          <Autocomplete
            multiple
            id="tags-outlined"
            options={projectsList!}
            getOptionLabel={(option) => option.title}
            value={value}
            isOptionEqualToValue={(option, value) =>
              option.title === value.title
            }
            onChange={handleProjectFieldChange}
            PopperComponent={(props) => (
              <Popper
                {...props}
                style={{
                  zIndex: 1500,
                  pointerEvents: "auto",
                  width: "55%",
                }}
              />
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                label={"Projects"}
                // placeholder={label}
              />
            )}
          />
        </>
      ) : (
        <>
          <Autocomplete
            multiple
            id="tags-outlined"
            options={breaksList!}
            getOptionLabel={(option) => option.title}
            value={value}
            isOptionEqualToValue={(option, value) =>
              option.title === value.title
            }
            onChange={handleBreaksFieldChange}
            PopperComponent={(props) => (
              <Popper
                {...props}
                style={{
                  zIndex: 1500,
                  pointerEvents: "auto",
                  width: "55%",
                }}
              />
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                label={"Breaks"}
                // placeholder={label}
              />
            )}
          />
        </>
      )}
    </div>
  );
}
