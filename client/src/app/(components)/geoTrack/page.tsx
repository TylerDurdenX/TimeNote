'use client'

import React, { useEffect, useState } from "react";
import India from "@react-map/india";
const page = () => {

  return (
    <div className="flex justify-center items-center min-h-screen w-full">
  <div className="w-full md:w-[100vh] h-[100vh]">
    <India size={800} hoverColor="orange" type="select-single" />
  </div>
</div>

  
  )
}


export default page