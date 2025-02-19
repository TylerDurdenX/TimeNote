"use client"

import { MoveUpRight, MoveDownRight } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import StatTable from "./StatTable"
import ActivityStatTables from "./ActivityStatTable"

export function ActivityStats() {
  return (
    <Card className="h-[83vh] rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="border-b p-6">
        <CardTitle className="text-xl font-semibold text-gray-800">Activity Stats</CardTitle>
        <CardDescription className="text-sm text-gray-500 mt-1 flex items-center space-x-2">
          <MoveUpRight   className="text-blue-500" />
          <span>Most Active Users</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 py-4">
        <ActivityStatTables activeTrend={true} />
      </CardContent>

      <CardDescription className="text-sm text-gray-500 mt-1 flex items-center space-x-2 ml-4">
          <MoveDownRight   className="text-red-500" />
          <span>Least Active Users</span>
        </CardDescription>

      <CardContent className="px-6 py-4">
        <ActivityStatTables activeTrend={false} />
      </CardContent>
    </Card>
  )
}
