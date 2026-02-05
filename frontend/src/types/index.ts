export interface Job {
  id: string;
  title: string;
  organization: string;
  postName: string;
  category: string;
  totalVacancies: number;
  startDate: Date | string;
  lastDate: Date | string;
  examDate?: Date | string;
  applicationFee: string;
  qualification: string;
  ageLimit: string;
  officialLink: string;
  source: string;
  scrapedAt: Date | string;
  verifiedAt?: Date | string;
  aiConfidence: number;
  status: 'active' | 'expired' | 'archived';
  notificationsSent?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface User {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  preferences: UserPreferences;
  fcmTokens: FCMToken[];
  role: 'student' | 'owner' | 'operator';
  notificationsReceived: number;
  formsApplied: number;
  createdAt: Date | string;
  lastActiveAt: Date | string;
}

export interface UserPreferences {
  categories: string[];
  states: string[];
  qualifications: string[];
  ageRange: [number, number];
}

export interface FCMToken {
  token: string;
  device: string;
  addedAt: Date | string;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentId?: string;
  amount: number;
  scheduledCallTime?: Date | string;
  completedAt?: Date | string;
  operatorId?: string;
  operatorNotes?: string;
  receipt?: string;
  createdAt: Date | string;
}

export interface SystemLog {
  type: 'scrape_run' | 'health_check' | 'error';
  timestamp: Date | string;
  duration?: number;
  itemsCollected?: number;
  itemsProcessed?: number;
  itemsApproved?: number;
  errors?: number;
  details?: any;
}
