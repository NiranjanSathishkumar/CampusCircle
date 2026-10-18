/**
 * Uploaded certificates, in grid or list view.
 */
import { ArrowSquareOut, FilePdf, GridFour, List, PencilSimple, Plus, Sparkle, Trash } from '@phosphor-icons/react';

function isPdfUrl(url) {
  return Boolean(url) && url.toLowerCase().endsWith('.pdf');
}

export default function AchievementsTab({
  certViewMode,
  certificates,
  handleDeleteCertificate,
  handleEditCertificate,
  setCertViewMode,
  setExpandedCertificate,
  setShowUploadCertModal,
}) {
  return (
    <div>
      <div className="profile-section-header">
        <div>
          {/* "Verified" would contradict the landing page's own Closed Campus
              Policy FAQ, which states achievements are "entirely self-reported"
              and never validated by CampusCircle or the college. */}
          <h2 className="profile-section-title">Achievements — Self-Reported ({certificates.length})</h2>
          <p className="profile-section-desc">
            Showcase hackathon prizes, cloud certifications, workshop completions, and academic credentials.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowUploadCertModal(true)} style={{ fontSize: '0.8125rem' }}>
          <Plus size={15} />
          Upload Certificate
        </button>
      </div>

      {/* Toolbar */}
      <div className="cert-toolbar">
        <div className="cert-view-toggle">
          <button
            className={`cert-view-btn ${certViewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setCertViewMode('grid')}
          >
            <GridFour size={15} /> Grid View
          </button>
          <button
            className={`cert-view-btn ${certViewMode === 'list' ? 'active' : ''}`}
            onClick={() => setCertViewMode('list')}
          >
            <List size={15} /> List View
          </button>
        </div>
      </div>

      {/* Certificate Collection */}
      {certificates.length === 0 ? (
        <div className="profile-empty-box">
          <div className="profile-empty-icon"><Sparkle size={24} /></div>
          <h3 className="profile-empty-title">No certificates uploaded yet</h3>
          <p className="profile-empty-desc">Upload your verified certificates, competition awards, or workshop credentials to build your campus portfolio.</p>
          <button className="btn-primary" onClick={() => setShowUploadCertModal(true)} style={{ marginTop: 8 }}>
            <Plus size={15} /> Upload Certificate
          </button>
        </div>
      ) : (
        <div className={certViewMode === 'grid' ? 'cert-grid' : 'cert-list'}>
          {certificates.map(cert => (
            <div
              key={cert.id}
              className="cert-card"
              onClick={() => setExpandedCertificate(cert)}
            >
              <div className="cert-card-img-wrap">
                {cert.imageUrl ? (
                  isPdfUrl(cert.imageUrl) ? (
                    <div className="cert-card-img" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0F172A', gap: '0.375rem', padding: '1rem' }}>
                      <FilePdf size={28} weight="fill" style={{ color: '#E4405F' }} />
                      <span style={{ fontSize: '0.6875rem', color: '#F5F2EA', fontWeight: 600 }}>PDF Certificate</span>
                    </div>
                  ) : (
                    <img src={cert.imageUrl} alt={cert.title} className="cert-card-img" />
                  )
                ) : (
                  <div className="cert-card-img" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F0EDE5', gap: '0.375rem', padding: '1rem' }}>
                    <Sparkle size={24} style={{ color: '#9CA3AF' }} />
                    <span style={{ fontSize: '0.6875rem', color: '#991B1B', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Plus size={12} /> Attach Document
                    </span>
                  </div>
                )}
              </div>
              <div className="cert-card-body">
                <h3 className="cert-card-title">{cert.title}</h3>
                <span className="cert-card-issuer">{cert.issuer}</span>
                <span className="cert-card-date">{cert.date}</span>
                {cert.description && <p className="cert-card-desc">{cert.description}</p>}
              </div>
              <div className="cert-card-footer">
                {cert.verificationLink ? (
                  <a
                    href={cert.verificationLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.625rem',
                      color: '#991B1B',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontWeight: 700,
                    }}
                  >
                    Verify Credential <ArrowSquareOut size={12} />
                  </a>
                ) : <span />}
                <div style={{ display: 'flex', gap: 2 }}>
                  <button
                    onClick={(e) => handleEditCertificate(cert, e)}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4 }}
                    title="Edit achievement"
                  >
                    <PencilSimple size={15} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteCertificate(cert.id, e)}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4 }}
                    title="Delete certificate"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
