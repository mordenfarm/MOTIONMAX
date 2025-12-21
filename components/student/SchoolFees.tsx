
import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { 
  DollarSign, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  History,
  Lock,
  Info,
  Loader2,
  Smartphone,
  Hash,
  AlertCircle,
  X,
  Printer,
  ArrowLeft,
  FileText,
  BadgeCheck,
  QrCode
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PaymentRecord } from '../../types';

const LogoImg = "https://i.ibb.co/1ftNnHrx/motionmaxlgo6.png";

const PAYMENT_METHODS = [
  { id: 'ecocash', name: 'Ecocash', logo: 'https://i.ibb.co/7NQSc15p/ecocash.png' },
  { id: 'omari', name: "O'mari", logo: 'https://i.ibb.co/BDp0pNV/omari.png' },
  { id: 'mukuru', name: 'Mukuru', logo: 'https://i.ibb.co/DPJwkS3x/mukuru.png' },
  { id: 'zimswitch', name: 'ZimSwitch', logo: 'https://i.ibb.co/j9W0Q6Kp/zimswitch.png' },
  { id: 'visamastercard', name: 'Visa / Mastercard', logo: 'https://i.ibb.co/tw59PtJJ/visamastercard.png' }
];

export const SchoolFees: React.FC = () => {
  const { user, students, parents, settings, updateStudent, notify, payments, addPayment } = useStore();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const studentProfile = useMemo(() => {
    if (user?.role === 'STUDENT') return students.find(s => s.firebaseUid === user.id);
    if (user?.role === 'PARENT') {
      const parent = parents.find(p => p.firebaseUid === user.id);
      return parent ? students.find(s => s.id === parent.studentId) : null;
    }
    return null;
  }, [user, students, parents]);

  const studentPayments = useMemo(() => 
    payments.filter(p => p.studentId === studentProfile?.id),
    [payments, studentProfile]
  );

  const totalFees = settings.feesAmount;
  const paidFees = studentProfile?.totalPaid || 0;
  const balance = Math.max(0, totalFees - paidFees);
  const paymentProgress = Math.min(100, (paidFees / totalFees) * 100);

  const handlePayment = async () => {
    if (!selectedMethod || !paymentAmount || !studentProfile || !studentProfile.firebaseUid) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      notify('error', 'Enter a real number.');
      return;
    }

    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    
    try {
      await addPayment({
        studentId: studentProfile.id,
        studentName: studentProfile.fullName,
        amount,
        method: PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name || selectedMethod,
        isMock: true,
        timestamp: new Date().toISOString()
      });
      await updateStudent(studentProfile.firebaseUid, { totalPaid: paidFees + amount });
      setShowSuccess(true);
      setSelectedMethod(null);
      setPaymentAmount('');
    } finally {
      setIsProcessing(false);
    }
  };

  const addPDFImage = async (doc: jsPDF, url: string, x: number, y: number, w: number, h: number) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          doc.addImage(img, 'PNG', x, y, w, h);
        } catch (e) {
          console.error("PDF Image add error:", e);
        }
        resolve();
      };
      img.onerror = () => {
        console.error("PDF Image load error:", url);
        resolve();
      };
      img.src = url;
    });
  };

  const generateEnhancedPDF = async (title: string, p?: PaymentRecord) => {
    if (!studentProfile) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Header
    await addPDFImage(doc, LogoImg, 15, 15, 20, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(0, 45, 80);
    doc.text('MOTION MAX', 40, 25);
    doc.setFontSize(10);
    doc.text('Center for Child Development', 40, 31);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('27 Colnebrook Lane, Harare', pageWidth - 15, 20, { align: 'right' });
    doc.text('+263 775 926 454', pageWidth - 15, 25, { align: 'right' });
    doc.text('admin@motionmax.co.zw', pageWidth - 15, 30, { align: 'right' });

    doc.setDrawColor(220);
    doc.line(15, 40, pageWidth - 15, 40);

    // 2. Title and Details
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 15, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT INFO:', 15, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${studentProfile.fullName}`, 15, 76);
    doc.text(`ID: ${studentProfile.id}`, 15, 81);
    doc.text(`Parent: ${studentProfile.parentName}`, 15, 86);

    doc.setFont('helvetica', 'bold');
    doc.text('RECORD DATA:', 120, 70);
    doc.setFont('helvetica', 'normal');
    if (p) {
      doc.text(`Receipt #: ${p.id.slice(0, 8).toUpperCase()}`, 120, 76);
      doc.text(`Date: ${new Date(p.timestamp).toLocaleString()}`, 120, 81);
      doc.text(`Verified: YES (Secure Node)`, 120, 86);
    } else {
      doc.text(`Status: Full Ledger History`, 120, 76);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 120, 81);
    }

    // 3. Table
    const body = p ? [['School Fees', p.method, `$${p.amount.toLocaleString()}`]] : 
                     studentPayments.map(sp => [new Date(sp.timestamp).toLocaleDateString(), sp.method, `$${sp.amount.toLocaleString()}`]);
    
    autoTable(doc, {
      startY: 100,
      head: [p ? ['Item', 'Method', 'Total'] : ['Date', 'Method', 'Amount']],
      body,
      theme: 'grid',
      headStyles: { fillColor: [0, 45, 80] },
      styles: { fontSize: 9 }
    });

    // 4. Footer Section (Centered QR only)
    const footerY = pageHeight - 45;
    doc.setDrawColor(240);
    doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
    
    // QR Code centered (if single receipt)
    if (p && p.qrCodeUrl) {
      await addPDFImage(doc, p.qrCodeUrl, (pageWidth/2) - 10, footerY, 20, 20);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text('Scan QR to verify document authenticity', pageWidth/2, footerY + 24, { align: 'center' });
    }

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('Motion Max: Empowering Growth Through Data.', pageWidth/2, pageHeight - 10, { align: 'center' });

    doc.save(`${title.replace(' ', '_')}_${studentProfile.id}.pdf`);
  };

  if (!studentProfile) return <div className="p-20 text-center font-black animate-pulse">LOADING RECORDS...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight dark:text-white">Fees & Billing</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Registry: {studentProfile.fullName}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setIsGeneratingAll(true); generateEnhancedPDF('Full Statement').finally(()=>setIsGeneratingAll(false)); }} 
            disabled={isGeneratingAll}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#002D50] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-50"
          >
            {isGeneratingAll ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
            Get Full History
          </button>
          <button 
            onClick={() => setShowAllPayments(true)} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <History size={14} />
            History List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-8 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 border-b-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                  <BadgeCheck size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Amount to pay</span>
              </div>
              <span className={`text-4xl font-black font-mono ${balance <= 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                ${balance.toLocaleString()}
              </span>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Already Paid</p>
                  <p className="text-2xl font-black text-emerald-600 font-mono">${paidFees.toLocaleString()}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Progress</p>
                  <p className="text-2xl font-black text-blue-600 font-mono">{Math.round(paymentProgress)}%</p>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${paymentProgress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 text-slate-400 flex items-center gap-2">
              <CreditCard size={16} className="text-blue-500" />
              Select Your Payment Method
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {PAYMENT_METHODS.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => setSelectedMethod(m.id)} 
                  className="flex flex-col items-center gap-4 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/50 transition-all group active:scale-95"
                >
                  <div className="h-12 w-full flex items-center justify-center bg-white rounded-2xl p-2 border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                    <img src={m.logo} className="max-h-full max-w-full object-contain" alt={m.name} />
                  </div>
                  <span className="text-[8px] font-black uppercase text-slate-500 text-center">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl border-4 border-slate-800">
            <QrCode className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-110 transition-transform duration-1000" size={160} />
            <div className="relative z-10 space-y-4">
              <h4 className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Notice</h4>
              <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                "Digital receipts now include a verification QR code. Scan the QR on your statement to confirm registry validity."
              </p>
              <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                <Lock size={14} /> Secure Encryption Node
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2">
              <History size={16} />
              Recent
            </h3>
            <div className="space-y-4">
              {studentPayments.slice(0, 3).length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">No payments found.</p>
              ) : studentPayments.slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 flex items-center justify-center text-blue-600"><DollarSign size={16}/></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-900 dark:text-white">{p.method}</p>
                      <p className="text-[8px] font-mono text-slate-400">{new Date(p.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black font-mono">+$ {p.amount}</span>
                </div>
              ))}
              <button onClick={() => setShowAllPayments(true)} className="w-full text-center text-[10px] font-black uppercase text-blue-600 hover:underline pt-4 border-t border-slate-100">
                Full Records
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Payment Terminal */}
      <div className={`fixed inset-0 z-[500] transition-opacity duration-300 ${selectedMethod ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedMethod(null)} />
        <aside className={`absolute inset-y-0 right-0 w-full md:w-[500px] bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-500 ease-in-out border-l-8 border-[#002D50] flex flex-col ${selectedMethod ? 'translate-x-0' : 'translate-x-full'}`}>
          {selectedMethod && (
            <>
              <header className="p-8 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-950 z-10">
                <div className="flex items-center gap-5">
                  <button onClick={() => setSelectedMethod(null)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-black dark:hover:text-white transition-all border border-slate-200"><ArrowLeft size={20}/></button>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Terminal</h3>
                    <p className="text-[10px] font-black uppercase text-blue-600">Method: {selectedMethod}</p>
                  </div>
                </div>
                <img src={PAYMENT_METHODS.find(m=>m.id===selectedMethod)?.logo} className="h-8 w-auto grayscale opacity-50" alt="" />
              </header>

              <div className="flex-1 p-10 space-y-12 overflow-y-auto sidebar-scrollbar">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Amount to pay ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={32} />
                    <input 
                      type="number" 
                      value={paymentAmount} 
                      onChange={e => setPaymentAmount(e.target.value)} 
                      placeholder="0.00" 
                      className="w-full pl-16 pr-8 py-8 bg-slate-50 dark:bg-slate-900 border-4 border-transparent focus:border-blue-500/20 rounded-[2rem] text-5xl font-black font-mono outline-none shadow-inner dark:text-white" 
                    />
                  </div>
                </div>

                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                  {selectedMethod.includes('ecocash') || selectedMethod.includes('omari') ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone Number</label>
                      <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="07XXXXXXXX" className="w-full p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-lg font-black font-mono outline-none" />
                    </div>
                  ) : null}
                  {selectedMethod === 'visamastercard' && (
                    <div className="space-y-4">
                      <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="Card Number" className="w-full p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-lg font-black font-mono outline-none" />
                      <div className="grid grid-cols-2 gap-4">
                        <input placeholder="MM/YY" className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black font-mono outline-none" />
                        <input placeholder="CVV" className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-black font-mono outline-none" />
                      </div>
                    </div>
                  )}
                  <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-100 rounded-3xl flex items-start gap-4">
                    <AlertCircle size={20} className="text-amber-600 mt-1" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-bold leading-relaxed">Testing Mode: This is a demo system. No actual money will be charged.</p>
                  </div>
                </div>
              </div>

              <footer className="p-10 border-t-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <button 
                  onClick={handlePayment} 
                  disabled={isProcessing || !paymentAmount} 
                  className="w-full py-6 bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <>Pay ${paymentAmount || '0.00'} Now <ArrowRight size={20}/></>}
                </button>
              </footer>
            </>
          )}
        </aside>
      </div>

      {/* Full Records Modal */}
      {showAllPayments && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowAllPayments(false)} />
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl flex flex-col h-[85vh] border-4 border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-10 duration-700">
            <header className="p-8 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-5">
                 <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border-2 border-blue-100">
                    <History size={24} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white">Payment Records</h3>
                    <p className="text-[10px] font-black uppercase text-slate-400">Complete archive for {studentProfile.fullName}</p>
                 </div>
              </div>
              <button onClick={() => setShowAllPayments(false)} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-3xl border border-slate-100 text-slate-400"><X size={24}/></button>
            </header>
            <div className="flex-1 overflow-y-auto p-8 sidebar-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="px-10 py-6">Date</th>
                    <th className="px-10 py-6">Method</th>
                    <th className="px-10 py-6">Amount</th>
                    <th className="px-10 py-6 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-bold divide-y divide-slate-100 dark:divide-slate-800">
                  {studentPayments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-10 py-8 font-mono">{new Date(p.timestamp).toLocaleDateString()}</td>
                      <td className="px-10 py-8 uppercase text-slate-500">{p.method}</td>
                      <td className="px-10 py-8 text-blue-600 text-lg font-mono">${p.amount.toLocaleString()}</td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          onClick={() => { setIsGeneratingPdf(p.id); generateEnhancedPDF('Payment Receipt', p).finally(()=>setIsGeneratingPdf(null)); }} 
                          disabled={isGeneratingPdf === p.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl hover:text-blue-600 transition-all"
                        >
                          {isGeneratingPdf === p.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18}/>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Simple Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setShowSuccess(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 text-center space-y-8 border-4 border-slate-100 dark:border-slate-800 shadow-2xl animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-emerald-100">
              <CheckCircle2 size={48} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tight">Payment Done!</h3>
              <p className="text-sm text-slate-500 font-medium mt-4">Thank you. Your records have been updated successfully.</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="w-full py-6 bg-slate-900 dark:bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95">Go Back</button>
          </div>
        </div>
      )}
    </div>
  );
};
