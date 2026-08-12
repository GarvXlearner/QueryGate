import { useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import './ResultsPanel.css';

export default function ResultsPanel({ result }) {
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

  if (!result) {
    return (
      <div className="results-panel empty">
        <div className="results-placeholder">Results will appear here</div>
      </div>
    );
  }

  return (
    <div className="results-panel">
      <div className="results-header">
        Results
      </div>
      <div className="results-content">
        {parsedData.aiHeader && (
          <div className="ai-context-panel">
            <strong>AI Context:</strong>
            <pre>{parsedData.aiHeader}</pre>
          </div>
        )}

        {parsedData.type === 'message' && (
          <div className={`message-box ${parsedData.isError ? 'error' : 'success'}`}>
            {parsedData.isError ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <span>{parsedData.content}</span>
          </div>
        )}

        {parsedData.type === 'table' && (
          <div className="table-container">
            <table className="results-table">
              <thead>
                <tr>
                  {parsedData.headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j}>{cell}</td>
                    ))}
                  </tr>
                ))}
                {parsedData.rows.length === 0 && (
                  <tr>
                    <td colSpan={parsedData.headers.length} className="no-data">
                      0 rows returned.
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
