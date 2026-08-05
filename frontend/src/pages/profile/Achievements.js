import React, { useState } from "react";
import "./Achievements.css";
import CertificateLightbox from "./CertificateLightbox";
import AddCertificateModal from "./AddCertificateModal";

/**
 * Achievements – Verified Certificates & Credentials Showcase.
 */
function Achievements({
  achievements = [],
  onAdd = async () => {},
  onDelete = async () => {},
  editable = true,
}) {
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const expandedCert = achievements.find((a) => a.id === expanded);

  return (
    <div className="ach-section">
      {/* ── Header Row ── */}
      <div className="ach-header">
        <div className="ach-title-block">
          <h3 className="ach-main-title">Verified Certificates</h3>
          <p className="ach-subtitle">
            Showcase your professional credentials and academic milestones.
          </p>
        </div>

        <div className="ach-header-actions">
          {/* Grid / List View Toggle */}
          <div className="ach-view-toggle">
            <button
              className={`ach-toggle-btn ${viewMode === "grid" ? "ach-toggle-btn--active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              Grid
            </button>
            <button
              className={`ach-toggle-btn ${viewMode === "list" ? "ach-toggle-btn--active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* ── Cards Container (Grid or List) ── */}
      <div className={`ach-cards-wrap ach-cards-wrap--${viewMode}`}>
        {/* Upload Certificate Action Card */}
        {editable && (
          <div className="ach-upload-card" onClick={openModal}>
            <div className="ach-upload-circle">
              <i className="fa-solid fa-plus" />
            </div>
            <h4 className="ach-upload-title">Upload Certificate</h4>
            <p className="ach-upload-sub">PDF or Image up to 10MB</p>
          </div>
        )}

        {/* Certificate Cards */}
        {achievements.map((a) => (
          <div key={a.id} className="ach-card" onClick={() => setExpanded(a.id)}>
            {/* Thumbnail Preview Area */}
            <div className="ach-card-img-wrap">
              {a.imageUrl ? (
                <img src={a.imageUrl} alt={a.title} className="ach-card-img" />
              ) : (
                <div className="ach-card-img-placeholder">
                  <div className="ach-cert-frame">
                    <i className="fa-solid fa-award ach-cert-icon" />
                    <span className="ach-cert-badge">CampusCircle Verified</span>
                  </div>
                </div>
              )}
              <div className="ach-card-overlay">
                <i className="fa-solid fa-expand" />
              </div>
            </div>

            {/* Card Content Body */}
            <div className="ach-card-body">
              <div className="ach-card-head-row">
                <h4 className="ach-card-title">{a.title}</h4>
                <div className="ach-card-type-icon" title="Certificate">
                  <i className="fa-regular fa-id-badge" />
                </div>
              </div>

              <div className="ach-card-issuer-row">
                <span className="ach-issuer-name">{a.issuer}</span>
                {a.date && <span className="ach-issuer-bullet">•</span>}
                {a.date && <span className="ach-issuer-date">Issued {formatDate(a.date)}</span>}
              </div>

              {a.description && (
                <p className="ach-card-desc">{a.description}</p>
              )}

              {/* Verification Link */}
              <div className="ach-card-footer">
                <a
                  href={a.verificationLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ach-verify-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  Verification Link <i className="fa-solid fa-arrow-up-right-from-square ach-link-arrow" />
                </a>

                {editable && (
                  <button
                    className="ach-card-delete"
                    title="Remove Certificate"
                    aria-label="Remove certificate"
                    disabled={deletingId === a.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(a.id);
                    }}
                  >
                    {deletingId === a.id ? (
                      <i className="fa-solid fa-circle-notch fa-spin" />
                    ) : (
                      <i className="fa-solid fa-trash" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Lightbox ── */}
      <CertificateLightbox
        cert={expandedCert}
        onClose={() => setExpanded(null)}
        formatDate={formatDate}
      />

      {/* ── Add Certificate Modal ── */}
      {showModal && (
        <AddCertificateModal
          onClose={closeModal}
          onAdd={onAdd}
        />
      )}
    </div>
  );
}

export default Achievements;


