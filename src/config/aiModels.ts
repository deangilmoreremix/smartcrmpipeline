export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'gemini';
  description: string;
  category: 'gemini' | 'gemma' | 'openai';
  capabilities: string[];
  maxTokens: number;
  costTier: 'low' | 'medium' | 'high';
  emoji: string;
}

export const AI_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Most capable OpenAI model with advanced reasoning',
    category: 'openai',
    capabilities: ['text-generation', 'analysis', 'reasoning', 'creative-writing'],
    maxTokens: 4096,
    costTier: 'high',
    emoji: '🤖'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Faster, cost-effective version of GPT-4o',
    category: 'openai',
    capabilities: ['text-generation', 'analysis', 'fast-responses'],
    maxTokens: 4096,
    costTier: 'medium',
    emoji: '⚡'
  },
  
  // Gemini Models
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    provider: 'gemini',
    description: 'Latest experimental Gemini 2.0 with enhanced capabilities',
    category: 'gemini',
    capabilities: ['text-generation', 'analysis', 'reasoning', 'multimodal'],
    maxTokens: 8192,
    costTier: 'medium',
    emoji: '🌟'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    description: 'Fast and efficient Gemini model for quick responses',
    category: 'gemini',
    capabilities: ['text-generation', 'analysis', 'fast-responses'],
    maxTokens: 8192,
    costTier: 'low',
    emoji: '⚡'
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    description: 'Advanced Gemini model with enhanced reasoning capabilities',
    category: 'gemini',
    capabilities: ['text-generation', 'analysis', 'reasoning', 'complex-tasks'],
    maxTokens: 8192,
    costTier: 'high',
    emoji: '🧠'
  },
  
  // Gemma Models (via Gemini API)
  {
    id: 'gemma-2-2b-it',
    name: 'Gemma 2 2B (Instruction Tuned)',
    provider: 'gemini',
    description: 'Lightweight Gemma model optimized for instruction following',
    category: 'gemma',
    capabilities: ['text-generation', 'instruction-following', 'fast-responses'],
    maxTokens: 8192,
    costTier: 'low',
    emoji: '💎'
  },
  {
    id: 'gemma-2-9b-it',
    name: 'Gemma 2 9B (Instruction Tuned)',
    provider: 'gemini',
    description: 'Mid-size Gemma model with balanced performance and efficiency',
    category: 'gemma',
    capabilities: ['text-generation', 'analysis', 'instruction-following'],
    maxTokens: 8192,
    costTier: 'medium',
    emoji: '💎'
  },
  {
    id: 'gemma-2-27b-it',
    name: 'Gemma 2 27B (Instruction Tuned)',
    provider: 'gemini',
    description: 'Large Gemma model with superior reasoning and analysis',
    category: 'gemma',
    capabilities: ['text-generation', 'analysis', 'reasoning', 'complex-tasks'],
    maxTokens: 8192,
    costTier: 'high',
    emoji: '💎'
  }
];

export const getModelById = (id: string): AIModel | undefined => {
  return AI_MODELS.find(model => model.id === id);
};

export const getModelsByCategory = (category: AIModel['category']): AIModel[] => {
  return AI_MODELS.filter(model => model.category === category);
};

export const getModelsByProvider = (provider: AIModel['provider']): AIModel[] => {
  return AI_MODELS.filter(model => model.provider === provider);
};

export const getDefaultModel = (provider: AIModel['provider']): AIModel => {
  if (provider === 'openai') {
    return AI_MODELS.find(model => model.id === 'gpt-4o') || AI_MODELS[0];
  }
  // Default to Gemini 2.0 Flash for Gemini provider
  return AI_MODELS.find(model => model.id === 'gemini-2.0-flash-exp') || AI_MODELS[1];
};

export const getCostTierColor = (tier: AIModel['costTier']): string => {
  switch (tier) {
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};