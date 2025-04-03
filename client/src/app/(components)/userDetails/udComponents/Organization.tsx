import React, { useState, useEffect } from "react";
import UserCard from "./UserCard"; // Assuming the UserCard component is imported
import { UserHierarchy as User } from "@/store/interfaces";
import { useGetUserHierarchyDataQuery } from "@/store/api";
import CircularLoading from "@/components/Sidebar/loading";

interface HierarchyPageProps {
  startingUserId: number;
  setStartingUserId: React.Dispatch<React.SetStateAction<number>>;
}

export default function HierarchyPage({
  startingUserId,
  setStartingUserId,
}: HierarchyPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [managers, setManagers] = useState<User[]>([]); // To store managers (hierarchy upwards)
  const [directReports, setDirectReports] = useState<User[]>([]);
  const [TopMostUserSelected, setTopMostUserSelected] = useState(false);
  const [ifBottomUserSelected, setIfBottomUserSelected] = useState(false);

  // Fetch user hierarchy data based on the starting user ID
  const { data, isLoading, error } = useGetUserHierarchyDataQuery(
    {
      userId: startingUserId,
    },
    {
      refetchOnMountOrArgChange: true, // Refetch data when startingUserId changes
    }
  );

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Find the current user based on the startingUserId
    const foundUser = data.find((user) => user.userId === startingUserId);

    if (foundUser) {
      let currentUser = foundUser;
      let managersList: User[] = [];

      if (
        foundUser.reportsToId === null ||
        foundUser.reportsToId === undefined
      ) {
        setTopMostUserSelected(true);
      } else {
        setTopMostUserSelected(false);
      }

      // Step 1: Find the hierarchy upwards
      while (currentUser.reportsToId) {
        const manager = data.find(
          (user) =>
            user.userId ===
            (currentUser.reportsToId ? Number(currentUser.reportsToId) : null)
        );
        if (manager) {
          managersList.unshift(manager); // Push to the front of the list to keep hierarchy order
          currentUser = manager;
        } else {
          break;
        }
      }

      setUser(foundUser);
      setManagers(managersList);

      // Step 2: Find direct reports (downwards in the hierarchy)
      const reports = data.filter(
        (user) => Number(user.reportsToId) === foundUser.userId // Direct comparison between userId and reportsToId
      );
      setDirectReports(reports);
      if (directReports === null || directReports === undefined) {
        setIfBottomUserSelected(true);
      } else {
        setIfBottomUserSelected(false);
      }
    }
  }, [startingUserId, data]); // Dependency on startingUserId and data

  if (isLoading) {
    return (
      <div>
        <CircularLoading />
      </div>
    );
  }

  if (error) {
    return <div>Error loading user data</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const handleCardClick = (id: number) => {
    setStartingUserId(id);
  };

  return (
    <div className="flex flex-col items-center mt-8 w-full relative">
      {/* Render Manager Hierarchy */}
      <div className="flex flex-col items-center space-y-4 relative">
        {managers.map((manager, index) => (
          <div
            key={manager.userId}
            className="relative flex items-center  justify-center"
          >
            {index !== managers.length - 1 && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-500"></div>
            )}
            <button
              onClick={() => handleCardClick(manager.userId)}
              className="transition-all transform hover:scale-105"
            >
              <UserCard
                name={manager.username}
                designation={manager.designation}
                imageUrl={manager.profilePicture?.base64}
                isHighlighted={false}
                textAlignment="left"
              />
            </button>
          </div>
        ))}
      </div>
      {TopMostUserSelected ? (
        ""
      ) : (
        <div className=" top-full left-1/2 transform -translate-x-1/2 w-px h-4 bg-gray-500"></div>
      )}

      {/* Render Current User with Highlight */}
      <div>
        <button
          onClick={() => handleCardClick(user.userId)}
          className="transition-all transform hover:scale-105"
        >
          <UserCard
            name={user.username}
            designation={user.designation}
            imageUrl={user.profilePicture?.base64}
            isHighlighted={true}
            textAlignment="left"
          />
        </button>
      </div>

      {directReports.length > 1 ? (
        <div className="flex flex-col items-center relative rounded-lg">
          <div className="top-full left-1/2 transform -translate-x-1/2 w-px h-4 bg-gray-500"></div>
          <div className="flex flex-col items-center mt-0 relative border border-gray-300 rounded-lg p-4">
            <div className="flex flex-wrap justify-center gap-8 bg-white shadow-md p-6 w-full">
              {directReports.map((report) => (
                <div
                  key={report.userId}
                  className="relative flex flex-col items-center"
                >
                  <button
                    onClick={() => handleCardClick(report.userId)}
                    className="transition-all transform hover:scale-105"
                  >
                    <UserCard
                      name={report.username}
                      designation={report.designation}
                      imageUrl={report.profilePicture?.base64}
                      isHighlighted={false}
                      textAlignment="left"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center mt-0 relative rounded-lg">
          <div className="flex flex-wrap justify-center gap-8">
            {directReports.map((report, index) => (
              <div
                key={report.userId}
                className="relative flex flex-col items-center"
              >
                {ifBottomUserSelected ? (
                  ""
                ) : (
                  <div className=" top-full left-1/2 transform -translate-x-1/2 w-px h-4 bg-gray-500"></div>
                )}

                <button
                  onClick={() => handleCardClick(report.userId)}
                  className="transition-all transform hover:scale-105"
                >
                  <UserCard
                    name={report.username}
                    designation={report.designation}
                    imageUrl={report.profilePicture?.base64}
                    isHighlighted={false}
                    textAlignment="left"
                  />
                </button>

                {/* Conditionally render a vertical line between cards, but not after the last one */}
                {index < directReports.length - 1 && !ifBottomUserSelected && (
                  <div className="top-full left-1/2 transform -translate-x-1/2 w-px h-4 bg-gray-500 mt-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
