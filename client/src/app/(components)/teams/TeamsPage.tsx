'use client'

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useState } from 'react'
import { dataGridClassNames } from "@/lib/utils";
import {  useGetTeamsQuery } from '@/store/api';
import { Button, Tabs } from "@mui/material";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusSquare } from 'lucide-react';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Tags from './AutoComplete';

const TeamsPage = () => {

  const userEmail = useSearchParams().get("email")

  const [isOpen, setIsOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<any[]>([])

  const {data: alertData, isLoading} = useGetTeamsQuery({email: userEmail!},
    {refetchOnMountOrArgChange: true}
  )
  
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Team Name",
      flex: 1, 
    },
    {
      field: "description",
      headerName: "Team Description",
      flex: 2,
    },
    {
      field: "teamLeaderName",
      headerName: "Team Lead",
      flex: 2,
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
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <div className="my-3 flex justify-center items-center">
                <DialogTrigger asChild>
                  <Button
                    variant="contained"
                    className="mb-5"
                    color="primary"
                    size="small"
                    //onClick={() => handleViewDetails(params.row)} // Passing the current row's data
                    sx={{
                      backgroundColor: '#3f51b5', // Blue color
                      '&:hover': { backgroundColor: '#2c387e' },
                      borderRadius: '8px',
                    }}
                  >
                    View / Configure Details
                  </Button>
                </DialogTrigger>
      
                {/* Dialog Content */}
                <DialogContent className="max-w-[65vw] max-h-[80vw] mt-5 mb-5 overflow-y-auto"> {/* Set width to 70% of viewport height */}
                        <DialogHeader>
                  <DialogTitle>Team Configuration</DialogTitle>
                  <DialogDescription className="">
                    Please make changes and click on save configuration button to save the changes
                  </DialogDescription>
                </DialogHeader>
                <form >
                <div className="grid gap-4 py-9">
                  <div className="grid grid-cols-8 items-center gap-4">
                    <Label className="text-center">Projects</Label>
                    <Tags setSelectedProjects={setSelectedProjects} overrideFlag={true} label="Projects"/> 
                    <div className="col-span-8 flex justify-center">
                    </div>
                    <Label className="text-center">Breaks</Label>
                    {/* <Label className="text-right mt-3">Authorities</Label> */}
                    <Tags setSelectedProjects={setSelectedProjects} overrideFlag={true} label="Authorities"/> 
                  </div>
                </div>
      
                  <DialogFooter>
                    <Button
                      onClick={() => setIsOpen(false)}
                      variant="contained"
                      sx={{
                        backgroundColor: '#3f51b5', // Blue color
                        '&:hover': { backgroundColor: '#2c387e' },
                        borderRadius: '8px',
                      }}
                    >
                      Save Configuration
                    </Button>
                    <Button
                      onClick={() => setIsOpen(false)}
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
                  </form> 

                </DialogContent>
                </div>
              </Dialog>
            </div>
          );
        },
      }
  ];

  return (
    <div className="h-full w-full px-4 pb-8 xl:px-6">
      <DataGrid
        rows={alertData || []}
        columns={columns}
        className={dataGridClassNames}
      />
    </div>
  )
}

export default TeamsPage