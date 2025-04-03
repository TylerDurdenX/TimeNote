"use client";

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
      <img src="/lynklogo.png" alt="Logo" className="w-8 h-8" />
      <div>
        <img
          src="/CustomerLogo.jpg"
          alt="lynk.png"
          className="w-full mt-1 h-10"
        />
      </div>
    </div>
  );
}
