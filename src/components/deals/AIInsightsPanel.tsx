import React, { useState, useEffect } from 'react';
import { Deal } from '../../types';
import {
  Brain,
  Sparkles,
  Zap,
  Target,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Mail,
  PhoneCall,
  MessageSquare,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Bell,
  DollarSign,
  Building2,
  FileText,
  Award,
  User,
  Briefcase,
  Search
} from 'lucide-react';

interface AIInsightsPanelProps {
  deal: Deal;
}

interface Insight {
  id: string;
  type: 'action' | 'prediction' | 'observation' | 'risk' | 'opportunity' | 'status';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  accuracy?: number; // percentage
  confidence?: number; // percentage
  feedback?: 'positive' | 'negative';
  source?: string; // AI model that generated this
}

const aiModels = ['GPT-4o', 'Gemini Pro', 'Claude 3', 'Hybrid AI'];

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ deal }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'action' | 'opportunity' | 'risk'>('all');
  const [aiProvider, setAiProvider] = useState<string>(aiModels[Math.floor(Math.random() * aiModels.length)]);

  useEffect(() => {
    // Generate insights based on deal data
    const generateInsights = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      const generatedInsights: Insight[] = [];
      
      // Add insights based on deal data
      if (deal.probability > 70) {
        generatedInsights.push({
          id: '1',
          type: 'opportunity',
          title: 'High Closing Probability',
          description: 'Deal shows strong signals of closing. Prioritize resources to finalize the agreement.',
          icon: Zap,
          iconBg: 'bg-yellow-500',
          priority: 'high',
          createdAt: new Date(),
          confidence: 92,
          source: aiProvider
        });
      }
      
      if (deal.stage === 'qualification') {
        generatedInsights.push({
          id: '2',
          type: 'action',
          title: 'Schedule Demo',
          description: 'Based on the deal profile, schedule a demo to move the deal forward.',
          icon: Calendar,
          iconBg: 'bg-blue-500',
          priority: 'high',
          createdAt: new Date(),
          confidence: 85,
          source: aiProvider
        });
      }
      
      if (deal.stage === 'proposal') {
        generatedInsights.push({
          id: '3',
          type: 'action',
          title: 'Follow-up on Proposal',
          description: 'It\'s been several days since the proposal was sent. Follow up to address any questions.',
          icon: Mail,
          iconBg: 'bg-green-500',
          priority: 'medium',
          createdAt: new Date(),
          confidence: 78,
          source: aiProvider
        });
      }
      
      if (deal.stage === 'negotiation') {
        generatedInsights.push({
          id: '4',
          type: 'risk',
          title: 'Price Sensitivity',
          description: 'Based on interaction patterns, there may be concerns about pricing. Consider preparing alternative pricing options.',
          icon: AlertCircle,
          iconBg: 'bg-red-500',
          priority: 'medium',
          createdAt: new Date(),
          confidence: 75,
          source: aiProvider
        });
      }
      
      if (deal.value > 50000) {
        generatedInsights.push({
          id: '5',
          type: 'prediction',
          title: 'High-Value Deal',
          description: `This deal value (${formatCurrency(deal.value)}) is 35% above average for this stage. Consider executive involvement.`,
          icon: DollarSign,
          iconBg: 'bg-purple-500',
          priority: 'high',
          createdAt: new Date(),
          accuracy: 90,
          source: aiProvider
        });
      }
      
      if (deal.company && deal.company.length > 0) {
        generatedInsights.push({
          id: '6',
          type: 'opportunity',
          title: `${deal.company} Industry Insights`,
          description: 'Companies in this sector are increasing technology investments by 22% YoY. Emphasize ROI in your conversations.',
          icon: Building2,
          iconBg: 'bg-indigo-500',
          priority: 'medium',
          createdAt: new Date(),
          confidence: 88,
          source: aiProvider
        });
      }
      
      if (deal.dueDate && deal.dueDate > new Date()) {
        const daysUntilDue = Math.ceil((deal.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue < 14) {
          generatedInsights.push({
            id: '7',
            type: 'risk',
            title: 'Approaching Deadline',
            description: `Only ${daysUntilDue} days left until the expected close date. Increase engagement frequency to ensure timely closing.`,
            icon: Clock,
            iconBg: 'bg-orange-500',
            priority: 'high',
            createdAt: new Date(),
            confidence: 89,
            source: aiProvider
          });
        }
      }
      
      if (deal.priority === 'high') {
        generatedInsights.push({
          id: '8',
          type: 'opportunity',
          title: 'High-Priority Deal',
          description: 'This high-priority deal aligns with quarterly targets. Consider offering implementation support to accelerate closing.',
          icon: Award,
          iconBg: 'bg-green-600',
          priority: 'high',
          createdAt: new Date(),
          confidence: 93,
          source: aiProvider
        });
      }

      if (deal.tags && deal.tags.includes('competitor')) {
        generatedInsights.push({
          id: '9',
          type: 'risk',
          title: 'Competitive Deal',
          description: 'Client is evaluating competitor solutions. Focus on your unique differentiators and ROI advantages.',
          icon: Target,
          iconBg: 'bg-red-600',
          priority: 'high',
          createdAt: new Date(),
          confidence: 82,
          source: aiProvider
        });
      }

      // Add generic insights if we have few
      if (generatedInsights.length < 3) {
        generatedInsights.push({
          id: '10',
          type: 'action',
          title: 'Stakeholder Mapping',
          description: 'Identify and engage all decision-makers involved in the purchase process.',
          icon: User,
          iconBg: 'bg-blue-600',
          priority: 'medium',
          createdAt: new Date(),
          confidence: 75,
          source: aiProvider
        });
      }
      
      setInsights(generatedInsights);
      setIsLoading(false);
    };
    
    generateInsights();
  }, [deal, aiProvider]);
  
  const handleRefreshInsights = async () => {
    setIsRefreshing(true);
    setAiProvider(aiModels[Math.floor(Math.random() * aiModels.length)]);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    setIsRefreshing(false);
  };
  
  const handleFeedback = (id: string, feedback: 'positive' | 'negative') => {
    setInsights(prevInsights => 
      prevInsights.map(insight => 
        insight.id === id ? { ...insight, feedback } : insight
      )
    );
  };
  
  const filteredInsights = activeCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === activeCategory);
  
  const highPriorityInsights = filteredInsights.filter(i => i.priority === 'high');
  const mediumPriorityInsights = filteredInsights.filter(i => i.priority === 'medium');
  const lowPriorityInsights = filteredInsights.filter(i => i.priority === 'low');

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          AI Insights & Recommendations
        </h3>
        <button
          onClick={handleRefreshInsights}
          disabled={isRefreshing}
          className="flex items-center space-x-1 text-sm text-purple-600 font-medium hover:text-purple-800 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
      
      {/* AI Source Information */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200 flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
          <span className="text-sm text-purple-900 font-medium">AI Insights by {aiProvider}</span>
        </div>
        <div className="flex items-center bg-white px-2 py-1 rounded-lg">
          <span className="text-xs font-medium mr-1">Deal Score:</span>
          <span className={`text-xs font-bold ${
            deal.probability >= 80 ? 'text-green-600' :
            deal.probability >= 60 ? 'text-blue-600' :
            deal.probability >= 40 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {deal.probability}%
          </span>
        </div>
      </div>
      
      {/* Deal Intelligence Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-3">Deal Intelligence Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
              <h5 className="text-sm font-medium text-blue-900">Probability Analysis</h5>
            </div>
            <p className="text-xs text-blue-800">
              This deal has a <span className="font-semibold">{deal.probability}%</span> probability of closing, 
              which is {deal.probability > 60 ? 'above' : 'below'} average for deals in {deal.stage} stage.
            </p>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 text-blue-600 mr-2" />
              <h5 className="text-sm font-medium text-blue-900">Timeline Prediction</h5>
            </div>
            <p className="text-xs text-blue-800">
              {deal.stage === 'closed-won' || deal.stage === 'closed-lost' 
                ? 'Deal has reached final stage.' 
                : `Based on similar deals, expected to close in ${Math.floor(Math.random() * 30) + 15} days.`}
            </p>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="flex items-center mb-2">
              <DollarSign className="w-4 h-4 text-blue-600 mr-2" />
              <h5 className="text-sm font-medium text-blue-900">Value Optimization</h5>
            </div>
            <p className="text-xs text-blue-800">
              Deal value of {formatCurrency(deal.value)} could be increased by 15% with service add-ons.
            </p>
          </div>
        </div>
      </div>
      
      {/* Category Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { id: 'all', label: 'All Insights', count: insights.length },
          { id: 'action', label: 'Action Items', count: insights.filter(i => i.type === 'action').length },
          { id: 'opportunity', label: 'Opportunities', count: insights.filter(i => i.type === 'opportunity').length },
          { id: 'risk', label: 'Risks', count: insights.filter(i => i.type === 'risk').length }
        ].map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeCategory === category.id 
                ? 'border-purple-600 text-purple-600' 
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-700 mb-2">No insights available</h4>
          <p className="text-sm text-gray-500 mb-4">
            AI hasn't generated any {activeCategory !== 'all' ? activeCategory : ''} insights for this deal yet.
          </p>
          <button
            onClick={handleRefreshInsights}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Generate Insights
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* High Priority Insights */}
          {highPriorityInsights.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-700 uppercase tracking-wide mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" /> High Priority
              </h4>
              <div className="space-y-3">
                {highPriorityInsights.map((insight) => (
                  <InsightCard 
                    key={insight.id} 
                    insight={insight} 
                    onFeedback={handleFeedback} 
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Medium Priority Insights */}
          {mediumPriorityInsights.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-700 uppercase tracking-wide mb-3 flex items-center">
                <Bell className="w-4 h-4 mr-1" /> Medium Priority
              </h4>
              <div className="space-y-3">
                {mediumPriorityInsights.map((insight) => (
                  <InsightCard 
                    key={insight.id} 
                    insight={insight} 
                    onFeedback={handleFeedback} 
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Low Priority Insights */}
          {lowPriorityInsights.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-700 uppercase tracking-wide mb-3 flex items-center">
                <HelpCircle className="w-4 h-4 mr-1" /> Good to Know
              </h4>
              <div className="space-y-3">
                {lowPriorityInsights.map((insight) => (
                  <InsightCard 
                    key={insight.id} 
                    insight={insight} 
                    onFeedback={handleFeedback} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Action Summary */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recommended Next Steps</h4>
        <div className="space-y-2">
          {insights
            .filter(i => i.type === 'action')
            .map((action, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-700">{action.description}</p>
              </div>
            ))}
          {insights.filter(i => i.type === 'action').length === 0 && (
            <p className="text-sm text-gray-500 italic">No action items currently recommended.</p>
          )}
        </div>
      </div>
      
      {/* AI Research & Competitive Analysis */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-gray-900 flex items-center">
            <Search className="w-4 h-4 mr-2 text-purple-600" />
            AI Research & Competitive Analysis
          </h4>
          <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center">
            <RefreshCw className="w-3 h-3 mr-1" />
            Update
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h5 className="text-sm font-medium text-purple-900 mb-2">Company Analysis</h5>
            <p className="text-xs text-purple-700">
              {deal.company} is a mid-sized company in the technology sector with an estimated annual revenue of $50-100M.
              Recent news indicates they're expanding operations and investing in digital transformation initiatives.
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h5 className="text-sm font-medium text-blue-900 mb-2">Decision Factors</h5>
            <p className="text-xs text-blue-700 mb-2">
              Based on analysis of similar deals, key decision factors for this type of client include:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded border border-blue-100">
                <p className="text-xs font-medium text-blue-800">Implementation Time</p>
                <p className="text-xs text-blue-600">Critical factor</p>
              </div>
              <div className="bg-white p-2 rounded border border-blue-100">
                <p className="text-xs font-medium text-blue-800">ROI Timeline</p>
                <p className="text-xs text-blue-600">High importance</p>
              </div>
              <div className="bg-white p-2 rounded border border-blue-100">
                <p className="text-xs font-medium text-blue-800">Technical Support</p>
                <p className="text-xs text-blue-600">Medium importance</p>
              </div>
              <div className="bg-white p-2 rounded border border-blue-100">
                <p className="text-xs font-medium text-blue-800">Pricing Model</p>
                <p className="text-xs text-blue-600">Medium importance</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h5 className="text-sm font-medium text-green-900 mb-2">Competitive Landscape</h5>
            <p className="text-xs text-green-700 mb-2">
              Main competitors pursuing similar deals in this space:
            </p>
            <div className="space-y-2">
              <div className="flex justify-between bg-white p-2 rounded border border-green-100">
                <p className="text-xs font-medium text-green-800">CompetitorX</p>
                <div className="flex items-center">
                  <span className="text-xs text-red-600">Weakness: Implementation time</span>
                </div>
              </div>
              <div className="flex justify-between bg-white p-2 rounded border border-green-100">
                <p className="text-xs font-medium text-green-800">CompetitorY</p>
                <div className="flex items-center">
                  <span className="text-xs text-red-600">Weakness: Limited support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for individual insights
const InsightCard: React.FC<{
  insight: Insight;
  onFeedback: (id: string, feedback: 'positive' | 'negative') => void;
}> = ({ insight, onFeedback }) => {
  const [expanded, setExpanded] = useState(false);
  
  const typeColors = {
    'action': 'bg-blue-50 border-blue-200',
    'prediction': 'bg-purple-50 border-purple-200',
    'observation': 'bg-green-50 border-green-200',
    'risk': 'bg-red-50 border-red-200',
    'opportunity': 'bg-yellow-50 border-yellow-200',
    'status': 'bg-gray-50 border-gray-200'
  };
  
  const typeLabels = {
    'action': 'Action Item',
    'prediction': 'Prediction',
    'observation': 'Observation',
    'risk': 'Risk Alert',
    'opportunity': 'Opportunity',
    'status': 'Status Update'
  };
  
  return (
    <div className={`rounded-lg border p-4 ${typeColors[insight.type]} transition-all duration-300 ${expanded ? 'shadow-md' : ''}`}>
      <div className="flex items-start">
        <div className={`${insight.iconBg} text-white p-2 rounded-lg mr-3 flex-shrink-0`}>
          <insight.icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold text-gray-900">{insight.title}</h5>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white text-gray-700 border border-gray-200">
              {typeLabels[insight.type]}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mt-1">{insight.description}</p>
          
          {(insight.confidence || insight.accuracy) && (
            <div className="mt-2 flex items-center text-xs text-gray-600">
              {insight.confidence && (
                <div className="flex items-center">
                  <Brain className="w-3 h-3 mr-1" />
                  <span>{insight.confidence}% confidence</span>
                </div>
              )}
              {insight.accuracy && (
                <div className="flex items-center ml-3">
                  <Target className="w-3 h-3 mr-1" />
                  <span>{insight.accuracy}% accuracy</span>
                </div>
              )}
            </div>
          )}
          
          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 flex items-center mb-2">
                <Calendar className="w-3 h-3 mr-1" />
                Generated {insight.createdAt.toLocaleDateString()} by {insight.source}
              </div>
              
              {insight.type === 'action' && (
                <div className="flex space-x-2 mt-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-200 transition-colors">
                    Schedule
                  </button>
                  <button className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md hover:bg-green-200 transition-colors">
                    Mark Complete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-gray-600 hover:text-gray-900"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onFeedback(insight.id, 'positive')}
            className={`p-1 rounded-full ${
              insight.feedback === 'positive' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400 hover:text-gray-600'
            } transition-colors`}
            title="Helpful"
          >
            <ThumbsUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => onFeedback(insight.id, 'negative')}
            className={`p-1 rounded-full ${
              insight.feedback === 'negative' 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-400 hover:text-gray-600'
            } transition-colors`}
            title="Not helpful"
          >
            <ThumbsDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};