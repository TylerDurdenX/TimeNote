'use client'

import React, { useEffect, useRef, useState } from "react";
import { Download, Maximize2, EllipsisVertical, Clock, ChevronLeft } from "lucide-react";
import { SubTask, Task as TaskType } from "@/store/interfaces";
import { useCloseTaskMutation, useCreateSubTaskMutation, useDeleteAttachmentMutation, useDownloadAttachmentMutation, useGetProjectUsersQuery, useGetTaskQuery, useUpdateTaskAssigneeMutation, useUpdateTaskMutation, useUpdateTaskProgressMutation, useUpdateTaskStatusMutation, useUploadAttachmentMutation } from "@/store/api";
import {  toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Comments from "../../projectsDashboard/[id]/Comments";
import SubTaskTable from "../../projectsDashboard/[id]/(SubTask)/SubTaskTable";
import { useSearchParams } from "next/navigation";
import TaskHistory from "../../projectsDashboard/[id]/History";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import TaskActivity from "../../projectsDashboard/[id]/[taskId]/TaskActivity";
import CircularLoading from "@/components/Sidebar/loading";

const TaskPageFull = () => {

  const projectId = sessionStorage.getItem("projectId");
  const taskIdFromSession = sessionStorage.getItem("taskId");
  const taskId = Number(taskIdFromSession)
  const email = useSearchParams().get("email")

  const {
    data: task,
    isLoading,
    error,
  } = useGetTaskQuery({ taskId : Number(taskId) }, { refetchOnMountOrArgChange: true });

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

  localStorage.removeItem("persist:root");
  localStorage.removeItem('ally-supports-cache')

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
        reject(new Error('Error converting file to base64'));
      };
    });
  };

  function downloadFile(base64String: string, fileName: string) {
    const base64Data = base64String.startsWith('data:')
    ? base64String.split(',')[1]  // Extract the part after the comma
    : base64String;
    const binaryString = atob(base64Data);
    const byteArray = new Uint8Array(binaryString.length);
  
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
  
    const blob = new Blob([byteArray], { type: 'application/octet-stream' }); // MIME type can vary based on file type
    const fileURL = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = fileName;  
  
    link.click();
  
    URL.revokeObjectURL(fileURL);
  }

  const downloadAttachment = (async() => {
    try {

      const response = await downloadAttachmentQuery({taskId, isSubTask: false})
      downloadFile(response.data?.fileBase64!, response.data?.fileName!)

    } catch (err: any) {
      toast.error(err.data);
      console.error(err);
    }
  })

