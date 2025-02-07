"use client"

import React, { useState } from 'react'
import ProjectHeader from './ProjectHeader'
import KanbanBoard from './KanbanBoard'
import Timeline from './Timeline'
import TableView from './Table'


const Project = () => {
const [activeTab, setActiveTab] =useState("Kanban Board")
const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false)


const url = window.location.href;

const urlParams = new URL(url);
const idFromUrl = urlParams.pathname.split('/')[2];
 const email =urlParams.searchParams.get("email")
 console.log(idFromUrl)

 const[priority, setPriority] = useState('')
 const[assignedTo, setAssignedTo] = useState('')
 const[sprint, setSprint] = useState('')

  return (
    <div>
        <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab} priority={priority} 
        setPriority={setPriority} assignedTo={assignedTo} setAssignedTo={setAssignedTo} sprint={sprint}
         setSprint={setSprint} email={email!} projectId= {Number(idFromUrl!)}/>
        {activeTab==="Kanban Board" && (
        <KanbanBoard id={idFromUrl} email={email!} setIsModalNewTaskOpen={setIsModalNewTaskOpen}
        priority={priority} 
        setPriority={setPriority} assignedTo={assignedTo} setAssignedTo={setAssignedTo} sprint= {sprint}
        projectId= {idFromUrl!}/>
        )}
         {activeTab==="Timeline" && (
        <Timeline projectId={idFromUrl!} sprint= {sprint} assignedTo={assignedTo} priority={priority} />
        )} {activeTab==="Table" && (
          <TableView projectId={idFromUrl!} sprint= {sprint} assignedTo={assignedTo} priority={priority}/>
          )}
    </div>
  )
}

export default Project