"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Download, ChevronLeft, Clock } from "lucide-react";
import {
  useDeleteAttachmentMutation,
  useDownloadAttachmentMutation,
  useGetProjectUsersQuery,
  useGetSubTaskQuery,
  useUpdateSubTaskMutation,
  useUpdateSubTaskProgressMutation,
  useUpdateTaskProgressMutation,
  useUploadSubTaskAttachmentMutation,
} from "@/store/api";
import { toast } from "react-hot-toast";
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
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { CardContent } from "@mui/material";
import ErrorDialog from "@/app/ErrorDialog";
import SubTaskComment from "../../projectsDashboard/[id]/(SubTask)/SubTaskComments";
import SubTaskActivity from "../../projectsDashboard/[id]/subTask/[subTaskId]/SubTaskActivity";

const SubTaskPage = () => {
  const userEmail = useSearchParams().get("email");
  const subTaskId = Number(sessionStorage.getItem("subTaskId"));

  const {
    data: task,
    isLoading,
    error,
  } = useGetSubTaskQuery(
    { subTaskId: subTaskId },
    { refetchOnMountOrArgChange: true }
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".xls", ".xlsx"];

  const [uploadSubTaskAttachment, { isLoading: isLoadingUploadAttachment }] =
    useUploadSubTaskAttachmentMutation();
  const [uploadProgress, setUploadProgress] = useState(0);

  const [deleteAttachmentQuery, { isLoading: isLoadingDeleteAttachment }] =
    useDeleteAttachmentMutation();

  const [downloadAttachmentQuery, { isLoading: isLoadingDownloadAttachment }] =
    useDownloadAttachmentMutation();

  const maxSize = 1.5 * 1024 * 1024;

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
        const uploadSubTaskAttachmentBody = {
          subTaskId: subTaskId,
          fileBase64: base64String,
          fileName: file.name,
          uploadedBy: userEmail!,
        };
        try {
          const response = await uploadSubTaskAttachment(
            uploadSubTaskAttachmentBody
          );

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
        taskId: subTaskId,
        isSubTask: true,
        email: userEmail!,
      });
      if (
        //@ts-ignore
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
        taskId: subTaskId,
        isSubTask: true,
      });
      downloadFile(response.data?.fileBase64!, response.data?.fileName!);
    } catch (err: any) {
      toast.error(err.data);
      console.error(err);
    }
  };

  const { data: users } = useGetProjectUsersQuery({
    projectId: sessionStorage.getItem("projectId")!,
  });

  const [isEditableStatus, setIsEditableStatus] = useState(false);
  const [isHovered, setIsHovered] = useState(true);
  const [isAssigneeEditable, setIsAssigneeEditable] = useState(false);
  const [isAssigneeHovered, setIsAssigneeHovered] = useState(true);
  const [subTaskAssignee, setSubTaskAssignee] = useState(
    task?.assignee?.username
  );
  const [subTaskStatus, setSubTaskStatus] = useState(task?.status);
  const [isDescriptionEditable, setIsDescriptionEditable] = useState(false);
  const [isDescriptionHovered, setIsDescriptionHovered] = useState(true);
  const [isStatusHovered, setIsStatusHovered] = useState(true);
  const [subTaskDescription, setSubTaskDescription] = useState(
    task?.description || ""
  );
  const [startDate, setStartDate] = useState(task?.startDate);
  const [dueDate, setDueDate] = useState(task?.dueDate);
  const [initialStartDate, setInitialStartDate] = useState(task?.startDate);
  const [initialDueDate, setInitialDueDate] = useState(task?.dueDate);
  const [taskName, setTaskName] = useState(task?.title);
  const [initailTaskName, setInitialTaskName] = useState(task?.title);
  const [isConsumedHoursEditable, setIsConsumedHoursEditable] = useState(false);
  const [editedConsumedHours, setEditedConsumedHours] = useState(
    task?.inProgressTime!
  );
  const [initialEditedConsumedHours, setInitialEditedConsumedHours] =
    useState("");

  const [initialDescription, setInitialDescription] = useState(
    task?.description || ""
  );
  const [initialAssignee, setInitialAssignee] = useState(
    task?.assignee?.username || ""
  );
  const [initialStatus, setInitialStatus] = useState(task?.status || "");

  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);

  useEffect(() => {
    if (task) {
      setSubTaskDescription(task.description || "");
      setSubTaskAssignee(task?.assignee?.username || "");
      setInitialAssignee(task?.assignee?.username || "");
      setInitialDescription(task.description || "");
      setSubTaskStatus(task.status || "");
      setInitialStatus(task.status || "");
      setIsSaveButtonEnabled(false);
      setTaskName(task.title);
      setInitialTaskName(task.title);
      const formattedStartDate = new Date(task.startDate!)
        .toISOString()
        .split("T")[0];
      setStartDate(formattedStartDate);
      const formattedDueDate = new Date(task.dueDate!)
        .toISOString()
        .split("T")[0];
      setInitialDueDate(task.dueDate || "");
      setInitialStartDate(task.startDate || "");
      setDueDate(formattedDueDate);
    }
  }, [task]);

  useEffect(() => {
    const isChanged =
      subTaskDescription !== initialDescription ||
      subTaskAssignee !== initialAssignee ||
      subTaskStatus !== initialStatus ||
      editedConsumedHours !== initialEditedConsumedHours ||
      startDate !== initialStartDate ||
      dueDate !== initialDueDate;
    setIsSaveButtonEnabled(isChanged);
  }, [
    subTaskDescription,
    subTaskAssignee,
    initialDescription,
    initialAssignee,
    subTaskStatus,
    initialStatus,
    editedConsumedHours,
    initialEditedConsumedHours,
  ]);

  const handleEditClick = () => {
    setIsEditableStatus(true);
  };

  const handleEditAssigneeClick = () => {
    setIsAssigneeEditable(true);
  };

  const handleEditDescriptionClick = () => {
    setIsDescriptionEditable(true);
  };

  const handleBlur = () => {
    setIsEditableStatus(false);
    setIsHovered(true);
  };

  const handleAssigneeBlur = () => {
    setIsAssigneeEditable(false);
    setIsAssigneeHovered(true);
  };

  const handleDescriptionBlur = () => {
    setIsDescriptionEditable(false);
    setIsDescriptionHovered(true);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  const taskStatus = ["To Do", "Work In Progress", "Under Review", "Completed"];
  const roles = sessionStorage.getItem("userRoles") || "";
  const [PMUser, setPMUser] = useState(
    roles.split(",").includes("PROJECT_MANAGER")
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [taskOrSubTask, setTaskOrSubTask] = useState("Task");
  const [errorTaskId, setErrorTaskId] = useState("");
  const [updateTaskProgress] = useUpdateTaskProgressMutation();

  const handleEditConsumedHoursClick = () => {
    setIsConsumedHoursEditable(true);
  };

  const [isProgressStarted, setIsProgressStarted] = useState(
    task?.inProgressStartTime === null ? false : true
  );
  const [timeDiff, setTimeDiff] = useState<string>("");

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
      const remainingMinutes = minutes % 60;
      const remainingSeconds = seconds % 60;

      setTimeDiff(`${hours}:${remainingMinutes}:${remainingSeconds}`);
      setEditedConsumedHours(
        `${hours}:${remainingMinutes}:${remainingSeconds}`
      );
      setInitialEditedConsumedHours(
        `${hours}:${remainingMinutes}:${remainingSeconds}`
      );
    } else {
      if (count === 0) {
        const minutes = Number(task?.inProgressTimeinMinutes);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        setTimeDiff(`${hours}:${remainingMinutes}:00`);
        setEditedConsumedHours(`${hours}:${remainingMinutes}:00`);
        setInitialEditedConsumedHours(`${hours}:${remainingMinutes}:00`);
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
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;

        setTimeDiff(`${hours}:${remainingMinutes}:${remainingSeconds}`);
        setEditedConsumedHours(
          `${hours}:${remainingMinutes}:${remainingSeconds}`
        );
        setInitialEditedConsumedHours(
          `${hours}:${remainingMinutes}:${remainingSeconds}`
        );
      }
    }
  };

  useEffect(() => {
    if (!isProgressStarted && task?.inProgressTimeinMinutes !== null) {
      const minutes = Number(task?.inProgressTimeinMinutes);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      setTimeDiff(`${hours}:${remainingMinutes}:00`);
      setEditedConsumedHours(`${hours}:${remainingMinutes}:00`);
      setInitialEditedConsumedHours(`${hours}:${remainingMinutes}:00`);
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

  const [updateSubTask, { isLoading: isLoadingUpdateSubTask }] =
    useUpdateSubTaskMutation();

  const handleSaveChanges = async (event: React.FormEvent) => {
    event.preventDefault();

    const updateTaskData = {
      subTaskId: subTaskId,
      subTaskStatus: subTaskStatus,
      subTaskAssignee: subTaskAssignee,
      subTaskDescription: subTaskDescription,
      editedConsumedHours: editedConsumedHours,
      email: userEmail!,
      startDate: startDate!,
      dueDate: dueDate!,
      taskName: taskName!,
    };
    try {
      const response = await updateSubTask(updateTaskData);
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

  const [updateSubTaskProgress] = useUpdateSubTaskProgressMutation();

  // Flag to conditionally render the additional button
  const [showAdditionalButton, setShowAdditionalButton] = useState(true);
  const [isTaskAssigned, setIsTaskAssigned] = useState(false);

  useEffect(() => {
    if (task?.assignee?.email === userEmail) {
      setIsTaskAssigned(true);
    }
  }, [task]);

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
      if (taskOrSubTask === "Task") {
        const response = await updateTaskProgress({
          taskId: Number(errorTaskId),
          email: userEmail!,
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
            const response = await updateSubTaskProgress({
              taskId: Number(task?.id),
              email: userEmail!,
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
      } else {
        const response = await updateSubTaskProgress({
          taskId: Number(errorTaskId),
          email: userEmail!,
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
            const response = await updateSubTaskProgress({
              taskId: Number(task?.id),
              email: userEmail!,
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
      }
    } catch (error) {
      console.error("Error updating task progress:", error);
    }
  };

  const toggleProgress = async () => {
    const newState = !isProgressStarted;
    if (newState) {
      try {
        const response = await updateSubTaskProgress({
          taskId: Number(task?.id),
          progressStart: true,
          email: userEmail!,
        });
        if (response.error) {
          if ("data" in response.error) {
            const errorData = response.error.data as { message: string };
            const match = errorData.message.match(/(?:\?)([^=]+)/);
            if (match) {
              const valueBetween = match[1];
              setTaskOrSubTask(valueBetween);
            }
            const str = errorData.message.split("?");
            const str2 = errorData.message.split("=");
            setErrorMessage(str[0]);
            setErrorTaskId(str2[1]);
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
        const response = await updateSubTaskProgress({
          taskId: Number(task?.id),
          progressStart: false,
          email: userEmail!,
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

  return (
    <div className="w-full max-h-full overflow-y-auto mx-auto p-6 bg-white rounded-xl shadow-lg space-y-6 dark:bg-gray-800 dark:text-white">
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
          <button onClick={() => window.history.back()}>
            <ChevronLeft className="mr-5" />
          </button>
          <h1 className="text-3xl font-semibold">
            {task?.title} - {task?.code}
          </h1>
          <div className="flex space-x-4 ml-auto">
            {task?.status! === "Completed" ? (
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
          </div>
        </div>

        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <div className="text-sm flex justify-between items-center">
            <span>
              {formatDate(task?.startDate!)} - {formatDate(task?.dueDate!)}
            </span>
            <>
              <span className="text-gray-600 text-lg inline-flex items-center mr-5">
                <Clock className="mr-2 dark:text-white" />
                <div className="text-center text-lg font-semibold dark:text-white">
                  {isConsumedHoursEditable ? (
                    <input
                      type="text"
                      value={editedConsumedHours}
                      onChange={(e) =>
                        setEditedConsumedHours(String(e.target.value))
                      }
                      autoFocus
                      placeholder="00:00:00"
                      className="border p-1 rounded w-24"
                      onBlur={handleBlur}
                    />
                  ) : (
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <span className="cursor-pointer">
                          Consumed time: {editedConsumedHours}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {task?.status! === "Completed" ? (
                  <>{PMUser ? <></> : ""}</>
                ) : (
                  ""
                )}
              </span>
            </>
          </div>

          <div className="text-sm">
            <span className="ml-auto text-gray-500 dark:text-gray-300">
              Author: {task?.author?.username}
            </span>
          </div>

          <div className="text-sm relative">
            {isAssigneeEditable ? (
              <select
                value={subTaskAssignee}
                onChange={(e) => setSubTaskAssignee(e.target.value)}
                onBlur={handleAssigneeBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="border p-1 rounded w-40"
              >
                {users?.map((user) => (
                  <option key={user.userId} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center">
                <div
                  className="flex items-center"
                  onMouseEnter={() => setIsAssigneeHovered(true)}
                  onMouseLeave={() => setIsAssigneeHovered(true)}
                >
                  <span className="cursor-pointer">
                    Assignee: {subTaskAssignee}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="text-sm relative">
            {isEditableStatus ? (
              <select
                value={subTaskStatus}
                onChange={(e) => setSubTaskStatus(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="border p-1 rounded w-40"
              >
                {taskStatus?.map((obj) => (
                  <option key={obj} value={obj}>
                    {obj}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center">
                <div
                  className="flex items-center"
                  onMouseEnter={() => setIsStatusHovered(true)}
                  onMouseLeave={() => setIsStatusHovered(true)}
                >
                  <span className="cursor-pointer">
                    Status: {subTaskStatus}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="text-sm relative">
            {isDescriptionEditable ? (
              <textarea
                value={subTaskDescription}
                onChange={(e) => setSubTaskDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="border p-1 rounded w-full h-24 resize-none"
              />
            ) : (
              <div
                className="flex items-center"
                onMouseEnter={() => setIsDescriptionHovered(true)}
                onMouseLeave={() => setIsDescriptionHovered(true)}
              >
                <p className="text-gray-700 dark:text-gray-300 cursor-pointer">
                  {subTaskDescription || "Loading status..."}
                </p>

                <div
                  className={`ml-2 cursor-pointer ${
                    isDescriptionHovered ? "opacity-100" : "opacity-0"
                  } transition-opacity`}
                ></div>
              </div>
            )}
          </div>

          <div className="flex justify-end"></div>
        </div>

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
                    ""
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
                {isLoadingUploadAttachment && (
                  <Progress value={uploadProgress} max={100} color="blue" />
                )}
                {(task?.attachments?.length ?? 0) > 0 ? "" : ""}

                <input
                  id="fileInputSubTask"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Comments</h2>
          <div className="mt-2 border-t-2 border-gray-300 dark:border-gray-600"></div>
          <div className="border-2 border-gray-300 p-4 rounded-lg dark:border-gray-600">
            <div className="space-y-4">
              <Tabs defaultValue="comments" className="w-full">
                <TabsList className="grid w-full grid-cols-2 w-[400px] h-[44px]">
                  <TabsTrigger
                    value="comments"
                    className="font-semibold text-lg"
                  >
                    Comments
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="font-semibold text-lg "
                  >
                    Activity
                  </TabsTrigger>
                </TabsList>
                <div className="mt-2 mb-2 border-t-2 border-gray-300 dark:border-gray-600"></div>

                <TabsContent value="comments" className="w-full">
                  <Card>
                    <SubTaskComment
                      subTaskId={Number(sessionStorage.getItem("subTaskId"))}
                      email={userEmail!}
                    />
                  </Card>
                </TabsContent>
                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardDescription>
                        {task?.title} - {task?.code} Activity
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <SubTaskActivity taskId={task?.id!} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubTaskPage;
