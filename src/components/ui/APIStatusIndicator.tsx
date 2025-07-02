import React, { useState, useEffect } from 'react';
import { validateAPIConfig } from '../../config/apiConfig';
import { AI_MODELS, getModelsByProvider } from '../../config/aiModels';
import { CheckCircle, XCircle, AlertCircle, Settings, Wifi, WifiOff, Brain, Sparkles, Zap } from 'lucide-react';

export const APIStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<{ configured: string[]; missing: string[] }>({ configured: [], missing: [] });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setStatus(validateAPIConfig());
  }, []);

  const allConfigured = status.missing.length === 0;
  const someConfigured = status.configured.length > 0;

  const geminiModels = getModelsByProvider('gemini');
  const openaiModels = getModelsByProvider('openai');

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="relative">
        {/* Status Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200
            ${allConfigured 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : someConfigured 
              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              : 'bg-red-100 text-red-700 border border-red-200'
            }
          `}
        >
          {allConfigured ? (
            <Brain className="w-4 h-4" />
          ) : someConfigured ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            AI Models
          </span>
        </button>

        {/* Expanded Status Panel */}
        {isExpanded && (
          <div className="absolute bottom-full left-0 mb-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                AI Models Status
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Model Categories */}
            <div className="space-y-4">
              {/* Gemini & Gemma Models */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Brain className="w-4 h-4 mr-1" />
                  Google AI Models
                </h4>
                <div className="space-y-2 ml-5">
                  {status.configured.includes('Gemini AI') ? (
                    <div className="text-sm text-green-600 mb-2">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      <span className="font-medium">✅ Configured</span>
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 mb-2">
                      <XCircle className="w-3 h-3 inline mr-1" />
                      <span className="font-medium">❌ Not Configured</span>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Available Models:</p>
                    <div className="grid grid-cols-1 gap-1">
                      {/* Gemini Models */}
                      <div className="text-xs text-blue-600">
                        <Brain className="w-3 h-3 inline mr-1" />
                        <span className="font-medium">Gemini:</span> 2.0 Flash, 1.5 Pro, 1.5 Flash
                      </div>
                      {/* Gemma Models */}
                      <div className="text-xs text-purple-600">
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        <span className="font-medium">Gemma:</span> 2B, 9B, 27B (Instruction Tuned)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* OpenAI Models */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  OpenAI Models
                </h4>
                <div className="space-y-2 ml-5">
                  {status.configured.includes('OpenAI GPT') ? (
                    <div className="text-sm text-green-600 mb-2">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      <span className="font-medium">✅ Configured</span>
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 mb-2">
                      <XCircle className="w-3 h-3 inline mr-1" />
                      <span className="font-medium">❌ Not Configured</span>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Available Models:</p>
                    <div className="text-xs text-blue-600">
                      <Zap className="w-3 h-3 inline mr-1" />
                      GPT-4o, GPT-4o Mini
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-3 mt-4">
              <p className="mb-2">
                <strong>🔧 To configure AI models:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Copy .env.example to .env</li>
                <li>Add your API keys</li>
                <li>Restart the application</li>
              </ol>
            </div>

            {/* Model Information */}
            <div className="mt-3 space-y-2">
              <h5 className="text-xs font-medium text-gray-700">📚 Model Information:</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Gemini 2.0 Flash:</strong> Latest, fastest Google AI model</p>
                <p><strong>Gemma 2 (2B-27B):</strong> Open-source models via Gemini API</p>
                <p><strong>GPT-4o:</strong> Advanced reasoning and creative tasks</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex flex-col space-y-2">
              <a
                href="https://ai.google.dev/gemini-api/docs/api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 underline flex items-center"
              >
                <span className="mr-1">🧠</span> Get Gemini API Key
              </a>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 underline flex items-center"
              >
                <span className="mr-1">🤖</span> Get OpenAI API Key
              </a>
              <a
                href="https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 underline flex items-center"
              >
                <span className="mr-1">💎</span> Learn about Gemma Models
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};