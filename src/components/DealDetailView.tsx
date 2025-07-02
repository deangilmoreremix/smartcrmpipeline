import React, { useState, useEffect } from 'react';
import { Deal } from '../types';
import { Contact } from '../types/contact';
import { ModernButton } from './ui/ModernButton';
import { CustomizableAIToolbar } from './ui/CustomizableAIToolbar';
import SelectContactModal from './deals/SelectContactModal';
import { useContactStore } from '../store/contactStore';
import { 
  X, Edit, Mail, Phone, Plus, MessageSquare, FileText, Calendar, MoreHorizontal,
  User, Globe, Clock, Building2, Tag, Star, ExternalLink, Save, Brain, Zap,
  Target, TrendingUp, AlertCircle, CheckCircle, Upload, Trash2, DollarSign, 
  Settings, BarChart3, Search, Loader2, UserPlus, Users, UserX, Heart, HeartOff,
  Camera, Wand2, Database, Linkedin, Twitter, Facebook, Sparkles, ArrowRight,
  Activity, ChevronDown, Map, PieChart, Briefcase, Video, RefreshCw, Copy, Award
} from 'lucide-react';
import { DealJourneyTimeline } from './deals/DealJourneyTimeline';
import { AIInsightsPanel } from './deals/AIInsightsPanel';
import { DealCommunicationHub } from './deals/DealCommunicationHub';
import { DealAutomationPanel } from './deals/DealAutomationPanel';
import { DealAnalyticsDashboard } from './deals/DealAnalyticsDashboard';

interface DealDetailViewProps {
  deal: Deal;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (id: string, updates: Partial<Deal>) => Promise<Deal>;
}

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
};

const priorityLabels = {
  high: 'High Priority',
  medium: 'Medium Priority',
  low: 'Low Priority'
};

const stageColors = {
  qualification: 'bg-blue-500',
  proposal: 'bg-indigo-500',
  negotiation: 'bg-purple-500',
  'closed-won': 'bg-green-500',
  'closed-lost': 'bg-red-500'
};

const stageLabels = {
  qualification: 'Qualification',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  'closed-won': 'Closed Won',
  'closed-lost': 'Closed Lost'
};

