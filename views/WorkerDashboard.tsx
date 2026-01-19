
import React, { useState } from 'react';
import { Site, SafetyPermit, TBMReport, ForkliftPlan, OtherRiskReport, HQDirective } from '../types';
import { 
  FileText, 
  ClipboardCheck, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  ChevronLeft, 
  Truck, 
  User, 
  ShieldAlert,
  Users,
  Calendar,
  Megaphone,
  ShieldCheck as ShieldIcon,
  Wind,
  ShieldAlert as DangerIcon,
  CheckCircle
} from 'lucide-react';

interface WorkerDashboardProps {
  site: Site;
  permits: SafetyPermit[];
  tbmReports: TBMReport[];
  forkliftPlans: ForkliftPlan[];
  otherReports: OtherRiskReport[];
  directives: HQDirective[];
  onAddPermit: (p: SafetyPermit) => void;
  onAddTBM: (r: TBMReport) => void;
  onAddForkliftPlan: (f: ForkliftPlan) => void;
  onAddOtherReport: (o: OtherRiskReport) => void;
}

const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ 
  site, 
  permits, 
  tbmReports, 
  forkliftPlans,
  otherReports,
  directives,
  onAddPermit, 
  onAddTBM,
  onAddForkliftPlan,
  onAddOtherReport
}) => {
  const [activeForm, setActiveForm] = useState<'NONE' | 'PERMIT' | 'FORKLIFT' | 'OTHER' | 'TBM'>('NONE');
  const [hasSkylightPhoto, setHasSkylightPhoto] = useState(false);
  const [hasOutriggerPhoto, setHasOutriggerPhoto] = useState(false);
  
  const latestPermit = permits.filter(p => p.siteId === site.id)[0];
  const isApproved = latestPermit?.status === 'APPROVED';
  const hasForkliftPlan = forkliftPlans.some(p => p.siteId === site.id);
  const hasOtherReports = otherReports.some(o => o.siteId === site.id);
  const hasTBMToday = tbmReports.some(r => r.siteId === site.id && r.date === new Date().toISOString().split('T')[0]);

  // 태양광 특화 위험 요소 (수정됨)
  const SOLAR_SPECIFIC_RISKS = [
    '지붕 채광창(썬라이트) 파손 방지용 덮개 설치 확인',
    '지붕 단부 안전 난간/방호망 설치 확인',
    '양중 장비(크레인/스카이차) 아웃트리거 완전 확장',
    '모듈 양중 시 2줄 걸이 원칙 준수',
    'MC4 커넥터 체결 소홀 방지 및 아크 차단 점검',
    '인버터 작업 전 DC 전압 차단(LOTO) 및 절연구 착용'
  ];

  const handleTBMSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (site.type === 'ROOF' && !hasSkylightPhoto) {
      alert("태양광 지붕 작업 전 [채광창 보호조치 사진] 업로드가 필수입니다.");
      return;
    }
    
    const formData = new FormData(e.currentTarget);
    const risks = formData.getAll('risks') as string[];
    
    const newReport: TBMReport = {
      id: 'T' + Date.now(),
      siteId: site.id,
      date: new Date().toISOString().split('T')[0],
      risks,
      photoUrl: 'https://images.unsplash.com/photo-1590103512238-e7551d0f1f10?q=80&w=400&auto=format&fit=crop', 
      skylightPhotoUrl: hasSkylightPhoto ? 'https://example.com/skylight.jpg' : undefined,
      location: { lat: 35.1, lng: 129.1 }, 
      timestamp: new Date().toLocaleString(),
      signature: '현장소장_전자서명완료',
      submitted: true,
    };
    onAddTBM(newReport);
    setActiveForm('NONE');
  };

  const handlePermitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPermit: SafetyPermit = {
      id: 'P' + Date.now(),
      siteId: site.id,
      workType: formData.get('workType') as string,
      description: formData.get('description') as string,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    onAddPermit(newPermit);
    setActiveForm('NONE');
    alert("본사 관제 센터로 승인 요청이 실시간 연계되었습니다.");
  };

  const handleOtherSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newReport: OtherRiskReport = {
      id: 'O' + Date.now(),
      siteId: site.id,
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      timestamp: new Date().toISOString(),
    };
    onAddOtherReport(newReport);
    setActiveForm('NONE');
    alert("긴급 위험 상황이 본사 NAS로 기록 및 실시간 보고되었습니다.");
  };

  const handleForkliftSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasOutriggerPhoto) {
      alert("장비 양중 전 [아웃트리거 확장 확인 사진] 업로드가 필수입니다.");
      return;
    }
    const formData = new FormData(e.currentTarget);
    const newPlan: ForkliftPlan = {
      id: 'F' + Date.now(),
      siteId: site.id,
      date: new Date().toISOString().split('T')[0],
      workName: formData.get('workName') as string,
      workPeriod: '금일',
      driver: { name: '이장비', contact: '010-1234-5678', license: '1종대형' },
      signaller: { name: '김신호', contact: '010-9876-5432', method: '무전' },
      machine: { model: '카고크레인 5톤', regNo: '경기00-1234', capacity: '5T', insuranceDate: '2026.12.31' },
      submittedAt: new Date().toISOString(),
    };
    onAddForkliftPlan(newPlan);
    setActiveForm('NONE');
  };

  if (activeForm === 'TBM') {
    return (
      <div className="space-y-6 animate-fade-in pb-10 px-4">
        <button onClick={() => setActiveForm('NONE')} className="text-blue-700 font-bold flex items-center p-2"><ChevronLeft size={20} className="mr-1" /> 대시보드</button>
        <div className="flex items-center space-x-3"><Users className="text-green-600" size={32} /><h2 className="text-2xl font-black italic tracking-tighter uppercase">TBM 안전 데이터 연계</h2></div>
        
        <form onSubmit={handleTBMSubmit} className="space-y-8 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="space-y-5">
            <h3 className="text-[12px] font-black text-red-600 uppercase italic tracking-widest border-b border-red-50 pb-3 flex items-center"><DangerIcon size={16} className="mr-2" /> 태양광 특화 강제 점검 (Safety Lock)</h3>
            <div className="grid grid-cols-1 gap-3">
              {SOLAR_SPECIFIC_RISKS.map(risk => (
                <label key={risk} className="flex items-center p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-red-50 transition-all">
                  <input type="checkbox" name="risks" value={risk} className="w-6 h-6 text-red-600 rounded-lg mr-4" />
                  <span className="text-slate-700 font-bold text-sm italic leading-tight">{risk}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[12px] font-black text-blue-600 uppercase italic tracking-widest border-b border-blue-50 pb-3">증빙 사진 연계 (NAS 자동 전송)</h3>
            <div className="grid grid-cols-2 gap-4">
               <button type="button" onClick={() => setHasSkylightPhoto(true)} className={`p-6 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center space-y-2 transition-all ${hasSkylightPhoto ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                  <Camera size={32} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">채광창 보호조치</span>
                  {hasSkylightPhoto && <CheckCircle size={16} />}
               </button>
               <button type="button" className="p-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center space-y-2 text-slate-300">
                  <Camera size={32} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">전체 안전회의</span>
               </button>
            </div>
          </div>

          <button type="submit" className="w-full py-6 bg-green-600 text-white font-black text-xl rounded-[2rem] shadow-2xl active:scale-95 transition-all italic tracking-tighter uppercase">본사 데이터 전송 및 NAS 아카이빙</button>
        </form>
      </div>
    );
  }

  // 양중 계획서 폼
  if (activeForm === 'FORKLIFT') {
    return (
      <div className="space-y-6 animate-fade-in pb-10 px-4">
        <button onClick={() => setActiveForm('NONE')} className="text-blue-700 font-bold flex items-center p-2"><ChevronLeft size={20} className="mr-1" /> 대시보드</button>
        <div className="flex items-center space-x-3"><Truck className="text-slate-900" size={32} /><h2 className="text-2xl font-black italic tracking-tighter uppercase">양중 및 장비 작업 계획</h2></div>
        
        <form onSubmit={handleForkliftSubmit} className="space-y-8 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
           <div className="space-y-4">
              <label className="text-[11px] font-black text-slate-400 uppercase italic px-1">작업 내용</label>
              <input name="workName" placeholder="모듈 20팔레트 지붕 양중" className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-4 focus:ring-blue-100 font-black italic" />
           </div>
           
           <div className="space-y-4">
              <h3 className="text-[12px] font-black text-red-600 uppercase italic tracking-widest border-b border-red-50 pb-3">장비 안전 필수 사진</h3>
              <button type="button" onClick={() => setHasOutriggerPhoto(true)} className={`w-full p-10 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center space-y-2 transition-all ${hasOutriggerPhoto ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                  <Camera size={48} />
                  <span className="text-[11px] font-black uppercase tracking-widest italic">아웃트리거 완전 확장 및 지반 보강 확인</span>
                  {hasOutriggerPhoto && <CheckCircle size={20} className="mt-2" />}
              </button>
           </div>
           
           <button type="submit" className="w-full py-6 bg-slate-900 text-white font-black text-xl rounded-[2rem] shadow-2xl active:scale-95 transition-all italic tracking-tighter uppercase">양중 계획 제출 (NAS 기록)</button>
        </form>
      </div>
    );
  }

  // (Permit, Other 폼 간소화된 버전 유지하되 동일 로직 적용 가능)
  if (activeForm === 'PERMIT') {
     return (
        <div className="space-y-6 animate-fade-in pb-10 px-4">
           <button onClick={() => setActiveForm('NONE')} className="text-blue-700 font-bold flex items-center p-2"><ChevronLeft size={20} className="mr-1" /> 대시보드</button>
           <div className="flex items-center space-x-3"><FileText className="text-blue-600" size={32} /><h2 className="text-2xl font-black italic tracking-tighter uppercase">안전작업 승인 연계</h2></div>
           <form onSubmit={handlePermitSubmit} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
              <select name="workType" className="w-full p-6 bg-slate-50 rounded-3xl border-none font-black text-lg italic outline-none">
                 <option>태양광 지붕 모듈 시공 (추락위험)</option>
                 <option>크레인 자재 양중 (낙하위험)</option>
                 <option>전기 결선 및 인버터 셋팅 (감전위험)</option>
              </select>
              <textarea name="description" rows={4} placeholder="상세 작업 계획을 입력하십시오." className="w-full p-6 bg-slate-50 rounded-3xl border-none font-bold outline-none italic" />
              <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black text-xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all italic tracking-tighter uppercase">본부 실시간 승인 요청</button>
           </form>
        </div>
     );
  }

  if (activeForm === 'OTHER') {
     return (
        <div className="space-y-6 animate-fade-in pb-10 px-4">
           <button onClick={() => setActiveForm('NONE')} className="text-blue-700 font-bold flex items-center p-2"><ChevronLeft size={20} className="mr-1" /> 대시보드</button>
           <div className="flex items-center space-x-3"><DangerIcon className="text-red-600" size={32} /><h2 className="text-2xl font-black italic tracking-tighter uppercase">긴급 위험 상황 보고</h2></div>
           <form onSubmit={handleOtherSubmit} className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
              <input name="title" placeholder="위험 상황 제목 (예: 지붕 패널 부식 심함)" className="w-full p-6 bg-slate-50 rounded-3xl border-none font-black text-lg italic outline-none" />
              <textarea name="content" rows={6} placeholder="상세 내용을 입력하십시오. 즉시 NAS에 보관됩니다." className="w-full p-6 bg-slate-50 rounded-3xl border-none font-bold outline-none italic" />
              <button type="submit" className="w-full py-6 bg-red-600 text-white font-black text-xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all italic tracking-tighter uppercase">긴급 보고 및 지시 연계</button>
           </form>
        </div>
     );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 긴급 지시 섹션 */}
      <div className="px-4">
        {directives.length > 0 && (
          <div className="space-y-4">
            <p className="text-[11px] font-black text-red-600 uppercase tracking-[0.3em] flex items-center italic mb-2 px-2">
              <Megaphone size={16} className="mr-2 animate-bounce-slow" /> 본사 긴급 명령 하달
            </p>
            {directives.slice(0, 2).map((directive) => (
              <div key={directive.id} className="bg-white p-8 rounded-[3.5rem] border-l-[12px] border-red-600 shadow-2xl border border-red-50 relative overflow-hidden animate-in slide-in-from-top-4">
                <div className="absolute -right-4 -bottom-4 text-red-50/20"><Megaphone size={120} /></div>
                <div className="flex justify-between items-center mb-4">
                   <span className="text-[10px] font-black text-white bg-red-600 px-3 py-1 rounded-xl uppercase italic shadow-lg">긴급 하달</span>
                   <span className="text-[10px] font-black text-slate-300 italic tracking-tighter">{new Date(directive.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-xl font-black text-slate-900 leading-tight italic tracking-tighter pr-6 relative z-10">"{directive.content}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 기상 자동 경고 */}
      <div className="mx-4 bg-gradient-to-br from-orange-500 to-red-700 p-8 rounded-[3.5rem] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform"><Wind size={140} /></div>
         <div className="flex items-center space-x-3 mb-6">
            <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md"><Wind size={24} /></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Real-time Weather Alert System</p>
         </div>
         <h4 className="text-3xl font-black italic tracking-tighter leading-tight mb-2">순간 풍속 12.5m/s 돌파</h4>
         <p className="text-sm font-bold text-white/80 italic">모든 크레인 및 지붕 작업 중지 및 자재 결속 필수</p>
      </div>

      {/* 현장 요약 정보 */}
      <div className="mx-4 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
           <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] italic mb-2">Current Site Activity</p>
           <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">{site.name}</h3>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-sm font-black text-blue-700 italic bg-blue-50 px-3 py-1 rounded-xl">{site.workPeriod}</span>
           <span className="text-[10px] font-bold text-slate-300 uppercase mt-1 tracking-widest">NAS SYNC: ACTIVE</span>
        </div>
      </div>

      {/* 메인 연계 메뉴 */}
      <div className="grid grid-cols-1 gap-4 px-4">
        <button onClick={() => setActiveForm('TBM')} className={`flex items-center p-8 rounded-[3.5rem] border-4 transition-all active:scale-[0.98] ${hasTBMToday ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100 shadow-xl shadow-green-50/20'}`}>
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mr-6 shrink-0 shadow-lg ${hasTBMToday ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
            <Users size={32} />
          </div>
          <div className="text-left flex-1">
            <h4 className="font-black text-slate-900 text-2xl tracking-tighter italic leading-tight">TBM & 안전교육 연계</h4>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{hasTBMToday ? 'NAS 아카이빙 완료' : '금일 태양광 특화 위험 점검'}</p>
          </div>
          {hasTBMToday && <CheckCircle2 size={28} className="text-green-500" />}
        </button>

        <button onClick={() => setActiveForm('FORKLIFT')} className={`flex items-center p-8 rounded-[3.5rem] border-4 transition-all active:scale-[0.98] ${hasForkliftPlan ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 shadow-xl shadow-slate-50/20'}`}>
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mr-6 shrink-0 shadow-lg ${hasForkliftPlan ? 'bg-slate-500 text-white' : 'bg-slate-900 text-white'}`}>
            <Truck size={32} />
          </div>
          <div className="text-left flex-1">
            <h4 className="font-black text-slate-900 text-2xl tracking-tighter italic leading-tight">양중 작업 계획서</h4>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{hasForkliftPlan ? '장비 계획 NAS 기록됨' : '크레인/스카이차 안전 계획'}</p>
          </div>
        </button>

        <button onClick={() => setActiveForm('PERMIT')} className={`flex items-center p-8 rounded-[3.5rem] border-4 transition-all active:scale-[0.98] ${isApproved ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 shadow-xl shadow-blue-50/20'}`}>
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mr-6 shrink-0 shadow-lg ${isApproved ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
            <FileText size={32} />
          </div>
          <div className="text-left flex-1">
            <h4 className="font-black text-slate-900 text-2xl tracking-tighter italic leading-tight">작업 허가 연계</h4>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{latestPermit ? (latestPermit.status === 'PENDING' ? '본부 최종 승인 대기 중' : '본부 승인 완료 - 작업 개시') : '안전작업 승인 실시간 연계'}</p>
          </div>
          {isApproved && <CheckCircle size={28} className="text-blue-600" />}
        </button>

        <button onClick={() => setActiveForm('OTHER')} className={`flex items-center p-8 rounded-[3.5rem] border-4 transition-all active:scale-[0.98] ${hasOtherReports ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100 shadow-xl shadow-red-50/20'}`}>
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mr-6 shrink-0 shadow-lg ${hasOtherReports ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}>
            <ShieldAlert size={32} />
          </div>
          <div className="text-left flex-1">
            <h4 className="font-black text-slate-900 text-2xl tracking-tighter italic leading-tight">긴급 위험 보고</h4>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{hasOtherReports ? '본사 NAS 긴급 기록됨' : '현장 순회 중 발견 위험 연계'}</p>
          </div>
        </button>
      </div>

      <div className="pt-8 px-4">
         <button 
           disabled={!isApproved}
           className={`w-full py-12 rounded-[4rem] font-black text-5xl shadow-2xl transition-all tracking-tighter italic border-4 ${isApproved ? 'bg-gradient-to-br from-blue-700 to-indigo-950 text-white border-white/20 active:scale-95 shadow-blue-300' : 'bg-slate-100 text-slate-300 border-slate-50 cursor-not-allowed'}`}
         >
           {isApproved ? '현장 작업 개시' : '본부 승인 대기'}
         </button>
         <p className="text-[10px] text-center text-slate-400 font-black uppercase tracking-[0.4em] mt-10 italic">Grand Sun SP Safety Control System v4.0 (NAS Sync Enabled)</p>
      </div>
    </div>
  );
};

export default WorkerDashboard;
