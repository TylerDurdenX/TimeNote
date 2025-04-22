import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HighlightedUsersTable from "./LateUsersTable";
import data from "./newData.json";
import AttendanceTable from "../attendance/AttendanceTable";

type Props = {
  userEmail: string;
  fromDate: string;
  toDate: string;
  teamId: number;
};

export function TabsDemo({ userEmail, fromDate, toDate, teamId }: Props) {
  return (
    <div className="w-full">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="account">Late Comers</TabsTrigger>
          <TabsTrigger value="password">Always on-Time</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader className="mt-1">
              <CardDescription>
                People who have punched in late the most number of times in
                given period
              </CardDescription>
            </CardHeader>
            <HighlightedUsersTable
              email={userEmail!}
              adminFlag={true}
              lateFlag={true}
              fromDate={fromDate}
              toDate={toDate}
              teamId={teamId}
            />
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader className="mt-1">
              <CardDescription>
                People who have punched in on-time the most number of times in
                given period
              </CardDescription>
            </CardHeader>
            <HighlightedUsersTable
              email={userEmail!}
              adminFlag={true}
              lateFlag={false}
              fromDate={fromDate}
              toDate={toDate}
              teamId={teamId}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
