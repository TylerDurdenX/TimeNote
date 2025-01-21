import * as React from "react";
import Chip from "@mui/material/Chip";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { Popper } from "@mui/material";
import { useGetAuthoritiesQuery } from "@/store/api";

interface AuthoritiesFormProps {
  setSelectedAuthorities: React.Dispatch<React.SetStateAction<any[]>>; // Function to set selected authorities in parent
}



export default function Tags({ setSelectedAuthorities } : AuthoritiesFormProps) {

  const { data, isLoading, error } = useGetAuthoritiesQuery();


  const authoritiesList =
    data?.map((authority) => ({
      name: authority.name,
      code: authority.code,
    })) || [];

    const handleAuthorityChange = (_event: any, newValue: any[]) => {
      setSelectedAuthorities(newValue); // Update selected authorities in parent
    };

  return (
    <Stack
      spacing={3}
      sx={{ width: 520, zIndex: 1500 }}
      style={{ cursor: "pointer" }}
    >
      <Autocomplete
        multiple
        id="tags-standard"
        options={authoritiesList}
        getOptionLabel={(option) => option.name}
        onChange={handleAuthorityChange}
        PopperComponent={(props) => (
          <Popper
            {...props}
            style={{
              zIndex: 1500, // Ensure dropdown is above other content
              pointerEvents: "auto", // Ensure dropdown is interactive
            }}
          />
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Authorities"
            placeholder="Authorities"
          />
        )}
      />
    </Stack>
  );
}
