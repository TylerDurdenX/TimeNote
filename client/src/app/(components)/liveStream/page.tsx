'use client'

import Header from '@/components/Header';
import React, { useState } from 'react'
import UserList from '../userDetails/usersList';
import ScreenshotUP from '../screenshots/ScreenshotUP';
import ScreenshotsLP from '../screenshots/ScreenshotsLP';
import LiveStreamHeader from '@/components/Header/liveStreamHeader';

type Props = {}

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
            <LiveStreamHeader name="Live Streaming"/>
          </div>
        </div>
        <div className="flex gap-4 px-4 mr-4 h-full overflow-hidden">
          <ScreenshotsLP/>
          </div>
        </div>
    </>
  )
}

export default page