"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapContainer, TileLayer } from "react-leaflet";
import HeatMap from "./HeatMap";
import { Card } from "@/components/ui/card";
import GeoTableView from "./GeoTableView";
import { useSearchParams } from "next/navigation";

const page = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const userEmail = useSearchParams().get("email");

  return (
    <div className="w-full mb-5">
      <div className="flex w-full text-gray-900">
        <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
          <Header
            name="Geo Tracking (Beta)"
            hasFilters={false}
            hasTeamFilter={false}
            hasDateFilter={true}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>
      </div>
      <div className="flex gap-4 px-4 w-full h-full  box-border overflow-x-hidden">
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="tableView">Table View</TabsTrigger>
          </TabsList>
          <TabsContent value="map" className="w-full">
            <Card>
              <div className="flex justify-center items-center min-h-screen w-full">
                <div className="w-full ml-7 mr-7 mt-7 h-[100vh]">
                  {/* <India size={800} hoverColor="orange" type="select-single" /> */}
                  {/* <IndiaMap /> */}
                  <MapContainer
                    center={[20.5937, 78.9629]}
                    zoom={5}
                    style={{ height: "100vh", width: "100%", zIndex: 50 }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    <HeatMap selectedDate={selectedDate} />
                  </MapContainer>
                </div>
              </div>{" "}
            </Card>
          </TabsContent>
          <TabsContent value="tableView">
            {/* <Card>
              <CardContent className="space-y-2"> */}
            <GeoTableView
              adminFlag={true}
              email={userEmail!}
              selectedDate={selectedDate}
            />
            {/* </CardContent>
            </Card> */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default page;
