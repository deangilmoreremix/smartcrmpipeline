import React, { useState } from 'react';
import { useAIResearch } from '../../services/aiResearchService';
import { IntelligentAIService } from '../../services/intelligentAIService';
import { useOpenAI } from '../../services/openaiService';
import { useGeminiAI } from '../../services/geminiService';
import { Deal } from '../../types';
import { Contact } from '../../types/contact';
import { 
  X, 
  Save, 
  Bot, 
  Search, 
  Users, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Target, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  Brain, 
  UserPlus, 
  UserX,
  RefreshCw,
  Camera,
  FileText,
  Heart,
  Star,
  Briefcase,
  Tag,
  Globe,
  Plus,
  Database,
  SlidersHorizontal,
  AlignRight,
  CheckCircle,
  Loader2,
  Linkedin,
  Twitter,
  Facebook,
  User
} from 'lucide-react';
import SelectContactModal from './SelectContactModal';
import { useContactStore } from '../../store/contactStore';
import AddContactModal from './AddContactModal';
import { ModernButton } from '../ui/ModernButton';
import { AIAutoFillButton } from '../ui/AIAutoFillButton';
import { AIResearchButton } from '../ui/AIResearchButton';
import { ContactEnrichmentData } from '../../services/aiEnrichmentService';

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

interface ContactDetails {
  name: string;
  title: string;
  email: string;
  phone: string;
  department: string;
  linkedin: string;
  notes: string;
}

interface CompanyDetails {
  name: string;
  industry: string;
  website: string;
  headquarters: string;
  employees: string;
  revenue: string;
  description: string;
  keyDecisionMakers: string[];
  potentialNeeds: string[];
  competitors: string[];
}

