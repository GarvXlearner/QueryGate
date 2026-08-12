import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Sparkles, X } from 'lucide-react';
import Editor from '@monaco-editor/react';
import './QueryEditor.css';

export default function QueryEditor({ activeDb, onResult, theme }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleExecute = async () => {
    let textToExecute = query;
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const model = editorRef.current.getModel();
      if (selection && !selection.isEmpty()) {
        textToExecute = model.getValueInRange(selection);
      }
    }

    if (!textToExecute.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/query/execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dbId: activeDb.id || activeDb.Id, query: textToExecute })
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
    let textToExecute = query;
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const model = editorRef.current.getModel();
      if (selection && !selection.isEmpty()) {
        textToExecute = model.getValueInRange(selection);
      }
    }

    if (!textToExecute.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/query/ai-execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dbId: activeDb.id || activeDb.Id, question: textToExecute })
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
    <div className="query-editor-container">
      <div className="editor-tabs">
        <div className="editor-tab active">
          SQLQuery1.sql - localhost ({activeDb?.dbName})
          <button className="tab-close"><X size={12} /></button>
        </div>
      </div>
      
      <div className="query-editor">
        <div className="editor-toolbar">
          <div className="editor-actions">
            <button 
              className="action-btn primary" 
              onClick={handleExecute}
              disabled={isLoading}
            >
              <Play size={14} className="icon-green" />
              <span>Execute</span>
            </button>
            <button 
              className="action-btn ai-btn" 
              onClick={handleAiExecute}
              disabled={isLoading}
            >
              <Sparkles size={14} className="icon-purple" />
              <span>AI Execute</span>
            </button>
          </div>
        </div>
        
        <div className="editor-area" style={{ flex: 1, padding: '10px 0', border: '1px solid var(--border-color)' }}>
          <Editor
            height="100%"
            defaultLanguage="mysql"
            theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
            value={query}
            onChange={(val) => setQuery(val || '')}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 10 }
            }}
          />
        </div>
      </div>
    </div>
  );
}
