import React from 'react';

function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPw,
  setShowPw,
  rememberMe,
  setRememberMe,
  apiError = '',
  onSubmit,
}) {
  return (
    <>
      <h2 className="auth-form-card__title">Welcome back</h2>
      <p className="auth-form-card__subtitle">
        Sign in to your CampusCircle account to continue.
      </p>

      {/* Inline API Error Banner */}
      {apiError && (
        <div className="auth-error-banner" role="alert">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Social Login */}
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

      <div className="auth-divider">
        <span>or continue with email</span>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit}>
        <div className="auth-field">
          <label htmlFor="login-email">Email Address</label>
          <div className="auth-input-wrap">
            <input
              id="login-email"
              className={`auth-input${apiError ? ' auth-input--error' : ''}`}
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <i className="fa-solid fa-envelope" />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="login-pw">Password</label>
          <div className="auth-input-wrap">
            <input
              id="login-pw"
              className={`auth-input${apiError ? ' auth-input--error' : ''}`}
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i className="fa-solid fa-lock" />
            <button
              type="button"
              className="auth-pw-toggle"
              onClick={() => setShowPw((p) => !p)}
              tabIndex={-1}
              aria-label="Toggle password visibility"
            >
              <i className={showPw ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
            </button>
          </div>
        </div>

        <div className="auth-extras">
          <label className="auth-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <a href="#forgot" className="auth-forgot">Forgot password?</a>
        </div>

        <button type="submit" className="auth-submit">
          Sign In
          <i className="fa-solid fa-arrow-right" />
        </button>
      </form>
    </>
  );
}

export default LoginForm;
