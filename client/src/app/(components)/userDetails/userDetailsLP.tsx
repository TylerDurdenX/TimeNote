import Tags from '@/components/SettingsSheet/AutoCompleteTags'
import { Avatar } from '@mui/material'
import React from 'react'

type Props = {}

const UserDetailsLP = (props: Props) => {
  return (
    <div className="flex items-center justify-center h-full flex-col">
  <div className="w-50 h-50 mb-4">
    <Avatar className="w-full h-full object-cover flex items-center justify-center" />
  </div>
  <div className="mt-4">Please select a user to view details!</div>
</div>
  )
}

export default UserDetailsLP