import React from 'react';
import LoadingIndicator from './LoadingIndicator';
import ReactMarkdown from 'react-markdown';

function CritiqueAgent({ output, isLoading }) {
  return (
    <div className="critique-agent-container">
      <h2>Counter-Narrative</h2>
      <div className={`output-box ${isLoading ? 'loading' : ''}`}>
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <ReactMarkdown>{output}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default CritiqueAgent;