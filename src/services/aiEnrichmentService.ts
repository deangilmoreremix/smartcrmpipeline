import { useOpenAI } from './openaiService';
import { useGeminiAI } from './geminiService';
import { IntelligentAIService } from './intelligentAIService';

export interface ContactEnrichmentData {
  name?: string;
  title?: string;
  company?: string;
  industry?: string;
  phone?: string;
  email?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  website?: string;
  location?: string;
  avatar?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  notes?: string;
  confidence?: number;
  aiProvider?: string;
  extraData?: Record<string, any>;
}

export interface CompanyEnrichmentData {
  name?: string;
  domain?: string;
  industry?: string;
  description?: string;
  size?: string;
  founded?: string;
  headquarters?: string;
  logo?: string;
  revenue?: string;
  keyPeople?: Array<{name: string; title: string}>;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  competitors?: string[];
  technologiesUsed?: string[];
  fundingHistory?: string;
  confidence?: number;
  aiProvider?: string;
  extraData?: Record<string, any>;
}

export interface DealEnrichmentData {
  title?: string;
  company?: string;
  contact?: string;
  value?: number;
  probability?: number;
  insights?: string[];
  risks?: string[];
  recommendations?: string[];
  suggestedNextSteps?: string[];
  similarDeals?: Array<{title: string; outcome: string; value: number}>;
  confidence?: number;
  aiProvider?: string;
  extraData?: Record<string, any>;
}

class AIEnrichmentService {
  private intelligentAI: IntelligentAIService;

  constructor() {
    const openaiService = useOpenAI();
    const geminiService = useGeminiAI();
    this.intelligentAI = new IntelligentAIService(openaiService, geminiService);
  }

  async enrichContact(contactData: Partial<ContactEnrichmentData>): Promise<ContactEnrichmentData> {
    console.log('🔍 Enriching contact data...');
    try {
      if (!contactData.email && !contactData.name) {
        throw new Error('Insufficient contact data for enrichment');
      }

      // Use intelligent AI to research contact
      let result: ContactEnrichmentData = {};
      
      if (contactData.name && contactData.company) {
        // If we have name and company, we can do deeper research
        const personName = contactData.name;
        const companyName = contactData.company;
        
        // Use the intelligent routing for contact research
        const contactInfo = await this.intelligentAI.researchContact(
          personName,
          companyName,
          'speed' // Prioritize speed for contact enrichment
        );
        
        result = {
          title: contactInfo.title || contactData.title,
          phone: contactInfo.phone || contactData.phone,
          linkedinUrl: contactInfo.linkedin || contactData.linkedinUrl,
          industry: contactInfo.department || contactData.industry,
          location: contactInfo.location || contactData.location,
          notes: contactInfo.background || '',
          socialProfiles: {
            linkedin: contactInfo.linkedin || contactData.socialProfiles?.linkedin,
          },
          confidence: 70,
          aiProvider: contactInfo.aiProvider || '⚡ Gemini Flash'
        };
      } else {
        // Basic enrichment with available data
        result = {
          confidence: 40,
          aiProvider: '💡 Basic Enrichment',
          notes: 'Limited data available for enrichment. Consider adding more contact details.'
        };
      }

      return {
        ...contactData,
        ...result
      };
    } catch (error) {
      console.error('❌ Contact enrichment failed:', error);
      return {
        ...contactData,
        confidence: 0,
        aiProvider: '❌ Enrichment Failed',
        notes: 'Failed to enrich contact data. Please try again later.'
      };
    }
  }

  async enrichCompany(companyData: Partial<CompanyEnrichmentData>): Promise<CompanyEnrichmentData> {
    console.log('🔍 Enriching company data...');
    try {
      if (!companyData.name) {
        throw new Error('Company name is required for enrichment');
      }
      
      // Use the intelligent AI for company research
      const companyInfo = await this.intelligentAI.researchCompany(
        companyData.name,
        companyData.domain,
        'quality' // Prioritize quality for company research
      );
      
      const result: CompanyEnrichmentData = {
        industry: companyInfo.industry || companyData.industry,
        description: companyInfo.description || companyData.description,
        size: companyInfo.employeeCount || companyData.size,
        headquarters: companyInfo.headquarters || companyData.headquarters,
        logo: companyInfo.logoUrl || companyData.logo,
        revenue: companyInfo.revenue || companyData.revenue,
        competitors: companyInfo.competitors || companyData.competitors,
        technologiesUsed: companyInfo.technologies || companyData.technologiesUsed,
        confidence: 80,
        aiProvider: companyInfo.aiProvider || '🧠 Gemini Pro'
      };
      
      return {
        ...companyData,
        ...result
      };
    } catch (error) {
      console.error('❌ Company enrichment failed:', error);
      return {
        ...companyData,
        confidence: 0,
        aiProvider: '❌ Enrichment Failed',
        notes: 'Failed to enrich company data. Please try again later.'
      };
    }
  }

  async enrichDeal(dealData: Partial<DealEnrichmentData>): Promise<DealEnrichmentData> {
    console.log('🔍 Enriching deal data...');
    try {
      if (!dealData.title || !dealData.company) {
        throw new Error('Deal title and company are required for enrichment');
      }
      
      // Use AI to analyze the deal
      const dealSummary = await this.intelligentAI.generateDealSummary(dealData, 'quality');
      const nextActions = await this.intelligentAI.suggestNextActions(dealData, 'quality');
      const insights = await this.intelligentAI.getInsights(dealData, 'quality');
      
      const result: DealEnrichmentData = {
        insights: insights,
        recommendations: [
          'Focus on value proposition alignment with specific needs',
          'Engage decision makers with tailored materials',
          'Address competitive differentiation proactively'
        ],
        suggestedNextSteps: nextActions,
        probability: Math.max(dealData.probability || 0, 65), // Suggest increased probability
        confidence: 85,
        aiProvider: '🤖 GPT-4o / Gemini Hybrid'
      };
      
      return {
        ...dealData,
        ...result
      };
    } catch (error) {
      console.error('❌ Deal enrichment failed:', error);
      return {
        ...dealData,
        confidence: 0,
        aiProvider: '❌ Enrichment Failed',
        notes: 'Failed to enrich deal data. Please try again later.'
      };
    }
  }

  async findContactImage(name: string, company?: string): Promise<string> {
    // For demonstration, generate an avatar URL
    // In a real implementation, this could use profile photo search APIs
    const seed = name.toLowerCase().replace(/\s+/g, '');
    const style = Math.random() > 0.5 ? 'avataaars' : 'micah';
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}${company ? '-' + company : ''}&backgroundColor=3b82f6,8b5cf6,f59e0b,10b981,ef4444`;
  }
}

// Singleton instance
let aiEnrichmentServiceInstance: AIEnrichmentService | null = null;

export const getAIEnrichmentService = (): AIEnrichmentService => {
  if (!aiEnrichmentServiceInstance) {
    aiEnrichmentServiceInstance = new AIEnrichmentService();
  }
  return aiEnrichmentServiceInstance;
};

// For direct importing
export const aiEnrichmentService = getAIEnrichmentService();