"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Area, AreaChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useGetAttendanceChartDataQuery } from "@/store/api";
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "On-Time",
    color: "hsl(var(--chart-2))",
  },
  mobile: {
    label: "Late",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  email: string;
  fromDate: string;
  toDate: string;
  teamId: number;
};

export function BarChartComponent({ email, fromDate, toDate, teamId }: Props) {
  const { data, isLoading } = useGetAttendanceChartDataQuery(
    {
      email,
      fromDate,
      toDate,
      teamId,
    },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>On Time vs Late Arrival Tendency</CardTitle>
        <CardDescription>
          {fromDate} - {toDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="h-[40vh] w-full" config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              // tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {/* <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div> */}
      </CardFooter>
    </Card>
  );
}
