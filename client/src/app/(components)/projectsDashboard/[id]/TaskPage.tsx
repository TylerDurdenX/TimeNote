import React, { useEffect, useRef, useState } from "react";
import {
  PlusSquare,
  Pencil,
  Download,
  Maximize2,
  Clock,
  Timer,
} from "lucide-react";
import { SubTask, Task as TaskType } from "@/store/interfaces";
import {
  useCreateSubTaskMutation,
  useDeleteAttachmentMutation,
  useDownloadAttachmentMutation,
  useGetProjectUsersQuery,
  useGetTaskQuery,
  useUpdateTaskMutation,
  useUpdateTaskProgressMutation,
  useUploadAttachmentMutation,
} from "@/store/api";
import Comments from "./Comments";
import { Toaster, toast } from "react-hot-toast";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import SubTaskTable from "./(SubTask)/SubTaskTable";
import Link from "next/link";
import CircularLoading from "@/components/Sidebar/loading";
import ErrorDialog from "@/app/ErrorDialog";
import { useSearchParams } from "next/navigation";

type Props = {
  taskId: number;
  email: string;
  projectId: string;
};

const TaskPage = ({ taskId, email, projectId }: Props) => {
  localStorage.removeItem("persist:root");

  const {
    data: task,
    isLoading,
    error,
  } = useGetTaskQuery({ taskId }, { refetchOnMountOrArgChange: true });

  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [isLoadingSubTasks, setIsLoadingSubTasks] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

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

  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: () => null, // Prevent reading
      setItem: () => {}, // Prevent setting values
      removeItem: () => {}, // Prevent removing items
      clear: () => {}, // Prevent clearing
    },
    writable: false,
  });

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".xls", ".xlsx"];

  const [uploadAttachment, { isLoading: isLoadingUploadAttachment }] =
    useUploadAttachmentMutation();
  const [uploadProgress, setUploadProgress] = useState(0);

  const [deleteAttachmentQuery, { isLoading: isLoadingDeleteAttachment }] =
    useDeleteAttachmentMutation();

  const [downloadAttachmentQuery, { isLoading: isLoadingDownloadAttachment }] =
    useDownloadAttachmentMutation();

  const maxSize = 1.5 * 1024 * 1024; // in bytes

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Read the file as a data URL
      reader.readAsDataURL(file);

      // Using the load event to resolve the Promise
      reader.onload = () => {
        resolve(reader.result as string); // Cast result to string
      };

      // Using the error event to reject the Promise
      reader.onerror = (error) => {
        reject(new Error("Error converting file to base64"));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension && !allowedExtensions.includes(`.${fileExtension}`)) {
        toast.error("File extension not allowed!");
      } else if (file.size > maxSize) {
        toast.error("File size must be less than 1.5 MB!");
      } else {
        const base64String = await fileToBase64(file);
        const uploadAttachmentBody = {
          taskId: taskId,
          fileBase64: base64String,
          fileName: file.name,
          uploadedBy: email,
        };
        try {
          const response = await uploadAttachment(uploadAttachmentBody);
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
        } catch (err: any) {
          toast.error(err.data.message);
          console.error("Error creating role:", err.data.Message);
        }
      }
    }
  };

  const deleteAttachment = async () => {
    try {
      const response = await deleteAttachmentQuery({
        taskId,
        isSubTask: false,
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
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  function downloadFile(base64String: string, fileName: string) {
    const base64Data = base64String.startsWith("data:")
      ? base64String.split(",")[1] // Extract the part after the comma
      : base64String;
    const binaryString = atob(base64Data);
    const byteArray = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: "application/octet-stream" }); // MIME type can vary based on file type
    const fileURL = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = fileURL;
    link.download = fileName;

    link.click();

    URL.revokeObjectURL(fileURL);
  }

  const downloadAttachment = async () => {
    try {
      const response = await downloadAttachmentQuery({
        taskId,
        isSubTask: false,
      });
      downloadFile(response.data?.fileBase64!, response.data?.fileName!);
    } catch (err: any) {
      toast.error(err.data);
      console.error(err);
    }
  };

  const { data: users } = useGetProjectUsersQuery({ projectId: projectId });

  const taskTagsSplit = task?.tags
    ? task.tags.split(",").filter((tag) => tag.trim() !== "")
    : [];

  const [isEditable, setIsEditable] = useState(false);
  const [isEditableStatus, setIsEditableStatus] = useState(false);
  const [editedText, setEditedText] = useState(task?.points);
  const [isHovered, setIsHovered] = useState(false);
  const [isAssigneeEditable, setIsAssigneeEditable] = useState(false);
  const [isAssigneeHovered, setIsAssigneeHovered] = useState(false);
  const [assignee, setAssignee] = useState(task?.assignee?.username);
  const [isDescriptionEditable, setIsDescriptionEditable] = useState(false);
  const [isDescriptionHovered, setIsDescriptionHovered] = useState(false);
  const [description, setDescription] = useState(task?.description || "");
  const [taskStatus, setTaskStatus] = useState(task?.status);
  const [isStatusHovered, setIsStatusHovered] = useState(false);

  const [initialDescription, setInitialDescription] = useState(
    task?.description || ""
  );
  const [initialAssignee, setInitialAssignee] = useState(
    task?.assignee?.username || ""
  );
  const [initialPoints, setInitialPoints] = useState(task?.points || "");

  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);

  const [subTaskName, setSubTaskName] = useState("");
  const [subTtaskStatus, setSubTaskStatus] = useState("To Do");
  const [subTaskDescription, setSubTaskDescription] = useState("");
  const [subTaskStartDate, setSubTaskStartDate] = useState("");
  const [subTaskDueDate, setSubTaskDueDate] = useState("");
  const [subTaskAssignedUserId, setSubTaskAssignedUserId] = useState("");
  const [createSubTask, { isLoading: isLoadingCreateSubTask }] =
    useCreateSubTaskMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [updateTaskProgress] = useUpdateTaskProgressMutation();
  const [isProgressStarted, setIsProgressStarted] = useState(
    task?.inProgressStartTime === null ? false : true
  );

  const isFormValid = () => {
    return (
      subTaskName &&
      subTaskDescription &&
      subTaskStartDate &&
      subTaskDueDate &&
      subTaskAssignedUserId
    );
  };

  const { data, isLoading: isLoadingProjectUsers } = useGetProjectUsersQuery({
    projectId: projectId,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the form data to submit
    const formData = {
      title: subTaskName,
      description: subTaskDescription,
      status: subTtaskStatus,
      startDate: subTaskStartDate,
      dueDate: subTaskDueDate,
      assignedUserId: subTaskAssignedUserId,
      authorUserId: email,
      taskId: Number(taskId),
    };
    try {
      const response = createSubTask(formData);
      setSubTaskName("");
      setSubTaskDescription("");
      setSubTaskStartDate("");
      setSubTaskDueDate("");
      setSubTaskAssignedUserId("");
      toast.success("Task Created Successfully");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setAssignee(task?.assignee?.username || "");
      setEditedText(task?.points);
      setInitialAssignee(task?.assignee?.username || "");
      setInitialDescription(task.description || "");
      setInitialPoints(task.points || "");
      setSubTasks(task?.subTasks || []);
      setIsSaveButtonEnabled(false);
      setIsLoadingSubTasks(false);
      setIsProgressStarted(task?.inProgressStartTime === null ? false : true);
    }
  }, [task]);

  useEffect(() => {
    const isChanged =
      description !== initialDescription ||
      assignee !== initialAssignee ||
      editedText !== initialPoints;

    setIsSaveButtonEnabled(isChanged);
  }, [
    description,
    assignee,
    editedText,
    initialDescription,
    initialAssignee,
    initialPoints,
  ]);

  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleEditAssigneeClick = () => {
    setIsAssigneeEditable(true);
  };

  const handleEditDescriptionClick = () => {
    setIsDescriptionEditable(true);
  };

  const handleEditStatusClick = () => {
    setIsEditableStatus(true);
  };

  const handleBlur = () => {
    setIsEditable(false);
    setIsHovered(false);
  };

  const handleAssigneeBlur = () => {
    setIsAssigneeEditable(false);
    setIsAssigneeHovered(false);
  };

  const handleDescriptionBlur = () => {
    setIsDescriptionEditable(false);
    setIsDescriptionHovered(false);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  const [updateTask, { isLoading: isLoadingUpdateTask }] =
    useUpdateTaskMutation();

  // const handleSaveChanges = async (event: React.FormEvent) => {
  //   event.preventDefault();

  //   // Prepare the form data to submit
  //   const updateTaskData = {
  //     taskId: taskId,
  //     taskPoints: editedText,
  //     assignee: assignee,
  //     taskDescription: description,
  //   };
  //   try {
  //     const response = await updateTask(updateTaskData);
  //     // @ts-ignore
  //     if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
  //             // @ts-ignore
  //             toast.error(response.error?.data.message)
  //           }else{
  //             toast.success(response.data?.message);
  //           }
  //   } catch (err: any) {
  //     toast.error(err.data.message);
  //     console.error("Error creating role:", err.data.Message);
  //   }
  // };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTaskId, setErrorTaskId] = useState("");
  const [isTaskAssigned, setIsTaskAssigned] = useState(false);

  // Flag to conditionally render the additional button
  const [showAdditionalButton, setShowAdditionalButton] = useState(true);

  const handleOpenErrorDialog = () => {
    setIsDialogOpen(true);
    setErrorMessage("Something went wrong! Please check the error details.");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // Handler for the additional button click
  const handleAdditionalButtonClick = async () => {
    try {
      const newState = !isProgressStarted;
      const response = await updateTaskProgress({
        taskId: Number(errorTaskId),
        email: email!,
        progressStart: false,
      });
      if (response.error) {
        if ("data" in response.error) {
          const errorData = response.error.data as { message: string };
          toast.error(errorData.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      } else {
        try {
          const response = await updateTaskProgress({
            taskId: Number(task?.id),
            email: email!,
            progressStart: true,
          });
          if (response.error) {
            if ("data" in response.error) {
              const errorData = response.error.data as { message: string };
              toast.error(errorData.message);
            } else {
              toast.error("An unexpected error occurred");
            }
          } else {
            setIsDialogOpen(false);
            setIsProgressStarted(newState);
            toast.success(String(response.data.message));
          }
        } catch (error) {
          console.error("Error updating task progress:", error);
        }
      }
    } catch (error) {
      console.error("Error updating task progress:", error);
    }
  };

  const toggleProgress = async () => {
    const newState = !isProgressStarted;
    if (newState) {
      try {
        const response = await updateTaskProgress({
          taskId: Number(task?.id),
          progressStart: true,
          email: email,
        });
        if (response.error) {
          if ("data" in response.error) {
            const errorData = response.error.data as { message: string };
            const str = errorData.message.split("?");
            setErrorMessage(str[0]);
            setErrorTaskId(str[1]);
            setIsDialogOpen(true);
          } else {
            toast.error("An unexpected error occurred");
          }
        } else {
          setIsProgressStarted(newState);
          toast.success(String(response.data.message));
        }
      } catch (error) {
        console.error("Error updating task progress:", error);
      }
    } else {
      try {
        const response = await updateTaskProgress({
          taskId: Number(task?.id),
          progressStart: false,
          email: email,
        });
        if (response.error) {
          if ("data" in response.error) {
            const errorData = response.error.data as { message: string };
            toast.error(errorData.message);
          } else {
            toast.error("An unexpected error occurred");
          }
        } else {
          setIsProgressStarted(newState);
          toast.success(String(response.data.message));
        }
      } catch (error) {
        console.error("Error updating task progress:", error);
      }
    }
  };

  const [timeDiff, setTimeDiff] = useState<string>("");

  const userEmail = useSearchParams().get("email");
  useEffect(() => {
    if (task?.assignee?.email === userEmail) {
      setIsTaskAssigned(true);
    }
  }, [task]);

  const targetTime = new Date(task?.inProgressStartTime!);

  let targetTimeLocal = new Date();
  let count = 0;

  const updateTime = () => {
    if (isProgressStarted === true && task?.inProgressStartTime !== null) {
      const currentTime = new Date();
      let diff = currentTime.getTime() - targetTime.getTime();

      if (task?.inProgressTimeinMinutes !== null)
        diff += Number(task?.inProgressTimeinMinutes!) * 60 * 1000;

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = (minutes % 60).toString().padStart(2, "0");
      const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

      setTimeDiff(`${hours}:${remainingMinutes}:${remainingSeconds}`);
    } else {
      if (count === 0) {
        const minutes = Number(task?.inProgressTimeinMinutes);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = (minutes % 60).toString().padStart(2, "0");
        setTimeDiff(`${hours}:${remainingMinutes}:00`);
        targetTimeLocal = new Date();
        count = 1;
      } else {
        const currentTime = new Date();
        let diff = currentTime.getTime() - targetTimeLocal!.getTime();

        if (task?.inProgressTimeinMinutes !== null)
          diff += Number(task?.inProgressTimeinMinutes!) * 60 * 1000;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = (minutes % 60).toString().padStart(2, "0");
        const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

        setTimeDiff(`${hours}:${remainingMinutes}:${remainingSeconds}`);
      }
    }
  };

  useEffect(() => {
    if (!isProgressStarted && task?.inProgressTimeinMinutes !== null) {
      const minutes = Number(task?.inProgressTimeinMinutes);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = (minutes % 60).toString().padStart(2, "0");
      setTimeDiff(`${hours}:${remainingMinutes}:00`);
    }

    let intervalId: NodeJS.Timeout | null = null;

    if (isProgressStarted) {
      intervalId = setInterval(updateTime, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isProgressStarted, task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9_\s]*$/;
    // Check if the value matches the regex
    if (regex.test(value)) {
      setSubTaskName(value); // Update the state only if valid
    } else {
      // Show a toast message when an invalid character is entered
      toast.error(
        "Invalid character! Only letters, numbers, and underscores are allowed."
      );
    }
  };

  if (isLoading)
    return (
      <div>
        <CircularLoading />
      </div>
    );

  return (
    <div className="w-[80vw] max-h-[90vh] overflow-y-auto mx-auto p-6 bg-white rounded-xl shadow-lg space-y-6 dark:bg-gray-800 dark:text-white">
      {/* Task Title and Description */}
      {isDialogOpen && (
        <ErrorDialog
          message={errorMessage}
          descriptionMessage="Click proceed if you want to pause the other task and start the progress of this task"
          taskId={errorTaskId}
          closeDialog={handleCloseDialog}
          showAdditionalButton={showAdditionalButton}
          onAdditionalButtonClick={handleAdditionalButtonClick}
        />
      )}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">
            {task?.title} - {task?.code}
          </h1>
          <div className="flex space-x-4 ml-auto">
            {task?.status! === "Closed" ? (
              ""
            ) : (
              <>
                {isTaskAssigned ? (
                  <>
                    <button
                      onClick={toggleProgress}
                      className="px-4 py-2 text-white rounded-lg bg-black hover:bg-gray-300 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 "
                    >
                      {isProgressStarted ? "Pause Progress" : "Start Progress"}
                    </button>
                  </>
                ) : (
                  ""
                )}
              </>
            )}
            <Link
              href={`/projectsDashboard/${projectId}/${task?.id}?email=${email}`}
            >
              <button
                className="px-4 py-2 text-gray-900 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => {
                  sessionStorage.setItem("projectId", projectId);
                  sessionStorage.setItem("taskId", String(task?.id));
                }}
              >
                <Maximize2 />
              </button>
            </Link>
          </div>
        </div>

        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <div className="text-sm flex justify-between items-center">
            <span>
              {formatDate(task?.startDate!)} - {formatDate(task?.dueDate!)}
            </span>
            <>
              <span className="text-gray-600 text-lg inline-flex items-center mr-5">
                <Timer className="mr-2 " />
                <div className="text-center text-lg font-semibold">
                  Consumed time: {timeDiff}
                </div>
              </span>
            </>
          </div>

          <div className="text-sm relative">
            {/* Display editable content */}
            {isEditable ? (
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(Number(e.target.value))} // Update state as user types
                onBlur={handleBlur} // Trigger onBlur event when user clicks outside
                onKeyDown={handleKeyDown} // Trigger onBlur when Enter key is pressed
                autoFocus // Automatically focus the input when it's rendered
                className="border p-1 rounded w-24" // Style the input
              />
            ) : (
              <div className="flex items-center">
                {/* Display the text */}
                <div
                  className="flex items-center"
                  onMouseEnter={() => setIsHovered(false)} // Trigger hover enter
                  onMouseLeave={() => setIsHovered(false)} // Trigger hover leave
                >
                  <span className="cursor-pointer">
                    Estimated hours: {editedText}
                  </span>

                  {/* Pencil icon that appears when hovering over the parent */}
                  <Pencil
                    size={16}
                    className={`ml-2 cursor-pointer ${
                      isHovered ? "opacity-100" : "opacity-0"
                    } transition-opacity`}
                    onClick={handleEditClick}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="text-sm">
            <span className="ml-auto text-gray-500 dark:text-gray-300">
              Author: {task?.author?.username}
            </span>
          </div>

          <div className="text-sm relative">
            {/* Assignee Editable Section */}
            {isAssigneeEditable ? (
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)} // Update state when selecting an assignee
                onBlur={handleAssigneeBlur} // Trigger onBlur event when user clicks outside
                onKeyDown={handleKeyDown} // Trigger onBlur when Enter key is pressed
                autoFocus
                className="border p-1 rounded w-40"
              >
                {/* Assuming 'users' is an array of possible assignees */}
                {users?.map((user) => (
                  <option key={user.userId} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center">
                {/* Display the text */}
                <div
                  className="flex items-center"
                  onMouseEnter={() => setIsAssigneeHovered(false)}
                  onMouseLeave={() => setIsAssigneeHovered(false)} // Trigger hover leave
                >
                  <span className="cursor-pointer">Assignee: {assignee}</span>

                  {/* Pencil icon that appears when hovering over the parent */}
                  <Pencil
                    size={16}
                    className={`ml-2 cursor-pointer ${
                      isAssigneeHovered ? "opacity-100" : "opacity-0"
                    } transition-opacity`}
                    onClick={handleEditAssigneeClick}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Tags:</span>

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

        <div className="text-sm relative">
          {isDescriptionEditable ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border p-1 rounded w-full h-24 resize-none"
            />
          ) : (
            <div
              className="flex items-center"
              onMouseEnter={() => setIsDescriptionHovered(false)}
              onMouseLeave={() => setIsDescriptionHovered(false)}
            >
              <p className="text-gray-700 dark:text-gray-300 cursor-pointer">
                {description || "Loading description..."}
              </p>

              <div
                className={`ml-2 cursor-pointer ${
                  isDescriptionHovered ? "opacity-100" : "opacity-0"
                } transition-opacity`}
              >
                <Pencil
                  size={16}
                  style={{ width: "16px", height: "16px" }}
                  onClick={handleEditDescriptionClick}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          {/* <button
            onClick={handleSaveChanges}
            disabled={!isSaveButtonEnabled} 
            className={`mt-2 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-700 ${
              !isSaveButtonEnabled && "opacity-50 cursor-not-allowed"
            }`}
          >
            Save Changes
          </button> */}
        </div>
      </div>

      {/* Attachments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Attachments</h2>
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                {(task?.attachments?.length ?? 0) > 0 ? (
                  <>
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl text-gray-500">📎</span>
                    </div>
                    <span className="text-gray-800 dark:text-gray-100">
                      {task?.attachments?.[0]?.fileName}
                    </span>
                    <button
                      className="text-blue-600 hover:text-blue-800 ml-2"
                      onClick={downloadAttachment}
                    >
                      <Download />
                    </button>
                  </>
                ) : (
                  "Please upload a document of size less than 1 mb"
                )}
              </div>

              {(task?.attachments?.length ?? 0) > 0 ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-blue-600 hover:text-blue-800 ml-2">
                      Delete
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-700">
                        Do you want to remove the Attachment ?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => {
                          //setOpen(false);
                        }}
                      >
                        No
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={deleteAttachment}>
                        Yes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                ""
              )}
            </div>
          </div>
          <div className="mt-4">
            <div>
              {/* Button to trigger file input */}
              {isLoadingUploadAttachment && (
                <Progress value={uploadProgress} max={100} color="blue" />
              )}
              {(task?.attachments?.length ?? 0) > 0 ? (
                ""
              ) : (
                <button
                  className="flex items-center justify-start w-full p-3 text-blue-600 hover:text-blue-800 rounded-md hover:bg-gray-200 focus:outline-none transition duration-200"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  + Add Attachment
                </button>
              )}

              {/* Hidden file input */}
              <input
                id="fileInput"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Subtasks</h2>
          <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-500">
                  <PlusSquare className="h-5 w-5 mr-2" />
                  Add Subtasks
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[50vw] lg:max-w-[60vw] max-h-[29vw] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="mb-1">Create SubTask</DialogTitle>
                </DialogHeader>

                <div className="relative w-full h-full overflow-hidden">
                  <div className=" top-0 left-0 w-[calc(100%)] h-[calc(100%)]">
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-1">
                        <div className="grid grid-cols-8 items-center gap-4 mr-1">
                          <Label className="text-center">
                            Task Name
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            value={subTaskName}
                            onChange={handleChange}
                            className="col-span-7"
                            required
                          />
                          <Label className="text-center">
                            Description
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <textarea
                            value={subTaskDescription}
                            onChange={(e) =>
                              setSubTaskDescription(e.target.value)
                            }
                            className="col-span-7 shadow border"
                          />
                          <Label className="text-center">
                            Start Date
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            type="date"
                            value={subTaskStartDate}
                            onChange={(e) =>
                              setSubTaskStartDate(e.target.value)
                            }
                            className="col-span-3"
                          />
                          <Label className="text-center">
                            Due Date<span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            type="date"
                            value={subTaskDueDate}
                            onChange={(e) => setSubTaskDueDate(e.target.value)}
                            className="col-span-3"
                          />

                          <Label className="text-center">
                            Assignee<span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Select
                            value={subTaskAssignedUserId}
                            onValueChange={(value) =>
                              setSubTaskAssignedUserId(value)
                            }
                          >
                            <SelectTrigger className="col-span-7 p-2 border rounded-md">
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
                        </div>
                      </div>
                      <DialogFooter>
                        <button
                          type="submit"
                          className={`flex w-200px mt-4 justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
                                hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
                                  !isFormValid() || isLoadingCreateSubTask
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                }`}
                          disabled={!isFormValid() || isLoadingCreateSubTask}
                        >
                          {isLoadingCreateSubTask
                            ? "Creating..."
                            : "Create SubTask"}
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
        </div>

        {/* Line separator under Subtasks heading */}
        <div className="mt-2 border-t-2 border-gray-300 dark:border-gray-600"></div>
        <div className="flex items-center justify-between mt-4"></div>

        <div className="mt-4 space-y-2">
          {isLoadingSubTasks ? (
            <span className="text-gray-500 dark:text-gray-400">
              Loading subtasks...
            </span>
          ) : subTasks.length > 0 ? (
            <SubTaskTable
              subTasks={subTasks}
              email={email}
              projectId={projectId}
            />
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
            <Comments taskId={taskId} email={email} taskCode={task?.code!} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
