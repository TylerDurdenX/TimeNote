import {
  useCloseTaskMutation,
  useCreateTaskMutation,
  useGetProjectTasksQuery,
  useGetProjectUsersQuery,
  useGetSprintQuery,
  useUpdateTaskAssigneeMutation,
  useUpdateTaskStatusMutation,
} from "../../../../store/api";
import React, { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/store/interfaces";
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
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";
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
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Comments from "./Comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/components/Sidebar/nav-user";
import TaskPage from "./TaskPage";
import { Separator } from "@/components/ui/separator";

type BoardProps = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  email: string;
  priority: string
  setPriority: (priorityName: string) => void
  assignedTo: string
  setAssignedTo: (assignedTo: string) => void
  sprint: string
  projectId: string
};

const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];

const BoardView = ({ id, email , priority, assignedTo, sprint, projectId}: BoardProps) => {

  const {
    data: tasks,
    isLoading,
    error,
  } = useGetProjectTasksQuery({ projectId: id , sprint, assignedTo, priority});

  const [updateTaskStatus, response] = useUpdateTaskStatusMutation();

  const moveTask = async(taskId: number, toStatus: string) => {
    try {
      const response = await updateTaskStatus({ taskId, status: toStatus , email: email});
       // @ts-ignore
      if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
                      // @ts-ignore
                      toast.error(response.error?.data.message)
                    }else{
                      toast.success(response.data?.message);
                    }
    } catch (err) {
      toast.error("Some Error occurred, please try again later");
    }
  };

  localStorage.removeItem("persist:root");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        {taskStatus.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasks || []}
            moveTask={moveTask}
            id={id}
            email={email}
            projectId={projectId}
          />
        ))}
      </div>
    </DndProvider>
  );
};

