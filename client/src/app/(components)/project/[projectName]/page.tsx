"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Download, EllipsisVertical, ChevronLeft } from "lucide-react";
import {
  useCreateSubTaskMutation,
  useDeleteAttachmentMutation,
  useDeleteProjectAttachmentMutation,
  useDownloadAttachmentMutation,
  useDownloadProjectAttachmentMutation,
  useGetProjectManagerQuery,
  useGetProjectQuery,
  useUpdateProjectMutation,
  useUpdateProjectStatusMutation,
  useUploadProjectAttachmentMutation,
} from "@/store/api";
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
import { useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CircularLoading from "@/components/Sidebar/loading";

const ProjectPage = () => {
  const projectId = sessionStorage.getItem("projectId");
  const email = useSearchParams().get("email");

  localStorage.removeItem("persist:root");
  localStorage.removeItem("ally-supports-cache");

  const {
    data: project,
    isLoading,
    error,
  } = useGetProjectQuery(
    { projectId: Number(projectId) },
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

  const [uploadAttachment, { isLoading: isLoadingUploadAttachment }] =
    useUploadProjectAttachmentMutation();
  const [uploadProgress, setUploadProgress] = useState(0);

  const [deleteAttachmentQuery, { isLoading: isLoadingDeleteAttachment }] =
    useDeleteProjectAttachmentMutation();

  const [downloadAttachmentQuery, { isLoading: isLoadingDownloadAttachment }] =
    useDownloadProjectAttachmentMutation();

  const maxSize = 1.5 * 1024 * 1024; // in bytes

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };

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
          email: email!,
          projectId: project?.id!,
          fileBase64: base64String,
          fileName: file.name,
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
          console.log("Error creating role:", err.data.Message);
        }
      }
    }
  };

  const deleteAttachment = async (id: number) => {
    try {
      const response = await deleteAttachmentQuery({
        attachmentId: id,
        email: email!,
        projectId: project?.id!,
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
      console.error("Error Deleting attachment:", err.data.Message);
    }
  };

  function downloadFile(base64String: string, fileName: string) {
    const base64Data = base64String.startsWith("data:")
      ? base64String.split(",")[1]
      : base64String;
    const binaryString = atob(base64Data);
    const byteArray = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: "application/octet-stream" });
    const fileURL = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = fileURL;
    link.download = fileName;

    link.click();

    URL.revokeObjectURL(fileURL);
  }

  const downloadAttachment = async (id: number) => {
    try {
      // Fetch the attachment data
      const response = await downloadAttachmentQuery({ attachmentId: id });

      // Check if response data exists and proceed with the download
      if (response.data?.fileBase64 && response.data?.fileName) {
        downloadFile(response.data.fileBase64, response.data.fileName);
      } else {
        toast.error("File data is missing.");
      }
    } catch (err: any) {
      // Handle any error that occurs during the download process
      toast.error("An error occurred while downloading the file.");
      console.error(err);
    }
  };

  const [isHovered, setIsHovered] = useState(true);
  const [isEditable, setIsEditable] = useState(false);
  const [isEditableProjectName, setIsEditableProjectName] = useState(false);
  const [isDateEditable, setIsDateEditable] = useState(false);
  const [clientName, setClientName] = useState(project?.clientName);
  const [projectName, setProjectName] = useState(project?.projectName);
  const [initialProjectName, setInitialProjectName] = useState(
    project?.projectName
  );
  const [isPMEditable, setIsPMEditable] = useState(false);
  const [isAssigneeHovered, setIsAssigneeHovered] = useState(true);
  const [PM, setPM] = useState(project?.projectManager);
  const [isDescriptionEditable, setIsDescriptionEditable] = useState(false);
  const [isDescriptionHovered, setIsDescriptionHovered] = useState(true);
  const [description, setDescription] = useState(project?.projectDescription);
  const [startDate, setStartDate] = useState(project?.startDate!);
  const [dueDate, setDueDate] = useState(project?.dueDate!);

  const [initialDescription, setInitialDescription] = useState(
    project?.projectDescription
  );
  const [initialStartDate, setInitialStartDate] = useState(project?.startDate!);
  const [initialDueDate, setInitialDueDate] = useState(project?.dueDate!);
  const [initialPM, setInitialPM] = useState(project?.projectManager || "");
  const [initialClientName, setInitialClientName] = useState(
    project?.clientName
  );

  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);

  const [isEditableStatus, setIsEditableStatus] = useState(false);
  const [projectStatus, setProjectStatus] = useState(project?.status || "");
  useCreateSubTaskMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [updateProjectStatus] = useUpdateProjectStatusMutation();

  const { data: users } = useGetProjectManagerQuery("");

  useEffect(() => {
    if (project) {
      setDescription(project?.projectDescription);
      setPM(project?.projectManager);
      setInitialPM(project?.projectManager);
      setStartDate(project?.startDate);
      setDueDate(project?.dueDate);
      setProjectName(project.projectName);
      setInitialProjectName(project.projectName);
      setClientName(project.clientName);
      setInitialClientName(project.clientName);
      setInitialStartDate(project?.startDate);
      setInitialDueDate(project?.dueDate);
      setProjectStatus(project.status);
      setIsSaveButtonEnabled(false);
    }
  }, [project]);

  useEffect(() => {
    const isChanged =
      description !== initialDescription ||
      PM !== initialPM ||
      clientName !== initialClientName ||
      startDate !== initialStartDate ||
      dueDate !== initialDueDate ||
      projectName !== initialProjectName;

    setIsSaveButtonEnabled(isChanged);
  }, [
    description,
    PM,
    startDate,
    dueDate,
    projectName,
    initialProjectName,
    initialStartDate,
    initialDueDate,
    initialDescription,
    initialPM,
    clientName,
    initialClientName,
  ]);

  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleEditProjectNameClick = () => {
    setIsEditableProjectName(true);
  };

  const handleDateEditClick = () => {
    setIsDateEditable(true);
  };

  const handleEditPMClick = () => {
    setIsPMEditable(true);
  };

  const handleEditDescriptionClick = () => {
    setIsDescriptionEditable(true);
  };

  const handleBlur = () => {
    setIsPMEditable(false);
    setIsEditable(false);
    setIsHovered(true);
    setIsDateEditable(false);
    setIsEditableProjectName(false);
  };

  const handlePMBlur = () => {
    setIsPMEditable(false);
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

  const setProjectStatusFromDropdown = async (
    projectId: number,
    toStatus: string
  ) => {
    try {
      const response = await updateProjectStatus({
        projectId,
        status: toStatus,
        email: email!,
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

  const handleSaveChanges = async (event: React.FormEvent) => {
    event.preventDefault();

    const updateProjectData = {
      email: email!,
      projectId: project?.id!,
      projectManager: PM!,
      clientName: clientName!,
      projectDescription: description!,
      startDate: startDate,
      dueDate: dueDate,
      projectName: projectName!,
    };
    try {
      const response = await updateProject(updateProjectData);

      if (response.error) {
        if ("data" in response.error) {
          const errorData = response.error.data as {
            status: string;
            message: string;
          };

          if (errorData.status === "Error" || errorData.status === "Fail") {
            toast.error(errorData.message);
          }
        } else {
          toast.error("An unexpected error occurred");
        }
      } else {
        setIsSaveButtonEnabled(false);
        toast.success(response.data?.message);
      }
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  const projectStatusList = ["Pending", "In Progress", "Completed"];

  if (isLoading)
    return (
      <div>
        <CircularLoading />
      </div>
    );

  return (
    <div className="w-full max-h-full overflow-y-auto mx-auto p-6 bg-white rounded-xl shadow-lg space-y-6 dark:bg-gray-800 dark:text-white">
      {/* Task Title and Description */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button onClick={() => window.history.back()}>
            <ChevronLeft className="mr-5" />
          </button>
          {isEditableProjectName ? (
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)} // Update state as user types
              onBlur={handleBlur} // Trigger onBlur event when user clicks outside
              onKeyDown={handleKeyDown} // Trigger onBlur when Enter key is pressed
              autoFocus // Automatically focus the input when it's rendered
              className="border p-1 rounded w-[50vh]" // Style the input
            />
          ) : (
            <div className="flex items-center">
              {/* Display the text */}
              <div className="flex items-center">
                <h1 className="text-3xl font-semibold">
                  {projectName} - {project?.projectCode}
                </h1>

                {/* Pencil icon that appears when hovering over the parent */}
                <Pencil
                  size={16}
                  className={`ml-2 cursor-pointer ${
                    isHovered ? "opacity-100" : "opacity-0"
                  } transition-opacity`}
                  onClick={handleEditProjectNameClick}
                />
              </div>
            </div>
          )}
          <div className="flex space-x-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-8 w-6 mt-1 flex-shrink-0 items-center justify-center dark:text-neutral-500">
                <EllipsisVertical size={52} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Set Project Status :</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setProjectStatusFromDropdown(project?.id!, "Pending");
                  }}
                >
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setProjectStatusFromDropdown(project?.id!, "In Progress");
                  }}
                >
                  In Progress
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setProjectStatusFromDropdown(project?.id!, "Completed");
                  }}
                >
                  Completed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setProjectStatusFromDropdown(project?.id!, "Closed");
                  }}
                >
                  Close Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <div className="text-sm flex justify-between items-center">
            {isDateEditable ? (
              <div className="flex gap-4">
                {" "}
                {/* Use flex and gap to space inputs */}
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
                  <span className="cursor-pointer">
                    {formatDate(startDate)} - {formatDate(dueDate)}
                  </span>

                  {/* Pencil icon that appears when hovering over the parent */}
                  <Pencil
                    size={16}
                    className={`ml-2 cursor-pointer ${
                      isHovered ? "opacity-100" : "opacity-0"
                    } transition-opacity`}
                    onClick={handleDateEditClick}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="text-sm relative">
            {/* PM Editable Section */}
            {isPMEditable ? (
              <select
                value={PM}
                onChange={(e) => setPM(e.target.value)} // Update state when selecting an assignee
                onBlur={handlePMBlur} // Trigger onBlur event when user clicks outside
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
                <span className="cursor-pointer">Project Manager: {PM}</span>

                <Pencil
                  size={16}
                  className={`ml-2 cursor-pointer opacity-200 transition-opacity`}
                  onClick={handleEditPMClick}
                />
              </div>
            )}
          </div>

          <div className="text-sm relative">
            {isEditableStatus ? (
              <select
                value={projectStatus}
                onChange={(e) => setProjectStatus(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="border p-1 rounded w-40"
              >
                {projectStatusList?.map((obj) => (
                  <option key={obj} value={obj}>
                    {obj}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center">
                <div className="flex items-center">
                  <span className="cursor-pointer">
                    Status: {projectStatus}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="text-sm relative">
            {/* Display editable content */}
            {isEditable ? (
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)} // Update state as user types
                onBlur={handleBlur} // Trigger onBlur event when user clicks outside
                onKeyDown={handleKeyDown} // Trigger onBlur when Enter key is pressed
                autoFocus // Automatically focus the input when it's rendered
                className="border p-1 rounded w-[30vh]" // Style the input
              />
            ) : (
              <div className="flex items-center">
                {/* Display the text */}
                <div className="flex items-center">
                  <span className="cursor-pointer">
                    Client Name: {clientName}
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
              <div className="space-y-2">
                {" "}
                {/* Use space-y-2 to add vertical spacing between attachments */}
                {(project?.projectAttachments?.length ?? 0) > 0 ? (
                  <>
                    {project?.projectAttachments.map((attachment, index) => {
                      return (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          {/* Attachment icon */}
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-2xl text-gray-500">📎</span>
                          </div>
                          {/* Attachment file name */}
                          <span className="text-gray-800 dark:text-gray-100">
                            {attachment?.fileName}
                          </span>
                          {/* Download button */}
                          <button
                            className="text-blue-600 hover:text-blue-800 ml-2"
                            onClick={async () => {
                              await downloadAttachment(attachment.id);
                            }}
                          >
                            <Download />
                          </button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="text-blue-600 hover:text-blue-800 ml-2">
                                Delete
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-700">
                                  Do you want to remove the Attachment :{" "}
                                  {attachment.fileName} ?
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
                                <AlertDialogAction
                                  onClick={async () => {
                                    await deleteAttachment(attachment.id); // Await your async function here
                                  }}
                                >
                                  Yes
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  "Please upload a document of size less than 1 MB"
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div>
              {isLoadingUploadAttachment && (
                <Progress value={uploadProgress} max={100} color="blue" />
              )}
              {(project?.projectAttachments?.length ?? 0) > 2 ? (
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
    </div>
  );
};

export default ProjectPage;
