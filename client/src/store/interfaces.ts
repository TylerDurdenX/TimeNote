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
    id : number
    username: string
    time: string 
    base64: string 
    userId: number
}