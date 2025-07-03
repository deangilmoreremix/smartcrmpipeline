import React, { useState, useEffect, useMemo } from 'react';
import { ContactDetailView } from './ContactDetailView';
import { TeamMemberCard } from './TeamMemberCard';
import { useContactStore } from '../../store/contactStore';
import { useGamification } from '../../contexts/GamificationContext';
import { useOpenAI } from '../../services/openaiService';
import { Contact } from '../../types/contact';
import { AIEnhancedContactCard } from './AIEnhancedContactCard';
import AddContactModal from '../deals/AddContactModal';
import Fuse from 'fuse.js';
import { 
  X, 
  Search, 
  Filter, 
  Plus,
  Users,
  ChevronDown,
  Brain,
  Download,
  Upload,
  Zap,
  CheckCheck,
  Grid3X3,
  List,
  Settings,
  UserPlus,
  Crown,
  Star,
  Loader2
} from 'lucide-react';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { contacts, isLoading, updateContact, createContact, fetchContacts } = useContactStore();
  const { teamMembers, addTeamMember, removeTeamMember } = useGamification();
  const openai = useOpenAI();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'external' | 'team'>('external');
  const [activeFilter, setActiveFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingContactId, setAnalyzingContactId] = useState<string | null>(null);
  const [bulkActionDropdown, setBulkActionDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'score' | 'updated'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // Load contacts on mount
  useEffect(() => {
    if (isOpen) {
      fetchContacts();
    }
  }, [isOpen, fetchContacts]);

  // Separate external contacts and team members
  const externalContacts = useMemo(() => {
    return contacts.filter(contact => !contact.isTeamMember);
  }, [contacts]);

  const displayedContacts = activeTab === 'team' ? teamMembers : externalContacts;

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(displayedContacts, {
      keys: ['name', 'company', 'title', 'email', 'industry'],
      threshold: 0.3,
    });
  }, [displayedContacts]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.keyCode === 27) {
        if (selectedContact) {
          setSelectedContact(null);
        } else {
          onClose();
        }
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc, false);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc, false);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, selectedContact]);

  // Filter and search contacts
  const filteredContacts = useMemo(() => {
    let result = displayedContacts;

    // Apply search
    if (searchTerm.trim()) {
      const searchResults = fuse.search(searchTerm);
      result = searchResults.map(result => result.item);
    }

    // Apply interest level filter
    if (activeFilter !== 'all') {
      result = result.filter(contact => contact.interestLevel === activeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(contact => contact.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'company':
          aValue = a.company.toLowerCase();
          bValue = b.company.toLowerCase();
          break;
        case 'score':
          aValue = a.aiScore || 0;
          bValue = b.aiScore || 0;
          break;
        case 'updated':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [displayedContacts, searchTerm, activeFilter, statusFilter, sortBy, sortOrder, fuse]);

  // AI Analysis Functions
  const handleAnalyzeContact = async (contact: Contact) => {
    setAnalyzingContactId(contact.id);
    try {
      const analysis = await openai.analyzeContact(contact);
      const updatedContact = {
        ...contact,
        aiScore: Math.round(analysis.score),
        notes: contact.notes ? `${contact.notes}\n\nAI Analysis: ${analysis.insights.join('. ')}` : `AI Analysis: ${analysis.insights.join('. ')}`,
        lastEnrichment: {
          confidence: Math.round(analysis.score),
          aiProvider: 'OpenAI GPT-4o',
          timestamp: new Date()
        }
      };
      await updateContact(contact.id, updatedContact);
      return true;
    } catch (error) {
      console.error('Analysis failed:', error);
      return false;
    } finally {
      setAnalyzingContactId(null);
    }
  };

  const handleAnalyzeSelected = async () => {
    setIsAnalyzing(true);
    try {
      for (const contactId of selectedContacts) {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
          const analysis = await openai.analyzeContact(contact);
          await updateContact(contact.id, { 
            aiScore: Math.round(analysis.score),
            lastEnrichment: {
              confidence: Math.round(analysis.score),
              aiProvider: 'OpenAI GPT-4o',
              timestamp: new Date()
            }
          });
        }
      }
      setSelectedContacts([]);
    } catch (error) {
      console.error('Bulk analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Contact Selection Functions
  const handleContactSelect = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const handleFilterClick = (filterValue: string) => {
    setActiveFilter(filterValue);
    setIsFilterDropdownOpen(false);
  };

  const handleStatusFilterClick = (statusValue: string) => {
    setStatusFilter(statusValue);
    setIsStatusDropdownOpen(false);
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleContactDetailClose = () => {
    setSelectedContact(null);
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleContactUpdate = async (id: string, updates: Partial<Contact>) => {
    return await updateContact(id, updates);
  };

  // Team member management
  const handleAddToTeam = async (contactId: string) => {
    await addTeamMember(contactId);
  };

  const handleRemoveFromTeam = async (contactId: string) => {
    await removeTeamMember(contactId);
  };

  // New Image handling
  const handleFindNewImage = async (contact: Contact) => {
    try {
      // Simulated image update
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, just change the seed
      const newSeed = Date.now().toString();
      const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`;
      
      await updateContact(contact.id, {
        avatarSrc: newAvatar
      });
      
      return true;
    } catch (error) {
      console.error('Failed to find new image:', error);
      return false;
    }
  };

  // Favorite handling
  const handleToggleFavorite = async (contact: Contact) => {
    try {
      await updateContact(contact.id, {
        isFavorite: !contact.isFavorite
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleContactCreated = (contact: Contact) => {
    // Handle the new contact creation
    setShowAddContactModal(false);
  };

  if (!isOpen) return null;

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Hot Client', value: 'hot' },
    { label: 'Medium Interest', value: 'medium' },
    { label: 'Low Interest', value: 'low' },
    { label: 'Non Interest', value: 'cold' }
  ];

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Lead', value: 'lead' },
    { label: 'Prospect', value: 'prospect' },
    { label: 'Customer', value: 'customer' },
    { label: 'Churned', value: 'churned' }
  ];

  const activeFilterLabel = filterOptions.find(f => f.value === activeFilter)?.label || 'All';
  const activeStatusLabel = statusOptions.find(f => f.value === statusFilter)?.label || 'All Status';

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="bg-white rounded-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col animate-slide-in shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Contacts & Team</h2>
                <p className="text-gray-600">
                  {activeTab === 'team' 
                    ? `${teamMembers.length} team members`
                    : `${externalContacts.length} external contacts`
                  }
                  {filteredContacts.length !== displayedContacts.length && ` • ${filteredContacts.length} filtered`}
                  {selectedContacts.length > 0 && ` • ${selectedContacts.length} selected`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Team/External Tab Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setActiveTab('external');
                    setSelectedContacts([]);
                  }}
                  className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center space-x-2 ${
                    activeTab === 'external' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>External Contacts</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('team');
                    setSelectedContacts([]);
                  }}
                  className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center space-x-2 ${
                    activeTab === 'team' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Crown className="w-4 h-4" />
                  <span>Team Members</span>
                </button>
              </div>

              {/* AI Analysis Button */}
              <button
                onClick={() => selectedContacts.length > 0 ? handleAnalyzeSelected() : null}
                disabled={isAnalyzing || selectedContacts.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                <span>{isAnalyzing ? 'Analyzing...' : 'AI Lead Scoring'}</span>
              </button>

              {/* Bulk Actions */}
              {selectedContacts.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setBulkActionDropdown(!bulkActionDropdown)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Actions</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {bulkActionDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                      <button
                        onClick={handleAnalyzeSelected}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg"
                      >
                        Analyze Selected
                      </button>
                      {activeTab === 'external' && (
                        <button
                          onClick={() => {
                            selectedContacts.forEach(id => handleAddToTeam(id));
                            setSelectedContacts([]);
                            setBulkActionDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add to Team
                        </button>
                      )}
                      <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                        Export Selected
                      </button>
                      <button 
                        onClick={() => setSelectedContacts([])}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors last:rounded-b-lg"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Import/Export */}
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button 
                onClick={() => setShowAddContactModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Contact</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4 flex-1">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab} contacts...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              
              {/* Interest Level Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>{activeFilterLabel}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isFilterDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                    {filterOptions.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => handleFilterClick(filter.value)}
                        className={`
                          w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg
                          ${activeFilter === filter.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                        `}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <span>{activeStatusLabel}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-10">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusFilterClick(option.value)}
                        className={`
                          w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg
                          ${statusFilter === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Select All */}
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{selectedContacts.length === filteredContacts.length ? 'Deselect All' : 'Select All'}</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              {/* Sort Dropdown */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as typeof sortBy);
                  setSortOrder(order as typeof sortOrder);
                }}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="company-asc">Company A-Z</option>
                <option value="company-desc">Company Z-A</option>
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
                <option value="updated-desc">Recently Updated</option>
                <option value="updated-asc">Oldest Updated</option>
              </select>

              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2 text-sm font-medium transition-colors ${
                    viewMode === 'card' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 text-sm font-medium border-l border-gray-300 transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contacts Grid */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading contacts...</p>
                </div>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Users className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {activeTab === 'team' ? 'No team members found' : 'No contacts found'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'team' 
                    ? 'Add contacts to your team to see them here'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredContacts.map((contact) => (
                  activeTab === 'team' ? (
                    <TeamMemberCard
                      key={contact.id}
                      member={contact}
                      isSelected={selectedContacts.includes(contact.id)}
                      onSelect={() => handleContactSelect(contact.id)}
                      onClick={() => handleContactClick(contact)}
                      onRemove={() => handleRemoveFromTeam(contact.id)}
                    />
                  ) : (
                    <AIEnhancedContactCard
                      key={contact.id}
                      contact={contact}
                      isSelected={selectedContacts.includes(contact.id)}
                      onSelect={() => handleContactSelect(contact.id)}
                      onClick={() => handleContactClick(contact)}
                      onAddToTeam={() => handleAddToTeam(contact.id)}
                      showTeamAction={true}
                      onAnalyze={handleAnalyzeContact}
                      isAnalyzing={analyzingContactId === contact.id}
                      onToggleFavorite={handleToggleFavorite}
                      onFindNewImage={handleFindNewImage}
                    />
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailView
          contact={selectedContact}
          isOpen={!!selectedContact}
          onClose={handleContactDetailClose}
          onUpdate={handleContactUpdate}
        />
      )}

      {/* Add Contact Modal */}
      <AddContactModal 
        isOpen={showAddContactModal}
        onClose={() => setShowAddContactModal(false)}
        onSave={handleContactCreated}
        selectAfterCreate={true}
      />
    </>
  );
};