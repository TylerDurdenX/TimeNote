import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusSquare, PresentationIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  useCreateProjectMutation,
  useGetProjectManagerQuery,
} from "@/store/api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  name: string;
  isSmallText?: boolean;
  buttonName?: string;
};

const ProjectsHeader = ({ name, isSmallText = false, buttonName }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [createProject, { isLoading: isLoadingCreateProject }] =
    useCreateProjectMutation();

  const { data, isLoading, isError } = useGetProjectManagerQuery("", {
    refetchOnMountOrArgChange: true,
  });

  const isFormValid = () => {
    return (
      title &&
      description &&
      projectCode &&
      startDate &&
      endDate &&
      projectManager
    );
  };

  const handleChange = (value: string) => {
    setProjectCode(value);
    //const value = e.target.value;
    // const regex = /^[A-Za-z0-9-_]*$/;

    // // Check if the value matches the regex
    // if (regex.test(value)) {
    //   setProjectCode(value); // Update the state only if valid
    // } else {
    //   // Show a toast message when an invalid character is entered
    //   toast.error("Special characters not allowed");
    // }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the form data to submit
    const formData = {
      title: title,
      clientName: clientName,
      description: description,
      projectCode: projectCode,
      startDate: startDate,
      endDate: endDate,
      projectManager: projectManager,
    };
    try {
      const response = await createProject(formData);
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
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setProjectManager("");
      setProjectCode("");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating Project:", err.data.Message);
    }
  };

  return (
    <div className="flex relative w-full pl-5 h-[20px] mb-1 items-center justify-between">
      <h1
        className={`${
          isSmallText ? "text-lg" : "text-2xl"
        } font-semibold dark:text-white flex items-center`}
      >
        <PresentationIcon className="mr-2" />
        {name}
      </h1>
      {buttonName !== "" ? (
        <>
          <div className="flex items-center space-x-4 mr-5">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-500">
                  <PlusSquare className="h-5 w-5 mr-2 " />
                  {buttonName}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[42vw] lg:max-w-[42vw] h-[28vw] overflow-auto">
                <DialogHeader>
                  <DialogTitle className="mb-2">Create Project</DialogTitle>
                </DialogHeader>

                <div
                  className="relative w-full h-full overflow-auto"
                  style={{
                    paddingTop: "60.575%",
                  }}
                >
                  <div className="absolute top-0 left-0 w-[calc(100%)] h-full">
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-3">
                        <div className="grid grid-cols-8 items-center gap-4 mr-1">
                          <Label className="text-center ">
                            Project Name
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-7"
                            required
                          />
                          <Label className="text-center ">Client Name</Label>
                          <Input
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="col-span-7"
                            required
                          />
                          <Label className="text-center">
                            Project Description
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-7 shadow border"
                          />
                          <Label className="text-center ">
                            Project Code
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            value={projectCode}
                            onChange={(e) => {
                              const newValue = e.target.value;

                              handleChange(newValue);
                            }}
                            className="col-span-7"
                            required
                          />
                          <Label className="text-center">
                            Start Date
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="col-span-3"
                          />
                          <Label className="text-center">
                            End Date<span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="col-span-3"
                          />
                          <Label className="text-center">
                            Project Manager
                            <span className="text-red-500 ml-1">*</span>
                          </Label>
                          <Select
                            value={projectManager}
                            onValueChange={(value) => setProjectManager(value)}
                          >
                            <SelectTrigger className="col-span-7 p-2 border rounded-md">
                              <SelectValue placeholder="Select Project Manager" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {data?.map((user) => (
                                  <SelectItem
                                    key={user.username}
                                    value={user.username}
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
                          className={`flex w-200px mt-2 justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
                                hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
                                  !isFormValid() || isLoadingCreateProject
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                }`}
                          disabled={!isFormValid() || isLoadingCreateProject}
                        >
                          {isLoadingCreateProject
                            ? "Creating..."
                            : "Create Project"}
                        </button>
                      </DialogFooter>
                    </form>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default ProjectsHeader;
