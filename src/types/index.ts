export interface Deal {
  id: string;
  title: string;
  company: string;
  contact: string;
  contactId?: string;
  value: number;
  stage: 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  contactAvatar?: string;
  companyAvatar?: string;
  lastActivity?: string;
  tags?: string[];
  
  // New fields to match contact features
  isFavorite?: boolean;
  customFields?: Record<string, string | number | boolean>;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
  lastEnrichment?: {
    confidence: number;
    aiProvider?: string;
    timestamp?: Date;
  };
}

export interface PipelineColumn {
  id: string;
  title: string;
  dealIds: string[];
  color: string;
}

export interface PipelineStats {
  totalValue: number;
  totalDeals: number;
  averageDealSize: number;
  conversionRate: number;
  stageValues: Record<string, number>;
}

export interface AIInsight {
  dealId: string;
  score: number;
  recommendations: string[];
  riskFactors: string[];
  nextBestActions: string[];
  probability: number;
}