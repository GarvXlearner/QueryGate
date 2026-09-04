import { Link } from 'react-router-dom';
import { Database, Users, Shield, Zap, ChevronRight, Code, Activity, Server } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <Database size={24} className="logo-icon" />
          <span className="logo-text">QueryGate</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Sign In</Link>
          <Link to="/login" className="nav-cta">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse"></span>
            Now in Public Beta
          </div>
          <h1 className="hero-title">
            The Modern <span className="gradient-text">Database</span> Workspace for Teams
          </h1>
          <p className="hero-subtitle">
            Experience a desktop-grade SSMS environment directly in your browser. Collaborate with your team, manage role-based access, and execute queries in real-time.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="primary-btn">
              Start Free <ChevronRight size={18} />
            </Link>
            <a href="#features" className="secondary-btn">
              Explore Features
            </a>
          </div>
        </div>

        {/* Mock UI Preview */}
        <div className="hero-preview">
          <div className="preview-window glass-panel">
            <div className="window-header">
              <div className="window-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="window-title">QueryGate — Workspace</div>
            </div>
            <div className="window-body">
              <div className="preview-sidebar">
                <div className="skeleton-item" style={{ width: '80%' }}></div>
                <div className="skeleton-item" style={{ width: '60%' }}></div>
                <div className="skeleton-item" style={{ width: '70%' }}></div>
                <div className="skeleton-item" style={{ width: '90%', marginTop: '20px' }}></div>
                <div className="skeleton-item" style={{ width: '50%' }}></div>
              </div>
              <div className="preview-main">
                <div className="preview-code">
                  <span className="code-keyword">SELECT</span> * <span className="code-keyword">FROM</span> employees<br/>
                  <span className="code-keyword">WHERE</span> department = <span className="code-string">'Engineering'</span>;
                </div>
                <div className="preview-results">
                  <div className="skeleton-item"></div>
                  <div className="skeleton-item"></div>
                  <div className="skeleton-item" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Everything you need, <span className="gradient-text">nothing you don't</span></h2>
          <p>Built for modern engineering teams who demand speed, security, and simplicity.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon blue-glow">
              <Code size={24} />
            </div>
            <h3>Intelligent Editor</h3>
            <p>Monaco-powered SQL editor with syntax highlighting, auto-completion, and real-time error validation.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon purple-glow">
              <Users size={24} />
            </div>
            <h3>Team Collaboration</h3>
            <p>Invite your entire team to shared workspaces. No more sharing database credentials in Slack.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon green-glow">
              <Shield size={24} />
            </div>
            <h3>Role-Based Access</h3>
            <p>Granular control over who can query. Restrict users to READ-only access and prevent accidental data loss.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon orange-glow">
              <Activity size={24} />
            </div>
            <h3>Query Auditing</h3>
            <p>Complete visibility into your databases. Track exactly who ran what query and when.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon pink-glow">
              <Zap size={24} />
            </div>
            <h3>Instant Restores</h3>
            <p>Local state persistence ensures you never lose an unsaved query to an accidental page refresh again.</p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon teal-glow">
              <Server size={24} />
            </div>
            <h3>Universal Support</h3>
            <p>Connects seamlessly to MySQL, TiDB, MariaDB, and other MySQL-compatible engines globally.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content glass-panel">
          <h2>Ready to upgrade your database workflow?</h2>
          <p>Join developers who are managing their databases smarter.</p>
          <Link to="/login" className="primary-btn large">
            Create Your Workspace Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <Database size={20} />
            <span>QueryGate</span>
          </div>
          <div className="footer-copyright">
            &copy; {new Date().getFullYear()} QueryGate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
