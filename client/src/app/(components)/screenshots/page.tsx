'use client'

import Header from '@/components/Header'
import React from 'react'

type Props = {}

const page = (props: Props) => {
  return (
    <>
    <div className='w-full'> 
      <div className="flex w-full  text-gray-900">
      <div className='pb-6 pt-6 lg:pb-4 lg:pt-8 '>
            <Header name='Screenshots' hasFilters={false}/>
        </div> 
        </div>
  
    </div>
    </>
  )
}

export default page