//   const { data: user } = useGetProjectUsersQuery({ projectId: projectId! });

  const taskTagsSplit = task?.tags 
  ? task.tags.split(",").filter(tag => tag.trim() !== "") 
  : [];

  const [isProgressStarted, setIsProgressStarted] = useState(task?.inProgressStartTime === null ? false : true);
  const [timeDiff, setTimeDiff] = useState<string>("");

  const targetTime = new Date(task?.inProgressStartTime!); 

  const updateTime = () => {
    const currentTime = new Date(); 
    let diff = currentTime.getTime() - targetTime.getTime(); 

    if(task?.inProgressTimeinMinutes !== null)
      diff += Number(task?.inProgressTimeinMinutes!) * 60 * 1000;

    const seconds = Math.floor(diff / 1000); 
    const minutes = Math.floor(seconds / 60); 
    const hours = Math.floor(minutes / 60); 
    const remainingMinutes = minutes % 60; 
    const remainingSeconds = seconds % 60; 

    setTimeDiff(`${hours}:${remainingMinutes}:${remainingSeconds}`);
    setEditedConsumedHours(`${hours}:${remainingMinutes}:${remainingSeconds}`)
    setInitialEditedConsumedHours(`${hours}:${remainingMinutes}:${remainingSeconds}`)
  };

  useEffect(() => {
    if (!isProgressStarted && task?.inProgressTimeinMinutes!==null) {
      const minutes = Number(task?.inProgressTimeinMinutes);
      const hours = Math.floor(minutes / 60); 
      const remainingMinutes = minutes % 60;
      setTimeDiff(`${hours}:${remainingMinutes}:00`)
      setEditedConsumedHours(`${hours}:${remainingMinutes}:00`)
      setInitialEditedConsumedHours(`${hours}:${remainingMinutes}:00`)
    };

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

  const [isEditable, setIsEditable] = useState(false);
  const [isConsumedHoursEditable, setIsConsumedHoursEditable] = useState(false);
  const [editedText, setEditedText] = useState(task?.points); 
  const [editedConsumedHours, setEditedConsumedHours] = useState('')
  const [initialEditedConsumedHours, setInitialEditedConsumedHours] = useState('')
  const [isHovered, setIsHovered] = useState(true);
  const [isAssigneeEditable, setIsAssigneeEditable] = useState(false);
  const [isAssigneeHovered, setIsAssigneeHovered] = useState(true);
  const [assignee, setAssignee] = useState(task?.assignee?.username);
  const [isDescriptionEditable, setIsDescriptionEditable] = useState(false);
  const [isDescriptionHovered, setIsDescriptionHovered] = useState(true);
  const [description, setDescription] = useState(task?.description || "");
  const roles = sessionStorage.getItem('userRoles') || ""
  const [PMUser, setPMUser] = useState(roles.split(',').includes('PROJECT_MANAGER'))

  const [initialDescription, setInitialDescription] = useState(
    task?.description || ""
  );
  const [initialAssignee, setInitialAssignee] = useState(
    task?.assignee?.username || ""
  );
  const [initialPoints, setInitialPoints] = useState(task?.points || "");
  const [initialStatus, setInitialStatus] = useState(task?.status || "");


  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);

  const [subTaskName, setSubTaskName] = useState("");
    const [subTtaskStatus, setSubTaskStatus] = useState("To Do");
    const [subTaskDescription, setSubTaskDescription] = useState("");
    const [subTaskStartDate, setSubTaskStartDate] = useState("");
    const [subTaskDueDate, setSubTaskDueDate] = useState("");
    const [subTaskAssignedUserId, setSubTaskAssignedUserId] = useState("");
    const [isEditableStatus, setIsEditableStatus] = useState(false);
    const [taskStatus, setTaskStatus] = useState(task?.status || "");
    const [isDateEditable, setIsDateEditable] = useState(false);
    const [startDate, setStartDate] = useState(task?.startDate);
    const [dueDate, setDueDate] = useState(task?.dueDate);
    const [initialStartDate, setInitialStartDate] = useState(
      task?.startDate
    );
    const [initialDueDate, setInitialDueDate] = useState(
      task?.dueDate
    );
    const [createSubTask, { isLoading: isLoadingCreateSubTask }] =
    useCreateSubTaskMutation();
    const [isOpen, setIsOpen] = useState(false);
    const [closeCompletedTask] = useCloseTaskMutation();
    const [updateTaskAssignee] = useUpdateTaskAssigneeMutation();
    const [updateTaskStatus] = useUpdateTaskStatusMutation();
    const [updateTaskProgress] = useUpdateTaskProgressMutation();
    
    const assignTask =async (taskId: number, email: string) => {
      try {
        const response = await updateTaskAssignee({ taskId, email });
        if (response.error) {
          if ('data' in response.error) {
            const errorData = response.error.data as {message: string }; 
              toast.error(errorData.message);
            
          } else {
            toast.error('An unexpected error occurred');
          }
        } else {
          toast.success(String(response.data));
        }
      } catch (err) {
        toast.error("Some Error occurred, please try again later");
      }
    };
  
    const isFormValid = () => {
      return subTaskName && subTaskDescription && subTaskStartDate && subTaskDueDate && subTaskAssignedUserId;
    };

//   const { data, isLoading: isLoadingProjectUsers, } = useGetProjectUsersQuery({ projectId: projectId! });
    
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
        authorUserId: email!,
        taskId: Number(taskId),
      };
      try {
        const response = createSubTask(formData);
        setSubTaskName('')
        setSubTaskDescription('')
        setSubTaskStartDate('')
        setSubTaskDueDate('')
        setSubTaskAssignedUserId('')
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
    setTaskStatus(task.status || "")
    setAssignee(task?.assignee?.username || "");
    setEditedText(task?.points)
    setInitialAssignee(task?.assignee?.username || "");
    setInitialDescription(task.description || "");
    const formattedStartDate = new Date(task.startDate!).toISOString().split('T')[0];
    setStartDate(formattedStartDate);
    const formattedDueDate = new Date(task.dueDate!).toISOString().split('T')[0];
    setDueDate(formattedDueDate);
    setInitialDueDate(task.dueDate || "");
    setInitialStartDate(task.startDate || "");
    setInitialPoints(task.points || "");
    setSubTasks(task?.subTasks || [])
    setInitialStatus(task?.status || "")
    setIsSaveButtonEnabled(false);
    setIsProgressStarted(task?.inProgressStartTime === null ? false : true)
    setIsLoadingSubTasks(false);
  }
}, [task]);

