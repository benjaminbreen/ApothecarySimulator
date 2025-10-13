// LLMTransparencyView.jsx
// Console-style view of LLM inputs/outputs for transparency

import React, { useState } from 'react';

export function LLMTransparencyView({ isOpen, onClose, llmCalls = [] }) {
  const [selectedCall, setSelectedCall] = useState(null);

  if (!isOpen) return null;

  // Show last 5 calls
  const recentCalls = llmCalls.slice(-5).reverse();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl mx-4 h-[85vh] flex flex-col overflow-hidden border border-slate-700">
        {/* Header - Terminal Style */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="font-mono text-sm text-emerald-400">LLM Transparency View</span>
            <span className="text-xs text-slate-500">Last {recentCalls.length} calls</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Call List */}
          <div className="w-64 bg-slate-850 border-r border-slate-700 overflow-y-auto">
            <div className="p-3 space-y-2">
              {recentCalls.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-8">
                  No LLM calls yet
                </div>
              ) : (
                recentCalls.map((call, index) => (
                  <button
                    key={call.id}
                    onClick={() => setSelectedCall(call)}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg transition-colors
                      ${selectedCall?.id === call.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }
                    `}
                  >
                    <div className="font-mono text-xs font-semibold">
                      {call.agent}
                    </div>
                    <div className="font-mono text-xs opacity-70 mt-1">
                      Turn {call.turnNumber}
                    </div>
                    <div className="font-mono text-xs opacity-50 mt-1">
                      {new Date(call.timestamp).toLocaleTimeString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Content - Call Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedCall ? (
              <div className="p-6 space-y-6 font-mono text-sm">
                {/* Metadata */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-emerald-400 font-semibold mb-2">METADATA</div>
                  <div className="space-y-1 text-slate-300">
                    <div><span className="text-slate-500">Agent:</span> {selectedCall.agent}</div>
                    <div><span className="text-slate-500">Turn:</span> {selectedCall.turnNumber}</div>
                    <div><span className="text-slate-500">Timestamp:</span> {new Date(selectedCall.timestamp).toLocaleString()}</div>
                    <div><span className="text-slate-500">Temperature:</span> {selectedCall.temperature}</div>
                    <div><span className="text-slate-500">Max Tokens:</span> {selectedCall.maxTokens}</div>
                    <div><span className="text-slate-500">Est. Prompt Tokens:</span> {selectedCall.estimatedTokens?.total || 'N/A'}</div>
                  </div>
                </div>

                {/* Input - System Prompt */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-blue-400 font-semibold">INPUT → System Prompt</div>
                    <div className="text-xs text-slate-500">
                      {selectedCall.estimatedTokens?.system || 'N/A'} tokens
                    </div>
                  </div>
                  <pre className="text-slate-300 text-xs whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto p-3 bg-slate-900 rounded border border-slate-700">
                    {selectedCall.input.system}
                  </pre>
                </div>

                {/* Input - User Prompt */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-blue-400 font-semibold">INPUT → User Prompt</div>
                    <div className="text-xs text-slate-500">
                      {selectedCall.estimatedTokens?.user || 'N/A'} tokens
                    </div>
                  </div>
                  <pre className="text-slate-300 text-xs whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto p-3 bg-slate-900 rounded border border-slate-700">
                    {selectedCall.input.user}
                  </pre>
                </div>

                {/* Output */}
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="text-emerald-400 font-semibold mb-2">OUTPUT ← LLM Response</div>
                  <pre className="text-slate-300 text-xs whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto p-3 bg-slate-900 rounded border border-slate-700">
                    {selectedCall.output}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-mono text-sm">Select a call to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            Showing inputs and outputs for transparency and debugging
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-mono rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
