
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SafetyPermit, TBMReport, ForkliftPlan, HQDirective, OtherRiskReport, Site, ArchiveRecord } from '../types';
import { SITES } from '../constants';
import { 
  LayoutDashboard, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  Calendar, 
  RefreshCw, 
  X, 
  Key,
  PieChart as PieIcon,
  Truck,
  Megaphone,
  Send,
  TrendingUp,
  Activity,
  FileText,
  ShieldAlert,
  MessageSquarePlus,
  Users,
  ChevronRight,
  ArrowRight,
  History,
  AlertTriangle,
  HardDrive,
  FolderOpen,
  Database,
  CloudLightning,
  CheckCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  ComposedChart,
  Line,
  Bar
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

interface HQDashboardProps {
  permits: SafetyPermit[];
  tbmReports: TBMReport[];
  forkliftPlans?: ForkliftPlan[];
  otherReports?: OtherRiskReport[];
  directives: HQDirective[];
  archives: ArchiveRecord[];
  onApprove: (id: string) => void;
  onAddDirective: (d: HQDirective) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between space-x-4 mb-1">
            <span className="text-xs font-bold text-slate-300">{entry.name}:</span>
            <span className="text-sm font-black" style={{ color: entry.color || entry.fill }}>
              {entry.value}{entry.name.includes('이행') ? '%' : '건'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const HQDashboard: React.FC<HQDashboardProps> = ({ permits, tbmReports, forkliftPlans = [], otherReports = [], directives, archives, onApprove, onAddDirective }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mascotUrl, setMascotUrl] = useState<string | null>(null);
  const [isGeneratingMascot, setIsGeneratingMascot] = useState(false);
  
  const [viewingReport, setViewingReport] = useState<TBMReport | null>(null);
  const [viewingPlan, setViewingPlan] = useState<ForkliftPlan | null>(null);
  const [viewingPermit, setViewingPermit] = useState<SafetyPermit | null>(null);
  const [viewingOtherRisks, setViewingOtherRisks] = useState<OtherRiskReport[] | null>(null);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  const [isChartReady, setIsChartReady] = useState(false);
  const [directiveContent, setDirectiveContent] = useState('');
  const [targetSiteId, setTargetSiteId] = useState<string>('ALL');
  
  const directiveSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsChartReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const pendingPermits = permits.filter(p => p.status === 'PENDING');
  const filteredTBMReports = tbmReports.filter(r => r.date === selectedDate);
  const filteredPlans = forkliftPlans.filter(f => f.date === selectedDate);
  
  const totalSites = SITES.length;
  const sitesWithTBMCount = new Set(filteredTBMReports.map(r => r.siteId)).size;
  const sitesWithoutTBMCount = totalSites - sitesWithTBMCount;

  const pieData = useMemo(() => [
    { name: 'TBM 이행 완료', value: sitesWithTBMCount, color: '#3b82f6' },
    { name: 'TBM 미이행', value: sitesWithoutTBMCount, color: '#f1f5f9' },
  ], [sitesWithTBMCount, sitesWithoutTBMCount]);

  const sitePerformanceData = useMemo(() => {
    return SITES.map(site => {
      const report = filteredTBMReports.find(r => r.siteId === site.id);
      return {
        name: site.name.split(' ')[1] || site.name.substring(0, 4),
        fullName: site.name,
        'TBM 이행도': report ? 100 : 0,
        '위험요소 발견': report ? report.risks.length : 0,
      };
    });
  }, [filteredTBMReports]);

  const handleGenerateMascot = async () => {
    setIsGeneratingMascot(true);
    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        alert("API Key가 설정되지 않았습니다.");
        await window.aistudio.openSelectKey();
        setIsGeneratingMascot(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: "3D Friendly Solar Energy Safety Manager character, yellow hard hat, reflective vest, smiling, high-tech command center background, 8k resolution" }] },
      });
      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData) setMascotUrl(`data:image/png;base64,${part.inlineData.data}`);
    } catch (e) { console.error(e); } finally { setIsGeneratingMascot(false); }
  };

  const handleSendDirective = () => {
    if (!directiveContent.trim()) return;
    const newDirective: HQDirective = {
      id: 'D' + Date.now(),
      siteId: targetSiteId === 'ALL' ? undefined : targetSiteId,
      content: directiveContent,
      timestamp: new Date().toISOString(),
      author: '본사 관리자'
    };
    onAddDirective(newDirective);
    setDirectiveContent('');
    setIsInstructionModalOpen(false);
    alert(`${targetSiteId === 'ALL' ? '모든 현장' : SITES.find(s => s.id === targetSiteId)?.name}으로 지시 사항이 연계되었습니다.`);
  };

  const openInstructionForSite = (siteId: string) => {
    setTargetSiteId(siteId);
    setIsInstructionModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-6 md:py-8 space-y-6 md:space-y-8 animate-fade-in pb-24">
      {/* 상단 요약 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-2xl shadow-xl shadow-blue-100">
            <BarChart3 className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">현장 안전 분석 센터</h2>
            <p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-widest italic">Live Solar Safety Monitoring</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
          <Calendar size={18} className="ml-3 text-blue-500" />
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="bg-transparent border-none focus:ring-0 font-black text-slate-700 text-sm outline-none px-2"
          />
          <button onClick={() => window.aistudio.openSelectKey()} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black hover:bg-slate-800 transition-all shadow-lg">API KEY</button>
        </div>
      </div>

      {/* NAS 아카이빙 모니터링 섹션 (새로운 추가 사항) */}
      <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10"><Database size={120} /></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black italic flex items-center tracking-tighter text-blue-400">
              <HardDrive size={22} className="mr-2" /> 본사 NAS 실시간 데이터 아카이빙 현황
            </h3>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">NAS Connection: Stable</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
              <p className="text-[9px] font-black text-white/40 uppercase mb-1">Today Synced</p>
              <p className="text-2xl font-black italic text-blue-400">{archives.length} <span className="text-[10px] text-white/40 not-italic">Files</span></p>
            </div>
            <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
              <p className="text-[9px] font-black text-white/40 uppercase mb-1">NAS Root Path</p>
              <p className="text-[10px] font-black text-white/80 truncate">\\GRANDSUN-NAS\Safety_Data</p>
            </div>
            <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
              <p className="text-[9px] font-black text-white/40 uppercase mb-1">Storage Usage</p>
              <p className="text-2xl font-black italic text-orange-400">72% <span className="text-[10px] text-white/40 not-italic">Utilized</span></p>
            </div>
            <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
              <p className="text-[9px] font-black text-white/40 uppercase mb-1">Last Sync</p>
              <p className="text-[10px] font-black text-white/80">{archives[0]?.timestamp ? new Date(archives[0].timestamp).toLocaleTimeString() : 'Waiting...'}</p>
            </div>
          </div>

          <div className="bg-black/20 rounded-[2rem] overflow-hidden">
            <div className="max-h-40 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-white/5 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 font-black text-white/30 uppercase tracking-widest">분류</th>
                    <th className="px-6 py-3 font-black text-white/30 uppercase tracking-widest">파일명</th>
                    <th className="px-6 py-3 font-black text-white/30 uppercase tracking-widest">NAS 저장 경로</th>
                    <th className="px-6 py-3 font-black text-white/30 uppercase tracking-widest text-center">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {archives.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-white/20 font-black italic uppercase">신규 아카이빙 대기 중...</td></tr>
                  ) : archives.map(arc => (
                    <tr key={arc.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3 font-black text-blue-400 italic">{arc.category}</td>
                      <td className="px-6 py-3 font-bold text-white/70">{arc.fileName}</td>
                      <td className="px-6 py-3 font-mono text-white/40 truncate max-w-[300px]">{arc.nasPath}</td>
                      <td className="px-6 py-3 text-center">
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-lg font-black text-[9px] uppercase tracking-tighter">Synced</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><PieIcon size={120} /></div>
          <h4 className="text-[11px] font-black text-slate-400 uppercase mb-8 flex items-center tracking-[0.2em] w-full italic"><TrendingUp size={14} className="mr-2 text-blue-500" /> 종합 TBM 이행 성과</h4>
          <div className="h-64 w-full relative">
            {isChartReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={10} dataKey="value" animationBegin={200} animationDuration={1500}>
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full w-full bg-slate-50 animate-pulse rounded-[2.5rem]" />}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-4xl font-black text-slate-900 tracking-tighter italic">{Math.round((sitesWithTBMCount / totalSites) * 100)}%</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">Compliance</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col">
          <h4 className="text-[11px] font-black text-slate-400 uppercase mb-8 flex items-center tracking-[0.2em] italic"><Activity size={14} className="mr-2 text-indigo-500" /> 현장별 안전 인덱스 분석</h4>
          <div className="h-64 w-full">
            {isChartReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sitePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={10} fontWeight={900} axisLine={false} tickLine={false} dy={10} tick={{fill: '#94a3b8'}} />
                  <YAxis yAxisId="left" hide domain={[0, 100]} />
                  <YAxis yAxisId="right" hide />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc', radius: 12}} />
                  <Bar yAxisId="left" dataKey="TBM 이행도" fill="#3b82f6" radius={[10, 10, 10, 10]} barSize={24} animationDuration={2000} />
                  <Line yAxisId="right" type="monotone" dataKey="위험요소 발견" stroke="#f59e0b" strokeWidth={4} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} animationDuration={2500} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : <div className="h-full w-full bg-slate-50 animate-pulse rounded-[2.5rem]" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <section className="xl:col-span-2 space-y-8">
          {/* 현장 테이블 및 지시 섹션 (기존과 동일하되 시인성 보강) */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">현장 정보</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center tracking-widest italic">TBM 이행</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center tracking-widest italic">계획/허가</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-center tracking-widest italic bg-blue-50/30">즉시 지시</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {SITES.map(site => {
                  const siteTBM = filteredTBMReports.find(r => r.siteId === site.id);
                  const sitePlan = filteredPlans.find(p => p.siteId === site.id);
                  const sitePermit = permits.filter(p => p.siteId === site.id)[0];
                  const siteDirectives = directives.filter(d => d.siteId === site.id);
                  
                  return (
                    <tr key={site.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800 text-sm italic">{site.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{site.manager} 소장</p>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-xl cursor-pointer ${siteTBM ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-300'}`} onClick={() => siteTBM && setViewingReport(siteTBM)}>
                           {siteTBM ? '완료' : '대기'}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center">
                         <div className="flex items-center justify-center space-x-2">
                           {sitePlan && <button onClick={() => setViewingPlan(sitePlan)} className="p-2 bg-slate-900 text-white rounded-xl"><Truck size={14} /></button>}
                           {sitePermit && <button onClick={() => setViewingPermit(sitePermit)} className="p-2 bg-blue-600 text-white rounded-xl"><FileText size={14} /></button>}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-center bg-blue-50/30">
                         <button onClick={() => openInstructionForSite(site.id)} className="p-2 bg-white text-blue-700 rounded-xl border border-blue-100 shadow-sm hover:bg-blue-600 hover:text-white transition-all">
                            <MessageSquarePlus size={18} />
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 지시 사항 통합 발송 센터 */}
          <div ref={directiveSectionRef} className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-100">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900 flex items-center italic tracking-tighter">
                  <Megaphone size={28} className="text-red-600 mr-3" /> 안전 지시 사항 발송 센터
                </h3>
                <select value={targetSiteId} onChange={(e) => setTargetSiteId(e.target.value)} className="bg-slate-100 border-none text-xs font-black text-slate-700 rounded-2xl p-3 focus:ring-0 italic outline-none">
                  <option value="ALL">전체 현장 (Broadcast)</option>
                  {SITES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
             </div>
            <textarea 
              value={directiveContent}
              onChange={(e) => setDirectiveContent(e.target.value)}
              rows={4}
              placeholder="현장으로 전달할 안전 지시 사항을 입력하세요."
              className="w-full p-10 bg-slate-50 border-2 border-slate-100 rounded-[3rem] focus:border-red-500 font-bold text-lg text-slate-800 outline-none mb-6 shadow-inner"
            />
            <button onClick={handleSendDirective} className="w-full py-7 bg-red-600 text-white font-black rounded-[2rem] flex items-center justify-center space-x-3 shadow-2xl shadow-red-200 active:scale-95 transition-all text-xl uppercase italic tracking-tighter">
              <Send size={24} /> <span>지시 사항 발송 및 NAS 기록</span>
            </button>
          </div>
        </section>

        <section className="space-y-8">
          {/* AI 안전 비서 마스코트 */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl h-[450px]">
             <div className="z-10 flex justify-between items-center w-full mb-6">
                <span className="text-[10px] font-black bg-white/10 px-3 py-1.5 rounded-xl uppercase border border-white/10 italic">Safety AI Core</span>
                <button onClick={handleGenerateMascot} className="text-white/40 hover:text-white transition-all"><RefreshCw size={18} className={isGeneratingMascot ? 'animate-spin' : ''}/></button>
             </div>
             <div className="z-10 flex-1 flex items-center justify-center my-6">
                {isGeneratingMascot ? (
                  <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                ) : mascotUrl ? (
                  <img src={mascotUrl} className="h-64 object-contain animate-float drop-shadow-[0_25px_60px_rgba(59,130,246,0.6)]" />
                ) : <button onClick={handleGenerateMascot} className="p-12 bg-white/5 rounded-full border border-white/10 hover:bg-white/10"><CloudLightning size={56} className="text-white/20" /></button>}
             </div>
             <p className="z-10 text-[12px] font-black text-white/60 text-center italic mt-4 leading-relaxed">"안전은 그랜드썬의 자존심입니다.<br/>NAS 데이터 아카이빙은 24시간 실시간 가동 중입니다."</p>
          </div>

          {/* 승인 대기 리스트 */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50">
             <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center italic">
               <Clock size={20} className="text-orange-500 mr-2" /> 승인 대기 허가서
             </h3>
             <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
               {pendingPermits.length === 0 ? (
                 <p className="text-center py-10 text-slate-300 font-black text-[10px] uppercase tracking-widest italic">All Cleared</p>
               ) : pendingPermits.map(permit => (
                 <div key={permit.id} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 hover:border-blue-500 transition-all">
                    <p className="font-black text-slate-900 text-[13px] mb-2">{SITES.find(s => s.id === permit.siteId)?.name}</p>
                    <div className="bg-white p-4 rounded-2xl mb-4 text-[11px] font-bold text-slate-500 italic">
                       {permit.workType}
                    </div>
                    <button onClick={() => onApprove(permit.id)} className="w-full py-3 bg-blue-600 text-white text-[10px] font-black rounded-xl italic">즉시 승인</button>
                 </div>
               ))}
             </div>
          </div>
        </section>
      </div>

      {/* 모달 영역 (기존과 동일하되 디자인 일관성 유지) */}
      {isInstructionModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in" onClick={() => setIsInstructionModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border-4 border-red-500/20" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 border-b border-slate-100 bg-red-50/50 flex flex-col items-center">
               <div className="bg-red-600 p-4 rounded-full shadow-2xl shadow-red-100 mb-6 animate-pulse"><Megaphone size={32} className="text-white" /></div>
               <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase">현장 긴급 지시</h3>
               <p className="text-[10px] font-bold text-red-600 mt-2 tracking-widest uppercase">To: {targetSiteId === 'ALL' ? 'Broadcast' : SITES.find(s => s.id === targetSiteId)?.name}</p>
            </div>
            <div className="p-10 space-y-6">
               <textarea 
                  autoFocus value={directiveContent} onChange={(e) => setDirectiveContent(e.target.value)} rows={5}
                  placeholder="지시 사항을 입력하세요."
                  className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] focus:border-red-500 font-bold text-lg text-slate-800 outline-none"
               />
               <div className="flex gap-4">
                  <button onClick={handleSendDirective} className="flex-1 py-6 bg-red-600 text-white font-black rounded-3xl shadow-xl italic tracking-tighter">발송 및 기록</button>
                  <button onClick={() => setIsInstructionModalOpen(false)} className="px-8 py-6 bg-slate-100 text-slate-400 font-black rounded-3xl text-sm uppercase">닫기</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* TBM 상세 모달 */}
      {viewingReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setViewingReport(null)}>
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="p-10 border-b border-slate-50 bg-green-50/30 flex justify-between items-center">
              <h3 className="font-black text-2xl italic tracking-tighter uppercase">TBM 안전 보고서</h3>
              <button onClick={() => setViewingReport(null)} className="p-3 hover:bg-white rounded-full transition-colors"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto">
               <img src={viewingReport.photoUrl} className="w-full h-56 object-cover rounded-[2.5rem] border border-slate-100 shadow-xl" />
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-50">
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic mb-1">점검 일시</p>
                     <p className="text-xs font-black text-slate-800 italic">{viewingReport.timestamp}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-50">
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic mb-1">NAS 분류</p>
                     <p className="text-xs font-black text-blue-600 italic">TBM_Archive</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <p className="text-[11px] font-black text-slate-900 uppercase flex items-center italic"><AlertCircle size={16} className="text-red-500 mr-2" /> 감지된 현장 위험 요소</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingReport.risks.map(r => <span key={r} className="bg-red-50 text-red-600 text-[10px] font-black px-4 py-2 rounded-xl border border-red-100 shadow-sm">{r}</span>)}
                  </div>
               </div>
               <button onClick={() => { setViewingReport(null); openInstructionForSite(viewingReport.siteId); }} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl italic">
                  <Megaphone size={20} /> 발견 위험 요소 즉시 지시 연계
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HQDashboard;
