import * as React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { Popper } from "@mui/material";
import { useGetAuthoritiesQuery } from "@/store/api";

interface AuthoritiesFormProps {
  setSelectedAuthorities: React.Dispatch<React.SetStateAction<any[]>>;
  overrideFlag: boolean;
  label: string;
}

export default function Tags({
  setSelectedAuthorities,
  overrideFlag,
  label,
}: AuthoritiesFormProps) {
  const { data, isLoading, error } = useGetAuthoritiesQuery();

  const authoritiesList =
    data?.map((authority) => ({
      name: authority.name,
      code: authority.code,
    })) || [];

  const [selectedAuthoritiesState, setSelectedAuthoritiesState] =
    React.useState<any[]>([]);
  const [authoritiesListLocal, setAuthoritiesListLocal] =
    React.useState<any[]>(authoritiesList);

  const handleAuthorityChange = (_event: any, newValue: any[]) => {
    setSelectedAuthoritiesState(newValue);
    setSelectedAuthorities(newValue);
  };

  const availableOptions = authoritiesListLocal.filter(
    (authority) =>
      !selectedAuthoritiesState.some(
        (selected) => selected.code === authority.code
      )
  );

  return (
    <Stack
      spacing={3}
      sx={{ width: 520, zIndex: 1500 }}
      style={{ cursor: "pointer" }}
    >
      {overrideFlag ? (
        <Autocomplete
          multiple
          id="tags-outlined"
          options={authoritiesListLocal}
          getOptionLabel={(option) => option.name}
          value={selectedAuthoritiesState}
          isOptionEqualToValue={(option, value) => option.code === value.code}
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
      ) : (
        <Autocomplete
          multiple
          id="tags-outlined"
          options={authoritiesListLocal}
          getOptionLabel={(option) => option.name}
          value={selectedAuthoritiesState} // Controlled value to track selected items
          isOptionEqualToValue={(option, value) => option.code === value.code}
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
        />
      )}
    </Stack>
  );
}
