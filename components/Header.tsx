import React from 'react';
import { Activity, Database, ShieldCheck, LayoutGrid, Box, ClipboardList, TrendingUp, CalendarClock } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'FORM', label: '项目录入', icon: ClipboardList },
    { id: 'SCHEDULING', label: '项目排期', icon: CalendarClock },
    { id: 'PROGRESS', label: '项目进度', icon: TrendingUp },
    { id: 'ISOLATORS', label: '隔离包管理', icon: Box },
    { id: 'INVENTORY', label: '库存管理', icon: LayoutGrid },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-cyan-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onNavigate('FORM')}
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-cyan-400 opacity-20 blur animate-pulse-slow group-hover:opacity-40 transition-opacity"></div>
              <ShieldCheck className="h-8 w-8 text-cyan-500 relative z-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 font-sans">
                小罗项目管理系统
              </h1>
              <p className="text-[10px] text-cyan-600 font-mono tracking-widest uppercase">Xiao Luo PMS v2.1</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as ViewState)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  currentView === item.id || (currentView === 'PREVIEW' && item.id === 'FORM')
                    ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-[0_0_10px_rgba(14,165,233,0.1)]' 
                    : 'text-slate-500 hover:text-cyan-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </button>
            ))}
          </nav>
          
          <div className="hidden lg:flex items-center space-x-6 text-sm font-mono text-slate-500">
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-1 text-emerald-500" />
              <span>SYS: ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;