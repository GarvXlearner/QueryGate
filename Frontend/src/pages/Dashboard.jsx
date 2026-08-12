import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import QueryEditor from '../components/QueryEditor';
import ResultsPanel from '../components/ResultsPanel';
import { LogOut, Database } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { logout } = useAuth();
  const [activeDb, setActiveDb] = useState(null);
  const [queryResult, setQueryResult] = useState(null);

  return (
    <div className="dashboard-layout">
      {/* Top Navbar */}
      <header className="dashboard-header">
        <div className="logo-area">
          <Database size={20} className="logo-icon" />
          <span>QueryGate Studio</span>
        </div>
        <button onClick={logout} className="logout-btn" title="Logout">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </header>

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
              />
              <ResultsPanel result={queryResult} />
            </div>
          ) : (
            <div className="empty-workspace">
              <Database size={48} className="empty-icon" />
              <h2>No Database Selected</h2>
              <p>Please select a database from the Object Explorer to start querying.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
