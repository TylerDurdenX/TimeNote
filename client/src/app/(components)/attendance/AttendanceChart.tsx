"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useGetAttendanceLineChartDataQuery } from "@/store/api";
import CircularLoading from "@/components/Sidebar/loading";
const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

type Props = {
  email: string;
  title: string;
  setOnTimeList: (tab: any[]) => void;
  setLateArrivalList: (tab: any[]) => void;
};

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function AttendanceChart({
  email,
  title,
  setOnTimeList,
  setLateArrivalList,
}: Props) {
  localStorage.removeItem("persist:root");

  const { data, isLoading } = useGetAttendanceLineChartDataQuery(
    { email, title },
    { refetchOnMountOrArgChange: true }
  );

  if (title === "On Time Arrivals") {
    setOnTimeList(data!);
  }

  if (title === "Late Arrivals") {
    setLateArrivalList(data!);
  }

  if (isLoading) {
    return (
      <div>
        <CircularLoading />
      </div>
    );
  }

  return (
    <Card className="w-full h-48">
      <CardContent className="">
        {" "}
        {/* Remove padding if you want the chart to fill the entire card */}
        <ChartContainer config={chartConfig} className="w-full h-48">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
            className="w-full h-full" // Ensures the chart fills the container
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Area
              dataKey="count"
              type="linear"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
