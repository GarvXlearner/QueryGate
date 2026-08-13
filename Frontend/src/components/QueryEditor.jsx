import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Sparkles, X } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { MySQL } from 'dt-sql-parser';
import debounce from 'lodash.debounce';
import './QueryEditor.css';

export default function QueryEditor({ activeDb, onResult, theme, insertTextTrigger }) {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  
  // Persist latest props for Monaco command closures
  const latestProps = useRef({ activeDb, token, onResult, query });
  useEffect(() => {
    latestProps.current = { activeDb, token, onResult, query };
  });
  
  const parserRef = useRef(null);
  if (!parserRef.current) {
    parserRef.current = new MySQL();
  }

  const validateSql = useRef(
    debounce((text, editor, monaco, parser) => {
      if (!editor || !monaco || !parser) return;
      try {
        const errors = parser.validate(text);
        const markers = errors.map(err => ({
          startLineNumber: err.startLine,
          endLineNumber: err.endLine,
          startColumn: err.startColumn,
          endColumn: err.endColumn,
          message: err.message,
          severity: monaco.MarkerSeverity.Error,
        }));
        
        const model = editor.getModel();
        if (model) {
          monaco.editor.setModelMarkers(model, 'sql-validation', markers);
        }
      } catch (e) {
        console.error("Parser validation error", e);
      }
    }, 500)
  ).current;

  useEffect(() => {
    if (insertTextTrigger && insertTextTrigger.text) {
      setQuery(insertTextTrigger.text);
      if (editorRef.current && monacoRef.current) {
        validateSql(insertTextTrigger.text, editorRef.current, monacoRef.current, parserRef.current);
      }
    }
  }, [insertTextTrigger]);

  const handleQueryChange = (val) => {
    const newText = val || '';
    setQuery(newText);
    if (editorRef.current && monacoRef.current) {
      validateSql(newText, editorRef.current, monacoRef.current, parserRef.current);
    }
  };

  const executeCore = async (mode) => {
    const props = latestProps.current;
    let textToExecute = editorRef.current ? editorRef.current.getValue() : props.query;
    
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const model = editorRef.current.getModel();
      if (selection && !selection.isEmpty()) {
        textToExecute = model.getValueInRange(selection);
      }
    }

    if (!textToExecute.trim()) return;
    
    let endpoint = '/api/query/execute';
    if (mode === 'explain') {
      textToExecute = "EXPLAIN FORMAT=JSON " + textToExecute;
    } else if (mode === 'ai') {
      endpoint = '/api/query/ai-execute';
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${props.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          dbId: props.activeDb.id || props.activeDb.Id, 
          [mode === 'ai' ? 'question' : 'query']: textToExecute 
        })
      });
      const data = await res.text();
      props.onResult({ type: res.ok ? 'success' : 'error', data });
    } catch (err) {
      props.onResult({ type: 'error', data: 'Failed to execute action.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = () => executeCore('execute');
  const handleAiExecute = () => executeCore('ai');
  const handleExplain = () => executeCore('explain');

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    validateSql(query, editor, monaco, parserRef.current);

    // Bind SSMS Shortcuts
    // F5 -> Execute
    editor.addCommand(monaco.KeyCode.F5, () => {
      handleExecute();
    });

    // Ctrl + L -> Execution Plan
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL, () => {
      handleExplain();
    });

    // F6 -> AI Execute (Custom)
    editor.addCommand(monaco.KeyCode.F6, () => {
      handleAiExecute();
    });
  };

  return (
    <div className="query-editor-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="query-editor" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="editor-toolbar">
          <div className="editor-actions">
            <button 
              className="action-btn primary" 
              onClick={handleExecute}
              disabled={isLoading}
              title="Execute Query (F5)"
            >
              <Play size={14} className="icon-green" />
              <span>Execute</span>
            </button>
            <button 
              className="action-btn ai-btn" 
              onClick={handleAiExecute}
              disabled={isLoading}
              title="AI Execute (F6)"
            >
              <Sparkles size={14} className="icon-purple" />
              <span>AI Execute</span>
            </button>
            <button 
              className="action-btn" 
              onClick={handleExplain}
              disabled={isLoading}
              title="Display Estimated Execution Plan (Ctrl+L)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-orange" style={{marginRight: '6px', color: '#f39c12'}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
              <span>Execution Plan</span>
            </button>
          </div>
        </div>
        
        <div className="editor-area" style={{ flex: 1, padding: '10px 0', border: '1px solid var(--border-color)' }}>
          <Editor
            height="100%"
            defaultLanguage="mysql"
            theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
            value={query}
            onChange={handleQueryChange}
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
