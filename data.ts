import { Employee, EventItem, NewsItem, DocumentItem, User, UserRole, ChatChannel, ChatMessage, CeoMessageContent, Project, Task, CalendarEvent, VacationRequest, Loan, TrainingModule, Department, Notification, DocumentRequest } from './types';

// Mock Users for Authentication
export const MOCK_USERS: User[] = [
  {
    id: 'ceo-1',
    name: 'Roberto Méndez',
    email: 'ceo@corpocrea.com',
    password: '123',
    role: UserRole.CEO,
    avatar: 'https://ui-avatars.com/api/?name=Roberto+Mendez&background=000&color=fff',
    position: 'CEO',
    department: 'Dirección',
    vacationDays: 15,
    socialBenefits: 450250.00, // VES
    loans: []
  },
  {
    id: 'mgr-1',
    name: 'Soporte Técnico',
    email: 'it@corpocrea.com',
    password: 'galipan2023',
    role: UserRole.MANAGER,
    avatar: 'https://ui-avatars.com/api/?name=Soporte+Tecnico&background=0D8ABC&color=fff',
    position: 'Soporte Técnico',
    department: 'IT',
    vacationDays: 0,
    socialBenefits: 0,
    loans: []
  },
  {
    id: 'emp-1',
    name: 'Ana Usuario',
    email: 'user@corpocrea.com',
    password: '123',
    role: UserRole.ARCHITECT,
    avatar: 'https://ui-avatars.com/api/?name=Ana+Usuario&background=E11D48&color=fff',
    position: 'Arquitecta Senior',
    department: 'Proyectos',
    vacationDays: 8,
    socialBenefits: 185200.75, // VES
    loans: [
      { 
        id: 'l1', 
        userId: 'emp-1',
        amount: 500, // USD
        balance: 350, 
        status: 'ACTIVE', 
        requestDate: '2024-01-15', 
        reason: 'Compra de equipo',
        paymentTermMonths: 6,
        monthlyIncome: 1200
      }
    ]
  },
  {
    id: 'emp-2',
    name: 'David Desarrollador',
    email: 'dev@corpocrea.com',
    password: '123',
    role: UserRole.ENGINEER,
    avatar: 'https://ui-avatars.com/api/?name=David+Dev&background=16A34A&color=fff',
    position: 'Ingeniero Civil',
    department: 'Ingeniería',
    vacationDays: 10,
    socialBenefits: 210100.00, // VES
    loans: []
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

export const INITIAL_DOCUMENT_REQUESTS: DocumentRequest[] = [];

export const INITIAL_DEPARTMENTS: Department[] = [];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  // Feriados Venezuela 2026
  { id: 'h1', title: 'Año Nuevo', date: '2026-01-01', type: 'HOLIDAY', isWorkingDay: false },
  { id: 'h2', title: 'Carnaval', date: '2026-02-16', type: 'HOLIDAY', isWorkingDay: false },
  { id: 'h3', title: 'Carnaval', date: '2026-02-17', type: 'HOLIDAY', isWorkingDay: false },
  { id: 'h4', title: 'Semana Santa (Jueves)', date: '2026-04-02', type: 'HOLIDAY', isWorkingDay: false },
  { id: 'h5', title: 'Semana Santa (Viernes)', date: '2026-04-03', type: 'HOLIDAY', isWorkingDay: false },
  { id: 'h6', title: 'Declaración de Independencia', date: '2026-04-19', type: 'HOLIDAY', isWorkingDay: false },
  { id: 'h7', title: 'Día del Trabajador', date: '2026-05-01', type: 'HOLIDAY', isWorkingDay: false },
  { id: 'h8', title: 'Batalla de Carabobo', date: '2026-06-24', type: 'HOLIDAY', isWorkingDay: false },
  { id: 'h9', title: 'Día de la Independencia', date: '2026-07-05', type: 'HOLIDAY', isWorkingDay: false },
  { id: 'h10', title: 'Natalicio de Simón Bolívar', date: '2026-07-24', type: 'HOLIDAY', isWorkingDay: false },
  { id: 'h11', title: 'Día de la Resistencia Indígena', date: '2026-10-12', type: 'HOLIDAY', isWorkingDay: false },
  { id: 'h12', title: 'Navidad', date: '2026-12-25', type: 'HOLIDAY', isWorkingDay: false },
];

export const INITIAL_VACATION_REQUESTS: VacationRequest[] = [];

export const INITIAL_CEO_MESSAGE: CeoMessageContent = {
  text: '',
  imageUrl: '',
  updatedAt: new Date().toLocaleDateString()
};

export const INITIAL_NEWS: NewsItem[] = [];

export const INITIAL_SOCIAL_BENEFITS_REQUESTS: SocialBenefitsRequest[] = [];

export const INITIAL_EVENTS: EventItem[] = [];

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_DOCUMENTS: DocumentItem[] = [];

export const INITIAL_TRAININGS: TrainingModule[] = [];

export const INITIAL_CHANNELS: ChatChannel[] = [
  { id: 'general', name: 'General', type: 'GROUP', participants: ['all'] },
  { id: 'announcements', name: 'Anuncios', type: 'GROUP', participants: ['all'] },
];

export const INITIAL_MESSAGES: ChatMessage[] = [];

// Initial Projects Data
export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_TASKS: Task[] = [];