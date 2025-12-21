
import React, { useState, useEffect } from 'react';
import { useStore, MilestoneTemplate } from '../store/useStore';
import { 
  Save, 
  Plus, 
  Trash2, 
  DollarSign, 
  ShieldCheck, 
  Loader2, 
  Briefcase, 
  User, 
  X,
  School,
  ClipboardCheck,
  FilePlus,
  Database,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Settings as SettingsIcon,
  Info
} from 'lucide-react';

type SettingsTab = 'database' | 'finances' | 'org' | 'account';

export const SystemSettings: React.FC = () => {
  const { settings, updateSettings, updateUserProfile, user, milestoneTemplates, saveMilestoneTemplate, deleteMilestoneTemplate } = useStore();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('database');
  const [isSaving, setIsSaving] = useState(false);
  
  const [fees, setFees] = useState(settings?.feesAmount || 500);
  const [term, setTerm] = useState(settings?.currentTerm || 'Term 1');
  const [positions, setPositions] = useState(settings?.positions || []);
  const [classes, setClasses] = useState(settings?.classes || []);
  const [newPosition, setNewPosition] = useState('');
  const [newClassName, setNewClassName] = useState('');

  const [newName, setNewName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState<MilestoneTemplate | null>(null);
  const [isTemplateSaving, setIsTemplateSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await updateSettings({ feesAmount: fees, currentTerm: term, positions, classes });
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

  const saveTemplate = async () => {
    if (!editingTemplate) return;
    setIsTemplateSaving(true);
    await saveMilestoneTemplate(editingTemplate);
    setIsTemplateSaving(false);
    setEditingTemplate(null);
  };

  const addTemplate = () => {
    setEditingTemplate({
      id: `m-${Date.now()}`,
      label: 'New Age Category',
      sections: [{ title: 'Growth Area', items: ['Observed Task'] }],
      redFlags: ['Warning Sign']
    });
  };

  if (editingTemplate) {
    return (
      <div className="fixed inset-0 z-[500] bg-white dark:bg-slate-950 flex flex-col animate-in fade-in duration-500 overflow-y-auto">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 md:p-8 sticky top-0 z-20 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setEditingTemplate(null)} 
                className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-black uppercase dark:text-white leading-none">Category Editor</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Editing: {editingTemplate.label || 'New Entry'}</p>
              </div>
            </div>
            <button 
              onClick={saveTemplate}
              disabled={isTemplateSaving}
              className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
            >
              {isTemplateSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update Matrix Record</>}
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-12 pb-32 space-y-12">
          {/* Label Input Section */}
          <section className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-inner">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-4 block">Master Category Label</label>
            <input 
              value={editingTemplate.label}
              onChange={e => setEditingTemplate({...editingTemplate, label: e.target.value})}
              className="w-full px-8 py-5 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-3xl text-2xl font-black dark:text-white outline-none focus:border-blue-500 shadow-sm transition-all"
              placeholder="e.g. 6 to 12 Months"
            />
          </section>

          {/* Skill Groups Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 px-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Developmental Nodes</h3>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            </div>

            {editingTemplate.sections.map((section, sIdx) => (
              <div key={sIdx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[3.5rem] shadow-sm space-y-10 relative group border-t-8 border-t-blue-500/10">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Node Cluster Title</label>
                    <input 
                      placeholder="e.g. Gross Motor Skills..." 
                      value={section.title}
                      onChange={e => {
                        const next = [...editingTemplate.sections];
                        next[sIdx].title = e.target.value;
                        setEditingTemplate({...editingTemplate, sections: next});
                      }}
                      className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-black uppercase text-sm outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const next = editingTemplate.sections.filter((_, i) => i !== sIdx);
                      setEditingTemplate({...editingTemplate, sections: next});
                    }} 
                    className="mt-6 p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                  >
                    <Trash2 size={22}/>
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4">Observed Requirements</label>
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex gap-4 group/item">
                      <div className="w-10 h-14 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center font-mono font-black text-slate-300 text-xs border border-slate-200 dark:border-slate-800">
                        {String(iIdx + 1).padStart(2, '0')}
                      </div>
                      <input 
                        value={item}
                        onChange={e => {
                          const next = [...editingTemplate.sections];
                          next[sIdx].items[iIdx] = e.target.value;
                          setEditingTemplate({...editingTemplate, sections: next});
                        }}
                        className="flex-1 px-6 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                      />
                      <button 
                        onClick={() => {
                          const next = [...editingTemplate.sections];
                          next[sIdx].items = next[sIdx].items.filter((_, i) => i !== iIdx);
                          setEditingTemplate({...editingTemplate, sections: next});
                        }} 
                        className="p-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-all"
                      >
                        <X size={20}/>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const next = [...editingTemplate.sections];
                      next[sIdx].items.push('New Technical Observation');
                      setEditingTemplate({...editingTemplate, sections: next});
                    }} 
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-10 py-4 rounded-2xl border border-blue-100 dark:border-blue-800 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95 ml-14"
                  >
                    <Plus size={16} /> Add Task Node
                  </button>
                </div>
              </div>
            ))}
            <button 
              onClick={() => setEditingTemplate({...editingTemplate, sections: [...editingTemplate.sections, { title: 'NEW CLUSTER', items: [] }]})} 
              className="w-full py-12 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[3.5rem] text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-blue-500 hover:border-blue-500 transition-all shadow-sm"
            >
              + Initialize New Cluster
            </button>
          </section>

          {/* Red Flags Section */}
          <section className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 p-10 rounded-[3.5rem] space-y-10 shadow-sm">
            <div className="flex items-center gap-4">
               <div className="p-4 bg-rose-500 text-white rounded-3xl shadow-xl">
                  <AlertTriangle size={32}/> 
               </div>
               <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-rose-600">Observation: Red Flags</h3>
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1">Warnings for caregivers and specialists</p>
               </div>
            </div>
            
            <div className="grid gap-4">
              {editingTemplate.redFlags.map((flag, fIdx) => (
                <div key={fIdx} className="flex gap-4 group/flag">
                  <div className="w-10 h-14 bg-white/50 dark:bg-slate-950 rounded-xl flex items-center justify-center font-mono font-black text-rose-200 text-xs border border-rose-100 dark:border-rose-800">
                    !
                  </div>
                  <input 
                    value={flag}
                    onChange={e => {
                      const next = [...editingTemplate.redFlags];
                      next[fIdx] = e.target.value;
                      setEditingTemplate({...editingTemplate, redFlags: next});
                    }}
                    className="flex-1 px-6 py-4 bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-800 rounded-2xl text-sm font-bold text-rose-900 dark:text-rose-200 outline-none focus:border-rose-500 shadow-sm"
                  />
                  <button 
                    onClick={() => setEditingTemplate({...editingTemplate, redFlags: editingTemplate.redFlags.filter((_,i)=>i!==fIdx)})} 
                    className="p-3 text-rose-300 hover:text-rose-600 opacity-0 group-hover/flag:opacity-100 transition-all"
                  >
                    <X size={20}/>
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setEditingTemplate({...editingTemplate, redFlags: [...editingTemplate.redFlags, 'New Alert Protocol']})} 
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-white dark:bg-slate-950 px-10 py-4 rounded-2xl border border-rose-200 dark:border-rose-800 hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95 w-fit ml-14"
              >
                <Plus size={16} /> Add Flag Protocol
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-48 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={20} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Administrative Node</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase text-black dark:text-white leading-none">System Settings</h1>
          <p className="text-sm text-slate-500 font-medium mt-3 italic">Manage clinical matrices, financial nodes, and organizational structures.</p>
        </div>
      </header>

      {/* Grid tabs for mobile visibility + High-contrast boundaries */}
      <div className="grid grid-cols-2 md:flex bg-slate-100 dark:bg-slate-900 p-2 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 gap-2">
         {[
           { id: 'database', label: 'Clinical Database', icon: <Database size={16}/> },
           { id: 'finances', label: 'Financial Records', icon: <DollarSign size={16}/> },
           { id: 'org', label: 'School Matrix', icon: <School size={16}/> },
           { id: 'account', label: 'Admin Access', icon: <User size={16}/> }
         ].map(tab => (
           <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-4 md:py-5 rounded-[1.5rem] flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 text-[10px] font-black uppercase tracking-[0.1em] transition-all border-2 ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xl border-blue-500' : 'text-slate-500 hover:text-slate-900 border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
           >
             {tab.icon} {tab.label}
           </button>
         ))}
      </div>

      <div className="animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-14 rounded-[4rem] shadow-sm min-h-[600px] border-t-8 border-t-slate-100 dark:border-t-slate-800">
          {activeTab === 'database' && (
            <div className="space-y-12 animate-in fade-in">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-black dark:text-white">Checklist Library</h3>
                    <p className="text-sm text-slate-500 font-medium mt-2">Manage the technical forms used for student progress audits.</p>
                  </div>
                  <button 
                    onClick={addTemplate}
                    className="h-16 px-10 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/20 active:scale-95"
                  >
                    <FilePlus size={20} /> Create New Category
                  </button>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {milestoneTemplates.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-slate-50 dark:bg-slate-950 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                       <Database size={64} className="mx-auto text-slate-200 mb-6" />
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">No checklists found in this node.<br />Please synchronize or create a new entry.</p>
                    </div>
                  ) : milestoneTemplates.map(template => (
                    <div key={template.id} className="group relative bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 p-10 rounded-[3rem] hover:border-blue-500 hover:shadow-2xl transition-all cursor-pointer overflow-hidden" onClick={() => setEditingTemplate(template)}>
                       <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <ChevronRight size={32} className="text-blue-500" />
                       </div>
                       <div className="flex items-start justify-between mb-10">
                          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl text-blue-600 shadow-lg border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                             <ClipboardCheck size={32} />
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); if(window.confirm("Purge technical record?")) deleteMilestoneTemplate(template.id); }} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={24}/></button>
                       </div>
                       <h4 className="text-xl font-black uppercase text-slate-900 dark:text-white mb-6 leading-tight group-hover:text-blue-600 transition-colors">{template.label}</h4>
                       <div className="flex items-center gap-8">
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Clusters</p>
                             <p className="text-sm font-black dark:text-slate-300">{template.sections.length}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Flags</p>
                             <p className="text-sm font-black dark:text-slate-300">{template.redFlags.length}</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'finances' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-in fade-in">
              <div className="space-y-12">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-emerald-50 dark:bg-emerald-900/30 rounded-[2rem] text-emerald-600 border border-emerald-100 shadow-sm"><DollarSign size={40}/></div>
                  <div>
                      <h3 className="text-3xl font-black uppercase text-black dark:text-white leading-none">Tuition Matrix</h3>
                      <p className="text-sm text-slate-500 font-medium mt-2">Configure school fees for the current node cycle.</p>
                  </div>
                </div>
                <div className="space-y-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-4">Global Fees Node ($ USD)</label>
                    <input type="number" value={fees} onChange={e => setFees(Number(e.target.value))} className="w-full px-10 py-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-3xl text-3xl font-black outline-none dark:text-white focus:border-blue-500 transition-all shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-4">Current Academic Term</label>
                    <input type="text" value={term} onChange={e => setTerm(e.target.value)} className="w-full px-10 py-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-3xl text-3xl font-black outline-none dark:text-white focus:border-blue-500 transition-all shadow-inner" />
                  </div>
                </div>
              </div>
              <div className="bg-[#002D50] rounded-[4rem] p-16 text-white shadow-2xl relative overflow-hidden flex flex-col justify-center border-4 border-blue-400/10 group">
                <DollarSign className="absolute -right-16 -bottom-16 text-white/5 group-hover:scale-110 transition-transform duration-1000" size={400} />
                <h3 className="text-5xl font-black uppercase tracking-tighter mb-8 relative z-10 leading-none">Financial <br /> Infrastructure</h3>
                <p className="text-blue-100 font-medium italic text-xl leading-relaxed relative z-10 opacity-80">
                  "Adjustments made here are synchronized across all student ledgers and billing terminals instantly."
                </p>
                <div className="mt-12 relative z-10 flex items-center gap-4">
                   <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">System Ready for Update</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'org' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-in fade-in">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-12 rounded-[3.5rem] space-y-12 shadow-inner">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl text-blue-600 shadow-lg border border-slate-100 dark:border-slate-800"><Briefcase size={32}/></div>
                  <h3 className="text-2xl font-black uppercase text-black dark:text-white">Staff Roles Node</h3>
                </div>
                <div className="space-y-8">
                   <div className="flex gap-4">
                     <input type="text" value={newPosition} onChange={e => setNewPosition(e.target.value)} placeholder="Role title..." className="flex-1 px-8 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-bold outline-none shadow-sm focus:border-blue-500 transition-all" />
                     <button onClick={() => { if(newPosition && !positions.includes(newPosition)) setPositions([...positions, newPosition]); setNewPosition(''); }} className="px-10 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"><Plus size={32} /></button>
                   </div>
                   <div className="grid gap-4 max-h-[350px] overflow-y-auto pr-6 sidebar-scrollbar">
                      {positions.map(pos => (
                        <div key={pos} className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl group shadow-sm hover:border-blue-500 transition-all">
                           <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{pos}</span>
                           <button onClick={() => setPositions(positions.filter(p => p !== pos))} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20}/></button>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-12 rounded-[3.5rem] space-y-12 shadow-inner">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl text-emerald-600 shadow-lg border border-slate-100 dark:border-slate-800"><School size={32}/></div>
                  <h3 className="text-2xl font-black uppercase text-black dark:text-white">Class Allocation</h3>
                </div>
                <div className="space-y-8">
                   <div className="flex gap-4">
                      <input type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="Class name..." className="flex-1 px-8 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl text-sm font-bold outline-none shadow-sm focus:border-emerald-500 transition-all" />
                      <button onClick={() => { if(newClassName && !classes.includes(newClassName)) setClasses([...classes, newClassName]); setNewClassName(''); }} className="px-10 bg-emerald-600 text-white rounded-3xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95"><Plus size={32} /></button>
                   </div>
                   <div className="grid gap-4 max-h-[350px] overflow-y-auto pr-6 sidebar-scrollbar">
                     {classes.map(c => (
                       <div key={c} className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm hover:border-emerald-500 transition-all group">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{c}</span>
                          <button onClick={() => setClasses(classes.filter(cl => cl !== c))} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X size={20}/></button>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
              <form onSubmit={handleUpdateProfile} className="space-y-16">
                <div className="flex flex-col items-center text-center">
                   <div className="w-40 h-40 rounded-[4rem] bg-blue-600 text-white flex items-center justify-center text-6xl font-black shadow-2xl mb-10 border-[12px] border-blue-500/10 uppercase ring-4 ring-white dark:ring-slate-950">
                      {user?.name?.[0]}
                   </div>
                   <h3 className="text-4xl font-black uppercase text-black dark:text-white tracking-tight">Admin Profile Node</h3>
                   <p className="text-[11px] text-slate-500 font-bold mt-4 uppercase tracking-[0.5em]">{user?.role.replace('_', ' ')} SECURITY VERIFIED</p>
                </div>

                <div className="space-y-10 bg-slate-50 dark:bg-slate-950 p-12 rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-inner">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Terminal Display Name</label>
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-8 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-lg font-bold dark:text-white outline-none focus:border-blue-500 shadow-sm transition-all" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Secure Password Override</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-8 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-lg font-bold dark:text-white outline-none focus:border-blue-500 shadow-sm transition-all" />
                  </div>
                  <button type="submit" disabled={profileSaving} className="w-full py-6 bg-black dark:bg-blue-600 text-white rounded-[2rem] text-[13px] font-black uppercase tracking-[0.2em] shadow-2xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-4">
                    {profileSaving ? <Loader2 className="animate-spin" size={24} /> : <><SettingsIcon size={24} /> Synchronize Admin Profile</>}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Global Bottom Save Bar - Sticky */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t-2 border-slate-200 dark:border-slate-800 p-8 z-40 animate-in slide-in-from-bottom duration-700 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
         <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-slate-400 group">
               <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 border border-blue-100 group-hover:rotate-12 transition-transform">
                  <Info size={24} />
               </div>
               <div>
                  <p className="text-[11px] font-black uppercase tracking-widest leading-none dark:text-slate-200">Local node cache detected</p>
                  <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase">Changes will be deployed to global database on save</p>
               </div>
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full sm:w-auto px-16 py-6 bg-[#002D50] text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-5 hover:bg-black hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={24} /> : <><Save size={24} /> Deploy Changes to Cloud</>}
            </button>
         </div>
      </div>
    </div>
  );
};
