
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
  FileText,
  School,
  // Added CheckCircle2 to fix "Cannot find name 'CheckCircle2'" error
  CheckCircle2
} from 'lucide-react';
import { Student } from '../types';

const COUNTRY_CODES = [
  { code: '+263', label: 'Zim', flag: '🇿🇼' },
  { code: '+27', label: 'SA', flag: '🇿🇦' },
  { code: '+44', label: 'UK', flag: '🇬🇧' },
  { code: '+1', label: 'USA', flag: '🇺🇸' },
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
    assignedClass: settings?.classes?.[0] || ''
  });

  const canEditProfile = user?.role === 'SUPER_ADMIN';

  const isFormValid = useMemo(() => {
    return (
      newStudent.firstName && 
      newStudent.lastName && 
      newStudent.parentName && 
      newStudent.homeAddress &&
      newStudent.assignedClass
    );
  }, [newStudent, phoneNumber]);

  const filteredStudents = (students || []).filter(s => {
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
      setNewStudent({ firstName: '', lastName: '', gender: 'Male', homeAddress: '', uniformSizes: '', parentEmail: '', parentName: '', diagnosis: '', socialHistory: '', targetBehaviors: '', assignedClass: settings?.classes?.[0] || '' });
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

  const getInitials = (student: Student) => {
    if (student.firstName && student.lastName) return `${student.firstName[0]}${student.lastName[0]}`;
    if (student.fullName) return student.fullName.split(' ').map(n => n[0]).join('').substring(0, 2);
    return '??';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase text-black leading-none dark:text-white">STUDENT LIST</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-2 italic dark:text-slate-400">Register and view all students</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 border-2 border-slate-200 dark:border-slate-700">
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={18} /></button>
            <button onClick={() => setViewMode('cards')} className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={18} /></button>
          </div>
          {user?.role === 'SUPER_ADMIN' && (
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 md:px-6 py-2.5 bg-[#002D50] text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-95">
              <UserPlus size={16} /> Register Student
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 shadow-sm">
        <div className="relative flex-1 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
          <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 rounded-xl text-xs font-bold border-2 border-slate-300 dark:border-slate-800 outline-none focus:border-blue-500 transition-all placeholder:uppercase" />
        </div>
        <select value={filterGender} onChange={(e) => setFilterGender(e.target.value as any)} className="px-4 py-2 bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500">
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-black dark:text-slate-300 border-b-2 border-slate-300 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-5">Full Name</th>
                  <th className="px-6 py-5">Class</th>
                  <th className="px-6 py-5">Parent</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/10 cursor-pointer group" onClick={() => { setSelectedStudent(student); setActiveProfileTab('personal'); setIsEditing(false); }}>
                    <td className="px-6 py-5"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-[#002D50] text-white flex items-center justify-center font-black text-xs uppercase shadow-sm">{getInitials(student)}</div><div><p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{student.fullName}</p><p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">{student.id}</p></div></div></td>
                    <td className="px-6 py-5"><span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[8px] font-black uppercase border border-blue-100 dark:bg-blue-900/30 dark:border-blue-800">{student.assignedClass || 'UNSET'}</span></td>
                    <td className="px-6 py-5"><p className="text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">{student.parentName}</p></td>
                    <td className="px-6 py-5 text-right"><ChevronRight size={16} className="ml-auto text-slate-400 group-hover:text-blue-600" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map(student => (
              <div key={student.id} className="bg-white dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all group cursor-pointer" onClick={() => { setSelectedStudent(student); setActiveProfileTab('personal'); setIsEditing(false); }}>
                <div className="flex items-start justify-between mb-6">
                   <div className="w-14 h-14 rounded-2xl bg-[#002D50] text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-110 transition-transform uppercase">{getInitials(student)}</div>
                   <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[8px] font-black uppercase border border-emerald-100 dark:border-emerald-800">Active</span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight dark:text-white truncate">{student.fullName}</h3>
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">{student.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-700" onClick={() => setSelectedStudent(null)} />
          <aside className="relative w-full sm:w-[500px] lg:w-[650px] bg-white dark:bg-slate-950 shadow-2xl animate-in slide-in-from-right duration-700 flex flex-col overflow-hidden">
            <div className="p-8 border-b-2 border-slate-300 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 sticky top-0 z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#002D50] text-white flex items-center justify-center font-black text-2xl uppercase shadow-xl">{getInitials(selectedStudent)}</div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight dark:text-white leading-none">Profile Node</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase">ID: {selectedStudent.id}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canEditProfile && (
                  <button onClick={() => isEditing ? handleSaveEdit() : startEditing()} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:border-blue-500 transition-all">
                    {isEditing ? <Save size={20} className="text-emerald-500" /> : <Edit2 size={20} className="text-blue-500" />}
                  </button>
                )}
                <button onClick={() => setSelectedStudent(null)} className="p-2.5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl hover:text-rose-500 transition-all"><X size={24} /></button>
              </div>
            </div>

            {/* Grid Tabs for Tablet/Mobile - All view visibility with high-contrast borders */}
            <div className="grid grid-cols-2 lg:flex bg-slate-50 dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-800 p-2 gap-2">
               {[
                 { id: 'personal', label: 'Personal Data', icon: <UserCircle size={14}/> },
                 { id: 'clinical', label: 'Clinical Node', icon: <Stethoscope size={14}/> },
                 { id: 'progress', label: 'Growth Progress', icon: <TrendingUp size={14}/> },
                 { id: 'financial', label: 'Financial Link', icon: <DollarSign size={14}/> }
               ].map(tab => (
                 <button 
                  key={tab.id} 
                  onClick={() => setActiveProfileTab(tab.id as any)}
                  className={`flex-1 py-4 px-2 flex flex-col md:flex-row items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl border-2 ${activeProfileTab === tab.id ? 'border-[#002D50] bg-white dark:bg-slate-950 text-[#002D50] dark:text-white shadow-lg' : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                 >
                   {tab.icon} <span className="text-center">{tab.label}</span>
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto sidebar-scrollbar p-8 bg-slate-50 dark:bg-slate-950/40">
              {/* Added high-contrast boundary to tab content area */}
              <div className="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 min-h-[400px] shadow-sm animate-in fade-in duration-500">
                {activeProfileTab === 'personal' && (
                  <div className="space-y-10 animate-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Birth Timeline</label><p className="text-sm font-black dark:text-white px-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">{selectedStudent.dob}</p></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gender Identity</label><p className="text-sm font-black dark:text-white px-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">{selectedStudent.gender}</p></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Registry Date</label><p className="text-sm font-black dark:text-white px-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">{selectedStudent.enrollmentDate}</p></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Apparel Matrix</label><p className="text-sm font-black dark:text-white px-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">{selectedStudent.uniformSizes || 'NO RECORD'}</p></div>
                    </div>
                    <div className="pt-10 border-t-2 border-slate-100 dark:border-slate-800 space-y-6">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 ml-1">Primary Guardian Records</h4>
                       <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-slate-200 dark:border-slate-700 space-y-4 shadow-inner">
                          <p className="text-base font-black dark:text-white mb-2 uppercase tracking-tight">{selectedStudent.parentName}</p>
                          <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400 font-mono font-bold"><div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm"><Phone size={14} className="text-blue-500" /></div> {selectedStudent.parentPhone}</div>
                          <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-slate-400 font-mono font-bold"><div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm"><Mail size={14} className="text-blue-500" /></div> {selectedStudent.parentEmail}</div>
                          <div className="flex items-start gap-4 text-[11px] text-slate-600 dark:text-slate-400 font-mono font-bold"><div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm"><MapPin size={14} className="text-blue-500" /></div> <span className="leading-relaxed">{selectedStudent.homeAddress}</span></div>
                       </div>
                    </div>
                  </div>
                )}
                
                {activeProfileTab === 'clinical' && (
                  <div className="space-y-10 animate-in slide-in-from-top-4">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 ml-1">Master Clinical Diagnosis</label>
                       <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border-2 border-blue-100 dark:border-blue-900/50 shadow-inner">
                          <p className="text-sm font-bold leading-relaxed text-blue-900 dark:text-blue-200 italic">"{selectedStudent.diagnosis || 'Diagnosis node pending verification.'}"</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 ml-1">Behavioral Focus Targets</label>
                       <div className="flex flex-wrap gap-3">
                          {selectedStudent.targetBehaviors?.split(',').map((b, i) => (
                            <span key={i} className="px-4 py-2 bg-white dark:bg-slate-950 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase rounded-2xl border-2 border-rose-100 dark:border-rose-900 shadow-sm">{b.trim()}</span>
                          )) || <p className="text-xs text-slate-400 italic px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full">Targets node currently clear.</p>}
                       </div>
                    </div>
                  </div>
                )}

                {activeProfileTab === 'financial' && (
                  <div className="space-y-10 animate-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="p-8 bg-white dark:bg-slate-950 border-4 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm relative overflow-hidden group">
                          <DollarSign size={80} className="absolute -right-4 -bottom-4 text-slate-50 dark:text-slate-900 group-hover:scale-110 transition-transform" />
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest relative z-10">Total Node Fee</p>
                          <p className="text-4xl font-black text-[#002D50] dark:text-white relative z-10 font-mono tracking-tighter">${settings.feesAmount}</p>
                       </div>
                       <div className="p-8 bg-emerald-50 dark:bg-emerald-950/30 border-4 border-emerald-100 dark:border-emerald-900/50 rounded-[3rem] shadow-sm relative overflow-hidden group">
                          <CheckCircle2 size={80} className="absolute -right-4 -bottom-4 text-emerald-100 dark:text-emerald-900/40 group-hover:scale-110 transition-transform" />
                          <p className="text-[10px] font-black uppercase text-emerald-600 mb-2 tracking-widest relative z-10">Sync'd Payments</p>
                          <p className="text-4xl font-black text-emerald-700 dark:text-emerald-400 relative z-10 font-mono tracking-tighter">${selectedStudent.totalPaid || 0}</p>
                       </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${selectedStudent.totalPaid === settings.feesAmount ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Ledger Status</span>
                       </div>
                       <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full ${selectedStudent.totalPaid === settings.feesAmount ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {selectedStudent.totalPaid === settings.feesAmount ? 'Audit Pass' : 'Pending Verification'}
                       </span>
                    </div>
                  </div>
                )}

                {activeProfileTab === 'progress' && (
                  <div className="space-y-10 flex flex-col items-center justify-center py-20 animate-in zoom-in-95">
                     <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-10 animate-pulse"></div>
                        <TrendingUp size={80} className="text-slate-200 dark:text-slate-700 relative z-10" />
                     </div>
                     <div className="text-center space-y-2">
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Clinical Data Pending</p>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-500 italic max-w-xs mx-auto">"Session analysis for this registry is currently being processed by the clinical specialist node."</p>
                     </div>
                  </div>
                )}
              </div>
            </div>

            <footer className="p-8 border-t-2 border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row justify-end gap-4 shadow-inner">
               <button onClick={() => setSelectedStudent(null)} className="px-10 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-100 shadow-sm active:scale-95">Close Terminal</button>
               {canEditProfile && !isEditing && (
                 <button onClick={() => setShowDeleteConfirm(true)} className="px-10 py-5 bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3 hover:bg-rose-600 active:scale-95"><Trash2 size={20}/> Purge Master Record</button>
               )}
            </footer>
          </aside>
        </div>
      )}

      {/* Register Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-700">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] overflow-hidden animate-in zoom-in-95 duration-700 max-h-[90vh] overflow-y-auto sidebar-scrollbar border-4 border-slate-200 dark:border-slate-800">
            <div className="p-10 border-b-2 border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600"><UserPlus size={24}/></div>
                 <h3 className="font-black text-2xl uppercase tracking-tight dark:text-white">Registry Entry</h3>
              </div>
              <button disabled={isSubmitting} onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500 transition-all"><X size={32} /></button>
            </div>
            <form onSubmit={handleAddStudent} className="p-12 space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">First Name</label><input required className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:border-blue-500 shadow-inner" onChange={e => setNewStudent({...newStudent, firstName: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Surname</label><input required className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:border-blue-500 shadow-inner" onChange={e => setNewStudent({...newStudent, lastName: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Assigned Class Matrix</label><select required className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:border-blue-500 shadow-inner cursor-pointer" onChange={e => setNewStudent({...newStudent, assignedClass: e.target.value})}><option value="">Select Module...</option>{settings.classes.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Gender Category</label><select required className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:border-blue-500 shadow-inner cursor-pointer" onChange={e => setNewStudent({...newStudent, gender: e.target.value as any})}><option value="Male">Male</option><option value="Female">Female</option></select></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Parent / Guardian Legal Name</label><input required className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:border-blue-500 shadow-inner" onChange={e => setNewStudent({...newStudent, parentName: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Communication Node (Email)</label><input type="email" required className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:border-blue-500 shadow-inner" onChange={e => setNewStudent({...newStudent, parentEmail: e.target.value})} /></div>
                <div className="sm:col-span-2 space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Physical Address Node</label><textarea required className="w-full px-8 py-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:border-blue-500 shadow-inner resize-none" rows={3} onChange={e => setNewStudent({...newStudent, homeAddress: e.target.value})} /></div>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-[#002D50] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl shadow-blue-900/30 hover:bg-black hover:scale-[1.02] transition-all flex items-center justify-center gap-4">
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Finalize Registry Link'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => !isDeleting && setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-800">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-rose-100 dark:border-rose-900 shadow-lg">
              <AlertTriangle size={56} />
            </div>
            <div className="space-y-3">
               <h3 className="text-3xl font-black uppercase tracking-tight text-black dark:text-white leading-none">Terminate Link?</h3>
               <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                 Permanently purge <span className="text-slate-900 dark:text-white font-black underline">{selectedStudent?.fullName}</span> from the master node. This action is irreversible.
               </p>
            </div>
            <div className="flex flex-col gap-3 pt-6">
               <button 
                disabled={isDeleting}
                onClick={handleDelete}
                className="w-full py-5 bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
               >
                 {isDeleting ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Permanent Deletion'}
               </button>
               <button 
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-5 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50"
               >
                 Abort Protocol
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
