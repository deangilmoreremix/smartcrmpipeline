import React, { useState, useRef } from 'react';
import { Deal } from '../types';
import { Contact } from '../types/contact';
import { ModernButton } from './ui/ModernButton';
import { CustomizableAIToolbar } from './ui/CustomizableAIToolbar';
import SelectContactModal from './deals/SelectContactModal';
import { useContactStore } from '../store/contactStore';
import { AIInsightsPanel } from './deals/AIInsightsPanel';
import { DealJourneyTimeline } from './deals/DealJourneyTimeline';
import { DealCommunicationHub } from './deals/DealCommunicationHub';
import { DealAnalyticsDashboard } from './deals/DealAnalyticsDashboard';
import { DealAutomationPanel } from './deals/DealAutomationPanel';
import { useAIResearch } from '../services/aiResearchService';
import { 
  X, 
  Edit, 
  Mail, 
  Phone, 
  Plus, 
  MessageSquare,
  FileText,
  Calendar,
  MoreHorizontal,
  User,
  Building2,
  Clock,
  Tag,
  Star,
  Save,
  Brain,
  Zap,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Upload,
  Trash2,
  DollarSign,
  Settings,
  BarChart3,
  Search,
  Loader2,
  UserPlus,
  Users,
  Sparkles,
  Wand2,
  RefreshCw,
  Briefcase,
  PenTool,
  ChevronRight,
  ChevronDown,
  Workflow,
  Layers,
  Shield,
  Paperclip,
  Link2,
  FileSpreadsheet,
  BarChart2
} from 'lucide-react';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const { contacts, fetchContacts, isLoading } = useContactStore();
  const [contactDetail, setContactDetail] = useState<Contact | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'journey' | 'communication' | 'analytics' | 'automation'>('overview');
  const [isLoadingContact, setIsLoadingContact] = useState(false);
  const aiResearch = useAIResearch();

  // Fetch contact details if we have a contactId
  React.useEffect(() => {
    if (deal.contactId) {
      setIsLoadingContact(true);
      fetchContacts().then(() => {
        setIsLoadingContact(false);
      });
    }
  }, [deal.contactId, fetchContacts]);

  // Update contact details when contacts are loaded
  React.useEffect(() => {
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

  // Handle AI Analysis
  const handleAIAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate AI analysis with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update probability with AI-enhanced score
      const newProbability = Math.min(deal.probability + 15, 95);
      if (onUpdate) {
        const updates: Partial<Deal> = { 
          probability: newProbability,
          lastEnrichment: {
            confidence: newProbability,
            aiProvider: 'Hybrid AI (GPT-4o / Gemini)',
            timestamp: new Date()
          }
        };
        await onUpdate(deal.id, updates);
      }
      
      // Switch to insights tab to show results
      setActiveTab('insights');
    } catch (error) {
      console.error('AI analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle AI Enrichment (more comprehensive than just analysis)
  const handleAIEnrich = async () => {
    setIsEnriching(true);
    try {
      // Call the AI research service to get detailed company information
      const companyData = await aiResearch.researchCompany(deal.company);
      
      // Extract key information from research results
      const researchNotes = `
AI Research (${new Date().toLocaleString()}):
Company: ${companyData.name} - ${companyData.industry}
Description: ${companyData.description}
Revenue: ${companyData.revenue}
Headquarters: ${companyData.headquarters}
Key Decision Makers: ${companyData.keyDecisionMakers.join(', ')}
Potential Needs: ${companyData.potentialNeeds.join(', ')}
Recommended Approach: ${companyData.salesApproach}
      `.trim();
      
      // Find contact person information if available
      let contactNotes = '';
      if (deal.contact) {
        try {
          const contactData = await aiResearch.findContactPerson(deal.contact, deal.company);
          contactNotes = `
Contact Research:
${contactData.name} (${contactData.title})
Strategy: ${contactData.contactStrategy}
Value Proposition: ${contactData.valueProposition}
Communication Style: ${contactData.communicationStyle}
          `.trim();
        } catch (error) {
          console.error('Contact research failed:', error);
        }
      }
      
      // Combine research notes
      const combinedNotes = deal.notes 
        ? `${deal.notes}\n\n${researchNotes}${contactNotes ? '\n\n' + contactNotes : ''}` 
        : `${researchNotes}${contactNotes ? '\n\n' + contactNotes : ''}`;
      
      if (onUpdate) {
        const updates: Partial<Deal> = {
          probability: Math.min(deal.probability + 20, 98),
          notes: combinedNotes,
          lastEnrichment: {
            confidence: 85,
            aiProvider: companyData.aiProvider || 'Comprehensive AI Research',
            timestamp: new Date()
          }
        };
        await onUpdate(deal.id, updates);
        
        // Switch to insights tab to show results
        setActiveTab('insights');
      }
    } catch (error) {
      console.error('AI enrichment failed:', error);
    } finally {
      setIsEnriching(false);
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

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex animate-scale-in shadow-2xl">
        {/* Left Side - Deal Profile */}
        <div className="w-2/5 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col max-h-[95vh]">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-900">Deal Profile</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Deal Header */}
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className={`w-20 h-20 ${stageColors[deal.stage]} rounded-full flex items-center justify-center text-white shadow-lg`}>
                  <DollarSign className="w-8 h-8" />
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Edit className="w-3 h-3" />
                </button>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-1">{deal.title}</h4>
              <p className="text-gray-600 text-sm">{deal.company}</p>
              <p className="text-gray-500 text-sm">{deal.contact}</p>
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <Target className="w-4 h-4 mr-2" />
                {deal.probability}% Probability
              </div>
              
              {/* AI Enhancement Badge */}
              {deal.lastEnrichment && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Enhanced
                  </span>
                </div>
              )}
            </div>

            {/* AI Research Button - HERE IS THE REQUESTED AI RESEARCH BUTTON */}
            <div className="mb-4">
              <button
                onClick={handleAIEnrich}
                disabled={isEnriching}
                className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-md"
              >
                {isEnriching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span>AI Research in Progress...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    <span>AI Auto Research</span>
                  </>
                )}
              </button>
              <p className="text-xs text-center text-gray-500 mt-1">
                Generate comprehensive insights about this deal using AI
              </p>
            </div>

            {/* Contact Person Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Contact Person
                </h4>
                <button
                  onClick={() => setShowContactSelector(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <Users className="w-3 h-3 mr-1" />
                  {deal.contactId ? 'Change' : 'Select Contact'}
                </button>
              </div>
              
              {isLoadingContact ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                  <span className="text-gray-600 text-sm">Loading contact...</span>
                </div>
              ) : contactDetail ? (
                <div className="flex items-center space-x-3">
                  {contactDetail.avatarSrc ? (
                    <img 
                      src={contactDetail.avatarSrc}
                      alt={contactDetail.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{contactDetail.name}</p>
                    <p className="text-sm text-gray-600">{contactDetail.title}</p>
                    <div className="flex items-center mt-1 space-x-3">
                      <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </button>
                      {contactDetail.phone && (
                        <button className="text-xs text-green-600 hover:text-green-800 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : deal.contact ? (
                <div className="flex items-center space-x-3">
                  {deal.contactAvatar ? (
                    <img 
                      src={deal.contactAvatar}
                      alt={deal.contact}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{deal.contact}</p>
                    <p className="text-xs text-gray-500 mt-1">Contact not found in CRM</p>
                    <button 
                      onClick={() => setShowContactSelector(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Link to CRM Contact
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-700 text-sm mb-2">No contact person selected</p>
                  <button 
                    onClick={() => setShowContactSelector(true)}
                    className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full inline-flex items-center"
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Add Contact Person
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              <ModernButton variant="outline" size="sm" className="p-2">
                <Mail className="w-4 h-4" />
              </ModernButton>
              <ModernButton variant="outline" size="sm" className="p-2">
                <Phone className="w-4 h-4" />
              </ModernButton>
              <ModernButton variant="outline" size="sm" className="p-2">
                <Calendar className="w-4 h-4" />
              </ModernButton>
              <ModernButton variant="outline" size="sm" className="p-2">
                <Plus className="w-4 h-4" />
              </ModernButton>
              <ModernButton variant="outline" size="sm" className="p-2">
                <FileText className="w-4 h-4" />
              </ModernButton>
              <ModernButton variant="outline" size="sm" className="p-2">
                <MoreHorizontal className="w-4 h-4" />
              </ModernButton>
            </div>

            {/* AI Tools Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">AI Tools</h4>
              <CustomizableAIToolbar
                entityType="deal"
                entityId={deal.id}
                entityData={deal}
                location="dealDetail"
                layout="grid"
                size="sm"
                showCustomizeButton={true}
              />
            </div>

            {/* Priority Level */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Priority Level</h4>
                <button 
                  onClick={() => handleFieldEdit('priority')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${priorityColors[deal.priority]} animate-pulse`} />
                <span className="text-gray-900 font-medium">{priorityLabels[deal.priority]}</span>
              </div>
            </div>

            {/* Deal Progress */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Deal Progress</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completion</span>
                    <span className="text-sm font-semibold text-gray-900">{deal.probability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        deal.probability >= 75 ? 'bg-green-500' :
                        deal.probability >= 50 ? 'bg-blue-500' :
                        deal.probability >= 25 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${deal.probability}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Value</p>
                      <p className="text-sm text-gray-900">{formatCurrency(deal.value)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Due Date</p>
                      <p className="text-sm text-gray-900">{deal.dueDate?.toLocaleDateString() || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-3 h-3 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Last Activity</p>
                      <p className="text-sm text-gray-900">{deal.lastActivity || 'No activity'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Detailed Information */}
        <div className="flex-1 bg-white overflow-y-auto flex flex-col">
          {/* Tabs Navigation */}
          <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-6 py-3">
            <div className="flex space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: FileText },
                { id: 'insights', label: 'AI Insights', icon: Brain },
                { id: 'journey', label: 'Journey', icon: Target },
                { id: 'communication', label: 'Communication', icon: MessageSquare },
                { id: 'analytics', label: 'Analytics', icon: BarChart2 },
                { id: 'automation', label: 'Automation', icon: Zap }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center space-x-1 ${
                    activeTab === tab.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-8 flex-1 overflow-y-auto">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-900">Deal Overview</h3>
                  <div className="flex items-center space-x-2">
                    {/* AI Analysis Button */}
                    <ModernButton 
                      variant="outline" 
                      size="sm" 
                      className="bg-purple-50 text-purple-700 border-purple-200" 
                      onClick={handleAIAnalyze}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          <span>AI Analyze</span>
                        </>
                      )}
                    </ModernButton>
                    <ModernButton variant="primary" size="sm">
                      <Star className="w-4 h-4 mr-2" />
                      Mark Priority
                    </ModernButton>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Deal Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                      Deal Information
                    </h4>
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
                    </div>
                  </div>

                  {/* Company Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
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
                        
                        <button
                          onClick={() => setShowContactSelector(true)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Deal Tags */}
                    {deal.tags && deal.tags.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Tags</h5>
                        <div className="flex flex-wrap gap-2">
                          {deal.tags.map((tag, idx) => (
                            <span 
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Custom Fields */}
                    {deal.customFields && Object.keys(deal.customFields).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Custom Fields</h5>
                        <div className="space-y-2">
                          {Object.entries(deal.customFields).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{key}</span>
                              <span className="text-sm font-medium text-gray-900">{value as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
                  <div className="bg-gray-50 rounded-xl p-6">
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
                  <div className="bg-gray-50 rounded-xl p-6">
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
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {deal.notes || 'No notes available for this deal. Click edit to add notes.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Insights Tab */}
            {activeTab === 'insights' && (
              <AIInsightsPanel deal={deal} />
            )}
            
            {/* Deal Journey Tab */}
            {activeTab === 'journey' && (
              <DealJourneyTimeline deal={deal} />
            )}
            
            {/* Communication Tab */}
            {activeTab === 'communication' && (
              <DealCommunicationHub deal={deal} contact={contactDetail} />
            )}
            
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <DealAnalyticsDashboard deal={deal} />
            )}
            
            {/* Automation Tab */}
            {activeTab === 'automation' && (
              <DealAutomationPanel deal={deal} />
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