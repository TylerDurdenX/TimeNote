import Header from "@/components/Header";
import { useGetProjectTasksQuery } from "@/store/api";
import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TaskPage from "./TaskPage";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import { Button } from "@mui/material";
import { FileDown } from "lucide-react";
import { title } from "process";

type Props = {
  projectId: string;
  sprint: string;
  assignedTo: string;
  priority: string;
};

const TableView = ({ projectId, sprint, assignedTo, priority }: Props) => {
  const userEmail = useSearchParams().get("email");

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      width: 100,
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        let bgColor, textColor;

        switch (params.value) {
          case "To Do":
            bgColor = "#2563EB";
            textColor = "#ffffff";
            break;
          case "Work In Progress":
            bgColor = "#059669";
            textColor = "#ffffff";
            break;
          case "Under Review":
            bgColor = "#D97706";
            textColor = "#ffffff";
            break;
          case "Completed":
            bgColor = "#000000";
            textColor = "#ffffff";
            break;
          default:
            bgColor = "#E5E7EB";
            textColor = "#000000";
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
      width: 130,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 130,
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      width: 130,
    },
    {
      field: "author",
      headerName: "Author",
      width: 150,
      renderCell: (params) => params.value.username || "Unknown",
    },
    {
      field: "assignee",
      headerName: "Assignee",
      width: 150,
      renderCell: (params) => params.value.username || "Unassigned",
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 75,
      renderCell: (params) => {
        const priority = params.value;

        let bgColor, textColor;

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
            bgColor = "bg-blue-200";
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
                <TaskPage
                  taskId={params.row.id}
                  email={userEmail!}
                  projectId={params.row.projectId}
                />
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
  ];

  const {
    data: tasks,
    isLoading,
    error,
  } = useGetProjectTasksQuery({
    projectId: projectId,
    sprint,
    assignedTo,
    priority,
  });

  const removeColumns = (data: any[], columnsToExclude: string[]) => {
    return data.map((item) => {
      let newItem = { ...item };
      columnsToExclude.forEach((col) => {
        delete newItem[col];
      });
      return newItem;
    });
  };

  const handleExportToExcel = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const columnsToExclude = [
      "projectId",
      "authorUserId",
      "assignedUserId",
      "sprintId",
      "author",
      "comments",
    ];
    const filteredData = removeColumns(tasks || [], columnsToExclude);

    const flattenedTasks = filteredData.map((task) => {
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        tags: task.tags,
        startDate: task.startDate,
        dueDate: task.dueDate,
        points: task.points,
        assigneeName: task.assignee.username,  
        assigneeEmail: task.assignee.email, 
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(flattenedTasks || []);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, "data-grid-export.xlsx");
  };

  const isDarkMode = false;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <div className="h-540px e-full px-4 pb-8 xl:px-6">
      <div className="pt-5 flex justify-between items-center mb-2">
        <Header name="Table" isSmallText />

        <button
          className="flex items-center justify-center text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-6 py-2 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 whitespace-nowrap"
          style={{ height: "50px", padding: "0 16px" }}
          onClick={handleExportToExcel}
        >
          <FileDown size={25} />
          <span className="ml-2">Export to Excel</span>
        </button>
      </div>
      <DataGrid
        rows={tasks || []}
        columns={columns}
        className={dataGridClassNames}
        sx={dataGridSxStyles(isDarkMode)}
      />
    </div>
  );
};

export default TableView;
