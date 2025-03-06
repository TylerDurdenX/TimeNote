'use client'

import Header from "@/components/Header";

import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, } from "@/lib/utils";
import { useGetTimesheetDataQuery, useViewTimesheetDataQuery } from "@/store/api";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { Clock9, PlusSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Cancel, CheckCircle } from "@mui/icons-material";
import { TimesheetResponse } from "@/store/interfaces";
import { Card } from "@/components/ui/card";

type Props = {
  email: string;
  selectedDate: Date
  name: string
};

const TimesheetDataTable = ({ email , selectedDate, name}: Props) => {

    const { data, isLoading, error, refetch} = useViewTimesheetDataQuery(
          { name: name, date: selectedDate.toString()},
          { refetchOnMountOrArgChange: true }
        );

    function validateTimeFormat(time: string) {
      const regex = /^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/;
      return regex.test(time);
    }

const columns: GridColDef[] = [
  {
    field: "task",
    headerName: "Task",
    flex: 3,
    renderCell: (params) => {
      const rowData = params.row;
      const linkTo = rowData.projectId ? `timesheet/${rowData.projectId}/${rowData.taskCode}?email=${email}` : '';
        return (
      <Dialog>
      <DialogTrigger asChild>
        <button className="text-blue-600 underline font-medium text-lg hover:text-blue-700 transition-colors">
          {params.value}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[50vw] max-h-[85vh] overflow-y-auto p-4 bg-gray-50 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogDescription className="text-2xl font-semibold text-gray-800">Task Description</DialogDescription>
        </DialogHeader>
        <Card className="p-5 bg-white shadow-md rounded-lg mt-4 min-h-[150px] flex text-gray-600">
          <div className="">{params.value}</div>
        </Card>
      </DialogContent>
    </Dialog>
        )
      
    } 
  },  
  {
    field: "completionPercentage",
    headerName: "Completion Percentage",
    flex: 1.5
  },
  {
    field: "consumedHours",
    headerName: "Consumed Hours",
    flex: 1
  },
  {
    field: "ApprovedFlag",
    headerName: "Approval Status",
    flex: 1,
    renderCell: (params) => {
        // You can access the value of the cell here using params.value
        if (params.value === 'NA') {
          return (<><CheckCircle style={{ color: 'green' }} /> Approved</>) ;
        } else if (params.value === 'NO') {
          return (<><div className="flex items-center"><Clock9 style={{ color: 'red' }} /> <span className="ml-2">Pending for approval</span></div></>
          );
        } else {
            return (<><CheckCircle style={{ color: 'green' }} /> Approved</>);
        }
      },
  },
]

  return (
    <>
    <div className="h-full w-full px-4 pb-8 xl:px-6">
      <DataGrid
        rows={data?.timesheetDataList || []}
        columns={columns}
        className={dataGridClassNames}
      />
            </div>
    </>
  );
};

export default TimesheetDataTable;
