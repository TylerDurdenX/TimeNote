"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
const chartData = [
  { date: "2024-04-01",tab:212, desktop: 222, mobile: 150 },
  { date: "2024-04-02",tab:212, desktop: 97, mobile: 180 },
  { date: "2024-04-03",tab:212, desktop: 167, mobile: 120 },
  { date: "2024-04-04",tab:212, desktop: 242, mobile: 260 },
  { date: "2024-04-05",tab:212, desktop: 373, mobile: 290 },
  { date: "2024-04-06",tab:212, desktop: 301, mobile: 340 },
  { date: "2024-04-07",tab:212, desktop: 245, mobile: 180 },
  { date: "2024-04-08",tab:212, desktop: 409, mobile: 320 },
  { date: "2024-04-09",tab:212, desktop: 59, mobile: 110 },
  { date: "2024-04-10",tab:212, desktop: 261, mobile: 190 },
  { date: "2024-04-11",tab:212, desktop: 327, mobile: 350 },
  { date: "2024-04-12",tab:212, desktop: 292, mobile: 210 },
  { date: "2024-04-13",tab:212, desktop: 342, mobile: 380 },
  { date: "2024-04-14",tab:212, desktop: 137, mobile: 220 },
  { date: "2024-04-15",tab:212, desktop: 120, mobile: 170 },
  { date: "2024-04-16",tab:212, desktop: 138, mobile: 190 },
  { date: "2024-04-17",tab:212, desktop: 446, mobile: 360 },
  { date: "2024-04-18",tab:212, desktop: 364, mobile: 410 },
  { date: "2024-04-19",tab:212, desktop: 243, mobile: 180 },
  { date: "2024-04-20",tab:212, desktop: 89, mobile: 150 },
  { date: "2024-04-21",tab:212, desktop: 137, mobile: 200 },
  { date: "2024-04-22",tab:212, desktop: 224, mobile: 170 },
  { date: "2024-04-23",tab:212, desktop: 138, mobile: 230 },
  { date: "2024-04-24",tab:212, desktop: 387, mobile: 290 },
  { date: "2024-04-25",tab:212, desktop: 215, mobile: 250 },
  { date: "2024-04-26",tab:212, desktop: 75, mobile: 130 },
  { date: "2024-04-27",tab:212, desktop: 383, mobile: 420 },
  { date: "2024-04-28",tab:212, desktop: 122, mobile: 180 },
  { date: "2024-04-29",tab:212, desktop: 315, mobile: 240 },
  { date: "2024-04-30",tab:212, desktop: 454, mobile: 380 },
  { date: "2024-05-01",tab:212, desktop: 165, mobile: 220 },
  { date: "2024-05-02",tab:212, desktop: 293, mobile: 310 },
  { date: "2024-05-03",tab:212, desktop: 247, mobile: 190 },
  { date: "2024-05-04",tab:212, desktop: 385, mobile: 420 },
  { date: "2024-05-05",tab:212, desktop: 481, mobile: 390 },
  { date: "2024-05-06",tab:212, desktop: 498, mobile: 520 },
  { date: "2024-05-07",tab:212, desktop: 388, mobile: 300 },
  { date: "2024-05-08",tab:212, desktop: 149, mobile: 210 },
  { date: "2024-05-09",tab:212, desktop: 227, mobile: 180 },
  { date: "2024-05-10",tab:212, desktop: 293, mobile: 330 },
  { date: "2024-05-11",tab:212, desktop: 335, mobile: 270 },
  { date: "2024-05-12",tab:212, desktop: 197, mobile: 240 },
  { date: "2024-05-13",tab:212, desktop: 197, mobile: 160 },
  { date: "2024-05-14",tab:212, desktop: 448, mobile: 490 },
  { date: "2024-05-15",tab:212, desktop: 473, mobile: 380 },
  { date: "2024-05-16",tab:212, desktop: 338, mobile: 400 },
  { date: "2024-05-17",tab:212, desktop: 499, mobile: 420 },
  { date: "2024-05-18",tab:212, desktop: 315, mobile: 350 },
  { date: "2024-05-19",tab:212, desktop: 235, mobile: 180 },
  { date: "2024-05-20",tab:212, desktop: 177, mobile: 230 },
  { date: "2024-05-21",tab:212, desktop: 82, mobile: 140 },
  { date: "2024-05-22",tab:212, desktop: 81, mobile: 120 },
  { date: "2024-05-23",tab:212, desktop: 252, mobile: 290 },
  { date: "2024-05-24",tab:212, desktop: 294, mobile: 220 },
  { date: "2024-05-25",tab:212, desktop: 201, mobile: 250 },
  { date: "2024-05-26",tab:212, desktop: 213, mobile: 170 },
  { date: "2024-05-27",tab:212, desktop: 420, mobile: 460 },
  { date: "2024-05-28",tab:212, desktop: 233, mobile: 190 },
  { date: "2024-05-29",tab:212, desktop: 78, mobile: 130 },
  { date: "2024-05-30",tab:212, desktop: 340, mobile: 280 },
  { date: "2024-05-31",tab:212, desktop: 178, mobile: 230 },
  { date: "2024-06-01",tab:212, desktop: 178, mobile: 200 },
  { date: "2024-06-02",tab:212, desktop: 470, mobile: 410 },
  { date: "2024-06-03",tab:212, desktop: 103, mobile: 160 },
  { date: "2024-06-04",tab:212, desktop: 439, mobile: 380 },
  { date: "2024-06-05",tab:212, desktop: 88, mobile: 140 },
  { date: "2024-06-06",tab:212, desktop: 294, mobile: 250 },
  { date: "2024-06-07",tab:212, desktop: 323, mobile: 370 },
  { date: "2024-06-08",tab:212, desktop: 385, mobile: 320 },
  { date: "2024-06-09",tab:212, desktop: 438, mobile: 480 },
  { date: "2024-06-10",tab:212, desktop: 155, mobile: 200 },
  { date: "2024-06-11",tab:212, desktop: 92, mobile: 150 },
  { date: "2024-06-12",tab:212, desktop: 492, mobile: 420 },
  { date: "2024-06-13",tab:212, desktop: 81, mobile: 130 },
  { date: "2024-06-14",tab:212, desktop: 426, mobile: 380 },
  { date: "2024-06-15",tab:212, desktop: 307, mobile: 350 },
  { date: "2024-06-16",tab:212, desktop: 371, mobile: 310 },
  { date: "2024-06-17",tab:212, desktop: 475, mobile: 520 },
  { date: "2024-06-18",tab:212, desktop: 107, mobile: 170 },
  { date: "2024-06-19",tab:212, desktop: 341, mobile: 290 },
  { date: "2024-06-20",tab:212, desktop: 408, mobile: 450 },
  { date: "2024-06-21",tab:212, desktop: 169, mobile: 210 },
  { date: "2024-06-22",tab:212, desktop: 317, mobile: 270 },
  { date: "2024-06-23",tab:212, desktop: 480, mobile: 530 },
  { date: "2024-06-24",tab:212, desktop: 132, mobile: 180 },
  { date: "2024-06-25",tab:212, desktop: 141, mobile: 190 },
  { date: "2024-06-26",tab:212, desktop: 434, mobile: 380 },
  { date: "2024-06-27",tab:212, desktop: 448, mobile: 490 },
  { date: "2024-06-28",tab:212, desktop: 149, mobile: 200 },
  { date: "2024-06-29",tab:212, desktop: 103, mobile: 160 },
  { date: "2024-06-30",tab:212, desktop: 446, mobile: 400 },
]

