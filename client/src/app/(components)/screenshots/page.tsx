'use client'

import Header from '@/components/Header'
import React from 'react'
import { HbarChart } from '../Dashboard/HbarChart'
import { AttendancePC } from '../Dashboard/AttendancePC'
import { LchartMulti } from '../Dashboard/LchartMulti'
import { LchartInter } from '../Dashboard/LchartInter'
import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { BarChart } from 'recharts'

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
  return (
    <>
      <div className="w-full sm:flex-row space-y-0 border-b py-5 aspect-auto">
        <div className="flex w-full  text-gray-900">
          <div className="pb-6 pt-6 lg:pb-4 lg:pt-8 w-full">
            <Header name="Dashboard" hasFilters={true} hasTeamFilter={true}/>
          </div>
        </div>
        <div>
        <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              </div>
      </div>
    </>
  )
}

export default page