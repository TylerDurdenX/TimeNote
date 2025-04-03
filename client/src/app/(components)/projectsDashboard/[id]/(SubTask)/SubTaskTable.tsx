import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Button } from "@mui/material";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { SubTask } from "@/store/interfaces";
import SubTaskPage from "./SubTaskPage";
import { useTheme } from "next-themes";

type Props = {
  subTasks: SubTask[];
  email: string;
  projectId: string;
};

const SubTaskTable = ({ subTasks, email, projectId }: Props) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
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
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      renderCell: (params) => {
        return formatDate(params.value);
      },
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 1,
      renderCell: (params) => {
        return formatDate(params.value);
      },
    },
    {
      field: "consumedTime",
      headerName: "Consumed Time",
      flex: 1,
    },
    {
      field: "author",
      headerName: "Author",
      flex: 1,
      renderCell: (params) => params.value.username || "Unknown",
    },
    {
      field: "assignee",
      headerName: "Assignee",
      flex: 1,
      renderCell: (params) => params.value.username || "Unassigned",
    },
    {
      field: "id",
      headerName: "",
      flex: 1,
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
                <SubTaskPage
                  subTaskId={params.value}
                  email={email}
                  projectId={projectId}
                />
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
  ];

  const { theme } = useTheme();

  let isDarkMode = theme === "dark";

  return (
    <div className="h-540px e-full px-4 pb-8 xl:px-6">
      <DataGrid
        rows={subTasks || []}
        columns={columns}
        className={dataGridClassNames}
        sx={dataGridSxStyles(isDarkMode)}
      />
    </div>
  );
};

export default SubTaskTable;
