import React, { useState, useRef, useEffect } from 'react';
import { AppState, AppActions, NewsItem, EventItem, UserRole, DocumentItem, Department, CorporateCompany, Promotion, NewHire } from '../types';
import { Trash2, Plus, ArrowLeft, Image as ImageIcon, Save, Video, Upload, File, X, Calendar, FileText, Users, Settings, Wifi, WifiOff, Loader2, Database, Shield, CheckCircle, AlertCircle, Globe, Cloud, CloudOff, Eye, EyeOff, Building2, TrendingUp, UserPlus2, KeyRound, Edit3 } from 'lucide-react';
import { odooApi } from '../services/odooApi';
import { CloudinaryUpload } from '../components/CloudinaryUpload';
import { cloudinaryService } from '../services/cloudinaryUpload';

interface AdminPanelProps {
  data: AppState;
  actions: AppActions;
  onBack: () => void;
}

// Legacy ImageUploadField removed — now using CloudinaryUpload component

export const AdminPanel: React.FC<AdminPanelProps> = ({ data, actions, onBack }) => {
  const [activeSection, setActiveSection] = useState<'news' | 'events' | 'ceo' | 'docs' | 'departments' | 'companies' | 'users' | 'settings' | 'promotions' | 'newhires' | 'usermgmt'>('news');
  const user = data.currentUser;
  
  // Local state for forms
  const [newNews, setNewNews] = useState<Partial<NewsItem>>({ title: '', description: '', imageUrl: '', date: '' });
  const [newEvent, setNewEvent] = useState<Partial<EventItem>>({ title: '', description: '', location: '', date: '' });
  
  // Document Form State
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docCategory, setDocCategory] = useState<DocumentItem['category']>('Policy');

  // Department Form State
  const [newDept, setNewDept] = useState<Partial<Department>>({ name: '', description: '' });

  // Corporate Company Form State
  const [newCompany, setNewCompany] = useState<Partial<CorporateCompany>>({ name: '', logoUrl: '', website: '' });

  // Promotion Form State
  const [newPromo, setNewPromo] = useState<Partial<Promotion>>({ employeeName: '', previousPosition: '', newPosition: '', department: '', date: '', description: '', photoUrl: '' });

  // New Hire Form State
  const [newHire, setNewHire] = useState<Partial<NewHire>>({ employeeName: '', position: '', department: '', date: '', description: '', photoUrl: '' });

  // Approved Users Management State
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  // Site Logo State
  const [siteLogoUrl, setSiteLogoUrl] = useState(data.siteLogoUrl || '');
  const [logoSaved, setLogoSaved] = useState(false);

  // Favicon State
  const [siteFaviconUrl, setSiteFaviconUrl] = useState('');
  const [faviconSaved, setFaviconSaved] = useState(false);

  useEffect(() => { setSiteLogoUrl(data.siteLogoUrl || ''); }, [data.siteLogoUrl]);

  // CEO Message Form
  const [ceoText, setCeoText] = useState(data.ceoMessage.text);
  const [ceoImage, setCeoImage] = useState(data.ceoMessage.imageUrl);

  // Pending Users State
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [approveForm, setApproveForm] = useState<Record<string, { role: string }>>({});

  // Fetch CEO message from DB on mount
  useEffect(() => {
    fetch('/api/admin/ceo-message')
      .then(r => r.ok ? r.json() : null)
      .then(msg => {
        if (msg) {
          setCeoText(msg.text || '');
          setCeoImage(msg.imageUrl || '');
        }
      })
      .catch(() => {});
  }, []);

  // Fetch pending users
  const fetchPendingUsers = async () => {
    setPendingLoading(true);
    try {
      const res = await fetch('/api/admin/pending-users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (res.ok) {
        const users = await res.json();
        setPendingUsers(users);
        // Init form defaults
        const defaults: Record<string, { role: string }> = {};
        users.forEach((u: any) => {
          defaults[u.id] = { role: u.role || 'EMPLOYEE' };
        });
        setApproveForm(defaults);
      }
    } catch (err) {
      console.error('Error fetching pending users:', err);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => { fetchPendingUsers(); }, []);

  const handleApproveUser = async (userId: string) => {
    const form = approveForm[userId];
    if (!form) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (err) {
      console.error('Error approving user:', err);
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de rechazar este usuario? Se eliminará su cuenta.')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (res.ok) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (err) {
      console.error('Error rejecting user:', err);
    }
  };

  // Odoo Settings State
  const odooConfig = odooApi.getConfig();
  const [odooUrl, setOdooUrl] = useState(odooConfig.baseUrl);
  const [odooApiKey, setOdooApiKey] = useState(odooConfig.apiKey);
  const [odooTestStatus, setOdooTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [odooTestMessage, setOdooTestMessage] = useState('');
  const [odooSaved, setOdooSaved] = useState(false);

  // Cloudinary Settings State
  const [cloudName, setCloudName] = useState('');
  const [cloudApiKey, setCloudApiKey] = useState('');
  const [cloudApiSecret, setCloudApiSecret] = useState('');
  const [cloudUploadPreset, setCloudUploadPreset] = useState('');
  const [cloudTestStatus, setCloudTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [cloudTestMessage, setCloudTestMessage] = useState('');
  const [cloudSaved, setCloudSaved] = useState(false);
  const [showCloudSecret, setShowCloudSecret] = useState(false);

  // Load Cloudinary + Odoo settings from backend on mount
  useEffect(() => {
    fetch('/api/admin/settings', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` } })
      .then(r => r.ok ? r.json() : {})
      .then((settings: Record<string, string>) => {
        if (settings.cloudinary_cloud_name) setCloudName(settings.cloudinary_cloud_name);
        if (settings.cloudinary_api_key) setCloudApiKey(settings.cloudinary_api_key);
        if (settings.cloudinary_api_secret) setCloudApiSecret(settings.cloudinary_api_secret);
        if (settings.cloudinary_upload_preset) setCloudUploadPreset(settings.cloudinary_upload_preset);
        if (settings.site_favicon_url) setSiteFaviconUrl(settings.site_favicon_url);
        // Load Odoo config from DB (overrides localStorage)
        if (settings.odoo_url) {
          setOdooUrl(settings.odoo_url);
          odooApi.setConfig(settings.odoo_url, settings.odoo_api_key || '');
        }
        if (settings.odoo_api_key) setOdooApiKey(settings.odoo_api_key);
      })
      .catch(() => {});
  }, []);

  const handleSaveCloudinarySettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          cloudinary_cloud_name: cloudName,
          cloudinary_api_key: cloudApiKey,
          cloudinary_api_secret: cloudApiSecret,
          cloudinary_upload_preset: cloudUploadPreset,
        }),
      });
      if (res.ok) {
        setCloudSaved(true);
        setTimeout(() => setCloudSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error saving Cloudinary settings:', err);
    }
  };

  const handleTestCloudinaryConnection = async () => {
    if (!cloudName || !cloudApiKey || !cloudApiSecret) {
      setCloudTestStatus('error');
      setCloudTestMessage('Completa Cloud Name, API Key y API Secret primero.');
      return;
    }
    setCloudTestStatus('testing');
    setCloudTestMessage('');
    // Save first so backend can use them
    await handleSaveCloudinarySettings();
    try {
      const result = await cloudinaryService.testConnection();
      if (result.success) {
        setCloudTestStatus('success');
        setCloudTestMessage(`Conexión exitosa con Cloudinary (${result.cloudName}).`);
      } else {
        setCloudTestStatus('error');
        setCloudTestMessage(result.error || 'No se pudo conectar.');
      }
    } catch (err: any) {
      setCloudTestStatus('error');
      setCloudTestMessage(err.message || 'Error de conexión.');
    }
  };

  const handleSaveOdooSettings = async () => {
    odooApi.setConfig(odooUrl, odooApiKey);
    // Also persist to DB so all clients get the same config
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ odoo_url: odooUrl, odoo_api_key: odooApiKey }),
      });
    } catch (err) {
      console.error('Error saving Odoo settings to DB:', err);
    }
    setOdooSaved(true);
    setTimeout(() => setOdooSaved(false), 3000);
  };

  const handleTestOdooConnection = async () => {
    if (!odooUrl) {
      setOdooTestStatus('error');
      setOdooTestMessage('Ingresa la URL de Odoo primero.');
      return;
    }
    setOdooTestStatus('testing');
    setOdooTestMessage('');
    try {
      // Save temporarily to test
      odooApi.setConfig(odooUrl, odooApiKey);
      const result = await odooApi.testConnection();
      if (result.success) {
        setOdooTestStatus('success');
        setOdooTestMessage('Conexión exitosa con el servidor Odoo.');
      } else {
        setOdooTestStatus('error');
        setOdooTestMessage(result.error || 'No se pudo conectar al servidor.');
      }
    } catch (err: any) {
      setOdooTestStatus('error');
      setOdooTestMessage(err.message || 'Error de conexión.');
    }
  };

  const handleAddNews = () => {
    if (newNews.title && newNews.description && newNews.imageUrl) {
      actions.addNews({
        id: Date.now().toString(),
        imageUrl: newNews.imageUrl!,
        title: newNews.title!,
        description: newNews.description!,
        date: newNews.date || new Date().toISOString().split('T')[0]
      });
      setNewNews({ title: '', description: '', imageUrl: '', date: '' });
    } else {
        alert("Por favor completa el título, la descripción y sube una imagen.");
    }
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date) {
      actions.addEvent({
        id: Date.now().toString(),
        title: newEvent.title!,
        description: newEvent.description || '',
        location: newEvent.location || 'Oficinas Centrales',
        date: newEvent.date!,
        imageUrl: newEvent.imageUrl || undefined,
        videoUrl: newEvent.videoUrl || undefined
      });
      setNewEvent({ title: '', description: '', location: '', date: '' });
    }
  };

  const handleUpdateCeo = async () => {
    try {
      const res = await fetch('/api/admin/ceo-message', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ text: ceoText, imageUrl: ceoImage }),
      });
      if (res.ok) {
        const msg = await res.json();
        actions.updateCeoMessage({
          text: msg.text,
          imageUrl: msg.imageUrl,
          updatedAt: msg.updatedAt,
        });
        alert('Mensaje de dirección actualizado correctamente.');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Error al actualizar el mensaje.');
      }
    } catch (err) {
      console.error('Error updating CEO message:', err);
      alert('Error de conexión al guardar el mensaje.');
    }
  };

  const handleAddDocument = () => {
    if (docFile) {
        const sizeMb = (docFile.size / (1024 * 1024)).toFixed(1);
        actions.addDocument({
            id: Date.now().toString(),
            name: docFile.name,
            category: docCategory,
            size: `${sizeMb} MB`,
            uploadDate: new Date().toLocaleDateString(),
            url: URL.createObjectURL(docFile)
        });
        setDocFile(null);
    }
  };

  const handleAddDepartment = () => {
    if (newDept.name) {
        actions.addDepartment({
            id: Date.now().toString(),
            name: newDept.name,
            description: newDept.description || '',
            managerId: newDept.managerId
        });
        setNewDept({ name: '', description: '', managerId: undefined });
    }
  };

  const handleAddCompany = async () => {
    if (newCompany.name && newCompany.logoUrl) {
      try {
        const res = await fetch('/api/admin/corporate-companies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({ name: newCompany.name, logoUrl: newCompany.logoUrl, website: newCompany.website || '' }),
        });
        if (res.ok) {
          const created = await res.json();
          actions.addCorporateCompany(created);
          setNewCompany({ name: '', logoUrl: '', website: '' });
        }
      } catch (err) {
        console.error('Error adding company:', err);
      }
    }
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/corporate-companies/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (res.ok) actions.deleteCorporateCompany(id);
    } catch (err) {
      console.error('Error deleting company:', err);
    }
  };

  const handleAddPromotion = async () => {
    if (newPromo.employeeName && newPromo.newPosition) {
      try {
        const res = await fetch('/api/admin/promotions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify(newPromo),
        });
        if (res.ok) {
          const created = await res.json();
          actions.addPromotion(created);
          setNewPromo({ employeeName: '', previousPosition: '', newPosition: '', department: '', date: '', description: '', photoUrl: '' });
        }
      } catch (err) {
        console.error('Error adding promotion:', err);
      }
    }
  };

  const handleDeletePromotion = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (res.ok) actions.deletePromotion(id);
    } catch (err) {
      console.error('Error deleting promotion:', err);
    }
  };

  // ======= New Hire Handlers =======
  const handleAddNewHire = async () => {
    if (newHire.employeeName) {
      try {
        const res = await fetch('/api/admin/new-hires', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify(newHire),
        });
        if (res.ok) {
          const created = await res.json();
          actions.addNewHire(created);
          setNewHire({ employeeName: '', position: '', department: '', date: '', description: '', photoUrl: '' });
        }
      } catch (err) {
        console.error('Error adding new hire:', err);
      }
    }
  };

  const handleDeleteNewHire = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/new-hires/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (res.ok) actions.deleteNewHire(id);
    } catch (err) {
      console.error('Error deleting new hire:', err);
    }
  };

  // ======= Approved Users Management =======
  const fetchApprovedUsers = async () => {
    setApprovedLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
      });
      if (res.ok) setApprovedUsers(await res.json());
    } catch (err) {
      console.error('Error fetching approved users:', err);
    } finally {
      setApprovedLoading(false);
    }
  };

  const handleChangeRole = async (userId: string) => {
    if (!editRole) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ role: editRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApprovedUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updated } : u));
        setEditingUserId(null);
        setEditRole('');
      }
    } catch (err) {
      console.error('Error changing role:', err);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg('Mínimo 6 caracteres');
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setPasswordMsg('Contraseña actualizada ✓');
        setNewPassword('');
        setTimeout(() => { setResetPasswordId(null); setPasswordMsg(''); }, 2000);
      } else {
        const err = await res.json().catch(() => ({}));
        setPasswordMsg(err.error || 'Error al actualizar');
      }
    } catch (err) {
      setPasswordMsg('Error de conexión');
    }
  };

  const handleSaveSiteLogo = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ site_logo_url: siteLogoUrl }),
      });
      if (res.ok) {
        actions.updateSiteLogoUrl(siteLogoUrl);
        setLogoSaved(true);
        setTimeout(() => setLogoSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error saving site logo:', err);
    }
  };

  const handleSaveFavicon = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({ site_favicon_url: siteFaviconUrl }),
      });
      if (res.ok) {
        // Update live favicon
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = siteFaviconUrl;
        setFaviconSaved(true);
        setTimeout(() => setFaviconSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error saving favicon:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors">
              <ArrowLeft />
            </button>
            <h1 className="text-xl font-bold">Panel de Gestión (CMS)</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs bg-indigo-600 text-slate-900 px-3 py-1 rounded-full font-bold">MODO ADMINISTRADOR</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveSection('news')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeSection === 'news' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
            <ImageIcon size={18}/> Noticias
          </button>
          <button 
            onClick={() => setActiveSection('events')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeSection === 'events' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
             <Calendar size={18}/> Eventos
          </button>
          <button 
            onClick={() => setActiveSection('companies')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeSection === 'companies' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
          >
             <Building2 size={18}/> Empresas del Grupo
          </button>
          {user?.role !== UserRole.CONTENT_MANAGER && (
            <>
              <button 
                onClick={() => setActiveSection('promotions')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeSection === 'promotions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                <TrendingUp size={18}/> Ascensos
              </button>
              <button 
                onClick={() => setActiveSection('newhires')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeSection === 'newhires' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                <UserPlus2 size={18}/> Nuevos Ingresos
              </button>
              <button 
                onClick={() => setActiveSection('docs')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeSection === 'docs' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                <FileText size={18}/> Documentos
              </button>
              <button 
                onClick={() => setActiveSection('departments')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeSection === 'departments' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                <Users size={18}/> Departamentos
              </button>
              <button 
                onClick={() => { setActiveSection('users'); fetchPendingUsers(); }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeSection === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                <Shield size={18}/> Usuarios
                {pendingUsers.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">{pendingUsers.length}</span>
                )}
              </button>
              <button 
                onClick={() => { setActiveSection('usermgmt'); fetchApprovedUsers(); }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeSection === 'usermgmt' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                <KeyRound size={18}/> Gestión de Usuarios
              </button>
            </>
          )}
          {user?.role === UserRole.CEO && (
             <button 
               onClick={() => setActiveSection('ceo')}
               className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeSection === 'ceo' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
             >
               <Video size={18}/> Mensaje Dirección
             </button>
          )}

          {/* Divider */}
          <div className="border-t border-slate-200 my-2"></div>

          {user?.role !== UserRole.CONTENT_MANAGER && (
            <button 
              onClick={() => setActiveSection('settings')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl font-medium transition-colors ${activeSection === 'settings' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
            >
              <Settings size={18}/> Configuración
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {activeSection === 'news' && (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                  <Plus className="text-blue-600" /> Publicar Nueva Noticia
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Título de la noticia</label>
                      <input 
                        placeholder="Ej: Lanzamiento de producto..." 
                        className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        value={newNews.title} 
                        onChange={e => setNewNews({...newNews, title: e.target.value})}
                      />
                    </div>
                    
                    <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de publicación</label>
                       <input 
                        type="date"
                        className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newNews.date} 
                        onChange={e => setNewNews({...newNews, date: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                      <textarea 
                        placeholder="Resumen de la noticia..." 
                        className="p-3 border border-slate-300 rounded-lg w-full h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newNews.description} 
                        onChange={e => setNewNews({...newNews, description: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Right Column: Image Uploader */}
                  <div className="flex flex-col">
                    <CloudinaryUpload 
                        label="Imagen de portada"
                        accept="image/*"
                        folder="corpocrea/news"
                        currentUrl={newNews.imageUrl || ''}
                        onUpload={(result) => setNewNews({...newNews, imageUrl: result.url})}
                    />
                    <div className="mt-auto pt-4">
                        <button 
                            onClick={handleAddNews} 
                            disabled={!newNews.title || !newNews.imageUrl}
                            className="w-full bg-blue-600 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold transition-colors shadow-lg shadow-blue-600/20"
                        >
                        <Save size={20} /> Publicar
                        </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* List of News */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                   <h3 className="font-bold text-slate-700">Noticias Activas</h3>
                   <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{data.news.length} items</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {data.news.map(item => (
                    <div key={item.id} className="p-4 flex gap-4 items-center hover:bg-slate-50 transition-colors group">
                        <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                           <img src={item.imageUrl} className="w-full h-full object-cover" alt="news" />
                        </div>
                        <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 truncate">{item.title}</h4>
                        <p className="text-sm text-slate-500 truncate">{item.date} — {item.description}</p>
                        </div>
                        <button onClick={() => actions.deleteNews(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {activeSection === 'events' && (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800"><Plus className="text-blue-600"/> Crear Evento</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 items-start">
                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del evento</label>
                        <input 
                            placeholder="Ej: Reunión Anual" 
                            className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                        <input 
                            type="date"
                            className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
                        <input 
                            placeholder="Ej: Sala 1 o Zoom" 
                            className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Detalles</label>
                        <textarea 
                            placeholder="Descripción..." 
                            className="p-3 border border-slate-300 rounded-lg w-full h-[50px] resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                        />
                    </div>
                  </div>

                  {/* Right Column: Image / Video Uploader */}
                  <div className="space-y-4">
                    <CloudinaryUpload 
                        label="Imagen del evento"
                        accept="image/*"
                        folder="corpocrea/events"
                        currentUrl={newEvent.imageUrl || ''}
                        onUpload={(result) => setNewEvent({...newEvent, imageUrl: result.url})}
                    />
                    <CloudinaryUpload 
                        label="Video del evento (opcional)"
                        accept="video/*"
                        folder="corpocrea/events"
                        currentUrl={newEvent.videoUrl || ''}
                        onUpload={(result) => setNewEvent({...newEvent, videoUrl: result.url})}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button onClick={handleAddEvent} className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium">
                    <Save size={18} /> Crear Evento
                    </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-700">Calendario</h3>
                 </div>
                 <div className="divide-y divide-slate-100">
                    {data.events.map(item => (
                    <div key={item.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                        <div className="flex items-center gap-4">
                        {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-200" />
                        )}
                        <div>
                            <h4 className="font-bold text-slate-800">{item.title}</h4>
                            <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1"><Calendar size={12}/> {item.date}</span>
                                <span>{item.location}</span>
                            </div>
                            {item.videoUrl && (
                                <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">🎬 Ver video</a>
                            )}
                        </div>
                        </div>
                        <button onClick={() => actions.deleteEvent(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                        </button>
                    </div>
                    ))}
                 </div>
              </div>
            </>
          )}

          {activeSection === 'docs' && (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800"><Upload className="text-blue-600"/> Subir Documento</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                        <CloudinaryUpload
                            label="Seleccionar Archivo"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.pptx,.txt"
                            folder="corpocrea/documents"
                            onUpload={(result) => {
                                actions.addDocument({
                                    id: Date.now().toString(),
                                    name: result.originalFilename || result.url.split('/').pop() || 'documento',
                                    category: docCategory,
                                    size: `${(result.bytes / (1024 * 1024)).toFixed(1)} MB`,
                                    uploadDate: new Date().toLocaleDateString(),
                                    url: result.url,
                                });
                            }}
                            onError={(err) => alert(err)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                            <select 
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={docCategory}
                                onChange={(e) => setDocCategory(e.target.value as any)}
                            >
                                <option value="Policy">Política</option>
                                <option value="Manual">Manual</option>
                                <option value="Template">Plantilla</option>
                                <option value="Brand">Marca / Branding</option>
                            </select>
                        </div>
                        
                        <div className="pt-4">
                             <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                               <p className="text-xs text-blue-700 flex items-center gap-1.5">
                                 <Cloud size={14}/> Los archivos se suben automáticamente a Cloudinary al seleccionarlos.
                               </p>
                             </div>
                        </div>
                    </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-slate-700">Repositorio de Documentos</h3>
                 </div>
                 <div className="divide-y divide-slate-100">
                    {data.documents.map(doc => (
                        <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText size={20}/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{doc.name}</h4>
                                    <div className="flex gap-2 text-xs text-slate-500">
                                        <span className="px-2 py-0.5 bg-slate-100 rounded-full">{doc.category}</span>
                                        <span>{doc.size}</span>
                                        <span>• {doc.uploadDate}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => actions.deleteDocument(doc.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    ))}
                 </div>
              </div>
            </>
          )}

          {activeSection === 'departments' && (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800"><Plus className="text-blue-600"/> Crear Departamento</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Departamento</label>
                        <input 
                            placeholder="Ej: Finanzas" 
                            className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                        <textarea 
                            placeholder="Descripción breve..." 
                            className="p-3 border border-slate-300 rounded-lg w-full h-[100px] resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newDept.description} onChange={e => setNewDept({...newDept, description: e.target.value})}
                        />
                    </div>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gerente / Responsable</label>
                        <select 
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={newDept.managerId || ''}
                            onChange={(e) => setNewDept({...newDept, managerId: e.target.value})}
                        >
                            <option value="">Seleccionar Responsable</option>
                            {/* In a real app, this would filter for eligible managers */}
                            {data.employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
                            ))}
                        </select>
                     </div>
                     <div className="pt-4 mt-auto">
                        <button 
                            onClick={handleAddDepartment}
                            disabled={!newDept.name} 
                            className="w-full bg-blue-600 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold transition-colors"
                        >
                            <Save size={20} /> Crear Departamento
                        </button>
                     </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Departamentos Activos</h3>
                    <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{data.departments?.length || 0} items</span>
                 </div>
                 <div className="divide-y divide-slate-100">
                    {data.departments?.map(dept => (
                        <div key={dept.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Users size={20}/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{dept.name}</h4>
                                    <p className="text-xs text-slate-500">{dept.description}</p>
                                </div>
                            </div>
                            <button onClick={() => actions.deleteDepartment(dept.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    ))}
                 </div>
              </div>
            </>
          )}

          {activeSection === 'ceo' && user?.role === UserRole.CEO && (
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800"><Video className="text-blue-600"/> Mensaje de Dirección</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">Contenido del Mensaje</label>
                    <textarea 
                        className="w-full p-4 border border-slate-300 rounded-xl h-64 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700 leading-relaxed" 
                        value={ceoText}
                        onChange={e => setCeoText(e.target.value)}
                        placeholder="Escribe tu mensaje aquí..."
                    />
                 </div>
                 <div className="flex flex-col gap-4">
                     <CloudinaryUpload 
                        label="Imagen o Video de Portada"
                        accept="image/*,video/*"
                        folder="corpocrea/ceo"
                        currentUrl={ceoImage}
                        onUpload={(result) => setCeoImage(result.url)}
                     />
                     <div className="mt-auto">
                        <button onClick={handleUpdateCeo} className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-600/20">
                            <Save size={20} /> Guardar Cambios
                        </button>
                     </div>
                 </div>
               </div>
             </div>
          )}

          {/* ====== EMPRESAS DE LA CORPORACIÓN ====== */}
          {activeSection === 'companies' && (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                  <Plus className="text-blue-600" /> Agregar Empresa del Grupo
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Empresa</label>
                      <input 
                        placeholder="Ej: Corpocrea Construcciones" 
                        className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        value={newCompany.name} 
                        onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Sitio Web (opcional)</label>
                      <input 
                        placeholder="https://www.ejemplo.com" 
                        className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        value={newCompany.website} 
                        onChange={e => setNewCompany({...newCompany, website: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <CloudinaryUpload 
                        label="Logo de la Empresa"
                        accept="image/*"
                        folder="corpocrea/companies"
                        currentUrl={newCompany.logoUrl || ''}
                        onUpload={(result) => setNewCompany({...newCompany, logoUrl: result.url})}
                    />
                    <div className="mt-auto pt-4">
                        <button 
                            onClick={handleAddCompany} 
                            disabled={!newCompany.name || !newCompany.logoUrl}
                            className="w-full bg-blue-600 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold transition-colors shadow-lg shadow-blue-600/20"
                        >
                        <Save size={20} /> Agregar Empresa
                        </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* List of Companies */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                   <h3 className="font-bold text-slate-700">Empresas de la Corporación</h3>
                   <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{(data.corporateCompanies || []).length} empresas</span>
                </div>
                <div className="divide-y divide-slate-100">
                    {(!data.corporateCompanies || data.corporateCompanies.length === 0) && (
                      <div className="p-8 text-center text-slate-400">
                        <Building2 size={40} className="mx-auto mb-3 opacity-50"/>
                        <p className="text-sm">No hay empresas registradas aún. Agrega la primera empresa del grupo.</p>
                      </div>
                    )}
                    {(data.corporateCompanies || []).map(company => (
                    <div key={company.id} className="p-4 flex gap-4 items-center hover:bg-slate-50 transition-colors group">
                        <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 bg-white flex items-center justify-center p-1">
                           <img src={company.logoUrl} className="max-w-full max-h-full object-contain" alt={company.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 truncate">{company.name}</h4>
                          {company.website && <p className="text-sm text-blue-500 truncate">{company.website}</p>}
                        </div>
                        <button onClick={() => handleDeleteCompany(company.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {activeSection === 'users' && (
            <div className="space-y-6">
              {/* Pending Users */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="text-orange-500" size={22}/> Usuarios Pendientes de Aprobación
                  </h2>
                  <button onClick={fetchPendingUsers} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    {pendingLoading ? <Loader2 size={14} className="animate-spin"/> : null} Actualizar
                  </button>
                </div>

                {pendingUsers.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <CheckCircle size={48} className="mx-auto mb-3 text-green-300"/>
                    <p className="font-medium">No hay usuarios pendientes</p>
                    <p className="text-sm">Todos los registros han sido procesados.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map(u => (
                      <div key={u.id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {u.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-lg">{u.name}</h3>
                            <p className="text-slate-500 text-sm">{u.email}</p>
                            {u.identificationId && <p className="text-slate-400 text-xs mt-0.5">Cédula: {u.identificationId}</p>}
                          </div>
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">PENDIENTE</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Departamento (Odoo)</label>
                            <p className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700">{u.department || 'Sin asignar'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Cargo (Odoo)</label>
                            <p className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-700">{u.position || 'Sin asignar'}</p>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Asignar Rol</label>
                            <select
                              value={approveForm[u.id]?.role || 'EMPLOYEE'}
                              onChange={e => setApproveForm(prev => ({ ...prev, [u.id]: { role: e.target.value } }))}
                              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="EMPLOYEE">Empleado</option>
                              <option value="CONTENT_MANAGER">Gestor de Contenido</option>
                              <option value="MANAGER">Gerente</option>
                              <option value="CEO">CEO</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={() => handleRejectUser(u.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-colors border border-red-200"
                          >
                            <X size={16}/> Rechazar
                          </button>
                          <button
                            onClick={() => handleApproveUser(u.id)}
                            className="flex items-center gap-1.5 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-green-600/20"
                          >
                            <CheckCircle size={16}/> Aprobar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'promotions' && (
            <div className="space-y-6">
              {/* Add Promotion */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                  <Plus className="text-blue-600" /> Registrar Ascenso
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Empleado</label>
                    <input 
                      placeholder="Ej: María González" 
                      className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newPromo.employeeName || ''} 
                      onChange={e => setNewPromo({...newPromo, employeeName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                    <input 
                      placeholder="Ej: Tecnología" 
                      className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newPromo.department || ''} 
                      onChange={e => setNewPromo({...newPromo, department: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cargo Anterior</label>
                    <input 
                      placeholder="Ej: Analista Junior" 
                      className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newPromo.previousPosition || ''} 
                      onChange={e => setNewPromo({...newPromo, previousPosition: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nuevo Cargo</label>
                    <input 
                      placeholder="Ej: Coordinador de Proyectos" 
                      className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newPromo.newPosition || ''} 
                      onChange={e => setNewPromo({...newPromo, newPosition: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                    <input 
                      type="date"
                      className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                      value={newPromo.date || ''} 
                      onChange={e => setNewPromo({...newPromo, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <CloudinaryUpload 
                      label="Foto del Empleado"
                      accept="image/*"
                      folder="corpocrea/promotions"
                      variant="compact"
                      currentUrl={newPromo.photoUrl || ''}
                      onUpload={(result) => setNewPromo({...newPromo, photoUrl: result.url})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descripción / Motivo</label>
                    <textarea 
                      placeholder="Descripción del ascenso..." 
                      className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                      value={newPromo.description || ''} 
                      onChange={e => setNewPromo({...newPromo, description: e.target.value})}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleAddPromotion} 
                  disabled={!newPromo.employeeName || !newPromo.newPosition}
                  className="mt-4 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingUp size={18}/> Registrar Ascenso
                </button>
              </div>

              {/* Promotions List */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Ascensos Registrados</h3>
                {data.promotions.length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-8">No hay ascensos registrados aún.</p>
                ) : (
                  <div className="space-y-3">
                    {data.promotions.map(p => (
                      <div key={p.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.employeeName} className="w-12 h-12 rounded-full object-cover ring-2 ring-[#CBA052]"/>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CBA052] to-[#a07d3a] flex items-center justify-center text-white font-bold text-lg">
                            {p.employeeName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800">{p.employeeName}</h4>
                          <p className="text-sm text-slate-500">{p.previousPosition} → <span className="text-[#1D3C34] font-semibold">{p.newPosition}</span></p>
                          <p className="text-xs text-slate-400">{p.department} • {p.date}</p>
                        </div>
                        <button onClick={() => handleDeletePromotion(p.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ====== NUEVOS INGRESOS ====== */}
          {activeSection === 'newhires' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                  <Plus className="text-blue-600" /> Registrar Nuevo Ingreso
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Empleado</label>
                      <input 
                        placeholder="Ej: Carlos Rodríguez" 
                        className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newHire.employeeName || ''} 
                        onChange={e => setNewHire({...newHire, employeeName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                      <input 
                        placeholder="Ej: Analista de Datos" 
                        className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newHire.position || ''} 
                        onChange={e => setNewHire({...newHire, position: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                      <input 
                        placeholder="Ej: Tecnología" 
                        className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newHire.department || ''} 
                        onChange={e => setNewHire({...newHire, department: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Ingreso</label>
                      <input 
                        type="date"
                        className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newHire.date || ''} 
                        onChange={e => setNewHire({...newHire, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Descripción / Bienvenida</label>
                      <textarea 
                        placeholder="Mensaje de bienvenida o descripción..." 
                        className="p-3 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                        value={newHire.description || ''} 
                        onChange={e => setNewHire({...newHire, description: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <CloudinaryUpload 
                      label="Foto del Empleado"
                      accept="image/*"
                      folder="corpocrea/newhires"
                      currentUrl={newHire.photoUrl || ''}
                      onUpload={(result) => setNewHire({...newHire, photoUrl: result.url})}
                    />
                    <div className="mt-auto pt-4">
                      <button 
                        onClick={handleAddNewHire} 
                        disabled={!newHire.employeeName}
                        className="w-full bg-blue-600 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold transition-colors shadow-lg shadow-blue-600/20"
                      >
                        <UserPlus2 size={18}/> Registrar Nuevo Ingreso
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Hires List */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Nuevos Ingresos Registrados</h3>
                {data.newHires.length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-8">No hay nuevos ingresos registrados aún.</p>
                ) : (
                  <div className="space-y-3">
                    {data.newHires.map(h => (
                      <div key={h.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        {h.photoUrl ? (
                          <img src={h.photoUrl} alt={h.employeeName} className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1D3C34]"/>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1D3C34] to-[#0f2219] flex items-center justify-center text-white font-bold text-lg">
                            {h.employeeName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800">{h.employeeName}</h4>
                          <p className="text-sm text-slate-500">{h.position} — <span className="text-[#1D3C34] font-semibold">{h.department}</span></p>
                          <p className="text-xs text-slate-400">Ingreso: {h.date}</p>
                        </div>
                        <button onClick={() => handleDeleteNewHire(h.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ====== GESTIÓN DE USUARIOS (Rol + Contraseña) ====== */}
          {activeSection === 'usermgmt' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <KeyRound className="text-blue-600" size={22}/> Gestión de Usuarios Aprobados
                  </h2>
                  <button onClick={fetchApprovedUsers} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    {approvedLoading ? <Loader2 size={14} className="animate-spin"/> : null} Actualizar
                  </button>
                </div>

                <p className="text-sm text-slate-500 mb-6">Aquí puedes cambiar el rol o restablecer la contraseña de los usuarios aprobados.</p>

                {approvedUsers.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Users size={48} className="mx-auto mb-3 opacity-30"/>
                    <p className="font-medium">No hay usuarios aprobados</p>
                    <p className="text-sm">Haz clic en "Actualizar" para cargar la lista.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvedUsers.map(u => (
                      <div key={u.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D3C34] to-[#25282A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                            {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt=""/> : u.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 text-sm">{u.name}</h3>
                            <p className="text-xs text-slate-500">{u.email} • {u.position || 'Sin cargo'} • {u.department || 'Sin depto.'}</p>
                          </div>
                          <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">{u.role}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => { setEditingUserId(editingUserId === u.id ? null : u.id); setEditRole(u.role); setResetPasswordId(null); }}
                              className={`p-2 rounded-lg transition-colors text-sm ${editingUserId === u.id ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                              title="Cambiar rol"
                            >
                              <Edit3 size={16}/>
                            </button>
                            <button
                              onClick={() => { setResetPasswordId(resetPasswordId === u.id ? null : u.id); setNewPassword(''); setPasswordMsg(''); setEditingUserId(null); }}
                              className={`p-2 rounded-lg transition-colors text-sm ${resetPasswordId === u.id ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'}`}
                              title="Cambiar contraseña"
                            >
                              <KeyRound size={16}/>
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`¿Estás seguro de eliminar al usuario ${u.name}? Esta acción no se puede deshacer.`)) return;
                                try {
                                  const res = await fetch(`/api/admin/users/${u.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
                                  });
                                  if (res.ok) setApprovedUsers(prev => prev.filter(x => x.id !== u.id));
                                } catch (err) { console.error('Error deleting user:', err); }
                              }}
                              className="p-2 rounded-lg transition-colors text-sm text-slate-400 hover:text-red-600 hover:bg-red-50"
                              title="Eliminar usuario"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </div>

                        {/* Change Role Panel */}
                        {editingUserId === u.id && (
                          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-3">
                            <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Nuevo Rol:</label>
                            <select 
                              value={editRole} 
                              onChange={e => setEditRole(e.target.value)} 
                              className="flex-1 p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value="EMPLOYEE">Empleado</option>
                              <option value="CONTENT_MANAGER">Gestor de Contenido</option>
                              <option value="HR">Recursos Humanos</option>
                              <option value="MANAGER">Gerente</option>
                              <option value="CEO">CEO</option>
                              <option value="ARCHITECT">Arquitecto</option>
                              <option value="ENGINEER">Ingeniero</option>
                            </select>
                            <button 
                              onClick={() => handleChangeRole(u.id)} 
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                            >
                              Guardar
                            </button>
                            <button onClick={() => setEditingUserId(null)} className="px-3 py-2 text-slate-500 hover:text-slate-700 text-sm">
                              Cancelar
                            </button>
                          </div>
                        )}

                        {/* Reset Password Panel */}
                        {resetPasswordId === u.id && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="flex items-center gap-3">
                              <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Nueva Contraseña:</label>
                              <div className="relative flex-1">
                                <input
                                  type={showNewPassword ? 'text' : 'password'}
                                  placeholder="Mínimo 6 caracteres"
                                  value={newPassword}
                                  onChange={e => { setNewPassword(e.target.value); setPasswordMsg(''); }}
                                  className="w-full p-2 pr-10 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                  {showNewPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
                                </button>
                              </div>
                              <button 
                                onClick={() => handleResetPassword(u.id)} 
                                disabled={!newPassword || newPassword.length < 6}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white rounded-lg font-medium text-sm transition-colors"
                              >
                                Restablecer
                              </button>
                              <button onClick={() => { setResetPasswordId(null); setPasswordMsg(''); }} className="px-3 py-2 text-slate-500 hover:text-slate-700 text-sm">
                                Cancelar
                              </button>
                            </div>
                            {passwordMsg && (
                              <p className={`text-xs mt-2 ${passwordMsg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>{passwordMsg}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              {/* Site Logo Configuration */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-[#1D3C34] text-white rounded-xl">
                    <ImageIcon size={22}/>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Logo del Sitio</h2>
                    <p className="text-sm text-slate-500">Sube el logo que aparecerá en la barra de navegación del landing y el footer.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <CloudinaryUpload 
                      label="Logo de la Corporación"
                      accept="image/*"
                      folder="corpocrea/branding"
                      currentUrl={siteLogoUrl}
                      onUpload={(result) => setSiteLogoUrl(result.url)}
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    {siteLogoUrl && (
                      <div className="bg-[#25282A] rounded-xl p-6 flex items-center justify-center mb-4">
                        <img src={siteLogoUrl} alt="Logo preview" className="max-h-16 object-contain"/>
                      </div>
                    )}
                    {!siteLogoUrl && (
                      <div className="bg-slate-50 rounded-xl p-6 flex items-center justify-center mb-4 border border-dashed border-slate-300">
                        <div className="text-center text-slate-400">
                          <ImageIcon size={32} className="mx-auto mb-2 opacity-50"/>
                          <p className="text-xs">Vista previa del logo</p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleSaveSiteLogo}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all"
                    >
                      {logoSaved ? <CheckCircle size={18}/> : <Save size={18}/>}
                      {logoSaved ? 'Logo Guardado ✓' : 'Guardar Logo'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Favicon Configuration */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-[#CBA052] text-white rounded-xl">
                    <Globe size={22}/>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Favicon del Sitio</h2>
                    <p className="text-sm text-slate-500">Sube el ícono que aparecerá en la pestaña del navegador. Se recomienda 32×32 o 64×64 px.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <CloudinaryUpload 
                      label="Favicon (ICO, PNG, SVG)"
                      accept="image/*,.ico"
                      folder="corpocrea/branding"
                      currentUrl={siteFaviconUrl}
                      onUpload={(result) => setSiteFaviconUrl(result.url)}
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    {siteFaviconUrl ? (
                      <div className="bg-slate-100 rounded-xl p-6 flex items-center justify-center gap-4 mb-4 border border-slate-200">
                        <img src={siteFaviconUrl} alt="Favicon preview" className="w-8 h-8 object-contain"/>
                        <div className="bg-white rounded-lg border border-slate-200 px-3 py-1.5 flex items-center gap-2 text-sm text-slate-600">
                          <img src={siteFaviconUrl} alt="" className="w-4 h-4 object-contain"/>
                          Corpocrea — Intranet
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-xl p-6 flex items-center justify-center mb-4 border border-dashed border-slate-300">
                        <div className="text-center text-slate-400">
                          <Globe size={32} className="mx-auto mb-2 opacity-50"/>
                          <p className="text-xs">Vista previa del favicon</p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleSaveFavicon}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all"
                    >
                      {faviconSaved ? <CheckCircle size={18}/> : <Save size={18}/>}
                      {faviconSaved ? 'Favicon Guardado ✓' : 'Guardar Favicon'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Odoo Connection */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                    <Database size={22}/>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Conexión con Odoo</h2>
                    <p className="text-sm text-slate-500">Configura la URL del servidor Odoo para habilitar la integración con nómina, prestaciones y préstamos.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Globe size={14} className="text-slate-400"/> URL del Servidor Odoo
                      </label>
                      <input
                        type="url"
                        placeholder="https://tu-instancia.odoo.com"
                        className="p-3 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm"
                        value={odooUrl}
                        onChange={e => setOdooUrl(e.target.value)}
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Ejemplo: https://erp.corpocrea.com o http://192.168.1.100:8069</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Shield size={14} className="text-slate-400"/> API Key (Opcional)
                      </label>
                      <input
                        type="password"
                        placeholder="Clave de autenticación del módulo corpocrea_api"
                        className="p-3 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm"
                        value={odooApiKey}
                        onChange={e => setOdooApiKey(e.target.value)}
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Configurada en Odoo: Ajustes → Parámetros del sistema → corpocrea_api.api_key</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Status Card */}
                    <div className={`p-4 rounded-xl border ${
                      odooTestStatus === 'success' ? 'bg-green-50 border-green-200' :
                      odooTestStatus === 'error' ? 'bg-red-50 border-red-200' :
                      odooConfig.isConfigured ? 'bg-blue-50 border-blue-200' :
                      'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        {odooTestStatus === 'testing' ? (
                          <Loader2 size={20} className="animate-spin text-blue-500" />
                        ) : odooTestStatus === 'success' ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : odooTestStatus === 'error' ? (
                          <AlertCircle size={20} className="text-red-600" />
                        ) : odooConfig.isConfigured ? (
                          <Wifi size={20} className="text-blue-600" />
                        ) : (
                          <WifiOff size={20} className="text-slate-400" />
                        )}
                        <span className={`text-sm font-bold ${
                          odooTestStatus === 'success' ? 'text-green-800' :
                          odooTestStatus === 'error' ? 'text-red-800' :
                          odooConfig.isConfigured ? 'text-blue-800' :
                          'text-slate-600'
                        }`}>
                          {odooTestStatus === 'testing' ? 'Probando conexión...' :
                           odooTestStatus === 'success' ? 'Conexión Exitosa' :
                           odooTestStatus === 'error' ? 'Error de Conexión' :
                           odooConfig.isConfigured ? 'Configurado' :
                           'No Configurado'}
                        </span>
                      </div>
                      {odooTestMessage && (
                        <p className={`text-xs ${
                          odooTestStatus === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>{odooTestMessage}</p>
                      )}
                      {odooConfig.isConfigured && !odooTestMessage && (
                        <p className="text-xs text-blue-600 truncate">Servidor: {odooConfig.baseUrl}</p>
                      )}
                    </div>

                    {/* Info */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-amber-800 mb-2">ℹ️ Requisitos</h4>
                      <ul className="text-xs text-amber-700 space-y-1.5">
                        <li className="flex items-start gap-1.5">• El módulo <strong>corpocrea_api</strong> debe estar instalado en Odoo</li>
                        <li className="flex items-start gap-1.5">• El servidor Odoo debe ser accesible desde esta red</li>
                        <li className="flex items-start gap-1.5">• Si configuras una API Key, debe coincidir con la del parámetro del sistema en Odoo</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-slate-100">
                  <button
                    onClick={handleTestOdooConnection}
                    disabled={odooTestStatus === 'testing' || !odooUrl}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {odooTestStatus === 'testing' ? <Loader2 size={18} className="animate-spin"/> : <Wifi size={18}/>}
                    Probar Conexión
                  </button>
                  <button
                    onClick={handleSaveOdooSettings}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all"
                  >
                    {odooSaved ? <CheckCircle size={18}/> : <Save size={18}/>}
                    {odooSaved ? 'Guardado ✓' : 'Guardar Configuración'}
                  </button>
                </div>
              </div>

              {/* Cloudinary - Media Storage */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                    <Cloud size={22}/>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Almacenamiento Cloudinary</h2>
                    <p className="text-sm text-slate-500">Configura tu cuenta de Cloudinary para almacenar imágenes, videos y documentos de la plataforma.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Cloud size={14} className="text-slate-400"/> Cloud Name
                      </label>
                      <input
                        type="text"
                        placeholder="mi-cloud-name"
                        className="p-3 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm"
                        value={cloudName}
                        onChange={e => setCloudName(e.target.value)}
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Lo encuentras en tu Dashboard de Cloudinary</p>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Shield size={14} className="text-slate-400"/> API Key
                      </label>
                      <input
                        type="text"
                        placeholder="123456789012345"
                        className="p-3 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm"
                        value={cloudApiKey}
                        onChange={e => setCloudApiKey(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Shield size={14} className="text-slate-400"/> API Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showCloudSecret ? 'text' : 'password'}
                          placeholder="••••••••••••••••"
                          className="p-3 pr-12 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm"
                          value={cloudApiSecret}
                          onChange={e => setCloudApiSecret(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCloudSecret(!showCloudSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCloudSecret ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Upload Preset (opcional)</label>
                      <input
                        type="text"
                        placeholder="mi-preset-unsigned"
                        className="p-3 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 outline-none transition-shadow text-sm"
                        value={cloudUploadPreset}
                        onChange={e => setCloudUploadPreset(e.target.value)}
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Solo necesario para subidas directas (unsigned). Créalo en Settings → Upload → Upload Presets</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Status Card */}
                    <div className={`p-4 rounded-xl border ${
                      cloudTestStatus === 'success' ? 'bg-green-50 border-green-200' :
                      cloudTestStatus === 'error' ? 'bg-red-50 border-red-200' :
                      cloudName ? 'bg-blue-50 border-blue-200' :
                      'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        {cloudTestStatus === 'testing' ? (
                          <Loader2 size={20} className="animate-spin text-blue-500" />
                        ) : cloudTestStatus === 'success' ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : cloudTestStatus === 'error' ? (
                          <AlertCircle size={20} className="text-red-600" />
                        ) : cloudName ? (
                          <Cloud size={20} className="text-blue-600" />
                        ) : (
                          <CloudOff size={20} className="text-slate-400" />
                        )}
                        <span className={`text-sm font-bold ${
                          cloudTestStatus === 'success' ? 'text-green-800' :
                          cloudTestStatus === 'error' ? 'text-red-800' :
                          cloudName ? 'text-blue-800' :
                          'text-slate-600'
                        }`}>
                          {cloudTestStatus === 'testing' ? 'Probando conexión...' :
                           cloudTestStatus === 'success' ? 'Conexión Exitosa' :
                           cloudTestStatus === 'error' ? 'Error de Conexión' :
                           cloudName ? 'Configurado' :
                           'No Configurado'}
                        </span>
                      </div>
                      {cloudTestMessage && (
                        <p className={`text-xs ${
                          cloudTestStatus === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>{cloudTestMessage}</p>
                      )}
                      {cloudName && !cloudTestMessage && (
                        <p className="text-xs text-blue-600">Cloud: {cloudName}</p>
                      )}
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-blue-800 mb-2">☁️ Cómo obtener las credenciales</h4>
                      <ol className="text-xs text-blue-700 space-y-1.5 list-decimal pl-4">
                        <li>Crea una cuenta gratuita en <strong>cloudinary.com</strong></li>
                        <li>Ve al <strong>Dashboard</strong> → copia Cloud Name, API Key y API Secret</li>
                        <li>Para Upload Preset: <strong>Settings → Upload → Add upload preset</strong> (modo Unsigned)</li>
                        <li>Pega las credenciales aquí y prueba la conexión</li>
                      </ol>
                    </div>

                    {/* Features */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-slate-700 mb-2">Funcionalidades</h4>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-500"/> Imágenes de noticias</li>
                        <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-500"/> Videos corporativos</li>
                        <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-500"/> Documentos (PDF, Word, Excel)</li>
                        <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-500"/> Imagen del CEO / Dirección</li>
                        <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-500"/> Transformaciones automáticas (thumbnails)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-slate-100">
                  <button
                    onClick={handleTestCloudinaryConnection}
                    disabled={cloudTestStatus === 'testing' || !cloudName || !cloudApiKey || !cloudApiSecret}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cloudTestStatus === 'testing' ? <Loader2 size={18} className="animate-spin"/> : <Cloud size={18}/>}
                    Probar Conexión
                  </button>
                  <button
                    onClick={handleSaveCloudinarySettings}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all"
                  >
                    {cloudSaved ? <CheckCircle size={18}/> : <Save size={18}/>}
                    {cloudSaved ? 'Guardado ✓' : 'Guardar Configuración'}
                  </button>
                </div>
              </div>

              {/* Additional Platform Settings */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Settings size={18} className="text-slate-500"/> Ajustes de Plataforma
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-1">Versión de la Plataforma</h4>
                    <p className="text-xs text-slate-500">Corpocrea Intranet v1.0.0</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-700 mb-1">Módulo Odoo</h4>
                    <p className="text-xs text-slate-500">corpocrea_api v16.0.1.0.0</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};