
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

const StatCard = ({ title, value, sub, icon: Icon, color, trend }: any) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
    <div className="flex items-center justify-between">
      <div className={`p-1.5 rounded-lg ${color} bg-opacity-10`}>
        <Icon size={18} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
          {trend}
        </span>
      )}
    </div>
    <div className="mt-3">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-xl font-bold mt-0.5 text-slate-900 dark:text-white font-mono">{value}</h3>
      <p className="text-[9px] text-slate-400 font-medium">{sub}</p>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { students, clinicalLogs, settings } = useStore();

  const statsData = useMemo(() => {
    const totalStudents = students.length;
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); 
    const newArrivals = students.filter(s => s.enrollmentDate && s.enrollmentDate.startsWith(currentMonth)).length;
    const lessonsDone = clinicalLogs.length;
    const totalCollected = students.reduce((sum, s) => sum + (s.totalPaid || 0), 0);

    return { totalStudents, newArrivals, lessonsDone, totalCollected };
  }, [students, clinicalLogs]);

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Main Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium">Summary of school activities.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-lg shadow-md hover:bg-blue-700 transition-all">
          Update Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={statsData.totalStudents.toString()} sub={`${statsData.newArrivals} new this month`} icon={Users} color="bg-blue-500" trend={statsData.newArrivals > 0 ? `+${statsData.newArrivals}` : undefined} />
        <StatCard title="Daily Lessons" value={statsData.lessonsDone.toLocaleString()} sub="Sessions recorded" icon={TrendingUp} color="bg-indigo-500" />
        <StatCard title="Total Alerts" value="0" sub="All clear" icon={AlertTriangle} color="bg-orange-500" />
        <StatCard title="Total Money" value={`$${statsData.totalCollected.toLocaleString()}`} sub="From student fees" icon={ShoppingCart} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Success Rate</h3>
            <span className="text-[10px] text-blue-600 font-bold cursor-pointer hover:underline">Weekly Report</span>
          </div>
          <div className="p-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                <Area type="monotone" dataKey="successRate" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 p-5 rounded-xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-[8px] font-bold uppercase tracking-widest text-blue-400">Important</span>
              <h4 className="text-sm font-bold mt-2 uppercase">Complete notes daily.</h4>
              <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Accurate reports help students grow faster.</p>
              <button className="mt-4 flex items-center gap-1 text-[9px] font-bold uppercase bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all">
                Read More <ChevronRight size={12} />
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
               <Activity size={14} className="text-blue-500" /> Tasks
            </h3>
            <div className="space-y-2">
              {['Finish therapy notes', 'Check uniform stock', 'Staff salary list'].map((task, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-slate-300"></div>
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">{task}</p>
                  </div>
                  <span className="text-[8px] font-mono text-slate-400">Soon</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
