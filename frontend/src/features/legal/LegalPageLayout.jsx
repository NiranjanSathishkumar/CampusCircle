import { useState, useEffect, useRef } from 'react';
import { CaretRight, EnvelopeSimple, Printer, ArrowUp } from '@phosphor-icons/react';
import Navbar from '@/layouts/public/Navbar';
import Footer from '@/layouts/public/Footer';

const RELATED_POLICIES = [
  { label: 'Closed Campus Policy', href: '#closed-campus-policy' },
  { label: 'Code of Conduct', href: '#code-of-conduct' },
  { label: 'Student Data Privacy', href: '#student-data-privacy' },
  { label: 'Terms of Service', href: '#terms-of-service' },
  { label: 'Security & Domain Lock', href: '#security-domain-lock' },
];

function Block({ block }) {
  if (block.type === 'list') {
    return (
      <ul className="space-y-2.5 my-4">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-3 text-[#374151] text-[0.9375rem] leading-relaxed">
            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#991B1B] shrink-0" aria-hidden="true" />
            <span>
              {item.strong && <strong className="text-[#0F172A] font-semibold">{item.strong} </strong>}
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === 'note') {
    return (
      <div className="my-5 flex gap-3 p-4 rounded border border-[#D8D2C4] bg-[#F0EDE5]">
        <span className="font-mono text-[0.625rem] font-bold uppercase tracking-widest text-[#991B1B] shrink-0 pt-0.5">
          Note
        </span>
        <p className="text-[0.875rem] text-[#374151] leading-relaxed">{block.text}</p>
      </div>
    );
  }

  return (
    <p className="text-[#374151] text-[0.9375rem] leading-[1.75] my-4">
      {block.text}
    </p>
  );
}

export default function LegalPageLayout({ icon: Icon, eyebrow, title, description, lastUpdated, effectiveDate, sections }) {
  const [activeId, setActiveId] = useState(sections?.[0]?.id);
  const [showTop, setShowTop] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const headings = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 600);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTocClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: 'smooth' });
      window.history.replaceState(null, '', `#${window.location.hash.split('/')[0].replace('#', '')}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EA] text-[#0F172A] font-sans antialiased">
      <Navbar />
      <main>
        {/* HEADER BAND */}
        <header className="relative overflow-hidden bg-[#0B1120] text-[#F5F2EA] border-b border-[#D8D2C4]/15">
          <div className="absolute inset-0 ledger-grid-dark pointer-events-none opacity-25" aria-hidden="true" />
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[260px] bg-gradient-to-b from-[#991B1B]/12 via-transparent to-transparent blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 page-container pt-28 pb-14 sm:pt-32 sm:pb-16">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-widest text-[#9CA3AF]">
                <li><a href="#landing" className="hover:text-[#F5F2EA] transition-colors">CampusCircle</a></li>
                <li aria-hidden="true"><CaretRight size={10} /></li>
                <li><span className="hover:text-[#F5F2EA] transition-colors">Governance</span></li>
                <li aria-hidden="true"><CaretRight size={10} /></li>
                <li className="text-[#F5F2EA]">{title}</li>
              </ol>
            </nav>

            <div className="flex items-start gap-5">
              {Icon && (
                <div className="hidden sm:flex w-14 h-14 shrink-0 rounded-lg bg-[#141E33] border border-[#D8D2C4]/15 items-center justify-center">
                  <Icon size={26} weight="duotone" className="text-[#991B1B]" />
                </div>
              )}
              <div className="max-w-[64ch]">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E293B]/80 border border-[#D8D2C4]/15 text-xs font-mono text-[#9CA3AF] mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{eyebrow}</span>
                </div>
                <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-[2.75rem] tracking-tight leading-[1.1] text-[#F5F2EA]">
                  {title}
                </h1>
                <p className="mt-4 text-[#9CA3AF] text-base leading-relaxed">
                  {description}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-wider text-[#6B7280]">
                  <span>Effective: <span className="text-[#9CA3AF]">{effectiveDate}</span></span>
                  <span className="w-1 h-1 rounded-full bg-[#374151]" aria-hidden="true" />
                  <span>Last Updated: <span className="text-[#9CA3AF]">{lastUpdated}</span></span>
                  <span className="w-1 h-1 rounded-full bg-[#374151]" aria-hidden="true" />
                  <span>SIES Graduate School of Technology</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* BODY: TOC + CONTENT */}
        <div className="page-container py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* SIDEBAR TOC */}
            <aside className="lg:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div>
                  <h2 className="font-mono text-[0.625rem] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
                    On This Page
                  </h2>
                  <nav aria-label="Table of contents">
                    <ul className="space-y-0.5 border-l border-[#D8D2C4]">
                      {sections.map((s) => (
                        <li key={s.id}>
                          <a
                            href={`#${s.id}`}
                            onClick={(e) => handleTocClick(e, s.id)}
                            className={`block pl-4 pr-2 py-1.5 -ml-px border-l-2 text-[0.8125rem] leading-snug transition-colors ${
                              activeId === s.id
                                ? 'border-[#991B1B] text-[#991B1B] font-semibold'
                                : 'border-transparent text-[#6B7280] hover:text-[#0F172A] hover:border-[#D8D2C4]'
                            }`}
                          >
                            {s.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                <div className="form-panel p-4 space-y-2.5">
                  <div className="flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-widest text-[#9CA3AF]">
                    <EnvelopeSimple size={13} className="text-[#991B1B]" />
                    <span>Questions?</span>
                  </div>
                  <p className="text-[0.8125rem] text-[#374151] leading-relaxed">
                    Reach the Student Support Cell for clarifications on this policy.
                  </p>
                  <a href="#support" className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-[#991B1B] hover:text-[#7f1d1d] transition-colors">
                    <span>Help & Grievance Desk</span>
                    <CaretRight size={12} weight="bold" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-wider text-[#6B7280] hover:text-[#0F172A] transition-colors"
                >
                  <Printer size={14} />
                  <span>Print this policy</span>
                </button>
              </div>
            </aside>

            {/* CONTENT */}
            <div className="lg:col-span-9 order-1 lg:order-2" ref={contentRef}>
              <div className="max-w-[74ch]">
                {sections.map((s, idx) => (
                  <section key={s.id} id={s.id} className="scroll-mt-24 pb-10 mb-10 border-b border-[#D8D2C4] last:border-b-0 last:mb-0 last:pb-0">
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="font-mono text-xs text-[#991B1B] font-semibold shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h2 className="font-display font-bold text-xl sm:text-2xl text-[#0F172A] tracking-tight">
                        {s.title}
                      </h2>
                    </div>
                    <div className="pl-0 sm:pl-8">
                      {s.blocks.map((block, i) => (
                        <Block key={i} block={block} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {/* RELATED POLICIES */}
              <div className="mt-16 pt-10 border-t border-[#D8D2C4]">
                <h3 className="font-mono text-[0.625rem] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-4">
                  Related Governance Documents
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {RELATED_POLICIES.filter((p) => p.label !== title).map((p) => (
                    <a
                      key={p.label}
                      href={p.href}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded border border-[#D8D2C4] bg-white text-[0.8125rem] text-[#374151] hover:border-[#991B1B] hover:text-[#991B1B] transition-colors"
                    >
                      <span>{p.label}</span>
                      <CaretRight size={11} weight="bold" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-11 h-11 rounded-full bg-[#0F172A] text-[#F5F2EA] shadow-lg hover:bg-[#1e293b] transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp size={18} weight="bold" />
        </button>
      )}

      <Footer compact />
    </div>
  );
}
