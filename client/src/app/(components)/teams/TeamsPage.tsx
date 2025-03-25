'use client'

import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react'
import { dataGridClassNames } from "@/lib/utils";
import {  useGetBreaksForTeamsQuery, useGetProjectForTeamsQuery, useGetSelectedBreakTypeForTeamsQuery, useGetSelectedProjectForTeamsQuery, useGetTeamsQuery, useUpdateTeamsConfigurationDataMutation } from '@/store/api';
import { Button, Tabs } from "@mui/material";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader, PlusSquare } from 'lucide-react';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Tags from './AutoComplete';
import toast from 'react-hot-toast';

const TeamsPage = () => {

  const userEmail = useSearchParams().get("email")

  const [isOpen, setIsOpen] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<any[]>([])
  const [selectedBreaks, setSelectedBreaks] = useState<any[]>([])
   const [selectTeamId, setSelectedTeamId] = useState(0)
  

  const {data: teamsData, isLoading} = useGetTeamsQuery({email: userEmail!},
    {refetchOnMountOrArgChange: true}
  )

  const handleOpenDialog = (id: number) => {
    setIsOpen(true)
    setSelectedTeamId(id)
  }
    const { data : projectsList} = useGetProjectForTeamsQuery(
      { email: userEmail! },
      { refetchOnMountOrArgChange: true }
    );
  
     const { data : breaksList} = useGetBreaksForTeamsQuery(
       { email: userEmail! },
       { refetchOnMountOrArgChange: true }
     );
  
     const handleSaveConfiguration = async() => {
       try {
           const response = await updateTeamConfiguration({email: userEmail!,teamId: selectTeamId, projects: selectedProjects, breaks: selectedBreaks});
           // @ts-ignore
          if(response.error?.data.status === 'Error' || response.error?.data.status === 'Fail'){
                          // @ts-ignore
                          toast.error(response.error?.data.message)
                        }else{
                          toast.success(response.data?.message!);
                        }
                        setIsOpen(false)
       } catch (err) {
         setIsOpen(false)
         toast.error("Some Error occurred, please try again later");
       }
     }; 
  


  const [updateTeamConfiguration, { isLoading: updateConfigLoading }] = useUpdateTeamsConfigurationDataMutation();
  
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
          console.log('renderCell')
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
              <div className="my-3 flex justify-center items-center">
              <Button
                    variant="contained"
                    className="mb-5"
                    color="primary"
                    size="small"
                    onClick={() => {handleOpenDialog(params.row.id)}} 
                    sx={{
                      backgroundColor: '#3f51b5', // Blue color
                      '&:hover': { backgroundColor: '#2c387e' },
                      borderRadius: '8px',
                    }}
                  >
                    View / Configure Details
                  </Button>
                  </div>
            </div>
          );
        },
      }
  ];

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <div className="my-3 flex justify-center items-center">
                
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
                    {/* <Label className="text-center">Projects</Label>
                    <div className='col-span-7'>
                    <Tags projectFlag={true} userEmail={userEmail!} projectsList={projectsList} setSelectedProjects={setSelectedProjects}
                    setSelectedBreaks={setSelectedBreaks} teamId={selectTeamId} selectedList={selectedProjects}/>
                    </div>  */}
                    <div className="col-span-8 flex justify-center">
                    </div>
                    <Label className="text-center">Breaks</Label>
                    <div className='col-span-7'>
                    <Tags projectFlag={false} userEmail={userEmail!} breaksList={breaksList} setSelectedBreaks={setSelectedBreaks}
                    setSelectedProjects={setSelectedProjects} teamId={selectTeamId} selectedList={selectedBreaks}/> 
                    </div>
                  </div>
                </div>
      
                  <DialogFooter>
                    {!updateConfigLoading && (
                                    <Button
                                    onClick={handleSaveConfiguration}
                                    variant="contained"
                                    sx={{
                                      backgroundColor: '#3f51b5', // Blue color
                                      '&:hover': { backgroundColor: '#2c387e' },
                                      borderRadius: '8px',
                                    }}
                                  >
                                    Save Configuration
                                  </Button>
                                  )}
                                  {updateConfigLoading && (
                                    <Button
                                    onClick={handleSaveConfiguration}
                                    variant="contained"
                                    sx={{
                                      backgroundColor: '#3f51b5', // Blue color
                                      '&:hover': { backgroundColor: '#2c387e' },
                                      borderRadius: '8px',
                                    }}
                                  >
                                    <Loader className="animate-spin" />
                                  </Button>
                                  )}
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
    <div className="h-full w-full px-4 pb-8 xl:px-6">
      <DataGrid
        rows={teamsData || []}
        columns={columns}
        className={dataGridClassNames}
      />
    </div>
    </>

  )
}

export default TeamsPage