import React, { useState } from 'react';
import { AI_MODELS, AIModel, getCostTierColor } from '../../config/aiModels';
import { ChevronDown, Brain, Zap, Sparkles } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  provider?: 'openai' | 'gemini' | 'all';
  className?: string;
  showDescription?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  provider = 'all',
  className = '',
  showDescription = true
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const availableModels = AI_MODELS.filter(model => 
    provider === 'all' || model.provider === provider
  );

  const selectedModelData = AI_MODELS.find(model => model.id === selectedModel);

  const getProviderIcon = (modelProvider: string) => {
    switch (modelProvider) {
      case 'openai': return '🤖';
      case 'gemini': return '🧠';
      default: return '🤖';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gemini': return <Brain className="w-4 h-4" />;
      case 'gemma': return <Sparkles className="w-4 h-4" />;
      case 'openai': return <Zap className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(selectedModelData?.category || 'openai')}
            <span className="text-lg">{selectedModelData?.emoji}</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">
              {selectedModelData?.name || 'Select Model'}
            </p>
            {showDescription && selectedModelData && (
              <p className="text-xs text-gray-500 truncate max-w-48">
                {selectedModelData.description}
              </p>
            )}
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCostTierColor(selectedModelData?.costTier || 'medium')}`}>
            {selectedModelData?.costTier || 'medium'}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            {/* Group by category */}
            {['openai', 'gemini', 'gemma'].map(category => {
              const categoryModels = availableModels.filter(model => model.category === category);
              
              if (categoryModels.length === 0) return null;
              
              return (
                <div key={category} className="border-b border-gray-100 last:border-b-0">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 capitalize flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <span>
                        {category === 'openai' ? 'OpenAI Models' : 
                         category === 'gemini' ? 'Gemini Models' : 
                         'Gemma Models'}
                      </span>
                    </h3>
                  </div>
                  
                  {categoryModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onModelChange(model.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                        model.id === selectedModel ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{model.emoji}</span>
                            {getCategoryIcon(model.category)}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${
                              model.id === selectedModel ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {model.name}
                            </p>
                            <p className={`text-xs ${
                              model.id === selectedModel ? 'text-blue-700' : 'text-gray-500'
                            }`}>
                              {model.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {model.capabilities.slice(0, 2).join(', ')}
                                {model.capabilities.length > 2 && ` +${model.capabilities.length - 2} more`}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-1">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCostTierColor(model.costTier)}`}>
                            {model.costTier}
                          </div>
                          <span className="text-xs text-gray-400">
                            {model.maxTokens}k tokens
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
            
            {/* Help text */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Model Categories:</strong>
              </p>
              <div className="mt-1 space-y-1">
                <p className="text-xs text-gray-500">• <strong>Gemini:</strong> Google's advanced AI models</p>
                <p className="text-xs text-gray-500">• <strong>Gemma:</strong> Open-source models via Gemini API</p>
                <p className="text-xs text-gray-500">• <strong>OpenAI:</strong> GPT models for comparison</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};