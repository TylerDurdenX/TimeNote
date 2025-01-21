import * as React from "react";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { Popper } from "@mui/material";
import { useGetAuthoritiesQuery } from "@/store/api";

interface AuthoritiesFormProps {
  setSelectedAuthorities: React.Dispatch<React.SetStateAction<any[]>>;
  overrideFlag: boolean
  label: string
}

export default function Tags({ setSelectedAuthorities, overrideFlag, label } : AuthoritiesFormProps) {

  const { data, isLoading, error } = useGetAuthoritiesQuery();
  const selectedFlag = false


  const authoritiesList =
    data?.map((authority) => ({
      name: authority.name,
      code: authority.code,
    })) || [];

    const updatedList = Array.from(authoritiesList)

    const handleAuthorityChange = (_event: any, newValue: any[]) => {
      setSelectedAuthorities(newValue); 
      selectedFlag: true
      updatedList : authoritiesList.filter(authority => 
        !newValue.some(selected => selected.code === authority.code)
      );    
    };


  return (
    <Stack
      spacing={3}
      sx={{ width: 520, zIndex: 1500 }}
      style={{ cursor: "pointer" }}
    >
      {overrideFlag ? <Autocomplete
        multiple
        id="tags-outlined"
        options={authoritiesList}
        getOptionLabel={(option) => option.name}
        onChange={handleAuthorityChange}
        PopperComponent={(props) => (
          <Popper
            {...props}
            style={{
              zIndex: 1500,
              pointerEvents: "auto",
              width: "30%",
            }}
          />
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label={label}
            placeholder={label}
          />
        )}
      />
    : 
    <Autocomplete
        multiple
        id="tags-outlined"
        options={authoritiesList}
        getOptionLabel={(option) => option.name}
        onChange={handleAuthorityChange}
        PopperComponent={(props) => (
          <Popper
            {...props}
            style={{
              zIndex: 0,
              pointerEvents: "auto",
              width: "30%",
            }}
          />
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label={label}
            placeholder={label}
          />
        )}
      />}
      
    </Stack>
  );
}
