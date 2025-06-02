import React from "react";
import { User, UserTask } from "./WorkloadCalendar";
import { UserTaskCard } from "./UserTaskCard";

interface WeeklyViewProps {
  users: User[];
  userTasks: UserTask[];
  weekStart: Date;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  users,
  userTasks,
  weekStart,
}) => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getTasksForUserAndDay = (userId: string, dayIndex: number) => {
    const targetDate = new Date(weekStart);
    targetDate.setDate(targetDate.getDate() + dayIndex);

    return userTasks.filter((userTask) => {
      const taskDate = new Date(userTask.assignedDate);
      return (
        userTask.userId === userId &&
        taskDate.toDateString() === targetDate.toDateString()
      );
    });
  };

  const getDayDate = (dayIndex: number) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    return date;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (dayIndex: number) => {
    return dayIndex === 0 || dayIndex === 6;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-4 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200">
          Team Members
        </div>
        {daysOfWeek.map((day, index) => {
          const date = getDayDate(index);
          return (
            <div
              key={day}
              className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                isToday(date) ? "bg-blue-50" : "bg-gray-50"
              } ${isWeekend(index) ? "bg-gray-100" : ""}`}
            >
              <div
                className={`font-semibold ${
                  isToday(date) ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {day}
              </div>
              <div
                className={`text-sm ${
                  isToday(date) ? "text-blue-500" : "text-gray-500"
                }`}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendar Body */}
      <div className="divide-y divide-gray-200">
        {users.map((user) => (
          <div key={user.id} className="grid grid-cols-8">
            {/* User Info Column */}
            <div className="p-4 bg-gray-50 border-r border-gray-200 flex items-center">
              <div>
                <div className="font-semibold text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">{user.role}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Max: {user.maxHoursPerWeek}h/week
                </div>
              </div>
            </div>

            {/* Day Columns */}
            {daysOfWeek.map((_, dayIndex) => {
              const dayTasks = getTasksForUserAndDay(user.id, dayIndex);
              const totalHours = dayTasks.reduce(
                (sum, userTask) => sum + userTask.task.estimatedHours,
                0
              );
              const date = getDayDate(dayIndex);

              return (
                <div
                  key={dayIndex}
                  className={`p-2 border-r border-gray-200 last:border-r-0 min-h-[120px] ${
                    isWeekend(dayIndex) ? "bg-gray-50" : "bg-white"
                  } ${isToday(date) ? "bg-blue-25" : ""}`}
                >
                  {dayTasks.length > 0 && (
                    <div className="mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          totalHours > 8
                            ? "bg-red-100 text-red-700"
                            : totalHours > 6
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {totalHours}h
                      </span>
                    </div>
                  )}

                  <div className="space-y-1">
                    {dayTasks.map((userTask, index) => (
                      <UserTaskCard key={index} userTask={userTask} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
