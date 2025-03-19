'use client'

import React, { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, } from "@/lib/utils";
import { Button, DialogTitle,  } from "@mui/material";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Clock9} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Cancel, CheckCircle } from "@mui/icons-material";
import { TimesheetResponse } from "@/store/interfaces";
import { Card } from "@/components/ui/card";
import { useGetUsersTimesheetDataQuery, } from "@/store/api";
import TimesheetDataTable from "./TimesheetDataTable";

type Props = {
  email: string;
  selectedDate: Date
};

interface RowData {
    id: number;
    consumedHours: string;
    userId: number;
    username: string;
    projectId?: number; 
  }

const UsersTimesheetTable = ({ email , selectedDate}: Props) => {

      const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RowData | null>(null);

  const handleViewDetails = (row: RowData) => {
    setSelectedRow(row);
    setOpen(true); 
  };

      const { data: usersTimesheetEntry, isLoading, error} = useGetUsersTimesheetDataQuery(
        { email: email!, date: selectedDate.toString()},
        { refetchOnMountOrArgChange: true }
      );

      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
    
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0"); 
        const year = date.getFullYear();
    
        return `${day}/${month}/${year}`;
      };
      

const columns: GridColDef[] = [ 
  {
    field: "username",
    headerName: "User",
    flex: 1.5
  },
  {
    field: "consumedHours",
    headerName: "Logged Hours",
    flex: 1
  },
  {
    field: "approvedHours",
    headerName: "Approved Hours",
    flex: 1
  },
  {
    field: "date",
    headerName: "Date",
    flex: 1,
    renderCell: (params) => {
      return formatDate(selectedDate.toString()); 
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    flex: 1,
    renderCell: (params) => {
      const rowData = params.row;
      return (
        <div
          style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          className=" w-full"
        >
          <Dialog open={open} onOpenChange={setOpen}>
            <div className="my-3 flex justify-center items-center">
            <DialogTrigger asChild>
              <Button
                variant="contained"
                className="mb-5"
                color="primary"
                size="small"
                onClick={() => handleViewDetails(params.row)} // Passing the current row's data
                sx={{
                  backgroundColor: '#3f51b5', // Blue color
                  '&:hover': { backgroundColor: '#2c387e' },
                  borderRadius: '8px',
                }}
              >
                View Details
              </Button>
            </DialogTrigger>
  
            {/* Dialog Content */}
            <DialogContent className="max-w-[65vw] max-h-[80vw] mt-5 mb-5 overflow-y-auto"> {/* Set width to 70% of viewport height */}
              <DialogHeader>
                <DialogTitle>
                  {formatDate(selectedDate.toString())} - {rowData.username}
                </DialogTitle>
                <DialogDescription className="text-gray-700 overflow-y-auto">
                  <TimesheetDataTable email={email} selectedDate={selectedDate} name={rowData.username} dialogFlag={true}/>
                </DialogDescription>
              </DialogHeader> 
  
              <DialogFooter>
                <Button
                  onClick={() => setOpen(false)}
                  variant="contained"
                  sx={{
                    backgroundColor: '#3f51b5', // Blue color
                    '&:hover': { backgroundColor: '#2c387e' },
                    borderRadius: '8px',
                  }}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
            </div>
          </Dialog>
        </div>
      );
    },
  }
  
]

  return (
    <>
    <div className="h-full w-full px-4 pb-8 xl:px-6">
        
      <DataGrid
        rows={usersTimesheetEntry || []}
        columns={columns}
        className={dataGridClassNames}
      />
    </div>
    </>
  );
};

export default UsersTimesheetTable;
