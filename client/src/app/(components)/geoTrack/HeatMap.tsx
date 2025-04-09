import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import { useGetUsersGeoDataQuery } from "@/store/api";
import { User, User2, Users } from "lucide-react";

// Custom Icons
const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const multiplePeopleIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/847/847969.png", // Replace with multiple people icon URL
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// User Data Type
export type UserGeoData = [number, number, number, string, string];

const HeatMap: React.FC<{ data: UserGeoData[] }> = ({ data }) => {
  const map = useMap();
  const [heatLayer, setHeatLayer] = useState<L.HeatLayer | null>(null);

  useEffect(() => {
    if (heatLayer) {
      map.removeLayer(heatLayer);
    }

    const heatData = data.map(
      ([lat, lng, intensity]) =>
        [lat, lng, intensity] as [number, number, number]
    );

    const newHeatLayer = L.heatLayer(heatData, {
      radius: 50,
      blur: 25,
      maxZoom: 15,
      gradient: {
        0.2: "green",
        0.4: "yellow",
        0.6: "orange",
        0.8: "red",
        1: "purple",
      },
    });

    newHeatLayer.addTo(map);
    setHeatLayer(newHeatLayer);
    map.invalidateSize();

    return () => {
      if (newHeatLayer) {
        map.removeLayer(newHeatLayer);
      }
    };
  }, [data, map]);

  return null;
};

type Props = {
  selectedDate: Date;
};

const Map = ({ selectedDate }: Props) => {
  const {
    data: GeoData,
    isLoading,
    refetch,
  } = useGetUsersGeoDataQuery({
    date: selectedDate.toString(),
  });

  useEffect(() => {
    refetch();
  }, [selectedDate]);

  if (isLoading) return <div>Loading...</div>;

  const userLocations: UserGeoData[] = GeoData || [];

  const initialCenter: [number, number] =
    userLocations.length > 0
      ? [userLocations[0][0], userLocations[0][1]]
      : [28.6139, 77.209];

  // Group users by location
  const groupedUsers = userLocations.reduce(
    (acc, [lat, lng, , name, extraInfo]) => {
      const key = `${lat.toFixed(5)}_${lng.toFixed(5)}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({ lat, lng, name, extraInfo });
      return acc;
    },
    {} as Record<
      string,
      { lat: number; lng: number; name: string; extraInfo: string }[]
    >
  );

  const CustomIcon = ({ isMultiple }: { isMultiple: boolean }) => {
    return (
      <div style={{ fontSize: "24px", color: isMultiple ? "blue" : "green" }}>
        {isMultiple ? <Users /> : <User />}
      </div>
    );
  };

  const createCustomIcon = (isMultiple: boolean) => {
    return L.divIcon({
      className: "custom-icon",
      html: `<div style="display: flex; align-items: center; justify-content: center; font-size: 24px; color: ${
        isMultiple ? "blue" : "green"
      };">${isMultiple ? "👥" : "👤"}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  return (
    <MapContainer
      center={initialCenter}
      zoom={14}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        subdomains={["a", "b", "c"]}
        maxZoom={19}
      />
      <HeatMap data={userLocations} />

      {Object.values(groupedUsers).map((group, index) => {
        const { lat, lng } = group[0];
        const isMultiple = group.length > 1;
        const icon = isMultiple ? <User2 /> : userIcon;

        return (
          <Marker
            key={index}
            position={[lat, lng]}
            icon={createCustomIcon(isMultiple)}
          >
            <Popup>
              {isMultiple ? (
                <div>
                  <strong>Multiple Users:</strong>
                  <ul>
                    {group.map((user, idx) => (
                      <li key={idx}>
                        {idx + 1}. {user.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div>
                  <strong>User: {group[0].name}</strong>
                  <br />
                  {/* <em>Designation: {group[0].extraInfo}</em> */}
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default Map;
