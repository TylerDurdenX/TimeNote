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
import { DataTable } from "./LateUsersTable";
import data from "./newData.json";

export function TabsDemo() {
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
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <DataTable data={data} />
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader className="mt-1">
              <CardDescription>
                Change your password here. After saving, you'll be logged out.
              </CardDescription>
            </CardHeader>
            <DataTable data={data} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
