import React, { useState, useEffect } from 'react';
import { validateAPIConfig } from '../../config/apiConfig';
import { CheckCircle, XCircle, AlertCircle, Settings, Wifi, WifiOff } from 'lucide-react';

export const APIStatusIndicator: React.FC = () => {
  const [status, setStatus] = useState<{ configured: string[]; missing: string[] }>({ configured: [], missing: [] });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setStatus(validateAPIConfig());
  }, []);

  const allConfigured = status.missing.length === 0;
  const someConfigured = status.configured.length > 0;

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
            <Wifi className="w-4 h-4" />
          ) : someConfigured ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            API Status
          </span>
        </button>

        {/* Expanded Status Panel */}
        {isExpanded && (
          <div className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                API Configuration Status
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Configured APIs */}
            {status.configured.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Configured ({status.configured.length})
                </h4>
                <div className="space-y-1">
                  {status.configured.map(api => (
                    <div key={api} className="flex items-center text-sm text-green-600">
                      <CheckCircle className="w-3 h-3 mr-2" />
                      {api}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing APIs */}
            {status.missing.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  Missing Configuration ({status.missing.length})
                </h4>
                <div className="space-y-1">
                  {status.missing.map(api => (
                    <div key={api} className="flex items-center text-sm text-red-600">
                      <XCircle className="w-3 h-3 mr-2" />
                      {api}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
              <p className="mb-1">
                <strong>To configure APIs:</strong>
              </p>
              <p>1. Copy .env.example to .env</p>
              <p>2. Add your API keys</p>
              <p>3. Restart the application</p>
            </div>

            {/* Quick Actions */}
            <div className="mt-3 flex space-x-2">
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Get OpenAI API Key
              </a>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Setup Supabase
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};