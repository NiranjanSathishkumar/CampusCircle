import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Plus,
  Trash,
  CheckCircle,
  Warning,
  Eye,
  CalendarBlank,
  MapPin,
  Ticket,
  UsersThree,
  CurrencyInr,
  ShieldCheck,
  Sparkle,
  Image as ImageIcon,
  Clock,
  Tag,
  FileText,
  ListBullets,
  RadioButton,
  CheckSquare,
  Link as LinkIcon,
  CaretRight,
  FloppyDisk,
  RocketLaunch,
  Info,
  Check,
  X,
  Buildings,
  Phone,
  Envelope,
  User,
  ArrowsClockwise,
  ArrowUp,
  ArrowDown,
  TextAlignLeft,
  TextT,
  QrCode,
  Globe,
  DeviceMobile,
  Laptop,
  CircleNotch,
} from '@phosphor-icons/react';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import { createEvent as createEventApi, deleteEvent, getEvent, updateEvent as updateEventApi, uploadEventBanner } from '@/portal/organizer/events/events.api';
import EmptyState from '@/layouts/portal/components/EmptyState';
import '@/layouts/portal/portal-widgets.css';
import './org-events.css';
import { CAMPUS_VENUES, CATEGORIES } from '@/portal/organizer/events/createEventConstants';
import { STARTER_TEMPLATES } from '@/portal/organizer/events/createEventTemplates';
import AgendaStep from '@/portal/organizer/events/steps/AgendaStep';
import CapacityStep from '@/portal/organizer/events/steps/CapacityStep';
import IdentityStep from '@/portal/organizer/events/steps/IdentityStep';
import QuestionsStep from '@/portal/organizer/events/steps/QuestionsStep';
import ScheduleStep, { formatEventDate } from '@/portal/organizer/events/steps/ScheduleStep';

