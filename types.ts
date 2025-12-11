

export enum MouseGender {
  MALE = '雄性 (Male)',
  FEMALE = '雌性 (Female)',
  MIXED = '混合 (Mixed)',
}

export interface SampleRecord {
  id: string;
  receiveDate: string;
  category: string; // e.g. Blood, Tissue, Drug
  storageMethod: string; // e.g. -80C, RT
  notes?: string;
  imageUrls?: string[]; // Array of image object URLs
}

export type EventType = '异常 (Exception)' | '变更 (Client Change)' | '其他 (Other)';

export interface ProjectEvent {
  id: string;
  date: string;
  type: EventType;
  description: string;
  attachmentName?: string;
  attachmentUrl?: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  quantity: string;
  isPrepared: boolean;
  notes?: string;
}

export interface ProjectProgress {
  startDate?: string;
  transferDate?: string;
  executionPlanFileName?: string;
  executionPlanFileUrl?: string;
  samples: SampleRecord[];
  events: ProjectEvent[];
  materials: MaterialItem[]; // New: Material Preparation List
}

export interface ProjectScheduling {
  estimatedDate: string;
  location: string;
  isScheduled: boolean;
}

export interface ProjectData {
  id: string; // Unique ID
  clientUnit: string;
  clientName: string;
  projectName: string;
  isolatorCount: number;
  mouseStrain: string;
  mouseGender: MouseGender;
  mouseAgeWeeks: number;
  mouseQuantity: number;
  contractFileName: string;
  contractFileUrl?: string; // Object URL for preview
  createDate: string;
  progress: ProjectProgress;
  scheduling?: ProjectScheduling;
}

export type ViewState = 'DASHBOARD' | 'FORM' | 'PREVIEW' | 'ISOLATORS' | 'INVENTORY' | 'PROGRESS' | 'SCHEDULING';

export enum IsolatorStatus {
  IN_USE = '使用中 (In Use)',
  DISINFECTION = '消毒 (Disinfection)',
  PRESSURE_TEST = '打压 (Pressure Test)',
  CLEANING = '清洁 (Cleaning)',
  SAMPLING_1 = '第一次采样验证 (1st Sampling)',
  SAMPLING_2 = '第二次采样验证 (2nd Sampling)',
  READY = '合格待使用 (Ready)',
}

export interface Isolator {
  id: string;
  status: IsolatorStatus;
  currentProjectId?: string; // Linked project if in use
  customLabel?: string; // Editable text for usage description
  lastUpdated: string;
}

export interface InventoryItem {
  id: string;
  strain: string;
  gender: MouseGender;
  ageWeeks: number;
  quantity: number;
  lastUpdated: string;
}

export type AdminRole = 'PROJECT_LEADER' | 'INVENTORY_LEADER';

export interface Administrator {
  id: string;
  name: string;
  role: AdminRole;
  roleName: string;
  email: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'INFO' | 'WARNING' | 'EMAIL';
  timestamp: number;
}
