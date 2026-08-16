import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Users, ArrowRight, Database, CheckCircle, Loader } from 'lucide-react';
import './Onboarding.css';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState('select'); // 'select', 'createServer', 'connectDb', 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [serverName, setServerName] = useState('');
  const [serverId, setServerId] = useState(null);

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

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h1>Welcome to QueryGate</h1>
        <p>Choose how you want to get started</p>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '16px', padding: '12px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{error}</div>}

      {step === 'select' && (
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

          <div className="onboarding-card glass-panel disabled">
            <div className="card-icon-wrapper purple">
              <Users size={32} />
            </div>
            <h2>Join Server</h2>
            <p>Enter an invite code to join an existing server workspace.</p>
            <div className="card-action">
              Coming Soon...
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

      {step === 'connectDb' && (
        <div className="onboarding-form glass-panel" style={{ padding: '32px', maxWidth: '500px', margin: '0 auto', textAlign: 'left' }}>
          <h2>Connect Database</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add a database to your new workspace.</p>
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
          <button onClick={() => navigate('/')} style={{ width: '100%', padding: '12px', background: 'var(--accent-primary)', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
