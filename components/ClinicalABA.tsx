
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  ChevronRight, 
  X, 
  Search, 
  User, 
  Calendar, 
  Loader2, 
  ArrowLeft, 
  ClipboardList, 
  AlertCircle,
  Save,
  Check,
  History,
  Plus,
  Users,
  FileEdit,
  BarChart3,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  // Added Activity icon to fix "Cannot find name 'Activity'" error
  Activity
} from 'lucide-react';
import { Student, MilestoneRecord } from '../types';

const calculateAgeMonths = (dob: string) => {
  if (!dob) return 0;
  const d = new Date(dob);
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
};

export const ClinicalABA: React.FC = () => {
  const { students, selectedStudentIdForLog, setSelectedStudentIdForLog, saveMilestoneRecord, milestoneRecords, milestoneTemplates } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [checkedFlags, setCheckedFlags] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // History Details State
  const [viewingRecord, setViewingRecord] = useState<MilestoneRecord | null>(null);
  const [detailsTab, setDetailsTab] = useState<'success' | 'failure'>('success');

  const selectedStudent = students.find(s => s.id === selectedStudentIdForLog);
  const activeTemplate = milestoneTemplates.find(t => t.id === activeTemplateId);

  const history = useMemo(() => {
    return (milestoneRecords || [])
      .filter(r => r.studentId === selectedStudentIdForLog)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [milestoneRecords, selectedStudentIdForLog]);

  const toggleItem = (id: string) => {
    const next = new Set(checkedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedItems(next);
  };

  const toggleFlag = (id: string) => {
    const next = new Set(checkedFlags);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedFlags(next);
  };

  const handleSave = async () => {
    if (!selectedStudent || !activeTemplate) return;
    setIsSaving(true);
    try {
      const sections = activeTemplate.sections.map((s, sIdx) => ({
        title: s.title,
        items: s.items.map((text, iIdx) => ({
          id: `${sIdx}-${iIdx}`,
          text,
          checked: checkedItems.has(`${sIdx}-${iIdx}`)
        }))
      }));

      const redFlags = activeTemplate.redFlags.map((text, idx) => ({
        id: `flag-${idx}`,
        text,
        checked: checkedFlags.has(`flag-${idx}`)
      }));

      const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);
      const checkedCount = checkedItems.size;

      await saveMilestoneRecord({
        studentId: selectedStudent.id,
        ageCategory: activeTemplate.label,
        sections,
        redFlags,
        overallPercentage: Math.round((checkedCount / (totalItems || 1)) * 100)
      });
      
      setActiveTemplateId(null);
      setCheckedItems(new Set());
      setCheckedFlags(new Set());
      setActiveTab('history');
    } finally {
      setIsSaving(false);
    }
  };

  const successes = useMemo(() => {
    if (!viewingRecord) return [];
    return viewingRecord.sections.flatMap(s => s.items.filter(i => i.checked).map(i => ({ ...i, section: s.title })));
  }, [viewingRecord]);

  const failures = useMemo(() => {
    if (!viewingRecord) return [];
    return viewingRecord.sections.flatMap(s => s.items.filter(i => !i.checked).map(i => ({ ...i, section: s.title })));
  }, [viewingRecord]);

  const flaggedIssues = useMemo(() => {
    if (!viewingRecord) return [];
    return viewingRecord.redFlags.filter(f => f.checked);
  }, [viewingRecord]);

  if (!selectedStudent) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header>
          <h1 className="text-3xl font-black text-black dark:text-white leading-none uppercase">CHECK PROGRESS</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Choose a person to start a checkup or see history.</p>
        </header>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-4 sticky top-0 z-30">
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 rounded-xl text-xs font-bold border-2 border-slate-300 dark:border-slate-800 dark:text-white focus:border-blue-500 outline-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.filter(s => s.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
            <button 
              key={student.id} 
              onClick={() => setSelectedStudentIdForLog(student.id)}
              className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 p-6 rounded-[2rem] text-left hover:border-blue-500 hover:shadow-xl transition-all active:scale-95 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-black text-lg border-2 border-blue-100 dark:border-blue-800 uppercase">
                  {student.fullName[0]}
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">#{student.id}</span>
              </div>
              <h3 className="font-black text-sm text-black dark:text-white uppercase tracking-tight truncate">{student.fullName}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{student.assignedClass || 'Unassigned'}</p>
              <div className="mt-6 pt-4 border-t-2 border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase group-hover:translate-x-1 transition-transform flex items-center gap-1">Select <ChevronRight size={14} /></span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setSelectedStudentIdForLog(null); setActiveTemplateId(null); }}
            className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-xl text-slate-400 hover:text-black dark:hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight">{selectedStudent.fullName}</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">
              {calculateAgeMonths(selectedStudent.dob)} Months Old • {selectedStudent.assignedClass}
            </p>
          </div>
        </div>

        {!activeTemplateId && (
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-300 dark:border-slate-800">
             <button 
              onClick={() => setActiveTab('new')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
             >
               <Plus size={14} /> New Check
             </button>
             <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
             >
               <History size={14} /> Records List
             </button>
          </div>
        )}
      </header>

      {activeTemplateId && activeTemplate ? (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500 pb-20">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
            <header className="p-8 border-b-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button onClick={() => setActiveTemplateId(null)} className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"><X size={20} /></button>
                <div>
                  <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">{activeTemplate.label}</h2>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Mark skills as seen</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Score</p>
                 <p className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">{Math.round((checkedItems.size / (activeTemplate.sections.reduce((a,s)=>a+s.items.length,0) || 1)) * 100)}%</p>
              </div>
            </header>

            <div className="p-8 space-y-10">
              {activeTemplate.sections.map((section, sIdx) => (
                <section key={section.title} className="space-y-4">
                  <h3 className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full w-fit border border-blue-100 dark:border-blue-800">{section.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.items.map((item, iIdx) => {
                      const id = `${sIdx}-${iIdx}`;
                      return (
                        <button 
                          key={id} 
                          onClick={() => toggleItem(id)}
                          className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left ${checkedItems.has(id) ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-950/20' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-blue-400'}`}
                        >
                          <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${checkedItems.has(id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700'}`}>
                            {checkedItems.has(id) && <Check size={14} strokeWidth={4} />}
                          </div>
                          <span className={`text-xs font-bold ${checkedItems.has(id) ? 'text-black dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}

              <section className="bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-100 dark:border-rose-900/50 rounded-[2.5rem] p-10 space-y-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="text-rose-600" size={24} />
                  <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">Red Flags (Watch Carefully)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeTemplate.redFlags.map((flag, idx) => {
                    const id = `flag-${idx}`;
                    return (
                      <button 
                        key={id} 
                        onClick={() => toggleFlag(id)}
                        className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left ${checkedFlags.has(id) ? 'bg-rose-100 border-rose-500 shadow-md' : 'bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-800 hover:border-rose-400'}`}
                      >
                        <div className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${checkedFlags.has(id) ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white dark:bg-slate-800 border-rose-200 dark:border-slate-700'}`}>
                          {checkedFlags.has(id) && <X size={14} strokeWidth={4} />}
                        </div>
                        <span className={`text-xs font-bold ${checkedFlags.has(id) ? 'text-rose-900 dark:text-rose-200' : 'text-rose-400 dark:text-rose-500/50'}`}>{flag}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <footer className="p-8 border-t-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-12 py-5 bg-black dark:bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Progress Records</>}
              </button>
            </footer>
          </div>
        </div>
      ) : activeTab === 'new' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in slide-in-from-left duration-500">
          {milestoneTemplates.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl text-slate-400 font-bold uppercase tracking-widest">
               No checklist templates found in database.
            </div>
          ) : milestoneTemplates.map((cat) => {
             return (
               <button 
                key={cat.id}
                onClick={() => { setActiveTemplateId(cat.id); setCheckedItems(new Set()); setCheckedFlags(new Set()); }}
                className={`p-6 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 text-left rounded-3xl transition-all hover:shadow-xl active:scale-95 relative overflow-hidden group`}
               >
                 <h3 className="font-black text-black dark:text-white uppercase tracking-tight text-lg mb-2">{cat.label}</h3>
                 <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">System category node checkup.</p>
                 <div className="mt-6 flex items-center justify-between text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest">
                    <span>Start assessment</span>
                    <ChevronRight size={16} />
                 </div>
               </button>
             );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm animate-in slide-in-from-right duration-500">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-300 dark:border-slate-800 text-black dark:text-white font-black uppercase text-[10px] tracking-widest">
                   <tr>
                      <th className="px-8 py-5">Date Saved</th>
                      <th className="px-8 py-5">Age Group</th>
                      <th className="px-8 py-5 text-center">Mastery</th>
                      <th className="px-8 py-5 text-right">Details</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                   {history.length === 0 ? (
                     <tr><td colSpan={4} className="px-8 py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest italic">No records found.</td></tr>
                   ) : history.map(record => (
                     <tr 
                      key={record.id} 
                      className="hover:bg-slate-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group"
                      onClick={() => { setViewingRecord(record); setDetailsTab('success'); }}
                     >
                        <td className="px-8 py-6 font-bold text-sm dark:text-white">
                           <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-blue-500" />
                              {new Date(record.timestamp).toLocaleDateString()}
                           </div>
                        </td>
                        <td className="px-8 py-6"><span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black uppercase dark:text-slate-300">{record.ageCategory}</span></td>
                        <td className="px-8 py-6 text-center font-black text-blue-600 dark:text-blue-400 text-lg font-mono">{record.overallPercentage}%</td>
                        <td className="px-8 py-6 text-right"><ChevronRight size={18} className="ml-auto text-slate-300 group-hover:text-blue-600" /></td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>
      )}

      {/* History Detail Modal (Slide over) */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-500 ${viewingRecord ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
         <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setViewingRecord(null)} />
         <aside className={`absolute inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-700 ease-in-out flex flex-col ${viewingRecord ? 'translate-x-0' : 'translate-x-full'}`}>
            {viewingRecord && (
              <>
                <header className="p-8 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg uppercase">
                         {selectedStudent.fullName[0]}
                      </div>
                      <div>
                         <h3 className="font-black text-black dark:text-white uppercase tracking-tight leading-none">{viewingRecord.ageCategory} Analysis</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Saved: {new Date(viewingRecord.timestamp).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <button onClick={() => setViewingRecord(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><X size={24} /></button>
                </header>

                <div className="flex bg-slate-50 dark:bg-slate-950 border-b-2 border-slate-100 dark:border-slate-800 p-1.5 gap-1">
                   <button 
                    onClick={() => setDetailsTab('success')}
                    className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${detailsTab === 'success' ? 'bg-emerald-500 text-white shadow-lg' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                   >
                     <CheckCircle2 size={16} /> Success ({successes.length})
                   </button>
                   <button 
                    onClick={() => setDetailsTab('failure')}
                    className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${detailsTab === 'failure' ? 'bg-rose-500 text-white shadow-lg' : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'}`}
                   >
                     <XCircle size={16} /> Failure ({failures.length})
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto sidebar-scrollbar p-8">
                   {detailsTab === 'success' ? (
                     <div className="space-y-6 animate-in fade-in duration-500">
                        {successes.length === 0 ? (
                           <div className="py-20 text-center bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
                              <Activity size={48} className="mx-auto text-slate-200 mb-4" />
                              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">No observed skills recorded.</p>
                           </div>
                        ) : (
                          <div className="bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-[2rem] overflow-hidden shadow-sm">
                             <table className="w-full text-left">
                                <thead className="bg-emerald-50 dark:bg-emerald-900/20 text-[9px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-widest border-b border-emerald-100 dark:border-emerald-800">
                                   <tr>
                                      <th className="px-6 py-4">Skill Category</th>
                                      <th className="px-6 py-4">Description</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                   {successes.map((item, idx) => (
                                     <tr key={idx} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/5">
                                        <td className="px-6 py-5 align-top">
                                           <span className="text-[8px] font-black bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded uppercase">{item.section}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                           <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">{item.text}</p>
                                        </td>
                                     </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                        )}
                     </div>
                   ) : (
                     <div className="space-y-10 animate-in fade-in duration-500">
                        {failures.length === 0 && flaggedIssues.length === 0 ? (
                           <div className="py-20 text-center bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
                              <CheckCircle2 size={48} className="mx-auto text-emerald-500/20 mb-4" />
                              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">All skills achieved or not assessed.</p>
                           </div>
                        ) : (
                          <>
                            {failures.length > 0 && (
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 flex items-center gap-2 ml-2">
                                  <Clock size={14}/> Not Yet Observed
                                </h4>
                                <div className="bg-white dark:bg-slate-900 border-2 border-rose-100 dark:border-rose-900/30 rounded-[2rem] overflow-hidden shadow-sm">
                                  <table className="w-full text-left">
                                      <thead className="bg-rose-50 dark:bg-rose-900/20 text-[9px] font-black uppercase text-rose-700 dark:text-rose-400 tracking-widest border-b border-rose-100 dark:border-rose-800">
                                        <tr>
                                            <th className="px-6 py-4">Skill Category</th>
                                            <th className="px-6 py-4">Description</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {failures.map((item, idx) => (
                                          <tr key={idx} className="hover:bg-rose-50/30 dark:hover:bg-rose-900/5">
                                              <td className="px-6 py-5 align-top">
                                                <span className="text-[8px] font-black bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded uppercase">{item.section}</span>
                                              </td>
                                              <td className="px-6 py-5">
                                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">{item.text}</p>
                                              </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {flaggedIssues.length > 0 && (
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 flex items-center gap-2 ml-2">
                                  <AlertTriangle size={16}/> Warning: Red Flags Observed
                                </h4>
                                <div className="space-y-3">
                                  {flaggedIssues.map((flag, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-5 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-800 rounded-2xl">
                                       <AlertCircle className="text-rose-600 shrink-0" size={18} />
                                       <p className="text-xs font-black uppercase tracking-tight text-rose-900 dark:text-rose-200">{flag.text}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                     </div>
                   )}
                </div>

                <footer className="p-8 border-t-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Session Node Score</p>
                      <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">{viewingRecord.overallPercentage}%</p>
                   </div>
                   <button 
                    onClick={() => setViewingRecord(null)}
                    className="px-8 py-4 bg-black dark:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-slate-800 transition-all"
                   >
                     Close Terminal <ArrowRight size={14}/>
                   </button>
                </footer>
              </>
            )}
         </aside>
      </div>
    </div>
  );
};
