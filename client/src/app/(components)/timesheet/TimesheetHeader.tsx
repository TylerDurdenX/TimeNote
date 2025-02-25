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
import { Bell, CalendarClock, Cast, ChartCandlestick, ChartNoAxesCombined, FileChartColumnIncreasing, FileClock, FilterX, LaptopMinimal, MapPin, ScreenShare, User, UsersRound } from 'lucide-react'
import { Button } from '@mui/material'
import { DateRange } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'

type Props = {
  name: string
  hasFilters?: boolean
  date?: DateRange | undefined
  setDate?: React.Dispatch<React.SetStateAction<Date | undefined>>
  onRangeSelect?: () => void
  clearFilter?: () => void
}

const TimesheetHeader = ({
  name,
  hasFilters,
  date,
  setDate,
  onRangeSelect,
  clearFilter,
}: Props) => {

    const [dates, setDates] = React.useState<Date | undefined>(new Date())


  return (
    <div className="flex relative w-full pl-5 h-[20px] mb-1 items-center justify-between">
      <h1 className={`text-2xl font-semibold dark:text-white flex items-center`}>
      {name}
      </h1>

      {hasFilters && (
        <div className="flex items-center space-x-4 mr-5 overflow-x-hidden">
          <Calendar
            mode="single"
            selected={dates!}
            onSelect={setDates!}
            className="rounded-md border"
            />
          <Button className="bg-gray-200 hover:bg-gray-100" onClick={clearFilter}>
            <FilterX className="text-gray-800" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default TimesheetHeader
