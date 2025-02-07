import { Clock,FilterX, Grid3X3, Table } from 'lucide-react'
import React from 'react'
import { TaskSelectionFilter } from './TaskSelectionFilter'
import { Button } from '@mui/material'
import { HeaderFilter } from './HeaderFilter'
import { SprintFilter } from './SprintFilter'
import ProjectsHeader from '../ProjectsHeader'
import ProjectSectionHeader from './ProjectSectionHeader'

type Props = {
    activeTab: string
    setActiveTab: (tabName: string) => void
    priority: string
    setPriority: (priorityName: string) => void
    assignedTo: string
    setAssignedTo: (assignedTo: string) => void
    sprint: string
    setSprint: (assignedTo: string) => void
    email: string
    projectId: number
}

const ProjectHeader = ({activeTab, setActiveTab, priority, setPriority,
  assignedTo, setAssignedTo, sprint, setSprint, email, projectId
}: Props) => {
       
  return (
    <div className='px-4 xl:px-6'>
        
        <div className='pb-6 pt-6 lg:pb-4 lg:pt-8 mb-5 mt-3'>
            <ProjectSectionHeader name='Project' buttonName='Create New Sprint' email= {email}
             projectId = {projectId}/>
        </div>
        {/* Tabs */}
        <div className='flex flex-wrap-reverse gap-2 border-y border-gray-200 pb-[4px] pt-1 dark:border-stroke-dark sm:items-center'>
            <div className='flex flex-1 items-center gap-2 md:gap-4'>
                <TabButton
                name='Kanban Board'
                icon={<Grid3X3 className='h-5 w-5'/>}
                setActiveTab = {setActiveTab}
                activeTab={activeTab}
                />
                <TabButton
                name='Timeline'
                icon={<Clock className='h-5 w-5'/>}
                setActiveTab = {setActiveTab}
                activeTab={activeTab}
                />
                <TabButton
                name='Table'
                icon={<Table className='h-5 w-5'/>}
                setActiveTab = {setActiveTab}
                activeTab={activeTab}
                />
            </div>
            <div className='flex items-center gap-2'>
            <SprintFilter sprint={sprint} 
        setSprint={setSprint} projectId={String(projectId)} />
                <HeaderFilter priority={priority} 
        setPriority={setPriority}/>
                <TaskSelectionFilter  assignedTo={assignedTo} setAssignedTo={setAssignedTo} email={email}/>
                <Button
            className="bg-gray-200 hover:bg-gray-100"
            onClick={() => {
              setPriority('')
              setAssignedTo('')
              setSprint('')
            }}
          >
            <FilterX className="text-gray-800" />
          </Button>
            </div>
        </div>
    </div>
  )
}

type TabButtonProps = {
    name: string
    icon: React.ReactNode
    setActiveTab: (tabName : string) => void
    activeTab: string
}

const TabButton = ({name, icon, setActiveTab, activeTab}: TabButtonProps)=>{
    const isActive = activeTab === name

    return (
        <button className={`relative flex items-center gap-2 px-1 py-2 text-gray-500 after:absolute after:-bottom-[4px] after:left-0 after:h-[1px] after:w-full hover:text-blue-600 dark:text-neutral-500 dark:hover:text-white sm:px-2 lg:px-4 ${
        isActive ? "text-blue-600 after:bg-blue-600 dark:text-white" : ""
      }`}
             onClick={() => (setActiveTab(name))}
             >
                {icon}
                {name}
             </button>
    )
}

export default ProjectHeader