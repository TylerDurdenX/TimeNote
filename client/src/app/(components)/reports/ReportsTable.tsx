import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@mui/material";
import ReportsDialog from "./ReportsDialog";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Router from "next/router";

type Props = {};

function ReportsTable({}: Props) {
  const userEmail = useSearchParams().get("email");

  const reports = [
    {
      id: 1,
      title: "Attendance Report",
      description: "Attendance Report of users",
      name: "Attendance Report",
    },
    {
      id: 2,
      title: "Timesheet Report",
      description: "Timesheet Report of users",
      name: "Timesheet Report",
    },
    // {
    //   id: 3,
    //   title: "Productivity Report",
    //   description: "Productivity Report of users",
    //   name: "Productivity Report",
    // },
    {
      id: 4,
      title: "Project Report",
      description: "Project Report",
      name: "Project Report",
    },
  ];

  let attendancePage = `/reports/attendanceReport/generateReport?email=${userEmail}`;
  let timesheetPage = `/reports/timesheetReport/generateReport?email=${userEmail}`;
  let projectPage = `/reports/projectReport/generateReport?email=${userEmail}`;

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 3,
    },
    {
      field: "name",
      headerName: "",
      flex: 1,
      renderCell: (params) => {
        const title = params.row.title;
        return (
          <div className="flex justify-center items-center h-full">
            <Dialog>
              <div className="my-3 flex justify-between">
                {/* <DialogTrigger asChild> */}

                <Link
                  href={
                    title === "Attendance Report"
                      ? attendancePage
                      : title === "Timesheet Report"
                      ? timesheetPage
                      : title === "Project Report"
                      ? projectPage
                      : ""
                  }
                >
                  <Button
                    variant="contained"
                    className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-6 py-2 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105"
                    onClick={() => {
                      console.log("1");
                    }}
                  >
                    View Report
                  </Button>
                </Link>
                {/* </DialogTrigger> */}
              </div>
              <DialogContent className="max-w-[65vw] mt-5 mb-5 overflow-y-auto">
                <ReportsDialog name={params.value} email={userEmail!} />
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
  ];

  return (
    <div className="h-full w-full px-4 pb-8 xl:px-6">
      <DataGrid
        rows={reports || []}
        columns={columns}
        className={dataGridClassNames}
        pagination
        sx={dataGridSxStyles(false)}
      />
    </div>
  );
}

export default ReportsTable;
