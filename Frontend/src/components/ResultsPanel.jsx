import { useState, useMemo, useEffect } from 'react';
import { AlertCircle, CheckCircle, Grid, MessageSquare } from 'lucide-react';
import './ResultsPanel.css';

export default function ResultsPanel({ result }) {
  const [activeTab, setActiveTab] = useState('results'); // 'results' or 'messages'

  const parsedData = useMemo(() => {
    if (!result) return null;
    
    // AI Execute often returns "Generated SQl... \n\nResult:\n..."
    let rawText = result.data;
    let aiHeader = null;
    
    if (rawText.includes('Generated SQl') && rawText.includes('Result:')) {
      const parts = rawText.split('Result:');
      aiHeader = parts[0].trim();
      rawText = parts[1].trim();
    }

    if (result.type === 'error' || rawText.includes('denied') || rawText.includes('failed') || rawText.includes('not found')) {
      return { type: 'message', isError: true, content: rawText, aiHeader };
    }

    if (rawText.includes('successfully')) {
      return { type: 'message', isError: false, content: rawText, aiHeader };
    }

    // Attempt to parse TSV
    try {
      const lines = rawText.split('\n').filter(l => l.trim() !== '');
      if (lines.length > 0 && lines[0].includes('\t')) {
        const headers = lines[0].split('\t');
        const rows = lines.slice(1).map(line => line.split('\t'));
        return { type: 'table', headers, rows, aiHeader };
      }
    } catch (e) {
      // fallback
    }

    return { type: 'message', isError: false, content: rawText, aiHeader };

  }, [result]);

  // Auto-switch to messages if it's an error or just a message
  useEffect(() => {
    if (parsedData) {
      if (parsedData.type === 'message') {
        setActiveTab('messages');
      } else if (parsedData.type === 'table') {
        setActiveTab('results');
      }
    }
  }, [parsedData]);

  if (!result) {
    return (
      <div className="results-panel empty">
        <div className="results-placeholder">Results and Messages will appear here</div>
      </div>
    );
  }

  return (
    <div className="results-panel">
      <div className="results-tabs">
        <button 
          className={`results-tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
          disabled={parsedData.type === 'message' && parsedData.isError}
        >
          <Grid size={14} />
          Results
        </button>
        <button 
          className={`results-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <MessageSquare size={14} />
          Messages
        </button>
      </div>

      <div className="results-content">
        {parsedData.aiHeader && (
          <div className="ai-context-panel">
            <strong>AI Context:</strong>
            <pre>{parsedData.aiHeader}</pre>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="messages-container">
            <div className={`message-text ${parsedData.isError ? 'error' : 'success'}`}>
              {parsedData.isError ? <AlertCircle size={14} className="msg-icon"/> : <CheckCircle size={14} className="msg-icon" />}
              {parsedData.type === 'table' ? `Query executed successfully. (${parsedData.rows.length} rows affected)` : parsedData.content}
            </div>
          </div>
        )}

        {activeTab === 'results' && parsedData.type === 'table' && (
          <div className="table-container">
            <table className="ssms-grid">
              <thead>
                <tr>
                  <th className="row-number-header"></th>
                  {parsedData.headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.rows.map((row, i) => (
                  <tr key={i}>
                    <td className="row-number">{i + 1}</td>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
                {parsedData.rows.length === 0 && (
                  <tr>
                    <td colSpan={parsedData.headers.length + 1} className="no-data">
                      No rows returned.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
