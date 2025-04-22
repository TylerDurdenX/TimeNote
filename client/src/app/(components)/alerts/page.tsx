"use client";

import Header from "@/components/Header";
import React from "react";
import AlertsPage from "./AlertsPage";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const page = () => {
  return (
    <>
      <div className="w-full mb-5">
        <div className="flex w-full text-gray-900">
          <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
            <Header name="Alerts" hasFilters={false} hasTeamFilter={false} />
          </div>
        </div>
        <div className="flex gap-4 px-4 w-full h-full  box-border overflow-x-hidden">
          <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="configure" disabled={true}>
                Configure Alerts
              </TabsTrigger>
            </TabsList>
            <TabsContent value="alerts" className="w-full">
              <Card>
                <AlertsPage />
              </Card>
            </TabsContent>
            <TabsContent value="configure">
              <Card>
                <CardHeader>
                  <CardTitle>Alerts</CardTitle>
                  <CardDescription>Alerts Configuration Page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2"></CardContent>
                <CardFooter>
                  <Button>Save Configuration</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default page;
