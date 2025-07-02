import { useOpenAI } from './openaiService';
import { useGeminiAI } from './geminiService';

interface CompanyResearchData {
  name: string;
  industry: string;
  description: string;
  website: string;
  headquarters: string;
  employeeCount: string;
  foundedYear: string;
  revenue: string;
  keyExecutives: Array<{
    name: string;
    title: string;
    email?: string;
    linkedin?: string;
  }>;
  recentNews: string[];
  competitors: string[];
  technologies: string[];
  fundingInfo?: string;
  stockSymbol?: string;
  logoUrl?: string;
  potentialNeeds: string[];
  salesApproach: string;
  keyDecisionMakers: string[];
}

interface ContactPersonData {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  imageUrl?: string;
  department?: string;
  location?: string;
  background?: string;
  contactStrategy: string;
  valueProposition: string;
  communicationStyle: string;
  iceBreakers: string[];
}

interface AIResearchService {
  researchCompany: (companyName: string, domain?: string) => Promise<CompanyResearchData>;
  findContactPerson: (personName: string, companyName?: string) => Promise<ContactPersonData>;
  findCompanyLogo: (companyName: string, domain?: string) => Promise<string>;
  findPersonImage: (personName: string, company?: string, title?: string) => Promise<string>;
  enhanceWithAI: (data: any, query: string, useGemini?: boolean) => Promise<any>;
}

class EnhancedAIResearchService implements AIResearchService {
  private openaiService = useOpenAI();
  private geminiService = useGeminiAI();

  async researchCompany(companyName: string, domain?: string): Promise<CompanyResearchData> {
    try {
      // Use Gemini for company research
      const geminiResearch = await this.geminiService.researchCompany(companyName, domain);
      
      // Enhance with mock data for completeness
      const enhancedData: CompanyResearchData = {
        name: companyName,
        industry: geminiResearch.industry || this.generateIndustry(companyName),
        description: geminiResearch.description || `${companyName} is a leading company in their industry, focused on innovation and customer satisfaction.`,
        website: domain || `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        headquarters: this.generateLocation(),
        employeeCount: this.generateEmployeeCount(),
        foundedYear: this.generateFoundedYear(),
        revenue: this.generateRevenue(),
        keyExecutives: this.generateExecutives(companyName),
        recentNews: [
          `${companyName} announces strategic expansion`,
          `${companyName} reports strong quarterly performance`,
          `${companyName} launches innovative solutions`
        ],
        competitors: geminiResearch.competitiveLandscape || this.generateCompetitors(companyName),
        technologies: this.generateTechnologies(),
        fundingInfo: `Series B - $25M raised`,
        stockSymbol: this.generateStockSymbol(companyName),
        logoUrl: await this.findCompanyLogo(companyName, domain),
        potentialNeeds: geminiResearch.potentialNeeds || ['Digital transformation', 'Process optimization', 'Growth acceleration'],
        salesApproach: geminiResearch.salesApproach || 'Value-focused approach with ROI demonstration',
        keyDecisionMakers: geminiResearch.keyDecisionMakers || ['CEO', 'CTO', 'VP Operations']
      };

      return enhancedData;
    } catch (error) {
      console.error('AI company research failed, using mock data:', error);
      return this.generateMockCompanyData(companyName, domain);
    }
  }

  async findContactPerson(personName: string, companyName?: string): Promise<ContactPersonData> {
    try {
      // Use Gemini for contact research
      const geminiData = await this.geminiService.findContactInfo(personName, companyName);
      
      const names = personName.split(' ');
      const firstName = names[0];
      const lastName = names[names.length - 1];
      
      return {
        name: personName,
        title: geminiData.likelyRole || this.generateTitle(),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyName?.toLowerCase().replace(/\s+/g, '') || 'company'}.com`,
        phone: this.generatePhone(),
        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        imageUrl: await this.findPersonImage(personName, companyName),
        department: this.generateDepartment(),
        location: this.generateLocation(),
        background: `${personName} is an experienced professional with expertise in driving business growth and innovation.`,
        contactStrategy: geminiData.contactStrategy || 'Professional outreach with value proposition',
        valueProposition: geminiData.valueProposition || 'Solutions that drive business efficiency and growth',
        communicationStyle: geminiData.communicationStyle || 'Professional and consultative approach',
        iceBreakers: geminiData.iceBreakers || ['Industry trends', 'Business challenges', 'Technology solutions']
      };
    } catch (error) {
      console.error('AI contact research failed, using mock data:', error);
      return this.generateMockContactData(personName, companyName);
    }
  }

  async findCompanyLogo(companyName: string, domain?: string): Promise<string> {
    // Generate company logo using DiceBear API with company initials
    const initials = companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return `https://api.dicebear.com/7.x/initials/svg?seed=${companyName}&backgroundColor=3b82f6,8b5cf6,f59e0b,10b981,ef4444&textColor=ffffff&chars=2`;
  }

