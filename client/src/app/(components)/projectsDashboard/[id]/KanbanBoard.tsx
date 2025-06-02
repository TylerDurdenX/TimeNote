"use client";

import {
  useCloseTaskMutation,
  useCreateTaskMutation,
  useGetProjectTasksQuery,
  useGetProjectUsersQuery,
  useGetSprintQuery,
  useUpdateSubTaskStatusMutation,
  useUpdateTaskAssigneeMutation,
  useUpdateTaskStatusMutation,
} from "../../../../store/api";
import React, { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/store/interfaces";
import { toast } from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EllipsisVertical,
  History,
  MessageSquareMore,
  PlusSquare,
  Clock,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogTitle } from "@mui/material";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Comments from "./Comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/components/Sidebar/nav-user";
import TaskPage from "./TaskPage";
import TaskHistory from "./History";
import { useSearchParams } from "next/navigation";
import SubTaskPage from "./(SubTask)/SubTaskPage";
import SubTaskComment from "./(SubTask)/SubTaskComments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import BulkCreate from "./[taskId]/BulkCreate";
import CircularLoading from "@/components/Sidebar/loading";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  email: string;
  priority: string;
  setPriority: (priorityName: string) => void;
  assignedTo: string;
  setAssignedTo: (assignedTo: string) => void;
  sprint: string;
  projectId: string;
  isTaskOrSubTask: string;
  setIsTaskOrSubTask: (isTask: string) => void;
};

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({
  id,
  email,
  priority,
  assignedTo,
  sprint,
  projectId,
  isTaskOrSubTask,
  setIsTaskOrSubTask,
}: BoardProps) => {
  const userEmail = useSearchParams().get("email");
  const [page, setPage] = useState(1);
  const [tasks, setTasks] = useState<any[]>([]);

  localStorage.removeItem("persist:root");
  localStorage.removeItem("ally-supports-cache");

  const {
    data: tasksList,
    isLoading,
    error,
    refetch,
  } = useGetProjectTasksQuery(
    {
      projectId: id,
      sprint,
      assignedTo,
      priority,
      isTaskOrSubTask,
      email: userEmail!,
      page: page,
      limit: 9999999,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [hasMore, setHasMore] = useState(tasksList?.hasmore);

  useEffect(() => {
    if (tasksList) {
      // Append the new tasks to the existing ones
      if (hasMore === true) {
        setTasks((prevTasks) => {
          const allTasks = [...prevTasks, ...tasksList.tasks];

          // Remove duplicates based on 'id'
          const uniqueTasks = allTasks.filter(
            (task, index, self) =>
              index === self.findIndex((t) => t.id === task.id)
          );

          return uniqueTasks;
        });
      } else {
        setTasks(tasksList.tasks);
      }
    }
  }, [tasksList, priority, assignedTo, sprint, isTaskOrSubTask]);

  useEffect(() => {
    setPage(1);
    setHasMore(tasksList?.hasmore);
  }, [sprint, assignedTo, priority, isTaskOrSubTask]);

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateSubTaskStatus] = useUpdateSubTaskStatusMutation();

  const moveTask = async (taskId: number, toStatus: string, item: any) => {
    try {
      if (sessionStorage.getItem("isTask") === "1") {
        const response = await updateTaskStatus({
          taskId,
          status: toStatus,
          email: email,
        });
        if (
          // @ts-ignore
          response.error?.data.status === "Error" ||
          // @ts-ignore
          response.error?.data.status === "Fail"
        ) {
          // @ts-ignore
          toast.error(response.error?.data.message);
        } else {
          toast.success(response.data?.message!);
        }
      } else {
        const obj = {
          subTaskId: taskId,
          subTaskStatus: toStatus,
          email: email!,
        };
        const response = await updateSubTaskStatus(obj);
        if (
          // @ts-ignore
          response.error?.data.status === "Error" ||
          // @ts-ignore
          response.error?.data.status === "Fail"
        ) {
          // @ts-ignore
          toast.error(response.error?.data.message);
        } else {
          toast.success(response.data?.message!);
        }
      }
    } catch (err) {
      toast.error("Some Error occurred, please try again later");
    }
  };

  const handleClick = () => {
    if (tasksList?.hasmore) {
      setHasMore(tasksList?.hasmore);
      setPage(page + 1);
    } else {
      toast.error("no more tasks to load");
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <CircularLoading />
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg p-8">
        <div className="text-center">
          <div className="text-lg font-semibold mb-2">Error Loading Tasks</div>
          <div className="text-sm opacity-80">
            An error occurred while fetching tasks. Please try again.
          </div>
        </div>
      </div>
    );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 xl:grid-cols-4 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800 min-h-screen">
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks || []}
            moveTask={moveTask}
            id={id}
            email={email}
            projectId={projectId}
            isTaskOrSubTask={isTaskOrSubTask}
          />
        ))}
      </div>
      {tasksList?.hasmore ? (
        <>
          <div className="flex items-center w-full my-8 px-6">
            <hr className="flex-grow border-gray-300 dark:border-gray-600" />
            <button
              onClick={handleClick}
              className="mx-6 px-6 py-2 text-gray-600 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 font-medium"
            >
              Load More Tasks
            </button>
            <hr className="flex-grow border-gray-300 dark:border-gray-600" />
          </div>
        </>
      ) : (
        ""
      )}
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: string, item: any) => void;
  id: string;
  email: string;
  projectId: string;
  isTaskOrSubTask: string;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  id,
  email,
  projectId,
  isTaskOrSubTask,
}: TaskColumnProps) => {
  localStorage.removeItem("persist:root");
  localStorage.removeItem("ally-supports-cache");

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status, item),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  const tasksCount = Array.isArray(tasks)
    ? tasks.filter((task) => task.status === status).length
    : 0;

  const statusConfig: any = {
    "To Do": {
      color: "#3B82F6",
      bgColor: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50 dark:bg-blue-900/20",
    },
    "Work In Progress": {
      color: "#10B981",
      bgColor: "from-emerald-500 to-emerald-600",
      lightBg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    "Under Review": {
      color: "#F59E0B",
      bgColor: "from-amber-500 to-amber-600",
      lightBg: "bg-amber-50 dark:bg-amber-900/20",
    },
    Completed: {
      color: "#6B7280",
      bgColor: "from-gray-500 to-gray-600",
      lightBg: "bg-gray-50 dark:bg-gray-900/20",
    },
  };

  const [taskName, setTaskName] = useState("");
  const [taskStatus, setTaskStatus] = useState("To Do");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("");
  const [taskTags, setTaskTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taskPoints, setTaskPoints] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [createTask, { isLoading: isLoadingCreateTask }] =
    useCreateTaskMutation();
  const [isOpen, setIsOpen] = useState(false);

  const isFormValid = () => {
    return (
      taskName &&
      taskDescription &&
      startDate &&
      dueDate &&
      sprintId &&
      taskPriority &&
      taskPoints &&
      assignedUserId
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = {
      title: taskName,
      description: taskDescription,
      status: taskStatus,
      priority: taskPriority,
      points: taskPoints,
      startDate: startDate,
      dueDate: dueDate,
      tags: taskTags,
      assignedUserId: assignedUserId,
      authorUserId: email,
      sprintId: sprintId,
      projectId: Number(id),
    };
    try {
      const response = await createTask(formData);
      setTaskName("");
      setTaskDescription("");
      setTaskPriority("");
      setTaskTags("");
      setStartDate("");
      setDueDate("");
      setTaskPoints("");
      setAssignedUserId("");
      setSprintId("");

      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        // @ts-ignore
        toast.success(response.data?.message);
      }
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9_\s]*$/;

    if (regex.test(value)) {
      setTaskName(value);
    } else {
      toast.error(
        "Invalid character! Only letters, numbers, and underscores are allowed."
      );
    }
  };

  const { data } = useGetProjectUsersQuery(
    { projectId: id },
    { refetchOnMountOrArgChange: true }
  );
  const { data: sprintData } = useGetSprintQuery(
    { projectId: projectId },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`h-fit transition-all duration-300 ${
        isOver
          ? `${statusConfig[status].lightBg} scale-[1.02] shadow-lg`
          : "bg-white/80 dark:bg-gray-800/80"
      } backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm`}
    >
      {/* Column Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full bg-gradient-to-r ${statusConfig[status].bgColor} shadow-sm`}
            />
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {status}
            </h3>
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 text-sm font-semibold text-gray-600 dark:text-gray-300">
              {tasksCount}
            </div>
          </div>

          {status === "To Do" && isTaskOrSubTask === "Task" && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">
                  <PlusSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Create Task</span>
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[60vw] lg:max-w-[70vw] max-h-[85vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-0 shadow-2xl">
                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <DialogTitle className="font-bold text-xl text-gray-800 dark:text-gray-100">
                    Create New Task
                  </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="Manual" className="w-full overflow-auto">
                  <TabsList className="grid grid-cols-2 w-full max-w-md h-12 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <TabsTrigger
                      value="Manual"
                      className="font-semibold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                    >
                      Create Manually
                    </TabsTrigger>
                    <TabsTrigger
                      value="Upload"
                      className="font-semibold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                    >
                      Upload Excel
                    </TabsTrigger>
                  </TabsList>

                  <div className="my-4 border-t border-gray-200 dark:border-gray-700"></div>

                  <TabsContent value="Manual" className="w-full overflow-auto">
                    <div
                      className="relative w-full h-full overflow-auto"
                      style={{ paddingTop: "42.575%" }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full">
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Task Name{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  value={taskName}
                                  onChange={handleChange}
                                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Priority{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={taskPriority}
                                  onValueChange={setTaskPriority}
                                >
                                  <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-lg">
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    <SelectGroup>
                                      <SelectLabel>Priority</SelectLabel>
                                      <SelectItem value="Urgent">
                                        🔴 Urgent
                                      </SelectItem>
                                      <SelectItem value="High">
                                        🟠 High
                                      </SelectItem>
                                      <SelectItem value="Medium">
                                        🟡 Medium
                                      </SelectItem>
                                      <SelectItem value="Low">
                                        🟢 Low
                                      </SelectItem>
                                      <SelectItem value="Backlog">
                                        ⚪ Backlog
                                      </SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Description{" "}
                                <span className="text-red-500">*</span>
                              </Label>
                              <textarea
                                value={taskDescription}
                                onChange={(e) =>
                                  setTaskDescription(e.target.value)
                                }
                                className="w-full min-h-[100px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                required
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Estimated Hours{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  placeholder="Enter hours"
                                  value={taskPoints}
                                  onChange={(e) =>
                                    setTaskPoints(e.target.value)
                                  }
                                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Tags
                                </Label>
                                <Input
                                  placeholder="Comma separated values"
                                  value={taskTags}
                                  onChange={(e) => setTaskTags(e.target.value)}
                                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Start Date{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  type="date"
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Due Date{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  type="date"
                                  value={dueDate}
                                  onChange={(e) => setDueDate(e.target.value)}
                                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Assignee{" "}
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={assignedUserId}
                                  onValueChange={setAssignedUserId}
                                >
                                  <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-lg">
                                    <SelectValue placeholder="Select assignee" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    <SelectGroup>
                                      <SelectLabel>Team Members</SelectLabel>
                                      {data?.map((user) => (
                                        <SelectItem
                                          key={user.username}
                                          value={String(user.userId)}
                                        >
                                          {user.username}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  Sprint <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={sprintId}
                                  onValueChange={setSprintId}
                                >
                                  <SelectTrigger className="border-gray-300 dark:border-gray-600 focus:border-blue-500 rounded-lg">
                                    <SelectValue placeholder="Select sprint" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    <SelectGroup>
                                      {sprintData?.map((sprint) => (
                                        <SelectItem
                                          key={sprint.title}
                                          value={String(sprint.id)}
                                        >
                                          {sprint.title}
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>

                          <DialogFooter className="pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                              type="submit"
                              className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                                !isFormValid() || isLoadingCreateTask
                                  ? "cursor-not-allowed opacity-50 transform-none"
                                  : ""
                              }`}
                              disabled={!isFormValid() || isLoadingCreateTask}
                            >
                              {isLoadingCreateTask
                                ? "Creating..."
                                : "Create Task"}
                            </button>
                          </DialogFooter>
                        </form>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="Upload" className="overflow-auto">
                    <Card className="border-0 shadow-sm bg-gray-50 dark:bg-gray-800/50">
                      <CardHeader>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          Bulk Create Tasks from Excel
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <BulkCreate
                          sprintList={sprintData!}
                          email={email}
                          projectId={Number(projectId)}
                          setIsOpen={setIsOpen}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tasks Container */}
      <div className="px-6 pb-6 space-y-4 min-h-[200px]">
        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <Task
              key={task.id}
              task={task}
              email={email}
              projectId={id}
              isTaskOrSubTask={isTaskOrSubTask}
            />
          ))}
      </div>
    </div>
  );
};

