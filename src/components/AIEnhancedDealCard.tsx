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
  Sparkles,
  Heart,
  Camera,
  Wand2,
  Database,
  Globe,
  ExternalLink,
  Plus,
  Search
} from 'lucide-react';

interface AIEnhancedDealCardProps {
  deal: Deal;
  isSelected?: boolean;
  onSelect?: () => void;
  onClick: () => void;
  showAnalyzeButton?: boolean;
  onAnalyze?: (deal: Deal) => Promise<boolean>;
  isAnalyzing?: boolean;
  onToggleFavorite?: (deal: Deal) => Promise<void>;
  onFindNewImage?: (deal: Deal) => Promise<void>;
}

const AIEnhancedDealCard: React.FC<AIEnhancedDealCardProps> = ({ 
  deal, 
  isSelected = false,
  onSelect,
  onClick, 
  showAnalyzeButton = true,
  onAnalyze,
  isAnalyzing = false,
  onToggleFavorite,
  onFindNewImage
}) => {
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [localAnalyzing, setLocalAnalyzing] = useState(false);
  const [isFinding, setIsFinding] = useState(false);
  const [localEnriching, setLocalEnriching] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // New state to track AI enrichment status
  const [lastEnrichment, setLastEnrichment] = useState<any>(
    deal.lastEnrichment || (deal.probability > 75 ? { confidence: deal.probability } : null)
  );

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
      setLastEnrichment({ confidence: Math.max(deal.probability, 75) });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLocalAnalyzing(false);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleFavorite) return;
    
    try {
      await onToggleFavorite(deal);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleFindImageClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onFindNewImage || isFinding) return;
    
    setIsFinding(true);
    try {
      await onFindNewImage(deal);
    } catch (error) {
      console.error('Failed to find new image:', error);
    } finally {
      setIsFinding(false);
    }
  };

  const handleAIEnrichClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (localEnriching) return;
    
    setLocalEnriching(true);
    try {
      // In a real implementation, this would call an AI enrichment service
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastEnrichment({ 
        confidence: Math.min(deal.probability + 10, 95),
        aiProvider: 'OpenAI GPT-4o'
      });
    } catch (error) {
      console.error('Enrichment failed:', error);
    } finally {
      setLocalEnriching(false);
    }
  };

  const analyzing = isAnalyzing || localAnalyzing;

  // Get social profiles (mock data for now)
  const socialProfiles = deal.socialProfiles || {
    linkedin: deal.company ? `https://linkedin.com/company/${deal.company.toLowerCase().replace(/\s+/g, '-')}` : undefined,
    website: deal.company ? `https://${deal.company.toLowerCase().replace(/\s+/g, '')}.com` : undefined
  };

  // Custom fields (mock data for now)
  const customFields = deal.customFields || {
    "Deal Source": deal.tags?.[0] || "Direct",
    "Account Manager": "Alex Rivera"
  };

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
        {onAnalyze && showAnalyzeButton && (
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
        
        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-lg transition-colors ${
              deal.isFavorite 
                ? 'text-red-500 hover:bg-red-50' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={deal.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${deal.isFavorite ? 'fill-current' : ''}`} />
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
              <div className="relative">
                <img 
                  src={deal.companyAvatar || getCompanyAvatar(deal.company)}
                  alt={deal.company}
                  className="w-6 h-6 rounded-full border border-gray-200"
                />
                
                {/* Image search button */}
                {onFindNewImage && (
                  <button
                    onClick={handleFindImageClick}
                    disabled={isFinding}
                    className="absolute -bottom-1 -right-1 p-0.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                    title="Find company image"
                  >
                    {isFinding ? (
                      <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-2 h-2" />
                    )}
                  </button>
                )}
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">{deal.company}</p>
              </div>
            </div>
            
            {/* Contact Person with Avatar */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <img 
                  src={deal.contactAvatar || getPersonAvatar(deal.contact)}
                  alt={deal.contact}
                  className="w-6 h-6 rounded-full border border-gray-200"
                />
                
                {/* Image search button */}
                {onFindNewImage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle contact image search
                    }}
                    className="absolute -bottom-1 -right-1 p-0.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors shadow-sm"
                    title="Find contact image"
                  >
                    <Camera className="w-2 h-2" />
                  </button>
                )}
              </div>
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
              
              {/* Favorite Badge */}
              {deal.isFavorite && (
                <div className="absolute -top-1 -left-1 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg ring-1 ring-white">
                  <Heart className="w-2 h-2" />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {analyzing ? 'Analyzing...' : 'Probability'}
            </span>
          </div>
        </div>

        {/* AI Enhancement Notice - New Feature */}
        {lastEnrichment && (
          <div className="mb-4 p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span className="text-xs font-medium text-purple-800">
                AI Enhanced{lastEnrichment.aiProvider ? ` (${lastEnrichment.aiProvider})` : ''}
              </span>
            </div>
          </div>
        )}

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

        {/* AI Tools Section - NEW ENHANCED FEATURE */}
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center justify-center">
            <Brain className="w-3 h-3 mr-1 text-purple-600" />
            AI Assistant Tools
          </h4>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Lead Score */}
            <button className="p-2 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-blue-300/50">
              <Target className="w-3 h-3 mb-0.5" />
              <span className="text-[10px]">Score</span>
            </button>
            
            {/* Email AI */}
            <button className="p-2 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border-gray-200/50">
              <Mail className="w-3 h-3 mb-0.5" />
              <span className="text-[10px]">Email</span>
            </button>
            
            {/* AI Auto-Enrich */}
            <button
              onClick={handleAIEnrichClick}
              disabled={localEnriching}
              className="p-2 flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 border shadow-sm hover:shadow-md hover:scale-105 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 border-purple-300/50 col-span-2 relative"
            >
              {localEnriching ? (
                <Loader2 className="w-3 h-3 animate-spin mb-0.5" />
              ) : (
                <Wand2 className="w-3 h-3 mb-0.5" />
              )}
              <span className="text-[10px]">AI Auto-Enrich</span>
              {!localEnriching && (
                <Sparkles className="w-2 h-2 absolute top-1 right-1 text-yellow-300" />
              )}
            </button>
          </div>
        </div>

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

        {/* Custom Fields - NEW FEATURE */}
        {customFields && Object.keys(customFields).length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-semibold text-gray-700 flex items-center">
                <Database className="w-3 h-3 mr-1 text-gray-500" />
                Custom Fields
              </h4>
              <button className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(customFields).slice(0, 4).map(([key, value], index) => (
                <div key={index} className="bg-white p-1.5 rounded border border-gray-100">
                  <p className="text-gray-500 text-[10px]">{key}</p>
                  <p className="text-gray-700 font-medium truncate">{value as string}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Profiles - NEW FEATURE */}
        {socialProfiles && Object.keys(socialProfiles).length > 0 && (
          <div className="mb-4">
            <div className="flex justify-center space-x-2">
              {socialProfiles.linkedin && (
                <a 
                  href={socialProfiles.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors"
                >
                  <Globe className="w-3 h-3" />
                </a>
              )}
              {socialProfiles.website && (
                <a 
                  href={socialProfiles.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 bg-purple-500 rounded-lg text-white hover:bg-purple-600 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

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