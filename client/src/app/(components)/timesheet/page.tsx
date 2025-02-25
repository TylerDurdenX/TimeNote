'use client'

import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Header from '@/components/Header'
import TimesheetTable from './TimesheetTable'
import { useSearchParams } from 'next/navigation'


const page = () => {

  const email = useSearchParams().get('email')

  return (
    <div>
        <div className="w-full mb-5">
      <div className="flex w-full text-gray-900">
        <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
          <Header
            name="Timesheet"
            hasFilters={false}
            hasTeamFilter={false}
          />
        </div>
      </div>
      <div className="flex justify-center items-center h-full w-full">
        <div className="w-full h-full">
        <Tabs defaultValue="account" className="full">
      <TabsList className="grid w-full grid-cols-3  w-[500px] ml-5">
        <TabsTrigger value="account">My TimeSheet</TabsTrigger>
        <TabsTrigger value="XX">Approve Timesheet</TabsTrigger>
        <TabsTrigger value="password">User's Timesheet</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className='w-full mr-5'>
        <TimesheetTable email={email!}/>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
        </div>
      </div>
    </div>
        
    </div>
  )
}

export default page