import React, { useState, useEffect, useRef } from 'react';
import { AppState, UserRole, ChatMessage, User, ChatChannel, Task, Project, TaskStatus, CalendarEvent, VacationRequest, Loan, SocialBenefitsRequest, OdooDashboardState, OdooLoanItem } from '../types';
import { MOCK_USERS } from '../data';
import { 
  FileText, MessageSquare, Users, UserCheck, 
  LogOut, Bell, Search, Video, Download, HelpCircle,
  Menu, X, Plus, Hash, User as UserIcon, Send, Briefcase, CheckCircle, Clock, AlertCircle, ArrowLeft, Calendar, BarChart2, ChevronLeft, ChevronRight, LayoutGrid, Sparkles, Bot, Folder, TrendingUp, DollarSign, CalendarDays, Flag, GraduationCap, PlayCircle, Check, RefreshCw, Loader2, Database, ExternalLink, UserPlus2
} from 'lucide-react';
import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";

interface DashboardProps {
  data: AppState;
  onLogout: () => void;
  onNavigateAdmin: () => void;
  onSendMessage: (channelId: string, text: string) => void;
  onCreateGroup: (name: string) => void;
  onCreateDM: (userId: string) => void;
  onAddTask: (task: Task) => void;
  onUpdateTask: (taskId: string, progress: number) => void;
  onAddCalendarEvent: (event: CalendarEvent) => void;
  onRequestVacation: (request: VacationRequest) => void;
  onApproveVacation: (requestId: string, approved: boolean) => void;
  onRequestLoan: (loan: Loan) => void;
  onMarkTrainingComplete: (trainingId: string) => void;
  onRequestDocument: (doc: any) => void; // New
  onMarkNotificationRead: (id: string) => void; // New
  onRequestSocialBenefits: (request: SocialBenefitsRequest) => void; // New
  odooData: OdooDashboardState;
  onRefreshOdooData: () => void;
}

