import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Users, ArrowRight, Database, CheckCircle, Loader } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import './Onboarding.css';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState('select'); // 'select', 'createServer', 'connectDb', 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [serverName, setServerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [serverId, setServerId] = useState(null);
  
  const [workspaces, setWorkspaces] = useState([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  const [dbForm, setDbForm] = useState({
    dbName: '',
    host: 'localhost',
    port: '3306',
    username: 'root',
    password: ''
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };


  
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/api/workspace/list`, {
          headers: getAuthHeader()
        });
        if (res.ok) {
          const data = await res.json();
          setWorkspaces(data);
        }
      } catch (err) {
        console.error('Failed to fetch workspaces', err);
      } finally {
        setLoadingWorkspaces(false);
      }
    };
    fetchWorkspaces();
  }, []);

  const handleCreateServer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/workspace/create`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ serverName })
      });
      const data = await res.json();
      if (res.ok) {
        setServerId(data.serverId);
        localStorage.setItem('activeServerId', data.serverId);
        localStorage.setItem('activeServerName', data.serverName);
        localStorage.setItem('activeJoinCode', data.joinCode);
        setStep('connectDb');
      } else {
        setError(data.error || 'Failed to create workspace');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleConnectDb = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/workspace/${serverId}/database`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(dbForm)
      });
      const data = await res.json();
      if (res.ok) {
        setStep('success');
      } else {
        setError(data.error || 'Failed to connect database');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleJoinServer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/workspace/join`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ joinCode })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('activeServerId', data.serverId);
        localStorage.setItem('activeServerName', data.serverName);
        localStorage.setItem('activeJoinCode', data.joinCode);
        navigate('/app');
      } else {
        setError(data.error || 'Failed to join workspace');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Get Started | QueryGate</title>
      </Helmet>
      <div className="onboarding-container">
        <div className="onboarding-content">
        <div className="onboarding-header">
          <h1>Welcome to QueryGate</h1>
          <p>Choose how you want to get started</p>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '16px', padding: '12px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{error}</div>}

        {step === 'select' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {workspaces.length > 0 && (
              <div className="existing-workspaces glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
                <h2 style={{ marginBottom: '16px', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Your Existing Workspaces</h2>
                <div className="workspace-list" style={{ display: 'grid', gap: '12px' }}>
                  {workspaces.map(ws => (
                    <div key={ws.id} className="workspace-item" onClick={() => { localStorage.setItem('activeServerId', ws.id); localStorage.setItem('activeServerName', ws.name); localStorage.setItem('activeJoinCode', ws.joinCode); navigate('/app'); }} style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Server size={24} color="var(--accent-primary)" />
                        <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>{ws.name}</span>
                      </div>
                      <ArrowRight size={20} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="onboarding-cards">
            <div className="onboarding-card glass-panel" onClick={() => setStep('createServer')}>
              <div className="card-icon-wrapper blue">
                <Server size={32} />
              </div>
              <h2>Get Server</h2>
              <p>Create a new server workspace, add databases, and invite your team.</p>
              <div className="card-action">
                Create Workspace <ArrowRight size={16} />
              </div>
            </div>

            <div className="onboarding-card glass-panel" onClick={() => setStep('joinServer')}>
              <div className="card-icon-wrapper purple">
                <Users size={32} />
              </div>
              <h2>Join Server</h2>
              <p>Enter an invite code to join an existing server workspace.</p>
              <div className="card-action">
                Join Workspace <ArrowRight size={16} />
              </div>
            </div>
            </div>
          </div>
        )}

        {step === 'createServer' && (
          <div className="onboarding-form glass-panel" style={{ padding: '32px', maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
            <h2>Name Your Workspace</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Give your team a shared home.</p>
            <form onSubmit={handleCreateServer}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Server Name</label>
                <input 
                  type="text" 
                  required 
                  value={serverName}
                  onChange={e => setServerName(e.target.value)}
                  placeholder="e.g. Production Cluster" 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-default)', color: 'white' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setStep('select')} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Back</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                  {loading ? <Loader size={16} className="spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'joinServer' && (
          <div className="onboarding-form glass-panel" style={{ padding: '32px', maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
            <h2>Join Workspace</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Enter the invite code from your team admin.</p>
            <form onSubmit={handleJoinServer}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Invite Code</label>
                <input 
                  type="text" 
                  required 
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. 8A7B6C" 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-default)', color: 'white', textTransform: 'uppercase' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setStep('select')} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border-color)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>Back</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                  {loading ? <Loader size={16} className="spin" /> : 'Join'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'connectDb' && (
          <div className="onboarding-form glass-panel" style={{ padding: '32px', maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
            <h2>Connect Database</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add a database to your new workspace.</p>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Paste Connection String (Auto-fills form below)</label>
              <input 
                type="text" 
                placeholder="mysql://user:pass@host:port/dbname" 
                onChange={(e) => {
                  const str = e.target.value;
                  if (!str) return;
                  try {
                    let urlStr = str;
                    if (urlStr.startsWith('jdbc:mysql://')) urlStr = urlStr.replace('jdbc:mysql://', 'mysql://');
                    if (!urlStr.includes('://')) urlStr = 'mysql://' + urlStr;
                    const url = new URL(urlStr);
                    setDbForm(prev => ({
                      ...prev,
                      dbName: url.pathname.replace('/', '') || prev.dbName,
                      host: url.hostname || prev.host,
                      port: url.port || prev.port,
                      username: decodeURIComponent(url.username) || prev.username,
                      password: decodeURIComponent(url.password) || prev.password
                    }));
                  } catch (err) {}
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-elevated)', color: 'white', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
              />
            </div>

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
        )}

        {step === 'success' && (
          <div className="onboarding-form glass-panel" style={{ padding: '48px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <CheckCircle size={64} color="var(--success-color)" style={{ marginBottom: '24px' }} />
            <h2>All Set!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Your workspace is ready and your database is connected.</p>
            <button onClick={() => navigate('/app')} style={{ width: '100%', padding: '12px', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </>
  );
}
