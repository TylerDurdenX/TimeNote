export interface UsersListResponse {
  userId: number;
  username: string;
  designation: string;
  profilePicture: ProfilePicture;
}

interface ProfilePicture {
  base64: string;
}

export interface UserDetails {
  userId: number;
  email: string;
  username: string;
  designation: string;
  phoneNumber: string;
  idleTimeOut?: string;
  workingHours?: string;
  allowSignout?: boolean;
  pictureModification?: boolean;
  profilePicture: ProfilePicture;
  roles: Role[];
  projects: Project[];
  teams: Team[];
  reportsTo: ReportsTo;
  reports: ReportingUsers[];
}

export interface UserDetailsData {
  userId: number;
  email: string;
  username: string;
  designation: string;
  phoneNumber: string;
  profilePicture: ProfilePicture;
  userDetails: UserPersonalDetails;
}

interface UserPersonalDetails {
  address: string;
  joiningDate: string;
  department: string;
  totalLeaves: string;
  emergencyContact: string;
  dateOfBirth: string;
  employeeId: string;
  gender: string;
  employementType: string;
  workLocation: string;
  employeeGrade: string;
  employeeStatus: string;
  issuedDevices: string;
  personalEmail: string;
  bloodGroup: string;
  claimedLeaves: string;
}

export interface UserData {
  userId: number;
  email: string;
  username: string;
  designation: string;
  phoneNumber: string;
  profilePicture: ProfilePicture;
  projects: Project[];
  teams: Team[];
}

export interface Role {
  name: string;
}
export interface Project {
  name: string;
}
export interface Team {
  name: string;
}
interface ReportsTo {
  username: string | null;
}
export interface ReportingUsers {
  name: string;
}

export interface ListResponse {
  title: string;
  misc: string;
}

export interface ListReq {
  id: number;
  title: string;
}

export interface UserHierarchy {
  userId: number;
  username: string;
  designation: string;
  profilePicture: ProfilePicture;
  reportsToId: string | null;
}

export interface ScreenshotResponse {
  screenshotList: ScreenshotObject[];
  totalPages: number;
  currentPage: number;
}

interface ScreenshotObject {
  id: number;
  username: string;
  time: string;
  base64: string;
  userId: number;
  date: string;
  flag: boolean;
}

export interface UserFilterResponse {
  username: string;
  email: string;
  userId: number;
  userStatus: string;
}

export interface TeamFilterResponse {
  name: string;
  id: number;
}

export interface LiveStreamResponse {
  email: string;
  username: string;
  screenshot: Screenshot;
}

interface Screenshot {
  base64: string;
}

export interface ProjectResponse {
  id: number;
  projectName: string;
  projectDescription: string;
  projectCode: string;
  clientName: string;
  startDate: string;
  dueDate: string;
  status: string;
  projectManager: string;

  projectAttachments: ProjectAttachments[];
}

export interface AttendanceCardsResponse {
  onTimeArrival: string;
  onTimePercentage: string;
  lateArrival: string;
  lateArrivalPercentage: string;
  avgActiveTime: string;
  avgActiveTimePercentage: string;
  breakTime: string;
  breakTimePercentage: string;
}

export interface AttendanceChartResponse {
  month: string;
  desktop: number;
  mobile: number;
}

export interface PCResponse {
  lateCount: string;
  onTime: string;
  onLeave: string;
}

export interface CustomTableResponse {
  username: string;
  userStatus: string;
  lateCount: string;
  onTimeCount: string;
  avgWorkingTime: string;
  avgActiveTime: string;
}

interface ProjectAttachments {
  id: number;
  fileName: string;
}

export interface UpdateProjectData {
  email: string;
  projectId: number;
  projectManager: string;
  clientName: string;
  projectDescription: string;
  startDate: string;
  dueDate: string;
  projectName: string;
}

export interface ProjectListResponse {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  clientName: string;
  projectManager: string;
  completionStatus: number;
}

export interface ProjectReportListResponse {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  dueDate: string;
  clientName: string;
  projectManager: string;
  estimatedHours: string;
  consumedHours: string;
  hoursOverrun: string;
}

export interface ProjectNamesResponse {
  id: number;
  name: string;
}

export interface ProjectListForTeamResponse {
  id: number;
  title: string;
}

export interface TaskHistory {
  id: number;
  username: string;
  assignedFrom: string;
  assignedTill: string;
  toDo: number;
  WIP: number;
  underReview: number;
  completed: number;
  closed: number;
  totalTime: number;
}

