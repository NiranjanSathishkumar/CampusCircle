import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './LoginPage.css';
import LoginBrandPanel from './LoginBrandPanel';
import LoginForm from './LoginForm';

function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!email || !email.trim()) {
      setApiError('Please enter your email address');
      return;
    }

    if (!password) {
      setApiError('Please enter your password');
      return;
    }

    try {
      const { data } = await api.post('/api/login', {
        email: email.trim(),
        password,
      });

      if (data && data.token) {
        localStorage.setItem('token', data.token);
        
        // Fetch full student profile using the JWT token
        let userObj = null;
        try {
          const profileRes = await api.get('/api/profile/get_profile');
          if (profileRes.data && profileRes.data.user) {
            userObj = profileRes.data.user;
          }
        } catch (profileErr) {
          console.warn('Failed to fetch user profile after login:', profileErr);
        }

        setApiError('');
        if (onLoginSuccess) {
          onLoginSuccess(userObj, data.token);
        }
        navigate('/discover');
      } else {
        setApiError(data?.message || 'Incorrect password or email');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Incorrect password or email';
      setApiError(errorMsg);
    }
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    if (apiError) setApiError('');
  };

  const handlePasswordChange = (val) => {
    setPassword(val);
    if (apiError) setApiError('');
  };

  return (
    <div className="auth-page">
      {/* ── Left Brand Panel ─────────────────────────────────────── */}
      <LoginBrandPanel />

      {/* ── Right Form Panel ─────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <LoginForm
            email={email}
            setEmail={handleEmailChange}
            password={password}
            setPassword={handlePasswordChange}
            showPw={showPw}
            setShowPw={setShowPw}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            apiError={apiError}
            onSubmit={handleSubmit}
          />

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/signup">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;