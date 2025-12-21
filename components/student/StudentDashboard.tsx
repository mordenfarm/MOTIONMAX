
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Calendar, DollarSign, 
  TrendingUp, History,
  Activity, Brain,
  Check, X, ChevronRight, BarChart3, AlertTriangle,
  AlertCircle
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user, students, parents, settings, milestoneRecords } = useStore();
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  
  let studentProfile = null;
  if (user?.role === 'STUDENT') {
    studentProfile = students.find(s => s.firebaseUid === user.id);
  } else if (user?.role === 'PARENT') {
    const parentProfile = parents.find(p => p.firebaseUid === user.id);
    if (parentProfile) {
      studentProfile = students.find(s => s.id === parentProfile.studentId);
    }
  }

  const studentMilestones = milestoneRecords.filter(r => r.studentId === studentProfile?.id);
  const latestMilestone = selectedHistoryItem || studentMilestones[0];

  const stats = [
    { title: 'School Term', value: settings.currentTerm, icon: Calendar, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Fees Status', value: studentProfile?.totalPaid === settings.feesAmount ? 'Fully Paid' : 'Pending', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Total Reports', value: studentMilestones.length.toString(), icon: Activity, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
    { title: 'Learning Score', value: `${studentMilestones[0]?.overallPercentage || 0}%`, icon: TrendingUp, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  ];

  if (!studentProfile) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-[#002D50] text-white flex items-center justify-center text-3xl font-black shadow-2xl">
            {studentProfile.firstName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight leading-none">{studentProfile.fullName}</h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">Student Dashboard</span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase">Student ID: {studentProfile.id}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5">
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.title}</p>
              <h3 className="text-xl font-black mt-0.5 tracking-tight text-black dark:text-white">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {latestMilestone ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-300 dark:border-slate-800 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
               <div className="p-8 bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">Development Check-in</h3>
                     <p className="text-2xl font-black uppercase tracking-tight text-black dark:text-white mt-1">{latestMilestone.ageCategory} Milestone</p>
                  </div>
                  <div className="flex items-center gap-6 bg-white dark:bg-slate-900 px-8 py-4 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 shadow-inner">
                    <div className="text-right">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Learning Score</p>
                       <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">{latestMilestone.overallPercentage}%</p>
                    </div>
                    <BarChart3 size={32} className="text-blue-500" />
                  </div>
               </div>

               <div className="p-10 space-y-12">
                  {latestMilestone.sections.map((section: any) => (
                    <section key={section.title} className="space-y-6">
                       <div className="flex items-center gap-4">
                          <h4 className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800">{section.title}</h4>
                          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {section.items.map((item: any, idx: number) => (
                            <div key={idx} className={`flex items-start gap-4 p-5 rounded-2xl border-2 ${item.checked ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
                               <div className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${item.checked ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                                  {item.checked ? <Check size={14} strokeWidth={4} /> : <X size={12} />}
                               </div>
                               <span className={`text-[13px] font-bold ${item.checked ? 'text-black dark:text-white' : 'text-slate-400 italic'}`}>{item.text}</span>
                            </div>
                          ))}
                       </div>
                    </section>
                  ))}

                  {latestMilestone.redFlags && latestMilestone.redFlags.length > 0 && (
                    <section className="bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-100 dark:border-rose-900/50 rounded-[2.5rem] p-10 space-y-8">
                       <div className="flex items-center justify-between">
                          <h5 className="text-xl font-black uppercase tracking-tight text-rose-600 dark:text-rose-400 flex items-center gap-3">
                             <AlertCircle size={28} /> Things we are watching
                          </h5>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {latestMilestone.redFlags.map((flag: any, idx: number) => (
                            <div key={idx} className={`flex items-start gap-4 p-5 rounded-2xl border-2 ${flag.checked ? 'bg-rose-100 border-rose-500 shadow-md dark:bg-rose-900/20 dark:border-rose-800' : 'bg-white dark:bg-slate-900 border-rose-50 dark:border-rose-950'}`}>
                               <div className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${flag.checked ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700'}`}>
                                  {flag.checked ? <AlertTriangle size={12} /> : <Check size={12} />}
                               </div>
                               <span className={`text-[13px] font-bold ${flag.checked ? 'text-rose-900 dark:text-rose-200' : 'text-slate-400 dark:text-slate-600'}`}>{flag.text}</span>
                            </div>
                          ))}
                       </div>
                    </section>
                  )}
               </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-[2.5rem] p-20 text-center shadow-sm">
               <Brain size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-6" />
               <h3 className="text-xl font-black uppercase text-black dark:text-white">No Report Yet</h3>
               <p className="text-slate-500 dark:text-slate-400 mt-2 italic">A developmental progress report has not been saved yet.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-300 dark:border-slate-800 p-8 shadow-sm">
             <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-6">
                <History size={16} /> Past Reports
             </h3>
             <div className="space-y-3">
                {studentMilestones.map((rec, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedHistoryItem(rec)}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${selectedHistoryItem?.id === rec.id || (!selectedHistoryItem && i === 0) ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'}`}
                  >
                    <div className="text-left">
                       <p className={`text-[11px] font-black uppercase tracking-tight ${selectedHistoryItem?.id === rec.id || (!selectedHistoryItem && i === 0) ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{rec.ageCategory}</p>
                       <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase font-bold">{new Date(rec.timestamp).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight size={18} className={selectedHistoryItem?.id === rec.id || (!selectedHistoryItem && i === 0) ? 'text-blue-600' : 'text-slate-300'} />
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
