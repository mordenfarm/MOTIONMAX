
import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { PROMPT_LEVELS } from '../constants';
import { PromptLevel, TaskStep } from '../types';
import { CheckCircle2, ChevronRight, Save, History, Plus, HeartPulse, Brain, Info, Search, User, Clock, Loader2, X, Users } from 'lucide-react';

export const ClinicalABA: React.FC = () => {
  const { students, addClinicalLog, selectedStudentIdForLog, setSelectedStudentIdForLog, user, setActiveTab } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [targetBehavior, setTargetBehavior] = useState('');
  const [method, setMethod] = useState<'Forward Chaining' | 'Backward Chaining' | 'Total Task'>('Forward Chaining');
  const [isSaving, setIsSaving] = useState(false);
  
  const [steps, setSteps] = useState<TaskStep[]>([
    { id: '1', description: 'Approach table and sit appropriately', promptLevel: '-' },
    { id: '2', description: 'Identify and select target materials', promptLevel: '-' },
    { id: '3', description: 'Initiate task independently', promptLevel: '-' },
    { id: '4', description: 'Maintain focus for duration of task', promptLevel: '-' },
    { id: '5', description: 'Pack away and clear workspace', promptLevel: '-' },
  ]);

  const selectedStudent = students.find(s => s.id === selectedStudentIdForLog);

  const filteredSuggestions = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 6);

  // Quick access: show max 5 students (prioritize assigned ones if possible)
  const quickAccessStudents = students.slice(0, 5);

  const handleStepStatus = (id: string, status: PromptLevel) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, promptLevel: status } : s));
  };

  const calculateScore = () => {
    const total = steps.length;
    const independents = steps.filter(s => s.promptLevel === '+').length;
    return Math.round((independents / total) * 100);
  };

  const handleSaveSession = async () => {
    if (!selectedStudent) return;
    setIsSaving(true);
    try {
      await addClinicalLog({
        studentId: selectedStudent.id,
        date: new Date().toISOString(),
        targetBehavior: targetBehavior || 'Daily Session',
        method,
        steps,
        independenceScore: calculateScore(),
        staffId: user?.id || 'system'
      });
      setTargetBehavior('');
      setSelectedStudentIdForLog(null);
    } finally {
      setIsSaving(false);
    }
  };

  const addStep = () => {
    const newId = (steps.length + 1).toString();
    setSteps([...steps, { id: newId, description: 'Enter next step here...', promptLevel: '-' }]);
  };

  if (!selectedStudent) {
    return (
      <div className="max-w-5xl mx-auto py-12 animate-in fade-in duration-700">
        <header className="text-center mb-12">
           <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-600">
             <Brain size={40} />
           </div>
           <h1 className="text-3xl font-black uppercase tracking-tight dark:text-white">Student Session Logs</h1>
           <p className="text-slate-500 mt-2 font-medium">Search for a student or select one below to start a new daily log.</p>
        </header>

        <div className="relative group mb-16">
           <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
           <input 
            type="text" 
            placeholder="Type student name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-xl text-lg font-bold outline-none focus:border-blue-500/50 transition-all dark:text-white"
           />
           
           {searchTerm && (
             <div className="absolute top-full left-0 w-full mt-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-20 animate-in slide-in-from-top-4 duration-300">
                {filteredSuggestions.length > 0 ? filteredSuggestions.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => { setSelectedStudentIdForLog(s.id); setSearchTerm(''); }}
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#002D50] text-white flex items-center justify-center font-black text-xs uppercase">{s.firstName[0]}{s.lastName[0]}</div>
                      <div className="text-left">
                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{s.fullName}</p>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{s.id}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                  </button>
                )) : (
                  <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic">No matching students found.</div>
                )}
             </div>
           )}
        </div>

        <div className="space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Quick Select Students</h2>
              <button 
                onClick={() => setActiveTab('my-students')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Users size={14} /> View All Students
              </button>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {quickAccessStudents.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setSelectedStudentIdForLog(s.id)}
                  className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group"
                >
                   <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-[#002D50] group-hover:text-white flex items-center justify-center mx-auto mb-4 text-xl font-black transition-colors">
                      {s.firstName[0]}{s.lastName[0]}
                   </div>
                   <p className="font-black text-xs uppercase tracking-tight text-slate-900 dark:text-white truncate">{s.fullName}</p>
                   <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">{s.id}</p>
                </button>
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSelectedStudentIdForLog(null)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#002D50] text-white flex items-center justify-center text-2xl font-black uppercase shadow-2xl">
              {selectedStudent.firstName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600">Active Session Log</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight dark:text-white leading-none">{selectedStudent.fullName}</h1>
              <p className="text-[10px] font-mono text-slate-400 mt-2">STUDENT_ID: {selectedStudent.id}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <History size={16} className="text-blue-500" /> Past Logs
          </button>
          <button 
            onClick={handleSaveSession}
            disabled={isSaving}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save and Finish</>}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Metadata Controls */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lesson or Target Goal</label>
                <input 
                  type="text" 
                  value={targetBehavior}
                  onChange={(e) => setTargetBehavior(e.target.value)}
                  placeholder="What are we working on today?"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Teaching Method</label>
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option>Forward Chaining</option>
                  <option>Backward Chaining</option>
                  <option>Total Task</option>
                </select>
             </div>
          </div>

          {/* Task Steps */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                   <Clock size={16} /> Lesson Step List
                </h3>
                <span className="text-[9px] font-mono text-emerald-500 font-black tracking-widest">REALTIME_SYNC</span>
             </div>
             <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {steps.map((step, idx) => (
                  <div key={step.id} className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-slate-50/50 dark:hover:bg-blue-900/10 transition-all group">
                     <div className="flex items-start gap-4 flex-1">
                        <span className="mt-1 w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-black flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          {idx + 1}
                        </span>
                        <input 
                          type="text" 
                          value={step.description}
                          onChange={(e) => setSteps(steps.map(s => s.id === step.id ? { ...s, description: e.target.value } : s))}
                          className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 dark:text-slate-200 w-full focus:ring-0 outline-none"
                        />
                     </div>
                     <div className="flex flex-wrap gap-1.5">
                        {PROMPT_LEVELS.map(p => (
                          <button
                            key={p.key}
                            onClick={() => handleStepStatus(step.id, p.key as PromptLevel)}
                            title={p.label}
                            className={`
                              w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black border-2 transition-all active:scale-90
                              ${step.promptLevel === p.key 
                                ? `${p.color} border-blue-500 shadow-lg scale-110 z-10` 
                                : 'bg-white dark:bg-slate-900 text-slate-300 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                              }
                            `}
                          >
                            {p.key}
                          </button>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
             <button 
              onClick={addStep}
              className="w-full p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all flex items-center justify-center gap-3 border-t border-dashed border-slate-200 dark:border-slate-800"
             >
                <Plus size={16} /> Add Another Step
             </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           {/* Independence Score Visualization */}
           <div className="bg-[#002D50] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden text-center">
              <div className="absolute inset-0 opacity-10 bg-grid-pattern"></div>
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-8">Learning Progress</p>
                 <div className="relative inline-block">
                    <svg className="w-48 h-48 transform -rotate-90">
                       <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                       <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={552} 
                        strokeDashoffset={552 - (552 * calculateScore()) / 100}
                        strokeLinecap="round"
                        className="text-blue-400 transition-all duration-1000 ease-out" 
                       />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-5xl font-black font-mono leading-none">{calculateScore()}%</span>
                       <span className="text-[8px] font-black uppercase tracking-widest text-blue-300 mt-2">Independent score</span>
                    </div>
                 </div>
                 <p className="text-[11px] text-blue-100/60 mt-8 leading-relaxed italic">
                    This shows how much the student did without help.
                 </p>
              </div>
           </div>

           {/* Legend */}
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                 <Info size={16} /> Prompting Help Guide
              </h3>
              <div className="space-y-3">
                 {PROMPT_LEVELS.map(p => (
                   <div key={p.key} className="flex items-center gap-4 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-help">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm ${p.color}`}>{p.key}</span>
                      <span className="text-[10px] font-bold uppercase tracking-tight text-slate-600 dark:text-slate-400">{p.label}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
