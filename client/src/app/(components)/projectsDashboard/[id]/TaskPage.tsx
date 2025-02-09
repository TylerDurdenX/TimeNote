import React, { useEffect, useRef, useState } from "react";
import { PlusSquare, Pencil, Download } from "lucide-react";
import { Task as TaskType } from "@/store/interfaces";
import { useDeleteAttachmentMutation, useDownloadAttachmentMutation, useGetProjectUsersQuery, useGetTaskQuery, useUpdateTaskMutation, useUploadAttachmentMutation } from "@/store/api";
import Comments from "./Comments";
import { toast } from "sonner";
import { Typography } from "@mui/material";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Props = {
  taskId: number;
  email: string;
  projectId: string;
};

const TaskPage = ({ taskId, email, projectId }: Props) => {
  const [subTasks, setSubTasks] = useState<string[]>([]); 
  const [comments, setComments] = useState<string[]>([]); 
  const [newSubtask, setNewSubtask] = useState<string>(""); 
  const [newComment, setNewComment] = useState<string>(""); 
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  const handleAddSubtask = () => {
    if (newSubtask.trim() !== "") {
      setSubTasks([...subTasks, newSubtask]);
      setNewSubtask("");
    }
  };

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      setComments([...comments, newComment]);
      setNewComment("");
    }
  };

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

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.xls', '.xlsx'];

  const [uploadAttachment, { isLoading: isLoadingUploadAttachment }] =
  useUploadAttachmentMutation();

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
        reject(new Error('Error converting file to base64'));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension && !allowedExtensions.includes(`.${fileExtension}`)) {
        toast.error('File extension not allowed!');
      } 
      else if (file.size > maxSize) {
        toast.error('File size must be less than 1.5 MB!');
      } else {        
          const base64String = await fileToBase64(file);
          const uploadAttachmentBody = {
            taskId: taskId,
            fileBase64: base64String,
            fileName: file.name,
            uploadedBy: email ,
          };
          try {

            const response = await uploadAttachment(uploadAttachmentBody);
            // @ts-ignore
            if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
                    // @ts-ignore
                    toast.error(response.error?.data.message)
                  }else{
                    toast.success(response.data?.message);
                  }
          } catch (err: any) {
            toast.error(err.data.message);
            console.error("Error creating role:", err.data.Message);
          }
      }
    }
  };

  const deleteAttachment = (async() => {
    try {
      const response = await deleteAttachmentQuery({taskId})
      // @ts-ignore
      if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
              // @ts-ignore
              toast.error(response.error?.data.message)
            }else{
              toast.success(response.data?.message);
            }
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  })

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
    link.download = fileName;  // Set the download attribute with the desired file name
  
    link.click();
  
    URL.revokeObjectURL(fileURL);
  }

  const downloadAttachment = (async() => {
    try {

      const response = await downloadAttachmentQuery({taskId})
      downloadFile(response.data?.fileBase64!, response.data?.fileName!)

    } catch (err: any) {
      toast.error(err.data);
      console.error(err);
    }
  })

  const {
    data: task,
    isLoading,
    error,
  } = useGetTaskQuery({ taskId }, { refetchOnMountOrArgChange: true });

  const { data: users } = useGetProjectUsersQuery({ projectId: projectId });

  const taskTagsSplit = task?.tags ? task.tags.split(",") : [];

  const [isEditable, setIsEditable] = useState(false);
  const [editedText, setEditedText] = useState(task?.points); 
  const [isHovered, setIsHovered] = useState(false);
  const [isAssigneeEditable, setIsAssigneeEditable] = useState(false);
  const [isAssigneeHovered, setIsAssigneeHovered] = useState(false);
  const [assignee, setAssignee] = useState(task?.assignee?.username);
  const [isDescriptionEditable, setIsDescriptionEditable] = useState(false);
  const [isDescriptionHovered, setIsDescriptionHovered] = useState(false);
  const [description, setDescription] = useState(task?.description || "");

  const [initialDescription, setInitialDescription] = useState(
    task?.description || ""
  );
  const [initialAssignee, setInitialAssignee] = useState(
    task?.assignee?.username || ""
  );
  const [initialPoints, setInitialPoints] = useState(task?.points || "");

  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);

useEffect(() => {
  if (task) {
    setDescription(task.description || "");
    setAssignee(task?.assignee?.username || "");
    setEditedText(task?.points)
    setInitialAssignee(task?.assignee?.username || "");
    setInitialDescription(task.description || "");
    setInitialPoints(task.points || "");
    
    setIsSaveButtonEnabled(false);
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

  const handleSaveChanges = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the form data to submit
    const updateTaskData = {
      taskId: taskId,
      taskPoints: editedText,
      assignee: assignee,
      taskDescription: description,
    };
    try {
      const response = await updateTask(updateTaskData);
      // @ts-ignore
      if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
              // @ts-ignore
              toast.error(response.error?.data.message)
            }else{
              toast.success(response.data?.message);
            }
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

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
                  onMouseEnter={() => setIsHovered(true)} // Trigger hover enter
                  onMouseLeave={() => setIsHovered(false)} // Trigger hover leave
                >
                  <span className="cursor-pointer">
                    Task Points: {editedText}
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
                  onMouseEnter={() => setIsAssigneeHovered(true)}
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
          <button
            onClick={handleSaveChanges}
            disabled={!isSaveButtonEnabled} 
            className={`mt-2 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-700 ${
              !isSaveButtonEnabled && "opacity-50 cursor-not-allowed"
            }`}
          >
            Save Changes
          </button>
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
                : "Please upload a document of size less than 1 mb" }
              </div>

              {(task?.attachments?.length ?? 0) > 0 ? 
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
                  <AlertDialogAction onClick={deleteAttachment} >
                    Yes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
              : ""}
            </div>
          </div>
          <div className="mt-4">
          <div>
      {/* Button to trigger file input */}
      {(task?.attachments?.length ?? 0) > 0 ? ""
      : 
      <button
      className="flex items-center justify-start w-full p-3 text-blue-600 hover:text-blue-800 rounded-md hover:bg-gray-200 focus:outline-none transition duration-200"
      onClick={() => document.getElementById("fileInput")?.click()}
    >
      + Add Attachment
    </button>
    }
      

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
          <button className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-500">
            <PlusSquare className="h-5 w-5 mr-2" />
            Add Subtasks
          </button>
        </div>

        {/* Line separator under Subtasks heading */}
        <div className="mt-2 border-t-2 border-gray-300 dark:border-gray-600"></div>
        <div className="flex items-center justify-between mt-4"></div>

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
