import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/layouts/public/Footer';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  EnvelopeSimple,
  GraduationCap,
  IdentificationBadge,
  LockKey,
  Eye,
  EyeSlash,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkle,
  QrCode,
  CaretRight,
  Buildings,
  Check,
  WarningCircle
} from '@phosphor-icons/react';
import { ACADEMIC_YEARS, SIES_BRANCHES } from '@/features/auth/signupOptions';
import { useAuth } from '@/shared/auth/useAuth';
import { AutoLoginAfterSignupError } from '@/shared/auth/AuthContext';
import { checkEmailAvailability } from '@/shared/auth/auth.api';

// Mirrors the backend's own computeCurrentYear/getAcademicCutoverYear
// (models/User.js) so the FE/SE/TE/BE the form collects lands on the same
// yearOfJoining the backend would independently derive. Academic year flips
// every June 1st (month index 5).
const ACADEMIC_YEAR_ROLLOVER_MONTH = 5;
const YEAR_LEVEL_INDEX = { FE: 1, SE: 2, TE: 3, BE: 4 };

function yearIdToYearOfJoining(yearId, referenceDate = new Date()) {
  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();
  const cutoverYear = month >= ACADEMIC_YEAR_ROLLOVER_MONTH ? year : year - 1;
  const levelIndex = YEAR_LEVEL_INDEX[yearId] || 1;
  return cutoverYear - levelIndex + 1;
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    branch: 'Computer Engineering 1',
    year: 'TE',
    rollNumber: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Account was created but the automatic sign-in right after didn't take —
  // still a success (the ticket card below is accurate), just needs the
  // user to sign in manually instead of landing straight in their profile.
  const [needsManualLogin, setNeedsManualLogin] = useState(false);

  // Email domain check
  const isSiesEmail = formData.email.toLowerCase().endsWith('@sies.edu.in') || 
                      formData.email.toLowerCase().endsWith('@siesgst.ac.in') ||
                      formData.email.includes('sies');

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'bg-gray-300' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1: return { score: 25, label: 'Weak', color: 'bg-red-600' };
      case 2: return { score: 50, label: 'Fair', color: 'bg-amber-600' };
      case 3: return { score: 75, label: 'Good', color: 'bg-emerald-600' };
      case 4: return { score: 100, label: 'Campus Grade', color: 'bg-[#991B1B]' };
      default: return { score: 15, label: 'Too Short', color: 'bg-red-400' };
    }
  };

  const pwdStrength = getPasswordStrength(formData.password);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Please enter first and last name';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'College email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must accept the SIES GST campus guidelines';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep1()) return;

    setIsCheckingEmail(true);
    try {
      const { exists } = await checkEmailAvailability(formData.email.trim());
      if (exists) {
        setErrors({ email: 'An account with this email already exists. Try signing in instead.' });
        return;
      }
      setDirection(1);
      setStep(2);
    } catch (err) {
      setErrors({ email: err.message || 'Could not verify this email right now. Please try again.' });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, form: '' }));
    try {
      await signup(formData.fullName.trim(), formData.email.trim(), formData.password, {
        rollNo: formData.rollNumber.trim() || undefined,
        branch: formData.branch,
        yearOfJoining: yearIdToYearOfJoining(formData.year),
      });
      setIsSubmitted(true);
    } catch (err) {
      if (err instanceof AutoLoginAfterSignupError) {
        // The account really was created — show the same success card, just
        // steer the CTA to sign in manually instead of straight to /profile.
        setNeedsManualLogin(true);
        setIsSubmitted(true);
      } else {
        setErrors((prev) => ({ ...prev, form: err.message || 'Registration failed. Please try again.' }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-[#F5F2EA] ledger-grid flex flex-col justify-between selection:bg-[#991B1B] selection:text-white">
      {/* TOP BRAND BAR */}
      <header className="py-5 border-b border-[#D8D2C4] bg-[#F5F2EA]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="page-container flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group text-left bg-transparent border-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full border-2 border-[#991B1B] flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-3 h-3 rounded-full bg-[#991B1B]" />
            </div>
            <div>
              <span className="font-display font-bold text-[#0F172A] text-lg tracking-tight leading-none block">
                CampusCircle
              </span>
              <span className="font-mono text-[0.55rem] text-[#9CA3AF] uppercase tracking-wider block">
                SIES GST Portal
              </span>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#6B7280] hidden sm:inline">Already registered?</span>
            <button
              onClick={() => navigate('/login')}
              className="btn-secondary text-xs py-1.5 px-4 font-semibold shadow-xs"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="py-12 sm:py-16 page-container flex-1 flex items-center justify-center">
        <div className="w-full max-w-[620px]">

          {/* SUCCESS TICKET CARD */}
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="form-panel p-8 sm:p-10 shadow-xl border-2 border-[#991B1B]/30 relative overflow-hidden"
            >
              {/* Top stamp accent */}
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-[#D8D2C4]">
                <div>
                  <span className="stamp-badge stamp-badge-rotated text-[0.6rem] mb-2 inline-block">
                    SIES GST · VERIFIED MEMBER PASS
                  </span>
                  <h2 className="font-display font-bold text-[#0F172A] text-2xl sm:text-3xl tracking-tight">
                    Welcome to CampusCircle!
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#1A3A2A]/10 border border-[#1A3A2A] flex items-center justify-center shrink-0">
                  <CheckCircle size={26} color="#1A3A2A" weight="fill" />
                </div>
              </div>

              {/* Digital Student Stub */}
              <div className="bg-[#0F172A] text-[#F5F2EA] rounded-sm p-6 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <QrCode size={140} color="#F5F2EA" weight="bold" />
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#991B1B]" />
                    <span className="font-mono text-xs text-[#9CA3AF] uppercase tracking-widest">SIES GST IDENTITY</span>
                  </div>
                  <span className="font-mono text-[0.6rem] bg-[#991B1B] text-white px-2 py-0.5 rounded-xs font-bold uppercase tracking-wider">
                    STUDENT
                  </span>
                </div>

                <p className="font-display font-bold text-xl text-white mb-1">{formData.fullName}</p>
                <p className="font-mono text-xs text-[#9CA3AF] mb-4">{formData.email}</p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 font-mono text-xs">
                  <div>
                    <span className="text-[#9CA3AF] text-[0.6rem] block uppercase">BRANCH</span>
                    <span className="font-bold text-white">
                      {SIES_BRANCHES.find((b) => b.id === formData.branch)?.name || formData.branch}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] text-[0.6rem] block uppercase">ACADEMIC YEAR</span>
                    <span className="font-bold text-white">{formData.year}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FEF2F2] border border-[#991B1B]/20 rounded-sm p-4 mb-6 flex items-start gap-3">
                <ShieldCheck size={20} color="#991B1B" weight="fill" className="shrink-0 mt-0.5" />
                <p className="text-xs text-[#7F1D1D] leading-relaxed">
                  {needsManualLogin ? (
                    <>
                      Your account is ready, but we couldn't sign you in automatically. Sign in with
                      the password you just set to access your profile.
                    </>
                  ) : (
                    <>
                      A verification link has been dispatched to <strong>{formData.email}</strong>. Please confirm your email to activate your full attendance and club privileges.
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate(needsManualLogin ? '/login' : '/profile')}
                  className="btn-primary text-sm py-3 px-6 justify-center font-semibold flex-1"
                >
                  {needsManualLogin ? 'Go to Sign In' : 'Go to My Profile'}
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* FORM CARD */
            <div className="form-panel p-6 sm:p-10 shadow-xl relative">
              {/* Header Info */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="stamp-badge text-[0.6rem] tracking-wider">
                    CLOSED CAMPUS REGISTRATION
                  </span>
                  <span className="font-mono text-xs text-[#9CA3AF] font-bold">
                    STEP 0{step} / 02
                  </span>
                </div>
                <h1 className="font-display font-bold text-[#0F172A] text-2xl sm:text-3xl tracking-tight leading-tight">
                  {step === 1 ? 'Create Your Campus Profile' : 'Secure Your Account'}
                </h1>
                <p className="text-[#6B7280] text-sm mt-1">
                  {step === 1
                    ? 'Enter your academic credentials for verified SIES GST access.'
                    : 'Set up your credentials to manage registrations & community passes.'}
                </p>
              </div>

              {/* TAB PROGRESS INDICATOR */}
              <div className="grid grid-cols-2 gap-2 mb-8 bg-[#E6E1D5] p-1 rounded-sm">
                <button
                  type="button"
                  onClick={() => {
                    if (step === 2) handleBack();
                  }}
                  className={`py-2 px-3 text-xs font-mono font-semibold rounded-xs transition-all flex items-center justify-center gap-2 ${
                    step === 1
                      ? 'bg-[#0F172A] text-[#F5F2EA] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-[#991B1B] text-white flex items-center justify-center text-[0.65rem] font-bold">
                    1
                  </span>
                  <span>01. IDENTITY</span>
                  {step === 2 && <Check size={12} color="#1A3A2A" weight="bold" className="ml-auto" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (step === 1) handleNext();
                  }}
                  disabled={isCheckingEmail}
                  className={`py-2 px-3 text-xs font-mono font-semibold rounded-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                    step === 2
                      ? 'bg-[#0F172A] text-[#F5F2EA] shadow-xs'
                      : 'text-[#6B7280] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-[#991B1B] text-white flex items-center justify-center text-[0.65rem] font-bold">
                    2
                  </span>
                  <span>02. SECURITY</span>
                </button>
              </div>

              {/* ANIMATED FORM BODY */}
              <form onSubmit={handleSubmit} noValidate>
                <AnimatePresence mode="wait" custom={direction}>
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-5"
                    >
                      {/* Full Name */}
                      <div>
                        <label htmlFor="fullName" className="block text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                          Full Name <span className="text-[#991B1B]">*</span>
                        </label>
                        <div className="relative">
                          <User size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="e.g. Aryan Mehta"
                            className={`w-full pl-10 pr-4 py-2.5 bg-[#F5F2EA] border ${
                              errors.fullName ? 'border-[#991B1B]' : 'border-[#D8D2C4]'
                            } rounded-sm text-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] transition-colors`}
                          />
                        </div>
                        {errors.fullName && (
                          <p className="text-xs text-[#991B1B] font-mono mt-1">{errors.fullName}</p>
                        )}
                      </div>

                      {/* College Email */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label htmlFor="email" className="block text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider">
                            College Email Address <span className="text-[#991B1B]">*</span>
                          </label>
                          {isSiesEmail && (
                            <span className="stamp-verified text-[0.55rem] py-0.5 px-1.5">
                              SIES DOMAIN VERIFIED
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <EnvelopeSimple size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="username@siesgst.ac.in or @sies.edu.in"
                            className={`w-full pl-10 pr-4 py-2.5 bg-[#F5F2EA] border ${
                              errors.email ? 'border-[#991B1B]' : 'border-[#D8D2C4]'
                            } rounded-sm text-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] transition-colors`}
                          />
                        </div>
                        {errors.email ? (
                          <p className="text-xs text-[#991B1B] font-mono mt-1">{errors.email}</p>
                        ) : (
                          <p className="text-[0.7rem] text-[#6B7280] font-mono mt-1">
                            Official campus domain ensures closed-network access.
                          </p>
                        )}
                      </div>

                      {/* Branch & Year Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Branch Selection */}
                        <div>
                          <label htmlFor="branch" className="block text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                            Branch / Department
                          </label>
                          <div className="relative">
                            <Buildings size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                              id="branch"
                              name="branch"
                              value={formData.branch}
                              onChange={handleChange}
                              className="w-full pl-10 pr-8 py-2.5 bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm text-sm text-[#0F172A] focus:outline-none focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] appearance-none cursor-pointer"
                            >
                              {SIES_BRANCHES.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                            <CaretRight size={14} color="#9CA3AF" className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                          </div>
                        </div>

                        {/* Year Selection */}
                        <div>
                          <label htmlFor="year" className="block text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                            Academic Year
                          </label>
                          <div className="relative">
                            <GraduationCap size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <select
                              id="year"
                              name="year"
                              value={formData.year}
                              onChange={handleChange}
                              className="w-full pl-10 pr-8 py-2.5 bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm text-sm text-[#0F172A] focus:outline-none focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] appearance-none cursor-pointer"
                            >
                              {ACADEMIC_YEARS.map((y) => (
                                <option key={y.id} value={y.id}>
                                  {y.label}
                                </option>
                              ))}
                            </select>
                            <CaretRight size={14} color="#9CA3AF" className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Roll Number / Student ID (Optional) */}
                      <div>
                        <label htmlFor="rollNumber" className="block text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                          Roll Number <span className="text-[#9CA3AF] font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <IdentificationBadge size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            id="rollNumber"
                            name="rollNumber"
                            value={formData.rollNumber}
                            onChange={handleChange}
                            placeholder="e.g. 121A1042"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm text-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Step 1 CTA */}
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={isCheckingEmail}
                          className="btn-primary w-full py-3 text-sm font-semibold justify-center shadow-md disabled:opacity-75"
                        >
                          {isCheckingEmail ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Checking Availability...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Continue to Security Setup
                              <ArrowRight size={16} weight="bold" />
                            </span>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* STEP 2: SECURITY & CREDENTIALS */
                    <motion.div
                      key="step2"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-5"
                    >
                      {errors.form && (
                        <div className="flex items-start gap-2 p-3 bg-[#FEF2F2] border border-[#991B1B]/30 rounded-sm">
                          <WarningCircle size={16} color="#991B1B" weight="fill" className="shrink-0 mt-0.5" />
                          <p className="text-xs text-[#7F1D1D] font-mono">{errors.form}</p>
                        </div>
                      )}

                      {/* Password */}
                      <div>
                        <label htmlFor="password" className="block text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                          Create Password <span className="text-[#991B1B]">*</span>
                        </label>
                        <div className="relative">
                          <LockKey size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="At least 8 characters"
                            className={`w-full pl-10 pr-10 py-2.5 bg-[#F5F2EA] border ${
                              errors.password ? 'border-[#991B1B]' : 'border-[#D8D2C4]'
                            } rounded-sm text-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] transition-colors`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0F172A]"
                          >
                            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-xs text-[#991B1B] font-mono mt-1">{errors.password}</p>
                        )}

                        {/* Password Strength Meter */}
                        {formData.password && (
                          <div className="mt-2.5 space-y-1">
                            <div className="flex justify-between items-center text-[0.65rem] font-mono">
                              <span className="text-[#6B7280]">STRENGTH</span>
                              <span className="font-bold text-[#0F172A]">{pwdStrength.label}</span>
                            </div>
                            <div className="w-full bg-[#D8D2C4] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${pwdStrength.color}`}
                                style={{ width: `${pwdStrength.score}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider mb-2">
                          Confirm Password <span className="text-[#991B1B]">*</span>
                        </label>
                        <div className="relative">
                          <LockKey size={18} color="#9CA3AF" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                            className={`w-full pl-10 pr-10 py-2.5 bg-[#F5F2EA] border ${
                              errors.confirmPassword ? 'border-[#991B1B]' : 'border-[#D8D2C4]'
                            } rounded-sm text-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#991B1B] focus:ring-1 focus:ring-[#991B1B] transition-colors`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0F172A]"
                          >
                            {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-xs text-[#991B1B] font-mono mt-1">{errors.confirmPassword}</p>
                        )}
                        {formData.confirmPassword && formData.confirmPassword === formData.password && (
                          <p className="text-xs text-[#1A3A2A] font-mono mt-1 flex items-center gap-1">
                            <CheckCircle size={14} color="#1A3A2A" weight="fill" /> Passwords match
                          </p>
                        )}
                      </div>

                      {/* Terms Checkbox */}
                      <div className="pt-2">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            name="agreeTerms"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                            className="mt-1 rounded-xs border-[#D8D2C4] text-[#991B1B] focus:ring-[#991B1B]"
                          />
                          <span className="text-xs text-[#6B7280] leading-relaxed">
                            I agree to the <span className="text-[#0F172A] font-semibold">SIES GST Campus Code of Conduct</span> and acknowledge that my profile information is accessible to verified peers on campus.
                          </span>
                        </label>
                        {errors.agreeTerms && (
                          <p className="text-xs text-[#991B1B] font-mono mt-1">{errors.agreeTerms}</p>
                        )}
                      </div>

                      {/* Buttons Action Row */}
                      <div className="pt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="btn-secondary text-sm py-3 px-5 font-semibold justify-center"
                        >
                          <ArrowLeft size={16} weight="bold" />
                          Back
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary flex-1 py-3 text-sm font-semibold justify-center shadow-md disabled:opacity-75"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Generating Pass...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              Complete Campus Registration
                              <Sparkle size={16} weight="fill" />
                            </span>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* UNIFIED COMPACT FOOTER */}
      <Footer compact />
    </div>
  );
}
