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
  UserDetails,
} from "@/store/interfaces";
import { useGetObjectListQuery } from "@/store/api";
import { useSearchParams } from "next/navigation";

interface SettingsFormProps {
  placeholder: string;
  label: string;
  entityName: string;
  email: string
  selectedList: Role[] | Project[] | Team[] | ReportingUsers[];
}

export default function AutocompleteTag({
  selectedList,
  placeholder,
  label,
  entityName,
  email
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

  let globalString: string = "";
  let updatedList: []

  let objectList =
    ObjectData?.map((obj) => ({
      title: obj.title,
      misc: obj.misc,
    })) || [];
  if (entityName === "User") {
    objectList = objectList.filter(item => item.misc !== email)

  }
  const isListEmpty =
    selectedList === null ||
    (Array.isArray(selectedList) && selectedList.length === 0);
  if (!isListEmpty) {
    const list1: Role[] | Project[] | Team[] | ReportingUsers[] = selectedList;

    const list2: ListResponse[] = objectList;
    // Function to compare list1 and list2
    if (!isListEmpty) {
      const compareLists = (
        list1: Role[] | Project[] | Team[] | ReportingUsers[],
        list2: ListResponse[]
      ) => {
        const tempOutput: string[] = [];
        // Iterate through list1 and list2
        if (list1 !== null && list2 !== null) {
          if (list1?.length > 0 && list2?.length > 0) {
            list1.forEach((item1, index) => {
              list2.forEach((item2) => {
                if (item1.name?.toLowerCase() === item2.title.toLowerCase()) {
                  // If there's a match, add the reference like "list1[0]"
                  tempOutput.push(`${index}`);
                }
              });
            });
          }
        }
        return tempOutput;
      };
      // Call the comparison function and get the output
      const matchedItems = compareLists(list1, list2);
      globalString = `[${matchedItems.join(", ")}]`;
    }
  }
  if (!isListEmpty) {
    const result = JSON.parse(globalString).map(
      (index: number) => objectList[index]
    );
    return (
      <Stack spacing={3} className="w-[100%]">
        <Autocomplete
          multiple
          id="tags-standard"
          limitTags={2}
          options={objectList}
          getOptionLabel={(option) => option.title}
          defaultValue={result}
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
  } else {
    return (
      <Stack spacing={3} className="w-[100%]">
        <Autocomplete
          multiple
          id="tags-standard"
          limitTags={2}
          options={objectList}
          getOptionLabel={(option) => option.title}
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
}
