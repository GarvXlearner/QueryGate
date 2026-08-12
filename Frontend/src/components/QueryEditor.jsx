import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Sparkles } from 'lucide-react';
import './QueryEditor.css';

export default function QueryEditor({ activeDb, onResult }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/query/execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dbId: activeDb.id, query })
      });
      const data = await res.text();
      onResult({ type: res.ok ? 'success' : 'error', data });
    } catch (err) {
      onResult({ type: 'error', data: 'Failed to execute query.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiExecute = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/query/ai-execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dbId: activeDb.id, question: query })
      });
      const data = await res.text();
      onResult({ type: res.ok ? 'success' : 'error', data });
    } catch (err) {
      onResult({ type: 'error', data: 'Failed to execute AI query.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="query-editor">
      <div className="editor-toolbar">
        <div className="active-db-badge">
          Database: <strong>{activeDb?.dbName}</strong>
        </div>
        <div className="editor-actions">
          <button 
            className="action-btn primary" 
            onClick={handleExecute}
            disabled={isLoading}
          >
            <Play size={14} />
            <span>Execute</span>
          </button>
          <button 
            className="action-btn ai-btn" 
            onClick={handleAiExecute}
            disabled={isLoading}
          >
            <Sparkles size={14} />
            <span>AI Execute</span>
          </button>
        </div>
      </div>
      
      <div className="editor-area">
        <textarea
          className="sql-textarea"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your SQL query or Natural Language question here..."
          spellCheck="false"
        />
      </div>
    </div>
  );
}
