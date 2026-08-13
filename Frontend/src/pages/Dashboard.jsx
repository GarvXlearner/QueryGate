import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import QueryEditor from '../components/QueryEditor';
import ResultsPanel from '../components/ResultsPanel';
import { LogOut, Database, Moon, Sun, Play, Square, FolderOpen, Save, X } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { logout } = useAuth();
  const [activeDb, setActiveDb] = useState(null);
  const [theme, setTheme] = useState('light');
  const [insertTextTrigger, setInsertTextTrigger] = useState(null);
  
  // Tab Management
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [tabCounter, setTabCounter] = useState(1);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // When a database is first selected and no tabs exist, open one
  useEffect(() => {
    if (activeDb && tabs.length === 0) {
      handleNewQuery();
    }
  }, [activeDb]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNewQuery = () => {
    if (!activeDb) return;
    const newId = Date.now().toString();
    const newTab = {
      id: newId,
      title: `SQLQuery${tabCounter}.sql`,
      db: activeDb,
      query: '',
      result: null
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    setTabCounter(prev => prev + 1);
  };

  const closeTab = (id) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== id);
      if (activeTabId === id) {
        setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
      }
      return newTabs;
    });
  };

  const updateTabResult = (id, result) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, result } : t));
  };

  const handleInsertQuery = (text) => {
    if (!activeTabId) {
      if (!activeDb) return;
      handleNewQuery();
      // Delay slightly so the tab renders before trigger fires
      setTimeout(() => setInsertTextTrigger({ text, ts: Date.now() }), 100);
    } else {
      setInsertTextTrigger({ text, ts: Date.now() });
    }
  };

  return (
    <div className="dashboard-layout">
      {/* SSMS Menu Bar */}
      <div className="ssms-menubar">
        <div className="menu-items">
          <div className="menu-item">File</div>
          <div className="menu-item">Edit</div>
          <div className="menu-item">View</div>
          <div className="menu-item">Query</div>
          <div className="menu-item">Tools</div>
          <div className="menu-item">Window</div>
          <div className="menu-item">Help</div>
        </div>
        <div className="menu-right">
          <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
          <button onClick={logout} className="logout-btn" title="Logout">
            <LogOut size={14} />
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      {/* SSMS Tool Bar */}
      <div className="ssms-toolbar">
        <button className="toolbar-btn" title="New Query" onClick={handleNewQuery} disabled={!activeDb}>
          <FolderOpen size={16} className="toolbar-icon" />
          <span style={{marginLeft: '4px', fontSize: '12px'}}>New Query</span>
        </button>
        <button className="toolbar-btn" title="Save" disabled>
          <Save size={16} className="toolbar-icon" />
        </button>
        <div className="toolbar-separator" />
        <div className="toolbar-db-select">
          <Database size={14} />
          <span>{activeDb ? activeDb.dbName : 'master'}</span>
        </div>
      </div>

      <div className="dashboard-body">
        {/* Left Sidebar (Object Explorer) */}
        <Sidebar 
          onSelectDb={setActiveDb} 
          activeDb={activeDb} 
          onInsertQuery={handleInsertQuery}
        />

        {/* Main Workspace */}
        <main className="workspace">
          {tabs.length > 0 ? (
            <div className="editor-container" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
              <div className="editor-tabs">
                {tabs.map(t => (
                  <div 
                    key={t.id} 
                    className={`editor-tab ${t.id === activeTabId ? 'active' : ''}`} 
                    onClick={() => setActiveTabId(t.id)}
                  >
                    {t.title} - localhost ({t.db?.dbName})
                    <button className="tab-close" onClick={(e) => { e.stopPropagation(); closeTab(t.id); }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="tab-contents" style={{flex: 1, position: 'relative', overflow: 'hidden'}}>
                {tabs.map(t => (
                  <div 
                    key={t.id} 
                    style={{ 
                      display: t.id === activeTabId ? 'flex' : 'none', 
                      flexDirection: 'column', 
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0 
                    }}
                  >
                    <QueryEditor 
                      activeDb={t.db} 
                      onResult={(res) => updateTabResult(t.id, res)}
                      theme={theme}
                      insertTextTrigger={t.id === activeTabId ? insertTextTrigger : null}
                    />
                    <ResultsPanel result={t.result} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-workspace">
              <Database size={48} className="empty-icon" />
              <h2>Object Explorer</h2>
              <p>{activeDb ? 'Click "New Query" to begin writing SQL.' : 'Connect to a database in the Object Explorer to begin.'}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
