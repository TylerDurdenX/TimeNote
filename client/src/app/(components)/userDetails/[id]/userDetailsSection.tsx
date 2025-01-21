import React, { useState } from "react";
import UserDetailHeader from "./userDetailHeader";
import UserSettings from "./UserSettings";
import Organization from "./Organization";

type Props = {
  id: number;
};

const userDetailsSection = ({ id }: Props) => {
  const [activeTab, setActiveTab] = useState("User Settings");

  return (
    <div className="w-full h-full overflow-hidden overflow-y-auto ">
      <UserDetailHeader activeTab={activeTab} setActiveTab={setActiveTab}/>
      {activeTab==="User Settings" && (
        <UserSettings id = {id}/>
        )}
        {activeTab==="Organization" && (
        <Organization />
        )}
    </div>
  );
};

export default userDetailsSection;
