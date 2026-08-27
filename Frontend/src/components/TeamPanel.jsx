import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, X, Database, Shield } from 'lucide-react';
import './TeamPanel.css';

export default function TeamPanel({ onClose }) {
  const { token } = useAuth();
  const [members, setMembers] = useState([]);
  const [databases, setDatabases] = useState([]);
  const [error, setError] = useState('');
  
  const serverId = localStorage.getItem('activeServerId');

  useEffect(() => {
    if (!serverId) return;
    fetchMembers();
    fetchDatabases();
  }, [serverId]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/workspace/${serverId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 403) setError('Only the workspace owner can manage the team.');
        else setError('Failed to fetch members.');
        return;
      }
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      setError('An error occurred.');
    }
  };

  const fetchDatabases = async () => {
    try {
      const res = await fetch(`/api/workspace/${serverId}/databases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDatabases(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGrantAccess = async (userId, dbId, permission) => {
    try {
      const res = await fetch(`/api/workspace/${serverId}/database/${dbId}/access`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, permission })
      });
      if (res.ok) {
        // Success
      } else {
        alert('Failed to update access.');
      }
    } catch (err) {
      alert('Error updating access.');
    }
  };

  if (error) {
    return (
      <div className="team-panel-overlay">
        <div className="team-panel glass-panel">
          <div className="team-header">
            <h3><Users size={18} style={{marginRight: '8px', display: 'inline'}} /> Team Settings</h3>
            <button onClick={onClose} className="icon-btn"><X size={18} /></button>
          </div>
          <div className="team-body">
            <div style={{color: 'var(--accent-error)', padding: '20px', textAlign: 'center'}}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="team-panel-overlay">
      <div className="team-panel glass-panel">
        <div className="team-header">
          <h3><Users size={18} style={{marginRight: '8px', display: 'inline'}} /> Team Settings</h3>
          <button onClick={onClose} className="icon-btn"><X size={18} /></button>
        </div>
        
        <div className="team-body">
          <p style={{color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px'}}>
            Manage who has access to your workspace databases. (Only available to Workspace Owners).
          </p>

          <div style={{ marginBottom: '24px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Workspace Invite Code</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--accent-primary)' }}>
                {localStorage.getItem('activeJoinCode') || 'N/A'}
              </div>
            </div>
            <button 
              className="login-btn" 
              style={{ width: 'auto', padding: '6px 12px', fontSize: '12px', minHeight: 'auto' }}
              onClick={() => {
                navigator.clipboard.writeText(localStorage.getItem('activeJoinCode'));
                alert('Invite code copied to clipboard!');
              }}
            >
              Copy Code
            </button>
          </div>
          
          <div className="members-list">
            {members.map(member => (
              <div key={member.userId} className="member-card">
                <div className="member-info">
                  <div className="member-avatar">{member.username.charAt(0).toUpperCase()}</div>
                  <div className="member-details">
                    <span className="member-name">{member.username}</span>
                    <span className="member-role">{member.role}</span>
                  </div>
                </div>
                
                {member.role !== 'OWNER' && (
                  <div className="member-databases">
                    <h4 style={{fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', marginTop: '16px'}}>Database Access</h4>
                    {databases.map(db => (
                      <div key={db.id} className="db-access-row">
                        <div className="db-name"><Database size={14} style={{display: 'inline', marginRight: '4px'}}/> {db.name}</div>
                        <select 
                          className="access-select"
                          onChange={(e) => handleGrantAccess(member.userId, db.id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Select Access</option>
                          <option value="NONE">No Access</option>
                          <option value="READ">Read Only</option>
                          <option value="WRITE">Read / Write</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