// --- AI ASSISTANT COMPONENT ---
const AIAssistant: React.FC<{ 
    data: AppState; 
    availableProjects: Project[]; // New prop: filtered projects
    onAddTask: (task: Task) => void 
}> = ({ data, availableProjects, onAddTask }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
        { role: 'model', text: 'Hola. Soy tu asistente de proyectos. Solo puedo gestionar los proyectos en los que participas. ¿En qué puedo ayudarte hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userText = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setLoading(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // 1. Define the Tool
            const createTaskTool: FunctionDeclaration = {
                name: 'createTask',
                description: 'Crea una nueva tarea o actividad en un proyecto existente.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        projectId: { type: Type.STRING, description: 'El ID del proyecto (debe coincidir con uno existente).' },
                        title: { type: Type.STRING, description: 'Título breve de la tarea.' },
                        description: { type: Type.STRING, description: 'Descripción detallada de la tarea.' },
                        assignedToUserId: { type: Type.STRING, description: 'El ID del usuario al que se asigna.' },
                        startDate: { type: Type.STRING, description: 'Fecha de inicio en formato YYYY-MM-DD.' },
                        dueDate: { type: Type.STRING, description: 'Fecha de finalización en formato YYYY-MM-DD.' },
                    },
                    required: ['projectId', 'title', 'assignedToUserId', 'startDate', 'dueDate']
                }
            };

            // 2. Build Context (Map Names to IDs) with VISIBILITY FILTER
            const today = new Date();
            const projectList = availableProjects.map(p => `"${p.name}" (ID: ${p.id})`).join(', ');
            
            // Filter users relevant to these projects (optional, but cleaner) or just show all users
            const userList = MOCK_USERS.map(u => `"${u.name}" (ID: ${u.id}, Rol: ${u.role})`).join(', ');
            
            const systemContext = `
                Eres un asistente de gestión de proyectos eficiente para Corpocrea.
                Fecha actual: ${today.toLocaleDateString('en-CA')} (YYYY-MM-DD).
                
                SOLO tienes acceso a estos Proyectos (el usuario es participante en ellos): ${projectList || 'Ninguno'}.
                Usuarios disponibles para asignar tareas: ${userList}.

                Reglas:
                1. Solo puedes crear tareas en los proyectos listados arriba. Si el usuario menciona otro proyecto, dile que no tiene acceso o no existe.
                2. Si el usuario pide crear una tarea, busca el ID del proyecto y del usuario más cercano por nombre.
                3. Si no se especifica fecha, asume que empieza hoy y termina en 2 días.
                4. Responde de forma breve y profesional.
            `;

            // 3. Call Model with Tools
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [
                    ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
                    { role: 'user', parts: [{ text: userText }] }
                ],
                config: {
                    tools: [{ functionDeclarations: [createTaskTool] }],
                    systemInstruction: systemContext,
                }
            });

            // 4. Handle Tool Calls
            const functionCalls = response.candidates?.[0]?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);
            let finalResponseText = response.text || "";

            if (functionCalls && functionCalls.length > 0) {
                for (const call of functionCalls) {
                    if (call.name === 'createTask') {
                        const args = call.args as any;
                        
                        // Execute Action in App
                        onAddTask({
                            id: Date.now().toString(),
                            projectId: args.projectId,
                            title: args.title,
                            description: args.description || args.title,
                            assignedToUserId: args.assignedToUserId,
                            status: 'TODO',
                            progress: 0,
                            startDate: args.startDate,
                            dueDate: args.dueDate
                        });

                        // Inform the model the action was successful to get a confirmation text
                        const functionResponsePart = {
                            functionResponse: {
                                name: 'createTask',
                                response: { result: "Task created successfully in the system." }
                            }
                        };

                        // Send tool response back to get final natural language confirmation
                        const secondResponse = await ai.models.generateContent({
                            model: 'gemini-3-flash-preview',
                            contents: [
                                ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
                                { role: 'user', parts: [{ text: userText }] },
                                response.candidates![0].content, // The model's request to call function
                                { parts: [functionResponsePart] } // The result of the function
                            ],
                        });
                        
                        finalResponseText = secondResponse.text || "Tarea creada exitosamente.";
                    }
                }
            }

            setMessages(prev => [...prev, { role: 'model', text: finalResponseText }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, hubo un error procesando tu solicitud. Verifica tu conexión o clave API.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-500 text-slate-900 p-4 rounded-full shadow-2xl transition-transform hover:scale-105 flex items-center justify-center"
            >
                {isOpen ? <X size={24}/> : <Sparkles size={24}/>}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-indigo-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-indigo-600 p-4 flex items-center gap-3 text-slate-900">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Asistente IA</h3>
                            <p className="text-[10px] text-slate-800 font-medium">Impulsado por Gemini</p>
                        </div>
                    </div>
                    
                    <div ref={scrollRef} className="h-80 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-slate-900 font-medium rounded-br-none' : 'bg-white border border-indigo-100 text-slate-700 rounded-bl-none shadow-sm'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-indigo-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-white border-t border-slate-100">
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 bg-slate-100 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 ring-indigo-500 outline-none"
                                placeholder="Escribe una orden..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                            />
                            <button 
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="bg-indigo-600 text-slate-900 p-2 rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Internal Component: Advanced Gantt Chart with Navigation
const GanttChart: React.FC<{ 
    tasks: Task[], 
    projects: Project[], 
    title?: string, 
    showAssignee?: boolean,
    groupByProject?: boolean 
}> = ({ tasks, projects, title, showAssignee = false, groupByProject = false }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Navigation Handlers
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Date Helpers
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Filter tasks that overlap with current view
    const getVisibleTasks = (taskList: Task[]) => taskList.filter(task => {
        const start = new Date(task.startDate);
        const end = new Date(task.dueDate);
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0);
        return start <= monthEnd && end >= monthStart;
    });

    const visibleTasks = getVisibleTasks(tasks);

    const getTaskStyle = (startStr: string, endStr: string) => {
        const taskStart = new Date(startStr);
        const taskEnd = new Date(endStr);
        const monthStart = new Date(year, month, 1);
        const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

        let startDay = taskStart < monthStart ? 1 : taskStart.getDate();
        let endDay = taskEnd > monthEnd ? daysInMonth : taskEnd.getDate();

        const duration = endDay - startDay + 1;

        return {
            gridColumnStart: startDay,
            gridColumnEnd: `span ${duration > 0 ? duration : 1}`
        };
    };

    const getStatusGradient = (status: TaskStatus) => {
        switch(status) {
            case 'TODO': return 'from-slate-300 to-slate-400';
            case 'IN_PROGRESS': return 'from-blue-500 to-blue-600';
            case 'DONE': return 'from-green-500 to-green-600';
        }
    };

    // Render Single Task Row
    const renderTaskRow = (task: Task, project: Project | undefined, isIndented: boolean = false) => {
        const style = getTaskStyle(task.startDate, task.dueDate);
        const assignee = showAssignee ? MOCK_USERS.find(u => u.id === task.assignedToUserId) : null;

        return (
            <div key={task.id} className={`grid grid-cols-[280px_1fr] gap-6 items-center group hover:bg-slate-50 rounded-xl p-2 -mx-2 transition-colors ${isIndented ? 'pl-6' : ''}`}>
                <div className="pr-2 border-r border-transparent group-hover:border-slate-100">
                    <div className="text-sm font-bold text-slate-800 truncate flex items-center gap-2">
                        {isIndented && <div className="w-2 h-px bg-slate-300"></div>}
                        <span className="truncate" title={task.title}>{task.title}</span>
                    </div>
                    <div className={`flex items-center gap-2 mt-1 ${isIndented ? 'pl-4' : ''}`}>
                        {!groupByProject && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate bg-slate-100 px-1.5 py-0.5 rounded-md max-w-[120px]">
                                <Briefcase size={10} />
                                <span className="truncate">{project?.name}</span>
                            </div>
                        )}
                        {assignee && (
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full" title={`Asignado a: ${assignee.name}`}>
                                <img src={assignee.avatar} className="w-3 h-3 rounded-full"/>
                                <span className="text-[9px] font-bold">{assignee.name.split(' ')[0]}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid h-8 relative rounded-full bg-slate-100/50" style={{ gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}>
                    {days.map(d => (
                        <div key={d} className="border-l border-slate-100 h-full"></div>
                    ))}
                    
                    <div 
                        className={`absolute top-1 bottom-1 rounded-full shadow-sm bg-gradient-to-r ${getStatusGradient(task.status)} group-hover:shadow-md transition-all cursor-default z-10 flex items-center justify-center overflow-hidden`}
                        style={style}
                        title={`${task.startDate} al ${task.dueDate} (${task.progress}%) - ${task.status}`}
                    >
                        <div className="absolute left-0 top-0 bottom-0 bg-black/10" style={{width: `${task.progress}%`}}></div>
                        <span className="text-[9px] font-bold text-white drop-shadow-md z-20 px-2 truncate w-full text-center">
                            {task.progress}%
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
            <div className="p-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <BarChart2 size={20} className="text-blue-600"/> {title || 'Cronograma de Actividades'}
                 </h3>
                 
                 <div className="flex items-center bg-slate-100 rounded-lg p-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
                        <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-bold text-slate-700 px-4 min-w-[120px] text-center uppercase tracking-wide">
                        {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
                        <ChevronRight size={18} />
                    </button>
                 </div>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[900px] p-6">
                    {/* Gantt Header (Days) */}
                    <div className="grid grid-cols-[280px_1fr] gap-6 mb-4 border-b border-slate-100 pb-2">
                        <div className="font-bold text-xs text-slate-400 uppercase tracking-wider self-end">
                            {groupByProject ? 'Proyecto / Actividad' : 'Actividad / Proyecto'}
                        </div>
                        <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${daysInMonth}, 1fr)` }}>
                            {days.map(d => {
                                const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                                return (
                                    <div key={d} className={`flex flex-col items-center justify-end pb-1 ${isToday ? 'bg-blue-50 rounded-t-md' : ''}`}>
                                        <span className={`text-[10px] font-medium ${isToday ? 'text-blue-600' : 'text-slate-300'}`}>
                                            {d}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Gantt Rows */}
                    <div className="space-y-4">
                        {visibleTasks.length === 0 && (
                            <div className="text-center py-12 flex flex-col items-center justify-center text-slate-400">
                                <Calendar size={32} className="mb-2 opacity-20"/>
                                <p className="text-sm italic">No hay actividades visibles en {currentDate.toLocaleString('es-ES', { month: 'long' })}.</p>
                            </div>
                        )}

                        {groupByProject ? (
                            // Grouped View: Iterate Projects -> Tasks
                            projects.map(project => {
                                const projectTasks = visibleTasks.filter(t => t.projectId === project.id);
                                if (projectTasks.length === 0) return null;

                                return (
                                    <div key={project.id} className="mb-6">
                                        {/* Project Header Row */}
                                        <div className="flex items-center gap-2 bg-slate-50 py-2 px-3 rounded-lg border border-slate-100 mb-2 sticky left-0">
                                            <Folder size={16} className="text-blue-600 fill-blue-100"/>
                                            <span className="font-bold text-slate-800 text-sm">{project.name}</span>
                                            <span className="text-xs text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100 ml-2">
                                                {projectTasks.length} actividades
                                            </span>
                                        </div>
                                        
                                        {/* Nested Tasks */}
                                        <div className="space-y-1">
                                            {projectTasks.map(task => renderTaskRow(task, project, true))}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            // Flat View (Sorted by Date/Name)
                            visibleTasks.map(task => renderTaskRow(task, projects.find(p => p.id === task.projectId)))
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-slate-50 p-4 text-[10px] flex gap-6 text-slate-500 border-t border-slate-100 justify-end">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-300 to-slate-400"></span> Pendiente (0%)</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></span> En Progreso (1-99%)</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600"></span> Completado (100%)</div>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  data, onLogout, onNavigateAdmin, onSendMessage, onCreateGroup, onCreateDM, onAddTask, onUpdateTask,
  onAddCalendarEvent, onRequestVacation, onApproveVacation, onRequestLoan, onMarkTrainingComplete,
  onRequestDocument, onMarkNotificationRead, odooData, onRefreshOdooData
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'docs' | 'hr' | 'calendar' | 'learning'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Chat State
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [chatInput, setChatInput] = useState('');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  // Project State
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectView, setProjectView] = useState<'board' | 'personal' | 'global'>('board');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState<{title: string, desc: string, assignee: string, startDate: string, date: string}>({
      title: '', desc: '', assignee: '', startDate: '', date: ''
  });

  // Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'EVENT' as 'EVENT' | 'HOLIDAY', isWorkingDay: true, description: '' });
  const [showEventModal, setShowEventModal] = useState(false);

  // HR State
  const [vacationRequest, setVacationRequest] = useState({ startDate: '', endDate: '', days: 0, comments: '' });
  const [loanRequest, setLoanRequest] = useState({ amount: 0, reason: '', paymentTermMonths: 12, guarantor: '', monthlyIncome: 0 });
  const [documentRequest, setDocumentRequest] = useState({ type: 'WORK_CERTIFICATE', additionalDetails: '' });
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Docs State
  const [selectedDocDept, setSelectedDocDept] = useState<string>('All');
  const [activeDocTab, setActiveDocTab] = useState<'documents' | 'templates'>('documents');

  const user = data.currentUser as User;
  const unreadNotifications = data.notifications?.filter(n => n.userId === user.id && !n.read).length || 0;

  // Resolve active channel
  const activeChannel = data.channels.find(c => c.id === activeChannelId) || data.channels[0];
  const channelMessages = data.messages.filter(m => m.channelId === activeChannelId);

  // Derived lists
  const groupChannels = data.channels.filter(c => c.type === 'GROUP');
  const availableUsers = MOCK_USERS.filter(u => u.id !== user.id);
  
  // --- PROJECT VISIBILITY LOGIC ---
  // Users only see projects they are participants in.
  // Exception: CEO and MANAGER roles see ALL projects (for oversight).
  const visibleProjects = data.projects.filter(project => {
      if (user.role === UserRole.CEO || user.role === UserRole.MANAGER) {
          return true; // Admins see all
      }
      return project.participantIds.includes(user.id);
  });

  // Filter tasks: Only tasks belonging to visible projects
  const visibleTasks = data.tasks.filter(task => 
      visibleProjects.some(p => p.id === task.projectId)
  );

  const myTasks = visibleTasks.filter(t => t.assignedToUserId === user.id);
  
  // Selected Project logic: Ensure selected project is actually visible
  const currentProject = visibleProjects.find(p => p.id === selectedProjectId);
  const currentProjectTasks = selectedProjectId ? visibleTasks.filter(t => t.projectId === selectedProjectId) : [];

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    onSendMessage(activeChannelId, chatInput);
    setChatInput('');
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName);
      setNewGroupName('');
      setShowCreateGroupModal(false);
    }
  };

  const handleUserSelect = (targetUserId: string) => {
    const existingChannel = data.channels.find(c => 
      c.type === 'DIRECT' && 
      c.participants.includes(user.id) && 
      c.participants.includes(targetUserId)
    );

    if (existingChannel) {
      setActiveChannelId(existingChannel.id);
    } else {
      onCreateDM(targetUserId);
    }
    setActiveTab('chat' as any); 
  };

  const handleCreateTask = () => {
      if (selectedProjectId && newTask.title && newTask.assignee) {
          onAddTask({
              id: Date.now().toString(),
              projectId: selectedProjectId,
              title: newTask.title,
              description: newTask.desc,
              assignedToUserId: newTask.assignee,
              status: 'TODO',
              progress: 0,
              startDate: newTask.startDate || new Date().toLocaleDateString(),
              dueDate: newTask.date || new Date().toLocaleDateString()
          });
          setShowTaskModal(false);
          setNewTask({ title: '', desc: '', assignee: '', startDate: '', date: '' });
      }
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date) {
      onAddCalendarEvent({
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        type: newEvent.type,
        isWorkingDay: newEvent.isWorkingDay,
        description: newEvent.description
      });
      setShowEventModal(false);
      setNewEvent({ title: '', date: '', type: 'EVENT', isWorkingDay: true, description: '' });
    }
  };

  const handleRequestVacation = () => {
    if (vacationRequest.startDate && vacationRequest.endDate) {
      onRequestVacation({
        id: Date.now().toString(),
        userId: user.id,
        startDate: vacationRequest.startDate,
        endDate: vacationRequest.endDate,
        days: vacationRequest.days,
        status: 'PENDING',
        requestDate: new Date().toISOString().split('T')[0],
        comments: vacationRequest.comments
      });
      setShowVacationModal(false);
      setVacationRequest({ startDate: '', endDate: '', days: 0, comments: '' });
      alert('Solicitud de vacaciones enviada con éxito.');
    }
  };

  const handleRequestLoan = () => {
    if (loanRequest.amount > 0 && loanRequest.reason) {
      onRequestLoan({
        id: Date.now().toString(),
        userId: user.id,
        amount: loanRequest.amount,
        balance: loanRequest.amount,
        status: 'PENDING',
        requestDate: new Date().toISOString().split('T')[0],
        reason: loanRequest.reason,
        paymentTermMonths: loanRequest.paymentTermMonths,
        guarantor: loanRequest.guarantor,
        monthlyIncome: loanRequest.monthlyIncome
      });
      setShowLoanModal(false);
      setLoanRequest({ amount: 0, reason: '', paymentTermMonths: 12, guarantor: '', monthlyIncome: 0 });
      alert('Solicitud de préstamo enviada con éxito.');
    }
  };

  const handleRequestDocument = () => {
    onRequestDocument({
      id: Date.now().toString(),
      userId: user.id,
      type: documentRequest.type,
      status: 'PENDING',
      requestDate: new Date().toISOString().split('T')[0],
      additionalDetails: documentRequest.additionalDetails
    });
    setShowDocumentModal(false);
    setDocumentRequest({ type: 'WORK_CERTIFICATE', additionalDetails: '' });
    alert('Solicitud de documento enviada con éxito.');
  };

  const getStatusColor = (status: TaskStatus) => {
      switch(status) {
          case 'TODO': return 'bg-slate-100 text-slate-600 border-slate-200';
          case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border-blue-200';
          case 'DONE': return 'bg-green-50 text-green-600 border-green-200';
      }
  };

  const renderCalendar = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthName = currentCalendarDate.toLocaleString('es-ES', { month: 'long' });

    const prevMonth = () => setCurrentCalendarDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentCalendarDate(new Date(year, month + 1, 1));

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
              <CalendarDays className="text-blue-600"/> Calendario {year}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft size={20}/></button>
              <span className="font-bold text-lg capitalize min-w-[120px] text-center">{monthName}</span>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight size={20}/></button>
              {(user.role === UserRole.MANAGER || user.role === UserRole.HR || user.role === UserRole.CEO) && (
                <button 
                  onClick={() => setShowEventModal(true)}
                  className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18}/> Agregar Evento
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4 mb-2 text-center font-bold text-slate-400 text-sm uppercase">
            <div>Dom</div><div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div>
          </div>
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-32 bg-slate-50/50 rounded-xl"></div>
            ))}
            {days.map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const events = data.calendarEvents?.filter(e => e.date === dateStr) || [];
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div key={day} className={`h-32 p-2 rounded-xl border ${isToday ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-white'} relative group hover:shadow-md transition-shadow overflow-hidden`}>
                  <span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</span>
                  <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {events.map(event => (
                      <div key={event.id} className={`text-[10px] p-1 rounded border truncate ${
                        event.type === 'HOLIDAY' 
                          ? 'bg-red-50 text-red-700 border-red-100' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`} title={event.title}>
                        {event.type === 'HOLIDAY' && <Flag size={10} className="inline mr-1"/>}
                        {event.title}
                        {!event.isWorkingDay && <span className="block text-[8px] opacity-75">(No Laborable)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 text-slate-800">Próximos Eventos y Feriados</h3>
          <div className="space-y-3">
            {data.calendarEvents
              ?.filter(e => new Date(e.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map(event => (
                <div key={event.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className={`p-3 rounded-lg ${event.type === 'HOLIDAY' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    <Calendar size={20}/>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{event.title}</h4>
                    <p className="text-xs text-slate-500">{event.date} • {event.isWorkingDay ? 'Día Laborable' : 'No Laborable'}</p>
                  </div>
                </div>
              ))}
              {(!data.calendarEvents || data.calendarEvents.filter(e => new Date(e.date) >= new Date()).length === 0) && (
                <p className="text-slate-500 italic text-sm">No hay eventos próximos.</p>
              )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* CEO Message - Dynamic */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3 bg-slate-900 rounded-xl h-48 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                {data.ceoMessage.imageUrl ? (
                   <img src={data.ceoMessage.imageUrl} alt="CEO" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                ) : (
                   <Video className="text-white w-12 h-12 relative z-10" />
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                   Actualizado: {data.ceoMessage.updatedAt}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Mensaje de Dirección</h2>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 italic text-slate-600">
                  "{data.ceoMessage.text}"
                </div>
                <div className="flex items-center gap-3">
                   <img src="https://ui-avatars.com/api/?name=Roberto+Mendez&background=000&color=fff" alt="CEO" className="w-10 h-10 rounded-full" />
                   <div>
                     <p className="font-bold text-sm">Roberto Méndez</p>
                     <p className="text-xs text-slate-500">CEO Corpocrea</p>
                   </div>
                </div>
              </div>
              
              {user.role === UserRole.MANAGER && (
                <button onClick={onNavigateAdmin} className="absolute top-6 right-6 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full transition-colors">
                  Editar Mensaje
                </button>
              )}
            </div>

            {/* Internal News */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Bell className="text-blue-500" size={20}/> Noticias Internas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.news.map(n => (
                  <div key={n.id} className="group cursor-pointer">
                    <div className="h-40 rounded-xl overflow-hidden mb-3">
                      <img src={n.imageUrl} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{n.title}</h4>
                    <span className="text-xs text-slate-500">{n.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Promotions & New Hires Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Promotions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><TrendingUp className="text-[#CBA052]" size={20}/> Ascensos Recientes</h3>
                {data.promotions && data.promotions.length > 0 ? (
                  <div className="space-y-3">
                    {data.promotions.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#CBA052]/5 to-transparent rounded-xl border border-[#CBA052]/10">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.employeeName} className="w-10 h-10 rounded-full object-cover ring-2 ring-[#CBA052]/30"/>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CBA052] to-[#a07d3a] flex items-center justify-center text-white font-bold">
                            {p.employeeName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-800">{p.employeeName}</p>
                          <p className="text-xs text-slate-500">{p.previousPosition} → <span className="text-[#1D3C34] font-semibold">{p.newPosition}</span></p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{p.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic text-center py-6">No hay ascensos registrados.</p>
                )}
              </div>

              {/* New Hires */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><UserPlus2 className="text-green-500" size={20}/> Nuevos Ingresos</h3>
                {data.newHires.length > 0 ? (
                  <div className="space-y-3">
                    {data.newHires.slice(0, 5).map((nh) => (
                      <div key={nh.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-100">
                        {nh.photoUrl ? (
                          <img src={nh.photoUrl} alt={nh.employeeName} className="w-10 h-10 rounded-full object-cover ring-2 ring-green-200"/>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D3C34] to-[#0f2219] flex items-center justify-center text-white font-bold text-sm ring-2 ring-green-200">
                            {nh.employeeName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-800">{nh.employeeName}</p>
                          <p className="text-xs text-slate-500">{nh.position || 'Sin asignar'} • {nh.department || 'Sin departamento'}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">NUEVO</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic text-center py-6">No hay ingresos recientes.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'hr':
        // Determine display data: use Odoo data if available, fallback to mock
        const hasOdooData = odooData && !odooData.loading && !odooData.error;
        const displayBenefits = hasOdooData && odooData.socialBenefits 
          ? odooData.socialBenefits.total_available 
          : user.socialBenefits || 0;
        const displayVacation = hasOdooData && odooData.vacation 
          ? odooData.vacation.days_available 
          : user.vacationDays || 0;
        const displayVacationTotal = hasOdooData && odooData.vacation 
          ? odooData.vacation.total_entitled_days 
          : (user.vacationDays || 0);
        const displaySeniority = hasOdooData && odooData.vacation 
          ? odooData.vacation.years_of_seniority 
          : 0;
        const odooLoans = hasOdooData && odooData.loans ? odooData.loans.items : [];
        const isOdooConnected = Boolean(odooData?.employee);

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
             {/* Connection Status Banner */}
             <div className={`rounded-2xl p-4 flex items-center justify-between ${
               isOdooConnected 
                 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
                 : 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
             }`}>
               <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-xl ${isOdooConnected ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                   <Database size={20} />
                 </div>
                 <div>
                   <p className={`text-sm font-bold ${isOdooConnected ? 'text-green-800' : 'text-orange-800'}`}>
                     {odooData?.loading ? 'Consultando Odoo...' : isOdooConnected ? 'Conectado a Odoo' : 'Datos locales (sin conexión a Odoo)'}
                   </p>
                   {isOdooConnected && odooData?.employee && (
                     <p className="text-xs text-green-600">
                       Empleado: {odooData.employee.name} | Cédula: {odooData.employee.identification_id}
                     </p>
                   )}
                   {odooData?.error && (
                     <p className="text-xs text-orange-600">{odooData.error}</p>
                   )}
                 </div>
               </div>
               <button 
                 onClick={onRefreshOdooData}
                 disabled={odooData?.loading}
                 className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                   isOdooConnected 
                     ? 'bg-green-100 hover:bg-green-200 text-green-700' 
                     : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                 } disabled:opacity-50`}
               >
                 {odooData?.loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                 Actualizar
               </button>
             </div>

             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Users size={24}/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Gestión Humana</h2>
                        <p className="text-sm text-slate-500">Consulta tus beneficios y documentos laborales</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {/* Prestaciones Sociales */}
                     <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 relative overflow-hidden group hover:shadow-md transition-all">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                         <div className="flex items-center justify-between mb-4 relative z-10">
                             <h3 className="font-bold text-slate-700">Prestaciones Sociales</h3>
                             <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                                 <DollarSign size={20}/>
                             </div>
                         </div>
                         <div className="relative z-10">
                             {odooData?.loading ? (
                               <div className="flex items-center gap-2 py-4">
                                 <Loader2 size={20} className="animate-spin text-blue-500" />
                                 <span className="text-sm text-blue-600">Consultando...</span>
                               </div>
                             ) : (
                               <>
                                 <p className="text-3xl font-bold text-slate-800 tracking-tight">
                                     Bs. {displayBenefits.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                                 </p>
                                 {isOdooConnected && odooData?.socialBenefits && (
                                   <div className="mt-2 space-y-1">
                                     <div className="flex justify-between text-[11px]">
                                       <span className="text-slate-500">Generadas:</span>
                                       <span className="font-bold text-slate-700">Bs. {odooData.socialBenefits.social_benefits_generated.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                                     </div>
                                     <div className="flex justify-between text-[11px]">
                                       <span className="text-slate-500">Intereses:</span>
                                       <span className="font-bold text-slate-700">Bs. {odooData.socialBenefits.benefit_interest.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                                     </div>
                                     <div className="flex justify-between text-[11px]">
                                       <span className="text-slate-500">Adelantos:</span>
                                       <span className="font-bold text-red-600">-Bs. {odooData.socialBenefits.advances_of_social_benefits.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                                     </div>
                                   </div>
                                 )}
                                 <p className="text-xs text-slate-500 mt-2 font-medium">
                                   {isOdooConnected ? 'Desde Odoo - Disponibles a la fecha' : 'Disponibles a la fecha'}
                                 </p>
                               </>
                             )}
                             <button className="mt-4 w-full py-2 bg-white/50 hover:bg-white text-blue-700 text-xs font-bold rounded-lg transition-colors border border-blue-100">
                               Solicitar Adelanto
                             </button>
                         </div>
                     </div>

                     {/* Días de Vacaciones */}
                     <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100 relative overflow-hidden group hover:shadow-md transition-all">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 rounded-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform"></div>
                         <div className="flex items-center justify-between mb-4 relative z-10">
                             <h3 className="font-bold text-slate-700">Vacaciones</h3>
                             <div className="p-2 bg-white rounded-lg shadow-sm text-orange-600">
                                 <Calendar size={20}/>
                             </div>
                         </div>
                         <div className="relative z-10">
                             {odooData?.loading ? (
                               <div className="flex items-center gap-2 py-4">
                                 <Loader2 size={20} className="animate-spin text-orange-500" />
                                 <span className="text-sm text-orange-600">Consultando...</span>
                               </div>
                             ) : (
                               <>
                                 <p className="text-3xl font-bold text-slate-800 tracking-tight">
                                     {displayVacation} <span className="text-lg font-normal text-slate-500">días</span>
                                 </p>
                                 {isOdooConnected && odooData?.vacation && (
                                   <div className="mt-2 space-y-1">
                                     <div className="flex justify-between text-[11px]">
                                       <span className="text-slate-500">Corresponden:</span>
                                       <span className="font-bold text-slate-700">{displayVacationTotal} días</span>
                                     </div>
                                     <div className="flex justify-between text-[11px]">
                                       <span className="text-slate-500">Disfrutados:</span>
                                       <span className="font-bold text-orange-600">{odooData.vacation.days_taken} días</span>
                                     </div>
                                     <div className="flex justify-between text-[11px]">
                                       <span className="text-slate-500">Antigüedad:</span>
                                       <span className="font-bold text-slate-700">{displaySeniority} años</span>
                                     </div>
                                   </div>
                                 )}
                                 <p className="text-xs text-slate-500 mt-2 font-medium">
                                   {isOdooConnected ? 'Desde Odoo - Disponibles para disfrutar' : 'Disponibles para disfrutar'}
                                 </p>
                               </>
                             )}
                             <button 
                               onClick={() => setShowVacationModal(true)}
                               className="mt-4 w-full py-2 bg-white/50 hover:bg-white text-orange-700 text-xs font-bold rounded-lg transition-colors border border-orange-100"
                             >
                               Solicitar Vacaciones
                             </button>
                         </div>
                     </div>

                     {/* Carta Laboral */}
                     <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-sm hover:shadow-md">
                         <div>
                             <div className="flex items-center justify-between mb-4">
                                 <h3 className="font-bold text-slate-700">Certificados</h3>
                                 <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                     <FileText size={20}/>
                                 </div>
                             </div>
                             <p className="text-sm text-slate-500 mb-6">Solicita tu carta laboral o certificados de ingresos y retenciones de forma automática.</p>
                         </div>
                         <button 
                             onClick={() => setShowDocumentModal(true)}
                             className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
                         >
                             <Download size={18}/> Solicitar Documento
                         </button>
                     </div>
                 </div>
             </div>

             {/* Préstamos Activos Section - Odoo Integrated */}
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <DollarSign className="text-green-600"/> Mis Préstamos
                    {isOdooConnected && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">ODOO</span>
                    )}
                  </h3>
                  <button 
                    onClick={() => setShowLoanModal(true)}
                    className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold hover:bg-green-100 transition-colors"
                  >
                    + Solicitar Préstamo
                  </button>
                </div>
                
                {odooData?.loading ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                    <p className="text-sm">Consultando préstamos en Odoo...</p>
                  </div>
                ) : isOdooConnected && odooLoans.length > 0 ? (
                  <div className="space-y-3">
                    {odooLoans.map((loan: OdooLoanItem, idx: number) => (
                      <div key={`${loan.source}-${loan.id}-${idx}`} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-800">{loan.name || loan.type}</p>
                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{loan.source}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {loan.start_date ? `Desde: ${loan.start_date}` : ''}
                            {loan.end_date ? ` - Hasta: ${loan.end_date}` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">
                            {loan.remaining ? `$${loan.remaining.toLocaleString('en-US')}` : ''} 
                            <span className="text-slate-400 font-normal"> / </span>
                            ${loan.amount.toLocaleString('en-US')}
                          </p>
                          <div className="flex items-center gap-2 justify-end mt-1">
                            {loan.paid_amount !== undefined && loan.amount > 0 && (
                              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 rounded-full transition-all"
                                  style={{ width: `${Math.min((loan.paid_amount / loan.amount) * 100, 100)}%` }}
                                ></div>
                              </div>
                            )}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              loan.state === 'paid' || loan.state === 'disbursed' ? 'bg-blue-100 text-blue-700' :
                              loan.state === 'done' || loan.state === 'closed' ? 'bg-green-100 text-green-700' : 
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {loan.state_label || loan.state}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (!user.loans || user.loans.length === 0) && odooLoans.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p>No tienes préstamos activos actualmente.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user.loans.map(loan => (
                      <div key={loan.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">{loan.reason}</p>
                          <p className="text-xs text-slate-500">Solicitado: {loan.requestDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">${loan.balance.toLocaleString('en-US')} / ${loan.amount.toLocaleString('en-US')}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            loan.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' :
                            loan.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {loan.status === 'ACTIVE' ? 'Activo' : loan.status === 'PAID' ? 'Pagado' : 'Pendiente'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             {/* Vacation Requests History */}
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                  <Clock className="text-orange-500"/> Historial de Solicitudes
                </h3>
                <div className="space-y-3">
                  {data.vacationRequests?.filter(r => r.userId === user.id).length === 0 ? (
                     <p className="text-slate-500 italic text-sm">No hay solicitudes recientes.</p>
                  ) : (
                    data.vacationRequests?.filter(r => r.userId === user.id).map(req => (
                      <div key={req.id} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-slate-700">Vacaciones ({req.days} días)</p>
                          <p className="text-xs text-slate-500">{req.startDate} - {req.endDate}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          req.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {req.status === 'APPROVED' ? 'Aprobado' : req.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
             </div>

             {/* HR Admin Panel (Only for HR/Manager) */}
             {(user.role === UserRole.MANAGER || user.role === UserRole.HR) && (
               <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
                 <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><UserCheck/> Panel de Aprobaciones (RRHH)</h3>
                 <div className="space-y-4">
                   {data.vacationRequests?.filter(r => r.status === 'PENDING').length === 0 ? (
                     <p className="text-slate-400 text-sm">No hay solicitudes pendientes.</p>
                   ) : (
                     data.vacationRequests?.filter(r => r.status === 'PENDING').map(req => {
                       const requester = MOCK_USERS.find(u => u.id === req.userId);
                       return (
                         <div key={req.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                           <div className="flex justify-between items-start mb-3">
                             <div>
                               <p className="font-bold text-sm">{requester?.name || 'Usuario'}</p>
                               <p className="text-xs text-slate-400">{requester?.position}</p>
                             </div>
                             <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">Pendiente</span>
                           </div>
                           <p className="text-sm mb-3">Solicita <b>{req.days} días</b> de vacaciones ({req.startDate} al {req.endDate})</p>
                           <div className="flex gap-2">
                             <button 
                               onClick={() => onApproveVacation(req.id, true)}
                               className="flex-1 bg-green-600 hover:bg-green-700 py-1.5 rounded-lg text-xs font-bold transition-colors"
                             >
                               Aprobar
                             </button>
                             <button 
                               onClick={() => onApproveVacation(req.id, false)}
                               className="flex-1 bg-red-600 hover:bg-red-700 py-1.5 rounded-lg text-xs font-bold transition-colors"
                             >
                               Rechazar
                             </button>
                           </div>
                         </div>
                       );
                     })
                   )}
                 </div>
               </div>
             )}
          </div>
        );

      case 'docs':
        // Get unique departments from documents + 'All'
        const departments = ['All', ...Array.from(new Set(data.documents.map(d => d.department || 'General')))];
        
        const filteredDocs = data.documents.filter(d => {
            // First filter by department
            const matchesDept = selectedDocDept === 'All' || (d.department || 'General') === selectedDocDept;
            // Then filter by type (Template vs others)
            const isTemplate = d.category === 'Template';
            const matchesType = activeDocTab === 'templates' ? isTemplate : !isTemplate;
            
            return matchesDept && matchesType;
        });

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
             {/* Tabs & Filter Bar */}
             <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                 {/* Type Tabs */}
                 <div className="flex bg-slate-100 p-1 rounded-xl">
                     <button 
                        onClick={() => setActiveDocTab('documents')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeDocTab === 'documents' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                        Documentos
                     </button>
                     <button 
                        onClick={() => setActiveDocTab('templates')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeDocTab === 'templates' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                        Plantillas
                     </button>
                 </div>

                 {/* Department Filter */}
                 <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar max-w-full">
                    {departments.map(dept => (
                        <button
                            key={dept}
                            onClick={() => setSelectedDocDept(dept)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                                selectedDocDept === dept 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {dept === 'All' ? 'Todos' : dept}
                        </button>
                    ))}
                 </div>
             </div>

             {/* Documents Grid */}
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                  <Folder className="text-blue-600"/> 
                  {activeDocTab === 'templates' ? 'Plantillas' : 'Documentos'} 
                  {selectedDocDept !== 'All' && ` - ${selectedDocDept}`}
                </h3>
                
                {filteredDocs.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                      <FileText size={48} className="mx-auto mb-4 opacity-20"/>
                      <p>No se encontraron {activeDocTab === 'templates' ? 'plantillas' : 'documentos'} en esta categoría.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocs.map(doc => (
                      <div key={doc.id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-colors group cursor-pointer">
                        <div className="p-2 bg-white rounded-lg text-blue-600 group-hover:text-blue-700">
                          <FileText size={24}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate" title={doc.name}>{doc.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{doc.department || 'General'}</span>
                              <span className="text-xs text-slate-500">{doc.category} • {doc.size}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-2">Subido: {doc.uploadDate}</p>
                        </div>
                        <button className="text-slate-400 hover:text-blue-600 transition-colors">
                          <Download size={18}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        );

      case 'learning':
        const myTrainings = data.trainings?.filter(t => t.department === 'General' || t.department === user.department) || [];
        const completedCount = myTrainings.filter(t => t.completedBy.includes(user.id)).length;
        const progress = myTrainings.length > 0 ? Math.round((completedCount / myTrainings.length) * 100) : 0;

        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Progress Header */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                   <h2 className="text-2xl font-bold mb-2">Centro de Aprendizaje</h2>
                   <p className="text-slate-300 max-w-lg">Capacítate y mejora tus habilidades con los cursos diseñados para tu rol en {user.department}.</p>
                 </div>
                 <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-indigo-900/50" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175.93} strokeDashoffset={175.93 - (175.93 * progress) / 100} className="text-white transition-all duration-1000 ease-out" />
                      </svg>
                      <span className="absolute font-bold text-sm">{progress}%</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{completedCount}/{myTrainings.length}</p>
                      <p className="text-xs text-indigo-200 uppercase tracking-wider">Cursos Completados</p>
                    </div>
                 </div>
               </div>
            </div>

            {/* Course List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTrainings.map(training => {
                const isCompleted = training.completedBy.includes(user.id);
                return (
                  <div key={training.id} className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-md flex flex-col ${isCompleted ? 'border-green-200 bg-green-50/30' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                        training.department === 'General' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-100 text-slate-800'
                      }`}>
                        {training.department}
                      </span>
                      {isCompleted && <div className="bg-green-100 text-green-700 p-1 rounded-full"><Check size={14} strokeWidth={3}/></div>}
                    </div>
                    
                    <h3 className="font-bold text-slate-800 mb-2 flex-1">{training.title}</h3>
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2">{training.description}</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Clock size={14}/> {training.duration}
                      </div>
                      
                      {isCompleted ? (
                        <button disabled className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-100 px-3 py-1.5 rounded-lg cursor-default">
                          Completado
                        </button>
                      ) : (
                        <button 
                          onClick={() => onMarkTrainingComplete && onMarkTrainingComplete(training.id)}
                          className="flex items-center gap-2 text-xs font-bold text-slate-900 bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <PlayCircle size={14}/> Iniciar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'calendar':
        return renderCalendar();

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Sidebar */}
      <aside className={`fixed md:sticky top-0 h-screen w-64 bg-slate-900 text-white z-30 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <span className="text-xl font-bold">CORPO<span className="text-indigo-600">CREA</span></span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400"><X /></button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
           <div className="flex items-center gap-3 mb-8">
             <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-blue-500" alt="avatar" />
             <div>
               <p className="font-bold text-sm line-clamp-1">{user.name}</p>
               <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                 {user.role}
               </p>
               {user.department && <p className="text-[9px] text-slate-500">{user.department}</p>}
             </div>
           </div>

           <nav className="space-y-2">
             <button onClick={() => {setActiveTab('home'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
               <Bell size={20} /> Inicio
             </button>
             <button onClick={() => {setActiveTab('calendar'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
               <CalendarDays size={20} /> Calendario
             </button>
             <button onClick={() => {setActiveTab('docs'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'docs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
               <FileText size={20} /> Documentos
             </button>
             <button onClick={() => {setActiveTab('learning'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'learning' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
               <GraduationCap size={20} /> E-Learning
             </button>
             <button onClick={() => {setActiveTab('hr'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'hr' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
               <Users size={20} /> Gestión Humana
             </button>
             
             {(user.role === UserRole.MANAGER || user.role === UserRole.CEO || user.role === UserRole.HR || user.role === UserRole.CONTENT_MANAGER) && (
               <div className="pt-6 mt-6 border-t border-slate-800">
                 <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">Administración</p>
                 <button onClick={onNavigateAdmin} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-yellow-500 hover:bg-slate-800 transition-colors">
                   <Users size={20} /> CMS Panel
                 </button>
               </div>
             )}
           </nav>
        </div>
        
        <div className="p-6 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-600"><Menu /></button>
            <h1 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab === 'home' ? 'Inicio' : 
               activeTab === 'docs' ? 'Documentación' : 
               activeTab === 'learning' ? 'Capacitación y Cursos' :
               activeTab === 'hr' ? 'Gestión Humana' : 
               activeTab === 'calendar' ? 'Calendario Corporativo' : activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString()}</p>
               <p className="text-xs text-slate-400">Bienvenido, {user.name.split(' ')[0]}</p>
            </div>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>
          </div>
        </header>
        
        <div className="p-6 md:p-8 relative">
          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute top-2 right-8 z-20 w-80 bg-white rounded-xl shadow-xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Notificaciones</h3>
                <button onClick={() => setShowNotifications(false)}><X size={16} className="text-slate-400"/></button>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {data.notifications?.filter(n => n.userId === user.id).length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No tienes notificaciones.</div>
                ) : (
                  data.notifications?.filter(n => n.userId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(n => (
                    <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`} onClick={() => onMarkNotificationRead(n.id)}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                        <div>
                          <p className={`text-sm ${!n.read ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2">{n.date}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {renderContent()}
        </div>

        {/* Modals */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Agregar Evento al Calendario</h3>
              <div className="space-y-3">
                <input 
                  type="text" placeholder="Título del evento" 
                  className="w-full p-2 border rounded-lg"
                  value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                />
                <input 
                  type="date" 
                  className="w-full p-2 border rounded-lg"
                  value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                />
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                >
                  <option value="EVENT">Evento Corporativo</option>
                  <option value="HOLIDAY">Feriado / Festivo</option>
                </select>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" id="workingDay"
                    checked={newEvent.isWorkingDay} onChange={e => setNewEvent({...newEvent, isWorkingDay: e.target.checked})}
                  />
                  <label htmlFor="workingDay" className="text-sm">¿Es día laborable?</label>
                </div>
                <textarea 
                  placeholder="Descripción (opcional)" 
                  className="w-full p-2 border rounded-lg"
                  value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                />
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowEventModal(false)} className="flex-1 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                  <button onClick={handleAddEvent} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showVacationModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Solicitar Vacaciones</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Fecha Inicio</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border rounded-lg"
                      value={vacationRequest.startDate} onChange={e => setVacationRequest({...vacationRequest, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Fecha Fin</label>
                    <input 
                      type="date" 
                      className="w-full p-2 border rounded-lg"
                      value={vacationRequest.endDate} onChange={e => setVacationRequest({...vacationRequest, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Cantidad de Días</label>
                  <input 
                    type="number" placeholder="Ej: 15"
                    className="w-full p-2 border rounded-lg"
                    value={vacationRequest.days} onChange={e => setVacationRequest({...vacationRequest, days: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Comentarios (Opcional)</label>
                  <textarea 
                    placeholder="Detalles adicionales..."
                    className="w-full p-2 border rounded-lg"
                    value={vacationRequest.comments} onChange={e => setVacationRequest({...vacationRequest, comments: e.target.value})}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowVacationModal(false)} className="flex-1 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                  <button onClick={handleRequestVacation} className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Enviar Solicitud</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showLoanModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Solicitar Préstamo (Tío San)</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Monto Solicitado (USD)</label>
                  <input 
                    type="number" placeholder="0.00"
                    className="w-full p-2 border rounded-lg"
                    value={loanRequest.amount} onChange={e => setLoanRequest({...loanRequest, amount: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Ingreso Mensual (USD)</label>
                  <input 
                    type="number" placeholder="0.00"
                    className="w-full p-2 border rounded-lg"
                    value={loanRequest.monthlyIncome} onChange={e => setLoanRequest({...loanRequest, monthlyIncome: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Plazo (Meses)</label>
                    <input 
                      type="number" placeholder="12"
                      className="w-full p-2 border rounded-lg"
                      value={loanRequest.paymentTermMonths} onChange={e => setLoanRequest({...loanRequest, paymentTermMonths: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Fiador (Opcional)</label>
                    <input 
                      type="text" placeholder="Nombre"
                      className="w-full p-2 border rounded-lg"
                      value={loanRequest.guarantor} onChange={e => setLoanRequest({...loanRequest, guarantor: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Motivo del Préstamo</label>
                  <textarea 
                    placeholder="Describe brevemente el motivo..."
                    className="w-full p-2 border rounded-lg"
                    value={loanRequest.reason} onChange={e => setLoanRequest({...loanRequest, reason: e.target.value})}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowLoanModal(false)} className="flex-1 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                  <button onClick={handleRequestLoan} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Enviar Solicitud</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDocumentModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Solicitar Documento</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Tipo de Documento</label>
                  <select 
                    className="w-full p-2 border rounded-lg"
                    value={documentRequest.type} 
                    onChange={e => setDocumentRequest({...documentRequest, type: e.target.value as any})}
                  >
                    <option value="WORK_CERTIFICATE">Carta Laboral</option>
                    <option value="INCOME_CERTIFICATE">Certificado de Ingresos</option>
                    <option value="VISA_LETTER">Carta para Visa</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Detalles Adicionales</label>
                  <textarea 
                    placeholder="Ej: Dirigido a quien corresponda, incluir salario..."
                    className="w-full p-2 border rounded-lg h-24"
                    value={documentRequest.additionalDetails} 
                    onChange={e => setDocumentRequest({...documentRequest, additionalDetails: e.target.value})}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowDocumentModal(false)} className="flex-1 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancelar</button>
                  <button onClick={handleRequestDocument} className="flex-1 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Solicitar</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};