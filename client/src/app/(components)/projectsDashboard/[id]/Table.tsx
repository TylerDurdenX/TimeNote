import Header from '@/components/Header'
import { useGetProjectTasksQuery } from '@/store/api'
import React from 'react'
import {DataGrid, GridColDef} from '@mui/x-data-grid'
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils'
import { Button } from '@mui/material'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import TaskPage from './TaskPage'
import { useSearchParams } from 'next/navigation'

type Props = {
    projectId: string
    sprint: string
    assignedTo: string
    priority: string
}

const TableView = ({projectId,sprint, assignedTo, priority}: Props) => {

  const userEmail = useSearchParams().get("email");

  const columns: GridColDef[] =[
    {
        field: "title",
        headerName: "Title",
        width: 100
    },   
    {
        field: "description",
        headerName: "Description",
        width: 200
    },
    {
        field: "status",
        headerName: "Status",
        width: 150,
        renderCell: (params) => {
          let bgColor, textColor;
      
          // Determine the color based on the status value
          switch (params.value) {
            case "To Do":
              bgColor = "#2563EB"; // Blue
              textColor = "#ffffff"; // White text color for contrast
              break;
            case "Work In Progress":
              bgColor = "#059669"; // Green
              textColor = "#ffffff";
              break;
            case "Under Review":
              bgColor = "#D97706"; // Orange
              textColor = "#ffffff";
              break;
            case "Completed":
              bgColor = "#000000"; // Black
              textColor = "#ffffff"; // White text for black background
              break;
            default:
              bgColor = "#E5E7EB"; // Default gray if status is unknown
              textColor = "#000000"; // Default text color
          }
      
          return (
            <span
              className="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
              style={{
                backgroundColor: bgColor,
                color: textColor,
              }}
            >
              {params.value}
            </span>
          );
        },
      },         
    {
        field: "tags",
        headerName: "Tags",
        width: 130
    },
    {
        field: "startDate",
        headerName: "Start Date",
        width: 130
    },
    {
        field: "dueDate",
        headerName: "Due Date",
        width: 130
    },
    {
        field: "author",
        headerName: "Author",
        width: 150,
        renderCell: (params) => params.value.username || "Unknown"
    },
    {
        field: "assignee",
        headerName: "Assignee",
        width: 150,
        renderCell: (params) => params.value.username || "Unassigned"
    },
    {
        field: "priority",
        headerName: "Priority",
        width: 75,
        renderCell: (params) => {
          const priority = params.value;  // Get the priority value
      
          let bgColor, textColor;
      
          // Determine the color based on the priority value
          switch (priority) {
            case "Urgent":
              bgColor = "bg-red-200";
              textColor = "text-red-700";
              break;
            case "High":
              bgColor = "bg-orange-200";
              textColor = "text-orange-700";
              break;
            case "Medium":
              bgColor = "bg-yellow-200";
              textColor = "text-yellow-700";
              break;
            case "Low":
              bgColor = "bg-green-200";
              textColor = "text-green-700";
              break;
            default:
              bgColor = "bg-blue-200";  // Default color if priority is not one of the above
              textColor = "text-blue-700";
          }
      
          return (
            <span
              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${bgColor} ${textColor}`}
            >
              {params.value}
            </span>
          );
        },
      },   
      {
        field: "taskId",
        headerName: "",
        width: 150,
        renderCell: (params) => {
          return (
            <div className="flex justify-center items-center h-full">
                <Dialog>
            <div className="my-3 flex justify-between">
              <DialogTrigger asChild>
              <Button
                variant="contained"
                className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-6 py-2 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105"
              >
                View
              </Button>
              </DialogTrigger>
              
            </div>
            <DialogContent className="max-w-[85vw] mt-5 mb-5 overflow-y-auto">
              <TaskPage taskId= {params.row.id} email={userEmail!} projectId={params.row.projectId}/>
            </DialogContent>
          </Dialog>
              
              
            </div>
          );
        },
      },
]


const isDarkMode = false// useAppSelector((state) => state.global.isDarkMode)
    const {
            data: tasks,
            isLoading,
            error,
          } = useGetProjectTasksQuery({ projectId: projectId , sprint, assignedTo, priority});

    if(isLoading) return (<div>Loading...</div>)
    if(error) return (<div>An error occurred while fetching tasks</div>) 

  return (
    <div className='h-540px e-full px-4 pb-8 xl:px-6'>
        <div className='pt-5'>
            <Header name='Table' isSmallText/>
        </div>
        <DataGrid 
        rows={tasks || []}
        columns={columns}
        className={dataGridClassNames}
        sx={dataGridSxStyles(isDarkMode)}
        />
    </div>
  )
}

export default TableView