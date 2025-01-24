import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useGetObjectListQuery } from '@/store/api';

interface SettingsFormProps {
  email: string;
  setSelectedReportsTo: React.Dispatch<React.SetStateAction<string>>;
  reportsTo: any | null;  // reportsTo can be null or an object with username
}

export default function DropdownTag({ email, setSelectedReportsTo, reportsTo }: SettingsFormProps) {
  const [user, setUser] = React.useState<string>('');  // Initialize user with empty string
  const [reportsToLocal, setReportsToLocal] = React.useState<any>(reportsTo);

  // Handle change event for select
  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setUser(value);  // Update local state
    setSelectedReportsTo(value);  // Update parent state
    setReportsToLocal(value)
  };

  const {
    data: ObjectData,
    isLoading: projectLoading,
    error: projectError,
  } = useGetObjectListQuery(
    {
      entityName: 'User',
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // Generate objectList
  let objectList =
    ObjectData?.map((obj) => ({
      title: obj.title,
      misc: obj.misc, // Assuming this is the email address
    })) || [];

  // Exclude the current user (email)
  objectList = objectList.filter((item) => item.misc !== email);

  // Effect to check and set default user
  React.useEffect(() => {
    console.log("ReportsTo:", reportsToLocal); // Debugging to check the reportsTo prop value
    if (reportsToLocal && reportsToLocal.username) {
      // Find the matching object based on reportsTo.username
      const matchingUser = objectList.find((item) => item.title === reportsToLocal.username);
    
      // If a match is found and user is not already set, update the state
      if (matchingUser && matchingUser.misc !== user) {
        console.log("Setting user to:", matchingUser.misc); // Debugging to check the state update
        setUser(matchingUser.misc);
        setSelectedReportsTo(matchingUser.misc);  // Update the parent state
      }
    }
  }, [reportsToLocal, objectList, user]);  // Re-run effect when reportsTo, objectList or user changes

  return (
    <div>
      <FormControl variant="standard" className="w-[100%]">
        <InputLabel id="demo-simple-select-standard-label">Reports To</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={user} // Controlled select, value bound to user state
          onChange={handleChange}  // Handle change event to update state
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
