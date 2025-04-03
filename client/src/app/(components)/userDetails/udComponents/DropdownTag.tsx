import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { ListResponse } from "@/store/interfaces";

interface SettingsFormProps {
  objectList: ListResponse[];
  setSelectedReportsTo: React.Dispatch<React.SetStateAction<string>>;
  setDropdownSelectedUser: React.Dispatch<React.SetStateAction<string>>;
  selectedUser: string;
}

export default function DropdownTag({
  setDropdownSelectedUser,
  objectList,
  setSelectedReportsTo,
  selectedUser,
}: SettingsFormProps) {
  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setDropdownSelectedUser(value);
    setSelectedReportsTo(value);
  };

  return (
    <div>
      <FormControl variant="standard" className="w-[100%]">
        <InputLabel id="demo-simple-select-standard-label">
          Reports To
        </InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={selectedUser} // Controlled select, value bound to user state
          onChange={handleChange} // Handle change event to update state
          label="Reports To"
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {objectList.map((item) => (
            <MenuItem key={item.misc} value={item.misc}>
              {item.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
