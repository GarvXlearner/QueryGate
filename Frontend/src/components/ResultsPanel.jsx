import { useState, useMemo, useEffect } from 'react';
import { AlertCircle, CheckCircle, Grid, MessageSquare, Download } from 'lucide-react';
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
      return { type: 'message', isError: true, content: rawText, aiHeader, timeMs: result.timeMs };
    }

    if (rawText.includes('successfully')) {
      return { type: 'message', isError: false, content: rawText, aiHeader, timeMs: result.timeMs };
    }

    // Attempt to parse TSV
    try {
      const lines = rawText.split('\n').filter(l => l.trim() !== '');
      if (lines.length > 0 && lines[0].includes('\t')) {
        const headers = lines[0].split('\t');
        const rows = lines.slice(1).map(line => line.split('\t'));
        return { type: 'table', headers, rows, aiHeader, timeMs: result.timeMs };
      }
    } catch (e) {
      // fallback
    }

    return { type: 'message', isError: false, content: rawText, aiHeader, timeMs: result.timeMs };

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

  const exportCSV = () => {
    if (!parsedData || parsedData.type !== 'table') return;
    const csvContent = [
      parsedData.headers.join(','),
      ...parsedData.rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'query_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (!parsedData || parsedData.type !== 'table') return;
    const jsonData = parsedData.rows.map(row => {
      const obj = {};
      parsedData.headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'query_export.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!result) {
    return (
      <div className="results-panel empty">
        <div className="results-placeholder">Results and Messages will appear here</div>
      </div>
    );
  }

  return (
    <div className="results-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="results-tabs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex' }}>
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
        
        {activeTab === 'results' && parsedData.type === 'table' && (
          <div className="export-actions" style={{ display: 'flex', gap: '8px', paddingRight: '12px' }}>
            <button onClick={exportCSV} className="export-btn" title="Export to CSV">
              <Download size={13} /> CSV
            </button>
            <button onClick={exportJSON} className="export-btn" title="Export to JSON">
              <Download size={13} /> JSON
            </button>
          </div>
        )}
      </div>

      <div className="results-content" style={{ flex: 1, overflow: 'auto' }}>
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
      
      {/* Metrics Status Bar */}
      <div className="results-status-bar" style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 12px', fontSize: '11px', backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
        {parsedData.timeMs !== undefined && (
          <span style={{ marginRight: '16px' }}>Execution time: {parsedData.timeMs}ms</span>
        )}
        {parsedData.type === 'table' && (
          <span>{parsedData.rows.length} rows</span>
        )}
      </div>
    </div>
  );
}
