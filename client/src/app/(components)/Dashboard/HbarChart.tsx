"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { month: "Chrome", desktop: 186, mobile: 80 },
  { month: "Intellij", desktop: 305, mobile: 200 },
  { month: "Sql Developer", desktop: 237, mobile: 120 },
  { month: "WinSCP", desktop: 73, mobile: 190 },
  { month: "WinRAR", desktop: 209, mobile: 130 },
  { month: "Postman", desktop: 214, mobile: 140 },
  { month: "WebLogic", desktop: 111, mobile: 130 },
  { month: "ChatGPT", desktop: 274, mobile: 140 },
]

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

export function HbarChart() {
  return (
    <Card className="h-[45vh]"> 
      <div className="flex justify-between w-full">
        <CardHeader className="text-left">
          <CardTitle>Most Used Applications</CardTitle>
        </CardHeader>
  
        <CardHeader className="text-right">
          <CardDescription>Feb 2025</CardDescription>
        </CardHeader>
      </div>
      <CardContent>
        <ChartContainer className='h-[35vh] w-full' config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="desktop" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="desktop"
              layout="vertical"
              fill="var(--color-desktop)"
              radius={4}
            >
              <LabelList
                dataKey="month"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="desktop"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
  
}

