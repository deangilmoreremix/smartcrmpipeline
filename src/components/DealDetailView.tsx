import React, { useState } from 'react';
import { Deal } from '../types';
import { ModernButton } from './ui/ModernButton';
import { CustomizableAIToolbar } from './ui/CustomizableAIToolbar';
import SelectContactModal from './deals/SelectContactModal';
import { Contact } from '../types/contact';
import NewContactModal from './deals/NewContactModal';
import { AIResearchButton } from './ui/AIResearchButton';
import { useAIResearch } from '../services/aiResearchService';
import { useOpenAI } from '../services/openaiService';
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
  Sparkles,
  UserPlus,
  Users,
  RefreshCw,
  Send,
  Copy,
  Wand2,
  RotateCw,
  Search,
  Loader2
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
  const [activeTab, setActiveTab] = useState('details');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: deal.title,
    company: deal.company,
    contact: deal.contact,
    value: deal.value,
    stage: deal.stage,
    probability: deal.probability,
    priority: deal.priority,
    notes: deal.notes || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSelectContactModalOpen, setIsSelectContactModalOpen] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
  const [emailContext, setEmailContext] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [nextSteps, setNextSteps] = useState<{step: string; completed: boolean}[]>([]);
  const [isLoadingNextSteps, setIsLoadingNextSteps] = useState(false);
  
  const aiResearch = useAIResearch();
  const openai = useOpenAI();
  
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
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      priority: deal.priority,
      notes: deal.notes || ''
    });
  };
  
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setEditForm(prev => ({
      ...prev,
      contact: contact.name,
    }));
    
    // If we have onUpdate, update the deal with the new contact
    if (onUpdate) {
      onUpdate(deal.id, {
        contact: contact.name,
        contactId: contact.id
      });
    }
  };
  
  const handleSelectContactClick = () => {
    setIsSelectContactModalOpen(true);
  };
  
  const handleNewContactClick = () => {
    setShowNewContactModal(true);
  };
  
  const handleAnalyzeDeal = async () => {
    setIsAnalyzing(true);
    try {
      // Use OpenAI to suggest next actions
      const suggestedActions = await openai.suggestNextActions(deal);
      
      // Format as next steps with completion status
      const formattedSteps = suggestedActions.map(step => ({
        step,
        completed: false
      }));
      
      setNextSteps(formattedSteps);
      
      // Update probability if it makes sense
      if (deal.probability < 60 && onUpdate) {
        const newProbability = Math.min(deal.probability + 15, 90);
        await onUpdate(deal.id, { probability: newProbability });
        setEditForm(prev => ({ ...prev, probability: newProbability }));
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleToggleStepComplete = (index: number) => {
    setNextSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, completed: !step.completed } : step
    ));
  };
  
  const handleGenerateEmail = async () => {
    if (!deal.contact) {
      alert('Please select a contact first');
      return;
    }
    
    setIsGeneratingEmail(true);
    try {
      const emailContent = await openai.generateEmail(
        { name: deal.contact, company: deal.company, title: 'Decision Maker' } as Contact, 
        emailContext || deal.title
      );
      setGeneratedEmail(emailContent);
    } catch (error) {
      console.error('Failed to generate email:', error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };
  
  const handleCopyEmail = () => {
    if (generatedEmail) {
      navigator.clipboard.writeText(generatedEmail);
    }
  };
  
  const handleResetEmail = () => {
    setGeneratedEmail(null);
    setEmailContext('');
  };
  
  const handleLoadNextSteps = async () => {
    setIsLoadingNextSteps(true);
    try {
      const suggestedActions = await openai.suggestNextActions(deal);
      const formattedSteps = suggestedActions.map(step => ({
        step,
        completed: false
      }));
      setNextSteps(formattedSteps);
    } catch (error) {
      console.error('Failed to load next steps:', error);
    } finally {
      setIsLoadingNextSteps(false);
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
              
              {/* Contact Information with Select Button */}
              <div className="mt-3 flex flex-col items-center justify-center">
                <div className="flex items-center space-x-2">
                  {deal.contact ? (
                    <>
                      <span className="font-medium text-gray-700">{deal.contact}</span>
                      <button 
                        onClick={handleSelectContactClick}
                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                        title="Change Contact"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSelectContactClick}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      <span>Select Contact</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={handleNewContactClick}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                >
                  + Add New Contact
                </button>
              </div>
              
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <Target className="w-4 h-4 mr-2" />
                {deal.probability}% Probability
              </div>
            </div>

            {/* AI Tools Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200 shadow-sm">
              <h4 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wide flex items-center">
                <Brain className="w-4 h-4 mr-2 text-purple-600" />
                AI Assistant Tools
              </h4>
              
              {/* Quick AI Actions Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* Email AI */}
                <button 
                  onClick={() => {
                    setActiveTab('emails');
                    handleGenerateEmail();
                  }}
                  className="p-3 flex flex-col items-center justify-center rounded-lg font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 min-h-[3.5rem] bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-blue-300/50"
                >
                  <Mail className="w-4 h-4 mb-1" />
                  <span className="text-xs leading-tight text-center">Email AI</span>
                </button>
                
                {/* Next Steps */}
                <button 
                  onClick={() => {
                    setActiveTab('nextsteps');
                    if (nextSteps.length === 0) {
                      handleLoadNextSteps();
                    }
                  }}
                  className="p-3 flex flex-col items-center justify-center rounded-lg font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 min-h-[3.5rem] bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border-gray-200/50"
                >
                  <Zap className="w-4 h-4 mb-1" />
                  <span className="text-xs leading-tight text-center">Next Steps</span>
                </button>
                
                {/* Win Probability */}
                <button 
                  onClick={() => setActiveTab('analyze')}
                  className="p-3 flex flex-col items-center justify-center rounded-lg font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 min-h-[3.5rem] bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border-gray-200/50"
                >
                  <Target className="w-4 h-4 mb-1" />
                  <span className="text-xs leading-tight text-center">Win Probability</span>
                </button>
                
                {/* Research */}
                <button 
                  onClick={() => setActiveTab('research')}
                  className="p-3 flex flex-col items-center justify-center rounded-lg font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 min-h-[3.5rem] bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border-gray-200/50"
                >
                  <Search className="w-4 h-4 mb-1" />
                  <span className="text-xs leading-tight text-center">Research</span>
                </button>
              </div>

              {/* AI Auto-Enhance Button */}
              <button 
                onClick={handleAnalyzeDeal}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center py-2 px-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 text-sm font-medium transition-all duration-200 border border-purple-300/50 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>AI Analysis in Progress...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    <span>AI Auto-Enhance Deal</span>
                    <Sparkles className="w-3 h-3 ml-2 text-yellow-300" />
                  </>
                )}
              </button>
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
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">AI Insights</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">High Conversion Potential</p>
                    <p className="text-xs text-green-700">Strong engagement metrics and buying signals</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Next Best Action</p>
                    <p className="text-xs text-blue-700">Schedule product demonstration</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Time Sensitive</p>
                    <p className="text-xs text-yellow-700">Decision deadline approaching</p>
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
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 bg-white flex-shrink-0">
            <div className="flex items-center space-x-1 p-4">
              {[
                { id: 'details', label: 'Deal Details', icon: FileText },
                { id: 'analyze', label: 'AI Analysis', icon: Brain },
                { id: 'nextsteps', label: 'Next Steps', icon: Zap },
                { id: 'emails', label: 'AI Email', icon: Mail },
                { id: 'research', label: 'Research', icon: Search }
              ].map(tab => {
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

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Deal Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-900">Deal Details</h3>
                  <div className="flex items-center space-x-2">
                    <ModernButton variant="outline" size="sm" className="bg-purple-50 text-purple-700 border-purple-200" onClick={() => setActiveTab('analyze')}>
                      <Zap className="w-4 h-4 mr-2" />
                      AI Analyze
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

                  {/* Contact Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-500" />
                        Contact Information
                      </h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSelectContactClick}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Users className="w-3 h-3" />
                          <span>Select Contact</span>
                        </button>
                        <button
                          onClick={handleNewContactClick}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Plus className="w-3 h-3" />
                          <span>New Contact</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <EditableField
                        field="company"
                        label="Company"
                        value={deal.company}
                        icon={Building2}
                        iconColor="bg-yellow-500"
                      />
                      
                      <div className="flex items-center justify-between py-3 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Contact Person</p>
                            {deal.contact ? (
                              <div className="flex items-center space-x-3">
                                <p className="text-gray-900">{deal.contact}</p>
                                <div className="flex space-x-2">
                                  <button className="p-1 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                                    <Mail className="w-3 h-3" />
                                  </button>
                                  <button className="p-1 text-green-600 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                                    <Phone className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">No contact selected</p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSelectContactClick}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNewContactClick}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
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
            
            {/* AI Analysis Tab */}
            {activeTab === 'analyze' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Brain className="w-6 h-6 mr-2 text-purple-600" />
                    AI Deal Analysis
                  </h3>
                  <button 
                    onClick={handleAnalyzeDeal}
                    disabled={isAnalyzing}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-70"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Run Analysis</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Deal Strength Assessment</h4>
                  
                  <div className="space-y-4">
                    {/* Win Probability */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Win Probability</span>
                        <span className={`text-sm font-bold ${
                          deal.probability >= 70 ? 'text-green-700' : 
                          deal.probability >= 50 ? 'text-blue-700' : 
                          deal.probability >= 30 ? 'text-yellow-700' : 
                          'text-red-700'
                        }`}>
                          {deal.probability}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            deal.probability >= 70 ? 'bg-green-500' : 
                            deal.probability >= 50 ? 'bg-blue-500' : 
                            deal.probability >= 30 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`}
                          style={{ width: `${deal.probability}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {deal.probability >= 70 ? 'Excellent prospects for closing this deal.' : 
                         deal.probability >= 50 ? 'Good chance of success with proper follow-up.' : 
                         deal.probability >= 30 ? 'Needs additional qualification and nurturing.' : 
                         'Early stage with significant work needed to qualify.'}
                      </p>
                    </div>
                    
                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div>
                        <h5 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Deal Strengths
                        </h5>
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              {deal.probability > 60 ? 'High engagement from key stakeholders' : 'Identified business needs align with our solution'}
                            </span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              {deal.value > 50000 ? 'Deal size indicates serious interest' : 'Clear pain points we can address'}
                            </span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              {deal.stage === 'negotiation' ? 'Advanced stage in sales process' : 'Established communication channels'}
                            </span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                          Areas of Concern
                        </h5>
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              {deal.stage === 'qualification' ? 'Early stage requires more qualification' : 'Competitive landscape is challenging'}
                            </span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              Limited engagement with decision makers
                            </span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              {deal.dueDate ? `Timeline pressure with ${deal.dueDate.toLocaleDateString()} deadline` : 'Unclear decision timeline'}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Strategic Recommendations</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Target className="w-5 h-5 text-blue-700 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 mb-1">Focus on Value Proposition</p>
                        <p className="text-sm text-blue-800">
                          Emphasize how our solution addresses {deal.company}'s specific pain points and delivers measurable ROI.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <Users className="w-5 h-5 text-purple-700 mt-0.5" />
                      <div>
                        <p className="font-medium text-purple-900 mb-1">Stakeholder Engagement</p>
                        <p className="text-sm text-purple-800">
                          Connect with additional decision makers beyond {deal.contact} to secure broader support.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <Clock className="w-5 h-5 text-green-700 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 mb-1">Accelerate Timeline</p>
                        <p className="text-sm text-green-800">
                          {deal.dueDate 
                            ? `Create urgency to close before ${deal.dueDate.toLocaleDateString()} with limited-time incentives.`
                            : 'Establish a clear timeline with concrete next steps and decision milestones.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Next Steps Tab */}
            {activeTab === 'nextsteps' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Zap className="w-6 h-6 mr-2 text-yellow-600" />
                    AI-Powered Next Steps
                  </h3>
                  <button 
                    onClick={handleLoadNextSteps}
                    disabled={isLoadingNextSteps}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors disabled:opacity-70"
                  >
                    {isLoadingNextSteps ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommended Next Actions</h4>
                  
                  {isLoadingNextSteps ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                      <p className="text-gray-600">Generating personalized next steps...</p>
                    </div>
                  ) : nextSteps.length > 0 ? (
                    <div className="space-y-4">
                      {nextSteps.map((step, index) => (
                        <div 
                          key={index}
                          className={`flex items-start space-x-3 p-4 rounded-lg border ${
                            step.completed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <button
                            onClick={() => handleToggleStepComplete(index)}
                            className={`p-1 rounded-md flex-shrink-0 ${
                              step.completed 
                                ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                                : 'text-gray-400 bg-gray-100 hover:text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {step.completed ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </button>
                          <div>
                            <p className={`font-medium ${step.completed ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                              {step.step}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              {step.completed ? (
                                <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                  Completed
                                </span>
                              ) : (
                                <>
                                  <button className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full hover:bg-blue-200">
                                    Schedule
                                  </button>
                                  <button className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full hover:bg-purple-200">
                                    Assign
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h5 className="text-lg font-medium text-gray-700 mb-2">No next steps available</h5>
                      <p className="text-gray-500 mb-4">Generate AI-powered next steps to move this deal forward</p>
                      <button
                        onClick={handleLoadNextSteps}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Next Steps
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                    Timeline & Milestones
                  </h4>
                  
                  <div className="space-y-6">
                    <div className="relative border-l-2 border-gray-200 pl-6 ml-4">
                      <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-[9px] top-0 border-2 border-white"></div>
                      <p className="text-sm text-gray-500 mb-1">{deal.createdAt.toLocaleDateString()}</p>
                      <p className="text-base font-medium text-gray-900">Deal Created</p>
                      <p className="text-sm text-gray-700">Initial opportunity identified</p>
                    </div>
                    
                    <div className="relative border-l-2 border-gray-200 pl-6 ml-4">
                      <div className="absolute w-4 h-4 bg-blue-500 rounded-full -left-[9px] top-0 border-2 border-white animate-pulse"></div>
                      <p className="text-sm text-gray-500 mb-1">Current</p>
                      <p className="text-base font-medium text-gray-900">{stageLabels[deal.stage]}</p>
                      <p className="text-sm text-gray-700">
                        {deal.stage === 'qualification' ? 'Validating fit and requirements' :
                         deal.stage === 'proposal' ? 'Proposal under review' :
                         deal.stage === 'negotiation' ? 'Finalizing terms and conditions' :
                         deal.stage === 'closed-won' ? 'Deal successfully closed' :
                         'Deal lost or abandoned'}
                      </p>
                    </div>
                    
                    {deal.dueDate && (
                      <div className="relative border-l-2 border-gray-200 pl-6 ml-4">
                        <div className="absolute w-4 h-4 bg-yellow-500 rounded-full -left-[9px] top-0 border-2 border-white"></div>
                        <p className="text-sm text-gray-500 mb-1">Target: {deal.dueDate.toLocaleDateString()}</p>
                        <p className="text-base font-medium text-gray-900">Expected Closing Date</p>
                        <p className="text-sm text-gray-700">Final decision deadline</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Email Tab */}
            {activeTab === 'emails' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Mail className="w-6 h-6 mr-2 text-blue-600" />
                    AI Email Generator
                  </h3>
                  <button 
                    onClick={handleGenerateEmail}
                    disabled={isGeneratingEmail || !deal.contact}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-70"
                  >
                    {isGeneratingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>{generatedEmail ? 'Regenerate' : 'Generate Email'}</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Email Context</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Purpose
                      </label>
                      <input 
                        type="text"
                        value={emailContext}
                        onChange={(e) => setEmailContext(e.target.value)}
                        placeholder="e.g., Follow-up after meeting, Proposal submission, Schedule demo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800">
                          Our AI will generate a personalized email for <strong>{deal.contact || '[select contact]'}</strong> at <strong>{deal.company}</strong> based on the deal stage and context.
                        </p>
                      </div>
                    </div>
                    
                    {!deal.contact && (
                      <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800 mb-1">No contact selected</p>
                          <p className="text-sm text-yellow-700">
                            Please select a contact to generate a personalized email.
                          </p>
                          <button 
                            onClick={handleSelectContactClick}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            Select Contact
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {generatedEmail && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-green-600" />
                        Generated Email
                      </h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleCopyEmail}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => window.open(`mailto:${deal.contact}?subject=${encodeURIComponent(generatedEmail.split('\n', 1)[0].replace('Subject: ', ''))}&body=${encodeURIComponent(generatedEmail.split('\n').slice(2).join('\n'))}`)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send</span>
                        </button>
                        <button
                          onClick={handleResetEmail}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap border border-gray-200 font-mono text-sm">
                      {generatedEmail}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-4 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
                      Generated by AI based on deal context
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Research Tab */}
            {activeTab === 'research' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Search className="w-6 h-6 mr-2 text-indigo-600" />
                    Deal Research
                  </h3>
                  <div className="flex space-x-3">
                    <AIResearchButton
                      searchType="company"
                      searchQuery={{ company: deal.company }}
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100"
                      buttonText="Research Company"
                    />
                    <AIResearchButton
                      searchType="contact"
                      searchQuery={{ 
                        firstName: deal.contact?.split(' ')[0], 
                        lastName: deal.contact?.split(' ').slice(1).join(' '),
                        company: deal.company 
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200 text-green-700 hover:from-green-100 hover:to-teal-100"
                      buttonText="Research Contact"
                      disabled={!deal.contact}
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                    About {deal.company}
                  </h4>
                  
                  <div className="text-center py-8">
                    <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h5 className="text-lg font-medium text-gray-700 mb-2">Click "Research Company" to learn more</h5>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Our AI will research {deal.company} to provide valuable insights for your deal strategy, including company details, key stakeholders, and potential pain points.
                    </p>
                  </div>
                </div>
                
                {deal.contact && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-green-600" />
                      About {deal.contact}
                    </h4>
                    
                    <div className="text-center py-8">
                      <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h5 className="text-lg font-medium text-gray-700 mb-2">Click "Research Contact" to learn more</h5>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Our AI will research {deal.contact} to help you understand their role, background, and communication preferences.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Contact Selection Modal */}
      <SelectContactModal
        isOpen={isSelectContactModalOpen}
        onClose={() => setIsSelectContactModalOpen(false)}
        onSelectContact={handleContactSelect}
        selectedContactId={deal.contactId}
      />
      
      {/* New Contact Modal */}
      <NewContactModal
        isOpen={showNewContactModal}
        onClose={() => setShowNewContactModal(false)}
      />
    </div>
  );
};

// Helper Component for Circle Icon
const Circle: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export default DealDetailView;