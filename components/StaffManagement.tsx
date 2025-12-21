
import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  ChevronRight, 
  Search, 
  X, 
  Plus, 
  Loader2, 
  LayoutGrid, 
  List, 
  UserCircle, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Wallet, 
  Mail, 
  Phone,
  User as UserIcon,
  Globe,
  Edit2,
  Save,
  CheckCircle2,
  School
} from 'lucide-react';
import { Staff } from '../types';

export const StaffManagement: React.FC = () => {
  const { addStaff, updateStaff, staff, settings, notify } = useStore();
  const [activeSubTab, setActiveSubTab] = useState<'administration' | 'general'>('administration');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'personal' | 'payroll'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Staff>>({});

  // Form State
  const [staffForm, setStaffForm] = useState<Partial<Staff>>({ 
    firstName: '',
    lastName: '',
    dob: '',
    nationality: 'Zimbabwean',
    nationalId: '',
    passportNumber: '',
    gender: 'Male',
    address: '',
    position: settings?.positions?.[0] || '',
    email: '',
    phone: '',
    role: 'SPECIALIST',
    assignedClasses: []
  });

  const handleClassToggle = (cName: string) => {
    const current = staffForm.assignedClasses || [];
    if (current.includes(cName)) {
      setStaffForm({...staffForm, assignedClasses: current.filter(c => c !== cName)});
    } else {
      setStaffForm({...staffForm, assignedClasses: [...current, cName]});
    }
  };

  const handleEditClassToggle = (cName: string) => {
    const current = editForm.assignedClasses || [];
    if (current.includes(cName)) {
      setEditForm({...editForm, assignedClasses: current.filter(c => c !== cName)});
    } else {
      setEditForm({...editForm, assignedClasses: [...current, cName]});
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const id = `STAFF-${Math.floor(100 + Math.random() * 900)}`;
      const role: Staff['role'] = activeSubTab === 'administration' ? 'ADMIN_SUPPORT' : 'SPECIALIST';
      await addStaff({ ...staffForm, id, role } as Staff);
      setIsAdding(false);
      setStaffForm({ firstName: '', lastName: '', gender: 'Male', position: settings?.positions?.[0], role: 'SPECIALIST', nationality: 'Zimbabwean', assignedClasses: [] });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedStaff) return;
    setIsSubmitting(true);
    try {
      await updateStaff(selectedStaff.id, editForm);
      setSelectedStaff({ ...selectedStaff, ...editForm });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = (staff || []).filter(s => {
    const isCorrectType = activeSubTab === 'administration' 
      ? (s.role === 'ADMIN_SUPPORT' || s.role === 'SUPER_ADMIN')
      : (s.role === 'SPECIALIST');
    
    const fullName = s.fullName.toLowerCase();
    const search = searchTerm.toLowerCase();
    return isCorrectType && (fullName.includes(search));
  });

  const getInitials = (s: Staff) => {
    if (s.firstName && s.lastName) return `${s.firstName[0]}${s.lastName[0]}`;
    return s.fullName.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const startEditing = () => {
    if (!selectedStaff) return;
    setEditForm(selectedStaff);
    setIsEditing(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black tracking-tight uppercase text-black dark:text-white leading-none">STAFF LIST</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-3 italic">View and manage all school staff.</p>
      </header>

      <div className="flex items-center gap-2 border-b-2 border-slate-300 dark:border-slate-800">
        <button 
          onClick={() => { setActiveSubTab('administration'); setSearchTerm(''); }}
          className={`px-8 py-5 text-xs font-black uppercase tracking-[0.2em] border-b-4 transition-all ${activeSubTab === 'administration' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Administration
        </button>
        <button 
          onClick={() => { setActiveSubTab('general'); setSearchTerm(''); }}
          className={`px-8 py-5 text-xs font-black uppercase tracking-[0.2em] border-b-4 transition-all ${activeSubTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Teachers & Specialists
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="relative w-full md:w-96 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-950 rounded-xl text-xs font-bold border-2 border-slate-300 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:uppercase" 
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="bg-slate-50 dark:bg-slate-800 p-1 rounded-xl flex gap-1 mr-2 border-2 border-slate-300 dark:border-slate-700">
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={18} /></button>
            <button onClick={() => setViewMode('cards')} className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={18} /></button>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#002D50] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} /> Add Staff
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-black dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-800">
                <tr>
                  <th className="px-8 py-5">Full Name</th>
                  <th className="px-8 py-5">Birth Date</th>
                  <th className="px-8 py-5">Assigned Classes</th>
                  <th className="px-8 py-5">Job Title</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {(filteredStaff || []).length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No staff records found.</td></tr>
                ) : filteredStaff.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-blue-900/10 cursor-pointer group" onClick={() => { setSelectedStaff(s); setActiveProfileTab('personal'); setIsEditing(false); }}>
                    <td className="px-8 py-5"><div className="flex items-center gap-4"><div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-black dark:text-white border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] font-black">{getInitials(s)}</div><p className="font-bold text-sm dark:text-white uppercase tracking-tight">{s.fullName}</p></div></td>
                    <td className="px-8 py-5 text-xs font-mono font-bold text-slate-500">{s.dob}</td>
                    <td className="px-8 py-5">
                       <div className="flex flex-wrap gap-1">
                          {s.assignedClasses?.length > 0 ? s.assignedClasses.map(c => (
                            <span key={c} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[7px] font-black uppercase border border-blue-100">{c}</span>
                          )) : <span className="text-[7px] font-black text-slate-300">NO CLASSES</span>}
                       </div>
                    </td>
                    <td className="px-8 py-5"><span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50">{s.position}</span></td>
                    <td className="px-8 py-5 text-right"><ChevronRight size={18} className="ml-auto text-slate-400 group-hover:text-blue-600 transition-colors" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(filteredStaff || []).map(s => (
              <div key={s.id} className="bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500 hover:-translate-y-1 transition-all group cursor-pointer" onClick={() => { setSelectedStaff(s); setActiveProfileTab('personal'); setIsEditing(false); }}>
                <div className="flex items-center justify-between mb-6"><div className="w-12 h-12 rounded-2xl bg-[#002D50] text-white flex items-center justify-center font-black text-lg uppercase">{getInitials(s)}</div><div className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50">Active</div></div>
                <h3 className="font-black text-sm dark:text-white uppercase tracking-tight mb-1">{s.fullName}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{s.position}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {s.assignedClasses?.map(c => <span key={c} className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-900 rounded text-[7px] font-black text-blue-600 border border-slate-200 dark:border-slate-800 uppercase">{c}</span>)}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800"><span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{s.id}</span><ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-700">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsAdding(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-700 max-h-[90vh] overflow-y-auto sidebar-scrollbar border-2 border-slate-300 dark:border-slate-800">
            <div className="p-6 border-b-2 border-slate-300 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="font-black text-sm uppercase tracking-widest text-black dark:text-white">Add Staff Member</h3>
              <button disabled={isSubmitting} onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleStaffSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-slate-400">First Name</label><input required placeholder="First Name" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 outline-none text-sm font-bold focus:border-blue-500 transition-all placeholder:font-normal" onChange={e => setStaffForm({...staffForm, firstName: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-slate-400">Surname</label><input required placeholder="Surname" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 outline-none text-sm font-bold focus:border-blue-500 transition-all placeholder:font-normal" onChange={e => setStaffForm({...staffForm, lastName: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-slate-400">Birth Date</label><input type="date" required className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 outline-none text-sm font-bold focus:border-blue-500 transition-all" onChange={e => setStaffForm({...staffForm, dob: e.target.value})} /></div>
                  
                  {activeSubTab === 'general' && (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-slate-400">Assigned Classes</label>
                       <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border-2 border-slate-300 dark:border-slate-800 max-h-[120px] overflow-y-auto sidebar-scrollbar flex flex-wrap gap-2">
                          {(settings?.classes || []).map(c => (
                            <button 
                              key={c}
                              type="button"
                              onClick={() => handleClassToggle(c)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${staffForm.assignedClasses?.includes(c) ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 border-2 border-slate-300 dark:border-slate-800'}`}
                            >
                               {c}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-slate-400">ID / Passport Number</label>
                    <input 
                      required 
                      placeholder="Enter ID or Passport"
                      className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 outline-none text-sm font-bold focus:border-blue-500 transition-all placeholder:font-normal" 
                      onChange={e => setStaffForm(staffForm.nationality === 'Zimbabwean' ? {...staffForm, nationalId: e.target.value} : {...staffForm, passportNumber: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-slate-400">Phone Number</label><input required placeholder="+263..." className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 outline-none text-sm font-bold focus:border-blue-500 transition-all placeholder:font-normal" onChange={e => setStaffForm({...staffForm, phone: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-slate-400">Email Address</label><input type="email" required placeholder="staff@school.com" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 outline-none text-sm font-bold focus:border-blue-500 transition-all placeholder:font-normal" onChange={e => setStaffForm({...staffForm, email: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-black dark:text-slate-400">Job Title</label><select required value={staffForm.position} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 outline-none text-sm font-bold cursor-pointer focus:border-blue-500 transition-all" onChange={e => setStaffForm({...staffForm, position: e.target.value})}>{(settings?.positions || []).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#002D50] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Staff Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
