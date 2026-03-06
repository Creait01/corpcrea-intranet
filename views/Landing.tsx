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
      <section id="team" className="relative py-28 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CBA052]/40 to-transparent"></div>
        <div className="absolute top-20 -left-32 w-96 h-96 bg-[#CBA052]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-32 w-96 h-96 bg-[#1D3C34]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#A2B2C8]/5 rounded-full blur-3xl"></div>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, #25282A 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>

        <div className="relative max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#CBA052]/10 via-[#CBA052]/15 to-[#CBA052]/10 text-[#CBA052] text-xs font-black rounded-full mb-6 tracking-[0.25em] uppercase border border-[#CBA052]/20 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CBA052] animate-pulse"></span>
              Nuestra Gente
              <span className="w-1.5 h-1.5 rounded-full bg-[#CBA052] animate-pulse"></span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#25282A] tracking-tight leading-none">
              Equipo <span className="bg-gradient-to-r from-[#CBA052] to-[#a07d3a] bg-clip-text text-transparent">Corpocrea</span>
            </h2>
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#CBA052]/40"></div>
              <p className="text-slate-500 text-lg font-light">Celebramos a quienes hacen posible nuestra visión</p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#CBA052]/40"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Employee of the Month */}
            {employeeOfMonth && (
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1D3C34] via-[#1D3C34]/95 to-[#25282A] text-white p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-[#1D3C34]/20 group hover:shadow-3xl hover:shadow-[#1D3C34]/30 transition-all duration-700">
                {/* Decorative light effects */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#CBA052] blur-[150px] opacity-15 rounded-full group-hover:opacity-25 transition-opacity duration-700"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#A2B2C8] blur-[100px] opacity-10 rounded-full group-hover:opacity-20 transition-opacity duration-700"></div>
                <div className="absolute top-4 right-4 text-[#CBA052]/10 text-8xl font-black leading-none select-none pointer-events-none">★</div>
                
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-[2rem] border border-[#CBA052]/10 group-hover:border-[#CBA052]/25 transition-colors duration-700"></div>

                <div className="relative w-36 h-36 md:w-44 md:h-44 flex-shrink-0">
                  {/* Animated ring */}
                  <div className="absolute inset-[-6px] border-2 border-[#CBA052]/40 rounded-full" style={{animation: 'spin 20s linear infinite'}}></div>
                  <div className="absolute inset-[-12px] border border-[#CBA052]/15 rounded-full" style={{animation: 'spin 30s linear infinite reverse'}}></div>
                  <div className="absolute inset-[-3px] bg-gradient-to-br from-[#CBA052]/30 to-transparent rounded-full blur-sm"></div>
                  <img 
                    src={employeeOfMonth.photo} 
                    alt={employeeOfMonth.name} 
                    className="w-full h-full object-cover rounded-full border-4 border-[#1D3C34] shadow-2xl shadow-black/30 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[#CBA052] to-[#a07d3a] text-white p-3 rounded-2xl border-4 border-[#1D3C34] shadow-lg shadow-[#CBA052]/30 group-hover:scale-110 transition-transform duration-300">
                    <Award size={20} />
                  </div>
                </div>

                <div className="relative text-center md:text-left flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#CBA052]/15 rounded-full mb-4 border border-[#CBA052]/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#CBA052] animate-pulse"></div>
                    <span className="text-[#CBA052] font-black uppercase tracking-[0.2em] text-[10px]">Reconocimiento del Mes</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight leading-tight">Empleado del Mes</h3>
                  <p className="text-xl md:text-2xl font-light text-white/90 mb-1">{employeeOfMonth.name}</p>
                  <p className="text-[#A2B2C8]/80 text-sm font-medium">{employeeOfMonth.position} · {employeeOfMonth.department}</p>
                  <div className="mt-5 flex flex-wrap gap-2 justify-center md:justify-start">
                    {employeeOfMonth.skills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-white/8 backdrop-blur-sm rounded-full text-xs text-white/70 font-medium border border-white/10 hover:bg-white/15 hover:text-white transition-all cursor-default">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Celebrations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Birthdays */}
              <div className="relative overflow-hidden rounded-[1.5rem] bg-white p-6 border border-pink-100/80 shadow-lg shadow-pink-500/5 hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-500 group">
                {/* Decorative corner */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-pink-200 to-rose-300 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="absolute top-3 right-3 text-2xl select-none opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-110 transform duration-300">🎂</div>
                
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl text-white shadow-lg shadow-pink-500/25">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#25282A] text-base leading-tight">Cumpleaños</h3>
                    <p className="text-slate-400 text-xs font-medium">Este mes</p>
                  </div>
                </div>
                <div className="space-y-2.5 relative">
                  {birthdays.length > 0 ? birthdays.map(emp => (
                    <div key={emp.id} className="flex items-center gap-3 bg-gradient-to-r from-pink-50/80 to-rose-50/50 p-3 rounded-xl border border-pink-100/50 hover:border-pink-200 hover:shadow-md transition-all duration-300 group/item">
                      <div className="relative">
                        <img src={emp.photo} className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-300 ring-offset-2 ring-offset-white" alt={emp.name} />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-[8px]">🎉</span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-[#25282A] truncate">{emp.name}</p>
                        <p className="text-xs text-pink-500 font-semibold">{emp.birthDate}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <div className="text-3xl mb-2 opacity-40">🎈</div>
                      <p className="text-sm text-slate-400 italic">No hay cumpleaños este mes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Anniversaries */}
              <div className="relative overflow-hidden rounded-[1.5rem] bg-white p-6 border border-[#A2B2C8]/30 shadow-lg shadow-[#1D3C34]/5 hover:shadow-xl hover:shadow-[#1D3C34]/10 transition-all duration-500 group">
                {/* Decorative corner */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-[#A2B2C8] to-[#1D3C34] rounded-full opacity-15 group-hover:opacity-25 transition-opacity"></div>
                <div className="absolute top-3 right-3 text-2xl select-none opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-110 transform duration-300">🏆</div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-gradient-to-br from-[#1D3C34] to-[#25282A] rounded-xl text-white shadow-lg shadow-[#1D3C34]/25">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#25282A] text-base leading-tight">Aniversarios</h3>
                    <p className="text-slate-400 text-xs font-medium">Este mes</p>
                  </div>
                </div>
                <div className="space-y-2.5 relative">
                  {anniversaries.length > 0 ? anniversaries.map(emp => {
                    const years = new Date().getFullYear() - new Date(emp.startDate).getFullYear();
                    return (
                    <div key={emp.id} className="flex items-center gap-3 bg-gradient-to-r from-[#1D3C34]/5 to-[#A2B2C8]/10 p-3 rounded-xl border border-[#A2B2C8]/20 hover:border-[#A2B2C8]/40 hover:shadow-md transition-all duration-300">
                      <div className="relative">
                        <img src={emp.photo} className="w-10 h-10 rounded-full object-cover ring-2 ring-[#A2B2C8] ring-offset-2 ring-offset-white" alt={emp.name} />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#1D3C34] rounded-full flex items-center justify-center">
                          <span className="text-white text-[7px] font-black">{years}</span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-[#25282A] truncate">{emp.name}</p>
                        <p className="text-xs text-[#1D3C34] font-semibold">{years} {years === 1 ? 'año' : 'años'} en la empresa</p>
                      </div>
                    </div>
                    );
                  }) : (
                    <div className="text-center py-4">
                      <div className="text-3xl mb-2 opacity-40">📅</div>
                      <p className="text-sm text-slate-400 italic">No hay aniversarios este mes</p>
                    </div>
                  )}
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
            <div className="mt-20">
              <div className="flex items-center justify-center gap-4 mb-10">
                <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[#CBA052]/30"></div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#CBA052] to-[#a07d3a] rounded-xl text-white shadow-lg shadow-[#CBA052]/25">
                    <ArrowRight size={18} className="rotate-[-90deg]" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#25282A]">Ascensos Recientes</h3>
                </div>
                <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-[#CBA052]/30"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPromos.slice(0, 6).map((p, idx) => (
                  <div key={p.id} className="relative bg-white rounded-[1.5rem] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-[#CBA052]/10 transition-all duration-500 group hover:-translate-y-2" style={{animationDelay: `${idx * 100}ms`}}>
                    {/* Gold accent line */}
                    <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#CBA052] to-transparent rounded-b-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="flex items-center gap-4 mb-5 mt-1">
                      <div className="relative">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.employeeName} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#CBA052]/20 group-hover:ring-[#CBA052]/60 transition-all shadow-md"/>
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#CBA052] to-[#a07d3a] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#CBA052]/30">
                            {p.employeeName.charAt(0)}
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 bg-[#CBA052] text-white p-1 rounded-lg shadow-md">
                          <ArrowRight size={10} className="rotate-[-90deg]" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-[#25282A] text-lg leading-tight truncate">{p.employeeName}</h4>
                        <p className="text-xs text-[#CBA052] font-semibold mt-0.5">{p.department}</p>
                      </div>
                    </div>
                    
                    {/* Position transition */}
                    <div className="relative pl-4 border-l-2 border-dashed border-[#CBA052]/30 space-y-3">
                      <div className="relative bg-slate-50 rounded-xl p-3">
                        <div className="absolute -left-[1.35rem] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Cargo anterior</p>
                        <p className="text-sm font-medium text-slate-600">{p.previousPosition || '—'}</p>
                      </div>
                      <div className="relative bg-gradient-to-r from-[#CBA052]/10 to-[#CBA052]/5 rounded-xl p-3 border border-[#CBA052]/15">
                        <div className="absolute -left-[1.35rem] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#CBA052] border-2 border-white shadow-sm shadow-[#CBA052]/30"></div>
                        <p className="text-[10px] uppercase tracking-wider text-[#CBA052] font-bold mb-0.5">Nuevo cargo</p>
                        <p className="text-sm font-bold text-[#1D3C34]">{p.newPosition}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-4 text-right font-medium">{p.date}</p>
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
            <div className="mt-20">
              <div className="flex items-center justify-center gap-4 mb-10">
                <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[#1D3C34]/20"></div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#1D3C34] to-[#25282A] rounded-xl text-white shadow-lg shadow-[#1D3C34]/25">
                    <Users size={18} />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#25282A]">Nuevos Ingresos</h3>
                </div>
                <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-[#1D3C34]/20"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentHires.slice(0, 6).map((nh, idx) => (
                  <div key={nh.id} className="relative bg-white rounded-[1.5rem] p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:shadow-[#1D3C34]/10 transition-all duration-500 group hover:-translate-y-2" style={{animationDelay: `${idx * 100}ms`}}>
                    {/* Green accent line */}
                    <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#1D3C34] to-transparent rounded-b-full opacity-40 group-hover:opacity-80 transition-opacity"></div>
                    
                    {/* Welcome badge */}
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1D3C34]/10 text-[#1D3C34] text-[10px] font-black uppercase tracking-wider rounded-full border border-[#1D3C34]/15">
                        <span className="text-xs">👋</span> Bienvenido
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-5 mt-1">
                      <div className="relative">
                        {nh.photoUrl ? (
                          <img src={nh.photoUrl} alt={nh.employeeName} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#1D3C34]/20 group-hover:ring-[#1D3C34]/60 transition-all shadow-md"/>
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D3C34] to-[#0f2219] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#1D3C34]/30">
                            {nh.employeeName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pr-16">
                        <h4 className="font-black text-[#25282A] text-lg leading-tight truncate">{nh.employeeName}</h4>
                        <p className="text-xs text-[#1D3C34] font-semibold mt-0.5">{nh.department}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-[#1D3C34]/5 to-[#A2B2C8]/10 rounded-xl p-4 border border-[#1D3C34]/8">
                      <p className="text-[10px] uppercase tracking-wider text-[#1D3C34]/60 font-bold mb-1">Cargo</p>
                      <p className="text-sm font-bold text-[#1D3C34]">{nh.position || 'Sin asignar'}</p>
                    </div>
                    
                    {nh.description && (
                      <p className="text-sm text-slate-500 mt-3 leading-relaxed line-clamp-2">{nh.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar size={12} />
                        <p className="text-[11px] font-medium">{nh.date}</p>
                      </div>
                    </div>
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