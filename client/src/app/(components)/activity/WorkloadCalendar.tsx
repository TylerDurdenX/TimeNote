"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { UserWorkloadSummary } from "./UserWorkloadSummary";
import { WeeklyView } from "./WeeklyView";
import {
  useGetProjectTasksQuery,
  useGetProjectWorkloadTasksQuery,
  useGetProjectWorkloadUsersQuery,
} from "@/store/api";
import CircularLoading from "@/components/Sidebar/loading";

// Mock data structure - replace with your actual data
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "Low" | "Urgent" | "Medium" | "High" | "Backlog";
  estimatedHours: number;
  status:
    | "Closed"
    | "Work In Progress"
    | "To Do"
    | "Under Review"
    | "Completed";
  dueDate: Date;
}

export interface User {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  maxHoursPerWeek: number;
}

export interface UserTask {
  userId: string;
  task: Task;
  assignedDate: Date;
}

type Props = {
  projectId: string;
  email: string;
};

const WorkloadCalendar = ({ projectId, email }: Props) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const { data: projectUsers, isLoading } = useGetProjectWorkloadUsersQuery(
    {
      projectId,
    },
    { refetchOnMountOrArgChange: true }
  );

  const { data: projectTasks, isLoading: isLoadingTasks } =
    useGetProjectWorkloadTasksQuery(
      {
        projectId,
      },
      { refetchOnMountOrArgChange: true }
    );

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const getWeekRange = () => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    return {
      start: startOfWeek,
      end: endOfWeek,
    };
  };

  const weekRange = getWeekRange();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="text-blue-600" />
                Team Workload Calendar
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and balance workload distribution across your project
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek("prev")}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="text-center min-w-[200px]">
                  <div className="font-semibold text-gray-900">
                    {weekRange.start.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    -{" "}
                    {weekRange.end.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek("next")}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={() => setCurrentWeek(new Date())}
              >
                Today
              </Button>
            </div>
          </div>
        </div>

        {/* Workload Summary */}
        {!isLoading && !isLoadingTasks ? (
          <>
            <UserWorkloadSummary
              users={projectUsers!}
              userTasks={projectTasks!}
              weekStart={weekRange.start}
            />
          </>
        ) : (
          <CircularLoading />
        )}

        {/* Weekly Calendar */}
        {!isLoading && !isLoadingTasks ? (
          <>
            <WeeklyView
              users={projectUsers!}
              userTasks={projectTasks!}
              weekStart={weekRange.start}
            />
          </>
        ) : (
          <CircularLoading />
        )}
      </div>
    </div>
  );
};

export default WorkloadCalendar;
