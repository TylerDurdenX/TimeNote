"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatTable from "./StatTable";

export function ProductivityStats() {
  return (
    <Card className="h-[83vh] rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="border-b p-6">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Productivity Stats
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 mt-1 flex items-center space-x-2">
          <TrendingUp className="text-blue-500" />
          <span>Most Productive Users</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 py-4">
        <StatTable activeTrend={true} />
      </CardContent>

      <CardDescription className="text-sm text-gray-500 mt-1 flex items-center space-x-2 ml-4">
        <TrendingDown className="text-red-500" />
        <span>Least Productive Users</span>
      </CardDescription>

      <CardContent className="px-6 py-4">
        <StatTable activeTrend={false} />
      </CardContent>
    </Card>
  );
}
