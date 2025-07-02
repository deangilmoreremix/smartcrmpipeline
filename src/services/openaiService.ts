import { Contact } from '../types/contact';
import { AIContactAnalysis } from '../types/contact';
import { shouldUseRealAPIs } from '../config/apiConfig';
import { useRealOpenAI } from './realOpenAIService';
import { IntelligentAIService } from './intelligentAIService';

interface OpenAIService {
  analyzeContact: (contact: Contact) => Promise<AIContactAnalysis>;
  generateEmail: (contact: Contact, context?: string) => Promise<string>;
  getInsights: (contact: Contact) => Promise<string[]>;
  generateDealSummary: (dealData: any) => Promise<string>;
  suggestNextActions: (dealData: any) => Promise<string[]>;
}

class MockOpenAIService implements OpenAIService {
  async analyzeContact(contact: Contact): Promise<AIContactAnalysis> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🤖 OpenAI: Analyzing contact (Mock Mode)');
    
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
      insights.push('🎯 High-value prospect with strong engagement potential');
      insights.push('📈 Strong buying signals detected in profile data');
      recommendations.push('Schedule a product demo within the next week');
      recommendations.push('Prepare executive-level presentation materials');
    } else if (score >= 60) {
      insights.push('💡 Moderate engagement potential, requires nurturing');
      insights.push('📊 Contact shows interest but needs education');
      recommendations.push('Send targeted content based on industry interests');
      recommendations.push('Schedule discovery call to understand needs');
    } else {
      insights.push('⏰ Early-stage prospect, focus on relationship building');
      insights.push('📚 Contact needs education about our value proposition');
      recommendations.push('Add to nurture campaign for long-term development');
      recommendations.push('Research company challenges and pain points');
    }
    
    if (contact.interestLevel === 'hot') {
      insights.push('🔥 Currently showing high interest levels');
      recommendations.push('Strike while iron is hot - reach out immediately');
    }
    
    if (!contact.phone) {
      riskFactors.push('⚠️ Missing phone contact information');
    }
    
    if (contact.status === 'churned') {
      riskFactors.push('🚨 Previously churned customer - approach with caution');
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
    
    console.log('✉️ OpenAI: Generating email (Mock Mode)');

    return `Subject: ${context ? `Following up on ${context}` : 'Following up on our conversation'}

Hi ${contact.firstName || contact.name},

I hope this email finds you well. I wanted to follow up on our recent discussion about ${contact.company}'s ${context || 'business objectives'}.

Based on our conversation and your role as ${contact.title}, I believe our solution could provide significant value to your team, particularly in:

• Streamlining operations and reducing costs
• Improving efficiency and productivity
• Driving measurable ROI for ${contact.company}

I'd love to show you how companies similar to ${contact.company} have achieved remarkable results using our platform.

Would you be available for a brief 15-minute call this week to discuss how we can help ${contact.company} achieve its goals?

I'm confident we can deliver substantial value for your team.

Best regards,
[Your Name]

P.S. I've attached a case study from a ${contact.industry || 'similar'} company that saw 40% efficiency improvements.`;
  }

  async getInsights(contact: Contact): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    console.log('💡 OpenAI: Generating insights (Mock Mode)');
    
    const insights: string[] = [];
    
    if (contact.interestLevel === 'hot') {
      insights.push('🔥 Hot lead - high conversion probability, prioritize immediate outreach');
    }
    
    if (contact.sources.includes('Referral')) {
      insights.push('🤝 Referral source indicates higher trust level and faster sales cycle');
    }
    
    if (contact.customFields?.['Annual Revenue']) {
      insights.push('💰 Revenue data available - tailor pricing strategy accordingly');
    }
    
    if (contact.status === 'customer') {
      insights.push('✅ Existing customer - focus on expansion, upselling, and retention');
    }

    if (contact.industry) {
      insights.push(`🏭 Industry expertise: Leverage ${contact.industry} case studies and trends`);
    }

    insights.push('📈 Personalized outreach based on title and company size likely to increase response rates');
    
    return insights;
  }

  async generateDealSummary(dealData: any): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('📋 OpenAI: Generating deal summary (Mock Mode)');
    
    return `## Deal Summary: ${dealData.title}

**Company:** ${dealData.company}  
**Value:** $${dealData.value?.toLocaleString()}  
**Stage:** ${dealData.stage}  
**Probability:** ${dealData.probability}%  

### Key Highlights:
• Strong potential with ${dealData.company} showing genuine interest
• Deal value of $${dealData.value?.toLocaleString()} represents significant opportunity
• Current ${dealData.probability}% probability indicates ${dealData.probability >= 70 ? 'high' : dealData.probability >= 40 ? 'moderate' : 'early'} stage confidence

### Strategic Focus:
${dealData.probability >= 70 ? 'Focus on closing activities and removing final objections' :
  dealData.probability >= 40 ? 'Continue building value and addressing concerns' :
  'Concentrate on qualification and discovery'}

### Next Steps:
• Maintain regular contact with key stakeholders
• Address any remaining technical or financial concerns  
• ${dealData.dueDate ? `Target close date: ${new Date(dealData.dueDate).toLocaleDateString()}` : 'Establish clear timeline for decision'}`;
  }

  async suggestNextActions(dealData: any): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    console.log('🎯 OpenAI: Suggesting next actions (Mock Mode)');
    
    const actions: string[] = [];
    
    switch (dealData.stage) {
      case 'qualification':
        actions.push('📞 Schedule comprehensive discovery call with key stakeholders');
        actions.push('📝 Send detailed qualification questionnaire');
        actions.push('🔍 Research company\'s current challenges and pain points');
        actions.push('👥 Identify all decision makers and influencers');
        break;
      case 'proposal':
        actions.push('📋 Follow up on proposal status and gather feedback');
        actions.push('🎤 Schedule presentation to demonstrate value proposition');
        actions.push('❓ Address any technical or commercial questions');
        actions.push('📊 Provide ROI calculations and business case');
        break;
      case 'negotiation':
        actions.push('📄 Review and negotiate contract terms');
        actions.push('🤝 Schedule final discussion with all stakeholders');
        actions.push('💰 Prepare pricing alternatives and concessions');
        actions.push('⏰ Establish clear timeline for final decision');
        break;
      default:
        actions.push('📅 Schedule regular follow-up meetings');
        actions.push('📚 Send relevant case studies and success stories');
        actions.push('🔗 Connect with additional key stakeholders');
        actions.push('📈 Share industry insights and market trends');
    }

    // Add priority-based actions
    if (dealData.priority === 'high') {
      actions.unshift('🚨 URGENT: Escalate to senior management for immediate attention');
    }

    return actions;
  }
}

export const useOpenAI = (): OpenAIService => {
  if (shouldUseRealAPIs()) {
    try {
      console.log('🔄 Attempting to use Real OpenAI Service...');
      return useRealOpenAI();
    } catch (error) {
      console.warn('⚠️ Failed to initialize real OpenAI service, falling back to mock:', error);
      return new MockOpenAIService();
    }
  }
  console.log('🎭 Using Mock OpenAI Service (API key not configured)');
  return new MockOpenAIService();
};