const AddDealModal: React.FC<AddDealModalProps> = ({ isOpen, onClose, onSave }) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    contact: '',
    contactId: '',
    contactAvatar: '',
    companyAvatar: '', // New field
    value: 0,
    stage: 'qualification' as Deal['stage'],
    probability: 50,
    priority: 'medium' as Deal['priority'],
    dueDate: '',
    notes: '',
    tags: [] as string[],
    isFavorite: false, // New field
    customFields: {} as Record<string, string | number | boolean>, // New field
    socialProfiles: { // New field
      linkedin: '',
      twitter: '',
      website: '',
      facebook: ''
    },
    lastEnrichment: undefined as Deal['lastEnrichment'] // New field
  });

  // New tag and custom field states
  const [newTag, setNewTag] = useState('');
  const [newCustomField, setNewCustomField] = useState({ name: '', value: '' });
  const [showCustomFields, setShowCustomFields] = useState(false);

  // Contact details state
  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    name: '',
    title: '',
    email: '',
    phone: '',
    department: '',
    linkedin: '',
    notes: ''
  });

  // Company details state
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>({
    name: '',
    industry: '',
    website: '',
    headquarters: '',
    employees: '',
    revenue: '',
    description: '',
    keyDecisionMakers: [],
    potentialNeeds: [],
    competitors: []
  });

  // Contact selection state
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { contacts, fetchContacts } = useContactStore();

  // AI state
  const [isResearching, setIsResearching] = useState(false);
  const [isResearchingContact, setIsResearchingContact] = useState(false);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [researchResults, setResearchResults] = useState<any>(null);
  const [aiProvider, setAiProvider] = useState<string>('');
  
  // UI state
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'company' | 'ai'>('basic');
  const [isEnriched, setIsEnriched] = useState(false);
  const [researchPriority, setResearchPriority] = useState<'speed' | 'quality' | 'cost'>('quality');

  // Services
  const aiResearch = useAIResearch();
  const openaiService = useOpenAI();
  const geminiService = useGeminiAI();
  const intelligentAI = new IntelligentAIService(openaiService, geminiService);

  // Load contacts when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen, fetchContacts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      // Use the selected contact's avatar if available, otherwise use a default
      contactAvatar: selectedContact?.avatarSrc || formData.contactAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + formData.contact,
      // Use the company avatar if available, otherwise generate one
      companyAvatar: formData.companyAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${formData.company}&backgroundColor=3b82f6&textColor=ffffff`
    };

    onSave(dealData);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      contact: '',
      contactId: '',
      contactAvatar: '',
      companyAvatar: '',
      value: 0,
      stage: 'qualification',
      probability: 50,
      priority: 'medium',
      dueDate: '',
      notes: '',
      tags: [],
      isFavorite: false,
      customFields: {},
      socialProfiles: {
        linkedin: '',
        twitter: '',
        website: '',
        facebook: ''
      },
      lastEnrichment: undefined
    });
    setContactDetails({
      name: '',
      title: '',
      email: '',
      phone: '',
      department: '',
      linkedin: '',
      notes: ''
    });
    setCompanyDetails({
      name: '',
      industry: '',
      website: '',
      headquarters: '',
      employees: '',
      revenue: '',
      description: '',
      keyDecisionMakers: [],
      potentialNeeds: [],
      competitors: []
    });
    setAiInsights([]);
    setResearchResults(null);
    setAiProvider('');
    setActiveTab('basic');
    setSelectedContact(null);
    setIsEnriched(false);
    setShowCustomFields(false);
    setNewTag('');
    setNewCustomField({ name: '', value: '' });
  };

  const handleAIResearch = async () => {
    if (!formData.company) {
      alert('Please enter a company name first');
      return;
    }

    setIsResearching(true);
    try {
      console.log(`🚀 Starting AI research for ${formData.company} (Priority: ${researchPriority})`);
      
      // Use intelligent AI routing for company research
      const companyData = await aiResearch.researchCompany(formData.company, undefined, researchPriority);
      
      // Update company details
      setCompanyDetails({
        name: companyData.name,
        industry: companyData.industry,
        website: companyData.website,
        headquarters: companyData.headquarters,
        employees: companyData.employeeCount,
        revenue: companyData.revenue,
        description: companyData.description,
        keyDecisionMakers: companyData.keyDecisionMakers || [],
        potentialNeeds: companyData.potentialNeeds || [],
        competitors: companyData.competitors || []
      });

      // Generate AI insights using intelligent routing
      const mockContact = {
        name: formData.company,
        company: formData.company,
        industry: companyData.industry
      } as any;
      
      const insights = await intelligentAI.getInsights(mockContact, researchPriority);
      setAiInsights(insights);
      setResearchResults(companyData);
      setAiProvider(companyData.aiProvider);
      
      // Auto-populate some form fields
      setFormData(prev => ({
        ...prev,
        title: `${companyData.potentialNeeds?.[0] || 'Business Solution'} for ${companyData.name}`,
        notes: `Company research completed using ${companyData.aiProvider}. ${companyData.description}`,
        companyAvatar: companyData.logoUrl,
        industry: companyData.industry,
        socialProfiles: {
          ...prev.socialProfiles,
          website: companyData.website,
          linkedin: `https://linkedin.com/company/${companyData.name.toLowerCase().replace(/\s+/g, '-')}`,
        },
        lastEnrichment: {
          confidence: 85,
          aiProvider: companyData.aiProvider,
          timestamp: new Date()
        }
      }));

      setIsEnriched(true);

    } catch (error) {
      console.error('❌ AI research failed:', error);
      setAiInsights(['AI research failed. Please try again or enter details manually.']);
      setAiProvider('❌ Research Failed');
    } finally {
      setIsResearching(false);
    }
  };

  const handleContactResearch = async () => {
    if (!contactDetails.name) {
      alert('Please enter a contact name first');
      return;
    }

    setIsResearchingContact(true);
    try {
      console.log(`👤 Starting contact research for ${contactDetails.name}`);
      
      const contactData = await aiResearch.findContactPerson(contactDetails.name, formData.company, 'speed');
      
      setContactDetails(prev => ({
        ...prev,
        title: contactData.title || prev.title,
        email: contactData.email || prev.email,
        phone: contactData.phone || prev.phone,
        department: contactData.department || prev.department,
        linkedin: contactData.linkedin || prev.linkedin,
        notes: `${contactData.background}. Contact strategy: ${contactData.contactStrategy} (${contactData.aiProvider})`
      }));

      // Update main form contact
      setFormData(prev => ({
        ...prev,
        contact: contactDetails.name,
        contactAvatar: contactData.imageUrl
      }));

    } catch (error) {
      console.error('❌ Contact research failed:', error);
    } finally {
      setIsResearchingContact(false);
    }
  };

  const handleFindCompanyImage = async () => {
    if (!formData.company || isSearchingImage) return;
    
    setIsSearchingImage(true);
    try {
      // Simulated image search
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSeed = Date.now().toString();
      const newAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${newSeed}&backgroundColor=3b82f6&textColor=ffffff`;
      
      setFormData(prev => ({
        ...prev,
        companyAvatar: newAvatar
      }));
    } catch (error) {
      console.error('Failed to find company image:', error);
    } finally {
      setIsSearchingImage(false);
    }
  };

  const handleSelectContact = async (contact: Contact) => {
    setSelectedContact(contact);
    setFormData(prev => ({
      ...prev,
      contact: contact.name,
      contactId: contact.id,
      contactAvatar: contact.avatarSrc || ''
    }));
    
    // Pre-fill company if empty
    if (!formData.company && contact.company) {
      setFormData(prev => ({
        ...prev,
        company: contact.company,
        socialProfiles: {
          ...prev.socialProfiles,
          ...(contact.socialProfiles || {})
        }
      }));
    }
    
    // Update contact details
    setContactDetails({
      name: contact.name,
      title: contact.title,
      email: contact.email,
      phone: contact.phone || '',
      department: '',
      linkedin: contact.socialProfiles?.linkedin || '',
      notes: contact.notes || ''
    });
    
    setShowContactSelector(false);
  };

  const handleContactCreated = (contact: Contact) => {
    handleSelectContact(contact);
    setShowAddContactModal(false);
  };

  const handleClearContact = () => {
    setSelectedContact(null);
    setFormData(prev => ({
      ...prev,
      contact: '',
      contactId: '',
      contactAvatar: ''
    }));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddCustomField = () => {
    if (newCustomField.name && newCustomField.value) {
      setFormData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [newCustomField.name]: newCustomField.value
        }
      }));
      setNewCustomField({ name: '', value: '' });
    }
  };
  
  const handleRemoveCustomField = (fieldName: string) => {
    setFormData(prev => {
      const newCustomFields = { ...prev.customFields };
      delete newCustomFields[fieldName];
      return {
        ...prev,
        customFields: newCustomFields
      };
    });
  };

  const toggleFavorite = () => {
    setFormData(prev => ({
      ...prev,
      isFavorite: !prev.isFavorite
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                Create New Deal
                <Sparkles className="w-5 h-5 ml-2 text-yellow-500" />
              </h2>
              <p className="text-gray-600">Add a new deal with AI-powered research</p>
            </div>
          </div>
          
          {/* AI Quick Actions */}
          <div className="flex items-center space-x-3">
            <AIAutoFillButton
              formData={formData}
              onAutoFill={(enrichmentData) => {
                // Handle deal enrichment
                setFormData(prev => ({
                  ...prev,
                  lastEnrichment: {
                    confidence: enrichmentData.confidence || 75,
                    aiProvider: enrichmentData.aiProvider || 'AI Assistant',
                    timestamp: new Date()
                  }
                }));
              }}
              size="sm"
            />
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {[
            { id: 'basic', label: 'Deal Info', icon: Target },
            { id: 'contact', label: 'Contact Details', icon: Users },
            { id: 'company', label: 'Company Details', icon: Building },
            { id: 'ai', label: 'AI Research', icon: Bot }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {/* Basic Deal Information */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                {isEnriched && (
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">
                        Enhanced with AI Research
                      </span>
                      {formData.lastEnrichment && (
                        <span className="text-xs text-purple-600">
                          ({formData.lastEnrichment.confidence}% confidence)
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deal Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Enterprise Software License"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Company *
                      </label>
                      <button 
                        type="button" 
                        onClick={handleFindCompanyImage}
                        disabled={isSearchingImage || !formData.company}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50 disabled:text-gray-400"
                      >
                        {isSearchingImage ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            <span>Finding image...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-3 h-3 mr-1" />
                            <span>Find logo</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex space-x-2 items-center">
                      {formData.companyAvatar && (
                        <div className="relative flex-shrink-0">
                          <img 
                            src={formData.companyAvatar} 
                            alt={formData.company}
                            className="h-9 w-9 rounded-md object-cover border border-gray-200"
                          />
                        </div>
                      )}
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        className="flex-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., TechCorp Inc."
                      />
                    </div>
                  </div>

                  {/* Contact Person Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <div className="flex space-x-2 items-center">
                      {formData.contact ? (
                        <div className="flex-1 flex items-center space-x-2 border border-blue-200 bg-blue-50 rounded-lg p-2">
                          {formData.contactAvatar ? (
                            <img 
                              src={formData.contactAvatar} 
                              alt={formData.contact}
                              className="w-8 h-8 rounded-full object-cover border border-blue-200"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-blue-700 font-medium truncate">{formData.contact}</p>
                            {selectedContact && (
                              <p className="text-xs text-blue-600 truncate">{selectedContact.title} at {selectedContact.company}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleClearContact}
                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded transition-colors"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.contact}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., John Smith"
                          readOnly
                        />
                      )}
                      
                      <button
                        type="button"
                        onClick={() => setShowContactSelector(true)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Select existing contact"
                      >
                        <Users className="w-5 h-5" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowAddContactModal(true)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Add new contact"
                      >
                        <UserPlus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deal Value
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stage
                    </label>
                    <select
                      value={formData.stage}
                      onChange={(e) => setFormData(prev => ({ ...prev, stage: e.target.value as Deal['stage'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="qualification">Qualification</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closed-won">Closed Won</option>
                      <option value="closed-lost">Closed Lost</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Probability (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData(prev => ({ ...prev, probability: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600 mt-1">{formData.probability}%</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Deal['priority'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
                
                {/* Custom Fields */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center">
                      <Database className="w-4 h-4 mr-2 text-purple-500" />
                      Custom Fields
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowCustomFields(!showCustomFields)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Custom Field</span>
                    </button>
                  </div>
                  
                  {/* Existing Custom Fields */}
                  {Object.keys(formData.customFields).length > 0 && (
                    <div className="space-y-3 mb-3">
                      {Object.entries(formData.customFields).map(([fieldName, fieldValue]) => (
                        <div key={fieldName} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Field Name</label>
                              <p className="text-sm font-medium text-gray-900">{fieldName}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-wide font-medium">Value</label>
                              <p className="text-sm text-gray-700">{String(fieldValue)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(fieldName)}
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add New Custom Field */}
                  {showCustomFields && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Field name"
                          value={newCustomField.name}
                          onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Field value"
                          value={newCustomField.value}
                          onChange={(e) => setNewCustomField(prev => ({ ...prev, value: e.target.value }))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <ModernButton 
                          type="button"
                          variant="primary" 
                          size="sm" 
                          onClick={handleAddCustomField}
                          disabled={!newCustomField.name || !newCustomField.value}
                        >
                          Add Field
                        </ModernButton>
                        <ModernButton 
                          type="button"
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowCustomFields(false)}
                        >
                          Cancel
                        </ModernButton>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Social Profiles */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-blue-500" />
                    Company Social Profiles
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <div className="bg-blue-500 p-1 rounded mr-2">
                          <Linkedin className="w-3 h-3 text-white" />
                        </div>
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={formData.socialProfiles.linkedin}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          socialProfiles: {
                            ...prev.socialProfiles,
                            linkedin: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://linkedin.com/company/example"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <div className="bg-purple-500 p-1 rounded mr-2">
                          <Globe className="w-3 h-3 text-white" />
                        </div>
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.socialProfiles.website}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          socialProfiles: {
                            ...prev.socialProfiles,
                            website: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <div className="bg-blue-400 p-1 rounded mr-2">
                          <Twitter className="w-3 h-3 text-white" />
                        </div>
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={formData.socialProfiles.twitter}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          socialProfiles: {
                            ...prev.socialProfiles,
                            twitter: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://twitter.com/example"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <div className="bg-blue-700 p-1 rounded mr-2">
                          <Facebook className="w-3 h-3 text-white" />
                        </div>
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={formData.socialProfiles.facebook}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          socialProfiles: {
                            ...prev.socialProfiles,
                            facebook: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://facebook.com/example"
                      />
                    </div>
                  </div>
                </div>

                {/* Favorite Toggle */}
                <div className="pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFavorite}
                      onChange={toggleFavorite}
                      className="text-red-600 rounded"
                    />
                    <Heart className={`w-5 h-5 ${formData.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-700">Add to Favorites</span>
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes about this deal..."
                  />
                </div>
              </div>
            )}

            {/* Contact Details */}
            {activeTab === 'contact' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                  <div className="flex space-x-2">
                    {/* Contact selector button */}
                    <button
                      type="button"
                      onClick={() => setShowContactSelector(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      <span>Select Contact</span>
                    </button>
                    
                    {/* Add new contact button */}
                    <button
                      type="button"
                      onClick={() => setShowAddContactModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>New Contact</span>
                    </button>
                    
                    {/* AI Research button */}
                    <button
                      type="button"
                      onClick={handleContactResearch}
                      disabled={isResearchingContact || !contactDetails.name}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isResearchingContact ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          <span>Researching...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>AI Research</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {selectedContact ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      {selectedContact.avatarSrc && (
                        <img 
                          src={selectedContact.avatarSrc} 
                          alt={selectedContact.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md mr-4"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900">{selectedContact.name}</h4>
                        <p className="text-gray-600">{selectedContact.title} at {selectedContact.company}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-sm font-medium">{selectedContact.email}</p>
                          </div>
                          {selectedContact.phone && (
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="text-sm font-medium">{selectedContact.phone}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="text-sm font-medium capitalize">{selectedContact.status}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Interest Level</p>
                            <p className="text-sm font-medium capitalize">{selectedContact.interestLevel}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={handleClearContact}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Change Contact
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={contactDetails.name}
                        onChange={(e) => setContactDetails(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., John Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={contactDetails.title}
                        onChange={(e) => setContactDetails(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., VP of Sales"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="email"
                          value={contactDetails.email}
                          onChange={(e) => setContactDetails(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="john.smith@company.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="tel"
                          value={contactDetails.phone}
                          onChange={(e) => setContactDetails(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={contactDetails.department}
                        onChange={(e) => setContactDetails(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Sales"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={contactDetails.linkedin}
                        onChange={(e) => setContactDetails(prev => ({ ...prev, linkedin: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://linkedin.com/in/john-smith"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Notes
                  </label>
                  <textarea
                    value={selectedContact?.notes || contactDetails.notes}
                    onChange={(e) => {
                      if (!selectedContact) {
                        setContactDetails(prev => ({ ...prev, notes: e.target.value }));
                      }
                    }}
                    readOnly={!!selectedContact}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      selectedContact ? 'bg-gray-50' : 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Notes about this contact..."
                  />
                  {selectedContact && (
                    <p className="text-sm text-gray-500 mt-1">
                      Contact is already saved in your CRM. Edit notes in the contact details.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Company Details */}
            {activeTab === 'company' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                  <button 
                    type="button"
                    onClick={handleAIResearch}
                    disabled={isResearching || !formData.company}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isResearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        <span>Researching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-1" />
                        <span>Research Company</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={companyDetails.industry}
                      onChange={(e) => setCompanyDetails(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Technology"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={companyDetails.website}
                      onChange={(e) => setCompanyDetails(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Headquarters
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={companyDetails.headquarters}
                        onChange={(e) => setCompanyDetails(prev => ({ ...prev, headquarters: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee Count
                    </label>
                    <input
                      type="text"
                      value={companyDetails.employees}
                      onChange={(e) => setCompanyDetails(prev => ({ ...prev, employees: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 50-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Revenue
                    </label>
                    <input
                      type="text"
                      value={companyDetails.revenue}
                      onChange={(e) => setCompanyDetails(prev => ({ ...prev, revenue: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., $10M-50M"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Description
                  </label>
                  <textarea
                    value={companyDetails.description}
                    onChange={(e) => setCompanyDetails(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the company..."
                  />
                </div>

                {/* Key Decision Makers */}
                {companyDetails.keyDecisionMakers.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Decision Makers
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {companyDetails.keyDecisionMakers.map((role, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Potential Needs */}
                {companyDetails.potentialNeeds.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Potential Needs
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {companyDetails.potentialNeeds.map((need, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Competitors */}
                {companyDetails.competitors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Competitors
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {companyDetails.competitors.map((competitor, index) => (
                        <span key={index} className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                          {competitor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Company Research Status */}
                {researchResults && (
                  <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 mt-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Company research completed
                      </span>
                      {aiProvider && (
                        <span className="text-xs text-green-600 font-medium">
                          via {aiProvider}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Research */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                    Intelligent AI Research
                  </h3>
                  <button
                    type="button"
                    onClick={handleAIResearch}
                    disabled={isResearching || !formData.company}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{isResearching ? 'Researching...' : 'Start AI Research'}</span>
                  </button>
                </div>

                {/* Research Priority Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Research Priority (Auto-selects best AI model)
                  </label>
                  <div className="flex space-x-4">
                    {[
                      { id: 'speed', label: 'Speed', icon: Zap, desc: 'Fast results with Gemini Flash' },
                      { id: 'quality', label: 'Quality', icon: Brain, desc: 'Best insights with Gemini Pro' },
                      { id: 'cost', label: 'Cost', icon: DollarSign, desc: 'Efficient with Gemma 2B' }
                    ].map(option => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setResearchPriority(option.id as any)}
                          className={`flex-1 p-3 border rounded-lg text-center transition-all duration-200 ${
                            researchPriority === option.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1" />
                          <p className="font-medium text-sm">{option.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{option.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AI Routing Information */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Intelligent AI Routing
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p><strong>🧠 Company Research:</strong> Gemini Pro (Best for factual analysis)</p>
                      <p><strong>👤 Contact Research:</strong> Gemini Flash (Fast contact data)</p>
                      <p><strong>✉️ Email Generation:</strong> OpenAI GPT-4o (Creative writing)</p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>📊 Deal Analysis:</strong> Gemma 27B (Structured insights)</p>
                      <p><strong>🎯 Next Actions:</strong> Gemma 9B (Actionable steps)</p>
                      <p><strong>💡 Insights:</strong> OpenAI GPT-4o (Pattern recognition)</p>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-3">
                    🤖 The system automatically chooses the best AI model for each task based on performance data.
                  </p>
                </div>

                {isResearching && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-purple-600">AI is researching {formData.company}...</span>
                  </div>
                )}

                {aiInsights.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                      <Bot className="w-5 h-5 mr-2" />
                      AI Insights {aiProvider && `(${aiProvider})`}
                    </h4>
                    <ul className="space-y-2">
                      {aiInsights.map((insight, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-purple-800 text-sm">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {researchResults && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Research Summary {aiProvider && `(${aiProvider})`}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="font-medium text-gray-700 mb-2">Company Profile</h5>
                        <p className="text-sm text-gray-600">{researchResults.description}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h5 className="font-medium text-gray-700 mb-2">Sales Approach</h5>
                        <p className="text-sm text-gray-600">{researchResults.salesApproach}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Brain className="w-4 h-4 text-purple-500" />
            <span>Powered by OpenAI & Gemini AI</span>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Create Deal</span>
            </button>
          </div>
        </div>

        {/* Contact Selection Modal */}
        <SelectContactModal 
          isOpen={showContactSelector}
          onClose={() => setShowContactSelector(false)}
          onSelectContact={handleSelectContact}
          selectedContactId={formData.contactId}
        />

        {/* Add Contact Modal */}
        <AddContactModal 
          isOpen={showAddContactModal}
          onClose={() => setShowAddContactModal(false)}
          onSave={handleContactCreated}
          selectAfterCreate={true}
        />
      </div>
    </div>
  );
};

export default AddDealModal;