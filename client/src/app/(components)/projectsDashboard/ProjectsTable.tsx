'use client'

import Header from "@/components/Header";

import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles, } from "@/lib/utils";
import { Button } from "@mui/material";
import { useGetProjectsQuery } from "@/store/api";
import Link from "next/link";
import { useTheme } from "next-themes";

type Props = {
  email: string;
};;

const ProjectsTable = ({ email }: Props) => {
  const { data, isLoading, error} = useGetProjectsQuery(
    { email: email },
    { refetchOnMountOrArgChange: true }
  );

  const {theme} = useTheme()

  let isDarkMode = theme==="dark"


const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Project Name",
    flex: 1,
    renderCell: (params) => (
      <Link href={`project/${params.value}?email=${email}`} 
      rel="noopener noreferrer"
      className="text-blue-500 dark:text-white underline font-medium"
      style={{fontWeight: 500}}
      onClick={() => {
        sessionStorage.setItem("projectId", params.row.id)
      }}>
        {params.value}
      </Link>
    ),
  },  
  {
    field: "clientName",
    headerName: "Client Name",
    flex: 1
  },
  {
    field: "description",
    headerName: "Project Description",
    flex: 1.5
  },
  {
    field: "status",
    headerName: "Status",
    flex: 1
  },
  {
    field: "startDate",
    headerName: "Start Date",
    flex: 1,
    valueFormatter: (params) => {
      const date = new Date(params);
      return date.toISOString().split("T")[0];
    },
  },
  {
    field: "endDate",
    headerName: "Due Date",
    flex: 1,
    valueFormatter: (params) => {
      const date = new Date(params);
      return date.toISOString().split("T")[0];
    },
  },
  {
    field: "projectManager",
    headerName: "Project Manager",
    flex: 1,
  },
  {
    field: "completionStatus",
    headerName: "Completion Status",
    flex: 1.6,
    renderCell: (params) => {
      const completion = params.value || 0;
      const completionPercentage = Math.min(Math.max(completion, 0), 100); 
      return (
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div
            style={{
              backgroundColor: "#e0e0e0", 
              borderRadius: "5px",
              height: "10px", 
              width: "80%",
              marginRight: "5px",
            }}
          >
            <div
              style={{
                backgroundColor: "green", 
                width: `${completionPercentage}%`, 
                height: "100%",
                borderRadius: "5px 0 0 5px", 
              }}
            />
          </div>
          <span>{completionPercentage}%</span>
        </div>
      );
    },
  },
  {
    field: "id",
    headerName: "",
    width: 150,
    renderCell: (params) => {
      return (
        <div className="flex justify-center items-center h-full">
            <Link href={`/projectsDashboard/${params.value}?email=${email}`}>
            <Button
            variant="contained"
            className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-6 py-2 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105"
            onClick={() => {
              sessionStorage.setItem("projectName", params.row.name);
            }}
          >
            View
          </Button>
              </Link>
        </div>
      );
    },
  },
]


  return (
    <div className="h-full w-full px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header name="Table" isSmallText />
      </div>
      <DataGrid
        rows={data || []}
        columns={columns}
        className={dataGridClassNames}
        sx={dataGridSxStyles(isDarkMode)}
      />
    </div>
  );
};

export default ProjectsTable;
