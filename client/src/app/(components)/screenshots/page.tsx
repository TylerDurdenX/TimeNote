'use client'

import Header from '@/components/Header'
import React, { useState } from 'react'
import { ChartConfig, } from '@/components/ui/chart'
import UserList from '../userDetails/usersList'
import ScreenshotsLP from './ScreenshotsLP'
import ScreenshotUP from './ScreenshotUP'

type Props = {}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig

const page = (props: Props) => {

const [isUserSelected, setIsUserSelected] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const handleSelectUser = (id: number) => {
    setIsUserSelected(true)
    setUserId(id)
  };

  return (
    <>
      <div className="w-full sm:flex-row space-y-0 aspect-auto">
        <div className="flex w-full  text-gray-900">
          <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 w-full">
            <Header name="Screenshots" hasFilters={true} hasTeamFilter={true}/>
          </div>
        </div>
        <div className="flex gap-4 px-4 mr-4 h-full overflow-hidden">
          <div className="w-2/5 p-4 h-full shadow-lg mb-5 overflow-y-auto">
            <UserList onSelectUser={handleSelectUser} />
          </div>
          <div className="w-3/5 p-4 shadow-lg overflow-hidden justify-center">
          {isUserSelected ? (
          <ScreenshotUP/>
        ) : (
          <ScreenshotsLP />
        )}
          </div>
        </div>
      </div>
    </>
  )
}

export default page