"use client";

import Header from "@/components/Header";
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportsTable from "./ReportsTable";
import ReportsConfigurationTable from "./ReportsConfigurationTable";
import ConfiguredReportsTable from "./ConfiguredReportsTable";

const page = () => {
  return (
    <>
      <div className="w-full mb-5">
        <div className="flex w-full text-gray-900">
          <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
            <Header name="Reports" hasFilters={false} hasTeamFilter={false} />
          </div>
        </div>
        <div className="flex gap-4 px-4 w-full h-full  box-border overflow-x-hidden">
          <Tabs defaultValue="dr" className="w-full">
            <TabsList className="grid grid-cols-3 w-[600px]">
              <TabsTrigger value="dr">Download Reports</TabsTrigger>
              <TabsTrigger value="cr">Configure Reports</TabsTrigger>
              <TabsTrigger value="cdr">Configured Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="dr" className="w-full">
              <div className="w-full, mt-5">
                <Card>
                  <ReportsTable />
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="cr">
              <div className="w-full, mt-5">
                <Card>
                  <ReportsConfigurationTable />
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="cdr" className="w-full">
              <div className="w-full, mt-5">
                <Card>
                  <ConfiguredReportsTable />
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default page;
