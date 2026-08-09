import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import '../login/LoginPage.css'; /* shared auth styles */

import SignupBrandPanel from './SignupBrandPanel';
import SignupStepIndicator from './SignupStepIndicator';
import SignupStepBasics from './SignupStepBasics';
import SignupStepPassword from './SignupStepPassword';

const STEPS = [
  { num: 1, label: 'Basics' },
  { num: 2, label: 'Password' },
];

function SignupPage({ onSignupSuccess }) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = basics (Name, email, OAuth), 2 = password
  const [showPw, setShowPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);

  /* ── Form state ─────────────────────────────────────────────────── */
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  /* ── Error states ────────────────────────────────────────────────── */
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  /* ── Navigation ─────────────────────────────────────────────────── */
  const next = () => {
    setApiError('');
    setStep(2);
  };
  const back = () => {
    setApiError('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const newErrors = {};

    if (!firstName || !firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!lastName || !lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!email || !email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStep(1);
      return;
    }

    if (!password || password.length < 8) {
      setApiError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPw) {
      setApiError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setApiError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const { data } = await api.post('/api/signup', {
        email: email.trim(),
        password,
        name: fullName,
      });

      // Backend returns message: "User Registered Successfully!"
      if (data) {
        setApiError('');

        // Perform automatic login to get JWT token
        try {
          const loginRes = await api.post('/api/login', {
            email: email.trim(),
            password,
          });

          if (loginRes.data && loginRes.data.token) {
            localStorage.setItem('token', loginRes.data.token);

            let userObj = null;
            try {
              const profileRes = await api.get('/api/profile/get_profile');
              if (profileRes.data && profileRes.data.user) {
                userObj = profileRes.data.user;
              }
            } catch (pErr) {
              console.warn('Failed to fetch profile after signup auto-login:', pErr);
            }

            if (onSignupSuccess) {
              onSignupSuccess(userObj, loginRes.data.token);
            }
            navigate('/profile');
            return;
          }
        } catch (loginErr) {
          console.warn('Auto-login after signup failed:', loginErr);
        }

        // If auto-login fails, redirect to login page
        navigate('/login');
      } else {
        const msg = data?.message || 'An account with this email already exists';
        setApiError(msg);
        if (msg.toLowerCase().includes('exist')) {
          setErrors({ email: 'This email is already registered.' });
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      const serverMsg = error.response?.data?.message;
      if (serverMsg) {
        setApiError(serverMsg);
        if (serverMsg.toLowerCase().includes('exist')) {
          setErrors({ email: 'This email is already registered.' });
        }
      } else if (error.request) {
        setApiError('Unable to connect to backend server at http://localhost:8080. Please ensure your backend server is running.');
      } else {
        setApiError(error.message || 'Failed to create account. Please check your details and try again.');
      }
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left Brand Panel ─────────────────────────────────────── */}
      <SignupBrandPanel />

      {/* ── Right Form Panel ─────────────────────────────────────── */}
      <div className="auth-form-panel">
        <div className="auth-form-card">
          {/* Step indicator */}
          <SignupStepIndicator steps={STEPS} step={step} />

          {/* Inline API Error Banner */}
          {apiError && (
            <div className="auth-error-banner" role="alert">
              <i className="fa-solid fa-circle-exclamation" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            {step === 1 && (
              <SignupStepBasics
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                email={email}
                setEmail={setEmail}
                errors={errors}
                setErrors={setErrors}
                setApiError={setApiError}
                onNext={next}
              />
            )}
            {step === 2 && (
              <SignupStepPassword
                password={password}
                setPassword={setPassword}
                confirmPw={confirmPw}
                setConfirmPw={setConfirmPw}
                showPw={showPw}
                setShowPw={setShowPw}
                showConfPw={showConfPw}
                setShowConfPw={setShowConfPw}
                agreeTerms={agreeTerms}
                setAgreeTerms={setAgreeTerms}
                onBack={back}
              />
            )}
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;