type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: string) => void;
  id: string;
  email: string;
  projectId: string
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  id,
  email,
  projectId
}: TaskColumnProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  const tasksCount = tasks.filter((task) => task.status === status).length;

  const statusColor: any = {
    "To Do": "#2563EB",
    "Work In Progress": "#059669",
    "Under Review": "#D97706",
    Completed: "#000000",
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
    return taskName && taskDescription && startDate && dueDate && sprintId && taskPriority;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the form data to submit
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
      const response = createTask(formData);
      setTaskName('')
      setTaskDescription('')
      setTaskPriority('')
      setTaskTags('')
      setStartDate('')
      setDueDate('')
      setTaskPoints('')
      setAssignedUserId('')
      setSprintId('')
      toast.success("Task Created Successfully");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  const { data, isLoading, error } = useGetProjectUsersQuery({ projectId: id });
  const {data : sprintData, isLoading : sprintLoading, isError} = useGetSprintQuery({projectId: projectId })
  

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`sl-py-2 rounded-sm py-1 xl:px-1 ${
        isOver ? "bg-blue-100 dark:bg-neutral-950" : ""
      }`}
    >
      <div className="mb-3 flex w-full">
        <div
          className={`w-2 !bg-[${statusColor[status]}] rounded-s-lg`}
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {status}{" "}
            <span
              className="ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-tertiary"
              style={{ width: "1.3rem", height: "1.3rem " }}
            >
              {tasksCount}
            </span>
          </h3>
          <div className="flex items-center gap-1">
            {status === "To Do" ? (
              <>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <button className="flex h-6 w-6 items-center justfy-center rounded bg-gray-200 dark:bg-dark-tertiary dark:text-white">
                      <Plus size={24} className="" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[50vw] lg:max-w-[60vw] max-h-[29vw]">
                    <DialogHeader>
                      <DialogTitle className="mb-1">Create Task</DialogTitle>
                    </DialogHeader>

                    <div
                      className="relative w-full h-full overflow-hidden"
                      style={{
                        paddingTop: "42.575%",
                      }}
                      >
                      <div className="absolute top-0 left-0 w-[calc(100%)] h-[calc(100%)]">
                        <form onSubmit={handleSubmit}>
                          <div className="grid gap-4 py-1">
                            <div className="grid grid-cols-8 items-center gap-4 mr-1">
                              <Label className="text-center">Task Name</Label>
                              <Input
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)}
                                className="col-span-7"
                                required
                              />
                              <Label className="text-center">Description</Label>
                              <textarea
                                value={taskDescription}
                                onChange={(e) =>
                                  setTaskDescription(e.target.value)
                                }
                                className="col-span-7 shadow border"
                              />

                              <Label className="text-center">Priority</Label>
                              <Select
                                value={taskPriority}
                                onValueChange={(value) =>
                                  setTaskPriority(value)
                                }
                              >
                                <SelectTrigger className="col-span-3 p-2 border rounded-md">
                                  <SelectValue placeholder="Select a priority" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Priority</SelectLabel>
                                    <SelectItem value="Urgent">
                                      Urgent
                                    </SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">
                                      Medium
                                    </SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Backlog">
                                      Backlog
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <Label className="text-center">Points</Label>
                              <Input
                                placeholder="Please enter a number"
                                value={taskPoints}
                                onChange={(e) => setTaskPoints(e.target.value)}
                                className="col-span-3"
                              />

                              <Label className="text-center">Start Date</Label>
                              <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="col-span-3"
                              />
                              <Label className="text-center">Due Date</Label>
                              <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="col-span-3"
                              />

                              <Label className="text-center">Tags</Label>
                              <Input
                                placeholder="Please enter comma separated values"
                                value={taskTags}
                                onChange={(e) => setTaskTags(e.target.value)}
                                className="col-span-3"
                              />
                              <Label className="text-center">Assignee</Label>
                              <Select
                                value={assignedUserId}
                                onValueChange={(value) =>
                                  setAssignedUserId(value)
                                }
                              >
                                <SelectTrigger className="col-span-3 p-2 border rounded-md">
                                  <SelectValue placeholder="Select assignee" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Assignee</SelectLabel>
                                    {data?.map((user) => (
                                      <SelectItem
                                        key={user.username}
                                        value={String(user.userId)!}
                                      >
                                        {user.username}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <Label className="text-center">Sprint</Label>
                              <Select
                                value={sprintId}
                                onValueChange={(value) =>
                                  setSprintId(value)
                                }
                              >
                                <SelectTrigger className="col-span-3 p-2 border rounded-md">
                                  <SelectValue placeholder="Select sprint" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    
                                    {sprintData?.map((sprint) => (
                                      <SelectItem
                                        key={sprint.title}
                                        value={String(sprint.id)!}
                                      >
                                        {sprint.title}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <button
                              type="submit"
                              className={`flex w-200px mt-4 justify-center bg-blue-600 rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
                                hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
                                  !isFormValid() || isLoadingCreateTask
                                    ? "cursor-not-allowed opacity-50"
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
                    <DialogFooter className="w-full justify-between items-center">
                      <div className="absolute flex gap-4 left-10"></div>
                      <div className="flex items-center space-x-2"></div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
      {tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <Task key={task.id} task={task} email={email} projectId={id} />
        ))}
    </div>
  );
};

type TaskProps = {
  task: TaskType;
  email: string;
  projectId: string;
};

const Task = ({ task, email, projectId }: TaskProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const taskTagsSplit = task.tags ? task.tags.split(",") : [];

  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedDueDate = task.dueDate
    ? format(new Date(task.dueDate), "P")
    : "";

  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [closeCompletedTask] = useCloseTaskMutation();
  const [updateTaskAssignee] = useUpdateTaskAssigneeMutation();

  const assignTask = (taskId: number, email: string) => {
    try {
      updateTaskAssignee({ taskId, email });
      toast.success("Task status updated successfully");
    } catch (err) {
      toast.error("Some Error occurred, please try again later");
    }
  };

  const moveTaskFromDropdown = async(taskId: number, toStatus: string) => {
    try {
      const response = await updateTaskStatus({ taskId, status: toStatus , email: email});
       // @ts-ignore
      if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
                      // @ts-ignore
                      toast.error(response.error?.data.message)
                    }else{
                      toast.success(response.data?.message);
                    }
    } catch (err) {
      toast.error("Some Error occurred, please try again later");
    }
  };

  const closeTask = async(taskId: number) => {
    try {
      const response = await closeCompletedTask({ taskId, email: email});
       // @ts-ignore
      if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
                      // @ts-ignore
                      toast.error(response.error?.data.message)
                    }else{
                      toast.success(response.data?.message);
                    }
    } catch (err) {
      toast.error("Some Error occurred, please try again later");
    }
  };

  const numberOfComments = (task.comments && task.comments.length) || 0;

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
    // Wait for the component to be rendered, then measure the width of one tag
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
          <div className="flex items-start justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {task.priority && <PriorityTag priority={task.priority} />}
              <div
                className="flex flex-1 flex-wrap items-center gap-2"
                ref={containerRef}
              >
                {/* Render only the visible tags */}
                {taskTagsSplit
                  .slice(0, taskTagsSplit.length - overflowCount)
                  .map((tag, index) => (
                    <div
                      key={tag}
                      ref={index === 0 ? tagRef : null} // Attach ref to the first tag for measuring width
                      className="rounded-full bg-blue-100 px-2 py-1 text-xs"
                    >
                      {tag}
                    </div>
                  ))}

                {/* Show the "+X" tag if there are any overflowed tags */}
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
                  {task.points} pts
                </div>
              )}
            </div>
            <DialogContent className="max-w-[85vw] mt-5 mb-5 overflow-y-auto">
              <TaskPage taskId= {task.id} email={email} projectId={projectId}/>
            </DialogContent>
          </Dialog>
          <div className="text-xs text-gray-500 dark:text-neutral-500">
            {formattedStartDate && <span>{formattedStartDate} - </span>}
            {formattedDueDate && <span>{formattedDueDate}</span>}
          </div>
          <p className="text-sm text-gray-600 dark:text-neutral-500 line-clamp-5">
           {task.description}
          </p>

          <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />
          {/* Users */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex space-x-[6px] overflow-hidden">
              {task.assignee && (
                <Avatar className="h-8 w-8 rounded-full border-white object-cover dark:border-dark-secondary">
                {/* Check if base64 and profilePicture exist before accessing */}
                {task.assignee?.profilePicture?.base64 ? (
                  <AvatarImage
                    src={task.assignee.profilePicture.base64}
                    alt={task.assignee.username}
                  />
                ) : (
                  <AvatarFallback className="rounded-lg">
                    {getInitials(task.assignee.username!)} {/* Ensure username is not null/undefined */}
                  </AvatarFallback>
                )}
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
                    <button>
                      <History size={20} className="" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>History </DialogTitle>
                      <DialogDescription>Activity trail</DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button>
                    <MessageSquareMore size={20} />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-[40vw] max-h-[40vw] overflow-y-auto ">
                  <DialogHeader>
                    <DialogTitle>Comments </DialogTitle>
                  </DialogHeader>
                  <Comments email={email} taskId={task.id}/>
                </DialogContent>
              </Dialog>
              <span className="ml-1 text-sm dark:text-neutral-400">
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
