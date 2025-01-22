'use client'

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

interface SettingsFormProps {
  setSelectedOptions: React.Dispatch<React.SetStateAction<any[]>>;
  placeholder: string;
  label: string;
  entityName: string;
  selectedList: Role[] | Project[] | Team[] | ReportingUsers[];
}

export default function AutocompleteTag({
  setSelectedOptions,
  selectedList,
  placeholder,
  label,
  entityName,
}: SettingsFormProps) {
  const {
    data: ObjectData,
    isLoading: projectLoading,
    error: projectError,
  } = useGetObjectListQuery({
    entityName: entityName,
  });

  let globalString: string = "";

  const objectList =
    ObjectData?.map((obj) => ({
      title: obj.title,
      misc: obj.misc,
    })) || [];

  if (placeholder==='Roles') {
    console.log("Roles selectedList");

    const list1: Role[] | Project[] | Team[] | ReportingUsers[] = selectedList;
  
    const list2: ListResponse[] = objectList;
    console.log(list1)
    console.log(list2)
    // Function to compare list1 and list2
    if(placeholder==='Roles'){
    const compareLists = (list1: Role[] | Project[] | Team[] | ReportingUsers[], list2: ListResponse[]) => {
      const tempOutput: string[] = [];
      console.log('yes')
      console.log(list1)
      // Iterate through list1 and list2
      if(list1 !== null && list2 !== null){
        if( list1?.length>0 && list2?.length>0){
      list1.forEach((item1, index) => {
        list2.forEach((item2) => {
          console.log('yes')
            console.log(item1.name)
          if (item1.name?.toLowerCase() === item2.title.toLowerCase()) {
            console.log('yes')
            console.log(item1)
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
    globalString = `[${matchedItems.join(', ')}]`
    console.log(globalString)
  }
  
  }
  const result = JSON.parse(globalString).map((index: number) => objectList[index]);
  console.log(result.join(', '))
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

}