type TaskProps = {
  task: TaskType;
  email: string;
  projectId: string;
  isTaskOrSubTask: string;
};

const Task = ({ task, email, projectId, isTaskOrSubTask }: TaskProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const taskTagsSplit = task.tags
    ? task.tags.split(",").filter((tag) => tag.trim() !== "")
    : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  localStorage.removeItem("persist:root");
  localStorage.removeItem("ally-supports-cache");

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [closeCompletedTask] = useCloseTaskMutation();
  const [updateTaskAssignee] = useUpdateTaskAssigneeMutation();

  const assignTask = async (taskId: number, email: string) => {
    try {
      const response = await updateTaskAssignee({ taskId, email });
      toast.success("Task Updated Successfully");
      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        // @ts-ignore
        toast.success(response.data?.message);
      }
    } catch (err) {
      toast.error("Some Error occurred, please try again later");
    }
  };

  const moveTaskFromDropdown = async (taskId: number, toStatus: string) => {
    try {
      const response = await updateTaskStatus({
        taskId,
        status: toStatus,
        email: email,
      });
      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        toast.success(response.data?.message!);
      }
    } catch (err) {
      toast.error("Some Error occurred, please try again later");
    }
  };

  const closeTask = async (taskId: number) => {
    try {
      const response = await closeCompletedTask({ taskId, email: email });
      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        toast.success(response.data?.message!);
      }
    } catch (err) {
      toast.error("Some Error occurred, please try again later");
    }
  };

  const numberOfComments = task.comments;

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => {
    return (
      <div
        className={`rounded-full px-2 py-1 text-xs font-semibold ${
          priority === "Urgent"
            ? "bg-red-200 text-red-700"
            : priority === "High"
            ? "bg-orange-200 text-orange-700"
            : priority === "Medium"
            ? "bg-yellow-200 text-yellow-700"
            : priority === "Low"
            ? "bg-green-200 text-green-700"
            : "bg-blue-200 text-blue-700"
        }`}
      >
        {priority}
      </div>
    );
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const [overflowCount, setOverflowCount] = useState(0);
  const [tagWidth, setTagWidth] = useState(0);

  useEffect(() => {
    if (tagRef.current) {
      setTagWidth(tagRef.current.offsetWidth);
    }
  }, [taskTagsSplit]);

  useEffect(() => {
    if (containerRef.current && tagWidth > 0) {
      const containerWidth = containerRef.current.offsetWidth;
      const visibleTags = Math.floor(containerWidth / tagWidth);

      if (taskTagsSplit.length > visibleTags) {
        setOverflowCount(taskTagsSplit.length - visibleTags);
      } else {
        setOverflowCount(0);
      }
    }
  }, [taskTagsSplit, tagWidth]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <Dialog>
      <div
        ref={(instance) => {
          drag(instance);
        }}
        className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${
          isDragging ? "opacity-60" : "opacity-100"
        }`}
      >
        <div className="p-4 md:p-6">
          {isTaskOrSubTask === "Task" ? (
            <>
              <div className="flex items-start justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  {task.priority && <PriorityTag priority={task.priority} />}
                  <div
                    className="flex flex-1 flex-wrap items-center gap-2"
                    ref={containerRef}
                  >
                    {taskTagsSplit
                      .slice(0, taskTagsSplit.length - overflowCount)
                      .map((tag, index) => (
                        <div
                          key={tag}
                          ref={index === 0 ? tagRef : null}
                          className="rounded-full bg-blue-100 px-2 py-1 text-xs dark:text-black"
                        >
                          {tag}
                        </div>
                      ))}

                    {overflowCount > 0 && (
                      <div
                        key="more-tags"
                        className="rounded-full bg-blue-100 px-2 py-1 text-xs text-gray-500"
                      >
                        +{overflowCount}
                      </div>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-neutral-500">
                    <EllipsisVertical size={26} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        assignTask(task.id, email);
                      }}
                    >
                      Assign To Me
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Move Task To :</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        moveTaskFromDropdown(task.id, "To Do");
                      }}
                    >
                      To Do
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        moveTaskFromDropdown(task.id, "Work In Progress");
                      }}
                    >
                      Work In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        moveTaskFromDropdown(task.id, "Under Review");
                      }}
                    >
                      Under Review
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        moveTaskFromDropdown(task.id, "Completed");
                      }}
                    >
                      Completed
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        closeTask(task.id);
                      }}
                    >
                      Close Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            ""
          )}
          <Dialog>
            <div className="my-3 flex justify-between">
              <DialogTrigger asChild>
                <button>
                  <h4 className="mext-md font-bold text-blue-900 dark:text-white underline">
                    {task.title}
                  </h4>
                </button>
              </DialogTrigger>
              {typeof task.points === "number" && (
                <div className="text-xs font-semibold dark:text-white">
                  {task.points} hrs
                </div>
              )}
            </div>
            <DialogContent className="max-w-[85vw] mt-5 mb-5 overflow-y-auto">
              {isTaskOrSubTask === "Task" ? (
                <TaskPage
                  taskId={task.id}
                  email={email}
                  projectId={projectId}
                />
              ) : (
                <SubTaskPage
                  subTaskId={task.id}
                  email={email}
                  projectId={projectId}
                />
              )}
            </DialogContent>
          </Dialog>
          <div className="text-xs text-gray-500 dark:text-white">
            {formattedStartDate && <span>{formattedStartDate} - </span>}
            {formattedDueDate && <span>{formattedDueDate}</span>}
          </div>
          <p className="text-sm text-gray-600 line-clamp-5 dark:text-white">
            {task.description}
          </p>

          <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />
          {/* Users */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex space-x-[6px] overflow-hidden">
              {task.assignee && (
                <Avatar className="h-8 w-8 rounded-full border-white object-cover dark:border-dark-secondary">
                  {/* {task.assignee?.profilePicture?.base64 ? (
                  <AvatarImage
                    src={task.assignee.profilePicture.base64}
                    alt={task.assignee.username}
                  />
                ) : (
                  <AvatarFallback className="rounded-lg">
                    {getInitials(task.assignee.username!)}
                  </AvatarFallback>
                )} */}
                  <AvatarFallback className="rounded-lg">
                    {getInitials(task.assignee.username!)}
                  </AvatarFallback>
                </Avatar>
              )}
              {task.assignee && (
                <Label className="text-center mt-3 ml-1">
                  {task.assignee.username}
                </Label>
              )}
            </div>
            <div className="flex items-center text-gray-500 dark:text-neutral-500">
              <div className="pr-3 mt-2">
                {" "}
                <Dialog>
                  <DialogTrigger asChild>
                    {isTaskOrSubTask === "Task" ? (
                      <button>
                        <History size={20} className="dark:text-white" />
                      </button>
                    ) : (
                      ""
                    )}
                  </DialogTrigger>
                  <DialogContent className="max-w-[80vw] overflow-y-auto ">
                    <DialogHeader>
                      <DialogTitle>Task History</DialogTitle>
                      <DialogDescription className="ml-7">
                        {" "}
                        Current Status:
                        <span
                          className="inline-flex rounded-full px-2 text-xs ml-1 font-semibold leading-5"
                          style={{
                            backgroundColor:
                              task.status === "To Do"
                                ? "#2563EB"
                                : task.status === "Work In Progress"
                                ? "#059669"
                                : task.status === "UnderReview"
                                ? "#D97706"
                                : task.status === "Completed"
                                ? "#000000"
                                : "#E5E7EB",
                            color:
                              task.status === "To Do" ||
                              task.status === "Work In Progress" ||
                              task.status === "UnderReview" ||
                              task.status === "Completed"
                                ? "#ffffff"
                                : "#000000",
                          }}
                        >
                          {task.status}
                        </span>
                      </DialogDescription>
                      <DialogDescription className="ml-7">
                        {" "}
                        Task Duration: {formatDate(task.startDate || "")} -{" "}
                        {formatDate(task.dueDate || "")}
                      </DialogDescription>
                      <DialogDescription className="ml-7">
                        {" "}
                        Estimated Hours: {task.points || ""}
                      </DialogDescription>
                    </DialogHeader>
                    <TaskHistory
                      taskId={task.id}
                      estimatedHours={String(task.points)}
                      fullPageFlag={false}
                    />
                    <DialogFooter className="text-gray-600">
                      All numbers are in hours except total time
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button>
                    <MessageSquareMore size={20} className="dark:text-white" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-[40vw] overflow-y-auto max-h-[85vh]">
                  <DialogHeader>
                    <DialogTitle>Comments </DialogTitle>
                  </DialogHeader>
                  {isTaskOrSubTask === "Task" ? (
                    <Comments
                      email={email}
                      taskId={task.id}
                      taskCode={task.code}
                    />
                  ) : (
                    <SubTaskComment email={email} subTaskId={task.id} />
                  )}
                </DialogContent>
              </Dialog>
              <span className="ml-1 text-sm dark:text-white">
                {numberOfComments}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default BoardView;
