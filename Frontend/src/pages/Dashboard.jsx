import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import QueryEditor from '../components/QueryEditor';
import ResultsPanel from '../components/ResultsPanel';
import { LogOut, Database, Moon, Sun, Play, Square, FolderOpen, Save } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { logout } = useAuth();
  const [activeDb, setActiveDb] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
        <button className="toolbar-btn" title="New Query" disabled>
          <FolderOpen size={16} className="toolbar-icon" />
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
        <Sidebar onSelectDb={setActiveDb} activeDb={activeDb} />

        {/* Main Workspace */}
        <main className="workspace">
          {activeDb ? (
            <div className="editor-container">
              <QueryEditor 
                activeDb={activeDb} 
                onResult={setQueryResult}
                theme={theme}
              />
              <ResultsPanel result={queryResult} />
            </div>
          ) : (
            <div className="empty-workspace">
              <Database size={48} className="empty-icon" />
              <h2>Object Explorer</h2>
              <p>Connect to a database in the Object Explorer to begin.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
