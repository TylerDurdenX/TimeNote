import React, { useRef, useState } from "react";
import {
  EllipsisVertical,
  History,
  MessageSquareMore,
  Plus,
  PlusSquare,
} from "lucide-react";
import { Task as TaskType } from "@/store/interfaces";
import { useGetTaskQuery } from "@/store/api";
import Comments from "./Comments";

type Props = {
  taskId: number;
  email: string;
};

const TaskPage = ({ taskId, email }: Props) => {
  const [subTasks, setSubTasks] = useState<string[]>([]); // Store subtasks
  const [comments, setComments] = useState<string[]>([]); // Store comments
  const [newSubtask, setNewSubtask] = useState<string>(""); // Store the new subtask input
  const [newComment, setNewComment] = useState<string>(""); // Store the new comment input
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  // Handle subtask addition
  const handleAddSubtask = () => {
    if (newSubtask.trim() !== "") {
      setSubTasks([...subTasks, newSubtask]);
      setNewSubtask("");
    }
  };

  // Handle comment addition
  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      setComments([...comments, newComment]);
      setNewComment("");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0"); // Get day and pad with leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month (zero-indexed, so add 1)
    const year = date.getFullYear(); // Get full year

    return `${day}/${month}/${year}`;
  };

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

  const { data: task, isLoading, error } = useGetTaskQuery({ taskId });

  const taskTagsSplit = task?.tags ? task.tags.split(",") : [];

  return (
    <div className="w-[80vw] max-h-[90vh] overflow-y-auto mx-auto p-6 bg-white rounded-xl shadow-lg space-y-6 dark:bg-gray-800 dark:text-white">
      {/* Task Title and Description */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">{task?.title}</h1>
        </div>

        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <div className="text-sm">
            <span>
              {formatDate(task?.startDate!)} - {formatDate(task?.dueDate!)}
            </span>
          </div>

          <div className="text-sm">
            <span>Task Points: {task?.points}</span>
          </div>

          <div className="text-sm">
            <span className="ml-auto text-gray-500 dark:text-gray-300">
              Author: {task?.author?.username}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Tags:</span>
            {task?.priority && <PriorityTag priority={task.priority} />}
            <div
              className="flex flex-wrap items-center gap-2"
              ref={containerRef}
            >
              {/* Render only the visible tags */}
              {taskTagsSplit
                .slice(0, taskTagsSplit.length)
                .map((tag, index) => (
                  <div
                    key={tag}
                    ref={index === 0 ? tagRef : null} // Attach ref to the first tag for measuring width
                    className="rounded-full bg-blue-100 px-2 py-1 text-xs"
                  >
                    {tag}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300">{task?.description}</p>
      </div>

      {/* Attachments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Attachments</h2>
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-gray-500">📎</span>
                </div>
                <span className="text-gray-800 dark:text-gray-100">
                  Attachment 1.pdf
                </span>
              </div>
              <button className="text-blue-600 hover:text-blue-800">
                Delete
              </button>
            </div>
          </div>
          <div className="mt-4">
            <button className="text-blue-600 hover:text-blue-800">
              + Add Attachment
            </button>
          </div>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="space-y-4">
      <div className="flex justify-between items-center">
  <h2 className="text-xl font-semibold">Subtasks</h2>
  <button className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-500">
    <PlusSquare className="h-5 w-5 mr-2" />
    Add Subtasks
  </button>
</div>

        {/* Line separator under Subtasks heading */}
        <div className="mt-2 border-t-2 border-gray-300 dark:border-gray-600"></div>
        <div className="flex items-center justify-between mt-4">
        
        </div>

        <div className="mt-4 space-y-2">
          {subTasks.length > 0 ? (
            subTasks.map((subtask, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  {subtask}
                </span>
                <button className="text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              No subtasks available.
            </span>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Comments</h2>
        {/* Line separator under Comments heading */}
        <div className="mt-2 border-t-2 border-gray-300 dark:border-gray-600"></div>
        <div className="border-2 border-gray-300 p-4 rounded-lg dark:border-gray-600">
          <div className="mt-4 space-y-3">
            <Comments taskId={taskId} email={email} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
