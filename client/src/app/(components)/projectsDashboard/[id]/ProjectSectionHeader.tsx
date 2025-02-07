import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { PlusSquare } from "lucide-react";
import { useCreateSprintMutation } from "@/store/api";

type Props = {
  name: string;
  isSmallText?: boolean;
  buttonName: string;
  email: string
  projectId: number
};

const ProjectSectionHeader = ({
  name,
  isSmallText = false,
  buttonName,
  email,
  projectId
}: Props) => {

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [createSprint, { isLoading: isLoadingCreateSprint }] =
      useCreateSprintMutation();

  const isFormValid = () => {
    return title && description && startDate && endDate;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the form data to submit
    const formData = {
      title: title,
      description: description,
      startDate: startDate,
      endDate: endDate,
      email: email,
      projectId: Number(projectId)
    };
    try {
      const response = await createSprint(formData);
      toast.success(response.data?.message);
      setTitle('')
      setDescription('')
      setStartDate('')
      setEndDate('')
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating sprint:", err.data.Message);
    }
  };

  return (
    <div className="flex relative w-full pl-5 h-[20px] mb-1 items-center justify-between">
      <h1
        className={`${
          isSmallText ? "text-lg" : "text-2xl"
        } font-semibold dark:text-white`}
      >
        {name}
      </h1>
      <div className="flex items-center space-x-4 mr-5 overflow-x-hidden">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-500">
              <PlusSquare className="h-5 w-5 mr-2 " />
              {buttonName}
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[42vw] lg:max-w-[42vw] max-h-[27vw]">
            <DialogHeader>
              <DialogTitle className="mb-2">Create Sprint</DialogTitle>
            </DialogHeader>

            <div
              className="relative w-full h-full overflow-hidden"
              style={{
                paddingTop: "38.575%",
              }}
            >
              <div className="absolute top-0 left-0 w-[calc(100%)] h-full">
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-3">
                    <div className="grid grid-cols-8 items-center gap-4 mr-1">
                      <Label className="text-center">Sprint Title</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="col-span-7"
                        required
                      />
                      <Label className="text-center">Description</Label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="col-span-7 shadow border"
                      />
                      <Label className="text-center">Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="col-span-3"
                      />
                      <Label className="text-center">End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="col-span-3"
                      />
                      
                    </div>
                  </div>
                  <DialogFooter>
                    <button
                      type="submit"
                      className={`flex w-200px mt-7 justify-center bg-blue-600 rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm 
                                hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${
                                  !isFormValid() || isLoadingCreateSprint
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                }`}
                      disabled={!isFormValid() || isLoadingCreateSprint}
                    >
                      {isLoadingCreateSprint ? "Creating..." : "Create Sprint"}
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
      </div>
    </div>
  );
};

export default ProjectSectionHeader;
