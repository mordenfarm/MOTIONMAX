
import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  Search, 
  UserPlus, 
  ChevronRight, 
  Phone, 
  Calendar, 
  Stethoscope, 
  Activity,
  X,
  LayoutGrid,
  List,
  User,
  MapPin,
  Loader2,
  Mail,
  Shirt,
  Briefcase,
  DollarSign,
  UserCircle,
  TrendingUp,
  Target,
  Edit2,
  Save,
  Trash2,
  AlertTriangle,
  History,
  ClipboardList,
  Zap,
  FileText
} from 'lucide-react';
import { Student } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COUNTRY_CODES = [
  { code: '+263', label: 'Zim', flag: '🇿🇼' },
  { code: '+27', label: 'SA', flag: '🇿🇦' },
  { code: '+44', label: 'UK', flag: '🇬🇧' },
  { code: '+1', label: 'USA', flag: '🇺🇸' },
  { code: '+971', label: 'UAE', flag: '🇦🇪' },
  { code: '+267', label: 'Bots', flag: '🇧🇼' },
  { code: '+260', label: 'Zam', flag: '🇿🇲' },
  { code: '+258', label: 'Moz', flag: '🇲🇿' },
];

const MOCK_PROGRESS_DATA = [
  { name: 'Week 1', score: 40 },
  { name: 'Week 2', score: 45 },
  { name: 'Week 3', score: 42 },
  { name: 'Week 4', score: 55 },
  { name: 'Week 5', score: 60 },
  { name: 'Week 6', score: 58 },
  { name: 'Week 7', score: 72 },
];

