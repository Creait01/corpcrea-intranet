import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, Mail, ArrowRight, AlertCircle, UserPlus, CreditCard, CheckCircle, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { odooApi } from '../services/odooApi';

interface LoginProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onRegister: (data: { name: string; email: string; password: string; identificationId: string; odooEmployeeId: number; position: string; department: string; avatar?: string }) => Promise<boolean>;
  onBack: () => void;
  siteLogoUrl?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegister, onBack, siteLogoUrl }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Register state
  const [regStep, setRegStep] = useState<'cedula' | 'verify' | 'form'>('cedula');
  const [cedula, setCedula] = useState('');
  const [verifiedEmployee, setVerifiedEmployee] = useState<any>(null);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const success = await onLogin(email, password);
      if (!success) {
        setError('Credenciales incorrectas. Intenta nuevamente.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCedula = async () => {
    if (!cedula.trim()) {
      setRegError('Ingrese su número de cédula');
      return;
    }

    setRegLoading(true);
    setRegError('');

    try {
      const result = await odooApi.verifyEmployee(cedula.trim());
      
      if (result.success && result.employee) {
        setVerifiedEmployee(result.employee);
        setRegEmail(result.employee.work_email || result.employee.personal_email || '');
        setRegStep('verify');
      } else {
        setRegError(result.error || 'No se encontró un empleado con esta cédula. Contacte a RRHH.');
      }
    } catch (err: any) {
      setRegError('Error de conexión con el servidor. Verifique la configuración de Odoo.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regEmail.trim()) {
      setRegError('Ingrese un correo electrónico');
      return;
    }
    if (regPassword.length < 4) {
      setRegError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setRegError('Las contraseñas no coinciden');
      return;
    }

    setRegLoading(true);
    setRegError('');

    try {
      const success = await onRegister({
        name: verifiedEmployee.name,
        email: regEmail.trim(),
        password: regPassword,
        identificationId: verifiedEmployee.identification_id,
        odooEmployeeId: verifiedEmployee.id,
        position: verifiedEmployee.job_title || 'Empleado',
        department: verifiedEmployee.department || '',
        avatar: verifiedEmployee.photo_url || '',
      });

      if (success) {
        setRegSuccess(true);
      } else {
        setRegError('Este correo ya está registrado.');
      }
    } catch (err) {
      setRegError('Error al crear la cuenta');
    } finally {
      setRegLoading(false);
    }
  };

  const resetRegister = () => {
    setRegStep('cedula');
    setCedula('');
    setVerifiedEmployee(null);
    setRegEmail('');
    setRegPassword('');
    setRegPasswordConfirm('');
    setRegError('');
  };



  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#25282A] via-[#1D3C34] to-[#25282A]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#CBA052] rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-[#1D3C34] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-[#A2B2C8] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          {siteLogoUrl ? (
            <div className="mb-3">
              <img src={siteLogoUrl} alt="Corpocrea" className="h-16 mx-auto object-contain drop-shadow-lg" />
            </div>
          ) : (
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#CBA052] to-[#a07d3a] rounded-2xl flex items-center justify-center shadow-lg shadow-[#CBA052]/30">
                <span className="text-white font-black text-xl">C</span>
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">
                CORPO<span className="text-[#CBA052]">CREA</span>
              </span>
            </div>
          )}
          <p className="text-blue-200/60 text-sm font-medium tracking-wider uppercase">Intranet Corporativa</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => { setActiveTab('login'); resetRegister(); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login' 
                  ? 'text-white bg-white/10 border-b-2 border-blue-400' 
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Lock size={16} /> Iniciar Sesión
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register' 
                  ? 'text-white bg-white/10 border-b-2 border-blue-400' 
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <UserPlus size={16} /> Registrarse
            </button>
          </div>

          <div className="p-8">
            {/* ============ LOGIN TAB ============ */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 rounded-2xl bg-blue-500/20 mb-3">
                    <Shield className="w-7 h-7 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Acceso Intranet</h2>
                  <p className="text-white/40 mt-1 text-sm">Ingresa con tus credenciales</p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-white/30" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 w-full p-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="nombre@corpocrea.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-white/30" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 w-full p-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/20 text-red-300 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-500/20">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-600/30 active:scale-[0.98]"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Verificando...</>
                  ) : (
                    <>Iniciar Sesión <ArrowRight size={18} /></>
                  )}
                </button>


              </form>
            )}

            {/* ============ REGISTER TAB ============ */}
            {activeTab === 'register' && (
              <div className="space-y-5">
                {/* Success State */}
                {regSuccess && (
                  <div className="text-center py-8">
                    <div className="inline-flex p-4 rounded-full bg-green-500/20 mb-4">
                      <CheckCircle className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">¡Registro Exitoso!</h3>
                    <p className="text-white/60 text-sm">Tu cuenta está pendiente de aprobación por un administrador.</p>
                    <p className="text-white/40 text-xs mt-2">Recibirás acceso una vez que tu solicitud sea revisada.</p>
                    <button
                      onClick={() => { setActiveTab('login'); setRegSuccess(false); resetRegister(); }}
                      className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white/80 rounded-xl font-medium text-sm transition-colors"
                    >
                      Ir a Iniciar Sesión
                    </button>
                  </div>
                )}

                {/* Step 1: Enter Cédula */}
                {!regSuccess && regStep === 'cedula' && (
                  <>
                    <div className="text-center mb-6">
                      <div className="inline-flex p-3 rounded-2xl bg-blue-500/20 mb-3">
                        <CreditCard className="w-7 h-7 text-blue-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Verificar Identidad</h2>
                      <p className="text-white/40 mt-1 text-sm">Ingresa tu número de cédula para verificar que eres empleado de Corpocrea</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">Cédula de Identidad</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 text-white/30" size={18} />
                        <input 
                          type="text"
                          inputMode="numeric"
                          value={cedula}
                          onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                          className="pl-10 w-full p-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="12345678"
                          onKeyDown={(e) => e.key === 'Enter' && handleVerifyCedula()}
                        />
                      </div>
                      <p className="text-white/30 text-[11px] mt-2">Solo números, sin letra. Ejemplo: 12345678</p>
                    </div>

                    {regError && (
                      <div className="bg-red-500/20 text-red-300 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-500/20">
                        <AlertCircle size={16} /> {regError}
                      </div>
                    )}

                    <button
                      onClick={handleVerifyCedula}
                      disabled={regLoading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-600/30 active:scale-[0.98]"
                    >
                      {regLoading ? (
                        <><Loader2 size={18} className="animate-spin" /> Consultando Odoo...</>
                      ) : (
                        <>Verificar Cédula <ArrowRight size={18} /></>
                      )}
                    </button>
                  </>
                )}

                {/* Step 2: Verified - Show Employee Info & Create Account */}
                {!regSuccess && regStep === 'verify' && verifiedEmployee && (
                  <>
                    <div className="text-center mb-4">
                      <div className="inline-flex p-3 rounded-2xl bg-green-500/20 mb-3">
                        <CheckCircle className="w-7 h-7 text-green-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white">¡Empleado Verificado!</h2>
                    </div>

                    {/* Employee Card */}
                    <div className="bg-white/10 rounded-2xl p-5 border border-white/10 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {verifiedEmployee.name?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{verifiedEmployee.name}</p>
                          <p className="text-white/50 text-sm">{verifiedEmployee.identification_id}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                        <div>
                          <p className="text-white/40 text-[10px] uppercase tracking-wider">Cargo</p>
                          <p className="text-white/80 text-sm font-medium">{verifiedEmployee.job_title || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-white/40 text-[10px] uppercase tracking-wider">Departamento</p>
                          <p className="text-white/80 text-sm font-medium">{verifiedEmployee.department || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Registration Form */}
                    <div>
                      <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-white/30" size={18} />
                        <input 
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="pl-10 w-full p-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="tu.correo@corpocrea.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-white/30" size={18} />
                        <input 
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="pl-10 w-full p-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">Confirmar Contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 text-white/30" size={18} />
                        <input 
                          type="password"
                          value={regPasswordConfirm}
                          onChange={(e) => setRegPasswordConfirm(e.target.value)}
                          className="pl-10 w-full p-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="••••••••"
                          onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                        />
                      </div>
                    </div>

                    {regError && (
                      <div className="bg-red-500/20 text-red-300 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-500/20">
                        <AlertCircle size={16} /> {regError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={resetRegister}
                        className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl font-bold transition-all"
                      >
                        <ArrowLeft size={16} className="inline mr-1" /> Atrás
                      </button>
                      <button
                        onClick={handleRegister}
                        disabled={regLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-green-600/30 active:scale-[0.98]"
                      >
                        {regLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>Crear Cuenta <UserPlus size={16} /></>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center mt-6 px-2">
          <button onClick={onBack} className="text-sm text-white/40 hover:text-white/80 font-medium transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};