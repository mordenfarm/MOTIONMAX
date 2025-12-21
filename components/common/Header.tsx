
import React from 'react';
import { useStore } from '../../store/useStore';
import { Bell, Moon, Sun, Menu, ShoppingCart } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, theme, toggleTheme, toggleMobileMenu, cart, setActiveTab } = useStore();

  return (
    <header className="h-20 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
      {/* Left: Mobile Toggle & User Info */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => toggleMobileMenu()}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
        >
          <Menu size={24} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
            {user?.name}
          </h2>
          <div className="flex items-center mt-1">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tight text-slate-400 dark:text-slate-500">
              {user?.role.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 md:gap-2">
        <button 
          onClick={() => setActiveTab('shop')}
          className="relative p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
        >
          <ShoppingCart id="common-header-cart" size={20} />
          {cart.length > 0 && (
            <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-blue-600 text-white text-[8px] font-black rounded-full ring-2 ring-white dark:ring-slate-950 flex items-center justify-center animate-bounce">
              {cart.length}
            </span>
          )}
        </button>
        <button 
          onClick={toggleTheme}
          className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button className="relative p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-4 ring-white dark:ring-slate-950 animate-bounce"></span>
        </button>
      </div>
    </header>
  );
};
