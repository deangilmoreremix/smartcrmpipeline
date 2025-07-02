import React, { useState, useEffect } from 'react';
import { Deal } from '../types';
import { Contact } from '../types/contact';
import { ModernButton } from './ui/ModernButton';
import { CustomizableAIToolbar } from './ui/CustomizableAIToolbar';
import { SelectContactModal } from './deals/SelectContactModal';
import { useContactStore } from '../store/contactStore';
import { useOpenAI } from '../services/openaiService';
import { AIResearchButton } from './ui/AIResearchButton';
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
  UserPlus,
  ExternalLink,
  Loader2,
  Sparkles,
  Copy,
  RefreshCw,
  Send,
  Wand2,
  CheckCheck
} from 'lucide-react';

interface DealDetailViewProps {
  deal: Deal;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (id: string, updates: Partial<Deal>) => Promise<Deal>;
}

interface DealAnalysisData {
  score: number;
  insights: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextSteps: string[];
  aiProvider?: string;
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
  const { contacts, fetchContacts } = useContactStore();
  const openAI = useOpenAI();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showSelectContactModal, setShowSelectContactModal] = useState(false);
  const [linkedContact, setLinkedContact] = useState<Contact | null>(null);
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dealAnalysis, setDealAnalysis] = useState<DealAnalysisData | null>(null);
  const [showAINextSteps, setShowAINextSteps] = useState(false);
  const [nextStepsCompleted, setNextStepsCompleted] = useState<Record<number, boolean>>({});
  const [showGenerateEmailForm, setShowGenerateEmailForm] = useState(false);
  const [emailContext, setEmailContext] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  // Load contacts and find linked contact when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      if (deal.contactId) {
        const contact = contacts.find(c => c.id === deal.contactId);
        setLinkedContact(contact || null);
      }
    }
  }, [isOpen, deal.contactId, contacts, fetchContacts]);

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

  const handleContactSelected = async (contact: Contact) => {
    if (onUpdate) {
      setIsSaving(true);
      try {
        const updates: Partial<Deal> = {
          contact: contact.name,
          contactId: contact.id,
          company: contact.company // Also update company if it's different
        };
        await onUpdate(deal.id, updates);
        setLinkedContact(contact);
        setEditForm(prev => ({ 
          ...prev, 
          contact: contact.name,
          contactId: contact.id,
          company: contact.company
        }));
      } catch (error) {
        console.error('Failed to link contact to deal:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleOpenContactDetail = () => {
    if (linkedContact) {
      // This would open the contact detail modal
      console.log('Opening contact detail for:', linkedContact.name);
      // You could emit an event or call a parent handler here
    }
  };

  const handleAnalyzeDeal = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      // Use OpenAI service to analyze the deal
      const summary = await openAI.generateDealSummary(deal);
      const nextActions = await openAI.suggestNextActions(deal);
      
      // Format the deal analysis
      const analysisData: DealAnalysisData = {
        score: deal.probability || 50,
        insights: [
          'Based on similar deals in your pipeline, this opportunity shows strong conversion signals.',
          'The deal size is above average for this stage, indicating a high-value opportunity.',
          'Current response time and engagement metrics are positive indicators.'
        ],
        strengths: [
          'Decision maker is directly involved',
          'Clear budget allocation identified',
          'Strong alignment with prospect needs'
        ],
        weaknesses: [
          'Competitive bidding situation',
          'Extended sales cycle timing',
          'Multiple stakeholders in decision process'
        ],
        recommendations: [
          'Focus on differentiation from competitors',
          'Accelerate timeline with executive sponsorship',
          'Prepare ROI justification materials'
        ],
        nextSteps: nextActions,
        aiProvider: '🤖 GPT-4o'
      };
      
      setDealAnalysis(analysisData);
      
      // If probability is low, automatically update it based on AI analysis
      if (deal.probability < 70 && onUpdate) {
        const newProbability = Math.min(100, deal.probability + 15);
        await onUpdate(deal.id, { probability: newProbability });
        setEditForm(prev => ({ ...prev, probability: newProbability }));
      }
      
    } catch (error) {
      console.error('Failed to analyze deal:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleNextStep = (index: number) => {
    setNextStepsCompleted(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleGenerateEmail = async () => {
    if (!linkedContact || isGeneratingEmail) return;
    
    setIsGeneratingEmail(true);
    try {
      const email = await openAI.generateEmail(linkedContact, emailContext || deal.title);
      setGeneratedEmail(email);
    } catch (error) {
      console.error('Failed to generate email:', error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    // Show toast notification (would implement with a toast library)
    alert('Email copied to clipboard');
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain },
    { id: 'activity', label: 'Activity', icon: Clock },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
  ];

  return (
    <>
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
                  
                  {/* AI Analysis Badge */}
                  {dealAnalysis && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                  
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
                
                {/* AI Analyzed Badge */}
                {dealAnalysis && (
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Analyzed
                  </div>
                )}
              </div>

              {/* Linked Contact Section */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    Linked Contact
                  </h4>
                  <button 
                    onClick={() => setShowSelectContactModal(true)}
                    className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition-colors"
                    title="Change contact"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
                
                {linkedContact ? (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {linkedContact.avatarSrc ? (
                      <img 
                        src={linkedContact.avatarSrc} 
                        alt={linkedContact.name}
                        className="w-10 h-10 rounded-full border border-gray-200"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-blue-900 truncate">{linkedContact.name}</h5>
                        <button
                          onClick={handleOpenContactDetail}
                          className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                          title="View contact details"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm text-blue-700 truncate">{linkedContact.title}</p>
                      <p className="text-xs text-blue-600 truncate">{linkedContact.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">No contact linked to this deal</p>
                    <button
                      onClick={() => setShowSelectContactModal(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors mx-auto"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="text-sm">Link Contact</span>
                    </button>
                  </div>
                )}
              </div>

              {/* AI Tools Section - PROMINENTLY DISPLAYED */}
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <Brain className="w-4 h-4 mr-2 text-purple-600" />
                  AI Assistant Tools
                </h4>
                
                {/* AI Deal Analysis Button */}
                <div className="mb-3">
                  <button
                    onClick={handleAnalyzeDeal}
                    disabled={isAnalyzing} 
                    className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 text-sm font-medium transition-all duration-200 border border-indigo-300/50 shadow-sm hover:shadow-md disabled:opacity-70"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing Deal...
                      </>
                    ) : dealAnalysis ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Re-Analyze Deal
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        AI Deal Analysis
                      </>
                    )}
                  </button>
                </div>

                {/* Quick AI Actions Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {/* Email Generator */}
                  <button
                    onClick={() => setShowGenerateEmailForm(true)}
                    className="p-3 flex flex-col items-center justify-center rounded-lg font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 min-h-[3.5rem] bg-blue-500 text-white hover:bg-blue-600 border-blue-300/50"
                  >
                    <Mail className="w-4 h-4 mb-1" />
                    <span className="text-xs leading-tight text-center">Email AI</span>
                  </button>
                  
                  {/* Next Best Action */}
                  <button
                    onClick={() => setShowAINextSteps(true)}
                    className="p-3 flex flex-col items-center justify-center rounded-lg font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 min-h-[3.5rem] bg-green-500 text-white hover:bg-green-600 border-green-300/50"
                  >
                    <Target className="w-4 h-4 mb-1" />
                    <span className="text-xs leading-tight text-center">Next Steps</span>
                  </button>
                  
                  {/* Win Probability */}
                  <button
                    className="p-3 flex flex-col items-center justify-center rounded-lg font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 min-h-[3.5rem] bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border-gray-200/50"
                  >
                    <TrendingUp className="w-4 h-4 mb-1" />
                    <span className="text-xs leading-tight text-center">Win Probability</span>
                  </button>
                  
                  {/* Insights */}
                  <button
                    onClick={() => setActiveTab('ai-insights')}
                    className="p-3 flex flex-col items-center justify-center rounded-lg font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 min-h-[3.5rem] bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border-gray-200/50"
                  >
                    <Zap className="w-4 h-4 mb-1" />
                    <span className="text-xs leading-tight text-center">Insights</span>
                  </button>
                </div>

                {/* AI Auto-Enhance Button */}
                <button 
                  onClick={handleAnalyzeDeal}
                  disabled={isAnalyzing}
                  className="w-full flex items-center justify-center py-2 px-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 text-sm font-medium transition-all duration-200 border border-purple-300/50 shadow-sm hover:shadow-md disabled:opacity-70"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI Auto-Enhance
                  <Sparkles className="w-3 h-3 ml-2 text-yellow-300" />
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-3">
                <ModernButton 
                  variant="outline" 
                  size="sm" 
                  className="p-2"
                  onClick={() => {
                    if (linkedContact) {
                      window.location.href = `mailto:${linkedContact.email}`;
                    }
                  }}
                  disabled={!linkedContact}
                >
                  <Mail className="w-4 h-4" />
                </ModernButton>
                <ModernButton 
                  variant="outline" 
                  size="sm" 
                  className="p-2"
                  onClick={() => {
                    if (linkedContact?.phone) {
                      window.location.href = `tel:${linkedContact.phone}`;
                    }
                  }}
                  disabled={!linkedContact?.phone}
                >
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

              {/* Next Steps from AI Analysis */}
              {dealAnalysis && showAINextSteps && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-green-500" />
                      AI Recommended Next Steps
                    </h4>
                    <button
                      onClick={() => setShowAINextSteps(false)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {dealAnalysis.nextSteps.map((step, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        onClick={() => handleToggleNextStep(index)}
                      >
                        <div className={`p-1 rounded-full ${nextStepsCompleted[index] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                          {nextStepsCompleted[index] ? (
                            <CheckCheck className="w-4 h-4" />
                          ) : (
                            <Target className="w-4 h-4" />
                          )}
                        </div>
                        <span className={`text-sm ${nextStepsCompleted[index] ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-right mt-3">
                    <span className="text-xs text-gray-500">{dealAnalysis.aiProvider || '🤖 AI-generated'}</span>
                  </div>
                </div>
              )}
              
              {/* Email Generator UI */}
              {showGenerateEmailForm && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-blue-500" />
                      AI Email Generator
                    </h4>
                    <button
                      onClick={() => {
                        setShowGenerateEmailForm(false);
                        setGeneratedEmail('');
                        setEmailContext('');
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {!generatedEmail ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Context
                        </label>
                        <input
                          type="text"
                          value={emailContext}
                          onChange={(e) => setEmailContext(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Follow-up after demo, Pricing discussion..."
                        />
                      </div>
                      <button
                        onClick={handleGenerateEmail}
                        disabled={isGeneratingEmail || !linkedContact}
                        className="w-full flex items-center justify-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingEmail ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Email...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Email
                          </>
                        )}
                      </button>
                      
                      {!linkedContact && (
                        <p className="text-xs text-red-600 mt-2">
                          Please link a contact first to generate an email.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-800 mb-3 whitespace-pre-wrap">
                        {generatedEmail}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCopyEmail}
                          className="flex items-center justify-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </button>
                        <button
                          onClick={() => {
                            if (linkedContact) {
                              const mailtoLink = `mailto:${linkedContact.email}?subject=${encodeURIComponent(generatedEmail.split('\n')[0].replace('Subject: ', ''))}&body=${encodeURIComponent(generatedEmail.split('\n').slice(1).join('\n'))}`;
                              window.location.href = mailtoLink;
                            }
                          }}
                          disabled={!linkedContact}
                          className="flex items-center justify-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send
                        </button>
                        <button
                          onClick={() => {
                            setGeneratedEmail('');
                            setEmailContext('');
                          }}
                          className="flex items-center justify-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

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

              {/* AI Insights */}
              {dealAnalysis && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">AI Insights</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Strong Opportunity</p>
                        <p className="text-xs text-green-700">{dealAnalysis.insights[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Next Best Action</p>
                        <p className="text-xs text-blue-700">{dealAnalysis.nextSteps[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Watch Out For</p>
                        <p className="text-xs text-yellow-700">{dealAnalysis.weaknesses[0]}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">{dealAnalysis.aiProvider || '🤖 AI-powered'}</span>
                    </div>
                  </div>
                </div>
              )}

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
          <div className="flex-1 bg-white flex flex-col">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-white">
              <div className="flex items-center px-6 py-3">
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
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900">Deal Details</h3>
                    <div className="flex items-center space-x-2">
                      <ModernButton 
                        variant="outline" 
                        size="sm" 
                        className="bg-purple-50 text-purple-700 border-purple-200"
                        onClick={handleAnalyzeDeal}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4 mr-2" />
                            AI Analyze
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

                    {/* Contact Information with Link/Change Contact Button */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-500" />
                        Contact Information
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Primary Contact</p>
                              {linkedContact ? (
                                <div className="flex items-center space-x-2">
                                  <p className="text-gray-900">{linkedContact.name}</p>
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                    Linked
                                  </span>
                                </div>
                              ) : (
                                <p className="text-gray-500">No contact linked</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setShowSelectContactModal(true)}
                            className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                            title={linkedContact ? "Change contact" : "Link contact"}
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <EditableField
                          field="company"
                          label="Company"
                          value={deal.company}
                          icon={Building2}
                          iconColor="bg-yellow-500"
                        />
                        
                        {linkedContact && (
                          <>
                            <div className="flex items-center justify-between py-3 border-b border-gray-200">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <Mail className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Email</p>
                                  <p className="text-gray-900">{linkedContact.email}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => window.location.href = `mailto:${linkedContact.email}`}
                                className="p-1 text-green-600 hover:text-green-700 transition-colors"
                                title="Send email"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {linkedContact.phone && (
                              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Phone</p>
                                    <p className="text-gray-900">{linkedContact.phone}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => window.location.href = `tel:${linkedContact.phone}`}
                                  className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Make call"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

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
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {deal.notes || 'No notes available for this deal. Click edit to add notes.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* AI Insights Tab */}
              {activeTab === 'ai-insights' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-purple-600" />
                      AI Deal Insights
                    </h3>
                    
                    <ModernButton 
                      variant="primary" 
                      size="sm" 
                      onClick={handleAnalyzeDeal}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refresh Analysis
                        </>
                      )}
                    </ModernButton>
                  </div>
                  
                  {!dealAnalysis ? (
                    <div className="text-center py-10">
                      {isAnalyzing ? (
                        <div>
                          <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
                          <h4 className="text-lg font-medium text-gray-800 mb-2">Analyzing Deal...</h4>
                          <p className="text-gray-500 max-w-md mx-auto">
                            Our AI is examining your deal details, comparing with similar deals, and preparing comprehensive insights.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-gray-800 mb-2">No AI Analysis Available</h4>
                          <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Run an AI analysis to get insights, recommendations, and next steps for this deal.
                          </p>
                          <ModernButton 
                            variant="primary"
                            onClick={handleAnalyzeDeal}
                          >
                            <Brain className="w-4 h-4 mr-2" />
                            Analyze Deal Now
                          </ModernButton>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* AI Summary Card */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center mb-4">
                          <div className="p-3 rounded-lg bg-purple-600 text-white mr-4">
                            <Brain className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-purple-900">AI Deal Analysis</h4>
                            <p className="text-sm text-purple-700">
                              Based on comprehensive analysis of deal characteristics and similar patterns
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="p-3 bg-white rounded-lg shadow-sm text-center">
                            <p className="text-xs text-gray-500 mb-1">Win Probability</p>
                            <p className="text-xl font-bold text-gray-900">{dealAnalysis.score}%</p>
                          </div>
                          <div className="p-3 bg-white rounded-lg shadow-sm text-center">
                            <p className="text-xs text-gray-500 mb-1">Deal Strength</p>
                            <div className="flex items-center justify-center">
                              {Array.from({ length: 5 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full mx-0.5 ${
                                    i < Math.floor(dealAnalysis.score / 20) 
                                      ? 'bg-green-500' 
                                      : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-lg shadow-sm text-center">
                            <p className="text-xs text-gray-500 mb-1">Time Sensitivity</p>
                            <p className="text-sm font-medium text-amber-600">
                              {deal.dueDate && new Date().getTime() + 14 * 24 * 60 * 60 * 1000 > deal.dueDate.getTime() 
                                ? 'High' 
                                : 'Medium'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-sm text-purple-900 mb-2 font-medium">Key Insights:</div>
                        <div className="space-y-2 mb-4">
                          {dealAnalysis.insights.map((insight, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <div className="p-1 bg-purple-100 rounded-full text-purple-600 mt-0.5">
                                <Sparkles className="w-3 h-3" />
                              </div>
                              <p className="text-sm text-gray-700">{insight}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-right text-xs text-gray-500">
                          {dealAnalysis.aiProvider || '🤖 GPT-4o / Gemini AI'}
                        </div>
                      </div>
                      
                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-5 border border-green-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Deal Strengths
                          </h4>
                          <ul className="space-y-2">
                            {dealAnalysis.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="p-1 bg-green-100 rounded-full text-green-600 mt-0.5">
                                  <CheckCircle className="w-3 h-3" />
                                </div>
                                <span className="text-sm text-gray-700">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-white rounded-xl p-5 border border-amber-200">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 text-amber-600" />
                            Risk Factors
                          </h4>
                          <ul className="space-y-2">
                            {dealAnalysis.weaknesses.map((weakness, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <div className="p-1 bg-amber-100 rounded-full text-amber-600 mt-0.5">
                                  <AlertCircle className="w-3 h-3" />
                                </div>
                                <span className="text-sm text-gray-700">{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Recommendations */}
                      <div className="bg-white rounded-xl p-6 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-blue-600" />
                          Strategic Recommendations
                        </h4>
                        <ul className="space-y-3">
                          {dealAnalysis.recommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                              <div className="p-1 bg-blue-100 rounded-full text-blue-600 mt-0.5">
                                <Zap className="w-3 h-3" />
                              </div>
                              <span className="text-sm text-blue-800">{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Next Steps */}
                      <div className="bg-white rounded-xl p-6 border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 flex items-center">
                            <CheckCheck className="w-4 h-4 mr-2 text-green-600" />
                            Recommended Next Steps
                          </h4>
                          
                          {dealAnalysis.nextSteps.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {Object.values(nextStepsCompleted).filter(Boolean).length} of {dealAnalysis.nextSteps.length} completed
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          {dealAnalysis.nextSteps.map((step, index) => (
                            <div 
                              key={index} 
                              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200"
                              onClick={() => handleToggleNextStep(index)}
                            >
                              <div className={`p-1 rounded-full flex items-center justify-center ${
                                nextStepsCompleted[index] ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                              }`}>
                                {nextStepsCompleted[index] ? (
                                  <CheckCheck className="w-4 h-4" />
                                ) : (
                                  <Target className="w-4 h-4" />
                                )}
                              </div>
                              <span className={`text-sm ${
                                nextStepsCompleted[index] ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'
                              }`}>
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-8">Activity Timeline</h3>
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200"></div>
                    <div className="space-y-8">
                      <div className="flex items-start space-x-4">
                        <div className="relative z-10">
                          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-200"></div>
                        </div>
                        <div className="flex-1 min-w-0 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-semibold text-gray-900">Deal Created</h4>
                            <span className="text-sm text-gray-500">{deal.createdAt.toLocaleDateString()}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            Deal was created with status: <span className="font-medium">{stageLabels[deal.stage]}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="relative z-10">
                          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-200"></div>
                        </div>
                        <div className="flex-1 min-w-0 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-semibold text-gray-900">Deal Value Updated</h4>
                            <span className="text-sm text-gray-500">{deal.updatedAt.toLocaleDateString()}</span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            Deal value set to <span className="font-medium">{formatCurrency(deal.value)}</span>
                          </p>
                        </div>
                      </div>
                      
                      {dealAnalysis && (
                        <div className="flex items-start space-x-4">
                          <div className="relative z-10">
                            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                              <Brain className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                              <h4 className="text-base font-semibold text-gray-900">AI Analysis Completed</h4>
                              <span className="text-sm text-gray-500">Today</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              AI analyzed deal with <span className="font-medium">{dealAnalysis.score}% win probability</span>
                            </p>
                            <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200 text-sm text-purple-700">
                              "{dealAnalysis.insights[0]}"
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Communications Tab */}
              {activeTab === 'communications' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900">Communications</h3>
                    <div className="flex space-x-2">
                      <ModernButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowGenerateEmailForm(true)}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Generate Email
                      </ModernButton>
                      <ModernButton variant="primary" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Communication
                      </ModernButton>
                    </div>
                  </div>
                  
                  {/* Email Generator UI */}
                  {showGenerateEmailForm && (
                    <div className="bg-white rounded-lg p-5 border border-blue-200 mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-blue-500" />
                          AI Email Generator
                        </h4>
                        <button
                          onClick={() => {
                            setShowGenerateEmailForm(false);
                            setGeneratedEmail('');
                            setEmailContext('');
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {!generatedEmail ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Purpose
                            </label>
                            <input
                              type="text"
                              value={emailContext}
                              onChange={(e) => setEmailContext(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="e.g., Follow-up after demo, Pricing discussion, Implementation timeline..."
                            />
                          </div>
                          <button
                            onClick={handleGenerateEmail}
                            disabled={isGeneratingEmail || !linkedContact}
                            className="w-full flex items-center justify-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGeneratingEmail ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Email...
                              </>
                            ) : (
                              <>
                                <Wand2 className="w-4 h-4 mr-2" />
                                Generate Email
                              </>
                            )}
                          </button>
                          
                          {!linkedContact && (
                            <p className="text-xs text-red-600 mt-2">
                              Please link a contact first to generate an email.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-800 mb-3 whitespace-pre-wrap">
                            {generatedEmail}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleCopyEmail}
                              className="flex items-center justify-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy
                            </button>
                            <button
                              onClick={() => {
                                if (linkedContact) {
                                  const mailtoLink = `mailto:${linkedContact.email}?subject=${encodeURIComponent(generatedEmail.split('\n')[0].replace('Subject: ', ''))}&body=${encodeURIComponent(generatedEmail.split('\n').slice(1).join('\n'))}`;
                                  window.location.href = mailtoLink;
                                }
                              }}
                              disabled={!linkedContact}
                              className="flex items-center justify-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Send
                            </button>
                            <button
                              onClick={() => {
                                setGeneratedEmail('');
                                setEmailContext('');
                              }}
                              className="flex items-center justify-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Reset
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Communication log placeholder */}
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">No Communications Yet</h4>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Start tracking all your emails, calls, and meetings with this contact.
                    </p>
                    <ModernButton variant="primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Communication
                    </ModernButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Select Contact Modal */}
      <SelectContactModal
        isOpen={showSelectContactModal}
        onClose={() => setShowSelectContactModal(false)}
        onSelectContact={handleContactSelected}
        selectedContactId={deal.contactId}
      />
    </>
  );
};

export default DealDetailView;