export const DealDetailView: React.FC<DealDetailViewProps> = ({ 
  deal, 
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: deal.title,
    company: deal.company,
    contact: deal.contact,
    contactId: deal.contactId,
    value: deal.value,
    stage: deal.stage,
    probability: deal.probability,
    priority: deal.priority,
    notes: deal.notes || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const { contacts, fetchContacts } = useContactStore();
  const [contactDetail, setContactDetail] = useState<Contact | null>(null);
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);
  const [isFindingImage, setIsFindingImage] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState(true);
  const [localCustomFields, setLocalCustomFields] = useState<Record<string, string | number | boolean>>(
    deal.customFields || {}
  );
  
  // State for social profiles
  const [socialProfiles, setSocialProfiles] = useState<Record<string, string>>(
    deal.socialProfiles || {}
  );
  
  // New state to track AI enrichment status
  const [lastEnrichment, setLastEnrichment] = useState(deal.lastEnrichment);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'journey', label: 'Journey', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain },
  ];

  // Fetch contact details if we have a contactId
  useEffect(() => {
    if (deal.contactId) {
      setIsLoadingContact(true);
      fetchContacts().then(() => {
        setIsLoadingContact(false);
      });
    }
  }, [deal.contactId, fetchContacts]);

  // Update contact details when contacts are loaded
  useEffect(() => {
    if (deal.contactId && contacts.length > 0) {
      const contact = contacts.find(c => c.id === deal.contactId);
      if (contact) {
        setContactDetail(contact);
      }
    }
  }, [deal.contactId, contacts]);

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleFieldEdit = (field: string) => {
    setEditingField(field);
  };

  const handleFieldSave = async (field: string, value: any) => {
    if (onUpdate) {
      setIsSaving(true);
      try {
        const updates: Partial<Deal> = { [field]: value };
        await onUpdate(deal.id, updates);
        setEditForm(prev => ({ ...prev, [field]: value }));
        setEditingField(null);
      } catch (error) {
        console.error('Failed to update deal:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleFieldCancel = () => {
    setEditingField(null);
    setEditForm({
      title: deal.title,
      company: deal.company,
      contact: deal.contact,
      contactId: deal.contactId,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      priority: deal.priority,
      notes: deal.notes || ''
    });
  };

  const handleSelectContact = async (contact: Contact) => {
    if (onUpdate) {
      setIsSaving(true);
      try {
        const updates: Partial<Deal> = { 
          contact: contact.name,
          contactId: contact.id,
          contactAvatar: contact.avatarSrc
        };
        
        await onUpdate(deal.id, updates);
        
        setEditForm(prev => ({ 
          ...prev, 
          contact: contact.name,
          contactId: contact.id
        }));
        
        setContactDetail(contact);
        setShowContactSelector(false);
      } catch (error) {
        console.error('Failed to update contact:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // New function to remove contact from deal
  const handleRemoveContact = async () => {
    if (onUpdate) {
      setIsSaving(true);
      try {
        const updates: Partial<Deal> = {
          contact: '',
          contactId: undefined,
          contactAvatar: undefined
        };
        
        await onUpdate(deal.id, updates);
        
        setEditForm(prev => ({
          ...prev,
          contact: '',
          contactId: ''
        }));
        
        setContactDetail(null);
      } catch (error) {
        console.error('Failed to remove contact from deal:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // New functions for AI features
  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update with new probability and analysis results
      const newProbability = Math.min(Math.floor(deal.probability * 1.15), 95);
      
      if (onUpdate) {
        await onUpdate(deal.id, {
          probability: newProbability,
          lastEnrichment: {
            confidence: newProbability,
            aiProvider: 'Hybrid AI (GPT-4o + Gemini)',
            timestamp: new Date()
          }
        });
      }
      
      setLastEnrichment({
        confidence: newProbability,
        aiProvider: 'Hybrid AI (GPT-4o + Gemini)',
        timestamp: new Date()
      });
      
      setEditForm(prev => ({
        ...prev,
        probability: newProbability
      }));
      
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleAIEnrich = async () => {
    setIsEnriching(true);
    try {
      // Simulate AI enrichment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock enrichment data
      const enrichedData = {
        customFields: {
          "Industry Trend": "Growing market demand",
          "Competitor Status": "Alternative evaluation",
          "Decision Timeline": "Q3 2025"
        },
        socialProfiles: {
          linkedin: deal.socialProfiles?.linkedin || `https://linkedin.com/company/${deal.company.toLowerCase().replace(/\s+/g, '-')}`,
          website: deal.socialProfiles?.website || `https://${deal.company.toLowerCase().replace(/\s+/g, '')}.com`
        },
        notes: deal.notes 
          ? `${deal.notes}\n\nAI Research: ${deal.company} is showing strong growth in the enterprise sector with increasing investment in technology solutions.`
          : `AI Research: ${deal.company} is showing strong growth in the enterprise sector with increasing investment in technology solutions.`
      };
      
      // Update local state
      setLocalCustomFields({
        ...localCustomFields,
        ...enrichedData.customFields
      });
      
      setSocialProfiles({
        ...socialProfiles,
        ...enrichedData.socialProfiles
      });
      
      if (onUpdate) {
        await onUpdate(deal.id, {
          customFields: {
            ...(deal.customFields || {}),
            ...enrichedData.customFields
          },
          socialProfiles: {
            ...(deal.socialProfiles || {}),
            ...enrichedData.socialProfiles
          },
          notes: enrichedData.notes,
          lastEnrichment: {
            confidence: Math.max(deal.probability, 75),
            aiProvider: 'OpenAI GPT-4o',
            timestamp: new Date()
          }
        });
      }
      
      setLastEnrichment({
        confidence: Math.max(deal.probability, 75),
        aiProvider: 'OpenAI GPT-4o',
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('AI enrichment failed:', error);
    } finally {
      setIsEnriching(false);
    }
  };
  
  const handleFindNewImage = async () => {
    setIsFindingImage(true);
    try {
      // Simulate finding a new image
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, we would call an API to find a company image
      const newSeed = Date.now().toString();
      const newCompanyAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${newSeed}&backgroundColor=3b82f6,8b5cf6,f59e0b,10b981,ef4444&textColor=ffffff`;
      
      if (onUpdate) {
        await onUpdate(deal.id, {
          companyAvatar: newCompanyAvatar
        });
      }
    } catch (error) {
      console.error('Failed to find new image:', error);
    } finally {
      setIsFindingImage(false);
    }
  };
  
  const handleToggleFavorite = async () => {
    try {
      if (onUpdate) {
        await onUpdate(deal.id, {
          isFavorite: !deal.isFavorite
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };
  
  const handleAddCustomField = () => {
    if (newFieldName && newFieldValue) {
      const updatedFields = {
        ...localCustomFields,
        [newFieldName]: newFieldValue
      };
      
      setLocalCustomFields(updatedFields);
      
      if (onUpdate) {
        onUpdate(deal.id, {
          customFields: updatedFields
        });
      }
      
      setNewFieldName('');
      setNewFieldValue('');
      setShowAddField(false);
    }
  };
  
  const handleRemoveCustomField = (fieldName: string) => {
    const updatedFields = { ...localCustomFields };
    delete updatedFields[fieldName];
    
    setLocalCustomFields(updatedFields);
    
    if (onUpdate) {
      onUpdate(deal.id, {
        customFields: updatedFields
      });
    }
  };

  const EditableField: React.FC<{
    field: string;
    label: string;
    value: any;
    icon: React.ComponentType<any>;
    iconColor: string;
    type?: 'text' | 'number' | 'textarea' | 'select';
    options?: { value: any; label: string }[];
  }> = ({ field, label, value, icon: Icon, iconColor, type = 'text', options }) => {
    const isEditing = editingField === field;
    const [localValue, setLocalValue] = useState(value);

    const handleSave = () => {
      handleFieldSave(field, localValue);
    };

    const handleCancel = () => {
      setLocalValue(value);
      setEditingField(null);
    };

    if (isEditing) {
      return (
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div className="flex items-center space-x-3 flex-1">
            <div className={`w-8 h-8 ${iconColor} rounded-full flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{label}</p>
              {type === 'textarea' ? (
                <textarea
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  className="mt-1 w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  autoFocus
                />
              ) : type === 'select' && options ? (
                <select
                  value={localValue}
                  onChange={(e) => setLocalValue(e.target.value)}
                  className="mt-1 w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                >
                  {options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={localValue}
                  onChange={(e) => setLocalValue(type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="mt-1 w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              )}
            </div>
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-2 text-green-600 hover:text-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${iconColor} rounded-full flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-gray-900">
              {field === 'value' ? formatCurrency(value) : 
               field === 'stage' ? stageLabels[value] || value :
               field === 'priority' ? priorityLabels[value] || value :
               value || 'Not provided'}
            </p>
          </div>
        </div>
        <button
          onClick={() => handleFieldEdit(field)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Social platform definitions
  const socialPlatforms = [
    { icon: Linkedin, color: 'bg-blue-500', name: 'LinkedIn', key: 'linkedin' },
    { icon: Globe, color: 'bg-purple-600', name: 'Website', key: 'website' },
    { icon: Twitter, color: 'bg-blue-400', name: 'Twitter', key: 'twitter' },
    { icon: Facebook, color: 'bg-blue-700', name: 'Facebook', key: 'facebook' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-2 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Enlarged Modal Container */}
      <div className="bg-white rounded-xl w-full max-w-[95vw] h-[95vh] overflow-hidden flex animate-scale-in shadow-2xl">
        {/* Enhanced Deal Profile Sidebar */}
        <div className="w-80 bg-gradient-to-b from-gray-50 via-white to-gray-50 border-r border-gray-200 flex flex-col h-full">
          {/* Fixed Header with AI Features */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              Deal Profile
              <Sparkles className="w-4 h-4 ml-2 text-purple-500" />
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handleAIAnalysis}
                disabled={isAnalyzing}
                className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50 relative"
                title="AI Analysis"
              >
                <Brain className="w-4 h-4" />
                {isAnalyzing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Deal Header with Value and Stage */}
            <div className="p-5 text-center border-b border-gray-100 bg-white">
              <div className="relative inline-block mb-4">
                <div className={`w-20 h-20 ${stageColors[deal.stage]} rounded-full flex items-center justify-center text-white shadow-lg`}>
                  <DollarSign className="w-8 h-8" />
                </div>
                
                {/* Favorite Badge */}
                {deal.isFavorite && (
                  <div className="absolute -top-1 -left-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg ring-2 ring-white">
                    <Heart className="w-3 h-3" />
                  </div>
                )}
                
                {/* AI Enhancement Indicator */}
                {lastEnrichment && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-lg ring-2 ring-white">
                    <Sparkles className="w-2.5 h-2.5" />
                  </div>
                )}
                
                {/* Company Logo Button */}
                <button 
                  onClick={handleFindNewImage}
                  disabled={isFindingImage}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-colors shadow-lg relative"
                >
                  {isFindingImage ? (
                    <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
                  ) : (
                    <Camera className="w-3 h-3" />
                  )}
                </button>
              </div>
              
              {/* Deal Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{deal.title}</h3>
              
              {/* Value and Stage */}
              <div className="flex justify-center items-center space-x-4 mb-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(deal.value)}</p>
                  <p className="text-xs text-gray-500">Deal Value</p>
                </div>
                <div className="w-px h-10 bg-gray-300"></div>
                <div className="text-center">
                  <span className={`${stageColors[deal.stage]} text-white text-sm px-2 py-1 rounded-md font-medium`}>
                    {stageLabels[deal.stage]}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Current Stage</p>
                </div>
              </div>
              
              {/* Company and Contact Person */}
              <p className="text-gray-600 font-medium">{deal.company}</p>
              <p className="text-gray-500 text-sm">{deal.contact || 'No contact assigned'}</p>
              
              {/* AI Enhancement Badge */}
              {lastEnrichment && (
                <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span className="text-xs font-medium text-purple-900">
                      Enhanced with AI ({lastEnrichment.confidence}% confidence)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Tools Section - PROMINENTLY DISPLAYED */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                <Brain className="w-4 h-4 mr-2 text-purple-600" />
                AI Assistant Tools
              </h4>
              
              {/* AI Goals Button */}
              <div className="mb-3">
                <button className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 text-sm font-medium transition-all duration-200 border border-indigo-300/50 shadow-sm hover:shadow-md hover:scale-105">
                  <Target className="w-4 h-4 mr-2" />
                  AI Deal Goals
                </button>
              </div>

              {/* Quick AI Actions Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* Deal Score */}
                <button 
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="p-3 flex flex-col items-center justify-center rounded-lg font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 min-h-[3.5rem] bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-blue-300/50"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin mb-1" />
                  ) : (
                    <Target className="w-4 h-4 mb-1" />
                  )}
                  <span className="text-xs leading-tight text-center">Deal Score</span>
                </button>
                
                {/* Email AI */}
                <button className="p-3 flex flex-col items-center justify-center rounded-lg font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 min-h-[3.5rem] bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border-gray-200/50">
                  <Mail className="w-4 h-4 mb-1" />
                  <span className="text-xs leading-tight text-center">Email AI</span>
                </button>
                
                {/* AI Auto-Enrich */}
                <button
                  onClick={handleAIEnrich}
                  disabled={isEnriching}
                  className="p-3 flex flex-col items-center justify-center rounded-lg font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 min-h-[3.5rem] bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-purple-300/50 col-span-2 relative"
                >
                  {isEnriching ? (
                    <Loader2 className="w-4 h-4 animate-spin mb-1" />
                  ) : (
                    <Wand2 className="w-4 h-4 mb-1" />
                  )}
                  <span className="text-xs leading-tight text-center">AI Auto-Enrich</span>
                  {!isEnriching && (
                    <Sparkles className="w-3 h-3 absolute top-1 right-1 text-yellow-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="p-4 border-b border-gray-100 bg-white">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-blue-500" />
                Quick Actions
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button className="p-3 flex flex-col items-center hover:bg-blue-50 rounded-lg transition-all text-center">
                  <Edit className="w-4 h-4 mb-1 text-blue-600" />
                  <span className="text-xs font-medium">Edit</span>
                </button>
                <button className="p-3 flex flex-col items-center hover:bg-green-50 rounded-lg transition-all text-center">
                  <Mail className="w-4 h-4 mb-1 text-green-600" />
                  <span className="text-xs font-medium">Email</span>
                </button>
                <button className="p-3 flex flex-col items-center hover:bg-yellow-50 rounded-lg transition-all text-center">
                  <Phone className="w-4 h-4 mb-1 text-yellow-600" />
                  <span className="text-xs font-medium">Call</span>
                </button>
                <button className="p-3 flex flex-col items-center hover:bg-purple-50 rounded-lg transition-all text-center">
                  <Plus className="w-4 h-4 mb-1 text-purple-600" />
                  <span className="text-xs font-medium">Task</span>
                </button>
                <button className="p-3 flex flex-col items-center hover:bg-orange-50 rounded-lg transition-all text-center">
                  <FileText className="w-4 h-4 mb-1 text-orange-600" />
                  <span className="text-xs font-medium">Note</span>
                </button>
                <button className="p-3 flex flex-col items-center hover:bg-indigo-50 rounded-lg transition-all text-center">
                  <Calendar className="w-4 h-4 mb-1 text-indigo-600" />
                  <span className="text-xs font-medium">Meet</span>
                </button>
              </div>
            </div>

            {/* Deal Information */}
            <div className="p-4 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                  Deal Info
                </h4>
                <button 
                  onClick={() => setEditingField('overview')}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Stage */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-3 h-3 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Stage</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{stageLabels[deal.stage]}</p>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                    <Edit className="w-3 h-3" />
                  </button>
                </div>

                {/* Probability */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Probability</p>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 mr-2">{deal.probability}%</p>
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                          <div 
                            className={`h-1.5 rounded-full ${
                              deal.probability > 70 ? 'bg-green-500' :
                              deal.probability > 40 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${deal.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                    <Edit className="w-3 h-3" />
                  </button>
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`w-6 h-6 ${deal.priority === 'high' ? 'bg-red-100' : deal.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <AlertCircle className={`w-3 h-3 ${deal.priority === 'high' ? 'text-red-600' : deal.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Priority</p>
                      <p className="text-sm font-medium text-gray-900">
                        {deal.priority.charAt(0).toUpperCase() + deal.priority.slice(1)} Priority
                      </p>
                    </div>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                    <Edit className="w-3 h-3" />
                  </button>
                </div>

                {/* Due Date */}
                {deal.dueDate && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-3 h-3 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Due Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {deal.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                      <Edit className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Fields Section - NEW */}
            {localCustomFields && Object.keys(localCustomFields).length > 0 && (
              <div className="p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                    <Database className="w-4 h-4 mr-2 text-indigo-500" />
                    Custom Fields
                  </h4>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setShowAddField(true)}
                      className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => setShowCustomFields(!showCustomFields)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ChevronDown className={`w-3 h-3 transition-transform ${showCustomFields ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {showCustomFields && (
                  <div className="space-y-2">
                    {Object.entries(localCustomFields).map(([key, value], index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">{key}</p>
                          <p className="text-sm font-medium text-gray-900">{String(value)}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveCustomField(key)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showAddField && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Field name"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddCustomField}
                        className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddField(false)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social Profiles - NEW */}
            <div className="p-4 border-b border-gray-100 bg-white">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Globe className="w-4 h-4 mr-2 text-blue-500" />
                Company Profiles
              </h4>
              <div className="flex justify-center space-x-2 mb-3">
                {socialPlatforms.map((platform, index) => {
                  const Icon = platform.icon;
                  const profileUrl = socialProfiles[platform.key];
                  
                  return (
                    <div key={index} className="relative group">
                      {profileUrl ? (
                        <a 
                          href={profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${platform.color} p-2 rounded-lg text-white flex items-center justify-center hover:opacity-90 transition-all`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon className="w-4 h-4" />
                        </a>
                      ) : (
                        <div className="bg-gray-100 p-2 rounded-lg text-gray-400 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                      )}
                      
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {platform.name}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="w-full text-xs text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors">
                + Add social profiles
              </button>
            </div>

            {/* Last Activity - NEW */}
            {deal.lastActivity && (
              <div className="p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-orange-500" />
                    Last Activity
                  </h4>
                  <span className="text-xs text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded-lg border border-orange-100">
                  {deal.lastActivity}
                </p>
              </div>
            )}

            {/* Tags Section - NEW */}
            {deal.tags && deal.tags.length > 0 && (
              <div className="p-4 border-b border-gray-100 bg-white">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-yellow-500" />
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {deal.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  <button className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium flex items-center">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Tag
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center justify-between p-5">
              <div className="flex space-x-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                        ${activeTab === tab.id 
                          ? 'bg-blue-100 text-blue-700 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="flex items-center space-x-3">
                <ModernButton 
                  variant={deal.isFavorite ? "primary" : "outline"} 
                  size="sm" 
                  onClick={handleToggleFavorite}
                  className="flex items-center space-x-2"
                >
                  {deal.isFavorite ? <Heart className="w-4 h-4" /> : <HeartOff className="w-4 h-4" />}
                  <span>{deal.isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                </ModernButton>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 min-h-0">
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
                {/* AI Enhancement Notice */}
                {lastEnrichment && (
                  <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border border-purple-200 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-900">Deal Enhanced with AI Research</h4>
                        <p className="text-purple-700 text-sm">
                          This deal was enriched with additional information from OpenAI & Gemini research
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deal Information */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                      Deal Information
                    </h4>
                    <button 
                      onClick={() => setEditingField(!editingField ? 'basic' : null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <EditableField
                      field="title"
                      label="Deal Title"
                      value={deal.title}
                      icon={FileText}
                      iconColor="bg-blue-500"
                    />
                    
                    <EditableField
                      field="value"
                      label="Deal Value"
                      value={deal.value}
                      icon={DollarSign}
                      iconColor="bg-green-500"
                      type="number"
                    />
                    
                    <EditableField
                      field="stage"
                      label="Stage"
                      value={deal.stage}
                      icon={Target}
                      iconColor="bg-purple-500"
                      type="select"
                      options={[
                        { value: 'qualification', label: 'Qualification' },
                        { value: 'proposal', label: 'Proposal' },
                        { value: 'negotiation', label: 'Negotiation' },
                        { value: 'closed-won', label: 'Closed Won' },
                        { value: 'closed-lost', label: 'Closed Lost' }
                      ]}
                    />
                    
                    <EditableField
                      field="probability"
                      label="Probability"
                      value={deal.probability}
                      icon={TrendingUp}
                      iconColor="bg-indigo-500"
                      type="number"
                    />
                    
                    <EditableField
                      field="priority"
                      label="Priority"
                      value={deal.priority}
                      icon={AlertCircle}
                      iconColor="bg-red-500"
                      type="select"
                      options={[
                        { value: 'high', label: 'High' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'low', label: 'Low' }
                      ]}
                    />
                  </div>
                </div>

                {/* Contact & Company Information */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-blue-500" />
                    Company Information
                  </h4>
                  <div className="space-y-4">
                    <EditableField
                      field="company"
                      label="Company"
                      value={deal.company}
                      icon={Building2}
                      iconColor="bg-yellow-500"
                    />
                    
                    {/* Contact Person with Link to CRM Contact */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Contact Person</p>
                          <div className="flex items-center">
                            <p className="text-gray-900">{deal.contact || 'Not assigned'}</p>
                            
                            {contactDetail && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                In CRM
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowContactSelector(true)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Select contact"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        
                        {deal.contactId && (
                          <button
                            onClick={handleRemoveContact}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove contact"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Details (if available) */}
                {contactDetail && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      Contact Details
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 flex items-center space-x-4">
                        {contactDetail.avatarSrc ? (
                          <img 
                            src={contactDetail.avatarSrc}
                            alt={contactDetail.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                            {contactDetail.name.charAt(0)}
                          </div>
                        )}
                        
                        <div>
                          <h5 className="text-lg font-semibold text-gray-900">{contactDetail.name}</h5>
                          <p className="text-gray-600">{contactDetail.title}</p>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              contactDetail.status === 'customer' ? 'bg-green-100 text-green-800' : 
                              contactDetail.status === 'prospect' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {contactDetail.status}
                            </span>
                            
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              contactDetail.interestLevel === 'hot' ? 'bg-red-100 text-red-800' : 
                              contactDetail.interestLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              contactDetail.interestLevel === 'low' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {contactDetail.interestLevel} interest
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h6 className="text-sm font-medium text-gray-700">Email</h6>
                        <p className="text-gray-900">{contactDetail.email}</p>
                      </div>
                      
                      {contactDetail.phone && (
                        <div>
                          <h6 className="text-sm font-medium text-gray-700">Phone</h6>
                          <p className="text-gray-900">{contactDetail.phone}</p>
                        </div>
                      )}
                      
                      <div className="col-span-2">
                        <div className="flex justify-between">
                          <h6 className="text-sm font-medium text-gray-700">Actions</h6>
                        </div>
                        <div className="flex mt-2 space-x-2">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </button>
                          {contactDetail.phone && (
                            <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </button>
                          )}
                          <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Meeting
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {contactDetail.notes && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <h6 className="text-sm font-medium text-gray-700">Contact Notes</h6>
                        <p className="text-sm text-gray-600 mt-1">{contactDetail.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Deal Timeline */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
                    Deal Timeline
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900">Deal Created</h6>
                        <p className="text-sm text-gray-600">{deal.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900">Current Stage</h6>
                        <p className="text-sm text-gray-600">{stageLabels[deal.stage]}</p>
                      </div>
                    </div>
                    
                    {deal.dueDate && (
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          3
                        </div>
                        <div className="flex-1">
                          <h6 className="font-medium text-gray-900">Expected Close</h6>
                          <p className="text-sm text-gray-600">{deal.dueDate.toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Notes</h4>
                    <button 
                      onClick={() => handleFieldEdit('notes')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {editingField === 'notes' ? (
                    <div className="space-y-3">
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add notes about this deal..."
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleFieldSave('notes', editForm.notes)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleFieldCancel}
                          className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {deal.notes || 'No notes available for this deal. Click edit to add notes.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'journey' && (
              <div className="p-6">
                <DealJourneyTimeline deal={deal} />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="p-6">
                <DealAnalyticsDashboard deal={deal} />
              </div>
            )}

            {activeTab === 'communication' && (
              <div className="p-6">
                <DealCommunicationHub deal={deal} contact={contactDetail} />
              </div>
            )}

            {activeTab === 'automation' && (
              <div className="p-6">
                <DealAutomationPanel deal={deal} />
              </div>
            )}

            {activeTab === 'ai-insights' && (
              <div className="p-6">
                <AIInsightsPanel deal={deal} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Selection Modal */}
      <SelectContactModal 
        isOpen={showContactSelector}
        onClose={() => setShowContactSelector(false)}
        onSelectContact={handleSelectContact}
        selectedContactId={deal.contactId}
      />
    </div>
  );
};

export default DealDetailView;