import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useGetObjectListQuery } from '@/store/api';

interface SettingsFormProps {
  email: string
}

export default function DropdownTag({email} : SettingsFormProps) {
  const [age, setAge] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };

  const {
      data: ObjectData,
      isLoading: projectLoading,
      error: projectError,
    } = useGetObjectListQuery(
      {
        entityName: "User",
      },
      {
        refetchOnMountOrArgChange: true, 
      }
    );

    let objectList =
    ObjectData?.map((obj) => ({
      title: obj.title,
      misc: obj.misc,
    })) || [];

    objectList = objectList.filter(item => item.misc !== email)

  return (
    <div>
      <FormControl variant="standard" className='w-[100%]'>
        <InputLabel id="demo-simple-select-standard-label">Reports To</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={age}
          onChange={handleChange}
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