import React from "react";
import { Clock, AlertCircle, CheckCircle, Circle } from "lucide-react";
import { UserTask } from "./WorkloadCalendar";

interface UserTaskCardProps {
  userTask: UserTask;
}

export const UserTaskCard: React.FC<UserTaskCardProps> = ({ userTask }) => {
  const { task } = userTask;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-300 bg-red-50 text-red-700";
      case "medium":
        return "border-yellow-300 bg-yellow-50 text-yellow-700";
      case "low":
        return "border-green-300 bg-green-50 text-green-700";
      default:
        return "border-gray-300 bg-gray-50 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case "in-progress":
        return <Circle className="w-3 h-3 text-blue-600" />;
      case "pending":
        return <AlertCircle className="w-3 h-3 text-gray-400" />;
      default:
        return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 border-green-200";
      case "in-progress":
        return "bg-blue-100 border-blue-200";
      case "pending":
        return "bg-gray-100 border-gray-200";
      default:
        return "bg-gray-100 border-gray-200";
    }
  };

  return (
    <div
      className={`p-2 rounded-md border text-xs ${getPriorityColor(
        task.priority
      )} ${getStatusColor(
        task.status
      )} cursor-pointer hover:shadow-sm transition-shadow`}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="font-medium truncate flex-1 mr-1">{task.title}</div>
        {getStatusIcon(task.status)}
      </div>

      <div className="flex items-center gap-1 text-xs opacity-75">
        <Clock className="w-3 h-3" />
        <span>{task.estimatedHours}h</span>
        <span className="ml-1 px-1 py-0.5 bg-black bg-opacity-10 rounded text-xs uppercase font-medium">
          {task.priority}
        </span>
      </div>

      {task.description && (
        <div className="mt-1 text-xs opacity-70 truncate">
          {task.description}
        </div>
      )}
    </div>
  );
};