// Default: 4 weeks out at 10:00 AM, as a datetime-local value string.
function defaultEventDate() {
  const d = new Date();
  d.setDate(d.getDate() + 28);
  d.setHours(10, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function OrganizerCreateEventPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const isEditMode = Boolean(eventId);
  const [searchParams] = useSearchParams();
  const { community } = useOrganizerAuth();
  const communityName = community?.name || 'GDSC SIES GST';
  const backTarget = isEditMode ? `/organizer/events/${eventId}` : '/organizer/events';

  const [isLoadingEvent, setIsLoadingEvent] = useState(isEditMode);
  const [loadError, setLoadError] = useState('');

  // Active step / tab in the creation studio:
  // 'identity' | 'schedule' | 'capacity' | 'agenda' | 'questions'
  const [activeStep, setActiveStep] = useState('identity');

  // Preview panel mode: 'ticket' | 'feed' | 'checklist'
  const [previewTab, setPreviewTab] = useState('ticket');

  // Discard modal confirmation
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  // "Discard" (below) only abandons unsaved form edits — it never touches the
  // saved event. This is the actual delete-from-the-backend action, only
  // meaningful once there's a real saved event to delete (edit mode).
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showValidationToast, setShowValidationToast] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Core Event Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState('Workshop');
  const [eventDate, setEventDate] = useState(defaultEventDate);
  const [venue, setVenue] = useState('Computer Lab 1 (Cloud & AI)');
  const [isCustomVenue, setIsCustomVenue] = useState(false);
  const [customVenueName, setCustomVenueName] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [virtualLink, setVirtualLink] = useState('');

  // Banner is a real uploaded file — bannerPreviewUrl is a local object URL
  // for the live preview until PUT /:eventId/banner confirms it in Cloudinary.
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(null);
  const [tags, setTags] = useState(['workshop', 'hands-on', 'technology']);
  const [newTagInput, setNewTagInput] = useState('');

  const [teamFormat, setTeamFormat] = useState('Solo'); // 'Solo' | 'Team'
  const [teamMin, setTeamMin] = useState(2);
  const [teamMax, setTeamMax] = useState(4);
  const [capacity, setCapacity] = useState(60);
  const [allowWaitlist, setAllowWaitlist] = useState(true);

  const [payment, setPayment] = useState('Free'); // 'Free' | 'Paid'
  const [priceAmount, setPriceAmount] = useState(99);

  const [description, setDescription] = useState(
    'Join GDSC SIES GST for an intensive hands-on workshop designed to boost your practical development skills.\n\nOpen to all branches and years. Bring your laptops with required prerequisites configured.'
  );

  // Agenda list
  const [agenda, setAgenda] = useState([
    { phase: '09:30 AM — Phase 1', title: 'Reporting & Door QR Pass Scan', desc: 'Check-in at venue entrance.' },
    { phase: '10:30 AM — Phase 2', title: 'Main Guided Workshop / Build Session', desc: 'Hands-on live session with mentor guidance.' },
    { phase: '02:00 PM — Phase 3', title: 'Project Demos & Certificate Distribution', desc: 'Showcase projects and Q&A.' },
  ]);

  // Rules list
  const [rules, setRules] = useState([
    'Valid SIES GST Student ID card mandatory at entry desk.',
    'Personal laptop required for hands-on sessions.',
    'Follow campus code of conduct and maintain lab cleanliness.',
  ]);
  const [newRuleInput, setNewRuleInput] = useState('');

  // Support Contact info
  const [contact, setContact] = useState({
    leadName: 'Aarav Sharma',
    leadRole: 'Lead Organiser, GDSC SIES GST',
    email: 'gdsc.siesgst@campuscircle.app',
    phone: '+91 98201 12345',
    deskLocation: 'Tech Lab 1 Foyer, Ground Floor',
    building: 'Block B',
    room: 'Lab 1',
    floor: '1st',
    emailSLA: 'Replies within 2 hours',
    operatingHours: '10 AM – 5 PM',
  });

  // FAQs list
  const [faqs, setFaqs] = useState([
    { q: 'Who is eligible to attend?', a: 'Open to all enrolled undergraduate students across FE, SE, TE, and BE departments at SIES GST.' },
    { q: 'Will I receive an official attendance certificate?', a: 'Yes! Verified certificates are generated for all students upon venue QR check-in.' },
  ]);

  // Custom Form Questions
  const [customQuestions, setCustomQuestions] = useState([
    {
      id: 'q_1',
      type: 'select',
      label: 'Prior Skill Level with Topic',
      placeholder: 'Select proficiency',
      required: true,
      options: ['Beginner (Zero prior experience)', 'Intermediate (Know basics)', 'Advanced (Built projects)'],
    },
    {
      id: 'q_2',
      type: 'text',
      label: 'GitHub Profile or Portfolio URL',
      placeholder: 'https://github.com/your-username',
      required: false,
      options: [],
    },
  ]);

  const [requireWaiver, setRequireWaiver] = useState(true);
  const [waiverText, setWaiverText] = useState(
    'I confirm that I will follow the event guidelines, bring my official SIES GST Student ID card, and maintain venue decorum.'
  );

  // Edit mode: load the real event and replace every field's starter-demo
  // default with its actual saved value (empty arrays/blank contact stay
  // empty rather than showing the create-flow's example content).
  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;
    setIsLoadingEvent(true);
    setLoadError('');
    getEvent(eventId)
      .then(({ event }) => {
        if (cancelled) return;
        setTitle(event.title || '');
        setCategory(event.category || 'Workshop');
        setDescription(event.description || '');

        const d = new Date(event.eventDate);
        const pad = (n) => String(n).padStart(2, '0');
        setEventDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);

        const knownVenue = CAMPUS_VENUES.find((v) => v.name === event.venue);
        setIsVirtual(false);
        setVirtualLink('');
        if (knownVenue) {
          setVenue(knownVenue.name);
          setIsCustomVenue(false);
          setCustomVenueName('');
        } else {
          setIsCustomVenue(true);
          setCustomVenueName(event.venue || '');
        }

        setBannerFile(null);
        setBannerPreviewUrl(event.bannerImage?.url || null);

        setTags(event.tags || []);

        const isTeam = event.registrationType === 'team';
        setTeamFormat(isTeam ? 'Team' : 'Solo');
        setTeamMin(event.teamSize?.min || 2);
        setTeamMax(event.teamSize?.max || 4);
        setCapacity(event.capacity || 1);
        setAllowWaitlist(Boolean(event.allowWaitlist));

        setPayment(event.price > 0 ? 'Paid' : 'Free');
        setPriceAmount(event.price || 0);

        setAgenda(event.agenda || []);
        setRules(event.rules || []);
        setContact(event.contact || {
          leadName: '', leadRole: '', email: '', phone: '',
          deskLocation: '', building: '', room: '', floor: '', emailSLA: '', operatingHours: '',
        });
        setFaqs(event.faqs || []);

        setCustomQuestions(
          (event.formQuestions || []).map((q) => ({
            id: q._id,
            type: q.type,
            label: q.label,
            placeholder: q.placeholder || '',
            helpText: q.helpText || '',
            required: Boolean(q.required),
            options: q.options || [],
          }))
        );

        setRequireWaiver(Boolean(event.requireWaiver));
        setWaiverText(event.waiverText || '');
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || 'Failed to load this event.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingEvent(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, isEditMode]);

  // Apply Template
  const handleApplyTemplate = (tpl) => {
    setTitle(tpl.title);
    setTagline(tpl.tagline || '');
    setCategory(tpl.category);
    setTeamFormat(tpl.teamFormat);
    setTeamMin(tpl.teamMin || 2);
    setTeamMax(tpl.teamMax || 4);
    setCapacity(tpl.capacity);
    setPayment(tpl.payment);
    setPriceAmount(tpl.priceAmount || 0);
    setVenue(tpl.venue);
    setTags(tpl.tags || []);
    setDescription(tpl.description || '');
    if (tpl.agenda) setAgenda(tpl.agenda);
    if (tpl.rules) setRules(tpl.rules);
    if (tpl.faqs) setFaqs(tpl.faqs);
    if (tpl.customQuestions) setCustomQuestions(tpl.customQuestions);
  };

  // Banner Helpers — a real File, uploaded via PUT /:eventId/banner right
  // after the event itself is created (the route needs a real eventId).
  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleRemoveBanner = () => {
    setBannerPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    setBannerFile(null);
  };

  // An empty-dep cleanup captures the FIRST bannerPreviewUrl (null), so every
  // object URL created during the session leaked. Track the live one in a ref
  // that the cleanup can actually read.
  const bannerPreviewUrlRef = useRef(null);
  useEffect(() => { bannerPreviewUrlRef.current = bannerPreviewUrl; }, [bannerPreviewUrl]);
  useEffect(() => () => {
    const url = bannerPreviewUrlRef.current;
    // Only blob: urls come from createObjectURL; an existing banner's https
    // url must not be passed to revokeObjectURL.
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
  }, []);

  // FAQ Helpers
  const handleAddFaq = () => {
    setFaqs([...faqs, { q: '', a: '' }]);
  };

  const handleUpdateFaq = (index, field, value) => {
    const next = [...faqs];
    next[index] = { ...next[index], [field]: value };
    setFaqs(next);
  };

  const handleRemoveFaq = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // Tag Helpers
  const handleAddTag = () => {
    const trimmed = newTagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tToRemove) => {
    setTags(tags.filter((t) => t !== tToRemove));
  };

  // Agenda Helpers
  const handleAddAgendaItem = () => {
    setAgenda([
      ...agenda,
      {
        phase: `Phase ${agenda.length + 1}`,
        title: 'New Agenda Checkpoint',
        desc: 'Description of session activities and timings.',
      },
    ]);
  };

  const handleUpdateAgenda = (index, field, value) => {
    // Replace the row rather than mutating it: `[...agenda]` copies the array
    // but not the objects inside it, so `next[index][field] = value` edited the
    // object the current state still points at.
    setAgenda(agenda.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const handleRemoveAgenda = (index) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  const handleMoveAgenda = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === agenda.length - 1) return;
    const next = [...agenda];
    const target = direction === 'up' ? index - 1 : index + 1;
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setAgenda(next);
  };

  // Rule Helpers
  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    setRules([...rules, newRuleInput.trim()]);
    setNewRuleInput('');
  };

  const handleRemoveRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // Custom Questions Helpers
  const handleAddQuestion = (type = 'text') => {
    setCustomQuestions([
      ...customQuestions,
      {
        id: `q_${Date.now()}`,
        type,
        label: 'New Question Prompt',
        placeholder: type === 'url' ? 'https://...' : 'Enter your response',
        required: false,
        options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2'] : [],
      },
    ]);
  };

  const handleUpdateQuestion = (index, field, val) => {
    setCustomQuestions(customQuestions.map((q, i) => (i === index ? { ...q, [field]: val } : q)));
  };

  const handleAddOption = (qIndex) => {
    setCustomQuestions(customQuestions.map((q, i) => {
      if (i !== qIndex) return q;
      const options = q.options || [];
      return { ...q, options: [...options, `Option ${options.length + 1}`] };
    }));
  };

  const handleUpdateOption = (qIndex, optIndex, val) => {
    setCustomQuestions(customQuestions.map((q, i) => (
      i === qIndex ? { ...q, options: (q.options || []).map((o, j) => (j === optIndex ? val : o)) } : q
    )));
  };

  const handleRemoveOption = (qIndex, optIndex) => {
    setCustomQuestions(customQuestions.map((q, i) => (
      i === qIndex ? { ...q, options: (q.options || []).filter((_, j) => j !== optIndex) } : q
    )));
  };

  const handleRemoveQuestion = (index) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  // Validation Checks
  const validation = useMemo(() => {
    const hasTitle = Boolean(title.trim());
    const hasDate = Boolean(eventDate) && !isNaN(new Date(eventDate).getTime());
    const finalVenue = isCustomVenue ? customVenueName.trim() : venue.trim();
    const hasVenue = isVirtual ? Boolean(virtualLink.trim()) : Boolean(finalVenue);
    const hasCapacity = capacity > 0;
    const isTeamValid = teamFormat === 'Solo' || (teamMin > 0 && teamMin <= teamMax);
    const hasDescription = Boolean(description.trim());

    const items = [
      { label: 'Event Title provided', valid: hasTitle },
      { label: 'Date & Start Time specified', valid: hasDate },
      { label: isVirtual ? 'Virtual Meeting Link specified' : 'Campus Venue selected', valid: hasVenue },
      { label: 'Seating Capacity defined (> 0)', valid: hasCapacity },
      { label: 'Team Size Range valid (Min ≤ Max)', valid: isTeamValid },
      { label: 'Event Description provided', valid: hasDescription },
    ];

    const completed = items.filter((i) => i.valid).length;
    const score = Math.round((completed / items.length) * 100);
    const canPublish = hasTitle && hasDate && hasVenue && hasCapacity && isTeamValid;

    return { items, score, canPublish };
  }, [
    title,
    eventDate,
    isCustomVenue,
    customVenueName,
    venue,
    isVirtual,
    virtualLink,
    capacity,
    teamFormat,
    teamMin,
    teamMax,
    description,
  ]);

  // Save / Publish Action
  const handleSaveEvent = async (status = 'published') => {
    if (!validation.canPublish && status === 'published') {
      setShowValidationToast(true);
      setTimeout(() => setShowValidationToast(false), 4000);
      return;
    }

    setSubmitError('');
    if (status === 'published') setIsPublishing(true);
    else setIsSavingDraft(true);

    const finalVenue = isVirtual
      ? `Virtual / Online (${virtualLink.trim() || 'Link provided upon RSVP'})`
      : isCustomVenue
      ? customVenueName.trim() || 'Campus Venue'
      : venue;

    const registrationType = teamFormat === 'Team' ? 'team' : 'solo';

    const payload = {
      title: title.trim() || 'Untitled Campus Event',
      category,
      description: description.trim(),
      venue: finalVenue,
      eventDate: new Date(eventDate).toISOString(),
      capacity: Number(capacity) || 1,
      price: payment === 'Paid' ? Number(priceAmount) : 0,
      registrationType,
      tags,
      allowWaitlist,
      requireWaiver,
      collectProfileData: true,
      contact,
      agenda,
      rules,
      faqs,
      formQuestions: customQuestions.map(({ id, ...rest }) => rest),
      status,
    };
    if (registrationType === 'team') {
      payload.teamSize = { min: Number(teamMin), max: Number(teamMax) };
    }
    if (requireWaiver) {
      payload.waiverText = waiverText.trim();
    }

    let savedEventId;
    try {
      savedEventId = isEditMode
        ? (await updateEventApi(eventId, payload)).event._id
        : (await createEventApi(payload)).event._id;
    } catch (err) {
      setSubmitError(err.message || 'Failed to save the event. Please try again.');
      setIsPublishing(false);
      setIsSavingDraft(false);
      return;
    }

    // The banner is a separate PUT that needs the saved event's id, so it can
    // only fail AFTER the event exists. Treating that failure as a failed save
    // (the old single try/catch) sent organizers back to retry the whole form
    // and create a duplicate event — report it against the saved event and
    // carry on to it instead.
    let bannerError = '';
    if (bannerFile) {
      try {
        await uploadEventBanner(savedEventId, bannerFile);
      } catch (err) {
        bannerError = err.message || 'the banner image could not be uploaded';
      }
    }

    setIsPublishing(false);
    setIsSavingDraft(false);

    if (bannerError) {
      setSubmitError(`Event saved, but ${bannerError}. Add the banner from the event's edit page.`);
      return;
    }

    navigate(isEditMode ? `/organizer/events/${savedEventId}` : '/organizer/events');
  };

  // Soft-delete (isActive: false) the actual saved event — distinct from
  // "Discard" above, which only abandons unsaved edits to the form.
  const handleConfirmDeleteEvent = async () => {
    if (deletingEvent) return;
    setDeletingEvent(true);
    try {
      await deleteEvent(eventId);
      navigate('/organizer/events');
    } catch (err) {
      setSubmitError(err.message || 'Failed to delete this event');
      setDeletingEvent(false);
      setShowDeleteEventModal(false);
    }
  };

  if (isEditMode && isLoadingEvent) {
    return (
      <div className="org-page">
        <EmptyState icon={Sparkle} title="Loading event…" desc="Fetching the current listing to edit." />
      </div>
    );
  }

  if (isEditMode && loadError) {
    return (
      <div className="org-page">
        <EmptyState
          title="Couldn't load this event"
          desc={loadError}
          action={
            <button className="org-btn org-btn-primary" onClick={() => navigate('/organizer/events')}>
              Back to Events Hub
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="org-page org-create-event-page">
      {/* ── Top Navigation & Breadcrumb ── */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <button
          type="button"
          className="org-back-link !mb-0"
          onClick={() => {
            if (title.trim() || description.trim()) {
              setShowDiscardModal(true);
            } else {
              navigate(backTarget);
            }
          }}
        >
          <ArrowLeft size={14} />
          <span>{isEditMode ? 'Back to Event Hub' : 'Back to Events Hub'}</span>
        </button>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <button
              type="button"
              className="org-btn org-btn-ghost text-xs"
              style={{ color: '#991B1B' }}
              onClick={() => setShowDeleteEventModal(true)}
              title="Delete this event entirely"
            >
              <Trash size={14} /> Delete Event
            </button>
          )}
          <span className="org-badge !bg-[#FAF8F5] !border-[#D8D2C4] !text-gray-700 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1.5 animate-pulse" />
            Studio Draft Mode
          </span>
          <div className="flex items-center gap-1.5 bg-white border border-[#D8D2C4] px-2.5 py-1 rounded-full text-xs font-mono">
            <span className="text-gray-500">Readiness:</span>
            <strong
              className={`font-bold ${
                validation.score >= 80 ? 'text-emerald-700' : validation.score >= 50 ? 'text-amber-700' : 'text-red-700'
              }`}
            >
              {validation.score}%
            </strong>
          </div>
        </div>
      </div>

      {/* ── Studio Header ── */}
      <div className="org-page-header !mb-4">
        <div>
          <p className="org-page-eyebrow">
            <Sparkle size={13} className="inline mr-1 text-[#991B1B]" />
            {isEditMode ? 'Event Editing Studio' : 'Event Creation Studio'}
          </p>
          <h1 className="org-page-title">{isEditMode ? 'Edit Campus Event' : 'Create New Campus Event'}</h1>
          <p className="org-page-desc">
            Design your event listing, schedule, capacity tiers, interactive agenda timeline, and custom student registration forms in one unified studio.
          </p>
        </div>
      </div>

      {/* ── Starter Template Quick-Select Bar (create mode only — applying a
           template while editing a real event would silently overwrite it) ── */}
      {!isEditMode && (
      <section className="mb-6 bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-xs font-['Space_Grotesk'] font-bold text-[#0F172A] uppercase tracking-wider">
            <Sparkle size={14} className="text-[#991B1B]" />
            <span>One-Click Starter Templates</span>
          </div>
          <span className="text-[11px] text-gray-500 font-mono">
            Click any template to auto-populate best-practice event blueprints
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STARTER_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              className="flex flex-col items-center justify-center text-center p-2.5 rounded-lg border border-[#D8D2C4] bg-white hover:border-[#991B1B] hover:shadow-md transition-all group"
              onClick={() => handleApplyTemplate(tpl)}
            >
              <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{tpl.icon}</span>
              <span className="text-xs font-bold text-[#0F172A] font-['Space_Grotesk'] leading-tight group-hover:text-[#991B1B]">
                {tpl.name}
              </span>
              <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                {tpl.teamFormat} · {tpl.capacity} seats
              </span>
            </button>
          ))}
        </div>
      </section>
      )}

      {/* ── Main Studio Grid (2-Column Studio + Sticky Live Preview) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Column: Step Navigation + Studio Form (7 cols) ── */}
        <div className="lg:col-span-7 space-y-5">
          {/* Step / Section Navigation Tabs */}
          <div className="org-create-steps-nav flex items-center gap-1 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#D8D2C4] overflow-x-auto scrollbar-none">
            {[
              { id: 'identity', label: '1. Identity & Art', icon: ImageIcon },
              { id: 'schedule', label: '2. Schedule & Venue', icon: CalendarBlank },
              { id: 'capacity', label: '3. Capacity & Pass', icon: Ticket },
              { id: 'agenda', label: '4. Agenda & Rules', icon: ListBullets },
              { id: 'questions', label: '5. RSVP Questions', icon: FileText },
            ].map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-sm font-bold'
                      : 'text-gray-600 hover:text-[#0F172A] hover:bg-white/70'
                  }`}
                  onClick={() => setActiveStep(step.id)}
                >
                  <Icon size={14} className={isActive ? 'text-[#FAF8F5]' : 'text-gray-500'} />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Step 1: Identity & Visual Art ── */}
          {activeStep === 'identity' && (
            <IdentityStep
              bannerPreviewUrl={bannerPreviewUrl}
              category={category}
              description={description}
              handleAddTag={handleAddTag}
              handleBannerFileChange={handleBannerFileChange}
              handleRemoveBanner={handleRemoveBanner}
              handleRemoveTag={handleRemoveTag}
              newTagInput={newTagInput}
              setActiveStep={setActiveStep}
              setCategory={setCategory}
              setDescription={setDescription}
              setNewTagInput={setNewTagInput}
              setTagline={setTagline}
              setTitle={setTitle}
              tagline={tagline}
              tags={tags}
              title={title}
            />
          )}

          {/* ── Step 2: Schedule & Venue ── */}
          {activeStep === 'schedule' && (
            <ScheduleStep
              customVenueName={customVenueName}
              eventDate={eventDate}
              isCustomVenue={isCustomVenue}
              isVirtual={isVirtual}
              setActiveStep={setActiveStep}
              setCustomVenueName={setCustomVenueName}
              setEventDate={setEventDate}
              setIsCustomVenue={setIsCustomVenue}
              setIsVirtual={setIsVirtual}
              setVenue={setVenue}
              setVirtualLink={setVirtualLink}
              title={title}
              venue={venue}
              virtualLink={virtualLink}
            />
          )}

          {/* ── Step 3: Capacity & Pricing ── */}
          {activeStep === 'capacity' && (
            <CapacityStep
              allowWaitlist={allowWaitlist}
              capacity={capacity}
              payment={payment}
              priceAmount={priceAmount}
              setActiveStep={setActiveStep}
              setAllowWaitlist={setAllowWaitlist}
              setCapacity={setCapacity}
              setPayment={setPayment}
              setPriceAmount={setPriceAmount}
              setTeamFormat={setTeamFormat}
              setTeamMax={setTeamMax}
              setTeamMin={setTeamMin}
              teamFormat={teamFormat}
              teamMax={teamMax}
              teamMin={teamMin}
            />
          )}

          {/* ── Step 4: Agenda, Rules & Organizer Support ── */}
          {activeStep === 'agenda' && (
            <AgendaStep
              agenda={agenda}
              contact={contact}
              faqs={faqs}
              handleAddAgendaItem={handleAddAgendaItem}
              handleAddFaq={handleAddFaq}
              handleAddRule={handleAddRule}
              handleMoveAgenda={handleMoveAgenda}
              handleRemoveAgenda={handleRemoveAgenda}
              handleRemoveFaq={handleRemoveFaq}
              handleRemoveRule={handleRemoveRule}
              handleUpdateAgenda={handleUpdateAgenda}
              handleUpdateFaq={handleUpdateFaq}
              newRuleInput={newRuleInput}
              rules={rules}
              setActiveStep={setActiveStep}
              setContact={setContact}
              setNewRuleInput={setNewRuleInput}
              title={title}
            />
          )}

          {/* ── Step 5: Custom Registration Form Questions ── */}
          {activeStep === 'questions' && (
            <QuestionsStep
              customQuestions={customQuestions}
              handleAddOption={handleAddOption}
              handleAddQuestion={handleAddQuestion}
              handleRemoveOption={handleRemoveOption}
              handleRemoveQuestion={handleRemoveQuestion}
              handleSaveEvent={handleSaveEvent}
              handleUpdateOption={handleUpdateOption}
              handleUpdateQuestion={handleUpdateQuestion}
              isPublishing={isPublishing}
              requireWaiver={requireWaiver}
              setActiveStep={setActiveStep}
              setRequireWaiver={setRequireWaiver}
              setWaiverText={setWaiverText}
              title={title}
              waiverText={waiverText}
            />
          )}
        </div>

        {/* ── Right Column: Sticky Real-Time Student Ticket & Showcase Preview (5 cols) ── */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl p-4 shadow-sm">
            {/* Preview Header & View Mode Switcher */}
            <div className="flex items-center justify-between mb-3 border-b border-[#E6E1D5] pb-2.5">
              <div className="flex items-center gap-1.5">
                <Eye size={15} className="text-[#991B1B]" />
                <span className="text-xs font-bold font-['Space_Grotesk'] text-[#0F172A] uppercase tracking-wider">
                  Live Real-Time Preview
                </span>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#D8D2C4]">
                <button
                  type="button"
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                    previewTab === 'ticket' ? 'bg-[#0F172A] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                  onClick={() => setPreviewTab('ticket')}
                >
                  <Ticket size={11} className="inline mr-1" />
                  Ticket Pass
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                    previewTab === 'feed' ? 'bg-[#0F172A] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                  onClick={() => setPreviewTab('feed')}
                >
                  <Laptop size={11} className="inline mr-1" />
                  Card View
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                    previewTab === 'checklist' ? 'bg-[#0F172A] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'
                  }`}
                  onClick={() => setPreviewTab('checklist')}
                >
                  <CheckCircle size={11} className="inline mr-1" />
                  Checklist
                </button>
              </div>
            </div>

            {/* ── Preview Tab 1: Live Student Ticket Pass ── */}
            {previewTab === 'ticket' && (
              <motion.div
                key="prev-ticket"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border-2 border-[#D8D2C4] rounded-2xl overflow-hidden shadow-md relative"
              >
                {/* Top Poster Art Banner */}
                <div className="relative h-32 w-full bg-slate-900 overflow-hidden">
                  {bannerPreviewUrl ? (
                    <img
                      src={bannerPreviewUrl}
                      alt={title || 'Event Cover'}
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-mono">
                      No banner uploaded yet
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/20">
                      {category}
                    </span>
                    <span className="bg-[#991B1B] text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                      {payment === 'Free' ? 'FREE RSVP' : `₹${priceAmount}`}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <h3 className="text-white font-bold font-['Space_Grotesk'] text-sm leading-snug line-clamp-1">
                      {title || 'Untitled Campus Event'}
                    </h3>
                  </div>
                </div>

                {/* Ticket Details Body */}
                <div className="p-4 space-y-3 bg-[#FAF8F5]">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-500 border-b border-[#E6E1D5] pb-2">
                    <span className="flex items-center gap-1 font-bold text-[#1A3A2A]">
                      ⚡ {communityName}
                    </span>
                    <span>PASS: CC-TICKET-PREVIEW</span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <CalendarBlank size={14} className="text-[#991B1B] flex-shrink-0" />
                      <span className="font-medium font-mono">{formatEventDate(eventDate) || 'Date TBD'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#991B1B] flex-shrink-0" />
                      <span className="font-medium truncate">
                        {isVirtual ? `Online · ${virtualLink || 'Link upon RSVP'}` : isCustomVenue ? customVenueName || 'Campus Venue' : venue}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <UsersThree size={14} className="text-[#991B1B] flex-shrink-0" />
                      <span className="font-medium">
                        {teamFormat === 'Team' ? `Team Format (${teamMin}–${teamMax} members)` : 'Solo Registration'}
                      </span>
                    </div>
                  </div>

                  {tagline && (
                    <p className="text-[11px] text-gray-600 italic bg-white p-2 rounded border border-[#E6E1D5]">
                      "{tagline}"
                    </p>
                  )}

                  {/* QR Pass Placeholder */}
                  <div className="pt-2 border-t-2 border-dashed border-[#D8D2C4] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-white border border-[#D8D2C4] rounded flex items-center justify-center text-[#0F172A]">
                        <QrCode size={26} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-gray-400 block uppercase">Door Access</span>
                        <span className="text-[11px] font-bold text-gray-800 font-mono">Scan at Venue Desk</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      Capacity: 0 / {capacity}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Preview Tab 2: Discovery Feed Card ── */}
            {previewTab === 'feed' && (
              <motion.div
                key="prev-feed"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-[#D8D2C4] rounded-xl overflow-hidden shadow-sm"
              >
                <div className="h-28 bg-slate-800 relative">
                  {bannerPreviewUrl && (
                    <img src={bannerPreviewUrl} alt="" className="w-full h-full object-cover opacity-90" />
                  )}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                      {category}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span className="bg-[#1A3A2A] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {payment === 'Free' ? 'Free' : `₹${priceAmount}`}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 space-y-2">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
                    {communityName}
                  </span>
                  <h4 className="font-['Space_Grotesk'] font-bold text-sm text-[#0F172A] leading-snug">
                    {title || 'Untitled Campus Event'}
                  </h4>
                  <div className="text-[11px] text-gray-600 space-y-1 font-mono">
                    <div className="flex items-center gap-1.5">
                      <CalendarBlank size={12} className="text-[#991B1B]" />
                      <span>{formatEventDate(eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#991B1B]" />
                      <span className="truncate">{venue}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#E6E1D5] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-gray-500">0 of {capacity} registered</span>
                    <span className="font-bold text-[#991B1B] hover:underline cursor-pointer">
                      View Details →
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Preview Tab 3: Pre-Flight Launch Checklist ── */}
            {previewTab === 'checklist' && (
              <motion.div
                key="prev-checklist"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-[#D8D2C4] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-2">
                  <span className="text-xs font-bold font-['Space_Grotesk'] text-[#0F172A]">
                    Pre-Flight Publishing Readiness
                  </span>
                  <span className="text-xs font-mono font-bold text-[#991B1B]">
                    {validation.score}% Complete
                  </span>
                </div>

                <div className="space-y-2">
                  {validation.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {item.valid ? (
                        <CheckCircle size={15} weight="fill" className="text-emerald-600 flex-shrink-0" />
                      ) : (
                        <Warning size={15} weight="fill" className="text-amber-500 flex-shrink-0" />
                      )}
                      <span className={item.valid ? 'text-gray-800' : 'text-gray-500 font-medium'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#E6E1D5] text-[11px] text-gray-500 font-mono">
                  {validation.canPublish
                    ? '✨ Ready to launch! Click Publish to open RSVPs immediately.'
                    : '⚠️ Complete all required fields above before publishing.'}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky Studio Bottom Action Bar ── */}
      <div className="org-create-sticky-action-bar">
        <div className="org-create-sticky-action-bar-inner">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="org-btn org-btn-ghost text-xs text-gray-600 hover:text-red-700"
              onClick={() => {
                if (title.trim() || description.trim()) setShowDiscardModal(true);
                else navigate(backTarget);
              }}
            >
              <Trash size={14} />
              <span>Discard</span>
            </button>

            {!validation.canPublish && showValidationToast && (
              <span className="text-xs text-red-600 font-mono flex items-center gap-1 animate-pulse">
                <Warning size={14} /> Please fill in Event Title, Date, and Venue before publishing.
              </span>
            )}

            {submitError && (
              <span className="text-xs text-red-600 font-mono flex items-center gap-1">
                <Warning size={14} /> {submitError}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="org-btn org-btn-secondary text-xs"
              onClick={() => handleSaveEvent('draft')}
              disabled={isSavingDraft || isPublishing}
            >
              <FloppyDisk size={14} />
              <span>{isSavingDraft ? 'Saving Draft…' : 'Save as Draft'}</span>
            </button>

            <button
              type="button"
              className="org-btn org-btn-primary text-xs shadow-md shadow-[#991B1B]/20"
              onClick={() => handleSaveEvent('published')}
              disabled={isPublishing || isSavingDraft}
            >
              <RocketLaunch size={14} />
              <span>{isPublishing ? 'Publishing Event…' : 'Publish Event Listing'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Discard Confirmation Modal ── */}
      {showDiscardModal && (
        <div
          className="org-modal-overlay"
          style={{ zIndex: 1200 }}
          onClick={(e) => e.target === e.currentTarget && setShowDiscardModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="org-modal"
            style={{ maxWidth: 420 }}
          >
            <div className="org-modal-header">
              <div className="flex items-center gap-2 text-amber-700">
                <Warning size={20} weight="bold" />
                <h2 className="org-modal-title text-amber-900">Discard Event Draft?</h2>
              </div>
              <button
                className="org-icon-btn"
                onClick={() => setShowDiscardModal(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="org-modal-body">
              <p className="text-xs text-gray-600 leading-relaxed font-['Plus_Jakarta_Sans']">
                You have configured event details in the studio. Discarding will lose all unsaved inputs. Are you sure you want to exit?
              </p>
            </div>
            <div className="org-modal-footer">
              <button
                type="button"
                className="org-btn org-btn-ghost"
                onClick={() => setShowDiscardModal(false)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className="org-btn org-btn-danger-solid"
                onClick={() => {
                  setShowDiscardModal(false);
                  navigate(backTarget);
                }}
              >
                Discard &amp; Exit
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Delete Event Confirmation Modal ── */}
      {showDeleteEventModal && (
        <div
          className="org-modal-overlay"
          style={{ zIndex: 1200 }}
          onClick={(e) => e.target === e.currentTarget && !deletingEvent && setShowDeleteEventModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="org-modal"
            style={{ maxWidth: 420 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-event-studio-title"
          >
            <div className="org-modal-header">
              <div className="flex items-center gap-2 text-[#991B1B]">
                <Trash size={20} weight="bold" />
                <h2 className="org-modal-title" id="delete-event-studio-title">Delete This Event?</h2>
              </div>
              <button
                className="org-icon-btn"
                onClick={() => !deletingEvent && setShowDeleteEventModal(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="org-modal-body">
              <p className="text-xs text-gray-600 leading-relaxed font-['Plus_Jakarta_Sans']">
                Delete <strong>"{title || 'this event'}"</strong>? It will stop showing up to students immediately.
                Existing registrations, team rosters, and check-in records are kept — this can't be undone from here.
              </p>
            </div>
            <div className="org-modal-footer">
              <button
                type="button"
                className="org-btn org-btn-ghost"
                onClick={() => setShowDeleteEventModal(false)}
                disabled={deletingEvent}
              >
                Cancel
              </button>
              <button
                type="button"
                className="org-btn org-btn-danger-solid"
                onClick={handleConfirmDeleteEvent}
                disabled={deletingEvent}
              >
                {deletingEvent ? <CircleNotch size={15} className="animate-spin" /> : <Trash size={15} />}
                <span>{deletingEvent ? 'Deleting…' : 'Delete Event'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
