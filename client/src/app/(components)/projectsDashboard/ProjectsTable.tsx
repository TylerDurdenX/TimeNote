'use client'

import Header from "@/components/Header";

import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, } from "@/lib/utils";
import { Button } from "@mui/material";
import { useGetProjectsQuery } from "@/store/api";
import Link from "next/link";

type Props = {
  email: string;
};;

const ProjectsTable = ({ email }: Props) => {
  const { data, isLoading, error} = useGetProjectsQuery(
    { email: email },
    { refetchOnMountOrArgChange: true }
  );


const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Name",
    width: 250,
  },
  {
    field: "description",
    headerName: "Description",
    width: 280,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 130,
    valueFormatter: (params) => {
      const date = new Date(params);
      return date.toISOString().split("T")[0];
    },
  },
  {
    field: "endDate",
    headerName: "Due Date",
    width: 130,
    valueFormatter: (params) => {
      const date = new Date(params);
      return date.toISOString().split("T")[0];
    },
  },
  {
    field: "projectManager",
    headerName: "Project Manager",
    width: 170,
  },
  {
    field: "completionStatus",
    headerName: "Completion Status",
    width: 150,
    renderCell: (params) => {
      const completion = params.value || 0;
      const completionPercentage = Math.min(Math.max(completion, 0), 100); // Ensuring it's between 0 and 100
      return (
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div
            style={{
              backgroundColor: "#e0e0e0", // background color of the bar
              borderRadius: "5px",
              height: "10px", // height of the bar
              width: "80%", // width of the whole bar (adjust according to your requirement)
              marginRight: "5px",
            }}
          >
            <div
              style={{
                backgroundColor: "green", // color for the filled part of the bar
                width: `${completionPercentage}%`, // dynamic width based on the percentage
                height: "100%",
                borderRadius: "5px 0 0 5px", // optional, rounded corners on the left
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
      />
    </div>
  );
};

export default ProjectsTable;
