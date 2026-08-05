import React, { useMemo } from 'react';

function SignupStepPassword({
  password,
  setPassword,
  confirmPw,
  setConfirmPw,
  showPw,
  setShowPw,
  showConfPw,
  setShowConfPw,
  agreeTerms,
  setAgreeTerms,
  onBack,
}) {
  /* ── Password strength ──────────────────────────────────────────── */
  const strength = useMemo(() => {
    if (!password) return { level: 0, label: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: 'Weak' };
    if (score <= 2) return { level: 2, label: 'Medium' };
    return { level: 3, label: 'Strong' };
  }, [password]);

  const strengthClass = (idx) => {
    if (idx <= strength.level) {
      if (strength.level === 1) return 'auth-strength-bar--weak';
      if (strength.level === 2) return 'auth-strength-bar--medium';
      return 'auth-strength-bar--strong';
    }
    return '';
  };

  const isSubmitDisabled = !password || password.length < 8 || password !== confirmPw || !agreeTerms;

  return (
    <>
      <button type="button" className="auth-back-btn" onClick={onBack}>
        <i className="fa-solid fa-arrow-left" /> Back
      </button>
      <h2 className="auth-form-card__title">Secure your account</h2>
      <p className="auth-form-card__subtitle">
        Set a strong password to complete your registration.
      </p>

      <div className="auth-field">
        <label htmlFor="signup-pw">Password</label>
        <div className="auth-input-wrap">
          <input
            id="signup-pw"
            className="auth-input"
            type={showPw ? 'text' : 'password'}
            placeholder="Min 8 characters"
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
        {password && password.length < 8 && (
          <div className="auth-strength-label auth-strength-label--weak" style={{ marginTop: 6 }}>
            Password must be at least 8 characters
          </div>
        )}
        {/* Strength bar */}
        {password && password.length >= 8 && (
          <>
            <div className="auth-strength">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`auth-strength-bar ${strengthClass(i)}`} />
              ))}
            </div>
            <div className={`auth-strength-label auth-strength-label--${strength.label.toLowerCase()}`}>
              {strength.label}
            </div>
          </>
        )}
      </div>

      <div className="auth-field">
        <label htmlFor="signup-cpw">Confirm Password</label>
        <div className="auth-input-wrap">
          <input
            id="signup-cpw"
            className="auth-input"
            type={showConfPw ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            required
          />
          <i className="fa-solid fa-lock" />
          <button
            type="button"
            className="auth-pw-toggle"
            onClick={() => setShowConfPw((p) => !p)}
            tabIndex={-1}
            aria-label="Toggle password visibility"
          >
            <i className={showConfPw ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
          </button>
        </div>
        {confirmPw && confirmPw !== password && (
          <div className="auth-strength-label auth-strength-label--weak" style={{ marginTop: 6 }}>
            Passwords don't match
          </div>
        )}
      </div>

      <div className="auth-terms">
        <input
          type="checkbox"
          id="terms"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
        />
        <label htmlFor="terms">
          I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
        </label>
      </div>

      <button
        type="submit"
        className="auth-submit"
        disabled={isSubmitDisabled}
        style={{
          opacity: isSubmitDisabled ? 0.5 : 1,
          cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        Create Account
        <i className="fa-solid fa-rocket" />
      </button>
    </>
  );
}

export default SignupStepPassword;
