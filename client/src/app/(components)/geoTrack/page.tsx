'use client'

import React, { useEffect, useState } from "react";


const page = () => {

  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Optionally, you can check when the map has finished loading
    setMapLoaded(true);
  }, []);

  return (
    <div style={{ width: "100%", height: "500px" }}>
      
    </div>
  )
}


export default page