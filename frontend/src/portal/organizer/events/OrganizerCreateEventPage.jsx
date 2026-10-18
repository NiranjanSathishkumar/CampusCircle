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
  CaretDown,
  CaretUp,
  PencilSimple,
} from '@phosphor-icons/react';
import { createEvent as createEventApi, deleteEvent, getEvent, updateEvent as updateEventApi, uploadEventBanner, uploadEventPaymentQr, removeEventPaymentQr } from '@/portal/organizer/events/events.api';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
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
import PreviewStep from '@/portal/organizer/events/steps/PreviewStep';

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
  // 'identity' | 'schedule' | 'capacity' | 'agenda' | 'questions' | 'preview'
  const [activeStep, setActiveStep] = useState('identity');
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateNotification, setTemplateNotification] = useState('');

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
  const [registrationDeadline, setRegistrationDeadline] = useState('');
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
  const [paymentQrFile, setPaymentQrFile] = useState(null);
  const [paymentQrPreviewUrl, setPaymentQrPreviewUrl] = useState(null);
  const [removePaymentQrFlag, setRemovePaymentQrFlag] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState('');

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
      scope: 'member',
      options: ['Beginner (Zero prior experience)', 'Intermediate (Know basics)', 'Advanced (Built projects)'],
    },
    {
      id: 'q_2',
      type: 'text',
      label: 'GitHub Profile or Portfolio URL',
      placeholder: 'https://github.com/your-username',
      required: false,
      scope: 'team',
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

        if (event.registrationDeadline) {
          const rd = new Date(event.registrationDeadline);
          setRegistrationDeadline(`${rd.getFullYear()}-${pad(rd.getMonth() + 1)}-${pad(rd.getDate())}T${pad(rd.getHours())}:${pad(rd.getMinutes())}`);
        } else {
          setRegistrationDeadline('');
        }

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
        setUpiId(event.upiId || '');
        setPaymentInstructions(event.paymentInstructions || '');
        setPaymentQrFile(null);
        setPaymentQrPreviewUrl(event.paymentQrCode?.url || null);
        setRemovePaymentQrFlag(false);

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
            scope: q.scope || (/(team|project|idea|pitch|track|problem|abstract|theme|topic|synopsis|solution|startup|repo|repository|github|deck|presentation|slide|stack)/i.test(q.label || '') ? 'team' : 'member'),
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
    setRegistrationDeadline('');
    setVenue(tpl.venue);
    setTags(tpl.tags || []);
    setDescription(tpl.description || '');
    if (tpl.agenda) setAgenda(tpl.agenda);
    if (tpl.rules) setRules(tpl.rules);
    if (tpl.faqs) setFaqs(tpl.faqs);
    if (tpl.customQuestions) setCustomQuestions(tpl.customQuestions);
    setTemplateNotification(`Applied "${tpl.name}" blueprint.`);
    setTimeout(() => setTemplateNotification(''), 4000);
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

  // Payment QR Helpers
  const handlePaymentQrFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPaymentQrFile(file);
    setRemovePaymentQrFlag(false);
    setPaymentQrPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleRemovePaymentQr = () => {
    setPaymentQrPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return null;
    });
    setPaymentQrFile(null);
    setRemovePaymentQrFlag(true);
  };

  const paymentQrPreviewUrlRef = useRef(null);
  useEffect(() => { paymentQrPreviewUrlRef.current = paymentQrPreviewUrl; }, [paymentQrPreviewUrl]);
  useEffect(() => () => {
    const url = paymentQrPreviewUrlRef.current;
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
        scope: teamFormat === 'Team' && (type === 'url' || type === 'textarea') ? 'team' : 'member',
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
    const isDeadlineValid = !registrationDeadline || !eventDate || new Date(registrationDeadline).getTime() <= new Date(eventDate).getTime();
    const finalVenue = isCustomVenue ? customVenueName.trim() : venue.trim();
    const hasVenue = isVirtual ? Boolean(virtualLink.trim()) : Boolean(finalVenue);
    const hasCapacity = capacity > 0;
    const isTeamValid = teamFormat === 'Solo' || (teamMin > 0 && teamMin <= teamMax);
    const hasDescription = Boolean(description.trim());

    const items = [
      { id: 'title', label: 'Event Title provided', valid: hasTitle, step: 'identity' },
      { id: 'date', label: 'Date & Start Time specified', valid: hasDate, step: 'schedule' },
      { id: 'deadline', label: 'Registration Deadline valid (before event start)', valid: isDeadlineValid, step: 'schedule' },
      { id: 'venue', label: isVirtual ? 'Virtual Meeting Link specified' : 'Campus Venue selected', valid: hasVenue, step: 'schedule' },
      { id: 'capacity', label: 'Seating Capacity defined (> 0)', valid: hasCapacity, step: 'capacity' },
      { id: 'team', label: 'Team Size Range valid (Min ≤ Max)', valid: isTeamValid, step: 'capacity' },
      { id: 'description', label: 'Event Description provided', valid: hasDescription, step: 'identity' },
    ];

    const completed = items.filter((i) => i.valid).length;
    const score = Math.round((completed / items.length) * 100);
    const canPublish = hasTitle && hasDate && hasVenue && hasCapacity && isTeamValid && isDeadlineValid;

    return { items, score, canPublish };
  }, [
    title,
    eventDate,
    registrationDeadline,
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
      upiId: payment === 'Paid' ? upiId.trim() : '',
      paymentInstructions: payment === 'Paid' ? paymentInstructions.trim() : '',
      registrationType,
      tags,
      allowWaitlist,
      requireWaiver,
      collectProfileData: true,
      contact,
      agenda,
      rules,
      faqs,
      formQuestions: customQuestions.map(({ id, ...rest }) => ({
        ...rest,
        scope: rest.scope || (/(team|project|idea|pitch|track|problem|abstract|theme|topic|synopsis|solution|startup|repo|repository|github|deck|presentation|slide|stack)/i.test(rest.label || '') ? 'team' : 'member'),
      })),
      status,
    };
    if (registrationType === 'team') {
      payload.teamSize = { min: Number(teamMin), max: Number(teamMax) };
    }
    if (registrationDeadline) {
      payload.registrationDeadline = new Date(registrationDeadline).toISOString();
    } else if (isEditMode) {
      payload.registrationDeadline = null;
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

    let paymentQrError = '';
    if (payment === 'Paid' && paymentQrFile) {
      try {
        await uploadEventPaymentQr(savedEventId, paymentQrFile);
      } catch (err) {
        paymentQrError = err.message || 'the payment QR code could not be uploaded';
      }
    } else if (isEditMode && removePaymentQrFlag && (!paymentQrFile || payment === 'Free')) {
      try {
        await removeEventPaymentQr(savedEventId);
      } catch (err) {
        console.warn('Could not remove payment QR:', err);
      }
    }

    setIsPublishing(false);
    setIsSavingDraft(false);

    const assetErrors = [bannerError, paymentQrError].filter(Boolean);
    if (assetErrors.length > 0) {
      setSubmitError(`Event saved, but ${assetErrors.join(' and ')}. Check the event edit page.`);
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

          {/* Quick Clickable Readiness Badge */}
          <button
            type="button"
            className="flex items-center gap-1.5 bg-white border border-[#D8D2C4] px-2.5 py-1 rounded-full text-xs font-mono hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => setActiveStep('preview')}
            title="Click to view Pre-Flight Checklist in Preview"
          >
            <span className="text-gray-500">Readiness:</span>
            <strong
              className={`font-bold ${
                validation.score >= 80 ? 'text-emerald-700' : validation.score >= 50 ? 'text-amber-700' : 'text-red-700'
              }`}
            >
              {validation.score}%
            </strong>
          </button>

          {/* Quick Preview Toggle in Header */}
          {activeStep !== 'preview' ? (
            <button
              type="button"
              className="org-btn org-btn-secondary text-xs !py-1 !px-2.5"
              onClick={() => setActiveStep('preview')}
            >
              <Eye size={13} />
              <span>Preview &amp; Launch</span>
            </button>
          ) : (
            <button
              type="button"
              className="org-btn org-btn-ghost text-xs !py-1 !px-2.5 border border-[#D8D2C4] bg-white"
              onClick={() => setActiveStep('questions')}
            >
              <PencilSimple size={13} />
              <span>Back to Edit</span>
            </button>
          )}
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
            Configure your event listing, schedule, capacity tiers, timeline, and registration questions with live student previews in one unified studio.
          </p>
        </div>
      </div>

      {/* ── Starter Template Quick-Select Bar (create mode only) ── */}
      {!isEditMode && (
        <section className="mb-6 bg-[#FAF8F5] border border-[#D8D2C4] rounded-2xl p-4 shadow-xs transition-all">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#991B1B]/10 text-[#991B1B] flex items-center justify-center font-bold">
                <Sparkle size={16} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-['Space_Grotesk'] font-bold text-[#0F172A] uppercase tracking-wider">
                    One-Click Event Blueprints
                  </span>
                  {templateNotification && (
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                      ✓ {templateNotification}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 font-['Plus_Jakarta_Sans']">
                  Speed up event setup with curated blueprints for Hackathons, Workshops, Speaker Sessions, and more.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="org-btn org-btn-ghost text-xs !py-1.5 !px-3 border border-[#D8D2C4] bg-white hover:bg-[#FAF8F5] flex items-center gap-1.5 cursor-pointer"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <span>{showTemplates ? 'Hide Blueprints' : 'Browse Blueprints (6)'}</span>
              {showTemplates ? <CaretUp size={13} /> : <CaretDown size={13} />}
            </button>
          </div>

          <AnimatePresence>
            {showTemplates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden pt-3.5 mt-3 border-t border-[#E6E1D5]"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {STARTER_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      className="flex flex-col items-center justify-center text-center p-3 rounded-xl border border-[#D8D2C4] bg-white hover:border-[#991B1B] hover:shadow-md transition-all group cursor-pointer"
                      onClick={() => handleApplyTemplate(tpl)}
                    >
                      <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{tpl.icon}</span>
                      <span className="text-xs font-bold text-[#0F172A] font-['Space_Grotesk'] leading-tight group-hover:text-[#991B1B]">
                        {tpl.name}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono mt-1">
                        {tpl.teamFormat} · {tpl.capacity} seats
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      {/* ── Main Studio Container (Single Focused Column with 6 Tabs) ── */}
      <div className="max-w-4xl lg:max-w-5xl mx-auto space-y-6">
        {/* Step / Section Navigation Tabs */}
        <div className="org-create-steps-nav flex items-center gap-1.5 bg-[#FAF8F5] p-2 rounded-2xl border border-[#D8D2C4] overflow-x-auto scrollbar-none shadow-xs">
          {[
            { id: 'identity', stepNum: '1', label: '1. Identity & Art', icon: ImageIcon },
            { id: 'schedule', stepNum: '2', label: '2. Schedule & Venue', icon: CalendarBlank },
            { id: 'capacity', stepNum: '3', label: '3. Capacity & Tickets', icon: Ticket },
            { id: 'agenda', stepNum: '4', label: '4. Agenda & Rules', icon: ListBullets },
            { id: 'questions', stepNum: '5', label: '5. RSVP Form', icon: FileText },
            { id: 'preview', stepNum: '6', label: '6. Preview & Launch', icon: Eye, isPreview: true },
          ].map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                type="button"
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center cursor-pointer ${
                  isActive
                    ? 'bg-[#0F172A] text-white shadow-sm font-bold'
                    : 'text-gray-600 hover:text-[#0F172A] hover:bg-white/80'
                }`}
                onClick={() => setActiveStep(step.id)}
              >
                <Icon size={15} className={isActive ? 'text-[#FAF8F5]' : step.isPreview ? 'text-[#991B1B]' : 'text-gray-500'} />
                <span>{step.label}</span>
                {step.isPreview && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : validation.canPublish
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {validation.score}%
                  </span>
                )}
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
            registrationDeadline={registrationDeadline}
            setActiveStep={setActiveStep}
            setCustomVenueName={setCustomVenueName}
            setEventDate={setEventDate}
            setIsCustomVenue={setIsCustomVenue}
            setIsVirtual={setIsVirtual}
            setRegistrationDeadline={setRegistrationDeadline}
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
            paymentQrPreviewUrl={paymentQrPreviewUrl}
            handlePaymentQrFileChange={handlePaymentQrFileChange}
            handleRemovePaymentQr={handleRemovePaymentQr}
            upiId={upiId}
            setUpiId={setUpiId}
            paymentInstructions={paymentInstructions}
            setPaymentInstructions={setPaymentInstructions}
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
            teamFormat={teamFormat}
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

        {/* ── Step 6: Live Student Preview & Pre-Flight Review (Moved into Tabs) ── */}
        {activeStep === 'preview' && (
          <PreviewStep
            title={title}
            tagline={tagline}
            category={category}
            eventDate={eventDate}
            registrationDeadline={registrationDeadline}
            venue={venue}
            isCustomVenue={isCustomVenue}
            customVenueName={customVenueName}
            isVirtual={isVirtual}
            virtualLink={virtualLink}
            bannerPreviewUrl={bannerPreviewUrl}
            tags={tags}
            teamFormat={teamFormat}
            teamMin={teamMin}
            teamMax={teamMax}
            capacity={capacity}
            allowWaitlist={allowWaitlist}
            payment={payment}
            priceAmount={priceAmount}
            paymentQrPreviewUrl={paymentQrPreviewUrl}
            upiId={upiId}
            paymentInstructions={paymentInstructions}
            description={description}
            agenda={agenda}
            rules={rules}
            contact={contact}
            faqs={faqs}
            customQuestions={customQuestions}
            requireWaiver={requireWaiver}
            waiverText={waiverText}
            communityName={communityName}
            validation={validation}
            setActiveStep={setActiveStep}
            handleSaveEvent={handleSaveEvent}
            isPublishing={isPublishing}
            isSavingDraft={isSavingDraft}
            submitError={submitError}
          />
        )}
      </div>

      {/* ── Sticky Studio Bottom Action Bar ── */}
      <div className="org-create-sticky-action-bar">
        <div className="org-create-sticky-action-bar-inner !max-w-5xl">
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
                <Warning size={14} /> Please fill required fields (Title, Date, Venue, Capacity) before publishing.
              </span>
            )}

            {submitError && (
              <span className="text-xs text-red-600 font-mono flex items-center gap-1">
                <Warning size={14} /> {submitError}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {activeStep !== 'preview' ? (
              <button
                type="button"
                className="org-btn org-btn-secondary text-xs !border-[#D8D2C4]"
                onClick={() => setActiveStep('preview')}
                title="Preview this event listing"
              >
                <Eye size={14} />
                <span>Preview Event</span>
              </button>
            ) : (
              <button
                type="button"
                className="org-btn org-btn-ghost text-xs border border-[#D8D2C4] bg-white hover:bg-[#FAF8F5]"
                onClick={() => setActiveStep('questions')}
              >
                <PencilSimple size={14} />
                <span>Back to Edit Form</span>
              </button>
            )}

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
              {isPublishing ? (
                <CircleNotch size={14} className="animate-spin" />
              ) : (
                <RocketLaunch size={14} />
              )}
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