export const StudentDirectory: React.FC = () => {
  const { students, staff, addStudent, updateStudent, deleteStudent, settings, user, setSelectedStudentIdForLog, setActiveTab } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'personal' | 'clinical' | 'financial' | 'progress'>('personal');
  const [filterGender, setFilterGender] = useState<'All' | 'Male' | 'Female'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Student>>({});
  
  // Delete Confirmation State
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [phonePrefix, setPhonePrefix] = useState('+263');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    firstName: '',
    lastName: '',
    gender: 'Male',
    diagnosis: '',
    medicalRecords: '',
    socialHistory: '',
    targetBehaviors: '',
    parentName: '',
    parentEmail: '',
    homeAddress: '',
    uniformSizes: '',
  });

  const canEditProfile = user?.role === 'SUPER_ADMIN';

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhoneNumber = (num: string) => num.length >= 7;

  const isFormValid = useMemo(() => {
    return (
      newStudent.firstName && 
      newStudent.lastName && 
      newStudent.parentName && 
      newStudent.homeAddress &&
      validateEmail(newStudent.parentEmail || '') &&
      validatePhoneNumber(phoneNumber)
    );
  }, [newStudent, phoneNumber]);

  const filteredStudents = students.filter(s => {
    const fullName = s.fullName || `${s.firstName || ''} ${s.lastName || ''}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.id && s.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGender = filterGender === 'All' || s.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      await addStudent({
        ...newStudent,
        parentPhone: `${phonePrefix}${phoneNumber}`,
        enrollmentDate: new Date().toISOString().split('T')[0]
      } as Student);
      setIsAddModalOpen(false);
      setNewStudent({ firstName: '', lastName: '', gender: 'Male', homeAddress: '', uniformSizes: '', parentEmail: '', parentName: '', diagnosis: '', socialHistory: '', targetBehaviors: '' });
      setPhoneNumber('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedStudent || !selectedStudent.firebaseUid) return;
    setIsSubmitting(true);
    try {
      const updatedData = { ...editForm };
      if (editForm.firstName || editForm.lastName) {
        updatedData.fullName = `${editForm.firstName || selectedStudent.firstName} ${editForm.lastName || selectedStudent.lastName}`;
      }
      
      await updateStudent(selectedStudent.firebaseUid, updatedData);
      setSelectedStudent({ ...selectedStudent, ...updatedData } as Student);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent || !selectedStudent.firebaseUid) return;
    setIsDeleting(true);
    try {
      await deleteStudent(selectedStudent.firebaseUid);
      setSelectedStudent(null);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const startEditing = () => {
    if (!selectedStudent || !canEditProfile) return;
    setEditForm(selectedStudent);
    setIsEditing(true);
  };

  const handleStartSession = (studentId: string) => {
    setSelectedStudentIdForLog(studentId);
    setActiveTab(user?.role === 'SUPER_ADMIN' ? 'clinical' : 'clinical-logs');
    setSelectedStudent(null);
  };

  const getInitials = (student: Student) => {
    if (student.firstName && student.lastName) return `${student.firstName[0]}${student.lastName[0]}`;
    if (student.fullName) return student.fullName.split(' ').map(n => n[0]).join('').substring(0, 2);
    return '??';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase dark:text-white leading-none">STUDENT MANAGEMENT</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-2 italic">Register and view all student records</p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'SUPER_ADMIN' && (
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 mr-2">
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={18} /></button>
              <button onClick={() => setViewMode('cards')} className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={18} /></button>
            </div>
          )}
          {user?.role === 'SUPER_ADMIN' && (
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 md:px-6 py-2.5 bg-[#002D50] text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/10 hover:bg-black transition-all active:scale-95">
              <UserPlus size={16} /> New Student
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 md:p-4 rounded-2xl flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 placeholder:font-normal placeholder:uppercase" />
        </div>
        <div className="flex gap-2">
          <select value={filterGender} onChange={(e) => setFilterGender(e.target.value as any)} className="flex-1 md:flex-none px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr><th className="px-6 py-5">Full Name</th><th className="px-6 py-5 hidden md:table-cell">Parent/Guardian</th><th className="px-6 py-5">Status</th><th className="px-6 py-5 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No matching students.</td></tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group" onClick={() => { setSelectedStudent(student); setActiveProfileTab('personal'); setIsEditing(false); }}>
                      <td className="px-6 py-5"><div className="flex items-center gap-4"><div className="w-9 h-9 rounded-xl bg-[#002D50] text-white flex items-center justify-center font-black text-[10px] border border-blue-100/10 uppercase">{getInitials(student)}</div><div><p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{student.fullName}</p><p className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-widest">{student.id}</p></div></div></td>
                      <td className="px-6 py-5 hidden md:table-cell"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{student.parentName}</p><p className="text-[9px] font-mono text-blue-600 dark:text-blue-400 mt-0.5">{student.parentPhone}</p></td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/50">Active</span>
                           {(user?.role === 'SPECIALIST' || user?.role === 'SUPER_ADMIN') && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleStartSession(student.id); }}
                                className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/50 flex items-center gap-1 hover:bg-blue-600 hover:text-white transition-all"
                              >
                                <FileText size={10} /> Session Log
                              </button>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right"><ChevronRight size={16} className="ml-auto text-slate-400 group-hover:text-blue-600 transition-colors" /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map(student => (
              <div key={student.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer" onClick={() => { setSelectedStudent(student); setActiveProfileTab('personal'); setIsEditing(false); }}>
                <div className="flex items-start justify-between mb-6"><div className="w-12 h-12 rounded-2xl bg-[#002D50] text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-transform uppercase">{getInitials(student)}</div><span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest">Active</span></div>
                <div>
                   <h3 className="text-sm font-black uppercase tracking-tight dark:text-white truncate">{student.fullName}</h3>
                   <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">{student.id}</p>
                   {(user?.role === 'SPECIALIST' || user?.role === 'SUPER_ADMIN') && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleStartSession(student.id); }}
                        className="mt-4 w-full py-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all"
                      >
                         <Zap size={12} /> New Session Log
                      </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-700">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-700 max-h-[90vh] overflow-y-auto sidebar-scrollbar">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h3 className="font-black text-sm uppercase tracking-widest dark:text-white">Register New Student</h3>
              <button disabled={isSubmitting} onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddStudent} className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400">First Name</label><input required placeholder="First Name" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/10 outline-none placeholder:font-normal" onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Surname</label><input required placeholder="Surname" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/10 outline-none placeholder:font-normal" onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Gender</label><select required value={newStudent.gender} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs outline-none cursor-pointer" onChange={e => setNewStudent({...newStudent, gender: e.target.value as any})}><option value="Male">Male</option><option value="Female">Female</option></select></div>
                <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400">DOB</label><input type="date" required className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/10 outline-none" onChange={e => setNewStudent({...newStudent, dob: e.target.value})} /></div>
                <div className="sm:col-span-2 space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Residential Address</label><textarea rows={2} required placeholder="Physical home address..." className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs focus:ring-2 focus:ring-blue-500/10 outline-none placeholder:font-normal" onChange={e => setNewStudent({...newStudent, homeAddress: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Uniform Size</label><input placeholder="e.g. Size 24" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs outline-none placeholder:font-normal" onChange={e => setNewStudent({...newStudent, uniformSizes: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Parent/Guardian Name</label><input required placeholder="Guardian Name" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs outline-none placeholder:font-normal" onChange={e => setNewStudent({...newStudent, parentName: e.target.value})} /></div>
                <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Guardian Phone</label><div className="flex gap-2"><select value={phonePrefix} onChange={(e) => setPhonePrefix(e.target.value)} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-2 py-3 rounded-xl text-xs font-mono outline-none">{COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}</select><input required placeholder="Phone Number" className="flex-1 px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs outline-none placeholder:font-normal" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}/></div></div>
                <div className="space-y-1.5"><label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Guardian Email</label><input type="email" required placeholder="guardian@email.com" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs outline-none placeholder:font-normal" onChange={e => setNewStudent({...newStudent, parentEmail: e.target.value})} /></div>
              </div>
              <button type="submit" disabled={isSubmitting || !isFormValid} className="w-full py-4 bg-[#002D50] text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Register Student'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-700" onClick={() => setSelectedStudent(null)} />
          <aside className="relative w-full md:w-[60%] bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-right duration-700 flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 sticky top-0 z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#002D50] text-white flex items-center justify-center font-black text-2xl uppercase shadow-xl border border-blue-400/20">{getInitials(selectedStudent)}</div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-none">
                    {isEditing ? `${editForm.firstName || ''} ${editForm.lastName || ''}` : selectedStudent.fullName}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">ID: {selectedStudent.id}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Student</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canEditProfile && (
                  <button 
                    onClick={() => isEditing ? handleSaveEdit() : startEditing()} 
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : isEditing ? <><Save size={14} /> Save Changes</> : <><Edit2 size={14} /> Edit Profile</>}
                  </button>
                )}
                {!isEditing && canEditProfile && (
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button onClick={() => setSelectedStudent(null)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><X size={20} /></button>
              </div>
            </div>

            <div className="flex bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
               {[
                 { id: 'personal', label: 'Personal Details', icon: <UserCircle size={14}/> },
                 { id: 'clinical', label: 'Clinical Info', icon: <Stethoscope size={14}/> },
                 { id: 'progress', label: 'Student Progress', icon: <TrendingUp size={14}/> },
                 { id: 'financial', label: 'Financial Info', icon: <DollarSign size={14}/> }
               ].map(tab => (
                 <button 
                  key={tab.id} 
                  onClick={() => setActiveProfileTab(tab.id as any)}
                  className={`flex-1 min-w-[140px] py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeProfileTab === tab.id ? 'border-[#002D50] text-[#002D50] bg-white dark:bg-slate-950 dark:text-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
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
                      { key: 'dob', label: 'Date of Birth', value: selectedStudent.dob, icon: <Calendar size={16} />, type: 'date' },
                      { key: 'gender', label: 'Gender', value: selectedStudent.gender, icon: <UserCircle size={16} />, type: 'select', options: ['Male', 'Female'] },
                      { key: 'enrollmentDate', label: 'Enrollment', value: selectedStudent.enrollmentDate, icon: <Activity size={16} />, type: 'date' },
                      { key: 'uniformSizes', label: 'Uniform Size', value: selectedStudent.uniformSizes || 'Not Set', icon: <Shirt size={16} />, type: 'text' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">{item.icon} {item.label}</p>
                        {isEditing ? (
                          item.type === 'select' ? (
                            <select 
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-bold outline-none" 
                              value={editForm[item.key as keyof Student] as string}
                              onChange={e => setEditForm({...editForm, [item.key]: e.target.value})}
                            >
                              {item.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          ) : (
                            <input 
                              type={item.type}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-bold outline-none" 
                              value={editForm[item.key as keyof Student] as string}
                              onChange={e => setEditForm({...editForm, [item.key]: e.target.value})}
                            />
                          )
                        ) : (
                          <p className="text-xs font-bold dark:text-white pl-6">{item.value}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-3">Parent Information</h3>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center"><User size={20} /></div>
                        <div className="flex-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Primary Contact</p>
                          {isEditing ? (
                            <input 
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 mt-1 rounded-lg text-xs font-bold outline-none" 
                              value={editForm.parentName || ''}
                              onChange={e => setEditForm({...editForm, parentName: e.target.value})}
                            />
                          ) : (
                            <p className="text-xs font-bold dark:text-white">{selectedStudent.parentName}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center gap-2 font-mono font-bold text-[11px]">
                          <Phone size={14} className="text-blue-500" /> 
                          {isEditing ? (
                            <input 
                              className="w-full bg-transparent border-none p-0 focus:ring-0 text-[11px] font-bold" 
                              value={editForm.parentPhone || ''}
                              onChange={e => setEditForm({...editForm, parentPhone: e.target.value})}
                            />
                          ) : selectedStudent.parentPhone}
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center gap-2 font-mono font-bold text-[11px] truncate">
                          <Mail size={14} className="text-blue-500" /> 
                          {isEditing ? (
                            <input 
                              className="w-full bg-transparent border-none p-0 focus:ring-0 text-[11px] font-bold" 
                              value={editForm.parentEmail || ''}
                              onChange={e => setEditForm({...editForm, parentEmail: e.target.value})}
                            />
                          ) : selectedStudent.parentEmail}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-3">
                        <MapPin size={16} className="text-blue-500 mt-1" />
                        <div className="flex-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Residential Address</p>
                          {isEditing ? (
                            <textarea 
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg text-xs font-bold outline-none resize-none" 
                              rows={2}
                              value={editForm.homeAddress || ''}
                              onChange={e => setEditForm({...editForm, homeAddress: e.target.value})}
                            />
                          ) : (
                            <p className="text-[11px] font-medium leading-relaxed">{selectedStudent.homeAddress}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeProfileTab === 'clinical' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-700">
                  {user?.role === 'SPECIALIST' && (
                    <div className="flex items-center justify-between p-6 bg-blue-600 text-white rounded-[2rem] shadow-xl animate-bounce-subtle">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                             <ClipboardList size={24} />
                          </div>
                          <div>
                             <h4 className="text-sm font-black uppercase tracking-widest">Active Supervision</h4>
                             <p className="text-[10px] font-bold text-blue-100">Click to record real-time ABA data.</p>
                          </div>
                       </div>
                       <button 
                        onClick={() => handleStartSession(selectedStudent.id)}
                        className="px-6 py-3 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-50 transition-all flex items-center gap-2 active:scale-95"
                       >
                         Edit Clinical Logs <Zap size={14} />
                       </button>
                    </div>
                  )}

                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Primary Diagnosis</label>
                    {isEditing ? (
                      <textarea 
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-bold outline-none resize-none" 
                        rows={4}
                        value={editForm.diagnosis || ''}
                        onChange={e => setEditForm({...editForm, diagnosis: e.target.value})}
                      />
                    ) : (
                      <p className="text-xs font-medium leading-relaxed">{selectedStudent.diagnosis || 'No clinical records available yet.'}</p>
                    )}
                    {!isEditing && <div className="absolute top-4 right-4 text-blue-500/20"><Stethoscope size={40} /></div>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                       <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                         <History size={14} /> Social History
                       </h4>
                       {isEditing ? (
                         <textarea 
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-[11px] font-bold outline-none resize-none"
                          rows={4}
                          value={editForm.socialHistory || ''}
                          onChange={e => setEditForm({...editForm, socialHistory: e.target.value})}
                         />
                       ) : (
                         <p className="text-[11px] font-medium leading-relaxed italic">{selectedStudent.socialHistory || 'Not documented.'}</p>
                       )}
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                       <h4 className="text-[9px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
                         <Activity size={14} /> Target Behaviors
                       </h4>
                       {isEditing ? (
                         <textarea 
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-[11px] font-bold outline-none resize-none"
                          rows={4}
                          placeholder="e.g. Hand flapping, Noises, Elopement"
                          value={editForm.targetBehaviors || ''}
                          onChange={e => setEditForm({...editForm, targetBehaviors: e.target.value})}
                         />
                       ) : (
                         <div className="flex flex-wrap gap-2">
                            {selectedStudent.targetBehaviors?.split(',').map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase rounded-md border border-rose-100 dark:border-rose-900/50">{tag.trim()}</span>
                            )) || <span className="text-[11px] font-medium italic text-slate-400">None noted.</span>}
                         </div>
                       )}
                    </div>
                  </div>
                </div>
              )}

              {activeProfileTab === 'progress' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-700">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                    <header className="flex items-center justify-between mb-8">
                       <div>
                         <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Performance Index</h3>
                         <p className="text-[10px] text-emerald-500 font-bold mt-1">+18% Improvement this term</p>
                       </div>
                       <TrendingUp className="text-blue-500" size={24} />
                    </header>
                    
                    <div className="h-[240px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_PROGRESS_DATA}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeProfileTab === 'financial' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right duration-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Fees Due</p>
                      <p className="text-2xl font-black mt-1 text-[#002D50] dark:text-white">${settings.feesAmount}</p>
                      <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">FOR {settings.currentTerm}</p>
                    </div>
                    <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Paid to Date</p>
                      <p className="text-2xl font-black mt-1 text-emerald-700 dark:text-emerald-400">${selectedStudent.totalPaid || 0}</p>
                    </div>
                    <div className="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-800 rounded-2xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-rose-600">Outstanding Balance</p>
                      <p className="text-2xl font-black mt-1 text-rose-700 dark:text-rose-400">${settings.feesAmount - (selectedStudent.totalPaid || 0)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => !isDeleting && setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] p-8 text-center space-y-6 shadow-2xl overflow-hidden">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white">Delete Profile?</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              This action will permanently erase <span className="text-slate-900 dark:text-white font-bold">{selectedStudent?.fullName}</span> from the Motion Max records. This cannot be undone.
            </p>
            <div className="flex gap-4 pt-4">
               <button 
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
               >
                 Cancel
               </button>
               <button 
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 py-4 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {isDeleting ? <Loader2 className="animate-spin" size={14} /> : 'Delete Permanently'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
