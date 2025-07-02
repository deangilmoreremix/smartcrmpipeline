import React, { useState, useRef } from 'react';
import { Deal } from '../types';
import { CustomizableAIToolbar } from './ui/CustomizableAIToolbar';
import { 
  Calendar, 
  DollarSign, 
  User, 
  Building2, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  TrendingUp,
  Edit,
  MoreHorizontal,
  Mail,
  Phone,
  MessageSquare,
  Star,
  Target,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Loader2,
  Sparkles
} from 'lucide-react';

interface AIEnhancedDealCardProps {
  deal: Deal;
  isSelected?: boolean;
  onSelect?: () => void;
  onClick: () => void;
  showAnalyzeButton?: boolean;
  onAnalyze?: (deal: Deal) => Promise<boolean>;
  isAnalyzing?: boolean;
}

const AIEnhancedDealCard: React.FC<AIEnhancedDealCardProps> = ({ 
  deal, 
  isSelected = false,
  onSelect,
  onClick, 
  showAnalyzeButton = true,
  onAnalyze,
  isAnalyzing = false
}) => {
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [localAnalyzing, setLocalAnalyzing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const isOverdue = deal.dueDate && new Date() > deal.dueDate;
  const isDueSoon = deal.dueDate && !isOverdue && 
    (deal.dueDate.getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Normal Priority';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'qualification': return 'bg-blue-500';
      case 'proposal': return 'bg-indigo-500';
      case 'negotiation': return 'bg-purple-500';
      case 'closed-won': return 'bg-green-500';
      case 'closed-lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (probability: number) => {
    if (probability >= 80) return 'bg-green-500';
    if (probability >= 60) return 'bg-blue-500';
    if (probability >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Generate avatar URLs based on company and contact names
  const getCompanyAvatar = (companyName: string) => {
    const seed = companyName.toLowerCase().replace(/\s+/g, '');
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=3b82f6,8b5cf6,f59e0b,10b981,ef4444&textColor=ffffff`;
  };

  const getPersonAvatar = (personName: string) => {
    const seed = personName.toLowerCase().replace(/\s+/g, '');
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=3b82f6,8b5cf6,f59e0b,10b981,ef4444`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    onClick();
  };

  const handleAnalyzeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAnalyze || isAnalyzing || localAnalyzing) return;
    
    setLocalAnalyzing(true);
    try {
      await onAnalyze(deal);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLocalAnalyzing(false);
    }
  };

  const analyzing = isAnalyzing || localAnalyzing;

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group relative border border-gray-200 hover:border-gray-300 overflow-hidden"
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-4 left-4 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 bg-white border-gray-300"
          />
        </div>
      )}

      {/* Header Actions */}
      <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        {/* AI Analysis Button - Prominently Featured */}
        {onAnalyze && (
          <button 
            onClick={handleAnalyzeClick}
            disabled={analyzing}
            className={`p-2 rounded-lg transition-all duration-200 relative ${
              deal.probability > 70
                ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg'
            }`}
            title={deal.probability > 70 ? 'Re-analyze with AI' : 'Analyze with AI'}
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            {deal.probability < 70 && !analyzing && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            )}
          </button>
        )}
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Handle edit action
          }}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit className="w-3 h-3" />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Handle more actions
          }}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>

      <div className="p-6">
        {/* Company and Person Avatars with Deal Info */}
        <div className="flex items-start justify-between mb-4 mt-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900 font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors truncate">
              {deal.title}
            </h3>
            
            {/* Company Info with Avatar */}
            <div className="flex items-center space-x-2 mb-2">
              <img 
                src={getCompanyAvatar(deal.company)}
                alt={deal.company}
                className="w-6 h-6 rounded-full border border-gray-200"
              />
              <div>
                <p className="text-gray-600 text-sm font-medium">{deal.company}</p>
              </div>
            </div>
            
            {/* Contact Person with Avatar */}
            <div className="flex items-center space-x-2">
              <img 
                src={getPersonAvatar(deal.contact)}
                alt={deal.contact}
                className="w-6 h-6 rounded-full border border-gray-200"
              />
              <div>
                <p className="text-gray-500 text-xs">{deal.contact}</p>
              </div>
            </div>
          </div>
          
          {/* Deal Score Display */}
          <div className="flex flex-col items-center space-y-2">
            <div className={`h-12 w-12 rounded-full ${getScoreColor(deal.probability)} text-white flex items-center justify-center font-bold text-lg shadow-lg ring-2 ring-white relative`}>
              {deal.probability}%
              
              {/* Analysis Loading Indicator */}
              {analyzing && (
                <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {/* AI Enhanced Indicator */}
              {deal.probability > 70 && (
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300" />
              )}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {analyzing ? 'Analyzing...' : 'Probability'}
            </span>
          </div>
        </div>

        {/* Priority Level */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(deal.priority)} animate-pulse`} />
          <span className="text-xs text-gray-600 font-medium">
            {getPriorityLabel(deal.priority)}
          </span>
        </div>

        {/* Deal Value and Stage */}
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2 text-center">Value & Stage</p>
          <div className="flex justify-center items-center space-x-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{formatCurrency(deal.value)}</p>
              <p className="text-xs text-gray-500">Deal Value</p>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <span className={`${getStageColor(deal.stage)} text-white text-xs px-2 py-1 rounded-md font-medium`}>
                {deal.stage === 'closed-won' ? 'Won' :
                 deal.stage === 'closed-lost' ? 'Lost' :
                 deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center space-x-1 mb-4">
          {Array.from({ length: 5 }, (_, i) => {
            const isActive = i < Math.floor(deal.probability / 20);
            return (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? `${getScoreColor(deal.probability)} shadow-lg` 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            );
          })}
        </div>

        {/* Due Date Alert */}
        {deal.dueDate && (
          <div className={`mb-4 p-2 rounded-lg text-center ${
            isOverdue ? 'bg-red-50 text-red-700' :
            isDueSoon ? 'bg-yellow-50 text-yellow-700' :
            'bg-green-50 text-green-700'
          }`}>
            <div className="flex items-center justify-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">
                {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'On Track'}
              </span>
            </div>
            <p className="text-xs mt-1">{deal.dueDate.toLocaleDateString()}</p>
          </div>
        )}

        {/* AI Insights Section */}
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-purple-500" />
              AI Insights
            </h4>
            <div className="flex space-x-1">
              <button className="p-1 bg-white hover:bg-gray-100 rounded text-gray-600 transition-colors">
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button className="p-1 bg-white hover:bg-gray-100 rounded text-gray-600 transition-colors">
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-700">
            {analyzing ? 'AI analysis in progress...' :
             deal.probability >= 80 ? 'High conversion probability. Top priority for immediate follow-up.' :
             deal.probability >= 60 ? 'Good potential. Schedule follow-up meeting within 48 hours.' :
             deal.probability >= 40 ? 'Moderate potential. Continue nurturing with valuable content.' :
             'Lower probability. Focus on qualification and value demonstration.'}
          </p>
          <div className="mt-2 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span className="text-xs text-purple-700 font-medium">AI-powered analysis</span>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="mb-4">
          <CustomizableAIToolbar
            entityType="deal"
            entityId={deal.id}
            entityData={deal}
            location="dealCards"
            layout="grid"
            size="sm"
            showCustomizeButton={true}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Handle email action
            }}
            className="flex items-center justify-center py-1.5 px-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full hover:from-blue-100 hover:to-blue-200 text-xs font-medium transition-all duration-200 border border-blue-200/50 shadow-sm"
          >
            <Mail size={11} className="mr-1" /> Email
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Handle call action
            }}
            className="flex items-center justify-center py-1.5 px-2 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-full hover:from-green-100 hover:to-green-200 text-xs font-medium transition-all duration-200 border border-green-200/50 shadow-sm"
          >
            <Phone size={11} className="mr-1" /> Call
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex items-center justify-center py-1.5 px-2 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-full hover:from-purple-100 hover:to-purple-200 text-xs font-medium transition-all duration-200 border border-purple-200/50 shadow-sm"
          >
            <Target size={11} className="mr-1" /> View
          </button>
        </div>

        {/* Tags Display */}
        {deal.tags && deal.tags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1 justify-center">
              {deal.tags.slice(0, 2).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full border border-blue-200"
                >
                  {tag}
                </span>
              ))}
              {deal.tags.length > 2 && (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full border border-gray-200">
                  +{deal.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Click indicator */}
        <div className="mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-xs text-blue-500 font-medium">
            {analyzing ? 'AI analysis in progress...' : 
             deal.probability <= 70 ? 'Click AI button to analyze • Click card for details' :
             'Click to view details'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancedDealCard;