
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Site, SafetyPermit, TBMReport, ForkliftPlan, OtherRiskReport, HQDirective, ArchiveRecord } from './types';
import { SITES } from './constants';
import SiteSelection from './views/SiteSelection';
import WorkerDashboard from './views/WorkerDashboard';
import HQDashboard from './views/HQDashboard';
import Header from './components/Header';
import Login from './views/Login';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [permits, setPermits] = useState<SafetyPermit[]>([]);
  const [tbmReports, setTbmReports] = useState<TBMReport[]>([]);
  const [forkliftPlans, setForkliftPlans] = useState<ForkliftPlan[]>([]);
  const [otherReports, setOtherReports] = useState<OtherRiskReport[]>([]);
  const [directives, setDirectives] = useState<HQDirective[]>([]);
  const [archives, setArchives] = useState<ArchiveRecord[]>([]);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    (typeof Notification !== 'undefined') ? Notification.permission : 'default'
  );

  // 로딩 화면 제거 (가장 우선순위 높게 실행)
  useEffect(() => {
    const hideLoader = () => {
      const loader = document.getElementById('loading-screen');
      const skipBtn = document.getElementById('force-skip');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.remove();
            if (skipBtn) skipBtn.remove();
        }, 500);
      }
    };
    hideLoader();
  }, []);

  const sendPushNotification = useCallback((title: string, body: string, icon?: string) => {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: icon || 'https://cdn-icons-png.flaticon.com/512/1161/1161388.png',
        });
      }
    } catch (e) {
      console.warn("Notification error:", e);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const checkWeather = () => {
      const mockWindSpeed = 12.5; 
      if (mockWindSpeed >= 10) {
        const windDirective: HQDirective = {
          id: 'SYS_WIND_' + Date.now(),
          content: `[시스템 자동지시] 현재 순간풍속 ${mockWindSpeed}m/s 관측. 모든 작업을 중단하십시오.`,
          timestamp: new Date().toISOString(),
          author: '기상청 API 시스템',
          type: 'SYSTEM',
          weatherCategory: 'WIND'
        };
        
        setDirectives(prev => {
          if (prev.some(d => d.weatherCategory === 'WIND')) return prev;
          sendPushNotification("⚠️ 긴급 기상 특보", `강풍 ${mockWindSpeed}m/s 관측. 안전 대피 바랍니다.`);
          return [windDirective, ...prev];
        });
      }
    };
    
    const timer = setTimeout(checkWeather, 4000);
    return () => clearTimeout(timer);
  }, [sendPushNotification]);

  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined' && Notification.requestPermission) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      } catch (e) {
        console.warn("Permission request error:", e);
      }
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const syncToNAS = (siteId: string, category: ArchiveRecord['category'], fileName: string) => {
    const site = SITES.find(s => s.id === siteId);
    const dateStr = new Date().toISOString().split('T')[0];
    const newRecord: ArchiveRecord = {
      id: 'ARC' + Date.now(),
      siteId,
      category,
      fileName,
      nasPath: `\\\\GRANDSUN-NAS\\Safety_Data\\${site?.name || '공통'}\\${dateStr}\\${category}\\${fileName}`,
      fileSize: (Math.random() * 5 + 1).toFixed(1) + 'MB',
      timestamp: new Date().toISOString(),
      status: 'SYNCED'
    };
    setArchives(prev => [newRecord, ...prev]);
  };

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (notificationPermission === 'default') requestNotificationPermission();
  };

  const handleLogout = () => { setRole(null); setCurrentSite(null); };

  const addPermit = (permit: SafetyPermit) => {
    setPermits(prev => [permit, ...prev]);
    syncToNAS(permit.siteId, 'PERMIT', `작업허가서_${permit.id}.pdf`);
  };

  const addTBMReport = (report: TBMReport) => {
    setTbmReports(prev => [report, ...prev]);
    syncToNAS(report.siteId, 'TBM', `TBM점검표_${report.id}.pdf`);
  };

  const addForkliftPlan = (plan: ForkliftPlan) => {
    setForkliftPlans(prev => [plan, ...prev]);
    syncToNAS(plan.siteId, 'PLAN', `양중계획서_${plan.id}.pdf`);
  };

  const addOtherReport = (report: OtherRiskReport) => {
    setOtherReports(prev => [report, ...prev]);
    syncToNAS(report.siteId, 'EMERGENCY', `긴급보고_${report.id}.pdf`);
  };

  const addDirective = (directive: HQDirective) => {
    setDirectives(prev => [directive, ...prev]);
    syncToNAS(directive.siteId || 'ALL', 'EMERGENCY', `본사지시_${directive.id}.txt`);
    const targetName = directive.siteId ? SITES.find(s => s.id === directive.siteId)?.name : "전체 현장";
    sendPushNotification(`📢 본사 안전 지시`, `[${targetName}] ${directive.content}`);
  };

  const approvePermit = (id: string) => {
    setPermits(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, status: 'APPROVED' as const, approvedAt: new Date().toISOString() } : p);
      sendPushNotification("✅ 작업 승인 완료", "현장 작업을 개시해도 좋습니다.");
      return updated;
    });
  };

  if (!role) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <Header 
        role={role} 
        onLogout={handleLogout} 
        siteName={currentSite?.name} 
        onBack={currentSite ? () => setCurrentSite(null) : undefined}
        onInstall={deferredPrompt ? handleInstallClick : undefined}
        notificationStatus={notificationPermission}
        onRequestNotifications={requestNotificationPermission}
      />
      <main className="max-w-7xl mx-auto pb-20">
        {role === 'ADMIN' ? (
          <HQDashboard 
            permits={permits} 
            tbmReports={tbmReports} 
            forkliftPlans={forkliftPlans}
            otherReports={otherReports}
            directives={directives}
            archives={archives}
            onApprove={approvePermit}
            onAddDirective={addDirective}
          />
        ) : (
          currentSite ? (
            <WorkerDashboard 
              site={currentSite} 
              permits={permits} 
              tbmReports={tbmReports} 
              forkliftPlans={forkliftPlans}
              otherReports={otherReports}
              directives={directives}
              onAddPermit={addPermit}
              onAddTBM={addTBMReport}
              onAddForkliftPlan={addForkliftPlan}
              onAddOtherReport={addOtherReport}
            />
          ) : (
            <div className="p-6">
              <SiteSelection sites={SITES} onSelect={setCurrentSite} />
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default App;
