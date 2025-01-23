"use client";

import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import {
  ListResponse,
  Project,
  ReportingUsers,
  Role,
  Team,
} from "@/store/interfaces";
import { useGetObjectListQuery } from "@/store/api";

interface SettingsFormProps {
  placeholder: string;
  label: string;
  entityName: string;
  email: string;
  selectedList: Role[] | Project[] | Team[] | ReportingUsers[];
  setSelectedProjects: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedTeams: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedRoles: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedReportingUsers: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AutocompleteTag({
  selectedList,
  placeholder,
  label,
  entityName,
  email,
  setSelectedProjects,
  setSelectedTeams,
  setSelectedRoles,
  setSelectedReportingUsers,
}: SettingsFormProps) {
  const {
    data: ObjectData,
    isLoading: projectLoading,
    error: projectError,
  } = useGetObjectListQuery(
    {
      entityName: entityName,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // Local state to track selected items
  const [value, setValue] = React.useState<any[]>([]); // Initialize as empty array
  const [objectListLocal, setObjectListLocal] = React.useState<any[]>([]);

  // Effect to update object list and initialize value
  React.useEffect(() => {
    let objectList = ObjectData?.map((obj) => ({
      title: obj.title,
      misc: obj.misc,
    })) || [];

    if (entityName === "User") {
      objectList = objectList.filter(item => item.misc !== email);
    }

    setObjectListLocal(objectList);

    // Initialize the selected values based on selectedList and match with objectList
    if (selectedList && selectedList.length > 0) {
      const matchedItems = selectedList
      .map((item) => {
        return objectList.find((obj) => {
          if (obj?.title && item?.name) {
            return obj.title.toLowerCase() === item.name.toLowerCase();
          }
          return false;
        });
      })
      .filter(item => item !== undefined); // filter out undefined values

      setValue(matchedItems); // Set the matched values to the local state
      switch (entityName) {
        case 'Project':
          setSelectedProjects(matchedItems); // Update selected projects in parent state
          break;
        case 'Team':
          setSelectedTeams(matchedItems); // Update selected teams in parent state
          break;
        case 'Role':
          setSelectedRoles(matchedItems); // Update selected roles in parent state
          break;
        case 'User':
          setSelectedReportingUsers(matchedItems); // Update selected reporting users in parent state
          console.log('no')
          console.log(matchedItems)
          break;
        default:
          break;
      }
    } else {
      setValue([]); // Reset if no items
    }
  }, [ObjectData, selectedList, entityName, email]); // Re-run when relevant data changes

  // Handle change when selection changes
  const handleFieldChange = (_event: any, newValue: any[]) => {
    setValue(newValue); // Update local value state

    // Update parent state (via setters)
    switch (entityName) {
      case 'Project':
        setSelectedProjects(newValue); // Update selected projects in parent state
        break;
      case 'Team':
        setSelectedTeams(newValue); // Update selected teams in parent state
        break;
      case 'Role':
        setSelectedRoles(newValue); // Update selected roles in parent state
        break;
      case 'User':
        setSelectedReportingUsers(newValue); // Update selected reporting users in parent state
        break;
      default:
        break;
    }
  };

  React.useEffect(() => {
    // Reset state to an empty array every time the component re-renders
    setSelectedRoles([]);
    setSelectedProjects([])
    setSelectedTeams([])
    setSelectedReportingUsers([])
  }, []);

  return (
    <Stack spacing={3} className="w-[100%]">
      <Autocomplete
        multiple
        id="tags-standard"
        limitTags={2}
        options={objectListLocal}
        onChange={handleFieldChange}
        getOptionLabel={(option) => option.title}
        value={value} // Controlled value
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
