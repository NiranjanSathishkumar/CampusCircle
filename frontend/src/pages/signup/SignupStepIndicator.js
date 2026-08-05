import React from 'react';

function SignupStepIndicator({ steps, step }) {
  return (
    <div className="auth-steps">
      {steps.map((s, idx) => (
        <React.Fragment key={s.num}>
          <div className="auth-step" style={{ position: 'relative' }}>
            <div
              className={`auth-step__circle ${
                step > s.num ? 'auth-step__circle--done' :
                step === s.num ? 'auth-step__circle--active' : ''
              }`}
            >
              {step > s.num ? <i className="fa-solid fa-check" style={{ fontSize: '0.75rem' }} /> : s.num}
            </div>
            <span
              className={`auth-step__label ${step === s.num ? 'auth-step__label--active' : ''}`}
              style={{ position: 'absolute', bottom: -22, left: '50%', transform: 'translateX(-50%)' }}
            >
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`auth-step__line ${step > s.num + 1 ? 'auth-step__line--done' : step > s.num ? 'auth-step__line--active' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default SignupStepIndicator;
