import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Sparkles, X } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { MySQL } from 'dt-sql-parser';
import debounce from 'lodash.debounce';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import './QueryEditor.css';

function getUsernameFromToken(token) {
  if (!token) return 'Anonymous';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || 'Anonymous';
  } catch(e) {
    return 'Anonymous';
  }
}

export default function QueryEditor({ activeDb, onResult, theme, insertTextTrigger }) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const bindingRef = useRef(null);
  const providerRef = useRef(null);
  const ydocRef = useRef(null);
  
  // Persist latest props for Monaco command closures
  const latestProps = useRef({ activeDb, token, onResult });
  useEffect(() => {
    latestProps.current = { activeDb, token, onResult };
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
      if (editorRef.current) {
        editorRef.current.setValue(insertTextTrigger.text);
      }
    }
  }, [insertTextTrigger]);

  const executeCore = async (mode) => {
    const props = latestProps.current;
    if (!editorRef.current) return;
    
    let textToExecute = editorRef.current.getValue();
    const selection = editorRef.current.getSelection();
    const model = editorRef.current.getModel();
    
    if (selection && !selection.isEmpty()) {
      textToExecute = model.getValueInRange(selection);
    }

    if (!textToExecute.trim()) return;
    
    let endpoint = '/api/query/execute';
    if (mode === 'explain') {
      textToExecute = "EXPLAIN FORMAT=JSON " + textToExecute;
    } else if (mode === 'ai') {
      endpoint = '/api/query/ai-execute';
    }
    
    setIsLoading(true);
    const startTime = performance.now();
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
      const endTime = performance.now();
      props.onResult({ type: res.ok ? 'success' : 'error', data, timeMs: Math.round(endTime - startTime) });
    } catch (err) {
      const endTime = performance.now();
      props.onResult({ type: 'error', data: 'Failed to execute action.', timeMs: Math.round(endTime - startTime) });
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
    
    // --- YJS & WEBRTC SETUP ---
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const dbId = activeDb.id || activeDb.Id;
    // Shared room name based on dbId so everyone connected to this DB shares the code
    const roomName = `querygate-workspace-${dbId}`;
    
    // We switched to y-websocket because WebRTC is blocked by Incognito/Firewalls
    const provider = new WebsocketProvider('wss://demos.yjs.dev/ws', roomName, ydoc);
    providerRef.current = provider;

    const ytext = ydoc.getText('monaco');
    const binding = new MonacoBinding(ytext, editor.getModel(), new Set([editor]), provider.awareness);
    bindingRef.current = binding;

    // Set awareness (Cursor name & color)
    const username = getUsernameFromToken(token);
    const colors = ['#f39c12', '#e74c3c', '#9b59b6', '#3498db', '#1abc9c', '#2ecc71', '#e67e22', '#16a085'];
    const userColor = colors[Math.floor(Math.random() * colors.length)];
    
    provider.awareness.setLocalStateField('user', {
      name: username,
      color: userColor
    });
    // ---------------------------

    editor.onDidChangeModelContent(() => {
      validateSql(editor.getValue(), editor, monaco, parserRef.current);
    });

    // Initial validation
    validateSql(editor.getValue(), editor, monaco, parserRef.current);

    // Bind SSMS Shortcuts
    editor.addCommand(monaco.KeyCode.F5, () => {
      handleExecute();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL, () => {
      handleExplain();
    });

    editor.addCommand(monaco.KeyCode.F6, () => {
      handleAiExecute();
    });
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (bindingRef.current) bindingRef.current.destroy();
      if (providerRef.current) providerRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, []);

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
