import React, { useState, useEffect } from 'react';
import { AppState, NewsItem, EventItem } from '../types';
import { Calendar, User, Gift, Award, ArrowRight, Menu, X, LogIn, Building2, Users, Globe, Shield, ChevronDown, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface LandingProps {
  data: AppState;
  onNavigateLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ data, onNavigateLogin }) => {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

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
            {/* Video as cover if no image, or image as cover */}
            {!item.imageUrl && item.videoUrl ? (
              <video
                src={item.videoUrl}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay muted loop playsInline
              />
            ) : (
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms]"
                style={{ backgroundImage: `url(${item.imageUrl})`, transform: index === currentNewsIndex ? 'scale(1.05)' : 'scale(1)' }}
              />
            )}
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
                  <button 
                    onClick={() => { setSelectedNews(item); setGalleryIndex(0); }}
                    className="group flex items-center gap-3 text-white border-2 border-[#CBA052]/50 px-8 py-4 rounded-xl hover:bg-[#CBA052] hover:border-[#CBA052] transition-all font-bold tracking-wide"
                  >
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.events.map((event, idx) => (
              <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 group hover:-translate-y-1 flex flex-col cursor-pointer" onClick={() => setSelectedEvent(event)} style={{ animationDelay: `${idx * 100}ms` }}>
                {event.imageUrl ? (
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-contain bg-white group-hover:scale-[1.02] transition-transform duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <span className="absolute top-3 right-3 text-xs font-bold text-white bg-[#CBA052] px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">{event.date}</span>
                  </div>
                ) : (
                  <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#1D3C34] to-[#25282A] flex flex-col items-center justify-center p-8">
                    <Calendar size={48} className="text-[#CBA052]/60 mb-3" />
                    <span className="text-sm font-bold text-white/80 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">{event.date}</span>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-black text-[#25282A] mb-2 group-hover:text-[#1D3C34] transition-colors leading-tight">{event.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed flex-1">{event.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
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
      <section id="team" className="relative py-14 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CBA052]/40 to-transparent"></div>
        <div className="absolute top-10 -left-32 w-72 h-72 bg-[#CBA052]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 -right-32 w-72 h-72 bg-[#1D3C34]/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, #25282A 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>

        <div className="relative max-w-7xl mx-auto px-4">
          {/* Compact Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#CBA052]/10 via-[#CBA052]/15 to-[#CBA052]/10 text-[#CBA052] text-[10px] font-black rounded-full mb-3 tracking-[0.25em] uppercase border border-[#CBA052]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CBA052] animate-pulse"></span>
              Nuestra Gente
              <span className="w-1.5 h-1.5 rounded-full bg-[#CBA052] animate-pulse"></span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#25282A] tracking-tight leading-none">
              Equipo <span className="bg-gradient-to-r from-[#CBA052] to-[#a07d3a] bg-clip-text text-transparent">Corpocrea</span>
            </h2>
          </div>

          {/* === ROW 1: Employee of the Month (full width) === */}
          {employeeOfMonth && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1D3C34] via-[#1D3C34]/95 to-[#25282A] text-white p-5 flex items-center gap-5 shadow-xl shadow-[#1D3C34]/15 group hover:shadow-2xl transition-all duration-500 mb-4">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#CBA052] blur-[120px] opacity-15 rounded-full group-hover:opacity-25 transition-opacity"></div>
              <div className="absolute top-2 right-3 text-[#CBA052]/10 text-5xl font-black leading-none select-none pointer-events-none">★</div>
              <div className="absolute inset-0 rounded-2xl border border-[#CBA052]/10 group-hover:border-[#CBA052]/25 transition-colors"></div>

              <div className="relative w-20 h-20 flex-shrink-0">
                <div className="absolute inset-[-4px] border-2 border-[#CBA052]/40 rounded-full" style={{animation: 'spin 20s linear infinite'}}></div>
                <div className="absolute inset-[-2px] bg-gradient-to-br from-[#CBA052]/30 to-transparent rounded-full blur-sm"></div>
                <img src={employeeOfMonth.photo} alt={employeeOfMonth.name} className="w-full h-full object-cover rounded-full border-3 border-[#1D3C34] shadow-xl group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[#CBA052] to-[#a07d3a] text-white p-1.5 rounded-xl border-3 border-[#1D3C34] shadow-lg shadow-[#CBA052]/30">
                  <Award size={14} />
                </div>
              </div>

              <div className="relative flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#CBA052]/15 rounded-full mb-2 border border-[#CBA052]/20">
                  <div className="w-1 h-1 rounded-full bg-[#CBA052] animate-pulse"></div>
                  <span className="text-[#CBA052] font-black uppercase tracking-[0.15em] text-[9px]">Empleado del Mes</span>
                </div>
                <p className="text-lg font-black text-white leading-tight truncate">{employeeOfMonth.name}</p>
                <p className="text-[#A2B2C8]/80 text-sm font-medium truncate">{employeeOfMonth.position} · {employeeOfMonth.department}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {employeeOfMonth.skills.slice(0, 4).map(skill => (
                    <span key={skill} className="px-2 py-0.5 bg-white/8 rounded-full text-xs text-white/60 font-medium border border-white/10">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === ROW 2: Birthdays + Anniversaries + Promotions + New Hires — single row === */}
          {(() => {
            const now = Date.now();
            const recentPromos = (data.promotions || []).filter(p => {
              const d = new Date(p.date).getTime();
              return !isNaN(d) && (now - d) <= 15 * 24 * 60 * 60 * 1000;
            });
            const recentHires = (data.newHires || []).filter(nh => {
              const d = new Date(nh.date).getTime();
              return !isNaN(d) && (now - d) <= 30 * 24 * 60 * 60 * 1000;
            });

            // Count how many panels we have (birthdays & anniversaries always show)
            const panels: string[] = ['birthdays', 'anniversaries'];
            if (recentPromos.length > 0) panels.push('promos');
            if (recentHires.length > 0) panels.push('hires');
            const colClass = panels.length === 4 ? 'lg:grid-cols-4' : panels.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

            return (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${colClass} gap-3`}>
              
              {/* Birthdays */}
              <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-pink-100/80 shadow-md hover:shadow-lg transition-all duration-300 group">
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full opacity-20"></div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg text-white shadow-sm shadow-pink-500/20">
                    <Gift size={16} />
                  </div>
                  <h3 className="font-black text-[#25282A] text-sm">Cumpleaños</h3>
                  <span className="text-xs text-pink-400 font-medium ml-auto">Este mes</span>
                </div>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5" style={{scrollbarWidth: 'thin'}}>
                  {birthdays.length > 0 ? birthdays.map(emp => (
                    <div key={emp.id} className="flex items-center gap-2.5 bg-pink-50/60 p-2 rounded-lg border border-pink-100/40 hover:border-pink-200 transition-all">
                      <img src={emp.photo} className="w-9 h-9 rounded-full object-cover ring-1 ring-pink-300 flex-shrink-0" alt={emp.name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-[#25282A] truncate">{emp.name}</p>
                        <p className="text-xs text-pink-500 font-semibold">{emp.birthDate}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <span className="text-2xl opacity-30">🎈</span>
                      <p className="text-sm text-slate-400 italic mt-1">Sin cumpleaños</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Anniversaries */}
              <div className="relative overflow-hidden rounded-2xl bg-white p-5 border border-[#A2B2C8]/30 shadow-md hover:shadow-lg transition-all duration-300 group">
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-[#A2B2C8] to-[#1D3C34] rounded-full opacity-15"></div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-2 bg-gradient-to-br from-[#1D3C34] to-[#25282A] rounded-lg text-white shadow-sm shadow-[#1D3C34]/20">
                    <Award size={16} />
                  </div>
                  <h3 className="font-black text-[#25282A] text-sm">Aniversarios</h3>
                  <span className="text-xs text-[#1D3C34]/50 font-medium ml-auto">Este mes</span>
                </div>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5" style={{scrollbarWidth: 'thin'}}>
                  {anniversaries.length > 0 ? anniversaries.map(emp => {
                    const years = new Date().getFullYear() - new Date(emp.startDate).getFullYear();
                    return (
                    <div key={emp.id} className="flex items-center gap-2.5 bg-[#1D3C34]/5 p-2 rounded-lg border border-[#A2B2C8]/15 hover:border-[#A2B2C8]/35 transition-all">
                      <div className="relative flex-shrink-0">
                        <img src={emp.photo} className="w-9 h-9 rounded-full object-cover ring-1 ring-[#A2B2C8]" alt={emp.name} />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#1D3C34] rounded-full flex items-center justify-center">
                          <span className="text-white text-[6px] font-black">{years}</span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-[#25282A] truncate">{emp.name}</p>
                        <p className="text-xs text-[#1D3C34] font-semibold">{years} {years === 1 ? 'año' : 'años'}</p>
                      </div>
                    </div>
                    );
                  }) : (
                    <div className="text-center py-4">
                      <span className="text-2xl opacity-30">📅</span>
                      <p className="text-sm text-slate-400 italic mt-1">Sin aniversarios</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Promotions */}
              {recentPromos.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl bg-white border border-[#CBA052]/15 shadow-md hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-[#CBA052]/5 via-transparent to-transparent border-b border-[#CBA052]/10">
                    <div className="p-2 bg-gradient-to-br from-[#CBA052] to-[#a07d3a] rounded-lg text-white shadow-sm shadow-[#CBA052]/25">
                      <ArrowRight size={14} className="rotate-[-90deg]" />
                    </div>
                    <h3 className="font-black text-[#25282A] text-sm">Ascensos</h3>
                    <span className="ml-auto px-2 py-0.5 bg-[#CBA052]/10 text-[#CBA052] text-xs font-black rounded-full">{recentPromos.length}</span>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-[160px] overflow-y-auto" style={{scrollbarWidth: 'thin'}}>
                    {recentPromos.slice(0, 6).map(p => (
                      <div key={p.id} className="flex items-center gap-2.5 px-5 py-2.5 hover:bg-[#CBA052]/3 transition-colors">
                        <div className="flex-shrink-0">
                          {p.photoUrl ? (
                            <img src={p.photoUrl} alt={p.employeeName} className="w-9 h-9 rounded-lg object-cover ring-1 ring-[#CBA052]/20"/>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#CBA052] to-[#a07d3a] flex items-center justify-center text-white font-black text-sm">
                              {p.employeeName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-[#25282A] truncate">{p.employeeName}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 truncate">{p.previousPosition || '—'}</span>
                            <ArrowRight size={10} className="text-[#CBA052] flex-shrink-0" />
                            <span className="text-xs font-bold text-[#1D3C34] truncate">{p.newPosition}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Hires */}
              {recentHires.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl bg-white border border-[#1D3C34]/10 shadow-md hover:shadow-lg transition-all group">
                  <div className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-[#1D3C34]/5 via-transparent to-transparent border-b border-[#1D3C34]/8">
                    <div className="p-2 bg-gradient-to-br from-[#1D3C34] to-[#25282A] rounded-lg text-white shadow-sm shadow-[#1D3C34]/25">
                      <Users size={14} />
                    </div>
                    <h3 className="font-black text-[#25282A] text-sm">Nuevos Ingresos</h3>
                    <span className="ml-auto px-2 py-0.5 bg-[#1D3C34]/10 text-[#1D3C34] text-xs font-black rounded-full">{recentHires.length}</span>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-[160px] overflow-y-auto" style={{scrollbarWidth: 'thin'}}>
                    {recentHires.slice(0, 6).map(nh => (
                      <div key={nh.id} className="flex items-center gap-2.5 px-5 py-2.5 hover:bg-[#1D3C34]/3 transition-colors">
                        <div className="flex-shrink-0">
                          {nh.photoUrl ? (
                            <img src={nh.photoUrl} alt={nh.employeeName} className="w-9 h-9 rounded-lg object-cover ring-1 ring-[#1D3C34]/20"/>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1D3C34] to-[#0f2219] flex items-center justify-center text-white font-black text-sm">
                              {nh.employeeName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-sm text-[#25282A] truncate">{nh.employeeName}</p>
                            <span className="px-1 py-0 bg-[#1D3C34]/8 text-[#1D3C34] text-[8px] font-black uppercase rounded flex-shrink-0">👋</span>
                          </div>
                          <p className="text-xs font-semibold text-[#1D3C34] truncate">{nh.position || 'Sin asignar'} · {nh.department}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            );
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

      {/* News Detail Modal */}
      {selectedNews && (() => {
        const allImages = [selectedNews.imageUrl, ...(selectedNews.additionalImages || [])].filter(Boolean) as string[];
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedNews(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedNews(null)} className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-slate-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-xl font-bold">×</button>
              
              {/* Image Gallery */}
              {allImages.length > 0 && (
                <div className="relative">
                  <img src={allImages[galleryIndex]} alt={selectedNews.title} className="w-full aspect-[16/9] object-contain bg-slate-900 rounded-t-3xl" />
                  {allImages.length > 1 && (
                    <>
                      <button onClick={() => setGalleryIndex(prev => (prev - 1 + allImages.length) % allImages.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center"><ChevronLeft size={24}/></button>
                      <button onClick={() => setGalleryIndex(prev => (prev + 1) % allImages.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center"><ChevronRight size={24}/></button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        {allImages.map((_, i) => (
                          <button key={i} onClick={() => setGalleryIndex(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === galleryIndex ? 'bg-[#CBA052] scale-125' : 'bg-white/50 hover:bg-white/80'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 p-4 bg-slate-50 overflow-x-auto">
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => setGalleryIndex(i)} className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === galleryIndex ? 'border-[#CBA052] ring-2 ring-[#CBA052]/30' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-[#CBA052]/10 text-[#CBA052] text-xs font-black rounded-full">{selectedNews.date}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#25282A] mb-4 leading-tight">{selectedNews.title}</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line mb-6">{selectedNews.description}</p>
                {selectedNews.videoUrl && (
                  selectedNews.videoUrl.match(/\.(mp4|webm|ogg|mov)/i) || selectedNews.videoUrl.includes('cloudinary.com/') ? (
                    <video src={selectedNews.videoUrl} controls className="w-full rounded-xl bg-black max-h-[400px]" />
                  ) : (
                    <a href={selectedNews.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">
                      <Play size={16}/> Ver Video
                    </a>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-slate-800 rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-xl font-bold">×</button>

            {selectedEvent.imageUrl && (
              <img src={selectedEvent.imageUrl} alt={selectedEvent.title} className="w-full aspect-[16/9] object-contain bg-slate-900 rounded-t-3xl" />
            )}

            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#CBA052]/10 text-[#CBA052] text-xs font-black rounded-full">{selectedEvent.date}</span>
                {selectedEvent.location && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">{selectedEvent.location}</span>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#25282A] mb-4 leading-tight">{selectedEvent.title}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line mb-6">{selectedEvent.description}</p>
              {selectedEvent.videoUrl && (
                selectedEvent.videoUrl.match(/\.(mp4|webm|ogg|mov)/i) || selectedEvent.videoUrl.includes('cloudinary.com/') ? (
                  <video src={selectedEvent.videoUrl} controls className="w-full rounded-xl bg-black max-h-[400px]" />
                ) : (
                  <a href={selectedEvent.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">
                    <Play size={16}/> Ver Video
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};