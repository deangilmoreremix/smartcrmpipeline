interface APIConfig {
  baseUrl: string;
  apiKey: string;
  headers?: Record<string, string>;
}

interface DealAPI {
  getDeals: () => Promise<any[]>;
  createDeal: (deal: any) => Promise<any>;
  updateDeal: (id: string, updates: any) => Promise<any>;
  deleteDeal: (id: string) => Promise<void>;
}

interface ContactAPI {
  getContacts: () => Promise<any[]>;
  createContact: (contact: any) => Promise<any>;
  updateContact: (id: string, updates: any) => Promise<any>;
  deleteContact: (id: string) => Promise<void>;
  searchContacts: (query: string) => Promise<any[]>;
}

interface CompanyResearchAPI {
  researchCompany: (domain: string) => Promise<any>;
  findLogo: (domain: string) => Promise<string>;
  getCompanyDetails: (name: string) => Promise<any>;
}

class RealAPIService {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: APIConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Deal API methods
  async getDeals(): Promise<any[]> {
    return this.makeRequest('/deals');
  }

  async createDeal(deal: any): Promise<any> {
    return this.makeRequest('/deals', {
      method: 'POST',
      body: JSON.stringify(deal),
    });
  }

  async updateDeal(id: string, updates: any): Promise<any> {
    return this.makeRequest(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteDeal(id: string): Promise<void> {
    await this.makeRequest(`/deals/${id}`, {
      method: 'DELETE',
    });
  }

  // Contact API methods
  async getContacts(): Promise<any[]> {
    return this.makeRequest('/contacts');
  }

  async createContact(contact: any): Promise<any> {
    return this.makeRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  async updateContact(id: string, updates: any): Promise<any> {
    return this.makeRequest(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteContact(id: string): Promise<void> {
    await this.makeRequest(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async searchContacts(query: string): Promise<any[]> {
    return this.makeRequest(`/contacts/search?q=${encodeURIComponent(query)}`);
  }
}

// Clearbit API for company research
class ClearbitService implements CompanyResearchAPI {
  private apiKey: string;
  private baseUrl = 'https://company.clearbit.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async researchCompany(domain: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/companies/find?domain=${domain}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Clearbit API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Clearbit research failed:', error);
      throw error;
    }
  }

  async findLogo(domain: string): Promise<string> {
    return `https://logo.clearbit.com/${domain}`;
  }

  async getCompanyDetails(name: string): Promise<any> {
    // Use name-to-domain API or search
    try {
      const response = await fetch(`${this.baseUrl}/companies/search?query=${encodeURIComponent(name)}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Clearbit search error: ${response.status}`);
      }

      const results = await response.json();
      return results[0]; // Return first result
    } catch (error) {
      console.error('Clearbit company search failed:', error);
      throw error;
    }
  }
}

// Apollo API for contact finding
class ApolloService {
  private apiKey: string;
  private baseUrl = 'https://api.apollo.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async findContacts(companyDomain: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/mixed_people/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          q_organization_domains: [companyDomain],
          page: 1,
          per_page: 25,
        }),
      });

      if (!response.ok) {
        throw new Error(`Apollo API error: ${response.status}`);
      }

      const data = await response.json();
      return data.people || [];
    } catch (error) {
      console.error('Apollo contact search failed:', error);
      throw error;
    }
  }

  async enrichContact(email: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/people/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'X-Api-Key': this.apiKey,
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!response.ok) {
        throw new Error(`Apollo enrich error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Apollo contact enrichment failed:', error);
      throw error;
    }
  }
}

// Factory function to create API services based on environment
export const createAPIServices = () => {
  const services: any = {};

  // Initialize CRM API if configured
  if (import.meta.env.VITE_CRM_API_URL && import.meta.env.VITE_CRM_API_KEY) {
    services.crm = new RealAPIService({
      baseUrl: import.meta.env.VITE_CRM_API_URL,
      apiKey: import.meta.env.VITE_CRM_API_KEY,
    });
  }

  // Initialize Clearbit if configured
  if (import.meta.env.VITE_CLEARBIT_API_KEY) {
    services.clearbit = new ClearbitService(import.meta.env.VITE_CLEARBIT_API_KEY);
  }

  // Initialize Apollo if configured
  if (import.meta.env.VITE_APOLLO_API_KEY) {
    services.apollo = new ApolloService(import.meta.env.VITE_APOLLO_API_KEY);
  }

  return services;
};

export { RealAPIService, ClearbitService, ApolloService };
export type { DealAPI, ContactAPI, CompanyResearchAPI };