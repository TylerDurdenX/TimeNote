"use client"

import React, { useState } from 'react'
import ProjectHeader from './ProjectHeader'
import KanbanBoard from './KanbanBoard'


const Project = () => {
const [activeTab, setActiveTab] =useState("Kanban Board")
const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false)


const url = window.location.href;

const urlParams = new URL(url);
const idFromUrl = urlParams.pathname.split('/')[2];
 const email =urlParams.searchParams.get("email")

 const[priority, setPriority] = useState('')
 const[assignedTo, setAssignedTo] = useState('')
 const[sprint, setSprint] = useState('')

  return (
    <div>
        <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab} priority={priority} 
        setPriority={setPriority} assignedTo={assignedTo} setAssignedTo={setAssignedTo} sprint={sprint}
         setSprint={setSprint}/>
        {activeTab==="Kanban Board" && (
        <KanbanBoard id={idFromUrl} email={email!} setIsModalNewTaskOpen={setIsModalNewTaskOpen}
        priority={priority} 
        setPriority={setPriority} assignedTo={assignedTo} setAssignedTo={setAssignedTo}/>
        )}
    </div>
  )
}

export default Project