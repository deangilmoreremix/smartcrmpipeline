import React, { useState } from 'react';
import { useAIResearch } from '../../services/aiResearchService';
import { useOpenAI } from '../../services/openaiService';
import { useGeminiAI } from '../../services/geminiService';
import { ModelSelector } from '../ui/ModelSelector';
import { getDefaultModel } from '../../config/aiModels';
import { Deal } from '../../types';
import { X, Save, Bot, Search, Users, Building, Mail, Phone, MapPin, Calendar, DollarSign, Target, AlertCircle, Sparkles } from 'lucide-react';

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
    value: 0,
    stage: 'qualification' as Deal['stage'],
    probability: 50,
    priority: 'medium' as Deal['priority'],
    dueDate: '',
    notes: '',
    tags: [] as string[]
  });

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

  // AI state
  const [isResearching, setIsResearching] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [researchResults, setResearchResults] = useState<any>(null);
  const [selectedAiModel, setSelectedAiModel] = useState(getDefaultModel('gemini').id);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'company' | 'ai'>('basic');
  const [newTag, setNewTag] = useState('');

  // Services
  const aiResearch = useAIResearch();
  const openaiService = useOpenAI();
  const geminiService = useGeminiAI();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'> = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      contactAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=2'
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
      value: 0,
      stage: 'qualification',
      probability: 50,
      priority: 'medium',
      dueDate: '',
      notes: '',
      tags: []
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
    setActiveTab('basic');
  };

  const handleAIResearch = async () => {
    if (!formData.company) {
      alert('Please enter a company name first');
      return;
    }

    setIsResearching(true);
    try {
      // Research company using AI with selected model
      const companyData = await aiResearch.researchCompany(formData.company);
      
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

      // Generate AI insights using selected model
      let insights: string[] = [];
      const mockContact = {
        name: formData.company,
        company: formData.company,
        industry: companyData.industry
      } as any;
      
      if (selectedAiModel.startsWith('gpt-') || selectedAiModel.includes('openai')) {
        insights = await openaiService.getInsights(mockContact);
      } else {
        insights = await geminiService.getInsights(mockContact, selectedAiModel);
      }

      setAiInsights(insights);
      setResearchResults(companyData);
      
      // Auto-populate some form fields
      setFormData(prev => ({
        ...prev,
        title: `${companyData.potentialNeeds?.[0] || 'Business Solution'} for ${companyData.name}`,
        notes: `Company research completed using ${selectedAiModel}. ${companyData.description}`
      }));

    } catch (error) {
      console.error('AI research failed:', error);
      setAiInsights(['AI research failed. Please try again or enter details manually.']);
    } finally {
      setIsResearching(false);
    }
  };

  const handleContactResearch = async () => {
    if (!contactDetails.name) {
      alert('Please enter a contact name first');
      return;
    }

    setIsResearching(true);
    try {
      const contactData = await aiResearch.findContactPerson(contactDetails.name, formData.company);
      
      setContactDetails(prev => ({
        ...prev,
        title: contactData.title,
        email: contactData.email || prev.email,
        phone: contactData.phone || prev.phone,
        department: contactData.department || prev.department,
        linkedin: contactData.linkedin || prev.linkedin,
        notes: `${contactData.background}. Contact strategy: ${contactData.contactStrategy}`
      }));

      // Update main form contact
      setFormData(prev => ({
        ...prev,
        contact: contactDetails.name
      }));

    } catch (error) {
      console.error('Contact research failed:', error);
    } finally {
      setIsResearching(false);
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Target className="w-6 h-6 mr-2 text-blue-600" />
            Create New Deal
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
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
              <div className="space-y-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Enterprise Software License"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., TechCorp Inc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., John Smith"
                    />
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <button
                    type="button"
                    onClick={handleContactResearch}
                    disabled={isResearching || !contactDetails.name}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isResearching ? 'Researching...' : 'AI Research'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={contactDetails.name}
                      onChange={(e) => setContactDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://linkedin.com/in/john-smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Notes
                  </label>
                  <textarea
                    value={contactDetails.notes}
                    onChange={(e) => setContactDetails(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Notes about this contact..."
                  />
                </div>
              </div>
            )}

            {/* Company Details */}
            {activeTab === 'company' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={companyDetails.industry}
                      onChange={(e) => setCompanyDetails(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              </div>
            )}

            {/* AI Research */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                    AI-Powered Research
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

                {/* Model Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select AI Model for Research
                  </label>
                  <ModelSelector
                    selectedModel={selectedAiModel}
                    onModelChange={setSelectedAiModel}
                    provider="all"
                    showDescription={true}
                  />
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
                      AI Insights ({selectedAiModel})
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
                    <h4 className="font-semibold text-gray-900">Research Summary</h4>
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
    </div>
  );
};

export default AddDealModal;