
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
  CheckCircle2
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
    position: settings.positions[0] || '',
    email: '',
    phone: '',
    role: 'SPECIALIST'
  });

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const id = `STAFF-${Math.floor(100 + Math.random() * 900)}`;
      const role: Staff['role'] = activeSubTab === 'administration' ? 'ADMIN_SUPPORT' : 'SPECIALIST';
      await addStaff({ ...staffForm, id, role } as Staff);
      setIsAdding(false);
      setStaffForm({ firstName: '', lastName: '', gender: 'Male', position: settings.positions[0], role: 'SPECIALIST', nationality: 'Zimbabwean' });
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

  const filteredStaff = staff.filter(s => {
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
        <h1 className="text-3xl font-black tracking-tight uppercase dark:text-white leading-none">STAFF MANAGEMENT</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-3 italic">View and manage all staff members.</p>
      </header>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => { setActiveSubTab('administration'); setSearchTerm(''); }}
          className={`px-8 py-5 text-xs font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeSubTab === 'administration' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Administration Staff
        </button>
        <button 
          onClick={() => { setActiveSubTab('general'); setSearchTerm(''); }}
          className={`px-8 py-5 text-xs font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeSubTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          General Staff
        </button>
      </div>

      {/* Content Header (Search, View Toggle, Add) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="relative w-full md:w-96 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search staff by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 placeholder:font-normal placeholder:uppercase" 
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="bg-slate-50 dark:bg-slate-800 p-1 rounded-xl flex gap-1 mr-2">
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={18} /></button>
            <button onClick={() => setViewMode('cards')} className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={18} /></button>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#002D50] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} /> Add Staff Member
          </button>
        </div>
      </div>

      {/* Staff View (Table or Cards) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-8 py-5">Full Name</th>
                  <th className="px-8 py-5">Date of Birth</th>
                  <th className="px-8 py-5">ID / Passport</th>
                  <th className="px-8 py-5">Position</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredStaff.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No matching staff records.</td></tr>
                ) : filteredStaff.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-blue-900/10 cursor-pointer group" onClick={() => { setSelectedStaff(s); setActiveProfileTab('personal'); setIsEditing(false); }}>
                    <td className="px-8 py-5"><div className="flex items-center gap-4"><div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-black">{getInitials(s)}</div><p className="font-bold text-sm dark:text-white uppercase tracking-tight">{s.fullName}</p></div></td>
                    <td className="px-8 py-5 text-xs font-mono font-bold text-slate-500">{s.dob}</td>
                    <td className="px-8 py-5 text-xs font-mono font-bold text-slate-500">{s.nationality === 'Zimbabwean' ? s.nationalId : s.passportNumber}</td>
                    <td className="px-8 py-5"><span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50">{s.position}</span></td>
                    <td className="px-8 py-5 text-right"><ChevronRight size={18} className="ml-auto text-slate-400 group-hover:text-blue-600 transition-colors" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStaff.map(s => (
              <div key={s.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer" onClick={() => { setSelectedStaff(s); setActiveProfileTab('personal'); setIsEditing(false); }}>
                <div className="flex items-center justify-between mb-6"><div className="w-12 h-12 rounded-2xl bg-[#002D50] text-white flex items-center justify-center font-black text-lg uppercase">{getInitials(s)}</div><div className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50">Active</div></div>
                <h3 className="font-black text-sm dark:text-white uppercase tracking-tight mb-1">{s.fullName}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{s.position}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800"><span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{s.nationality === 'Zimbabwean' ? s.nationalId : s.passportNumber}</span><ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal - Slower Animation */}
      {isAdding && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-700">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsAdding(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-700 max-h-[90vh] overflow-y-auto sidebar-scrollbar">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="font-black text-sm uppercase tracking-widest dark:text-white">Add New Staff Member</h3>
              <button disabled={isSubmitting} onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleStaffSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">First Name</label><input required placeholder="First Name" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none text-sm font-bold placeholder:font-normal" onChange={e => setStaffForm({...staffForm, firstName: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Surname</label><input required placeholder="Surname" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none text-sm font-bold placeholder:font-normal" onChange={e => setStaffForm({...staffForm, lastName: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">DOB</label><input type="date" required className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none text-sm font-bold" onChange={e => setStaffForm({...staffForm, dob: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nationality</label><input required placeholder="e.g. Zimbabwean" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none text-sm font-bold placeholder:font-normal" value={staffForm.nationality} onChange={e => setStaffForm({...staffForm, nationality: e.target.value})} /></div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {staffForm.nationality === 'Zimbabwean' ? 'ID Number' : 'Passport Number'}
                    </label>
                    <input 
                      required 
                      placeholder={staffForm.nationality === 'Zimbabwean' ? 'ID Number' : 'Passport Number'}
                      className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none text-sm font-bold placeholder:font-normal" 
                      onChange={e => setStaffForm(staffForm.nationality === 'Zimbabwean' ? {...staffForm, nationalId: e.target.value} : {...staffForm, passportNumber: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</label><input required placeholder="e.g. +263 7..." className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none text-sm font-bold placeholder:font-normal" onChange={e => setStaffForm({...staffForm, phone: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Work Email</label><input type="email" required placeholder="staff@motionmax.co.zw" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none text-sm font-bold placeholder:font-normal" onChange={e => setStaffForm({...staffForm, email: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Position</label><select required value={staffForm.position} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 outline-none text-sm font-bold cursor-pointer" onChange={e => setStaffForm({...staffForm, position: e.target.value})}>{settings.positions.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                </div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#002D50] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Staff Record'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Slide-over - Slower Animation */}
      {selectedStaff && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-700" onClick={() => setSelectedStaff(null)} />
          <aside className="relative w-full md:w-[60%] bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-right duration-700 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 sticky top-0 z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-black text-2xl uppercase border border-slate-200 dark:border-slate-700">{getInitials(selectedStaff)}</div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-none">{selectedStaff.fullName}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">ID: {selectedStaff.id}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Staff</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => isEditing ? handleSaveEdit() : startEditing()} 
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : isEditing ? <><Save size={14} /> Save Changes</> : <><Edit2 size={14} /> Edit Profile</>}
                </button>
                <button onClick={() => setSelectedStaff(null)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><X size={20} /></button>
              </div>
            </div>

            <div className="flex bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
               {[
                 { id: 'personal', label: 'Personal Details', icon: <UserCircle size={14}/> },
                 { id: 'payroll', label: 'Payroll Details', icon: <Wallet size={14}/> }
               ].map(tab => (
                 <button 
                  key={tab.id} 
                  onClick={() => setActiveProfileTab(tab.id as any)}
                  className={`flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeProfileTab === tab.id ? 'border-[#002D50] text-[#002D50] bg-white dark:bg-slate-950 dark:text-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                 >
                   {tab.icon} {tab.label}
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto sidebar-scrollbar p-8">
              {activeProfileTab === 'personal' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right duration-700">
                  <div className="grid grid-cols-2 gap-8">
                    {[
                      { key: 'position', label: 'Position', value: selectedStaff.position, icon: <Briefcase size={16} />, type: 'select', options: settings.positions },
                      { key: 'nationality', label: 'Nationality', value: selectedStaff.nationality, icon: <Globe size={16} />, type: 'text' },
                      { key: 'dob', label: 'Date of Birth', value: selectedStaff.dob, icon: <Calendar size={16} />, type: 'date' },
                      { key: selectedStaff.nationality === 'Zimbabwean' ? 'nationalId' : 'passportNumber', label: 'Identification', value: selectedStaff.nationality === 'Zimbabwean' ? selectedStaff.nationalId : selectedStaff.passportNumber, icon: <UserIcon size={16} />, type: 'text' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">{item.icon} {item.label}</p>
                        {isEditing ? (
                          item.type === 'select' ? (
                            <select 
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-bold" 
                              value={editForm[item.key as keyof Staff] as string}
                              onChange={e => setEditForm({...editForm, [item.key]: e.target.value})}
                            >
                              {item.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <input 
                              type={item.type}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-bold" 
                              value={editForm[item.key as keyof Staff] as string}
                              onChange={e => setEditForm({...editForm, [item.key]: e.target.value})}
                            />
                          )
                        ) : (
                          <p className="text-xs font-bold dark:text-white pl-6">{item.value || 'N/A'}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-3">Contact Information</h3>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center gap-2 font-mono font-bold text-[11px]">
                          <Mail size={14} className="text-blue-500" /> 
                          {isEditing ? (
                            <input 
                              type="email"
                              className="bg-transparent border-none p-0 w-full focus:ring-0 text-[11px] font-bold"
                              value={editForm.email || ''}
                              onChange={e => setEditForm({...editForm, email: e.target.value})}
                            />
                          ) : selectedStaff.email}
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center gap-2 font-mono font-bold text-[11px]">
                          <Phone size={14} className="text-blue-500" /> 
                          {isEditing ? (
                            <input 
                              type="text"
                              className="bg-transparent border-none p-0 w-full focus:ring-0 text-[11px] font-bold"
                              value={editForm.phone || ''}
                              onChange={e => setEditForm({...editForm, phone: e.target.value})}
                            />
                          ) : selectedStaff.phone}
                        </div>
                      </div>
                      <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-3">
                        <MapPin size={16} className="text-blue-500 mt-1" />
                        <div className="flex-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Residential Address</p>
                          {isEditing ? (
                            <textarea 
                              className="w-full bg-transparent border-none p-0 focus:ring-0 text-[11px] font-medium leading-relaxed resize-none"
                              rows={2}
                              value={editForm.address || ''}
                              onChange={e => setEditForm({...editForm, address: e.target.value})}
                            />
                          ) : (
                            <p className="text-[11px] font-medium leading-relaxed">{selectedStaff.address}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeProfileTab === 'payroll' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-700">
                  <div className="p-12 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-6 shadow-sm"><Wallet size={32} /></div>
                    <h4 className="text-sm font-black uppercase tracking-widest mb-2 dark:text-white">Payroll Records</h4>
                    <p className="text-xs font-medium text-slate-500 max-w-sm">Detailed financial remuneration and tax records are managed by the Finance department.</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
