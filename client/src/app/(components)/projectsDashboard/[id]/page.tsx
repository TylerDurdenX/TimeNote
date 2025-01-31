"use client"

import React, { useState } from 'react'
import ProjectHeader from './ProjectHeader'
import KanbanBoard from './KanbanBoard'
// import BoardView from '../BoardView'
// import Timeline from "../TimelineView"
// import Table from "../Table"
// import ModalNewTask from '@/components/ModalNewTask'


const Project = () => {
const [activeTab, setActiveTab] =useState("Kanban Board")
const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false)


const url = window.location.href;

const urlParams = new URL(url);
const idFromUrl = urlParams.pathname.split('/')[2];
 const email =urlParams.searchParams.get("email")

// const {
//   data: tasks,
//   isLoading,
//   error 
// } = useGetProjectTasksQuery({projectId: Number(id)})

  return (
    <div>
        <ProjectHeader activeTab={activeTab} setActiveTab={setActiveTab}/>
        {activeTab==="Kanban Board" && (
        <KanbanBoard id={idFromUrl} email={email!} setIsModalNewTaskOpen={setIsModalNewTaskOpen}/>
        )}
    </div>
  )
}

export default Project