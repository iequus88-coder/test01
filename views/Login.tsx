
import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Building2, UserCircle2, ShieldCheck, ChevronRight, Wand2, RefreshCw, Key, Info, X, ScrollText, CheckCircle2, SmartPhone, Share, PlusSquare, MoreVertical, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mascotUrl, setMascotUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSupervisorDuties, setShowSupervisorDuties] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const generateMascot = async () => {
    setErrorStatus(null);
    setIsGenerating(true);
    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setIsGenerating(false);
        return;
      }

      if (!process.env.API_KEY) {
        throw new Error("API_KEY_MISSING");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ 
            text: "A friendly, fit 3D illustrative character of a young male safety manager. Waist-up portrait. He wears a yellow hard hat, a grey suit, and a bright orange reflective safety vest. He is smiling and waving. Isolated on a white background. Pixar style." 
          }],
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part?.inlineData) {
        setMascotUrl(`data:image/png;base64,${part.inlineData.data}`);
      }
    } catch (error: any) {
      console.error("Mascot generation failed:", error);
      setErrorStatus(error.message === "API_KEY_MISSING" ? "API 키를 먼저 설정해 주세요." : "네트워크 연결이 불안정합니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateMascot();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-indigo-950 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in relative mt-28 mb-10">
        
        {/* 상단 액션 버튼들 */}
        <div className="absolute top-8 right-8 flex space-x-2 z-10">
          <button 
            onClick={() => setShowInstallGuide(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100 shadow-sm hover:bg-yellow-100 transition-all"
          >
            <SmartPhone size={14} />
            <span className="text-[9px] font-black uppercase">바로가기 설정</span>
          </button>
          <button 
            onClick={() => setShowSupervisorDuties(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm border border-slate-100 group"
          >
            <Info size={14} />
          </button>
        </div>

        <div className="relative h-40 -mt-36 mb-6 flex justify-center items-center">
          <div className="w-48 h-48 bg-white rounded-full shadow-xl flex items-center justify-center overflow-hidden border-4 border-white relative">
            {isGenerating ? (
              <div className="flex flex-col items-center">
                <RefreshCw className="text-blue-600 animate-spin mb-2" size={32} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">연결 확인 중...</span>
              </div>
            ) : mascotUrl ? (
              <div className="relative group w-full h-full">
                <img 
                  src={mascotUrl} 
                  alt="AI 안전 마스코트" 
                  className="w-full h-full object-contain transform scale-125"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-slate-300">
                <AlertCircle size={32} className="mb-2 opacity-20" />
                <span className="text-[9px] font-black text-center">{errorStatus || "안전 관리 시스템 준비 완료"}</span>
                <button onClick={generateMascot} className="mt-2 text-[10px] text-blue-500 font-bold underline">새로고침</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 px-4 py-1.5 rounded-full flex items-center">
            <ShieldCheck className="text-blue-700 mr-2" size={16} />
            <span className="text-[10px] font-black text-blue-800 uppercase tracking-[0.2em]">안전 제일</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-1 tracking-tighter">(주)그랜드썬에스피</h1>
        <p className="text-slate-500 font-bold mb-8 text-xs tracking-widest uppercase italic">Solar Safety Master v4.1</p>

        <div className="space-y-4">
          <button 
            onClick={() => onLogin('WORKER')}
            className="w-full flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50 transition-all group shadow-sm"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm mr-4 transition-colors">
                <UserCircle2 size={28} />
              </div>
              <div className="text-left">
                <span className="block font-black text-slate-800 text-lg tracking-tight">현장 책임자</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase italic">LOGIN AS SITE MANAGER</span>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-blue-600" size={20} />
          </button>

          <button 
            onClick={() => onLogin('ADMIN')}
            className="w-full flex items-center justify-between p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50 transition-all group shadow-sm"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm mr-4 transition-colors">
                <Building2 size={28} />
              </div>
              <div className="text-left">
                <span className="block font-black text-slate-800 text-lg tracking-tight">본사 관리부</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase italic">LOGIN AS HQ ADMIN</span>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-blue-600" size={20} />
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <button 
            onClick={() => window.aistudio.openSelectKey()}
            className="flex items-center text-[10px] font-black text-slate-300 hover:text-blue-500 transition-colors uppercase tracking-widest mb-4"
          >
            <Key size={12} className="mr-1.5" /> API 키 다시 설정하기
          </button>
          <div className="w-full border-t border-slate-50 pt-6">
            <p className="text-[9px] text-slate-300 font-black tracking-widest">
              현장 바로가기 연결에 문제가 있다면 브라우저 캐시를 삭제해 주세요.
            </p>
          </div>
        </div>
      </div>

      {/* 홈 화면 추가 가이드 모달 */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in" onClick={() => setShowInstallGuide(false)}>
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border-b-8 border-yellow-500" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-yellow-50/50">
              <div className="flex items-center space-x-2">
                <div className="bg-yellow-500 p-2 rounded-xl text-white shadow-lg">
                  <SmartPhone size={20} />
                </div>
                <h3 className="font-black text-lg text-slate-900 tracking-tighter italic">홈 화면 바로가기 생성</h3>
              </div>
              <button onClick={() => setShowInstallGuide(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-7 space-y-6 text-left">
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[11px] font-black text-slate-900 mb-2 flex items-center italic">
                    <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] not-italic mr-2">1</span>
                    아이폰 (Safari)
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 pl-7 leading-relaxed">
                    하단 <Share size={12} className="inline mx-1 text-blue-500" /> [공유] 클릭 → [홈 화면에 추가] 선택
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[11px] font-black text-slate-900 mb-2 flex items-center italic">
                    <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] not-italic mr-2">2</span>
                    안드로이드 (Chrome/삼성)
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 pl-7 leading-relaxed">
                    상단/하단 <MoreVertical size={12} className="inline mx-1 text-blue-500" /> [메뉴] 클릭 → [홈 화면에 추가] 또는 [앱 설치] 선택
                  </p>
                </div>
              </div>
              <button onClick={() => setShowInstallGuide(false)} className="w-full py-4 bg-yellow-500 text-white font-black rounded-2xl shadow-xl shadow-yellow-100 uppercase italic">안내 닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 관리감독자 업무 안내 모달 (기존 동일) */}
      {showSupervisorDuties && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowSupervisorDuties(false)}>
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border-b-8 border-blue-600" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
                  <ScrollText size={20} />
                </div>
                <h3 className="font-black text-lg text-slate-900 tracking-tighter italic">관리감독자의 법적 업무</h3>
              </div>
              <button onClick={() => setShowSupervisorDuties(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-7 space-y-4">
              {[
                { title: "설비 점검", desc: "기계·기구 및 설비의 안전·보건 상태 점검" },
                { title: "보호구 관리", desc: "근로자의 보호구 착용 지도 및 감독" },
                { title: "사고 보고", desc: "산업재해 발생 시 즉시 보고 및 응급 조치" },
                { title: "위험 개선", desc: "유해·위험요인 파악 및 개선조치 시행" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-4 p-3 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100">
                  <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-900 uppercase">{item.title}</p>
                    <p className="text-[10px] font-bold text-slate-500 italic">{item.desc}</p>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowSupervisorDuties(false)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl mt-4 uppercase italic tracking-tighter">내용을 숙지했습니다</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
