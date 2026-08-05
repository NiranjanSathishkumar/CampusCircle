import React, { useState } from 'react';
import axios from 'axios';

function SignupStepBasics({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  errors = {},
  setErrors = () => {},
  setApiError = () => {},
  onNext,
}) {
  const [isChecking, setIsChecking] = useState(false);

  const handleNext = async () => {
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
      return;
    }

    setErrors({});
    setIsChecking(true);
    setApiError('');

    try {
      const { data } = await axios.post('http://localhost:8080/check-user', {
        email: email.trim(),
      });

      if (data && data.exists) {
        setErrors({ email: 'An account with this email already exists.' });
        setApiError('An account with this email already exists.');
      } else {
        setApiError('');
        onNext();
      }
    } catch (error) {
      console.error('Check user error:', error);
      const msg = error.response?.data?.message;
      if (msg && msg.toLowerCase().includes('exist')) {
        setErrors({ email: 'An account with this email already exists.' });
        setApiError('An account with this email already exists.');
      } else if (error.request && !error.response) {
        setApiError('Unable to connect to backend server at http://localhost:8080. Please make sure the server is running.');
      } else {
        setErrors({ email: msg || 'Validation failed. Please try again.' });
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    setApiError('');
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <>
      <h2 className="auth-form-card__title">Create your account</h2>
      <p className="auth-form-card__subtitle">
        Join thousands of students and organisers on CampusCircle.
      </p>

      {/* Social */}
      <div className="auth-social-row">
        <button type="button" className="auth-social-btn">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>
        <button type="button" className="auth-social-btn">
          <i className="fa-brands fa-microsoft" style={{ color: '#00A4EF', fontSize: '1.15rem' }} />
          Microsoft
        </button>
      </div>

      <div className="auth-divider"><span>or sign up with email</span></div>

      {/* Name row */}
      <div className="auth-name-row">
        <div className="auth-field">
          <label htmlFor="signup-fname">First Name</label>
          <div className="auth-input-wrap">
            <input
              id="signup-fname"
              className={`auth-input${errors.firstName ? ' auth-input--error' : ''}`}
              type="text"
              placeholder="John"
              value={firstName}
              onChange={handleInputChange(setFirstName, 'firstName')}
              required
            />
            <i className="fa-solid fa-user" />
          </div>
          {errors.firstName && (
            <div className="auth-field-error">
              <i className="fa-solid fa-circle-exclamation" /> {errors.firstName}
            </div>
          )}
        </div>
        <div className="auth-field">
          <label htmlFor="signup-lname">Last Name</label>
          <div className="auth-input-wrap">
            <input
              id="signup-lname"
              className={`auth-input${errors.lastName ? ' auth-input--error' : ''}`}
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={handleInputChange(setLastName, 'lastName')}
              required
            />
            <i className="fa-solid fa-user" />
          </div>
          {errors.lastName && (
            <div className="auth-field-error">
              <i className="fa-solid fa-circle-exclamation" /> {errors.lastName}
            </div>
          )}
        </div>
      </div>

      <div className="auth-field">
        <label htmlFor="signup-email">University Email</label>
        <div className="auth-input-wrap">
          <input
            id="signup-email"
            className={`auth-input${errors.email ? ' auth-input--error' : ''}`}
            type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={handleInputChange(setEmail, 'email')}
            required
          />
          <i className="fa-solid fa-envelope" />
        </div>
        {errors.email && (
          <div className="auth-field-error">
            <i className="fa-solid fa-circle-exclamation" /> {errors.email}
          </div>
        )}
      </div>

      <button type="button" className="auth-submit" onClick={handleNext} disabled={isChecking}>
        {isChecking ? 'Checking...' : 'Continue'}
        {!isChecking && <i className="fa-solid fa-arrow-right" />}
      </button>
    </>
  );
}

export default SignupStepBasics;
