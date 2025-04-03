import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React, { useState } from "react";
import { dataGridClassNames } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@mui/material";
import ReportsConfigurationDialog from "./ReportsConfigurationDialog";

type Props = {};

function ReportsConfigurationTable({}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const reports = [
    {
      id: 1,
      title: "Attendance Report",
      description: "Attendance Report of users",
      name: "Attendance Report",
    },
    {
      id: 2,
      title: "Activity Report",
      description: "Activity Report of users",
      name: "Activity Report",
    },
    {
      id: 3,
      title: "Productivity Report",
      description: "Productivity Report of users",
      name: "Productivity Report",
    },
    {
      id: 4,
      title: "Project Report",
      description: "Project and Tasks Report",
      name: "Project Report",
    },
  ];

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
        return (
          <div className="flex justify-center items-center h-full">
            <Dialog>
              <div className="my-3 flex justify-between">
                <DialogTrigger asChild>
                  <Button
                    variant="contained"
                    className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 px-6 py-2 rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105"
                  >
                    Configure
                  </Button>
                </DialogTrigger>
              </div>
              <DialogContent className="max-w-[65vw] mt-5 mb-5 overflow-y-auto">
                <ReportsConfigurationDialog
                  name={params.value}
                  isOpen={isOpen}
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
      />
    </div>
  );
}

export default ReportsConfigurationTable;
