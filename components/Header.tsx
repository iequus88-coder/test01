
import React from 'react';
import { LogOut, ChevronLeft, ShieldCheck, Download, Bell, BellOff, BellRing } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  role: UserRole;
  onLogout: () => void;
  siteName?: string;
  onBack?: () => void;
  onInstall?: () => void;
  notificationStatus?: NotificationPermission;
  onRequestNotifications?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  role, 
  onLogout, 
  siteName, 
  onBack, 
  onInstall,
  notificationStatus,
  onRequestNotifications
}) => {
  return (
    <header className="bg-blue-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {onBack && siteName && (
            <button onClick={onBack} className="mr-1 p-1">
              <ChevronLeft size={24} />
            </button>
          )}
          <ShieldCheck className="text-yellow-400" size={24} />
          <h1 className="font-bold text-lg tracking-tight truncate max-w-[150px] sm:max-w-none">
            {siteName || (role === 'ADMIN' ? '본사 안전 대시보드' : '그랜드썬 안전마스터')}
          </h1>
        </div>
        <div className="flex items-center space-x-1">
          {onRequestNotifications && (
            <button 
              onClick={onRequestNotifications}
              className={`p-2 rounded-full transition-colors flex items-center space-x-1 ${notificationStatus === 'granted' ? 'text-green-300' : 'text-white/50 hover:bg-blue-600'}`}
              title="알림 설정"
            >
              {notificationStatus === 'granted' ? <BellRing size={20} /> : <BellOff size={20} />}
              <span className="text-[10px] font-black hidden lg:inline uppercase tracking-tighter">
                {notificationStatus === 'granted' ? '알림 ON' : '알림 요청'}
              </span>
            </button>
          )}
          {onInstall && (
            <button 
              onClick={onInstall}
              className="p-2 rounded-full hover:bg-blue-600 transition-colors flex items-center space-x-1"
              title="홈 화면에 추가"
            >
              <Download size={20} className="text-yellow-400" />
              <span className="text-[10px] font-black hidden sm:inline uppercase tracking-tighter">설치</span>
            </button>
          )}
          <button 
            onClick={onLogout}
            className="p-2 rounded-full hover:bg-blue-600 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
