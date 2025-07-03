import React, { useState, useEffect } from 'react';
import { Contact } from '../../types/contact';
import { useContactStore } from '../../store/contactStore';
import { AIInsightsPanel } from './AIInsightsPanel';
import { ContactJourneyTimeline } from './ContactJourneyTimeline';
import { CommunicationHub } from './CommunicationHub';
import { ContactAnalytics } from './ContactAnalytics';
import { AutomationPanel } from './AutomationPanel';
import { useGamification } from '../../contexts/GamificationContext';
import { AvatarWithStatus } from '../ui/AvatarWithStatus';
import { ModernButton } from '../ui/ModernButton';
import {
  X,
  Edit,
  Mail,
  Phone,
  Building2,
  Tag,
  Save,
  Plus,
  UserPlus,
  UserMinus,
  Briefcase,
  MapPin,
  Globe,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart2,
  MessageSquare,
  Zap,
  FileText,
  Target,
  Sparkles,
  Brain,
  Crown,
  Star,
  Award,
  Trophy
} from 'lucide-react';

interface ContactDetailViewProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Contact>) => Promise<any>;
}

export const ContactDetailView: React.FC<ContactDetailViewProps> = ({
  contact,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({ ...contact });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'journey' | 'communication' | 'analytics' | 'automation'>('overview');
  const [showTeamStats, setShowTeamStats] = useState(false);
  const { addTeamMember, removeTeamMember, isTeamMember } = useGamification();

  const handleAddToTeam = async () => {
    try {
      await addTeamMember(contact.id);
      await onUpdate(contact.id, { 
        isTeamMember: true,
        role: 'sales-rep',
        gamificationStats: {
          totalDeals: 0,
          totalRevenue: 0,
          winRate: 0,
          currentStreak: 0,
          longestStreak: 0,
          level: 1,
          points: 0,
          achievements: [],
          monthlyGoal: 50000,
          monthlyProgress: 0
        } 
      });
    } catch (error) {
      console.error('Failed to add team member:', error);
    }
  };

  const handleRemoveFromTeam = async () => {
    try {
      await removeTeamMember(contact.id);
      await onUpdate(contact.id, { 
        isTeamMember: false,
        role: undefined,
        gamificationStats: undefined
      });
    } catch (error) {
      console.error('Failed to remove team member:', error);
    }
  };

  useEffect(() => {
    // Update form data when contact changes
    setFormData({ ...contact });
  }, [contact]);

  const toggleEditMode = (field: string) => {
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (field: string) => {
    setSaving(true);
    try {
      const updates = { [field]: formData[field as keyof Contact] };
      await onUpdate(contact.id, updates);
      toggleEditMode(field);
    } catch (error) {
      console.error('Failed to update contact:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Helper to convert 'hot', 'medium', etc. to colors
  const getInterestColor = (level: string) => {
    switch (level) {
      case 'hot': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      case 'cold': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-yellow-500 text-white';
      case 'prospect': return 'bg-blue-500 text-white';
      case 'customer': return 'bg-green-500 text-white';
      case 'inactive': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex animate-scale-in shadow-2xl">
        {/* Left Side - Contact Profile */}
        <div className="w-2/5 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col max-h-[95vh]">
          {/* Fixed Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-900">Contact Profile</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Contact Avatar and Basic Info */}
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <AvatarWithStatus
                  src={contact.avatarSrc}
                  alt={contact.name}
                  size="xl"
                  status={contact.status}
                />
                
                {/* Team Member Badge if applicable */}
                {contact.isTeamMember && (
                  <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-1 rounded-full shadow-lg">
                    <Crown className="w-4 h-4" />
                  </div>
                )}
                
                {/* Favorite Badge if applicable */}
                {contact.isFavorite && (
                  <div className="absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full shadow-lg">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                )}
                
                <button className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <Edit className="w-3 h-3" />
                </button>
              </div>
              
              {/* Contact Name */}
              {editMode.name ? (
                <div className="mb-4">
                  <div className="flex space-x-2 mb-1">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Last Name"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleEditMode('name')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleInputChange('name', `${formData.firstName} ${formData.lastName}`);
                        handleSave('name');
                        handleSave('firstName');
                        handleSave('lastName');
                      }}
                      disabled={saving}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <h4 className="text-xl font-semibold text-gray-900 mb-1 flex items-center justify-center space-x-2">
                  <span>{contact.name}</span>
                  <button
                    onClick={() => toggleEditMode('name')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </h4>
              )}
              
              {/* Job Title & Company */}
              {editMode.title ? (
                <div className="mb-4">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    placeholder="Job Title"
                  />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    placeholder="Company"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleEditMode('title')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSave('title');
                        handleSave('company');
                      }}
                      disabled={saving}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-sm flex items-center justify-center space-x-2">
                    <span>{contact.title}</span>
                    <button
                      onClick={() => toggleEditMode('title')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  </p>
                  <p className="text-gray-500 text-sm">{contact.company}</p>
                </>
              )}
              
              {/* Status and Interest Level */}
              <div className="mt-3 flex justify-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                  {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                </span>
                <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${getInterestColor(contact.interestLevel)} mr-1`}></div>
                  <span className="text-xs font-medium text-gray-700">
                    {contact.interestLevel.charAt(0).toUpperCase() + contact.interestLevel.slice(1)} Interest
                  </span>
                </div>
              </div>

              {/* Team Member Actions */}
              <div className="mt-4">
                {contact.isTeamMember ? (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <ModernButton
                        variant="outline"
                        onClick={() => setShowTeamStats(!showTeamStats)}
                        className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        {showTeamStats ? 'Hide Team Stats' : 'Show Team Stats'}
                      </ModernButton>
                    </div>
                    <div className="flex justify-center">
                      <ModernButton
                        variant="outline"
                        onClick={handleRemoveFromTeam}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove from Team
                      </ModernButton>
                    </div>
                  </div>
                ) : (
                  <ModernButton
                    variant="primary"
                    onClick={handleAddToTeam}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add to Team
                  </ModernButton>
                )}
              </div>
            </div>
            
            {/* Team Member Stats (conditionally shown) */}
            {contact.isTeamMember && showTeamStats && contact.gamificationStats && (
              <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 shadow-sm">
                <h4 className="text-base font-semibold text-indigo-900 mb-4 flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-indigo-600" />
                  Team Performance
                </h4>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <h5 className="text-xs font-medium text-indigo-800 mb-1 flex items-center">
                      <Star className="w-3 h-3 mr-1 text-yellow-500" />
                      Level {contact.gamificationStats.level}
                    </h5>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{ width: `${(contact.gamificationStats.points % 1000) / 10}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 ml-2">{contact.gamificationStats.points} pts</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <h5 className="text-xs font-medium text-indigo-800 mb-1">Win Rate</h5>
                    <p className="text-lg font-bold text-indigo-900">{contact.gamificationStats.winRate}%</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <h5 className="text-xs font-medium text-indigo-800 mb-1">Total Deals</h5>
                    <p className="text-lg font-bold text-indigo-900">{contact.gamificationStats.totalDeals}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-indigo-100">
                    <h5 className="text-xs font-medium text-indigo-800 mb-1">Revenue</h5>
                    <p className="text-lg font-bold text-indigo-900">${contact.gamificationStats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Monthly Target */}
                {contact.gamificationStats.monthlyGoal && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <h5 className="text-xs font-medium text-indigo-800">Monthly Target</h5>
                      <span className="text-xs text-indigo-900">
                        ${(contact.gamificationStats.monthlyProgress || 0).toLocaleString()} / ${contact.gamificationStats.monthlyGoal.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, ((contact.gamificationStats.monthlyProgress || 0) / contact.gamificationStats.monthlyGoal) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Achievements */}
                {contact.gamificationStats.achievements.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-indigo-800 mb-2">Achievements</h5>
                    <div className="flex flex-wrap gap-2">
                      {contact.gamificationStats.achievements.map((achievement, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                        >
                          <Award className="w-3 h-3 mr-1 text-yellow-600" />
                          {achievement === 'first-deal' ? 'First Deal' : 
                           achievement === 'deal-streak-5' ? '5 Deal Streak' :
                           achievement === 'revenue-milestone-100k' ? '$100K Revenue' :
                           achievement === 'pipeline-master' ? 'Pipeline Master' :
                           achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Details */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Contact Details</h4>
              
              <div className="space-y-3">
                {/* Email */}
                {editMode.email ? (
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleEditMode('email')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave('email')}
                        disabled={saving}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a 
                          href={`mailto:${contact.email}`} 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contact.email}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleEditMode('email')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* Phone */}
                {editMode.phone ? (
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleEditMode('phone')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave('phone')}
                        disabled={saving}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        {contact.phone ? (
                          <a 
                            href={`tel:${contact.phone}`} 
                            className="text-green-600 hover:text-green-800"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {contact.phone}
                          </a>
                        ) : (
                          <p className="text-gray-500 italic">Not provided</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleEditMode('phone')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* Company & Industry */}
                {editMode.company ? (
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Company & Industry</label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Company"
                      />
                      <input
                        type="text"
                        value={formData.industry || ''}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Industry"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleEditMode('company')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          handleSave('company');
                          handleSave('industry');
                        }}
                        disabled={saving}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-purple-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Company & Industry</p>
                        <p className="text-gray-900">{contact.company} {contact.industry ? `• ${contact.industry}` : ''}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleEditMode('company')}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* Tags */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <Tag className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {contact.tags && contact.tags.length > 0 ? (
                          contact.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No tags</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleEditMode('tags')}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Additional Information</h4>
              
              <div className="space-y-3">
                {/* Sources */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lead Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {contact.sources.map((source, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Last Connected */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Connected</p>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-500 mr-2" />
                    <p className="text-gray-900">{contact.lastConnected || 'No record'}</p>
                  </div>
                </div>
                
                {/* Custom Fields */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-600">Custom Fields</p>
                    <button className="text-xs text-blue-600 hover:text-blue-800">
                      <Plus className="w-3 h-3 inline mr-1" />
                      Add Field
                    </button>
                  </div>
                  
                  {contact.customFields && Object.keys(contact.customFields).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(contact.customFields).map(([key, value]) => (
                        <div key={key} className="flex justify-between bg-gray-50 p-2 rounded-md">
                          <span className="text-sm text-gray-600">{key}</span>
                          <span className="text-sm text-gray-900">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm">No custom fields</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Notes</h4>
                <button
                  onClick={() => toggleEditMode('notes')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              {editMode.notes ? (
                <div className="space-y-3">
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={5}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleEditMode('notes')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave('notes')}
                      disabled={saving}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-line">
                    {contact.notes || 'No notes for this contact.'}
                  </p>
                </div>
              )}
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
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Overview</h3>
                
                {/* Contact Summary */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    Contact Summary
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Full Name</p>
                        <p className="text-lg text-gray-900">{contact.name}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Status</p>
                        <div className="flex items-center mt-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                            {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Interest Level</p>
                        <div className="flex items-center mt-1">
                          <div className={`w-2.5 h-2.5 rounded-full ${getInterestColor(contact.interestLevel)} mr-2`} />
                          <span className="text-sm text-gray-900">
                            {contact.interestLevel.charAt(0).toUpperCase() + contact.interestLevel.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                          {contact.email}
                        </a>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Phone</p>
                        {contact.phone ? (
                          <a href={`tel:${contact.phone}`} className="text-blue-600 hover:text-blue-800">
                            {contact.phone}
                          </a>
                        ) : (
                          <p className="text-gray-500 italic">Not provided</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-700">Lead Source</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contact.sources.map((source, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Company Information */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-purple-500" />
                    Company Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Company Name</p>
                      <p className="text-lg text-gray-900">{contact.company}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Industry</p>
                      <p className="text-lg text-gray-900">{contact.industry || 'Not specified'}</p>
                    </div>
                    
                    {/* If we had more company details, they would go here */}
                  </div>
                  
                  {/* Company Website */}
                  {contact.socialProfiles?.website && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700">Company Website</p>
                      <a 
                        href={contact.socialProfiles.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center mt-1"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        {contact.socialProfiles.website}
                      </a>
                    </div>
                  )}
                </div>
                
                {/* AI Enrichment */}
                {contact.lastEnrichment && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 shadow-sm mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                      AI Enrichment Details
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Brain className="w-5 h-5 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">AI Confidence Score</p>
                          <p className="text-lg text-gray-900">{contact.lastEnrichment.confidence}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-5 h-5 flex items-center justify-center mr-3">🤖</div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">AI Provider</p>
                          <p className="text-gray-900">{contact.lastEnrichment.aiProvider || 'AI Assistant'}</p>
                        </div>
                      </div>
                      
                      {contact.lastEnrichment.timestamp && (
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Enrichment Date</p>
                            <p className="text-gray-900">{contact.lastEnrichment.timestamp.toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <button className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Send Email
                  </button>
                  <button className="p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Call
                  </button>
                  <button className="p-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule
                  </button>
                </div>
              </div>
            )}
            
            {/* AI Insights Tab */}
            {activeTab === 'insights' && (
              <AIInsightsPanel contact={contact} />
            )}
            
            {/* Journey Tab */}
            {activeTab === 'journey' && (
              <ContactJourneyTimeline contact={contact} />
            )}
            
            {/* Communication Tab */}
            {activeTab === 'communication' && (
              <CommunicationHub contact={contact} />
            )}
            
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <ContactAnalytics contact={contact} />
            )}
            
            {/* Automation Tab */}
            {activeTab === 'automation' && (
              <AutomationPanel contact={contact} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};