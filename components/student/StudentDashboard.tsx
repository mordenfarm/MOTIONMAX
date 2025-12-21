
import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  Calendar, DollarSign, 
  TrendingUp, History,
  Activity, Brain,
  Check, X, ChevronRight, BarChart3, AlertTriangle,
  AlertCircle,
  Zap,
  Target,
  Clock,
  ArrowRight,
  Download,
  Info,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

export const StudentDashboard: React.FC = () => {
  const { user, students, parents, settings, milestoneRecords, clinicalLogs } = useStore();
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  let studentProfile = useMemo(() => {
    if (user?.role === 'STUDENT') {
      return students.find(s => s.firebaseUid === user.id);
    } else if (user?.role === 'PARENT') {
      const parentProfile = parents.find(p => p.firebaseUid === user.id);
      if (parentProfile) {
        return students.find(s => s.id === parentProfile.studentId);
      }
    }
    return null;
  }, [user, students, parents]);

  const studentMilestones = useMemo(() => 
    milestoneRecords.filter(r => r.studentId === studentProfile?.id),
    [milestoneRecords, studentProfile]
  );

  const latestMilestone = selectedHistoryItem || studentMilestones[0];

  const radarData = useMemo(() => {
    if (!latestMilestone) return [];
    return latestMilestone.sections.map((s: any) => {
      const total = s.items.length;
      const checked = s.items.filter((i: any) => i.checked).length;
      return {
        subject: s.title.length > 12 ? s.title.substring(0, 10) + '...' : s.title,
        fullTitle: s.title,
        score: Math.round((checked / (total || 1)) * 100),
        fullMark: 100,
      };
    });
  }, [latestMilestone]);

  const activityPulseData = useMemo(() => {
    if (!studentProfile) return [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const logs = clinicalLogs.filter(l => l.studentId === studentProfile.id);
    
    return months.map((m, idx) => {
      const count = logs.filter(l => new Date(l.date).getMonth() === idx).length;
      return { name: m, sessions: count };
    }).slice(-6);
  }, [clinicalLogs, studentProfile]);

  const stats = [
    { title: 'Current Term', value: settings.currentTerm, icon: Calendar, color: 'text-blue-600' },
    { title: 'Fees Status', value: studentProfile?.totalPaid === settings.feesAmount ? 'Paid' : 'Pending', icon: DollarSign, color: 'text-emerald-600' },
    { title: 'Lessons Done', value: clinicalLogs.filter(l => l.studentId === studentProfile?.id).length.toString(), icon: Activity, color: 'text-indigo-600' },
    { title: 'Total Progress', value: `${latestMilestone?.overallPercentage || 0}%`, icon: TrendingUp, color: 'text-amber-600' },
  ];

  const handleDownloadFullReport = async () => {
    if (!studentProfile || !latestMilestone) return;
    setIsGeneratingPdf(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      try {
        const img = new Image();
        img.src = LogoImg;
        await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
        if (img.complete) doc.addImage(img, 'PNG', 15, 15, 25, 25);
      } catch (e) {}

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(0, 45, 80);
      doc.text('MOTION MAX', 45, 25);
      doc.setFontSize(10);
      doc.text('Day Services & Learning Center', 45, 30);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('27 Colnebrook Lane, Harare, Zimbabwe', pageWidth - 15, 20, { align: 'right' });
      doc.text('Phone: +263 775 926 454', pageWidth - 15, 25, { align: 'right' });
      doc.text('Email: admin@motionmax.co.zw', pageWidth - 15, 30, { align: 'right' });

      doc.setDrawColor(200);
      doc.line(15, 45, pageWidth - 15, 45);

      doc.setFontSize(14);
      doc.setTextColor(30);
      doc.text(`Comprehensive Progress Report: ${studentProfile.fullName}`, 15, 55);
      
      doc.setFontSize(10);
      doc.text(`Student ID: ${studentProfile.id}`, 15, 65);
      doc.text(`Check Date: ${new Date(latestMilestone.timestamp).toLocaleDateString()}`, 15, 70);
      doc.text(`Development Level: ${latestMilestone.ageCategory}`, 15, 75);
      doc.text(`Total Score: ${latestMilestone.overallPercentage}%`, 15, 80);

      const skillRows = latestMilestone.sections.flatMap((s: any) => 
        s.items.map((i: any) => [s.title, i.text, i.checked ? 'Yes' : 'Not Yet'])
      );

      autoTable(doc, {
        startY: 90,
        head: [['Area', 'Goal', 'Achieved']],
        body: skillRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 45, 80] },
        styles: { fontSize: 8 }
      });

      if (latestMilestone.redFlags && latestMilestone.redFlags.length > 0) {
        const flagRows = latestMilestone.redFlags.map((f: any) => [f.text, f.checked ? 'Seen' : 'Not Seen']);
        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 10,
          head: [['Important Notes', 'Status']],
          body: flagRows,
          theme: 'grid',
          headStyles: { fillColor: [180, 0, 0] },
          styles: { fontSize: 8 }
        });
      }

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
      }

      doc.save(`Progress_Report_${studentProfile.fullName.replace(' ', '_')}.pdf`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!studentProfile) return (
    <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
      Loading...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 max-w-[1400px] mx-auto">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center text-3xl font-bold uppercase">
            {studentProfile.firstName[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{studentProfile.fullName}</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Student ID: {studentProfile.id}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
            onClick={handleDownloadFullReport}
            disabled={isGeneratingPdf}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2"
           >
             {isGeneratingPdf ? <Clock className="animate-spin" size={16} /> : <Download size={16} />}
             Get Report
           </button>
           <button 
            onClick={() => setShowHelpModal(true)}
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-blue-500 transition-all"
           >
             <HelpCircle size={20} />
           </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 mb-4 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wider">{s.title}</p>
            <h3 className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skill Radar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
               <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                 <Target size={18} className="text-blue-500" /> Areas of Progress
               </h3>
               <div className="h-[250px] w-full">
                {radarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      cx="50%" 
                      cy="50%" 
                      outerRadius="65%" 
                      data={radarData}
                      margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
                    >
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                      <Radar
                        name="Student"
                        dataKey="score"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">No data found</div>
                )}
               </div>
            </div>

            {/* Attendance/Lessons Pulse */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
               <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                 <Activity size={18} className="text-blue-500" /> Lessons this Month
               </h3>
               <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={activityPulseData} margin={{ left: -20 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                     <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                     <Bar dataKey="sessions" fill="#2563eb" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
             <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Goal Progress</h3>
                  <p className="text-xs text-slate-500 mt-1">{latestMilestone?.ageCategory || 'Recent Tasks'}</p>
                </div>
                <div className="text-right">
                   <p className="text-xl font-bold text-blue-600">{latestMilestone?.overallPercentage || 0}%</p>
                </div>
             </div>
             
             <div className="p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                {latestMilestone ? (
                  <div className="space-y-8">
                    {latestMilestone.sections.map((section: any) => (
                      <div key={section.title} className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{section.title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {section.items.map((item: any, idx: number) => (
                             <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.checked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'}`}>
                                   {item.checked ? <Check size={12} /> : <X size={12} />}
                                </div>
                                <span className={`text-xs ${item.checked ? 'text-slate-900 dark:text-slate-200 font-medium' : 'text-slate-400 italic'}`}>
                                  {item.text}
                                </span>
                             </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                     <Brain size={48} className="mx-auto text-slate-200" />
                     <p className="text-xs font-bold uppercase text-slate-400">No tasks listed yet</p>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notes/Red Flags */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
             <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-500" /> Important Notes
             </h3>
             <div className="space-y-3">
                {latestMilestone?.redFlags?.length > 0 ? (
                  latestMilestone.redFlags.map((flag: any, idx: number) => (
                    <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${flag.checked ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/30' : 'bg-slate-50/10 border-transparent opacity-20 grayscale'}`}>
                       <div className="flex items-center gap-3">
                          <AlertCircle size={16} className={flag.checked ? 'text-rose-500' : 'text-slate-300'} />
                          <span className={`text-xs ${flag.checked ? 'text-rose-900 dark:text-rose-300 font-bold' : 'text-slate-400'}`}>
                             {flag.text}
                          </span>
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-6">No notes recorded</p>
                )}
             </div>
          </div>

          {/* History */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
             <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <History size={18} className="text-slate-400" /> Previous Records
             </h3>
             <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {studentMilestones.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No history found</p>
                ) : studentMilestones.map((rec, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedHistoryItem(rec)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all ${selectedHistoryItem?.id === rec.id || (!selectedHistoryItem && i === 0) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                  >
                    <div className="text-left">
                       <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{rec.ageCategory}</p>
                       <p className="text-[10px] text-slate-500 mt-1">
                         {new Date(rec.timestamp).toLocaleDateString()}
                       </p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                ))}
             </div>
          </div>

          {/* Help Card */}
          <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
             <div className="relative z-10">
                <h4 className="text-sm font-bold mb-3">Understanding Progress</h4>
                <p className="text-xs text-blue-100 leading-relaxed mb-6 opacity-90">
                   We track daily activities and skills. These charts show where your child is doing well and where they might need more help.
                </p>
                <button 
                  onClick={() => setShowHelpModal(true)}
                  className="w-full py-3 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all border border-white/10"
                >
                   Learn More
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowHelpModal(false)} />
           <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl">
              <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"><X size={24}/></button>
              <h3 className="text-xl font-bold mb-6">Progress Guide</h3>
              <div className="space-y-6">
                 <div>
                    <h4 className="font-bold text-blue-600 text-sm mb-1 uppercase">Skills Chart</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">A higher score means your child has mastered more goals for their age level.</p>
                 </div>
                 <div>
                    <h4 className="font-bold text-blue-600 text-sm mb-1 uppercase">Lesson Chart</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Shows how many lessons happened each month. Regular lessons help with better results.</p>
                 </div>
                 <div>
                    <h4 className="font-bold text-rose-500 text-sm mb-1 uppercase">Notes (Red Flags)</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">These are specific behaviors our teachers watch for to adjust the learning plan.</p>
                 </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="w-full mt-8 py-3 bg-slate-900 text-white rounded-lg font-bold"
              >
                Close
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
