import { getInitials } from "@/components/Sidebar/nav-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";

interface UserCardProps {
  name: string;
  designation: string;
  imageUrl: string;
  isHighlighted: boolean;
  textAlignment?: "left" | "center";
}

const UserCard: React.FC<UserCardProps> = ({
  name,
  designation,
  imageUrl,
  isHighlighted,
  textAlignment = "left",
}) => {
  return (
    <div
      className={`flex items-center p-4 bg-white rounded-lg shadow-md w-60 ${
        isHighlighted ? "bg-gray-100 border-2 border-blue-500" : "bg-gray-50"
      }`}
    >
      {/* Avatar Section */}
      <Avatar className="h-14 w-14 rounded-full justify-center items-center">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback className="rounded-lg text-4xl">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      {/* Text Content Section */}
      <div className={`ml-4 text-${textAlignment}`}>
        <p className="text-lg font-semibold">{name}</p>
        <p className="text-sm text-gray-600">{designation}</p>
      </div>
    </div>
  );
};

export default UserCard;