export interface TaskActivity {
  id: number;
  username: string;
  date: string;
  activity: string;
}

export interface ConfiguredReports {
  Reportname: string;
  ReportTime: string;
  ReportDuration: string;
  ProjectTeam: string;
}

export interface ReportConfig {
  email: string;
  teamName: string;
  userEmail: string;
  reportDuration: string;
  allUsersFlag: boolean;
  time: string;
  period: string;
  reportName: string;
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "UnderReview",
  Completed = "Completed",
  Closed = "Closed",
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

export interface User {
  userId: number;
  username: string;
  email: string;
  profilePicture: ProfilePicture;
}

export interface Attachment {
  id: number;
  fileBase64: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
}

export interface UploadAttachment {
  fileBase64: string;
  fileName: string;
  taskId: number;
  uploadedBy: string;
}

export interface UploadProjectAttachment {
  email: string;
  fileBase64: string;
  fileName: string;
  projectId: number;
}

export interface UploadSubTaskAttachment {
  fileBase64: string;
  fileName: string;
  subTaskId: number;
  uploadedBy: string;
}

export interface DownloadAttachment {
  id: number;
  fileBase64: string;
  fileName: string;
  taskId: number;
  uploadedBy: number;
  subTaskId: number;
}

export interface DownloadProjectAttachment {
  id: number;
  fileBase64: string;
  fileName: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  code: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;
  inProgressStartTime: string;
  inProgressTime: string;
  inProgressTimeinMinutes: string;
  subTasks: SubTask[];
  consumedHours: string;
  hoursOverrun: string;

