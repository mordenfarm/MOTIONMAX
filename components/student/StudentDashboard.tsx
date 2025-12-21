
import React from 'react';
import { useStore } from '../../store/useStore';
import { 
  HeartPulse, 
  Calendar, 
  ClipboardList, 
  DollarSign, 
  TrendingUp, 
  MessageSquare,
  Clock,
  User,
  Stethoscope,
  BookOpen,
  Bell
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_PROGRESS = [
  { name: 'Week 1', score: 30 },
  { name: 'Week 2', score: 35 },
  { name: 'Week 3', score: 32 },
  { name: 'Week 4', score: 45 },
  { name: 'Week 5', score: 50 },
  { name: 'Week 6', score: 62 },
];

export const StudentDashboard: React.FC = () => {
  const { user, students, parents, settings } = useStore();
  
  // Lookup logic
  let studentProfile = null;
  if (user?.role === 'STUDENT') {
    studentProfile = students.find(s => s.firebaseUid === user.id);
  } else if (user?.role === 'PARENT') {
    const parentProfile = parents.find(p => p.firebaseUid === user.id);
    if (parentProfile) {
      studentProfile = students.find(s => s.id === parentProfile.studentId);
    }
  }

  const stats = [
    { title: 'Current Term', value: settings.currentTerm, icon: Calendar, color: 'text-blue-600 bg-blue-50' },
    { title: 'Fees Status', value: studentProfile?.totalPaid === settings.feesAmount ? 'Paid' : 'Pending', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Sessions Done', value: '24', icon: ClipboardList, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Goal Mastery', value: '72%', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
  ];

  if (!studentProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12">
        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
          <User size={40} className="text-slate-400" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight">Profile Not Found</h2>
        <p className="text-slate-500 mt-2">We couldn't link your account to a student record.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-[#002D50] text-white flex items-center justify-center text-3xl font-black shadow-2xl">
            {studentProfile.firstName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight dark:text-white leading-none">{studentProfile.fullName}</h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full border border-blue-500/20">Student Portal</span>
              <span className="text-[10px] font-mono text-slate-400">ID: {studentProfile.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Bell size={16} className="text-blue-500" /> Notifications
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.title}</p>
              <h3 className="text-xl font-black mt-0.5 tracking-tight dark:text-white">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Progress Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
            <header className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Learning Curve</h3>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">Goal: Functional Independence</p>
              </div>
              <TrendingUp className="text-blue-600" size={24} />
            </header>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_PROGRESS}>
                  <defs>
                    <linearGradient id="curveColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#curveColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Timetable Placeholder */}
             <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 mb-6">
                  <Clock size={16} /> Daily Timetable
                </h3>
                <div className="space-y-4">
                  {[
                    { time: '08:30', task: 'Morning Circle & Greeting', active: true },
                    { time: '09:30', task: 'ABA Session: Communication', active: false },
                    { time: '10:30', task: 'Outdoor Play & Sensory', active: false },
                    { time: '11:30', task: 'Independent Lunch Skills', active: false }
                  ].map((item, idx) => (
                    <div key={idx} className={`flex items-center gap-4 p-4 rounded-2xl border ${item.active ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-950 border-transparent'}`}>
                       <span className={`font-mono text-xs font-bold ${item.active ? 'text-blue-600' : 'text-slate-400'}`}>{item.time}</span>
                       <p className="text-[11px] font-black uppercase tracking-tight">{item.task}</p>
                    </div>
                  ))}
                </div>
             </div>

             {/* Medical / IEP Quick View */}
             <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-2 mb-6">
                  <HeartPulse size={16} /> Medical & Clinical
                </h3>
                <div className="space-y-6">
                   <div className="p-5 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                      <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-2">Diagnosis</p>
                      <p className="text-xs font-bold leading-relaxed">{studentProfile.diagnosis || 'No record.'}</p>
                   </div>
                   <div className="space-y-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">IEP Status</p>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                         <span>Goal Mastery</span>
                         <span className="text-blue-600">6/10 Targets</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-600 w-[60%]"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Behavior & Social History */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl space-y-8 relative overflow-hidden group">
             <div className="absolute -right-10 -top-10 text-white/5 group-hover:scale-125 transition-transform duration-1000">
                <BookOpen size={180} />
             </div>
             <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-400 mb-6">Social Progress Notes</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-500">Social History</p>
                    <p className="text-sm font-medium leading-relaxed italic">"{studentProfile.socialHistory || 'Standard social integration profile.'}"</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-slate-500">Target Behaviors</p>
                    <div className="flex flex-wrap gap-2">
                       {studentProfile.targetBehaviors?.split(',').map((tag, i) => (
                         <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">{tag.trim()}</span>
                       )) || 'None noted.'}
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Parent Alerts / Newsletters */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-6">
                <MessageSquare size={16} /> Community Alerts
             </h3>
             <div className="space-y-4">
                {[
                  { title: 'New Term Dates Released', date: 'Oct 12', type: 'Newsletter' },
                  { title: 'Therapeutic Swim Day', date: 'Oct 15', type: 'Alert' },
                  { title: 'Staff Training: ABA Phase 2', date: 'Oct 18', type: 'Update' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                       {item.type === 'Alert' ? <Bell size={18} className="text-amber-500" /> : <ClipboardList size={18} className="text-blue-500" />}
                    </div>
                    <div>
                       <p className="text-[11px] font-black uppercase tracking-tight">{item.title}</p>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-mono text-slate-400">{item.date}</span>
                          <span className="text-[8px] font-black uppercase text-blue-500">{item.type}</span>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
             <button className="w-full mt-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all">
                Archive Database
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
