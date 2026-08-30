import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Loader } from 'lucide-react';
import './ConnectDbModal.css';

export default function ConnectDbModal({ onClose, onSuccess }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [dbForm, setDbForm] = useState({
    dbName: '',
    host: 'localhost',
    port: '3306',
    username: 'root',
    password: ''
  });

  const [recentConnections, setRecentConnections] = useState([]);

  React.useEffect(() => {
    const fetchRecentConnections = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/api/workspace/recent-connections`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRecentConnections(data);
        }
      } catch (err) {
        console.error("Failed to fetch recent connections");
      }
    };
    fetchRecentConnections();
  }, [token]);

  const handleSelectRecent = (e) => {
    const idx = e.target.value;
    if (idx === "") return;
    const conn = recentConnections[idx];
    if (conn) {
      setDbForm({
        dbName: conn.dbName,
        host: conn.host,
        port: conn.port,
        username: conn.username,
        password: conn.password
      });
    }
  };

  const handleConnectDb = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const serverId = localStorage.getItem('activeServerId');
      if (!serverId) {
        setError('No active workspace selected.');
        setLoading(false);
        return;
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/workspace/${serverId}/database`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbForm)
      });
      
      const data = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to connect database');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="connect-modal-overlay">
      <div className="connect-modal glass-panel">
        <div className="connect-modal-header">
          <h2>Connect Database</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="connect-modal-body">
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Add a database to your current workspace.</p>
          {error && <div style={{ color: 'red', marginBottom: '16px', padding: '12px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{error}</div>}
          
          {recentConnections.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Or select a recently used connection:</label>
              <select 
                onChange={handleSelectRecent} 
                defaultValue=""
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', color: 'white' }}
              >
                <option value="" disabled>-- Select a Recent Connection --</option>
                {recentConnections.map((conn, idx) => (
                  <option key={idx} value={idx}>
                    {conn.dbName} @ {conn.host}:{conn.port}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <form onSubmit={handleConnectDb}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Database Name</label>
                <input required type="text" value={dbForm.dbName} onChange={e => setDbForm({...dbForm, dbName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-default)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Host</label>
                <input required type="text" value={dbForm.host} onChange={e => setDbForm({...dbForm, host: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-default)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Port</label>
                <input required type="text" value={dbForm.port} onChange={e => setDbForm({...dbForm, port: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-default)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Username</label>
                <input required type="text" value={dbForm.username} onChange={e => setDbForm({...dbForm, username: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-default)', color: 'white' }} />
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
              <input type="password" value={dbForm.password} onChange={e => setDbForm({...dbForm, password: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-default)', color: 'white' }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? <Loader size={16} className="spin" /> : 'Connect Database'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
