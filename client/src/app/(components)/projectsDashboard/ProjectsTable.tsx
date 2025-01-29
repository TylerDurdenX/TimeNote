import { useAppSelector } from '@/app/redux'
import Header from '@/components/Header'

import React from 'react'
import {DataGrid, GridColDef} from '@mui/x-data-grid'
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils'

type Props = {
    id: string
}

const columns: GridColDef[] =[
    { 
        field: "title",
        headerName: "Title",
        width: 100
    },   
    {
        field: "description",
        headerName: "Description",
        width: 200
    },
    {
        field: "status",
        headerName: "Status",
        width: 130,
        renderCell: (params) => (
            //TO DO
            <span className='inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800'>
                {params.value}
            </span>
        )
    },
    {
        field: "priority",
        headerName: "Priority",
        width: 75
    },
    {
        field: "tags",
        headerName: "Tags",
        width: 130
    },
    {
        field: "startDate",
        headerName: "Start Date",
        width: 130
    },
    {
        field: "dueDate",
        headerName: "Due Date",
        width: 130
    },
    {
        field: "author",
        headerName: "Author",
        width: 150,
        renderCell: (params) => params.value.username || "Unknown"
    },
    {
        field: "assignee",
        headerName: "Assignee",
        width: 150,
        renderCell: (params) => params.value.assignee || "Unassigned"
    },
]

const ProjectsTable = ({id,}: Props) => {    
    
  return (
    <div className='h-540px e-full px-4 pb-8 xl:px-6'>
        <div className='pt-5'>
            <Header name='Table' isSmallText/>
        </div>
        <DataGrid 
        // rows={[tasks] || []}
        columns={columns}
        className={dataGridClassNames}
        
        />
    </div>
  )
}

export default ProjectsTable