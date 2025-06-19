import React, { useState, useEffect } from "react";
import UserCard from "./UserCard"; // Assuming the UserCard component is imported
import { UserHierarchy as User } from "@/store/interfaces";
import { useGetUserHierarchyDataQuery } from "@/store/api";
import CircularLoading from "@/components/Sidebar/loading";
import { ChevronUp, ChevronDown } from "lucide-react";

interface HierarchyPageProps {
  startingUserId: number;
  setStartingUserId: React.Dispatch<React.SetStateAction<number>>;
}

// Connection Line Component
const ConnectionLine = ({ vertical = false, className = "" }) => (
  <div
    className={`
    bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300 
    ${vertical ? "w-0.5 h-8 mx-auto" : "h-0.5 w-8"} 
    ${className}
  `}
  />
);

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
      if (reports.length === 0) {
        setIfBottomUserSelected(true);
      } else {
        setIfBottomUserSelected(false);
      }
    }
  }, [startingUserId, data]); // Dependency on startingUserId and data

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <CircularLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-red-500 bg-red-50 p-6 rounded-xl border border-red-200 shadow-lg">
          <h3 className="font-semibold text-red-700 mb-2">
            Error Loading Data
          </h3>
          <p>Error loading user data</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-500 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-lg">
          <h3 className="font-semibold text-gray-700 mb-2">User Not Found</h3>
          <p>User not found</p>
        </div>
      </div>
    );
  }

  const handleCardClick = (id: number) => {
    setStartingUserId(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Organization Hierarchy
          </h1>
          <p className="text-gray-600 text-lg">
            Navigate through the organizational structure
          </p>
        </div>

        <div className="flex flex-col items-center">
          {/* Render Manager Hierarchy */}
          {managers.length > 0 && (
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                {managers.map((manager, index) => (
                  <div
                    key={manager.userId}
                    className="flex flex-col items-center"
                  >
                    <button
                      onClick={() => handleCardClick(manager.userId)}
                      className="transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl"
                    >
                      <UserCard
                        name={manager.username}
                        designation={manager.designation}
                        imageUrl={manager.profilePicture?.base64}
                        isHighlighted={false}
                        textAlignment="left"
                      />
                    </button>

                    {index !== managers.length - 1 && (
                      <div className="my-3">
                        <ConnectionLine vertical />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connection line to current user */}
          {!TopMostUserSelected && (
            <div className="my-3">
              <ConnectionLine vertical />
            </div>
          )}

          {/* Render Current User with Highlight */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-3xl opacity-20 blur-xl animate-pulse"></div>
            <button
              onClick={() => handleCardClick(user.userId)}
              className="relative transition-all duration-300 transform hover:scale-110 hover:-translate-y-2"
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

          {/* Direct Reports Section */}
          {directReports.length > 0 && (
            <div className="flex flex-col items-center space-y-6 w-full">
              <div className="my-3">
                <ConnectionLine vertical />
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <ChevronDown size={16} />
                <span className="font-medium">
                  Direct Reports ({directReports.length})
                </span>
              </div>

              {directReports.length > 1 ? (
                <div className="flex flex-col items-center w-full">
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 shadow-2xl p-8 w-full max-w-full">
                    <div className="flex flex-wrap justify-center gap-8">
                      {directReports.map((report) => (
                        <div
                          key={report.userId}
                          className="flex flex-col items-center"
                        >
                          <button
                            onClick={() => handleCardClick(report.userId)}
                            className="transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl"
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
                <div className="flex flex-wrap justify-center gap-8">
                  {directReports.map((report, index) => (
                    <div
                      key={report.userId}
                      className="flex flex-col items-center"
                    >
                      <button
                        onClick={() => handleCardClick(report.userId)}
                        className="transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl"
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
              )}
            </div>
          )}

          {/* Navigation Hint */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-500 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/40 shadow-lg">
              <span>💡</span>
              <span>Click on any card to navigate through the hierarchy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