  author?: User;
  assignee?: User;
  comments?: number;
  attachments?: Attachment[];
}

export interface GetProjectTasksResponse {
  tasks: Task[];
  hasmore: boolean;
}

export interface GetProjectTasksCalendarResponse {
  id: number;
  code: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  points: number;
  projectId: number;
  assignee: Assignee;
  startDate: Date;
  dueDate: Date;
}

export interface Assignee {
  username: string;
  email: string;
}

export interface TimesheetData {
  projectId: string;
  taskCode: string;
  task: string;
  subTaskId: number;
  subTaskCode: string;
  completionPercentage: string;
  consumedHours: string;
  approved: string;
}

export interface PendingTimesheetResponse {
  id: number;
  task: TimesheetData;
  username: string;
}

export interface TimesheetResponse {
  timesheetDataList: TimesheetData[];
  totalTime: string;
}

export interface LeaveResponse {
  id: number;
  userId: number;
  username: string;
  leaveType: string;
  description: string;
  date: string;
  year: string;
  approvalStatus: string;
}

export interface GeoDataResponse {
  number1: number;
  number2: number;
  number3: number;
  userName: string;
  designation: string;
}

export interface BreakResponse {
  id: number;
  breakType: string;
  breakStartTime: string;
  breakEndTime: string;
  breakTimeInMinutes: string;
  breakTimeConfigured: string;
  breakTimeOverrun: string;
}

export interface AttendanceCardResponse {
  usersCount: number;
  totalUsersCount: number;
}

export interface AttendanceUserPCResponse {
  onTimeCount: number;
  lateCount: number;
}

export interface AttendanceUserTableResponse {
  date: string;
  userId: number;
  punchInTime: string;
  punchOutTime: string;
  duration: string;
  totalIdleTime: string;
  activeTime: string;
}

export interface AttendanceReportTableResponse {
  id: number;
  date: string;
  email: string;
  presentDays: number;
  userId: number;
  punchInTime: string;
  punchOutTime: string;
  username: string;
  duration: string;
  totalIdleTime: string;
  activeTime: string;
  place: string;
}

export interface TimesheetReportTableResponse {
  id: number;
  date: string;
  email: string;
  username: string;
}

export interface AttendanceCardLCResponse {
  date: string;
  count: number;
}

export interface timesheetEntry {
  task: string;
  completionPercentage: string;
  consumedHours: string;
  date: string;
  email: string;
}

export interface SubTask {
  id: number;
  title: string;
  description: string;
  status: string;
  code: string;
  taskId: number;
  startDate: string;
  dueDate: string;
  authorUserId: number;
  assignedUserId: number;
}

export interface SubTaskObject {
  id: number;
  title: string;
  description: string;
  status: string;
  code: string;
  inProgressStartTime: Date;
  inProgressTimeinMinutes: string;
  taskId: number;
  startDate: string;
  dueDate: string;
  authorUserId: number;
  assignedUserId: number;
  inProgressTime: string;

  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface AdminRoleResponse {
  admin: boolean;
}

export interface ProjectHours {
  totalHours: number;
  consumedHours: number;
  hoursOverrun: number;
}

export interface SprintData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface ProjectUsers {
  userId: number;
  username: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  points?: string;
  startDate: string;
  dueDate: string;
  tags?: string;
  assignedUserId: string;
  authorUserId: string;
  sprintId: string;
  projectId: number;
}

export interface BulkUser {
  username: string;
  email: string;
  password: string;
  designation: string;
  phoneNumber: string;
  employeeId?: string;
  personalEmail?: string;
  bloodGroup?: string;
  employeeGrade?: string;
  address?: string;
  gender?: string;
  department?: string;
  joiningDate?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  totalLeaves?: string;
  employeeStatus?: string;
  workLocation?: string;
  employementType?: string;
  issuedDevices?: string;
}

export interface LeaveData {
  title: string;
  description: string;
  fromDate: string;
  toDate: string;
  email: string;
  date: string;
}

export interface TeamRequest {
  name: string;
  description: string;
  teamLeadName: string;
  teamLeadEmail: string;
  email: string;
}

export interface BreakRequest {
  email: string;
  breakName: string;
  breakDescription: string;
  breakCode: string;
  breakTimeInMinutes: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  designation: string;
  password: string;
  phoneNumber: string;
  base64Image: string | null;
}

export interface SubTaskFormData {
  title: string;
  description: string;
  status: string;
  taskId: number;
  startDate: string;
  dueDate: string;
  assignedUserId: string;
  authorUserId: string;
}

export interface TaskComments {
  id: number;
  text: string;
  username: string;
  commentTime: string;
}

export interface Breaks {
  id: number;
  breakName: string;
  breakCode: string;
  breakDescription: string;
  breakTimeInMinutes: string;
}

export interface BreaksForTeams {
  id: number;
  title: string;
}

export interface TeamConfiguration {
  idleTimeOut: string;
  workingHours: string;
  allowPictureModification: boolean;
}

export interface Teams {
  name: string;
  description: string;
}

export interface AddComment {
  text: string;
  taskId: number;
  userEmail: string;
  commentTime: string;
  taskCode: string;
}

export interface AddSubTaskComment {
  text: string;
  taskId: number;
  userEmail: string;
  commentTime: string;
}

export interface AlertCount {
  count: number;
  roles: string;
}

export interface Alert {
  id: number;
  title: string;
  description: string;
  status: string;
  triggeredDate: string;
  userId: number;
}

export interface CreateSprint {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  email: string;
  projectId: number;
}

export interface SprintResponse {
  id: number;
  title: string;
}

export interface TeamLeadResponse {
  name: string;
  email: string;
}

export interface ProjectFormData {
  title: string;
  clientName: string;
  description: string;
  projectCode: string;
  startDate: string;
  endDate: string;
  projectManager: string;
}

export interface MentionedUser {
  userId: number;
  username: string;
}

export interface PmUserResponse {
  userId: number;
  username: string;
}

export interface UpdateSprintObject {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  sprintId: number;
  email: string;
  projectName: string;
}

export interface UpdateBreakObj {
  email: string;
  breakId: number;
  breakName: string;
  breakDescription: string;
  breakTimeInMinutes: string;
}

export interface UpdateTaskData {
  taskId: number;
  taskPoints: number | undefined;
  assignee: string | undefined;
  taskDescription: string;
  editedConsumedHours: string;
  startDate: string;
  dueDate: string;
  email: string;
  taskName: string;
}

export interface UpdateUserData {
  username: string;
  email: string;
  designation: string;
  base64: string | null;
  phoneNumber: string;
  employeeId: string;
  personalEmail: string;
  bloodGroup: string;
  employeeGrade: string;
  address: string;
  gender: string;
  department: string;
  joiningDate: string;
  dateOfBirth: string;
  emergencyContact: string;
  totalLeaves: string;
  employeeStatus: string;
  workLocation: string;
  employmentType: string;
  issuedDevices: string;

  userId: number;
}

export interface ReopenTaskData {
  status: string;
  comment: string;
  email: string;
  taskId: number;
}

export interface UpdateSubTaskData {
  subTaskId: number;
  subTaskStatus: string | undefined;
  subTaskAssignee: string | undefined;
  subTaskDescription: string;
  editedConsumedHours: string;
  taskName: string;
  startDate: string;
  dueDate: string;
  email: string;
}

export interface UpdateSubTaskStatusData {
  subTaskId: number;
  subTaskStatus: string;
  assignToMe?: boolean;
  email: string;
}
