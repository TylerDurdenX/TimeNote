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
import AlertsConfigTable from "./AlertsConfigTable";
import ConfiguredAlertsTable from "./ConfiguredAlertsTable";

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
            <TabsList className="grid grid-cols-3 w-[600px]">
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="configure">Configure Alerts</TabsTrigger>
              <TabsTrigger value="configured">Configured Alerts</TabsTrigger>
            </TabsList>
            <TabsContent value="alerts" className="w-full">
              <Card>
                <AlertsPage />
              </Card>
            </TabsContent>
            <TabsContent value="configure">
              <Card>
                <CardHeader>
                  <CardTitle>Alerts Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AlertsConfigTable />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="configured">
              <Card>
                <CardHeader>
                  <CardTitle>Configured Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ConfiguredAlertsTable />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default page;
