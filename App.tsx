import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppState, AppActions, UserRole, NewsItem, EventItem, CeoMessageContent, DocumentItem, Task, TaskStatus, SocialBenefitsRequest, OdooDashboardState, CorporateCompany 
} from './types';
import { INITIAL_NEWS, INITIAL_EVENTS, INITIAL_EMPLOYEES, INITIAL_DOCUMENTS, MOCK_USERS, INITIAL_CHANNELS, INITIAL_MESSAGES, INITIAL_CEO_MESSAGE, INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_CALENDAR_EVENTS, INITIAL_VACATION_REQUESTS, INITIAL_TRAININGS, INITIAL_DEPARTMENTS, INITIAL_NOTIFICATIONS, INITIAL_DOCUMENT_REQUESTS, INITIAL_SOCIAL_BENEFITS_REQUESTS } from './data';
import { Landing } from './views/Landing';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { AdminPanel } from './views/AdminPanel';
import { odooApi } from './services/odooApi';
import { cloudinaryService } from './services/cloudinaryUpload';

type View = 'LANDING' | 'LOGIN' | 'DASHBOARD' | 'ADMIN';

const App: React.FC = () => {
  // Application State
  const [currentView, setCurrentView] = useState<View>('LANDING');
  
  // Odoo Dashboard State
  const [odooData, setOdooData] = useState<OdooDashboardState>({
    loading: false,
    error: null,
    socialBenefits: null,
    vacation: null,
    loans: null,
    employee: null,
  });

  // Registered users (persisted in session)
  const [registeredUsers, setRegisteredUsers] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('corpocrea_registered_users') || '[]');
    } catch { return []; }
  });

  const [data, setData] = useState<AppState>({
    news: INITIAL_NEWS,
    events: INITIAL_EVENTS,
    employees: INITIAL_EMPLOYEES,
    documents: INITIAL_DOCUMENTS,
    currentUser: null,
    channels: INITIAL_CHANNELS,
    messages: INITIAL_MESSAGES,
    ceoMessage: INITIAL_CEO_MESSAGE,
    projects: INITIAL_PROJECTS,
    tasks: INITIAL_TASKS,
    calendarEvents: INITIAL_CALENDAR_EVENTS,
    vacationRequests: INITIAL_VACATION_REQUESTS,
    trainings: INITIAL_TRAININGS,
    departments: INITIAL_DEPARTMENTS,
    notifications: INITIAL_NOTIFICATIONS,
    documentRequests: INITIAL_DOCUMENT_REQUESTS,
    socialBenefitsRequests: INITIAL_SOCIAL_BENEFITS_REQUESTS,
    corporateCompanies: [],
    siteLogoUrl: ''
  });

  // Fetch corporate companies and site logo on mount + restore token
  useEffect(() => {
    // Restore token for cloudinaryService if available
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      cloudinaryService.setToken(savedToken);
    }

    fetch('/api/admin/corporate-companies')
      .then(r => r.ok ? r.json() : [])
      .then(companies => setData(prev => ({ ...prev, corporateCompanies: companies })))
      .catch(() => {});

    // Settings: use token if available so we get the logo
    const headers: Record<string, string> = {};
    if (savedToken) headers['Authorization'] = `Bearer ${savedToken}`;
    fetch('/api/admin/settings', { headers })
      .then(r => r.ok ? r.json() : {})
      .then((settings: Record<string, string>) => {
        if (settings.site_logo_url) {
          setData(prev => ({ ...prev, siteLogoUrl: settings.site_logo_url }));
        }
      })
      .catch(() => {});
  }, []);

  // Actions
  const addNews = (item: NewsItem) => {
    setData(prev => ({ ...prev, news: [item, ...prev.news] }));
  };

  const deleteNews = (id: string) => {
    setData(prev => ({ ...prev, news: prev.news.filter(n => n.id !== id) }));
  };

  const addEvent = (item: EventItem) => {
    setData(prev => ({ ...prev, events: [...prev.events, item] }));
  };

  const deleteEvent = (id: string) => {
    setData(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));
  };

  const addDocument = (item: DocumentItem) => {
    setData(prev => ({ ...prev, documents: [item, ...prev.documents] }));
  };

  const deleteDocument = (id: string) => {
    setData(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== id) }));
  };

  // Fetch Odoo data for user
  const fetchOdooData = useCallback(async (identificationId: string) => {
    const config = odooApi.getConfig();
    if (!config.isConfigured || !identificationId) return;

    setOdooData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await odooApi.getEmployeeDashboard(identificationId);
      if (result.success && result.data) {
        setOdooData({
          loading: false,
          error: null,
          socialBenefits: result.data.social_benefits,
          vacation: result.data.vacation,
          loans: result.data.loans,
          employee: result.data.employee,
        });
      } else {
        setOdooData(prev => ({ ...prev, loading: false, error: result.error || 'Error al consultar Odoo' }));
      }
    } catch (err: any) {
      setOdooData(prev => ({ ...prev, loading: false, error: err.message }));
    }
  }, []);

  // Auth Logic with credentials
  const login = async (email: string, pass: string): Promise<boolean> => {
    // Try real API login first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      if (res.ok) {
        const { token, user } = await res.json();
        localStorage.setItem('token', token);
        cloudinaryService.setToken(token);
        setData(prev => ({ ...prev, currentUser: user }));
        setCurrentView('DASHBOARD');
        if (user.identificationId) fetchOdooData(user.identificationId);
        return true;
      }
    } catch (err) {
      console.warn('API login unavailable, falling back to mock users');
    }

    // Fallback: mock users (for development without DB)
    return new Promise(resolve => {
      setTimeout(() => {
        const allUsers = [...MOCK_USERS, ...registeredUsers];
        const userFound = allUsers.find(u => u.email === email && u.password === pass);
        if (userFound) {
          const { password, ...safeUser } = userFound;
          setData(prev => ({ ...prev, currentUser: safeUser as any }));
          setCurrentView('DASHBOARD');
          if (userFound.identificationId) fetchOdooData(userFound.identificationId);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800);
    });
  };

  // Register new user (verified via Odoo)
  const register = async (regData: { name: string; email: string; password: string; identificationId: string; odooEmployeeId: number; position: string; department: string }): Promise<boolean> => {
    // Check if email already exists
    const allUsers = [...MOCK_USERS, ...registeredUsers];
    if (allUsers.find(u => u.email === regData.email)) {
      return false;
    }

    const newUser = {
      id: `odoo-${regData.odooEmployeeId}`,
      name: regData.name,
      email: regData.email,
      password: regData.password,
      role: UserRole.EMPLOYEE,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(regData.name)}&background=1D3C34&color=fff`,
      position: regData.position,
      department: regData.department,
      identificationId: regData.identificationId,
      odooEmployeeId: regData.odooEmployeeId,
      vacationDays: 0,
      socialBenefits: 0,
      loans: [],
    };

    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem('corpocrea_registered_users', JSON.stringify(updated));
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    cloudinaryService.setToken(null);
    setData(prev => ({ ...prev, currentUser: null }));
    setCurrentView('LANDING');
  };

  // Chat Actions
  const sendMessage = (channelId: string, text: string) => {
    if (!data.currentUser) return;
    const newMessage = {
        id: Date.now().toString(),
        channelId,
        senderId: data.currentUser.id,
        senderName: data.currentUser.name,
        text,
        timestamp: new Date()
    };
    setData(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
  };

  const createGroupChannel = (name: string) => {
    if (!data.currentUser) return;
    // Only Manager or CEO can create groups
    if (data.currentUser.role !== UserRole.MANAGER && data.currentUser.role !== UserRole.CEO) return;
    
    const newChannel = {
        id: `group-${Date.now()}`,
        name,
        type: 'GROUP' as const,
        participants: ['all']
    };
    setData(prev => ({ ...prev, channels: [...prev.channels, newChannel] }));
  };

  const createDirectChannel = (targetUserId: string) => {
      const channelId = `dm-${Date.now()}`;
      const targetUser = MOCK_USERS.find(u => u.id === targetUserId);
      const name = targetUser ? targetUser.name : 'Unknown User';
      
      const newChannel = {
          id: channelId,
          name: name, // In a real app this is dynamic based on viewer
          type: 'DIRECT' as const,
          participants: [data.currentUser!.id, targetUserId]
      };
      setData(prev => ({ ...prev, channels: [...prev.channels, newChannel] }));
      return channelId;
  };

  const updateCeoMessage = (content: CeoMessageContent) => {
      setData(prev => ({ ...prev, ceoMessage: content }));
  };

  // Project Actions
  const addTask = (task: Task) => {
    setData(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
  };

  const updateTaskProgress = (taskId: string, progress: number) => {
    // Determine status automatically based on progress
    let status: TaskStatus = 'IN_PROGRESS';
    if (progress <= 0) status = 'TODO';
    if (progress >= 100) status = 'DONE';

    setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, progress, status } : t)
    }));
  };

  // Calendar & HR Actions
  const addCalendarEvent = (event: any) => {
    setData(prev => ({ ...prev, calendarEvents: [...prev.calendarEvents, event] }));
  };

  const requestVacation = (request: any) => {
    setData(prev => ({ 
      ...prev, 
      vacationRequests: [...prev.vacationRequests, request],
      notifications: [...prev.notifications, {
        id: `n-${Date.now()}`,
        userId: request.userId,
        title: 'Solicitud de Vacaciones',
        message: 'Tu solicitud ha sido recibida y está pendiente de aprobación.',
        date: new Date().toISOString().split('T')[0],
        read: false,
        type: 'INFO'
      }]
    }));
  };

  const approveVacation = (requestId: string, approved: boolean) => {
    setData(prev => ({
      ...prev,
      vacationRequests: prev.vacationRequests.map(r => 
        r.id === requestId ? { ...r, status: approved ? 'APPROVED' : 'REJECTED' } : r
      )
    }));
  };

  const requestLoan = (loan: any) => {
    if (!data.currentUser) return;
    
    // Add loan to user's list (mock persistence)
    const updatedUser = { ...data.currentUser, loans: [...(data.currentUser.loans || []), loan] };
    
    setData(prev => ({ 
      ...prev, 
      currentUser: updatedUser,
      notifications: [...prev.notifications, {
        id: `n-${Date.now()}`,
        userId: data.currentUser!.id,
        title: 'Solicitud de Préstamo',
        message: `Tu solicitud de préstamo por $${loan.amount} ha sido enviada a revisión.`,
        date: new Date().toISOString().split('T')[0],
        read: false,
        type: 'INFO'
      }]
    }));
  };

  const requestDocument = (doc: any) => {
    setData(prev => ({
      ...prev,
      documentRequests: [...prev.documentRequests, doc],
      notifications: [...prev.notifications, {
        id: `n-${Date.now()}`,
        userId: doc.userId,
        title: 'Solicitud de Documento',
        message: 'Tu solicitud de documento ha sido enviada a RRHH.',
        date: new Date().toISOString().split('T')[0],
        read: false,
        type: 'INFO'
      }]
    }));
  };

  const requestSocialBenefits = (request: SocialBenefitsRequest) => {
    setData(prev => ({
      ...prev,
      socialBenefitsRequests: [...prev.socialBenefitsRequests, request],
      notifications: [...prev.notifications, {
        id: `n-${Date.now()}`,
        userId: request.userId,
        title: 'Solicitud de Prestaciones',
        message: `Tu solicitud de adelanto de prestaciones por Bs. ${request.amount} ha sido enviada.`,
        date: new Date().toISOString().split('T')[0],
        read: false,
        type: 'INFO'
      }]
    }));
  };

  const markNotificationRead = (id: string) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n)
    }));
  };

  const markTrainingComplete = (trainingId: string) => {
    if (!data.currentUser) return;
    setData(prev => ({
      ...prev,
      trainings: prev.trainings.map(t => 
        t.id === trainingId ? { ...t, completedBy: [...t.completedBy, data.currentUser!.id] } : t
      )
    }));
  };

  const addDepartment = (dept: any) => {
    setData(prev => ({ ...prev, departments: [...prev.departments, dept] }));
  };

  const deleteDepartment = (id: string) => {
    setData(prev => ({ ...prev, departments: prev.departments.filter(d => d.id !== id) }));
  };

  const addCorporateCompany = (company: CorporateCompany) => {
    setData(prev => ({ ...prev, corporateCompanies: [...prev.corporateCompanies, company] }));
  };

  const deleteCorporateCompany = (id: string) => {
    setData(prev => ({ ...prev, corporateCompanies: prev.corporateCompanies.filter(c => c.id !== id) }));
  };

  const updateSiteLogoUrl = (url: string) => {
    setData(prev => ({ ...prev, siteLogoUrl: url }));
  };

  const actions: AppActions = {
    addNews, deleteNews, addEvent, deleteEvent, login, logout,
    sendMessage, createGroupChannel, createDirectChannel, updateCeoMessage,
    addDocument, deleteDocument, addTask, updateTaskProgress,
    addCalendarEvent, requestVacation, approveVacation, requestLoan,
    markTrainingComplete, addDepartment, deleteDepartment,
    requestDocument, markNotificationRead, requestSocialBenefits,
    addCorporateCompany, deleteCorporateCompany, updateSiteLogoUrl
  };

  // Router / View Switcher logic
  const renderView = () => {
    switch (currentView) {
      case 'LANDING':
        return <Landing data={data} onNavigateLogin={() => setCurrentView('LOGIN')} />;
      
      case 'LOGIN':
        return (
          <Login 
            onLogin={login}
            onRegister={register}
            onBack={() => setCurrentView('LANDING')} 
          />
        );
      
      case 'DASHBOARD':
        if (!data.currentUser) {
            setCurrentView('LOGIN'); // Protection
            return null;
        }
        return (
          <Dashboard 
            data={data} 
            onLogout={logout} 
            onNavigateAdmin={() => setCurrentView('ADMIN')}
            onSendMessage={sendMessage}
            onCreateGroup={createGroupChannel}
            onCreateDM={createDirectChannel}
            onAddTask={addTask}
            onUpdateTask={updateTaskProgress}
            onAddCalendarEvent={addCalendarEvent}
            onRequestVacation={requestVacation}
            onApproveVacation={approveVacation}
            onRequestLoan={requestLoan}
            onMarkTrainingComplete={markTrainingComplete}
            onRequestDocument={requestDocument}
            onMarkNotificationRead={markNotificationRead}
            onRequestSocialBenefits={requestSocialBenefits}
            odooData={odooData}
            onRefreshOdooData={() => {
              if (data.currentUser?.identificationId) {
                fetchOdooData(data.currentUser.identificationId);
              }
            }}
          />
        );

      case 'ADMIN':
        if (!data.currentUser || data.currentUser.role !== UserRole.MANAGER) {
            setCurrentView('DASHBOARD');
            return null;
        }
        return (
          <AdminPanel 
            data={data} 
            actions={actions} 
            onBack={() => setCurrentView('DASHBOARD')} 
          />
        );

      default:
        return <Landing data={data} onNavigateLogin={() => setCurrentView('LOGIN')} />;
    }
  };

  return (
    <>
      {renderView()}
    </>
  );
};

export default App;