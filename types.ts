export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER', // Content Manager
  CEO = 'CEO', // Chief Executive Officer
  ARCHITECT = 'ARCHITECT',
  ENGINEER = 'ENGINEER',
  HR = 'HR' // Human Resources
}

export interface Loan {
  id: string;
  userId: string; // Added userId to track who requested
  amount: number;
  balance: number;
  status: 'ACTIVE' | 'PAID' | 'PENDING' | 'REJECTED';
  requestDate: string;
  reason: string;
  // New fields for "serie de datos"
  paymentTermMonths: number;
  guarantor?: string;
  monthlyIncome?: number;
}

export interface VacationRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  comments?: string; // Added comments
}

export interface DocumentRequest {
  id: string;
  userId: string;
  type: 'WORK_CERTIFICATE' | 'INCOME_CERTIFICATE' | 'VISA_LETTER' | 'OTHER';
  status: 'PENDING' | 'READY' | 'REJECTED';
  requestDate: string;
  additionalDetails?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  position: string;
  department?: string;
  password?: string; // For mock auth only
  vacationDays?: number;
  socialBenefits?: number; // In VES
  loans?: Loan[]; // In USD
  identificationId?: string; // Cédula/NIF for Odoo integration
  odooEmployeeId?: number; // Odoo employee ID
}

// Odoo API Integration Types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface OdooConfig {
  baseUrl: string;
  apiKey: string;
  isConfigured: boolean;
}

export interface OdooDashboardState {
  loading: boolean;
  error: string | null;
  socialBenefits: {
    total_available: number;
    social_benefits_generated: number;
    accrued_social_benefits: number;
    advances_of_social_benefits: number;
    benefit_interest: number;
    days_per_year_accumulated: number;
    earnings_generated_total_available: number;
  } | null;
  vacation: {
    years_of_seniority: number;
    months_of_seniority: number;
    base_vacation_days: number;
    additional_days: number;
    total_entitled_days: number;
    days_taken: number;
    days_available: number;
  } | null;
  loans: {
    total: number;
    items: OdooLoanItem[];
  } | null;
  employee: {
    id: number;
    name: string;
    identification_id: string;
    work_email: string;
    job_title: string;
    department: string;
    company: string;
  } | null;
}

export interface OdooLoanItem {
  source: string;
  id: number;
  name: string;
  type: string;
  amount: number;
  paid_amount?: number;
  remaining?: number;
  state: string;
  state_label?: string;
  start_date?: string;
  end_date?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  type?: 'IMAGE' | 'VIDEO';
  date: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  photo: string;
  skills: string[];
  isMonthEmployee?: boolean;
  birthDate: string;
  startDate: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  size: string;
  uploadDate: string;
  department?: string;
  url?: string; // Cloudinary URL
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'GROUP' | 'DIRECT';
  participants: string[];
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

export interface CeoMessageContent {
  text: string;
  imageUrl: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'PLANNING' | 'COMPLETED';
  deadline: string;
  leaderId: string;
  participantIds: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedToUserId: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  progress: number;
  startDate: string;
  dueDate: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'EVENT' | 'HOLIDAY';
  isWorkingDay: boolean;
  description?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  department: string;
  duration: string;
  completedBy: string[];
}

export interface Department {
  id: string;
  name: string;
  description: string;
  managerId?: string;
}

export interface CorporateCompany {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
  sortOrder?: number;
}

export interface SocialBenefitsRequest {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  bankAccount: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
}

export interface AppState {
  news: NewsItem[];
  events: EventItem[];
  employees: Employee[];
  documents: DocumentItem[];
  currentUser: User | null;
  channels: ChatChannel[];
  messages: ChatMessage[];
  ceoMessage: CeoMessageContent;
  projects: Project[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  vacationRequests: VacationRequest[];
  trainings: TrainingModule[];
  departments: Department[];
  documentRequests: DocumentRequest[];
  notifications: Notification[];
  socialBenefitsRequests: SocialBenefitsRequest[];
  corporateCompanies: CorporateCompany[];
  siteLogoUrl: string;
}

export interface AppActions {
  addNews: (item: NewsItem) => void;
  deleteNews: (id: string) => void;
  addEvent: (item: EventItem) => void;
  deleteEvent: (id: string) => void;
  addDocument: (item: DocumentItem) => void;
  deleteDocument: (id: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  sendMessage: (channelId: string, text: string) => void;
  createGroupChannel: (name: string) => void;
  createDirectChannel: (targetUserId: string) => string; // Returns channel ID
  updateCeoMessage: (content: CeoMessageContent) => void;
  // Project Actions
  addTask: (task: Task) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  // Calendar & HR Actions
  addCalendarEvent: (event: CalendarEvent) => void;
  requestVacation: (request: VacationRequest) => void;
  approveVacation: (requestId: string, approved: boolean) => void;
  requestLoan: (loan: Loan) => void;
  requestDocument: (doc: DocumentRequest) => void; // New
  markNotificationRead: (id: string) => void; // New
  requestSocialBenefits: (request: SocialBenefitsRequest) => void; // New
  // Training Actions
  markTrainingComplete: (trainingId: string) => void;
  // Department Actions
  addDepartment: (dept: Department) => void;
  deleteDepartment: (id: string) => void;
  // Corporate Companies Actions
  addCorporateCompany: (company: CorporateCompany) => void;
  deleteCorporateCompany: (id: string) => void;
  // Site Settings
  updateSiteLogoUrl: (url: string) => void;
}