import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Users } from "lucide-react";
import { User, UserTask } from "./WorkloadCalendar";

interface UserWorkloadSummaryProps {
  users: User[];
  userTasks: UserTask[];
  weekStart: Date;
}

export const UserWorkloadSummary: React.FC<UserWorkloadSummaryProps> = ({
  users,
  userTasks,
  weekStart,
}) => {
  const getWeeklyWorkload = () => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return users.map((user) => {
      const userWeekTasks = userTasks.filter((userTask) => {
        const taskDate = new Date(userTask.assignedDate);
        return (
          userTask.userId === user.id &&
          taskDate >= weekStart &&
          taskDate <= weekEnd
        );
      });

      const totalHours = userWeekTasks.reduce(
        (sum, userTask) => sum + userTask.task.estimatedHours,
        0
      );

      const utilizationPercentage = (totalHours / user.maxHoursPerWeek) * 100;

      return {
        ...user,
        totalHours,
        utilizationPercentage,
        taskCount: userWeekTasks.length,
        isOverloaded: totalHours > user.maxHoursPerWeek,
        isUnderloaded: totalHours < user.maxHoursPerWeek * 0.7,
      };
    });
  };

  const workloadData = getWeeklyWorkload();
  const averageUtilization =
    workloadData.reduce((sum, user) => sum + user.utilizationPercentage, 0) /
    workloadData.length;

  const overloadedCount = workloadData.filter(
    (user) => user.isOverloaded
  ).length;
  const underloadedCount = workloadData.filter(
    (user) => user.isUnderloaded
  ).length;

  const getUtilizationColor = (percentage: number) => {
    if (percentage > 100) return "#ef4444"; // red
    if (percentage > 85) return "#f59e0b"; // amber
    if (percentage < 70) return "#6b7280"; // gray
    return "#10b981"; // green
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Team Overview
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Average Utilization</span>
            <span className="font-semibold text-lg">
              {averageUtilization.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-500" />
              Overloaded
            </span>
            <span className="font-semibold text-red-600">
              {overloadedCount} member{overloadedCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-gray-500" />
              Underloaded
            </span>
            <span className="font-semibold text-gray-600">
              {underloadedCount} member{underloadedCount !== 1 ? "s" : ""}
            </span>
          </div>

          {(overloadedCount > 0 || underloadedCount > 0) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Workload Imbalance Detected
                </span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Consider redistributing tasks to balance the workload.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Utilization Chart */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Weekly Utilization by Team Member
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={workloadData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{
                value: "Utilization %",
                angle: -90,
                position: "insideLeft",
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                "Utilization",
              ]}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="utilizationPercentage" radius={[4, 4, 0, 0]}>
              {workloadData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getUtilizationColor(entry.utilizationPercentage)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Optimal (70-85%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>High (85-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Overloaded ({">"}100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Underloaded ({"<"}70%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
