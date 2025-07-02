export interface Contact {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title: string;
  company: string;
  industry?: string;
  avatarSrc?: string;
  status: 'lead' | 'prospect' | 'customer' | 'churned';
  interestLevel: 'hot' | 'medium' | 'low' | 'cold';
  sources: string[];
  socialProfiles?: Record<string, string>;
  customFields?: Record<string, string | number | boolean>;
  notes?: string;
  aiScore?: number;
  lastConnected?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  isFavorite?: boolean;
  lastEnrichment?: {
    confidence: number;
    aiProvider?: string;
    timestamp?: Date;
  };
  
  // Team-related fields
  isTeamMember?: boolean;
  role?: 'sales-rep' | 'manager' | 'executive' | 'admin';
  gamificationStats?: {
    totalDeals: number;
    totalRevenue: number;
    winRate: number;
    currentStreak: number;
    longestStreak: number;
    level: number;
    points: number;
    achievements: string[];
    lastAchievementDate?: Date;
    monthlyGoal?: number;
    monthlyProgress?: number;
  };
}

export interface ContactFilters {
  search: string;
  interestLevel: string;
  status: string;
  source: string;
  company: string;
  isTeamMember?: boolean;
}

export interface AIContactAnalysis {
  score: number;
  insights: string[];
  recommendations: string[];
  riskFactors: string[];
}

export interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  startDate: Date;
  endDate: Date;
  reward: string;
  participants: string[];
  type: 'revenue' | 'deals' | 'streak' | 'conversion';
}