"use client";

import React, { useEffect, useState } from "react";
import India from "@react-map/india";
import Header from "@/components/Header";
import IndiaMap from "./IndiaMap";
import { MapContainer, TileLayer } from "react-leaflet";
import HeatMap from "./HeatMap";

const page = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="w-full mb-5">
      <div className="flex w-full text-gray-900">
        <div className="pb-4 pt-1 lg:pb-4 lg:pt-8 w-full">
          <Header
            name="Geo Tracking"
            hasFilters={false}
            hasTeamFilter={false}
            hasDateFilter={true}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>
      </div>
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
      </div>
    </div>
  );
};

export default page;
