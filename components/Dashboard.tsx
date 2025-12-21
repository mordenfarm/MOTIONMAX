
import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, AlertTriangle, HeartPulse, ShoppingCart, ChevronRight, Activity } from 'lucide-react';

const MOCK_DATA = [
  { name: 'Mon', successRate: 45 },
  { name: 'Tue', successRate: 52 },
  { name: 'Wed', successRate: 48 },
  { name: 'Thu', successRate: 61 },
  { name: 'Fri', successRate: 65 },
  { name: 'Sat', successRate: 72 },
  { name: 'Sun', successRate: 78 },
];

const ActivityGrid = () => {
  const days = Array.from({ length: 120 }, (_, i) => ({
    level: Math.floor(Math.random() * 4),
    date: i
  }));

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-slate-100 dark:bg-slate-800';
      case 1: return 'bg-blue-100 dark:bg-blue-900/30';
      case 2: return 'bg-blue-300 dark:bg-blue-700/50';
      case 3: return 'bg-blue-500 dark:bg-blue-500';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="mt-4 flex flex-wrap gap-1 justify-center md:justify-start">
      {days.map((day, i) => (
        <div 
          key={i} 
          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px] ${getLevelColor(day.level)} transition-colors duration-200`}
        />
      ))}
    </div>
  );
};

const StatCard = ({ title, value, sub, icon: Icon, color, trend }: any) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm group">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 dark:bg-green-900/20 dark:border-green-800">
          {trend}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-2xl font-black mt-1 tracking-tight text-slate-900 dark:text-white font-mono">{value}</h3>
      <p className="text-[10px] text-slate-400 mt-1 font-medium">{sub}</p>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { students, clinicalLogs, settings } = useStore();

  // Calculate Real Student Statistics
  const statsData = useMemo(() => {
    const totalStudents = students.length;
    
    // Calculate new arrivals (registered this month)
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // "YYYY-MM"
    const newArrivals = students.filter(s => s.enrollmentDate && s.enrollmentDate.startsWith(currentMonth)).length;

    // Calculate lessons done (from clinical logs)
    const lessonsDone = clinicalLogs.length;

    // Calculate total money (simplified for dashboard view)
    const totalCollected = students.reduce((sum, s) => sum + (s.totalPaid || 0), 0);

    return {
      totalStudents,
      newArrivals,
      lessonsDone,
      totalCollected
    };
  }, [students, clinicalLogs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">Management Terminal</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium italic">Global infrastructure overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             Node: Online
          </div>
          <button className="flex-1 md:flex-none px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-blue-500/10 active:scale-95 transition-transform">
            Refresh Node
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Students" 
          value={statsData.totalStudents.toString()} 
          sub={`${statsData.newArrivals} new arrivals this month`} 
          icon={Users} 
          color="bg-blue-500" 
          trend={statsData.newArrivals > 0 ? `+${statsData.newArrivals}` : undefined} 
        />
        <StatCard 
          title="Clinical Logs" 
          value={statsData.lessonsDone.toLocaleString()} 
          sub="Recorded sessions" 
          icon={TrendingUp} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="System Alerts" 
          value="00" 
          sub="Terminal status: Stable" 
          icon={AlertTriangle} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Revenue (USD)" 
          value={`$${statsData.totalCollected.toLocaleString()}`} 
          sub={`Based on ${settings.currentTerm}`} 
          icon={ShoppingCart} 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                Student Independence Trends
              </h3>
            </div>
            <div className="flex gap-1">
              {['Last Week', 'This Month', 'Last 3 Months'].map(t => (
                <button key={t} className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${t === 'This Month' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="flex-1 p-4 sm:p-6 h-[250px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DATA}>
                <defs>
                  <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="successRate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorInd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center sm:text-left">
             <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] font-black uppercase tracking-widest gap-2">
                <span className="text-slate-400">Activity Registry Pattern</span>
                <span className="text-blue-600 dark:text-blue-400 cursor-pointer">Export Data</span>
             </div>
             <ActivityGrid />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 dark:bg-blue-600 p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 text-white/10 group-hover:scale-125 transition-transform duration-1000">
               <HeartPulse size={160} />
            </div>
            <div className="relative z-10">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-200">Terminal Protocol</span>
              <h4 className="text-lg font-black mt-3 leading-tight uppercase">Update Logs Daily.</h4>
              <p className="text-xs text-blue-100 mt-2 leading-relaxed opacity-80 font-medium italic">Data integrity is critical for student progress tracking. Ensure all session logs are finalized before logout.</p>
              <button className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md px-4 py-2.5 rounded-xl hover:bg-white/30 transition-colors">
                View Documentation <ChevronRight size={14} />
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
               <Activity size={14} className="text-blue-500" /> Operational Tasks
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Audit clinical data sync', priority: 'High', due: 'Now' },
                { label: 'Verify uniform inventory', priority: 'Med', due: '1d' },
                { label: 'Process payroll queue', priority: 'Low', due: '3d' }
              ].map((task, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-md border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-500">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-sm opacity-0 group-hover:opacity-100"></div>
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{task.label}</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-400">{task.due}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
