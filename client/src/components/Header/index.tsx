import React from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bell, CalendarClock, Cast, ChartCandlestick, ChartNoAxesCombined, FileChartColumnIncreasing, FilterX, LaptopMinimal, MapPin, ScreenShare, User, UsersRound } from 'lucide-react'
import { Button } from '@mui/material'
import { DatePickerWithRange } from './DateRangePicker' 
import { DateRange } from 'react-day-picker'

type Props = {
  name: string
  isSmallText?: boolean
  hasFilters?: boolean
  hasTeamFilter?: boolean
  date?: DateRange | undefined
  setDate?: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  onRangeSelect?: () => void
  clearFilter?: () => void
}

const Header = ({
  name,
  isSmallText = false,
  hasFilters,
  hasTeamFilter,
  date,
  setDate,
  onRangeSelect,
  clearFilter,
}: Props) => {

  let icon;

  switch (name) {
    case 'Dashboard':
      icon = <LaptopMinimal className='mr-2'/>;  
      break;
    case 'Screenshots':
      icon = <ScreenShare  className='mr-2'/>;  
      break;
    case 'Geo Tracking':
      icon = <MapPin className='mr-2'/>;  
      break;
    case 'Attendance':
      icon = <UsersRound className='mr-2'/>;  
      break;
    case 'Productivity':
      icon = <ChartNoAxesCombined className='mr-2'/>;  
      break;
    case 'Project Tasks Timeline':
      icon = <CalendarClock className='mr-2'/>;  
      break;
    case 'Activity':
      icon = <ChartCandlestick className='mr-2'/>;  
      break;
    case 'User Details':
      icon = <User className='mr-2'/>;  
      break;
    case 'Alerts':
      icon = <Bell className='mr-2'/>;  
      break;
    case 'Reports':
      icon = <FileChartColumnIncreasing className='mr-2'/>;  
      break;
  }

  return (
    <div className="flex relative w-full pl-5 h-[20px] mb-1 items-center justify-between">
      <h1 className={`${isSmallText ? 'text-lg' : 'text-2xl'} font-semibold dark:text-white flex items-center`}>
      {icon}
      {name}
      </h1>

      {hasFilters && (
        <div className="flex items-center space-x-4 mr-5 overflow-x-hidden">
          {hasTeamFilter && (
            <Select>
              <SelectTrigger className="w-[180px] text-gray-800">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>All Projects</SelectLabel>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          <DatePickerWithRange
            date={date}
            setDate={setDate!}
            onRangeSelect={onRangeSelect!}
          />
          <Button className="bg-gray-200 hover:bg-gray-100" onClick={clearFilter}>
            <FilterX className="text-gray-800" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default Header
