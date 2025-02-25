'use client'

import Header from "@/components/Header";

import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, } from "@/lib/utils";
import { Button, DialogTitle } from "@mui/material";
import { useGetProjectsQuery, useGetTimesheetDataQuery } from "@/store/api";
import Link from "next/link";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { PlusSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Cancel, CheckCircle } from "@mui/icons-material";
import TimesheetHeader from "./TimesheetHeader";

type Props = {
  email: string;
};

const ProjectsTable = ({ email }: Props) => {

    const [isOpen, setIsOpen] = useState(false)
    const [task, setTask] = useState('')
    const [completionPercentage, setCompletionPercentage] = useState('')
    const [consumedHours, setConsumedHours] = useState('')

    const isFormValid = () => {
        return task && completionPercentage && consumedHours
    };
    
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
    
        const formData = {
          task: task,
          completionPercentage: completionPercentage,
          consumedHours: consumedHours,
        };
        try {
        //   const response = await createTask(formData);
        //   setTask('')
        //   setCompletionPercentage('')
        //   setConsumedHours('')
    
        //   // @ts-ignore
        //   if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
        //     // @ts-ignore
        //     toast.error(response.error?.data.message)
        //   }else{
        //     // @ts-ignore
        //     toast.success(response.data?.message);
        //   }
        //   setIsOpen(false);
        } catch (err: any) {
          toast.error(err.data.message);
          console.error("Error creating role:", err.data.Message);
        }
      };


  const { data, isLoading, error} = useGetTimesheetDataQuery(
    { email: email },
    { refetchOnMountOrArgChange: true }
  );

const columns: GridColDef[] = [
  {
    field: "task",
    headerName: "Task",
    flex: 3,
    renderCell: (params) => (
      <Link href={`project/${params.value}?email=${email}`} 
      rel="noopener noreferrer"
      style={{ color: 'blue' ,textDecoration: 'underline', fontWeight: 500}}
      onClick={() => {
        sessionStorage.setItem("projectId", params.row.id)
      }}>
        {params.value}
      </Link>
    ),
  },  
  {
    field: "completionPercentage",
    headerName: "Completion Percentage",
    flex: 1.5
  },
  {
    field: "consumedHours",
    headerName: "Consumed Hours",
    flex: 1
  },
  {
    field: "approvalStatus",
    headerName: "Approval Status",
    flex: 1,
    renderCell: (params) => {
        // You can access the value of the cell here using params.value
        if (params.value === 'NA') {
          return (<><CheckCircle style={{ color: 'green' }} /> Approved</>) ;
        } else if (params.value === 'No') {
          return (<><Cancel style={{ color: 'red' }} /> Pending</>);
        } else {
            return (<><CheckCircle style={{ color: 'green' }} /> Approved</>);
        }
      },
  },
]

  return (
    <>
    <div className="h-full w-full px-4 pb-8 xl:px-6">
        <div className="w-full flex items-center justify-center">
            <TimesheetHeader hasFilters={true} name ='Timesheet'/>
        </div>
      <DataGrid
        rows={data || []}
        columns={columns}
        className={dataGridClassNames}
      />
    </div>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-500">
              <PlusSquare className="h-5 w-5 mr-2 " />
              Add Timesheet Entry
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[42vw] lg:max-w-[42vw] max-h-[27vw]">
            <DialogHeader>
              <DialogTitle className="mb-2">Add Task in Timesheet</DialogTitle>
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
                      <Label className="text-center col-span-2">Task</Label>
                      <Input
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        className="col-span-6"
                        placeholder="Enter the task detail"
                        required
                      />
                      <Label className="text-center col-span-2">Completion Percentage</Label>
                      <Input
                        value={completionPercentage}
                        placeholder="Enter a value between 0 to 100"
                        onChange={(e) => setCompletionPercentage(e.target.value)}
                        className="col-span-6"
                      />
                      <Label className="text-center col-span-2">Consumed Hours</Label>
                      <Input
                        value={consumedHours}
                        placeholder="Enter a number"
                        onChange={(e) => setConsumedHours(e.target.value)}
                        className="col-span-6"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    {/* <button
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
                    </button> */}
                  </DialogFooter>
                </form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    </>
  );
};

export default ProjectsTable;
