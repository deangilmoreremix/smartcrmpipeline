import React, { useState } from 'react';
import { Deal } from '../types';
import { Contact } from '../types/contact';
import { ModernButton } from './ui/ModernButton';
import { CustomizableAIToolbar } from './ui/CustomizableAIToolbar';
import { SelectContactModal } from './deals/SelectContactModal';
import { useContactStore } from '../store/contactStore';
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
  ExternalLink
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
  const { contacts, fetchContacts } = useContactStore();
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

  // Load contacts and find linked contact when modal opens
  React.useEffect(() => {
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
          <div className="flex-1 bg-white overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-gray-900">Deal Details</h3>
                <div className="flex items-center space-x-2">
                  <ModernButton variant="outline" size="sm" className="bg-purple-50 text-purple-700 border-purple-200">
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