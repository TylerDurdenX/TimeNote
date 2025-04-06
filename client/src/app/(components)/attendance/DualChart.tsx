"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type Props = {
  onTimeList: any[];
  lateArrivalList: any[];
};

export function DualChart({ onTimeList, lateArrivalList }: Props) {
  const combinedList = onTimeList?.map((entry1, index) => {
    const entry2 = lateArrivalList ? lateArrivalList[index] : 0;
    return {
      date: entry1.date,
      onTime: entry1.count,
      lateArrival: entry2.count,
    };
  });

  return (
    <Card className="h-[39vh]">
      <CardHeader>
        <CardTitle>On Time vs Late Arrival Tendency</CardTitle>
        {combinedList !== null && combinedList !== undefined ? (
          <>
            {combinedList.length > 0 ? (
              <CardDescription>
                {combinedList[0].date} -{" "}
                {combinedList[combinedList.length - 1].date}
              </CardDescription>
            ) : (
              ""
            )}
          </>
        ) : (
          ""
        )}
      </CardHeader>

      <CardContent className="h-[35vh] overflow-hidden">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <LineChart
            accessibilityLayer
            data={combinedList}
            margin={{
              left: 12,
              right: 12,
              bottom: 30, // Added margin for X-axis labels at the bottom
            }}
            className="w-full h-full"
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              angle={-45} // Rotate the labels to avoid overflow
              textAnchor="end" // Adjust text anchor for better alignment
              height={50} // Ensure enough height for the X-axis
            />

            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <Line
              dataKey="lateArrival"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="onTime"
              type="monotone"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
