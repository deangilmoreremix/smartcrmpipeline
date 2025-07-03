import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AIEnhancedDealCard from './AIEnhancedDealCard';
import DealAnalytics from './DealAnalytics';
import PipelineStats from './PipelineStats';
import { AchievementPanel } from './gamification/AchievementPanel';
import { ContactsModal } from './contacts/ContactsModal';
import { FloatingActionPanel } from './ui/FloatingActionPanel';
import { AdvancedFilter } from './ui/AdvancedFilter';
import AddDealModal from './deals/AddDealModal';
import DealDetail from './DealDetail';
import AddContactModal from './deals/AddContactModal';
import { mockDeals, mockColumns, columnOrder, calculateStageValues } from '../data/mockDeals';
import { Deal, PipelineColumn } from '../types';
import { Search, Filter, Plus, BarChart3, Users, Grid3X3, List, Settings, Zap, Eye, EyeOff } from 'lucide-react';

const Pipeline: React.FC = () => {
  const [deals, setDeals] = useState<Record<string, Deal>>(mockDeals);
  const [columns, setColumns] = useState<Record<string, PipelineColumn>>(mockColumns);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [analyzingDealId, setAnalyzingDealId] = useState<string | null>(null);

  // Filter deals based on search and filters
  const filteredDeals = useMemo(() => {
    let result = { ...deals };

    // Apply search
    if (searchTerm.trim()) {
      result = Object.fromEntries(
        Object.entries(result).filter(([_, deal]) =>
          deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          deal.contact.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply advanced filters
    activeFilters.forEach(filter => {
      result = Object.fromEntries(
        Object.entries(result).filter(([_, deal]) => {
          switch (filter.field) {
            case 'value':
              switch (filter.operator) {
                case 'gt': return deal.value > filter.value;
                case 'lt': return deal.value < filter.value;
                case 'eq': return deal.value === filter.value;
                case 'gte': return deal.value >= filter.value;
                case 'lte': return deal.value <= filter.value;
                default: return true;
              }
            case 'probability':
              switch (filter.operator) {
                case 'gt': return deal.probability > filter.value;
                case 'lt': return deal.probability < filter.value;
                case 'eq': return deal.probability === filter.value;
                case 'gte': return deal.probability >= filter.value;
                case 'lte': return deal.probability <= filter.value;
                default: return true;
              }
            case 'stage':
              return filter.operator === 'equals' ? deal.stage === filter.value : deal.stage !== filter.value;
            case 'priority':
              return filter.operator === 'equals' ? deal.priority === filter.value : deal.priority !== filter.value;
            default:
              return true;
          }
        })
      );
    });

    return result;
  }, [deals, searchTerm, activeFilters]);

  // Update columns with filtered deals
  const filteredColumns = useMemo(() => {
    const newColumns = { ...columns };
    
    Object.keys(newColumns).forEach(columnId => {
      newColumns[columnId] = {
        ...newColumns[columnId],
        dealIds: newColumns[columnId].dealIds.filter(dealId => filteredDeals[dealId])
      };
    });
    
    return newColumns;
  }, [columns, filteredDeals]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    if (sourceColumn === destColumn) {
      const newDealIds = Array.from(sourceColumn.dealIds);
      newDealIds.splice(source.index, 1);
      newDealIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...sourceColumn,
        dealIds: newDealIds,
      };

      setColumns({
        ...columns,
        [newColumn.id]: newColumn,
      });
    } else {
      const sourceDealIds = Array.from(sourceColumn.dealIds);
      sourceDealIds.splice(source.index, 1);
      const newSourceColumn = {
        ...sourceColumn,
        dealIds: sourceDealIds,
      };

      const destDealIds = Array.from(destColumn.dealIds);
      destDealIds.splice(destination.index, 0, draggableId);
      const newDestColumn = {
        ...destColumn,
        dealIds: destDealIds,
      };

      // Update deal stage
      const updatedDeal = {
        ...deals[draggableId],
        stage: destination.droppableId as Deal['stage'],
        updatedAt: new Date(),
      };

      setDeals({
        ...deals,
        [draggableId]: updatedDeal,
      });

      setColumns({
        ...columns,
        [newSourceColumn.id]: newSourceColumn,
        [newDestColumn.id]: newDestColumn,
      });
    }
  };

  const handleDealClick = (dealId: string) => {
    setSelectedDealId(dealId);
  };

  const handleApplyFilters = (filters: any[]) => {
    setActiveFilters(filters);
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
  };

  const handleAddDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newDealId = `deal-${Date.now()}`;
    const newDeal: Deal = {
      ...dealData,
      id: newDealId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add to deals
    setDeals(prev => ({
      ...prev,
      [newDealId]: newDeal
    }));

    // Add to appropriate column
    setColumns(prev => ({
      ...prev,
      [newDeal.stage]: {
        ...prev[newDeal.stage],
        dealIds: [...prev[newDeal.stage].dealIds, newDealId]
      }
    }));
  };

  const handleAnalyzeDeal = async (deal: Deal) => {
    setAnalyzingDealId(deal.id);
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update deal with enhanced probability
      const newProbability = Math.min(deal.probability + 15, 95);
      const updatedDeal = {
        ...deal,
        probability: newProbability,
        lastEnrichment: {
          confidence: newProbability,
          aiProvider: 'Hybrid AI (GPT-4o + Gemini)',
          timestamp: new Date()
        }
      };
      
      setDeals(prev => ({
        ...prev,
        [deal.id]: updatedDeal
      }));
      
      return true;
    } catch (error) {
      console.error('AI analysis failed:', error);
      return false;
    } finally {
      setAnalyzingDealId(null);
    }
  };

  const handleToggleFavorite = async (deal: Deal) => {
    const updatedDeal = {
      ...deal,
      isFavorite: !deal.isFavorite
    };
    
    setDeals(prev => ({
      ...prev,
      [deal.id]: updatedDeal
    }));
  };

  const handleFindNewImage = async (deal: Deal) => {
    try {
      // Simulate finding a new image
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, just use a different seed for the avatar
      const newSeed = Date.now().toString();
      const newAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${newSeed}&backgroundColor=3b82f6,8b5cf6,f59e0b,10b981,ef4444&textColor=ffffff`;
      
      const updatedDeal = {
        ...deal,
        companyAvatar: newAvatar
      };
      
      setDeals(prev => ({
        ...prev,
        [deal.id]: updatedDeal
      }));
    } catch (error) {
      console.error('Failed to find new image:', error);
    }
  };

  const stageValues = calculateStageValues(filteredDeals, filteredColumns);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Pipeline</h1>
            
            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 text-sm font-medium transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 text-sm font-medium border-l border-gray-300 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Advanced Filters */}
            <AdvancedFilter
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />

            {/* Analytics Toggle */}
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                showAnalytics 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {showAnalytics ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>Analytics</span>
            </button>

            {/* Achievements Toggle */}
            <button
              onClick={() => setShowAchievements(!showAchievements)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                showAchievements 
                  ? 'bg-purple-600 text-white border-purple-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Team</span>
            </button>

            {/* Add Deal Button */}
            <button
              onClick={() => setShowAddDealModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Deal</span>
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="mb-6 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {filter.field} {filter.operator} {filter.value}
                <button
                  onClick={() => {
                    const newFilters = activeFilters.filter((_, i) => i !== index);
                    setActiveFilters(newFilters);
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Pipeline Stats */}
        <PipelineStats
          totalValue={Object.values(filteredDeals).reduce((sum, deal) => sum + deal.value, 0)}
          totalDeals={Object.keys(filteredDeals).length}
        />

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <div className="mb-8">
            <DealAnalytics deals={filteredDeals} />
          </div>
        )}

        {/* Team Achievements */}
        {showAchievements && (
          <div className="mb-8">
            <AchievementPanel />
          </div>
        )}

        {/* Pipeline View */}
        {viewMode === 'kanban' ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex space-x-6 overflow-x-auto pb-6">
              {columnOrder.map((columnId) => {
                const column = filteredColumns[columnId];
                const columnDeals = column.dealIds.map((dealId) => filteredDeals[dealId]);
                const columnValue = columnDeals.reduce((sum, deal) => sum + deal.value, 0);

                return (
                  <div key={column.id} className="flex-shrink-0 w-80">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">{column.title}</h3>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-gray-900">
                            {columnDeals.length}
                          </span>
                          <p className="text-sm text-gray-500">
                            ${(columnValue / 1000).toFixed(0)}k
                          </p>
                        </div>
                      </div>
                      
                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`space-y-4 min-h-[200px] transition-colors ${
                              snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
                            }`}
                          >
                            {column.dealIds.map((dealId, index) => {
                              const deal = filteredDeals[dealId];
                              if (!deal) return null;

                              return (
                                <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`transition-all duration-200 ${
                                        snapshot.isDragging ? 'rotate-2 scale-105' : ''
                                      }`}
                                    >
                                      <AIEnhancedDealCard
                                        deal={deal}
                                        onClick={() => handleDealClick(deal.id)}
                                        showAnalyzeButton={true}
                                        onAnalyze={handleAnalyzeDeal}
                                        isAnalyzing={analyzingDealId === deal.id}
                                        onToggleFavorite={handleToggleFavorite}
                                        onFindNewImage={handleFindNewImage}
                                      />
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        ) : (
          // List View
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Probability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.values(filteredDeals).map((deal) => (
                    <tr
                      key={deal.id}
                      onClick={() => handleDealClick(deal.id)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={deal.contactAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${deal.contact}`}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                            <div className="text-sm text-gray-500">{deal.contact}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${deal.value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                          deal.stage === 'qualification' ? 'bg-blue-100 text-blue-800' :
                          deal.stage === 'proposal' ? 'bg-indigo-100 text-indigo-800' :
                          deal.stage === 'negotiation' ? 'bg-purple-100 text-purple-800' :
                          deal.stage === 'closed-won' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {deal.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.probability}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deal.dueDate?.toLocaleDateString() || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Floating Action Panel */}
        <FloatingActionPanel
          onNewDeal={() => setShowAddDealModal(true)}
          onAIAnalysis={() => setShowAnalytics(!showAnalytics)}
          onViewContacts={() => setShowContactsModal(true)}
          onViewAnalytics={() => setShowAnalytics(!showAnalytics)}
          onSettings={() => console.log('Settings')}
          onAddContact={() => setShowAddContactModal(true)}
        />

        {/* Modals */}
        <ContactsModal
          isOpen={showContactsModal}
          onClose={() => setShowContactsModal(false)}
        />

        <AddDealModal
          isOpen={showAddDealModal}
          onClose={() => setShowAddDealModal(false)}
          onSave={handleAddDeal}
        />

        <AddContactModal
          isOpen={showAddContactModal}
          onClose={() => setShowAddContactModal(false)}
          onSave={() => {}}
          selectAfterCreate={true}
        />

        {selectedDealId && (
          <DealDetail
            dealId={selectedDealId}
            onClose={() => setSelectedDealId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Pipeline;