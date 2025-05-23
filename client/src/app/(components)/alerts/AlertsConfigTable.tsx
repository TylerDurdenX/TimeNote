import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@mui/material";
import { useSearchParams } from "next/navigation";
import AlertsDialog from "./AlertsDialog";

function AlertsConfigTable() {
  const userEmail = useSearchParams().get("email");

  const reports = [
    {
      id: 1,
      title: "Project Timeline Alert",
      description: "Triggers an alert if project is on a delayed Timeline",
      name: "Project Timeline Alert",
    },
    {
      id: 2,
      title: "Timesheet Alert",
      description:
        "Triggers an alert if any person has not logged in the time configured time for a particular day in timesheet",
      name: "Timesheet Alert",
    },
    // {
    //   id: 3,
    //   title: "Productivity Report",
    //   description: "Productivity Report of users",
    //   name: "Productivity Report",
    // },
    {
      id: 4,
      title: "Active Time Alert",
      description:
        "Triggers an alert if the active time of any user is below the configured time",
      name: "Active Time Alert",
    },
  ];

  let attendancePage = `/reports/attendanceReport/generateReport?email=${userEmail}`;
  let timesheetPage = `/reports/timesheetReport/generateReport?email=${userEmail}`;
  let projectPage = `/reports/projectReport/generateReport?email=${userEmail}`;

  const [isOpen, setIsOpen] = React.useState(false);

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
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div className="flex justify-center items-center h-full w-full">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <div className="my-3 flex justify-between w-full">
                <DialogTrigger asChild>
                  <Button
                    variant="contained"
                    className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-6 py-2 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105"
                  >
                    Configure
                  </Button>
                </DialogTrigger>
              </div>
              <DialogContent className="max-w-[55vw] mt-5 mb-5 overflow-y-auto">
                <AlertsDialog
                  name={params.value}
                  email={userEmail!}
                  setIsOpen={setIsOpen}
                />
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

export default AlertsConfigTable;
