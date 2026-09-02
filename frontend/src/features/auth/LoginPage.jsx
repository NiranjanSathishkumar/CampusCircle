import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/layouts/public/Footer';
import { motion } from 'motion/react';
import {
  EnvelopeSimple,
  LockKey,
  Eye,
  EyeSlash,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  GraduationCap,
  Megaphone,
  Info,
  WarningCircle
} from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/useAuth';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import { useAdminAuth } from '@/shared/auth/useAdminAuth';

const ROLES = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    badge: 'STUDENT ACCESS',
    accentColor: '#1A3A2A', // Forest green
    accentBg: 'rgba(26, 58, 42, 0.08)',
    borderColor: 'border-[#1A3A2A]',
    title: 'Student Portal',
    subtitle: 'Access event passes, community feeds, and peer directory.',
    placeholder: 'student@siesgst.ac.in',
    notice: 'Self-registration is open for all verified campus students.',
    actionHelpText: "Don't have a Student Account? Register here →",
    actionLink: 'signup',
  },
  {
    id: 'organizer',
    label: 'Organiser',
    icon: Megaphone,
    badge: 'CLUB ORGANISER',
    accentColor: '#991B1B', // Crimson
    accentBg: 'rgba(153, 27, 27, 0.08)',
    borderColor: 'border-[#991B1B]',
    title: 'Organiser Portal',
    subtitle: 'Manage club events, QR attendance, and member analytics.',
    placeholder: 'organiser.gdsc@siesgst.ac.in',
    notice: 'Organiser accounts are created by College Administration.',
    actionHelpText: 'Need organiser access? Contact Admin Office →',
    actionLink: 'contact',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: ShieldCheck,
    badge: 'INSTITUTION ADMIN',
    accentColor: '#0F172A', // Dark Navy
    accentBg: 'rgba(15, 23, 42, 0.08)',
    borderColor: 'border-[#0F172A]',
    title: 'Admin Console',
    subtitle: 'Oversee institution settings, club approvals, and security.',
    placeholder: 'admin.office@siesgst.ac.in',
    notice: 'Admin credentials are provisioned in database security tables.',
    actionHelpText: 'Protected System · Single Sign-On Active',
    actionLink: 'none',
  },
];

