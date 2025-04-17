"use client";

import React, { useState } from "react";
import UserList from "../../userDetails/usersList";
import UserDetailsLP from "../../userDetails/userDetailsLP";
import MyCalendar from "./CalendarView";
import WorkloadCalendarView from "./WorkloadCalendarView";

type Props = {
  projectId: string;
  sprint: string;
  assignedTo: string;
  priority: string;
  isTaskOrSubTask: string;
  email: string;
};

const UserWorkload = ({
  projectId,
  sprint,
  assignedTo,
  priority,
  isTaskOrSubTask,
  email,
}: Props) => {
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const handleSelectUser = (id: number) => {
    setIsUserSelected(true);
    setUserId(id);
  };

  return (
    <div className="flex gap-4 px-4 mr-4 h-full">
      <div className="w-2/5 p-4 shadow-lg mb-5 overflow-hidden">
        <UserList onSelectUser={handleSelectUser} activeFlag={true} />
      </div>
      <div className="w-3/5 p-4 shadow-lg overflow-hidden justify-center">
        {isUserSelected ? (
          ""
        ) : (
          <WorkloadCalendarView
            projectId={projectId}
            sprint={sprint}
            email={email!}
            assignedTo={assignedTo}
            priority={priority}
            isTaskOrSubTask={isTaskOrSubTask}
          />
        )}
      </div>
    </div>
  );
};

export default UserWorkload;
