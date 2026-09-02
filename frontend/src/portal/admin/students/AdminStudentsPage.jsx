/**
 * AdminStudentsPage.jsx — Read-only student directory.
 * Suspension is schema-reserved (`isSuspended`) but explicitly future
 * scope in the product doc — so the control here is visibly disabled
 * rather than silently absent or silently functional.
 *
 * Wired to /api/admin/students. Branch options are the real User.BRANCHES
 * enum values (section-split, e.g. "Computer Engineering 1/2/3"), not the
 * shorter mock labels from the earlier fixture-data version of this page.
 * "Year" (FE/SE/TE/BE) is derived client-side from the User model's
 * currentYear virtual, same as device is parsed client-side on the audit log.
 *
 * Search and branch are both sent to the server rather than filtered
 * client-side over one fetched page: unlike Communities (capped around a
 * few dozen, safe to fetch once and filter in the browser), a student
 * directory realistically exceeds a single page, so client-only filtering
 * would silently miss matches sitting past the fetched cutoff.
 */
import { useEffect, useState } from 'react';
import { MagnifyingGlass, UsersThree, Prohibit, Warning } from '@phosphor-icons/react';
import EmptyState from '@/layouts/portal/components/EmptyState';
import { listStudents } from '@/portal/admin/admin.api';
import { ApiError } from '@/shared/api/httpClient';
import '@/layouts/portal/portal-widgets.css';
import './adm-students.css';

const BRANCHES = [
  'All Branches',
  'Computer Engineering 1',
  'Computer Engineering 2',
  'Computer Engineering 3',
  'Information Technology 1',
  'Information Technology 2',
  'AI & Data Science',
  'AI & Machine Learning',
  'CSE (IoT, Cyber Security, & Blockchain)',
];

const YEAR_LABEL = { 1: 'FE', 2: 'SE', 3: 'TE', 4: 'BE' };

function yearLabel(currentYear) {
  if (currentYear == null) return '—';
  return YEAR_LABEL[currentYear] || `Year ${currentYear}`;
}

function getInitials(name) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [branch, setBranch] = useState('All Branches');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    listStudents({
      ...(branch === 'All Branches' ? {} : { branch }),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    })
      .then(({ students: fetched, total: fetchedTotal }) => {
        if (cancelled) return;
        setStudents(fetched);
        setTotal(fetchedTotal);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load students.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [branch, debouncedSearch]);

  return (
    <div className="org-page">
      <div className="org-page-header">
        <div>
          <p className="org-page-eyebrow">Platform</p>
          <h1 className="org-page-title">Students</h1>
          <p className="org-page-desc">
            Read-only directory for lookups and support requests. Suspension is reserved at the schema level but not built yet — shown disabled below, not hidden.
          </p>
        </div>
        <span className="org-badge">{total.toLocaleString()} accounts</span>
      </div>

      <div className="org-toolbar">
        <div className="org-search-wrap">
          <MagnifyingGlass size={14} className="org-search-icon" />
          <input className="org-search-input" placeholder="Search name, roll no, or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="org-form-select adm-branch-select" value={branch} onChange={(e) => setBranch(e.target.value)}>
          {BRANCHES.map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>

      {error && (
        <p className="adm-form-error" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Warning size={14} /> {error}
        </p>
      )}

      {loading ? (
        <EmptyState icon={UsersThree} title="Loading students…" desc="Fetching the student directory." />
      ) : students.length === 0 ? (
        <EmptyState icon={UsersThree} title="No students found" desc="Try a different search or branch filter." />
      ) : (
        <div className="org-card">
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th className="org-hide-mobile">Roll No.</th>
                  <th className="org-hide-mobile">Branch / Year</th>
                  <th className="org-hide-mobile">Email</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="adm-student-cell">
                        <span className="org-avatar" style={{ width: 30, height: 30, fontSize: '0.6875rem' }}>{getInitials(s.name)}</span>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.8125rem', color: '#0F172A' }}>{s.name}</span>
                      </div>
                    </td>
                    <td className="org-table-muted org-hide-mobile">{s.rollNo || '—'}</td>
                    <td className="org-table-muted org-hide-mobile">{s.branch || '—'} · {yearLabel(s.currentYear)}</td>
                    <td className="org-table-muted org-hide-mobile" style={{ fontSize: '0.75rem' }}>{s.email}</td>
                    <td className="org-table-muted">{s.createdAt ? s.createdAt.slice(0, 10) : '—'}</td>
                    <td>
                      <button className="org-icon-btn" disabled title="Suspension is future scope — not yet available">
                        <Prohibit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
