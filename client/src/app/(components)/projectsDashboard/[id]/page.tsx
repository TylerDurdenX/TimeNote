"use client";

import React, { useEffect, useState } from "react";
import ProjectHeader from "./ProjectHeader";
import KanbanBoard from "./KanbanBoard";
import Timeline from "./Timeline";
import TableView from "./Table";
import CircularLoading from "@/components/Sidebar/loading";
import MyCalendar from "./CalendarView";
import UserWorkload from "./UserWorkload";

const Project = () => {
  const [activeTab, setActiveTab] = useState(
    sessionStorage.getItem("activeTab") || "Kanban Board"
  );
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const [idFromUrl, setIdFromUrl] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("X");
  const [sprint, setSprint] = useState("");
  const [isTaskOrSubTask, setIsTaskOrSubTask] = useState("Task");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      const urlParams = new URL(url);
      const id = urlParams.pathname.split("/")[2];
      const emailParam = urlParams.searchParams.get("email");

      setIdFromUrl(id);
      setEmail(emailParam);
    }
  }, []);

  if (idFromUrl === null || email === null) {
    return (
      <div>
        <CircularLoading />
      </div>
    );
  }

  return (
    <div>
      <ProjectHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        priority={priority}
        setPriority={setPriority}
        assignedTo={assignedTo}
        setAssignedTo={setAssignedTo}
        sprint={sprint}
        setSprint={setSprint}
        email={email!}
        projectId={Number(idFromUrl!)}
        isTaskOrSubTask={isTaskOrSubTask}
        setIsTaskOrSubTask={setIsTaskOrSubTask}
      />
      {activeTab === "Kanban Board" && (
        <KanbanBoard
          id={idFromUrl}
          email={email!}
          setIsModalNewTaskOpen={setIsModalNewTaskOpen}
          priority={priority}
          setPriority={setPriority}
          assignedTo={assignedTo}
          setAssignedTo={setAssignedTo}
          sprint={sprint}
          projectId={idFromUrl!}
          isTaskOrSubTask={isTaskOrSubTask}
          setIsTaskOrSubTask={setIsTaskOrSubTask}
        />
      )}
      {activeTab === "Timeline" && (
        <Timeline
          projectId={idFromUrl!}
          sprint={sprint}
          email={email!}
          assignedTo={assignedTo}
          priority={priority}
          isTaskOrSubTask={isTaskOrSubTask}
        />
      )}
      {activeTab === "Table" && (
        <TableView
          projectId={idFromUrl!}
          sprint={sprint}
          assignedTo={assignedTo}
          priority={priority}
          isTaskOrSubTask={isTaskOrSubTask}
          openViewOnly={false}
        />
      )}
      {activeTab === "Calendar" && (
        <MyCalendar
          projectId={idFromUrl!}
          sprint={sprint}
          email={email!}
          assignedTo={assignedTo}
          priority={priority}
          isTaskOrSubTask={isTaskOrSubTask}
        />
      )}
      {activeTab === "User Workload" && (
        <UserWorkload
          projectId={idFromUrl!}
          sprint={sprint}
          email={email!}
          assignedTo={assignedTo}
          priority={priority}
          isTaskOrSubTask={isTaskOrSubTask}
        />
      )}
    </div>
  );
};

export default Project;
