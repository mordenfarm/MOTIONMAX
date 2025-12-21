
import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  LayoutDashboard, Users, HeartPulse, ShoppingCart, 
  FileText, ClipboardList, BookOpen, Wallet, 
  Coffee, Briefcase, GraduationCap, LogOut, 
  MessageSquare, X, Settings, History, Send,
  Receipt
} from 'lucide-react';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const Sidebar: React.FC = () => {
  const { user, activeTab, setActiveTab, logout, isMobileMenuOpen, toggleMobileMenu, theme } = useStore();

  const getNavItems = () => {
    const role = user?.role;
    const base = [{ id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> }];

    if (role === 'SUPER_ADMIN') {
      return [
        ...base,
        { id: 'students', label: 'Students', icon: <Users size={18} /> },
        { id: 'staff', label: 'Staff', icon: <Briefcase size={18} /> },
        { id: 'applications', label: 'Applications', icon: <Send size={18} /> },
        { id: 'orders', label: 'Uniform Orders', icon: <Receipt size={18} /> },
        { id: 'clinical', label: 'Clinical Data', icon: <HeartPulse size={18} /> },
        { id: 'finance', label: 'Fees & Payroll', icon: <Wallet size={18} /> },
        { id: 'shop', label: 'Uniform Shop', icon: <ShoppingCart size={18} /> },
        { id: 'settings', label: 'System Settings', icon: <Settings size={18} /> },
      ];
    }

    if (role === 'SPECIALIST') {
      return [
        ...base,
        { id: 'my-students', label: 'My Students', icon: <Users size={18} /> },
        { id: 'clinical-logs', label: 'Clinical Logs', icon: <ClipboardList size={18} /> },
        { id: 'payroll', label: 'Payroll & Leave', icon: <Wallet size={18} /> },
      ];
    }

    if (role === 'PARENT' || role === 'STUDENT') {
      return [
        ...base,
        { id: 'clinical-history', label: 'Session History', icon: <History size={18} /> },
        { id: 'order-history', label: 'Uniform History', icon: <Receipt size={18} /> },
        { id: 'progress', label: 'Progress Charts', icon: <GraduationCap size={18} /> },
        { id: 'fees', label: 'Fees Payment', icon: <Wallet size={18} /> },
        { id: 'shop', label: 'Uniform Shop', icon: <ShoppingCart size={18} /> },
      ];
    }
    return base;
  };

  const navItems = getNavItems();

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="md:hidden flex justify-end p-4">
        <button onClick={() => toggleMobileMenu(false)} className="p-2 text-slate-400 hover:text-rose-500">
          <X size={24} />
        </button>
      </div>

      <div className="px-6 py-10 flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-white/40 blur-xl rounded-full scale-150"></div>
          <img src={LogoImg} alt="Logo" className="relative h-12 w-auto drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[18px] font-black tracking-tighter leading-none text-slate-900 dark:text-white uppercase">MOTION MAX</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mt-1.5 whitespace-nowrap">Day Services</span>
        </div>
      </div>

      <p className="px-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 opacity-60">Navigation</p>

      <nav className="flex-1 flex flex-col sidebar-scrollbar overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-full flex items-center gap-4 px-6 py-3 text-[14px] font-medium transition-all group whitespace-nowrap overflow-hidden ${isActive ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 shadow-inner' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-800/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
            >
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />}
              <span className={`flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'}`}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6">
        <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-slate-800/5 dark:bg-white/5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent dark:border-white/5"><LogOut size={16} /> Logout</button>
      </div>
    </div>
  );

  return (
    <>
      <aside className={`hidden md:flex w-64 border-r transition-colors duration-300 flex flex-col h-screen sticky top-0 ${theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-slate-950 border-white/5'}`}>{SidebarContent}</aside>
      <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => toggleMobileMenu(false)} />
        <aside className={`absolute inset-y-0 left-0 w-72 shadow-2xl transition-transform duration-500 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-950'}`}>{SidebarContent}</aside>
      </div>
    </>
  );
};
