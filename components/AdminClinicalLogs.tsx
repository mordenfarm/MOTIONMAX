
import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Search, 
  ChevronRight, 
  HeartPulse, 
  Calendar, 
  Activity,
  X,
  User,
  Filter,
  ArrowLeft,
  Clock,
  LayoutGrid,
  CheckCircle2,
  Brain,
  ChevronLeft,
  FileText,
  Download,
  Loader2,
  Lock
} from 'lucide-react';
import { Student, SessionLog } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

type TimeFilter = 'Week' | 'Month' | 'Year' | 'All';

export const AdminClinicalLogs: React.FC = () => {
  const { students, clinicalLogs, user, parents } = useStore();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('All');
  const [activeLog, setActiveLog] = useState<SessionLog | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Determine if the current user is a student or parent to lock the selection
  const isRestrictedRole = user?.role === 'STUDENT' || user?.role === 'PARENT';

  useEffect(() => {
    if (isRestrictedRole && students.length > 0) {
      if (user?.role === 'STUDENT') {
        const student = students.find(s => s.firebaseUid === user.id);
        if (student) setSelectedStudent(student);
      } else if (user?.role === 'PARENT') {
        const parent = parents.find(p => p.firebaseUid === user.id);
        if (parent) {
          const student = students.find(s => s.id === parent.studentId);
          if (student) setSelectedStudent(student);
        }
      }
    }
  }, [user, students, parents, isRestrictedRole]);

  // CRITICAL: Reset active log when student selection changes to prevent data leak
  useEffect(() => {
    setActiveLog(null);
  }, [selectedStudent]);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === 'All' || s.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  const studentLogs = useMemo(() => {
    if (!selectedStudent) return [];
    // Strict filtering by Student ID
    let logs = clinicalLogs.filter(log => log.studentId === selectedStudent.id);
    
    const now = new Date();
    if (timeFilter === 'Week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      logs = logs.filter(l => new Date(l.date) >= weekAgo);
    } else if (timeFilter === 'Month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      logs = logs.filter(l => new Date(l.date) >= monthAgo);
    } else if (timeFilter === 'Year') {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      logs = logs.filter(l => new Date(l.date) >= yearAgo);
    }
    
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedStudent, clinicalLogs, timeFilter]);

  const handleExportPDF = async () => {
    if (!selectedStudent || !activeLog) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      try {
        const img = new Image();
        img.src = LogoImg;
        await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
        if (img.complete && img.naturalWidth > 0) {
          doc.addImage(img, 'PNG', 15, 15, 25, 25);
        }
      } catch (e) {
        console.warn("Logo failed to load for PDF");
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(0, 45, 80); // #002D50
      doc.text('MOTION MAX Day Services', pageWidth - 15, 22, { align: 'right' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text('27 Colnebrook Lane, Harare, Zimbabwe', pageWidth - 15, 28, { align: 'right' });
      doc.text('Phone: +263 775 926 454', pageWidth - 15, 33, { align: 'right' });
      doc.text('Email: admin@motionmax.co.zw', pageWidth - 15, 38, { align: 'right' });

      doc.setDrawColor(230);
      doc.line(15, 45, pageWidth - 15, 45);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30);
      doc.text('SESSION PROGRESS REPORT', 15, 58);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('STUDENT INFORMATION', 15, 70);
      doc.setFont('helvetica', 'normal');
      doc.text(`Full Name: ${selectedStudent.fullName}`, 15, 76);
      doc.text(`Student ID: ${selectedStudent.id}`, 15, 81);
      doc.text(`Gender: ${selectedStudent.gender}`, 15, 86);

      doc.setFont('helvetica', 'bold');
      doc.text('HOW THE LESSON WENT', 110, 70);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${new Date(activeLog.date).toLocaleDateString()}`, 110, 76);
      doc.text(`Teaching Method: ${activeLog.method}`, 110, 81);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 45, 80);
      doc.text(`Independence Score: ${activeLog.independenceScore}%`, 110, 86);
      doc.setTextColor(30);

      doc.setFillColor(248, 250, 252);
      doc.rect(15, 95, pageWidth - 30, 15, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text(`Lesson Target:`, 20, 104);
      doc.setFont('helvetica', 'normal');
      doc.text(activeLog.targetBehavior, 50, 104);

      const tableData = activeLog.steps.map((step, idx) => [
        (idx + 1).toString().padStart(2, '0'),
        step.description,
        step.promptLevel === '+' ? 'Independent' : `Needed Help (${step.promptLevel})`
      ]);

      autoTable(doc, {
        startY: 115,
        head: [['Step', 'What they did', 'How much help was needed']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
          fillColor: [0, 45, 80], 
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          1: { cellWidth: 'auto' },
          2: { halign: 'center', cellWidth: 50 }
        },
        styles: {
          fontSize: 9,
          cellPadding: 5,
          valign: 'middle'
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        }
      });

      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150);
      doc.text('This report is part of the Motion Max learning journey records.', 15, finalY + 15);
      
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180);
        doc.text(`© 2025 MOTION MAX Day Services // Verified Report`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      doc.save(`MotionMax_Report_${selectedStudent.id}_${activeLog.date.split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!selectedStudent && !isRestrictedRole) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <HeartPulse size={16} className="text-blue-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Records Archive</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase dark:text-white leading-none">Lesson Progress</h1>
            <p className="text-sm text-slate-500 font-medium mt-3 italic">View past daily reports and check progress over time.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             <div className="relative group min-w-[300px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search student records..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-slate-400 placeholder:font-normal" 
                />
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStudents.map(student => {
            const logsCount = clinicalLogs.filter(l => l.studentId === student.id).length;
            return (
              <div 
                key={student.id} 
                onClick={() => setSelectedStudent(student)}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
              >
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 transition-colors"></div>
                 <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-[#002D50] dark:text-blue-400 flex items-center justify-center font-black text-xl uppercase border border-blue-100 dark:border-blue-800 group-hover:bg-[#002D50] group-hover:text-white transition-all duration-500">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest block">{student.id}</span>
                    </div>
                 </div>
                 <h3 className="font-black text-base dark:text-white uppercase tracking-tight mb-4 truncate group-hover:text-blue-600 transition-colors">{student.fullName}</h3>
                 
                 <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-500">{logsCount} Reports Available</span>
                    <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                       <ChevronRight size={16} />
                    </button>
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 max-w-[1200px] mx-auto">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-6">
          {!isRestrictedRole && (
            <button 
              onClick={() => setSelectedStudent(null)}
              className="group p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-white transition-all"
            >
              <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-[#002D50] text-white flex items-center justify-center text-2xl font-black uppercase shadow-xl ring-4 ring-blue-500/10">
              {selectedStudent?.firstName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Past Daily Reports</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight dark:text-white leading-none">{selectedStudent?.fullName}</h1>
              <p className="text-[10px] font-mono text-slate-400 mt-2 tracking-widest uppercase bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded inline-block">Student ID: {selectedStudent?.id}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {(['Week', 'Month', 'Year', 'All'] as TimeFilter[]).map(f => (
            <button 
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${timeFilter === f ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50 dark:hover:bg-white/5'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
               <Calendar size={14} /> Lessons List
            </h3>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{studentLogs.length} Reports Found</span>
         </div>
         <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar snap-x scroll-smooth">
            {studentLogs.length === 0 ? (
               <div className="w-full py-20 bg-slate-50 dark:bg-slate-900/30 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 italic">No reports found for this time period.</p>
               </div>
            ) : studentLogs.map(log => (
               <button 
                key={log.id} 
                onClick={() => setActiveLog(log)}
                className={`flex-shrink-0 w-64 snap-center p-6 rounded-[2rem] border transition-all text-left relative overflow-hidden group ${activeLog?.id === log.id ? 'bg-[#002D50] border-[#002D50] text-white shadow-2xl translate-y-[-4px]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-blue-500 hover:shadow-lg'}`}
               >
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 ${activeLog?.id === log.id ? 'text-blue-300' : 'text-slate-400'}`}>
                    Lesson Summary
                  </p>
                  <p className="font-black text-lg uppercase tracking-tighter leading-tight mb-1">
                    {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className={`text-[10px] font-bold ${activeLog?.id === log.id ? 'text-blue-100' : 'text-slate-500'}`}>
                    {log.targetBehavior}
                  </p>
                  <div className="mt-8 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className={`text-[8px] font-black uppercase tracking-widest ${activeLog?.id === log.id ? 'text-blue-300' : 'text-slate-400'}`}>Independence Score</span>
                        <span className="text-xl font-black font-mono">{log.independenceScore}%</span>
                     </div>
                     <div className={`p-2 rounded-xl ${activeLog?.id === log.id ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800'} transition-colors group-hover:scale-110`}>
                        <ChevronRight size={18} />
                     </div>
                  </div>
               </button>
            ))}
         </div>
      </div>

      {activeLog ? (
         <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/50 dark:bg-slate-950/20">
               <div className="flex items-center gap-8">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-600/20">
                     <Brain size={40} />
                  </div>
                  <div>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2 block">Lesson Target</span>
                     <h3 className="text-3xl font-black uppercase tracking-tight dark:text-white leading-tight">{activeLog.targetBehavior}</h3>
                     <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                           <Activity size={14} className="text-slate-400" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Method used: <span className="text-blue-600 dark:text-blue-400 font-mono">{activeLog.method}</span></p>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="relative group">
                  <div className="absolute inset-0 bg-blue-600 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <div className="relative flex items-center gap-6 px-10 py-6 bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner">
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Independence</p>
                       <p className="text-4xl font-black text-blue-600 font-mono">{activeLog.independenceScore}%</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-[10px] font-black uppercase tracking-widest text-slate-400 backdrop-blur-sm sticky top-0 border-b border-slate-200 dark:border-slate-700">
                     <tr>
                        <th className="px-10 py-6 border-r border-slate-200 dark:border-slate-700 w-24 text-center">Step</th>
                        <th className="px-10 py-6 border-r border-slate-200 dark:border-slate-700">What they did</th>
                        <th className="px-10 py-6 w-56 text-center">How much help was needed</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {activeLog.steps.map((step, idx) => (
                        <tr key={step.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                           <td className="px-10 py-8 border-r border-slate-100 dark:border-slate-800 text-center font-mono font-bold text-slate-400 text-sm">
                             {(idx + 1).toString().padStart(2, '0')}
                           </td>
                           <td className="px-10 py-8 border-r border-slate-100 dark:border-slate-800">
                              <p className="text-base font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{step.description}</p>
                           </td>
                           <td className="px-10 py-8 text-center bg-slate-50/30 dark:bg-slate-900/10">
                              <div className="inline-flex flex-col items-center gap-2">
                                 <span className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl font-black text-sm shadow-xl border-4 transition-transform hover:scale-110 ${step.promptLevel === '+' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                                    {step.promptLevel}
                                 </span>
                                 <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{step.promptLevel === '+' ? 'Did it by themselves' : 'Needed some help'}</span>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            
            <div className="p-10 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4 text-slate-400">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                     <FileText size={20} className="text-blue-500" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em]">Official Record</p>
               </div>
               <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2 disabled:opacity-50"
               >
                  {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  {isExporting ? 'Creating PDF...' : 'Download Report'}
               </button>
            </div>
         </div>
      ) : (
         <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="max-w-md px-10">
               <h4 className="text-lg font-black uppercase tracking-widest dark:text-white mb-3">Lesson Timeline</h4>
               <p className="text-sm font-medium text-slate-400 leading-relaxed italic">
                 "Please pick a lesson from the list above to see the details."
               </p>
            </div>
         </div>
      )}
    </div>
  );
};
