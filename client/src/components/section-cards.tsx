import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetAttendanceCardsDataQuery } from "@/store/api";
import CircularLoading from "./Sidebar/loading";

type Props = {
  email: string;
  fromDate: string;
  toDate: string;
  teamId: number;
};

export function SectionCards({ email, fromDate, toDate, teamId }: Props) {
  const { data, isLoading } = useGetAttendanceCardsDataQuery(
    {
      email,
      fromDate,
      toDate,
      teamId,
    },
    { refetchOnMountOrArgChange: true }
  );

  function isPositiveChange(percentage?: string): boolean {
    if (!percentage) return false; // handles undefined, null, empty string

    return percentage.trim().startsWith("+");
  }

  return (
    <div className="*:data-[slot=card]:shadow-xs grid grid-cols-4 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>On-Time Arrivals</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {data?.onTimeArrival}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              {data?.onTimePercentage}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isPositiveChange(data?.onTimePercentage!) ? (
              <>
                {" "}
                Trending up this period <TrendingUpIcon className="size-4" />
              </>
            ) : (
              <>
                Down this period <TrendingDownIcon className="size-4" />
              </>
            )}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Late Arrivals</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {data?.lateArrival}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingDownIcon className="size-3" />
              {data?.lateArrivalPercentage}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isPositiveChange(data?.lateArrivalPercentage!) ? (
              <>
                {" "}
                Trending up this period <TrendingUpIcon className="size-4" />
              </>
            ) : (
              <>
                Down this period <TrendingDownIcon className="size-4" />
              </>
            )}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Active Time</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {data?.avgActiveTime}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              {data?.avgActiveTimePercentage}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isPositiveChange(data?.avgActiveTimePercentage!) ? (
              <>
                {" "}
                Trending up this period <TrendingUpIcon className="size-4" />
              </>
            ) : (
              <>
                Down this period <TrendingDownIcon className="size-4" />
              </>
            )}{" "}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Break Time</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {data?.breakTime}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              {data?.breakTimePercentage}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isPositiveChange(data?.breakTimePercentage!) ? (
              <>
                {" "}
                Trending up this period <TrendingUpIcon className="size-4" />
              </>
            ) : (
              <>
                Down this period <TrendingDownIcon className="size-4" />
              </>
            )}{" "}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