export default function LoginPage({ initialRole = 'student' }) {
  const navigate = useNavigate();
  const { login: loginAsStudent } = useAuth();
  const { loginAsOrganizer } = useOrganizerAuth();
  const { loginAsAdmin } = useAdminAuth();
  const [activeRole, setActiveRole] = useState(initialRole);

  useEffect(() => {
    if (initialRole) {
      setActiveRole(initialRole);
    }
  }, [initialRole]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const currentRoleConfig = ROLES.find((r) => r.id === activeRole) || ROLES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email address is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      if (activeRole === 'organizer') {
        await loginAsOrganizer(email.trim(), password);
      } else if (activeRole === 'admin') {
        await loginAsAdmin(email.trim(), password);
      } else {
        await loginAsStudent(email.trim(), password);
      }
      setIsLoggedIn(true);
    } catch (err) {
      setErrors({ form: err.message || 'Login failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EA] ledger-grid flex flex-col justify-between selection:bg-[#991B1B] selection:text-white">
      {/* HEADER BAR */}
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
                SIES GST Portal · RBAC Authentication
              </span>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <span className="text-xs text-[#6B7280] hidden sm:inline">New Student?</span>
            <button
              onClick={() => navigate('/signup')}
              className="btn-primary text-xs py-1.5 px-4 font-semibold shadow-xs"
            >
              Student Signup
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="py-12 sm:py-16 page-container flex-1 flex items-center justify-center">
        {/* FIXED WIDTH CONTAINER */}
        <div className="w-full max-w-[500px]">
          {isLoggedIn ? (
            /* SUCCESS LOGGED-IN PORTAL CARD */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="form-panel p-8 sm:p-10 shadow-xl border border-[#D8D2C4] text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#1A3A2A]/10 border border-[#1A3A2A] flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} color="#1A3A2A" weight="fill" />
              </div>

              <span className="font-mono text-[0.65rem] uppercase tracking-widest px-2.5 py-1 bg-[#0F172A] text-white rounded-xs inline-block mb-3">
                {currentRoleConfig.badge} AUTHENTICATED
              </span>

              <h2 className="font-display font-bold text-2xl text-[#0F172A] mb-1">
                Access Granted
              </h2>
              <p className="text-xs text-[#6B7280] mb-6 font-mono">
                Authenticated as <strong>{email}</strong> ({currentRoleConfig.label} Role)
              </p>

              <div className="p-4 bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm text-left mb-6 font-mono text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">ROLE SCOPE:</span>
                  <span className="font-bold text-[#0F172A] uppercase">{activeRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">INSTITUTION:</span>
                  <span className="font-bold text-[#0F172A]">SIES GST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">PERMISSIONS:</span>
                  <span className="font-bold text-[#1A3A2A]">VERIFIED NON-OVERLAPPING</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (activeRole === 'organizer') {
                    navigate('/organizer/dashboard');
                  } else if (activeRole === 'admin') {
                    navigate('/admin/dashboard');
                  } else {
                    navigate('/discover');
                  }
                }}
                className="btn-primary text-sm py-3 px-6 w-full justify-center font-semibold"
              >
                Launch {currentRoleConfig.label} Workspace
                <ArrowRight size={16} weight="bold" />
              </button>
            </motion.div>
          ) : (
            /* REDESIGNED PREMIUM LOGIN CARD (Zero Role Switcher Tabs) */
            <div className="bg-[#FAF8F5] border border-[#D8D2C4] shadow-2xl rounded-md p-7 sm:p-9 relative overflow-hidden transition-all">
              {/* Top Accent Line matching Role */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-300"
                style={{ backgroundColor: currentRoleConfig.accentColor }}
              />

              {/* ROLE HEADER INFO */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="stamp-badge text-[0.6rem] py-0.5 px-2 tracking-widest font-mono uppercase font-bold"
                    style={{
                      color: currentRoleConfig.accentColor,
                      borderColor: currentRoleConfig.accentColor,
                      backgroundColor: currentRoleConfig.accentBg,
                    }}
                  >
                    {currentRoleConfig.badge}
                  </span>
                  <span className="font-mono text-[0.65rem] text-[#9CA3AF] uppercase font-bold tracking-wider">
                    SIES GST AUTH
                  </span>
                </div>

                <h1 className="font-display font-bold text-[#0F172A] text-2xl tracking-tight mb-1">
                  {currentRoleConfig.title}
                </h1>
                <p className="text-[#64748B] text-xs leading-relaxed">
                  {currentRoleConfig.subtitle}
                </p>
              </div>

              {/* LOGIN FORM */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {errors.form && (
                  <div className="flex items-start gap-2 p-3 bg-[#FEF2F2] border border-[#991B1B]/30 rounded-sm">
                    <WarningCircle size={16} color="#991B1B" weight="fill" className="shrink-0 mt-0.5" />
                    <p className="text-xs text-[#7F1D1D] font-mono">{errors.form}</p>
                  </div>
                )}

                {/* Email Input */}
                <div>
                  <label htmlFor="login-email" className="block text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                    {activeRole === 'student' ? 'Student Email' : activeRole === 'organizer' ? 'Organiser Email' : 'Admin Email'} <span className="text-[#991B1B]">*</span>
                  </label>
                  <div className="relative">
                    <EnvelopeSimple size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type="email"
                      id="login-email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                      }}
                      placeholder={currentRoleConfig.placeholder}
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
                        errors.email ? 'border-[#991B1B]' : 'border-[#CBD5E1]'
                      } rounded-sm text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-[#991B1B] font-mono mt-1">{errors.email}</p>}
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="login-pwd" className="block text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider">
                      Password <span className="text-[#991B1B]">*</span>
                    </label>
                    <a href="#reset" className="text-[0.6875rem] font-mono text-[#991B1B] hover:underline font-semibold">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <LockKey size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-pwd"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 bg-white border ${
                        errors.password ? 'border-[#991B1B]' : 'border-[#CBD5E1]'
                      } rounded-sm text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors p-1"
                    >
                      {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-[#991B1B] font-mono mt-1">{errors.password}</p>}
                </div>

                {/* Remember Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="rounded-xs border-[#CBD5E1] text-[#0F172A] focus:ring-[#0F172A]"
                    />
                    <span className="text-xs text-[#64748B] font-medium">Keep session active</span>
                  </label>
                </div>

                {/* Submit Button matching Role Color Accent */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: currentRoleConfig.accentColor }}
                    className="w-full py-3 text-sm font-semibold text-white rounded-sm shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2 font-mono text-xs">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        AUTHENTICATING...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In as {currentRoleConfig.label}
                        <ArrowRight size={16} weight="bold" />
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* ROLE NOTICE BOX */}
              <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center">
                <div className="w-full p-3.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-sm flex items-start gap-2.5">
                  <Info size={18} className="text-[#64748B] shrink-0 mt-0.5" />
                  <div className="text-[0.7rem] text-[#64748B] leading-tight flex-1">
                    <p className="font-semibold text-[#0F172A] mb-0.5 font-mono uppercase tracking-wider">INSTITUTION NOTE</p>
                    <p className="truncate">{currentRoleConfig.notice}</p>
                    {currentRoleConfig.actionLink === 'signup' ? (
                      <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="text-[#991B1B] font-semibold underline mt-1 block hover:text-[#7F1D1D] truncate cursor-pointer"
                      >
                        {currentRoleConfig.actionHelpText}
                      </button>
                    ) : (
                      <span className="text-[#94A3B8] font-mono mt-1 block truncate">
                        {currentRoleConfig.actionHelpText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* UNIFIED COMPACT FOOTER */}
      <Footer compact />
    </div>
  );
}
