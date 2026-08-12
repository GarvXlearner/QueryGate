import { useNavigate } from 'react-router-dom';
import { Server, Users, ArrowRight } from 'lucide-react';
import './Onboarding.css';

export default function Onboarding() {
  const navigate = useNavigate();

  const handleGetServer = () => {
    // Navigate to a server creation flow
    console.log("Navigating to create server");
  };

  const handleJoinServer = () => {
    // Navigate to a join server flow
    console.log("Navigating to join server");
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h1>Welcome to QueryGate</h1>
        <p>Choose how you want to get started</p>
      </div>

      <div className="onboarding-cards">
        <div className="onboarding-card glass-panel" onClick={handleGetServer}>
          <div className="card-icon-wrapper blue">
            <Server size={32} />
          </div>
          <h2>Get Server</h2>
          <p>Create a new server workspace, add databases, and invite your team.</p>
          <div className="card-action">
            Create Workspace <ArrowRight size={16} />
          </div>
        </div>

        <div className="onboarding-card glass-panel" onClick={handleJoinServer}>
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

      {/* Temporary button to bypass onboarding while backend is pending */}
      <div style={{ marginTop: '40px' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Skip to Dashboard (Local Fallback)
        </button>
      </div>
    </div>
  );
}