useEffect(() => {
  const isChanged =
    description !== initialDescription ||
    assignee !== initialAssignee ||
    taskStatus!== initialStatus ||
    editedText !== initialPoints || 
    editedConsumedHours !== initialEditedConsumedHours ||
    startDate !== initialStartDate ||
    dueDate !== initialDueDate

  setIsSaveButtonEnabled(isChanged); 
}, [
  description,
  assignee,
  editedText,
  taskStatus,
  startDate,
  dueDate,
  initialStartDate,
  initialDueDate,
  initialDescription,
  initialAssignee,
  initialPoints,
  initialStatus,
  editedConsumedHours,
  initialEditedConsumedHours
]);

  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleEditConsumedHoursClick = () => {
    setIsConsumedHoursEditable(true)
  }

  const handleEditAssigneeClick = () => {
    setIsAssigneeEditable(true);
  };

  const handleDateEditClick = () => {
    setIsDateEditable(true);
  };

  const handleEditDescriptionClick = () => {
    setIsDescriptionEditable(true);
  };

  const handleBlur = () => {
    setIsEditable(false);
    setIsHovered(true);
    setIsConsumedHoursEditable(false)
    setIsDateEditable(false)
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

  const [updateTask, { isLoading: isLoadingUpdateTask }] =
      useUpdateTaskMutation();

  const handleSaveChanges = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the form data to submit
    const updateTaskData = {
      taskId: taskId,
      taskPoints: editedText,
      assignee: assignee,
      taskDescription: description,
      editedConsumedHours: editedConsumedHours,
      startDate: startDate!,
      dueDate: dueDate!,
      email: email!
    };
    try {
      const response = await updateTask(updateTaskData);

      // @ts-ignore
            if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
              // @ts-ignore
              toast.error(response.error?.data.message)
            }else{
              // @ts-ignore
              toast.success(response.data?.message);
            }

      // if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
      //   toast.error(response.error?.data.message)
      // }else{
      //   toast.success(response.data?.message);
      // }
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  const toggleProgress = async () => {
    const newState = !isProgressStarted;
    if (newState) {
      console.log('Progress started');
      try {
        const response = await updateTaskProgress({
          taskId: Number(task?.id),
          email: email!,
          progressStart: true
        });
        if (response.error) {
          if ('data' in response.error) {
            const errorData = response.error.data as {message: string }; 
              toast.error(errorData.message);
            
          } else {
            toast.error('An unexpected error occurred');
          }
        } else {
          setIsProgressStarted(newState); 
          toast.success(String(response.data.message));
        }
      } catch (error) {
        console.error('Error updating task progress:', error);
      }
    } else {
      console.log('Progress stopped');
      try {
        const response = await updateTaskProgress({
          taskId: Number(task?.id),
          email: email!,
          progressStart: false
        });
        if (response.error) {
          if ('data' in response.error) {
            const errorData = response.error.data as {message: string }; 
              toast.error(errorData.message);
            
          } else {
            toast.error('An unexpected error occurred');
          }
        } else {
          setIsProgressStarted(newState); 
          toast.success(String(response.data.message));
        }
      } catch (error) {
        console.error('Error updating task progress:', error);
      }
    }
  };
  

  const closeTask = async(taskId: number) => {
      try {
        const response = await closeCompletedTask({ taskId, email: email!});
         // @ts-ignore
        if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
                        // @ts-ignore
                        toast.error(response.error?.data.message)
                      }else{
                        toast.success(response.data?.message!);
                      }
      } catch (err) {
        toast.error("Some Error occurred, please try again later");
      }
    };

  const moveTaskFromDropdown = async(taskId: number, toStatus: string) => {
      try {
        const response = await updateTaskStatus({ taskId, status: toStatus , email: email!});
         // @ts-ignore
        if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
                        // @ts-ignore
                        toast.error(response.error?.data.message)
                        console.log('1')
                      }else{
                        toast.success(response.data?.message!);
                      }
      } catch (err) {
        toast.error("Some Error occurred, please try again later");
      }
    };

  const taskStatusList = ["To Do", "Work In Progress", "Under Review", "Completed"];

   if (isLoading) return <div><CircularLoading/></div>;


  return (
    <div className="w-full max-h-full overflow-y-auto mx-auto p-6 bg-white rounded-xl shadow-lg space-y-6 dark:bg-gray-800 dark:text-white">
      {/* Task Title and Description */}
      <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button onClick={() => window.history.back()}>
                  <ChevronLeft className="mr-5"/>
                  </button>
        <h1 className="text-3xl font-semibold">{task?.title} - {task?.code}</h1>
        <div className="flex space-x-4 ml-auto">
        
            
        </div>
      </div>

        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <div className="text-sm flex justify-between items-center">
            {isDateEditable ? (
                            <div className="flex gap-4">  {/* Use flex and gap to space inputs */}
                              <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)} // Update state as user types
                                onBlur={handleBlur} // Trigger onBlur event when user clicks outside
                                onKeyDown={handleKeyDown} // Trigger onBlur when Enter key is pressed
                                className="border p-1 rounded w-30" // Style the input
                              />
                              -
                              <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)} // Update state as user types
                                onBlur={handleBlur} // Trigger onBlur event when user clicks outside
                                onKeyDown={handleKeyDown} // Trigger onBlur when Enter key is pressed
                                className="border p-1 rounded w-30" // Style the input
                              />
                            </div>
                          ) : (
                          <div className="flex items-center">
                            {/* Display the text */}
                            <div className="flex items-center">
                            <span>
                              {formatDate(startDate!)} - {formatDate(dueDate!)}
                            </span>

                            </div>
                          </div>
                        )}
            <>
            <span className="text-gray-600 text-lg inline-flex items-center mr-5">
            <Clock className="mr-2 dark:text-white" /> 
            <div className="text-center text-lg font-semibold dark:text-white">
            {isConsumedHoursEditable ? (
              <input
                type="text"
                value={editedConsumedHours}
                onChange={(e) => setEditedConsumedHours(String(e.target.value))} 
                autoFocus 
                placeholder="00:00:00"
                className="border p-1 rounded w-24" 
                onBlur={handleBlur}
              />
            ) : (
              <div className="flex items-center">
                <div
                  className="flex items-center"
                >
                  <span className="cursor-pointer">
                  Consumed time: {editedConsumedHours } 
                  </span>
                </div>
              </div>
            )}
            
            
            </div>
            {(task?.status! === "Closed") ? <>
            {PMUser ? <>

            </> : ""}
            </>

                   : ""}
            
          </span>
          </>
          </div>

          <div className="text-sm relative">
            {isEditable ? (
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(Number(e.target.value))} 
                onBlur={handleBlur} 
                onKeyDown={handleKeyDown} 
                autoFocus 
                className="border p-1 rounded w-24" 
              />
            ) : (
              <div className="flex items-center">
                <div
                  className="flex items-center"
                  onMouseEnter={() => setIsHovered(true)} 
                  onMouseLeave={() => setIsHovered(true)} 
                >
                  <span className="cursor-pointer">
                    Estimated hours: {editedText}
                  </span>


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
            {isAssigneeEditable ? (
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)} 
                onBlur={handleAssigneeBlur} 
                onKeyDown={handleKeyDown} 
                autoFocus
                className="border p-1 rounded w-40"
              >
                
              </select>
            ) : (
              <div className="flex items-center">
                <div
                  className="flex items-center"
                  onMouseEnter={() => setIsAssigneeHovered(true)}
                  onMouseLeave={() => setIsAssigneeHovered(true)} 
                >
                  <span className="cursor-pointer">Assignee: {assignee}</span>

                  
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center text-sm relative">
          Priority: 
            <span className="text-gray-500 dark:text-gray-300 whitespace-nowrap">
              {task?.priority && <PriorityTag priority={task.priority} />}
            </span>
          </div>

          <div className="text-sm relative">
                      {isEditableStatus ? (
                        <select
                          value={taskStatus}
                          onChange={(e) => setTaskStatus(e.target.value)} 
                          onKeyDown={handleKeyDown} 
                          autoFocus
                          className="border p-1 rounded w-40"
                        >
                          {taskStatusList?.map((obj) => (
                            <option key={obj} value={obj}>
                              {obj}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center">
                          <div
                            className="flex items-center"
                          >
                            <span className="cursor-pointer">Status: {taskStatus}</span>
          
                            
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
              {taskTagsSplit
                .slice(0, taskTagsSplit.length)
                .map((tag, index) => (
                  <div
                    key={tag}
                    ref={index === 0 ? tagRef : null} 
                    className="rounded-full bg-blue-100 px-2 py-1 text-xs dark:text-black"
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
              onMouseEnter={() => setIsDescriptionHovered(true)}
              onMouseLeave={() => setIsDescriptionHovered(true)}
            >
              <p className="text-gray-700 dark:text-gray-300 cursor-pointer">
                {description || "Loading description..."} 
              </p>

              <div
                className={`ml-2 cursor-pointer ${
                  isDescriptionHovered ? "opacity-100" : "opacity-0"
                } transition-opacity`}
              >

              </div>
            </div>
          )}
        </div>

      </div>

      {/* Attachments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Attachments</h2>
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                
                {(task?.attachments?.length ?? 0) > 0 ? <>
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl text-gray-500">📎</span>
              </div>
                <span className="text-gray-800 dark:text-gray-100">
                {task?.attachments?.[0]?.fileName}
              </span>
              <button className="text-blue-600 hover:text-blue-800 ml-2" onClick={downloadAttachment}>
              <Download/>
            </button>
              </>
                : "" }
              </div>
            </div>
          </div>
          <div className="mt-4">
          <div>
      
    </div>
            
          </div>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Subtasks</h2>
          <>
                
              </>
        </div>

        {/* Line separator under Subtasks heading */}
        <div className="mt-2 border-t-2 border-gray-300 dark:border-gray-600"></div>
        <div className="flex items-center justify-between mt-4"></div>

        <div className="mt-4 space-y-2">
        {isLoadingSubTasks ? (
      <span className="text-gray-500 dark:text-gray-400">Loading subtasks...</span>
    ) : subTasks.length > 0 ? (
      <SubTaskTable subTasks={subTasks} email= {email!} projectId ={projectId!}/>
    ) : (
      <span className="text-gray-500 dark:text-gray-400">No subtasks available.</span>
    )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Comments</h2>
        <div className="mt-2 border-t-2 border-gray-300 dark:border-gray-600"></div>
        <div className="border-2 border-gray-300 p-4 rounded-lg dark:border-gray-600">
          <div className="mt-4 space-y-3">
            <Comments taskId={taskId} email={email!} taskCode = {task?.code!}/>
          </div>
        </div>
      </div>
      <div className="space-y-4">
      <Tabs defaultValue="alerts" className="w-full">
            <TabsList className="grid w-full grid-cols-2 w-[400px] h-[44px]">
              <TabsTrigger value="alerts" className="font-semibold text-lg">Task History</TabsTrigger>
              <TabsTrigger value="activity" className="font-semibold text-lg ">Activity</TabsTrigger>
            </TabsList>
            <div className="mt-2 mb-2 border-t-2 border-gray-300 dark:border-gray-600"></div>

            <TabsContent value="alerts" className="w-full">
              <Card>
              <TaskHistory taskId={taskId} estimatedHours = {String(task?.points)!} task={task} fullPageFlag={true}/>
              </Card>
            </TabsContent>
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardDescription>{task?.title} - {task?.code} Activity</CardDescription>
                  
                </CardHeader>
                <CardContent className="space-y-2">
                  <TaskActivity taskId={task?.id!}/>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
       
      </div>
      
    </div>
  );
};

export default TaskPageFull;
