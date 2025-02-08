export interface UsersListResponse {
    userId: number,
    username: string,
    designation: string,
    profilePicture: ProfilePicture
}

interface ProfilePicture {
    base64: string
}

export interface UserDetails {
    userId: number,
    email: string,
    username: string,
    designation: string,
    phoneNumber: string,
    profilePicture: ProfilePicture,
    roles: Role[],
    projects: Project[],
    teams: Team[],
    reportsTo : ReportsTo,
    reports: ReportingUsers[]
}

export interface Role {
    name: string
}
export interface Project {
    name: string
}
export interface Team {
    name: string
}
interface ReportsTo {
    username: string | null
}
export interface ReportingUsers {
    name: string
}

export interface ListResponse {
    title : string;
    misc: string;
}

export interface UserHierarchy {
    userId: number;
    username: string;
    designation: string;
    profilePicture: ProfilePicture;
    reportsToId: string | null;
  }

export interface ScreenshotResponse{
    screenshotList: ScreenshotObject[]
    totalPages: number
    currentPage: number
}

interface ScreenshotObject{
    id : number
    username: string
    time: string 
    base64: string 
    userId: number
    date: string
}

export interface UserFilterResponse {
    username: string
    email: string
}
 
export interface LiveStreamResponse{
    email: string
    username: string
    screenshot: Screenshot
}

interface Screenshot {
    base64: string
}

export interface ProjectListResponse{
    name: string
    description: string
    status: string
    startDate: string
    endDate: string
    projectManager: string
    completionStatus: number
}

export enum Status {
    ToDo = "To Do",
    WorkInProgress = "Work In Progress",
    UnderReview= "UnderReview",
    Completed= "Completed"
}

export enum Priority {
    Urgent = "Urgent",
    High = "High",
    Medium= "Medium",
    Low= "Low",
    Backlog= "Backlog"
}

export interface User{
    userId: number,
    username: string,
    email: string,
    profilePicture: ProfilePicture,
}

export interface Attachment{
    id: number,
    fileUrl: string,
    fileName: string,
    taskId: number,
    uploadedById: number
}

export interface Task {
    id: number
    title : string
    description? : string
    status? : Status
    priority? : Priority
    tags? : string
    startDate? : string
    dueDate? : string
    points? : number
    projectId : number
    authorUserId? : number
    assignedUserId? : number

    author?: User
    assignee?: User
    comments?: Comment[]
    attachments?: Attachment[]
}

export interface ProjectUsers{
    userId: number
    username: string
}

export interface TaskFormData {
    title: string
    description: string,
    status: string,
    priority: string,
    points?: string,
    startDate: string,
    dueDate: string,
    tags?: string,
    assignedUserId: string,
    authorUserId: string,
    sprintId: string
    projectId: number
};

export interface TaskComments{
    id: number,    
    text: string
    username: string
    commentTime: string
}

export interface AddComment {
    text: string
    taskId: number
    userEmail: string
    commentTime: string
}

export interface CreateSprint {
    title: string
    description: string
    startDate: string
    endDate: string
    email: string
    projectId: number
}

export interface SprintResponse{
    id: number,
    title: string
}

export interface ProjectFormData{
    title: string
    description: string
    startDate: string
    endDate: string
    projectManager: string
}

export interface PmUserResponse{
    userId: number
    username: string
}