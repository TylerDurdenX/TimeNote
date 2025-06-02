"use client";

import CircularLoading from "@/components/Sidebar/loading";
import {
  useGetSubTaskActivityQuery,
  useGetTaskActivityQuery,
} from "@/store/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

// Sample data for demonstration
interface Activity {
  username: string;
  activity: string;
  timestamp: string;
}

type Props = {
  taskId: number;
};

const TaskActivity = ({ taskId }: Props) => {
  const { data, isLoading } = useGetSubTaskActivityQuery(
    { taskId },
    { refetchOnMountOrArgChange: true }
  );

  const email = useSearchParams().get("email");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Show relative time for recent activities
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    // Fallback to formatted date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };

  const regex = /\[([^\]]+)\]/g;

  // Function to highlight text inside square brackets
  const formatActivityText = (text: string) => {
    return text.split(regex).map((part, index) => {
      if (index % 2 === 1) {
        return (
          <Link
            href={`/user?email=${email}`}
            key={`link-${index}`}
            className="inline-flex items-center"
          >
            <span
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 cursor-pointer hover:underline decoration-2 underline-offset-2"
              onClick={(e) => {
                const content = (e.target as HTMLElement).textContent?.slice(
                  1,
                  -1
                );
                if (content) {
                  // Note: sessionStorage usage removed for Claude.ai compatibility
                  console.log("Username selected:", content);
                }
              }}
            >
              [{part}]
            </span>
          </Link>
        );
      }
      return <span key={`text-${index}`}>{part}</span>;
    });
  };

  const getActivityIcon = (activity: string) => {
    if (activity.includes("created")) return "🆕";
    if (activity.includes("updated")) return "✏️";
    if (activity.includes("completed")) return "✅";
    if (activity.includes("Reopened")) return "🔄";
    if (activity.includes("assigned")) return "👤";
    if (activity.includes("commented")) return "💬";
    return "📝";
  };

  const getActivityStyle = (activity: string) => {
    if (activity.includes("completed")) return "bg-green-50 border-l-green-400";
    if (activity.includes("Reopened")) return "bg-red-50 border-l-red-400";
    if (activity.includes("created")) return "bg-blue-50 border-l-blue-400";
    if (activity.includes("assigned"))
      return "bg-purple-50 border-l-purple-400";
    return "bg-gray-50 border-l-gray-400";
  };

  if (isLoading) return <CircularLoading />;

  return (
    <div className="max-w-full mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">📊</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Activity Timeline
          </h1>
        </div>
        <p className="text-gray-600">
          Track all changes and updates for this task
        </p>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {Array.isArray(data) && data.length > 0 ? (
          data.map((activity, index) => (
            <div
              key={index}
              className={`relative p-4 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all duration-200 ${getActivityStyle(
                activity.activity
              )}`}
            >
              {/* Timeline dot */}
              <div className="absolute -left-2 top-6 w-4 h-4 bg-white border-4 border-current rounded-full"></div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {getActivityIcon(activity.activity)}
                    </span>
                    {activity.username && (
                      <Link
                        href={`/user?email=${email}`}
                        className="inline-flex items-center"
                      >
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200 cursor-pointer"
                          onClick={(e) => {
                            const content = (
                              e.target as HTMLElement
                            ).textContent?.slice(1, -1);
                            if (content) {
                              // Note: sessionStorage usage removed for Claude.ai compatibility
                              console.log("Username selected:", content);
                            }
                          }}
                        >
                          [{activity.username}]
                        </span>
                      </Link>
                    )}
                  </div>

                  <div className="text-gray-800 leading-relaxed">
                    {formatActivityText(activity.activity)}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {formatDate(activity.date)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No activity yet
            </h3>
            <p className="text-gray-500">
              Activity will appear here as changes are made to this task.
            </p>
          </div>
        )}
      </div>

      {/* Timeline end indicator */}
      {Array.isArray(data) && data.length > 0 && (
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span>Beginning of activity timeline</span>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskActivity;
