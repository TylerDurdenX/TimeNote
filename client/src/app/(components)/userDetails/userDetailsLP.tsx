import Tags from "@/components/SettingsSheet/AutoCompleteTags";
import { Avatar } from "@mui/material";
import React from "react";

const UserDetailsLP = () => {
  return (
    <div className="flex items-center justify-center h-full mb-5 flex-col">
      <div className="flex items-center gap-3">
  <img src="lynkpng.png" alt="Logo" className="w-90 h-36" />
</div>
      <div className="mt-4 text-xl">Please select a user to view details!</div>
    </div>
  );
};

export default UserDetailsLP;