const chartConfig = {
    tab: {
        label: "Unproductive time",
        color: "hsl(var(--chart-1))",
      },
  desktop: {
    label: "Productive time",
    color: "hsl(var(--chart-2))",
  },
  mobile: {
    label: "Active time",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ProductivityTrend() {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="rounded-lg shadow-lg border border-gray-200 h-[45vh]">
      <CardHeader className="flex items-center gap-4 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-2 text-center sm:text-left">
          <CardTitle className="text-xl font-semibold text-gray-800">Productivity Analysis</CardTitle>
          <CardDescription className="text-gray-500">
            Showing Active Time, Productive Time and Unproductive Time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg bg-gray-100 border border-gray-300 text-gray-700 sm:ml-auto shadow-sm"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg hover:bg-gray-200">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg hover:bg-gray-200">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg hover:bg-gray-200">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
  
      <CardContent className="px-4 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[29vh] w-full rounded-lg"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillTab" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4B8B3B" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4B8B3B" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1F72B8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1F72B8" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9F1C" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FF9F1C" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              className="text-sm text-gray-600"
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="tab"
              type="natural"
              fill="url(#fillTab)"
              stroke="#4B8B3B"
              stackId="a"
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="#FF9F1C"
              stackId="a"
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="#1F72B8"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} className="text-gray-700" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
  
  
}
