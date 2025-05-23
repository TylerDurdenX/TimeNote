"use client";

import { AirplayIcon } from "lucide-react";
import * as React from "react";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="mt-2 ml-2">
        <AirplayIcon className="w-8 h-8 text-white" />
      </div>

      <div>
        {/* <img
          src="/CustomerLogo.jpg"
          alt="lynk.png"
          className="w-full mt-1 h-10"
        /> */}
        <h1 className="text-white mt-2 ml-2">TimeNote</h1>
      </div>
    </div>
  );
}
