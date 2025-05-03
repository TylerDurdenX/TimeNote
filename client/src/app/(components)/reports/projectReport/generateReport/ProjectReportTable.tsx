"use client";

import Header from "@/components/Header";

import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Button } from "@mui/material";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TableView from "@/app/(components)/projectsDashboard/[id]/Table";

type Props = {
  email: string;
  closedProjectFlag: boolean;
  data: any[];
};

const ProjectReportTable = ({ data, email, closedProjectFlag }: Props) => {
  localStorage.removeItem("persist:root");

  const { theme } = useTheme();

  let isDarkMode = theme === "dark";

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Project Name",
      flex: 1,
      renderCell: (params) => (
        <Link
          href={`project/${params.row.id}?email=${email}`}
          rel="noopener noreferrer"
          className="text-blue-500 dark:text-white underline font-medium"
          style={{ fontWeight: 500 }}
          onClick={() => {
            sessionStorage.setItem("projectId", params.row.id);
          }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "clientName",
      headerName: "Client Name",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Project Description",
      flex: 1.5,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.6,
    },
    {
      field: "startDate",
      headerName: "Start Date (DD/MM/YYYY)",
      flex: 0.6,
    },
    {
      field: "dueDate",
      headerName: "Due Date (DD/MM/YYYY)",
      flex: 0.6,
    },
    {
      field: "projectManager",
      headerName: "Project Manager",
      flex: 1,
    },
    {
      field: "estimatedHours",
      headerName: "Estimated Hours",
      flex: 0.8,
    },
    {
      field: "consumedHours",
      headerName: "Consumed Hours",
      flex: 0.8,
    },
    {
      field: "hoursOverrun",
      headerName: "Hours Overrun",
      flex: 0.8,
    },
    {
      field: "id",
      headerName: "View Tasks",
      flex: 0.6,
      renderCell: (params) => {
        return (
          <div className="flex justify-center items-center h-full">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="contained"
                  className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-6 py-2 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105"
                  onClick={() => {
                    sessionStorage.setItem("projectName", params.row.name);
                    sessionStorage.setItem("projectId", params.row.id);
                  }}
                >
                  View
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[90vw] lg:max-w-[90vw]  overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{params.row.name}</DialogTitle>
                </DialogHeader>

                <div
                  className="relative w-full max-h-[85vh] overflow-y-auto"
                  //   style={{
                  //     paddingTop: "39.375%",
                  //   }}
                >
                  <TableView
                    projectId={params.row.id}
                    sprint=""
                    assignedTo=""
                    priority=""
                    isTaskOrSubTask="Task"
                    openViewOnly={true}
                  />
                </div>

                <DialogFooter className="w-full justify-between items-center">
                  <div className="absolute flex gap-4 left-10"></div>

                  <div className="flex items-center space-x-2"></div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
  ];

  return (
    <div className="h-full w-full px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header name="Table" isSmallText />
      </div>
      <Card>
        <DataGrid
          rows={data || []}
          columns={columns}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </Card>
    </div>
  );
};

export default ProjectReportTable;
