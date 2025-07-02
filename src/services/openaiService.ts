import { Contact } from '../types/contact';
import { AIContactAnalysis } from '../types/contact';
import { shouldUseRealAPIs } from '../config/apiConfig';
import { useRealOpenAI } from './realOpenAIService';

interface OpenAIService {
  analyzeContact: (contact: Contact) => Promise<AIContactAnalysis>;
  generateEmail: (contact: Contact, context?: string) => Promise<string>;
  getInsights: (contact: Contact) => Promise<string[]>;
}

class MockOpenAIService implements OpenAIService {
  async analyzeContact(contact: Contact): Promise<AIContactAnalysis> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock analysis based on contact data
    let score = 50;
    const insights: string[] = [];
    const recommendations: string[] = [];
    const riskFactors: string[] = [];
    
    // Calculate score based on various factors
    if (contact.interestLevel === 'hot') score += 30;
    else if (contact.interestLevel === 'medium') score += 15;
    else if (contact.interestLevel === 'low') score += 5;
    
    if (contact.status === 'customer') score += 20;
    else if (contact.status === 'prospect') score += 10;
    
    if (contact.sources.includes('LinkedIn')) score += 10;
    if (contact.sources.includes('Referral')) score += 15;
    
    if (contact.customFields?.['Annual Revenue']) score += 10;
    if (contact.phone) score += 5;
    
    // Generate insights
    if (score >= 80) {
      insights.push('High-value prospect with strong engagement potential');
      recommendations.push('Schedule a product demo within the next week');
    } else if (score >= 60) {
      insights.push('Moderate engagement potential, requires nurturing');
      recommendations.push('Send targeted content based on industry interests');
    } else {
      insights.push('Low engagement, focus on relationship building');
      recommendations.push('Add to nurture campaign for long-term development');
    }
    
    if (contact.interestLevel === 'hot') {
      insights.push('Currently showing high interest levels');
      recommendations.push('Strike while iron is hot - reach out immediately');
    }
    
    if (!contact.phone) {
      riskFactors.push('Missing phone contact information');
    }
    
    if (contact.status === 'churned') {
      riskFactors.push('Previously churned customer - approach with caution');
    }
    
    return {
      score: Math.min(100, Math.max(0, score)),
      insights,
      recommendations,
      riskFactors
    };
  }

  async generateEmail(contact: Contact, context?: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return `Subject: Following up on our conversation

Hi ${contact.firstName},

I hope this email finds you well. I wanted to follow up on our recent discussion about ${contact.company}'s ${context || 'business needs'}.

Based on our conversation, I believe our solution could be a great fit for your ${contact.title} role, particularly in addressing the challenges you mentioned.

Would you be available for a brief 15-minute call this week to discuss how we can help ${contact.company} achieve its goals?

Best regards,
[Your Name]`;
  }

  async getInsights(contact: Contact): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const insights: string[] = [];
    
    if (contact.interestLevel === 'hot') {
      insights.push('🔥 Hot lead - high conversion probability');
    }
    
    if (contact.sources.includes('Referral')) {
      insights.push('🤝 Came through referral - higher trust level');
    }
    
    if (contact.customFields?.['Annual Revenue']) {
      insights.push('💰 Revenue data available - good for pricing strategy');
    }
    
    if (contact.status === 'customer') {
      insights.push('✅ Existing customer - expansion opportunity');
    }
    
    return insights;
  }
}

export const useOpenAI = (): OpenAIService => {
  if (shouldUseRealAPIs()) {
    try {
      return useRealOpenAI();
    } catch (error) {
      console.warn('Failed to initialize real OpenAI service, falling back to mock:', error);
      return new MockOpenAIService();
    }
  }
  return new MockOpenAIService();
};