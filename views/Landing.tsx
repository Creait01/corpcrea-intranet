import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { Calendar, User, Gift, Award, ArrowRight, Menu, X, LogIn, Building2, Users, Globe, Shield, ChevronDown } from 'lucide-react';

interface LandingProps {
  data: AppState;
  onNavigateLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ data, onNavigateLogin }) => {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle Scroll for Navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // News Slider Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % data.news.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [data.news.length]);

  const currentNews = data.news[currentNewsIndex];
  
  // Filter Social Data
  const currentMonth = new Date().getMonth() + 1;
  const employeeOfMonth = data.employees.find(e => e.isMonthEmployee);
  
  const birthdays = data.employees.filter(e => {
    const m = parseInt(e.birthDate.split('-')[0]);
    return m === currentMonth;
  });

  const anniversaries = data.employees.filter(e => {
    const startMonth = parseInt(e.startDate.split('-')[1]);
    return startMonth === currentMonth;
  });

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      
      {/* --- NAVIGATION --- */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#25282A]/95 backdrop-blur-xl shadow-2xl py-2' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {data.siteLogoUrl ? (
              <img src={data.siteLogoUrl} alt="Corpocrea" className="h-10 object-contain" />
            ) : (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-[#CBA052] to-[#a07d3a] rounded-xl flex items-center justify-center shadow-lg shadow-[#CBA052]/30">
                  <span className="text-white font-black text-xl">C</span>
                </div>
                <span className="text-xl font-black tracking-tight text-white">
                  CORPO<span className="text-[#CBA052]">CREA</span>
                </span>
              </>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#news" className="text-white/80 hover:text-[#CBA052] font-medium transition-colors">Noticias</a>
            <a href="#events" className="text-white/80 hover:text-[#CBA052] font-medium transition-colors">Eventos</a>
            <a href="#team" className="text-white/80 hover:text-[#CBA052] font-medium transition-colors">Equipo</a>
            <button 
              onClick={onNavigateLogin}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#CBA052] to-[#a07d3a] hover:from-[#d4ac5e] hover:to-[#b08c44] text-white font-bold transition-all shadow-lg shadow-[#CBA052]/30 hover:shadow-xl hover:shadow-[#CBA052]/40 active:scale-95"
            >
              <LogIn size={18} /> Intranet
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#25282A] shadow-2xl py-4 px-6 flex flex-col space-y-4 border-t border-white/10">
            <a href="#news" onClick={() => setIsMobileMenuOpen(false)} className="text-white/80 hover:text-[#CBA052]">Noticias</a>
            <a href="#events" onClick={() => setIsMobileMenuOpen(false)} className="text-white/80 hover:text-[#CBA052]">Eventos</a>
            <a href="#team" onClick={() => setIsMobileMenuOpen(false)} className="text-white/80 hover:text-[#CBA052]">Equipo</a>
            <button onClick={onNavigateLogin} className="w-full text-center py-3 bg-gradient-to-r from-[#CBA052] to-[#a07d3a] text-white rounded-xl font-bold">
              Intranet
            </button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="news" className="relative h-[700px] md:h-[800px] overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-[#1D3C34]">
          <div className="absolute inset-0 opacity-30" style={{
            background: 'radial-gradient(ellipse at 20% 50%, rgba(203,160,82,0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(162,178,200,0.3) 0%, transparent 50%)'
          }}></div>
        </div>

        {data.news.map((item, index) => (
          <div 
            key={item.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentNewsIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms]"
              style={{ backgroundImage: `url(${item.imageUrl})`, transform: index === currentNewsIndex ? 'scale(1.05)' : 'scale(1)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#25282A] via-[#25282A]/60 to-[#1D3C34]/40" />
            
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-7xl mx-auto px-4 pb-32 md:pb-40 w-full">
                <div className="max-w-3xl">
                  <span className="inline-block px-4 py-1.5 bg-[#CBA052] text-white text-xs font-black rounded-full mb-5 tracking-wider uppercase shadow-lg shadow-[#CBA052]/30">
                    Novedades
                  </span>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-5 leading-[1.1] tracking-tight">
                    {item.title}
                  </h1>
                  <p className="text-lg md:text-xl text-[#A2B2C8] mb-8 max-w-2xl leading-relaxed">
                    {item.description}
                  </p>
                  <button className="group flex items-center gap-3 text-white border-2 border-[#CBA052]/50 px-8 py-4 rounded-xl hover:bg-[#CBA052] hover:border-[#CBA052] transition-all font-bold tracking-wide">
                    Leer más <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Indicators */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {data.news.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentNewsIndex(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${idx === currentNewsIndex ? 'bg-[#CBA052] w-10' : 'bg-white/30 w-2 hover:bg-white/50'}`}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
          <ChevronDown className="text-white" size={24} />
        </div>
      </section>

      {/* --- COMPANIES CAROUSEL --- */}
      <section className="relative -mt-16 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/10 p-6 md:p-8 border border-slate-100">
            {data.corporateCompanies && data.corporateCompanies.length > 0 ? (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-6">Empresas de la Corporación</p>
                <div className="relative overflow-hidden">
                  {/* Gradient masks */}
                  <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                  
                  {/* Infinite scroll track */}
                  <div className="flex items-center gap-12 animate-marquee hover:[animation-play-state:paused]" style={{
                    animation: `marquee ${Math.max(20, data.corporateCompanies.length * 5)}s linear infinite`,
                    width: 'max-content'
                  }}>
                    {/* Duplicate items for seamless loop */}
                    {[...data.corporateCompanies, ...data.corporateCompanies, ...data.corporateCompanies].map((company, idx) => (
                      <a
                        key={`${company.id}-${idx}`}
                        href={company.website || '#'}
                        target={company.website ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="flex-shrink-0 group"
                      >
                        <div className="w-36 h-24 md:w-44 md:h-28 flex items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm group-hover:shadow-xl group-hover:border-[#CBA052]/40 group-hover:scale-105 transition-all duration-300 p-4">
                          <img src={company.logoUrl} alt={company.name} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
                <style>{`
                  @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                  }
                `}</style>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-slate-400">Corporación de empresas al servicio de Venezuela</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- EVENTS SECTION --- */}
      <section id="events" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-[#1D3C34]/10 text-[#1D3C34] text-xs font-black rounded-full mb-4 tracking-wider uppercase">Agenda</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#25282A] tracking-tight">Próximos Eventos</h2>
            <p className="text-slate-500 mt-4 text-lg">Mantente al día con la agenda corporativa</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.events.map((event, idx) => (
              <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 group hover:-translate-y-1" style={{ animationDelay: `${idx * 100}ms` }}>
                {event.imageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    <span className="absolute top-3 right-3 text-sm font-bold text-white bg-[#CBA052] px-3 py-1 rounded-full shadow-lg">{event.date}</span>
                  </div>
                )}
                <div className="p-6">
                  {!event.imageUrl && (
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-[#1D3C34]/10 text-[#1D3C34] p-3 rounded-xl group-hover:bg-[#1D3C34] group-hover:text-white transition-colors duration-300">
                        <Calendar size={24} />
                      </div>
                      <span className="text-sm font-bold text-[#CBA052] bg-[#CBA052]/10 px-3 py-1 rounded-full">{event.date}</span>
                    </div>
                  )}
                  <h3 className="text-xl font-black text-[#25282A] mb-2 group-hover:text-[#1D3C34] transition-colors">{event.title}</h3>
                  <p className="text-slate-500 text-sm mb-5 leading-relaxed">{event.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-[#CBA052] mr-2 animate-pulse"></div>
                      {event.location}
                    </div>
                    {event.videoUrl && (
                      <a href={event.videoUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#1D3C34] hover:text-[#CBA052] transition-colors flex items-center gap-1">
                        ▶ Ver video
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SOCIAL / TEAM SECTION --- */}
      <section id="team" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-[#CBA052]/10 text-[#CBA052] text-xs font-black rounded-full mb-4 tracking-wider uppercase">Nuestra Gente</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#25282A] tracking-tight">Equipo Corpocrea</h2>
            <p className="text-slate-500 mt-4 text-lg">Celebramos a quienes hacen posible nuestra visión</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Employee of the Month */}
            {employeeOfMonth && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1D3C34] to-[#25282A] text-white p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#CBA052] blur-[120px] opacity-20 rounded-full group-hover:opacity-30 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#A2B2C8] blur-[80px] opacity-15 rounded-full"></div>
                
                <div className="relative w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
                  <div className="absolute inset-[-4px] border-2 border-[#CBA052]/50 rounded-full"></div>
                  <div className="absolute inset-[-8px] border border-[#CBA052]/20 rounded-full"></div>
                  <img 
                    src={employeeOfMonth.photo} 
                    alt={employeeOfMonth.name} 
                    className="w-full h-full object-cover rounded-full border-4 border-[#1D3C34] shadow-xl"
                  />
                  <div className="absolute bottom-1 right-1 bg-[#CBA052] text-white p-2.5 rounded-full border-4 border-[#1D3C34] shadow-lg">
                    <Award size={22} />
                  </div>
                </div>

                <div className="relative text-center md:text-left">
                  <h4 className="text-[#CBA052] font-black uppercase tracking-[0.2em] text-xs mb-3">Reconocimiento</h4>
                  <h3 className="text-3xl font-black mb-1 tracking-tight">Empleado del Mes</h3>
                  <p className="text-2xl font-light text-white/90 mb-4">{employeeOfMonth.name}</p>
                  <p className="text-[#A2B2C8] italic text-sm">"{employeeOfMonth.position} - {employeeOfMonth.department}"</p>
                  <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                    {employeeOfMonth.skills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/80 font-medium border border-white/5">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Celebrations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Birthdays */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 border border-pink-100 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white rounded-xl text-pink-500 shadow-sm">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#25282A] text-lg">Cumpleaños</h3>
                    <p className="text-slate-500 text-sm">Este mes</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {birthdays.length > 0 ? birthdays.map(emp => (
                    <div key={emp.id} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <img src={emp.photo} className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-200" alt={emp.name} />
                      <div>
                        <p className="font-bold text-sm text-[#25282A]">{emp.name}</p>
                        <p className="text-xs text-pink-500 font-medium">{emp.birthDate}</p>
                      </div>
                    </div>
                  )) : <p className="text-sm text-slate-500 italic">No hay cumpleaños este mes.</p>}
                </div>
              </div>

              {/* Anniversaries */}
              <div className="bg-gradient-to-br from-[#1D3C34]/5 to-[#A2B2C8]/10 rounded-3xl p-8 border border-[#A2B2C8]/20 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-white rounded-xl text-[#1D3C34] shadow-sm">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#25282A] text-lg">Aniversarios</h3>
                    <p className="text-slate-500 text-sm">Este mes</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {anniversaries.length > 0 ? anniversaries.map(emp => (
                    <div key={emp.id} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <img src={emp.photo} className="w-10 h-10 rounded-full object-cover ring-2 ring-[#A2B2C8]" alt={emp.name} />
                      <div>
                        <p className="font-bold text-sm text-[#25282A]">{emp.name}</p>
                        <p className="text-xs text-[#1D3C34] font-medium">Desde {new Date(emp.startDate).getFullYear()}</p>
                      </div>
                    </div>
                  )) : <p className="text-sm text-slate-500 italic">No hay aniversarios este mes.</p>}
                </div>
              </div>

            </div>
          </div>

          {/* Recent Promotions (visible 15 days) */}
          {(() => {
            const now = Date.now();
            const recentPromos = (data.promotions || []).filter(p => {
              const d = new Date(p.date).getTime();
              return !isNaN(d) && (now - d) <= 15 * 24 * 60 * 60 * 1000;
            });
            return recentPromos.length > 0 ? (
            <div className="mt-12">
              <h3 className="text-2xl font-black text-[#25282A] text-center mb-8">Ascensos Recientes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPromos.slice(0, 6).map(p => (
                  <div key={p.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-4">
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt={p.employeeName} className="w-14 h-14 rounded-full object-cover ring-2 ring-[#CBA052]/40 group-hover:ring-[#CBA052] transition-all"/>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#CBA052] to-[#a07d3a] flex items-center justify-center text-white font-bold text-xl">
                          {p.employeeName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-black text-[#25282A]">{p.employeeName}</h4>
                        <p className="text-xs text-slate-400">{p.department}</p>
                      </div>
                    </div>
                    <div className="bg-[#1D3C34]/5 rounded-xl p-3 mb-3">
                      <p className="text-xs text-slate-500">Cargo anterior</p>
                      <p className="text-sm font-medium text-slate-700">{p.previousPosition || '—'}</p>
                    </div>
                    <div className="bg-[#CBA052]/10 rounded-xl p-3">
                      <p className="text-xs text-[#CBA052]">Nuevo cargo</p>
                      <p className="text-sm font-bold text-[#1D3C34]">{p.newPosition}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 text-right">{p.date}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
          })()}

          {/* New Hires (visible 30 days) */}
          {(() => {
            const now = Date.now();
            const recentHires = (data.newHires || []).filter(nh => {
              const d = new Date(nh.date).getTime();
              return !isNaN(d) && (now - d) <= 30 * 24 * 60 * 60 * 1000;
            });
            return recentHires.length > 0 ? (
            <div className="mt-12">
              <h3 className="text-2xl font-black text-[#25282A] text-center mb-8">Nuevos Ingresos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentHires.slice(0, 6).map(nh => (
                  <div key={nh.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-4">
                      {nh.photoUrl ? (
                        <img src={nh.photoUrl} alt={nh.employeeName} className="w-14 h-14 rounded-full object-cover ring-2 ring-[#1D3C34]/40 group-hover:ring-[#1D3C34] transition-all"/>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1D3C34] to-[#0f2219] flex items-center justify-center text-white font-bold text-xl">
                          {nh.employeeName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-black text-[#25282A]">{nh.employeeName}</h4>
                        <p className="text-xs text-slate-400">{nh.department}</p>
                      </div>
                    </div>
                    <div className="bg-[#1D3C34]/5 rounded-xl p-3 mb-3">
                      <p className="text-xs text-slate-500">Cargo</p>
                      <p className="text-sm font-bold text-[#1D3C34]">{nh.position || 'Sin asignar'}</p>
                    </div>
                    {nh.description && (
                      <p className="text-sm text-slate-600 mt-2">{nh.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-3 text-right">Ingreso: {nh.date}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null;
          })()}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#25282A] text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {data.siteLogoUrl ? (
                  <img src={data.siteLogoUrl} alt="Corpocrea" className="h-10 object-contain" />
                ) : (
                  <>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#CBA052] to-[#a07d3a] rounded-xl flex items-center justify-center">
                      <span className="text-white font-black text-xl">C</span>
                    </div>
                    <span className="text-xl font-black text-white">
                      CORPO<span className="text-[#CBA052]">CREA</span>
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Transformando el futuro corporativo con innovación, tecnología y el mejor talento humano.
              </p>
            </div>
            <div>
              <h4 className="font-black text-white mb-4 text-sm tracking-wider uppercase">Plataforma</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#CBA052] transition-colors">Intranet</a></li>
                <li><a href="#" className="hover:text-[#CBA052] transition-colors">Portal del Empleado</a></li>
                <li><a href="#" className="hover:text-[#CBA052] transition-colors">Soporte Técnico</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-white mb-4 text-sm tracking-wider uppercase">Contacto</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Globe size={14}/> www.corpocrea.com</li>
                <li className="flex items-center gap-2"><Building2 size={14}/> Caracas, Venezuela</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-slate-600">
            &copy; {new Date().getFullYear()} Corpocrea. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};