"use client";

import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { Project, ReportingUsers, Role, Team } from "@/store/interfaces";

interface SettingsFormProps {
  placeholder: string;
  label: string;
  entityName: string;
  selectedList: Role[] | Project[] | Team[] | ReportingUsers[];
  objectList: Role[] | Project[] | Team[] | ReportingUsers[];
  setSelectedProjects: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedTeams: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedRoles: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedReportingUsers: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AutocompleteTag({
  selectedList,
  objectList,
  placeholder,
  label,
  entityName,
  setSelectedProjects,
  setSelectedTeams,
  setSelectedRoles,
  setSelectedReportingUsers,
}: SettingsFormProps) {
  const [value, setValue] = React.useState<any[]>([]);
  const [objectListLocal, setObjectListLocal] = React.useState<any[]>([]);

  React.useEffect(() => {
    setObjectListLocal(objectList);

    setValue(selectedList);
  }, [selectedList, entityName]);

  const handleFieldChange = (_event: any, newValue: any[]) => {
    setValue(newValue);

    // Update parent state (via setters)
    switch (entityName) {
      case "Project":
        setSelectedProjects(newValue);
        break;
      case "Team":
        setSelectedTeams(newValue);
        break;
      case "Role":
        setSelectedRoles(newValue);
        break;
      case "User":
        setSelectedReportingUsers(newValue);
        break;
      default:
        break;
    }
  };

  return (
    <Stack spacing={3} className="w-[100%]">
      <Autocomplete
        multiple
        id="tags-standard"
        limitTags={2}
        options={objectListLocal}
        onChange={handleFieldChange}
        getOptionLabel={(option) => option.title}
        value={value}
        isOptionEqualToValue={(option, value) => option.title === value.title}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label={label}
            placeholder={placeholder}
          />
        )}
      />
    </Stack>
  );
}
