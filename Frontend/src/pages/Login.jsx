import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Helmet } from 'react-helmet-async';
import './Login.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>{isLogin ? 'Sign In' : 'Sign Up'} | QueryGate</title>
      </Helmet>

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.text();
      if (res.ok) {
        login(data); // JWT token
        navigate('/onboarding');
      } else {
        setError(data);
      }
    } catch (err) {
      setError('Failed to connect to the server for Google Login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (/\s/.test(username)) {
      setError('Username cannot contain spaces.');
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      setIsLoading(true);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.text();
      
      if (!res.ok || data.includes('already taken') || data.includes('not found') || data.includes('Invalid') || data.includes('lock')) {
        setError(data);
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        login(data); // JWT token
        navigate('/onboarding'); // Redirect to onboarding
      } else {
        setIsLogin(true);
        setError('Registered successfully. Please login.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to connect to the server.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box glass-panel">
        <div className="login-header">
          <h1>QueryGate</h1>
          <p>Database Management Studio</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required 
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required 
            />
          </div>
          <button type="submit" className="login-btn">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="google-auth-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError('Google login failed.');
            }}
            useOneTap
            theme="filled_black"
            shape="rectangular"
            width="100%"
          />
        </div>
        
        <div className="login-footer">
          <button onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
