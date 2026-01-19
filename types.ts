
export type SiteType = 'ROOF' | 'GROUND';

export interface Site {
  id: string;
  name: string;
  type: SiteType;
  address: string;
  manager: string;
  workPeriod: string;
}

export type PermitStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SafetyPermit {
  id: string;
  siteId: string;
  workType: string;
  description: string;
  status: PermitStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  evidencePhotoUrl?: string; // 지붕 작업/양중 작업 시 필수 증빙 사진
}

export interface TBMReport {
  id: string;
  siteId: string;
  date: string;
  risks: string[];
  photoUrl: string;
  skylightPhotoUrl?: string; // 채광창 보호조치 사진 (태양광 특화)
  outriggerPhotoUrl?: string; // 아웃트리거 확장 사진 (태양광 특화)
  location: { lat: number; lng: number };
  timestamp: string;
  signature: string;
  submitted: boolean;
}

export interface ForkliftPlan {
  id: string;
  siteId: string;
  date: string;
  workName: string;
  workPeriod: string;
  driver: { name: string; contact: string; license: string; };
  signaller: { name: string; contact: string; method: string; };
  machine: { model: string; regNo: string; capacity: string; insuranceDate: string; };
  submittedAt: string;
}

export interface OtherRiskReport {
  id: string;
  siteId: string;
  title: string;
  content: string;
  timestamp: string;
}

export interface HQDirective {
  id: string;
  siteId?: string;
  content: string;
  timestamp: string;
  author: string;
  type?: 'SYSTEM' | 'MANUAL';
  weatherCategory?: 'WIND' | 'HEAT' | 'RAIN';
}

// NAS 데이터 보관 기록
export interface ArchiveRecord {
  id: string;
  siteId: string;
  category: 'TBM' | 'PERMIT' | 'PLAN' | 'EMERGENCY' | 'PHOTO';
  fileName: string;
  nasPath: string; // 사용자 NAS 경로 시뮬레이션
  fileSize: string;
  timestamp: string;
  status: 'SYNCED' | 'TRANSFERRING' | 'FAILED';
}

export type UserRole = 'WORKER' | 'ADMIN';

export interface AppState {
  currentSite: Site | null;
  role: UserRole;
  permits: SafetyPermit[];
  tbmReports: TBMReport[];
  forkliftPlans: ForkliftPlan[];
  otherReports: OtherRiskReport[];
  directives: HQDirective[];
  archives: ArchiveRecord[];
}
