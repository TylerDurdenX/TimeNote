import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React from 'react'
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@mui/material';

const AlertsPage = () => {
  
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
        field: "triggeredDate",
        headerName: "Triggered Date",
        flex: 1, 
        
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
                    View Details
                  </Button>
                </DialogTrigger>
              </div>
              <DialogContent className="max-w-[85vw] mt-5 mb-5 overflow-y-auto">
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
        rows={[]}
        columns={columns}
        className={dataGridClassNames}
      />
    </div>
  )
}

export default AlertsPage