  async findPersonImage(personName: string, company?: string, title?: string): Promise<string> {
    // Generate person avatar using DiceBear API
    const seed = personName.toLowerCase().replace(/\s+/g, '');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=3b82f6,8b5cf6,f59e0b,10b981,ef4444`;
  }

  async enhanceWithAI(data: any, query: string, useGemini: boolean = true): Promise<any> {
    try {
      if (useGemini) {
        // Use Gemini for enhancement
        const insights = await this.geminiService.getInsights(data);
        return {
          ...data,
          enhanced: true,
          aiInsights: insights,
          enhancedBy: 'Gemini AI'
        };
      } else {
        // Use OpenAI for enhancement
        const insights = await this.openaiService.getInsights(data);
        return {
          ...data,
          enhanced: true,
          aiInsights: insights,
          enhancedBy: 'OpenAI'
        };
      }
    } catch (error) {
      console.error('AI enhancement failed:', error);
      return {
        ...data,
        enhanced: false,
        aiInsights: ['AI enhancement temporarily unavailable'],
        enhancedBy: 'Fallback'
      };
    }
  }

  // Helper methods for generating realistic mock data
  private generateMockCompanyData(companyName: string, domain?: string): CompanyResearchData {
    return {
      name: companyName,
      industry: this.generateIndustry(companyName),
      description: `${companyName} is a leading company in their industry, focused on innovation and customer satisfaction.`,
      website: domain || `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      headquarters: this.generateLocation(),
      employeeCount: this.generateEmployeeCount(),
      foundedYear: this.generateFoundedYear(),
      revenue: this.generateRevenue(),
      keyExecutives: this.generateExecutives(companyName),
      recentNews: [
        `${companyName} announces new strategic partnership`,
        `${companyName} reports strong Q4 earnings`,
        `${companyName} expands operations to new markets`
      ],
      competitors: this.generateCompetitors(companyName),
      technologies: this.generateTechnologies(),
      fundingInfo: `Series B - $25M raised`,
      stockSymbol: this.generateStockSymbol(companyName),
      logoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${companyName}&backgroundColor=3b82f6&textColor=ffffff`,
      potentialNeeds: ['Digital transformation', 'Process optimization', 'Cost reduction'],
      salesApproach: 'Consultative selling with focus on ROI',
      keyDecisionMakers: ['CEO', 'CTO', 'VP of Operations']
    };
  }

  private generateMockContactData(personName: string, companyName?: string): ContactPersonData {
    const names = personName.split(' ');
    const firstName = names[0];
    const lastName = names[names.length - 1];
    
    return {
      name: personName,
      title: this.generateTitle(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyName?.toLowerCase().replace(/\s+/g, '') || 'company'}.com`,
      phone: this.generatePhone(),
      linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${personName}`,
      department: this.generateDepartment(),
      location: this.generateLocation(),
      background: `${personName} is an experienced professional with expertise in their field.`,
      contactStrategy: 'Professional outreach with value proposition',
      valueProposition: 'Solutions that drive business growth',
      communicationStyle: 'Professional and consultative',
      iceBreakers: ['Industry trends', 'Business challenges', 'Technology solutions']
    };
  }

  private generateIndustry(companyName: string): string {
    const industries = [
      'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Retail',
      'Education', 'Real Estate', 'Consulting', 'Media', 'Transportation'
    ];
    return industries[Math.floor(Math.random() * industries.length)];
  }

  private generateLocation(): string {
    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
      'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private generateEmployeeCount(): string {
    const ranges = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
    return ranges[Math.floor(Math.random() * ranges.length)];
  }

  private generateFoundedYear(): string {
    return (2024 - Math.floor(Math.random() * 30)).toString();
  }

  private generateRevenue(): string {
    const ranges = ['$1M-$5M', '$5M-$10M', '$10M-$50M', '$50M-$100M', '$100M+'];
    return ranges[Math.floor(Math.random() * ranges.length)];
  }

  private generateExecutives(companyName: string): Array<{name: string; title: string; email?: string; linkedin?: string}> {
    const titles = ['CEO', 'CTO', 'VP of Sales', 'CMO', 'COO'];
    const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'James', 'Maria'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    
    return titles.slice(0, 3).map(title => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${firstName} ${lastName}`;
      
      return {
        name,
        title,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`
      };
    });
  }

  private generateCompetitors(companyName: string): string[] {
    const prefixes = ['Tech', 'Smart', 'Digital', 'Cloud', 'Data', 'AI'];
    const suffixes = ['Solutions', 'Systems', 'Corp', 'Inc', 'Technologies', 'Labs'];
    
    return Array.from({ length: 3 }, (_, i) => {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      return `${prefix}${suffix}`;
    });
  }

  private generateTechnologies(): string[] {
    const techs = [
      'React', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes',
      'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'TypeScript', 'Next.js'
    ];
    return techs.slice(0, Math.floor(Math.random() * 6) + 3);
  }

  private generateStockSymbol(companyName: string): string {
    return companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 4);
  }

  private generateTitle(): string {
    const titles = [
      'VP of Sales', 'Sales Director', 'Business Development Manager',
      'Account Executive', 'Sales Manager', 'Chief Revenue Officer',
      'Director of Partnerships', 'Head of Business Development'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private generatePhone(): string {
    return `+1 (555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  private generateDepartment(): string {
    const departments = ['Sales', 'Marketing', 'Business Development', 'Operations', 'Finance', 'Technology'];
    return departments[Math.floor(Math.random() * departments.length)];
  }
}

export const useAIResearch = (): AIResearchService => {
  return new EnhancedAIResearchService();
};

export type { CompanyResearchData, ContactPersonData, AIResearchService };