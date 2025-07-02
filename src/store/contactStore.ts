import { create } from 'zustand';
import { Contact } from '../types/contact';
import { mockContacts } from '../data/mockContacts';

interface ContactStore {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  selectedContact: Contact | null;
  
  // Actions
  fetchContacts: () => Promise<void>;
  createContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Contact>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  selectContact: (contact: Contact | null) => void;
  
  // Team management
  addTeamMember: (contactId: string, role?: Contact['role']) => Promise<void>;
  removeTeamMember: (contactId: string) => Promise<void>;
  updateTeamMemberStats: (contactId: string, stats: Partial<Contact['gamificationStats']>) => Promise<void>;
  
  // New methods for enhanced features
  toggleFavorite: (contactId: string) => Promise<void>;
  findNewImage: (contactId: string) => Promise<string>;
  aiEnrichContact: (contactId: string, enrichmentData: any) => Promise<Contact>;
}

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: [],
  isLoading: false,
  error: null,
  selectedContact: null,

  fetchContacts: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ contacts: mockContacts, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch contacts', isLoading: false });
    }
  },

  createContact: async (contactData) => {
    set({ isLoading: true, error: null });
    try {
      const newContact: Contact = {
        ...contactData,
        id: `contact-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        contacts: [...state.contacts, newContact],
        isLoading: false
      }));
      
      return newContact;
    } catch (error) {
      set({ error: 'Failed to create contact', isLoading: false });
      throw error;
    }
  },

  updateContact: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const existingContact = get().contacts.find(c => c.id === id);
      if (!existingContact) {
        throw new Error('Contact not found');
      }
      
      const updatedContact = {
        ...existingContact,
        ...updates,
        updatedAt: new Date()
      };
      
      set(state => ({
        contacts: state.contacts.map(contact =>
          contact.id === id ? updatedContact : contact
        ),
        isLoading: false
      }));
      
      return updatedContact;
    } catch (error) {
      set({ error: 'Failed to update contact', isLoading: false });
      throw error;
    }
  },

  deleteContact: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        contacts: state.contacts.filter(contact => contact.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Failed to delete contact', isLoading: false });
      throw error;
    }
  },

  selectContact: (contact) => {
    set({ selectedContact: contact });
  },

  // Team management functions
  addTeamMember: async (contactId, role = 'sales-rep') => {
    const { updateContact } = get();
    await updateContact(contactId, {
      isTeamMember: true,
      role,
      gamificationStats: {
        totalDeals: 0,
        totalRevenue: 0,
        winRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        points: 0,
        achievements: [],
        monthlyGoal: role === 'sales-rep' ? 50000 : role === 'manager' ? 100000 : 200000,
        monthlyProgress: 0
      }
    });
  },

  removeTeamMember: async (contactId) => {
    const { updateContact } = get();
    await updateContact(contactId, {
      isTeamMember: false,
      role: undefined,
      gamificationStats: undefined
    });
  },

  updateTeamMemberStats: async (contactId, stats) => {
    const contact = get().contacts.find(c => c.id === contactId);
    if (contact && contact.gamificationStats) {
      const { updateContact } = get();
      await updateContact(contactId, {
        gamificationStats: {
          ...contact.gamificationStats,
          ...stats
        }
      });
    }
  },
  
  // New methods for enhanced features
  toggleFavorite: async (contactId) => {
    const { updateContact } = get();
    const contact = get().contacts.find(c => c.id === contactId);
    if (contact) {
      await updateContact(contactId, {
        isFavorite: !contact.isFavorite
      });
    }
  },
  
  findNewImage: async (contactId) => {
    const { updateContact } = get();
    const contact = get().contacts.find(c => c.id === contactId);
    if (!contact) {
      throw new Error('Contact not found');
    }
    
    // Simulate API call to find new image
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate a new avatar with a different seed
    const newSeed = Date.now().toString();
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`;
    
    await updateContact(contactId, {
      avatarSrc: newAvatarUrl
    });
    
    return newAvatarUrl;
  },
  
  aiEnrichContact: async (contactId, enrichmentData) => {
    const { updateContact } = get();
    const contact = get().contacts.find(c => c.id === contactId);
    if (!contact) {
      throw new Error('Contact not found');
    }
    
    const updates: Partial<Contact> = {
      lastEnrichment: {
        confidence: enrichmentData.confidence || 75,
        aiProvider: enrichmentData.aiProvider || 'AI Assistant',
        timestamp: new Date()
      }
    };
    
    // Apply other updates from enrichment data
    if (enrichmentData.phone) updates.phone = enrichmentData.phone;
    if (enrichmentData.industry) updates.industry = enrichmentData.industry;
    if (enrichmentData.title) updates.title = enrichmentData.title;
    if (enrichmentData.notes) {
      updates.notes = contact.notes 
        ? `${contact.notes}\n\nAI Research: ${enrichmentData.notes}` 
        : `AI Research: ${enrichmentData.notes}`;
    }
    
    const updatedContact = await updateContact(contactId, updates);
    return updatedContact;
  }
}));