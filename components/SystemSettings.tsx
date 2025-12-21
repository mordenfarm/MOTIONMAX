
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  Save, 
  Plus, 
  Trash2, 
  DollarSign, 
  ShieldCheck, 
  Loader2, 
  Briefcase, 
  User, 
  Lock, 
  History, 
  X,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { settings, updateSettings, updateUserProfile, user, systemLogs } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  
  // App Settings State
  const [fees, setFees] = useState(settings.feesAmount);
  const [term, setTerm] = useState(settings.currentTerm);
  const [positions, setPositions] = useState(settings.positions);
  const [newPosition, setNewPosition] = useState('');

  // Profile Settings State
  const [newName, setNewName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await updateSettings({ feesAmount: fees, currentTerm: term, positions });
    setIsSaving(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    await updateUserProfile({ 
      name: newName !== user?.name ? newName : undefined, 
      password: newPassword ? newPassword : undefined 
    });
    setNewPassword('');
    setProfileSaving(false);
  };

  const addPosition = () => {
    if (newPosition && !positions.includes(newPosition)) {
      setPositions([...positions, newPosition]);
      setNewPosition('');
    }
  };

  const removePosition = (pos: string) => {
    setPositions(positions.filter(p => p !== pos));
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={18} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Settings</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase dark:text-white leading-none">System Terminal</h1>
          <p className="text-sm text-slate-500 font-medium mt-3">Configure global parameters and account identity.</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-8 py-4 bg-[#002D50] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Application State</>}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Main App Config */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <DollarSign size={16}/> Finance & Schedule
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">School Fee Amount ($)</label>
                  <input 
                    type="number" 
                    value={fees} 
                    onChange={e => setFees(Number(e.target.value))}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Academic Term</label>
                  <input 
                    type="text" 
                    value={term} 
                    onChange={e => setTerm(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="e.g. Term 1, 2025"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 md:pl-8 md:border-l border-slate-100 dark:border-slate-800">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Briefcase size={16}/> Organization Structure
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newPosition} 
                    onChange={e => setNewPosition(e.target.value)}
                    placeholder="New job title..."
                    className="flex-1 px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none"
                  />
                  <button onClick={addPosition} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/20"><Plus size={18} /></button>
                </div>
                <div className="space-y-2 max-h-[160px] overflow-y-auto sidebar-scrollbar pr-2">
                  {positions.map(pos => (
                    <div key={pos} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl group transition-all">
                      <span className="text-[11px] font-black uppercase tracking-tight">{pos}</span>
                      <button onClick={() => removePosition(pos)} className="text-slate-400 hover:text-rose-500 p-1"><Trash2 size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Logs Entry Button */}
          <div className="bg-[#002D50] dark:bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group overflow-hidden relative">
             <div className="absolute -right-10 -bottom-10 text-white/5 group-hover:scale-125 transition-transform duration-1000">
                <History size={200} />
             </div>
             <div className="relative z-10 max-w-lg">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-300 mb-4">Security & Logs</h3>
                <h4 className="text-3xl font-black uppercase tracking-tight leading-none mb-3">Audit Registry</h4>
                <p className="text-sm font-medium text-blue-100/70 leading-relaxed">
                   Review every terminal login, account modification, and student record creation within the global encrypted audit history.
                </p>
             </div>
             <button 
              onClick={() => setShowLogs(true)}
              className="relative z-10 min-w-[240px] px-8 py-5 bg-white text-[#002D50] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-3 active:scale-95"
             >
                Open System Logs <ArrowRight size={16} />
             </button>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="lg:col-span-4">
          <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm space-y-8 h-full flex flex-col">
            <div className="space-y-2">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><User size={16}/> Identity Config</h3>
               <p className="text-xs font-medium text-slate-500">Update your account name and terminal password.</p>
            </div>
            
            <div className="space-y-6 flex-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><User size={12}/> Display Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Lock size={12}/> New Terminal Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={profileSaving || (newName === user?.name && !newPassword)}
              className="w-full py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {profileSaving ? <Loader2 className="animate-spin" size={16} /> : 'Apply Profile Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* System Logs Slide-Up Full Screen Modal */}
      {showLogs && (
        <div className="fixed inset-0 z-[300] flex flex-col animate-in slide-in-from-bottom duration-700 bg-white dark:bg-slate-950">
           <header className="h-24 px-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600">
                    <History size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight leading-none dark:text-white">Encrypted System Logs</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Terminal v3.1_Audit_Trail
                    </p>
                 </div>
              </div>
              <button 
                onClick={() => setShowLogs(false)}
                className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
              >
                <X size={32} />
              </button>
           </header>

           <main className="flex-1 overflow-y-auto p-10 sidebar-scrollbar">
              <div className="max-w-7xl mx-auto space-y-8">
                 <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-inner">
                    <table className="w-full text-left">
                       <thead className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                          <tr>
                             <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                             <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Initiator</th>
                             <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Action Node</th>
                             <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Operation Details</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {systemLogs.length === 0 ? (
                            <tr><td colSpan={4} className="px-8 py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No history recorded in current cycle.</td></tr>
                          ) : systemLogs.map(log => (
                            <tr key={log.id} className="hover:bg-white dark:hover:bg-slate-900 transition-colors">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-3">
                                     <Clock size={14} className="text-slate-400" />
                                     <span className="text-[11px] font-mono font-bold text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-3">
                                     <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-[10px] font-black">{log.userName[0]}</div>
                                     <span className="text-xs font-black uppercase tracking-tight">{log.userName}</span>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-sm">{log.action}</span>
                               </td>
                               <td className="px-8 py-6">
                                  <p className="text-xs font-medium text-slate-500 leading-relaxed italic">"{log.details}"</p>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </main>
           
           <footer className="p-10 border-t border-slate-100 dark:border-slate-800 text-center bg-white dark:bg-slate-950">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
                 End of Encrypted Audit Stream // Cycle Alpha-One
              </p>
           </footer>
        </div>
      )}
    </div>
  );
};
