import React from "react";

function CertificateLightbox({ cert, onClose, formatDate }) {
  if (!cert) return null;

  return (
    <div className="ach-lightbox-overlay" onClick={onClose}>
      <div className="ach-lightbox" onClick={(e) => e.stopPropagation()}>
        <button
          className="ach-lightbox-close"
          onClick={onClose}
          aria-label="Close"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        {cert.imageUrl ? (
          <img
            src={cert.imageUrl}
            alt={cert.title}
            className="ach-lightbox-img"
          />
        ) : (
          <div className="ach-lightbox-no-img">
            <i className="fa-solid fa-certificate" />
          </div>
        )}

        <div className="ach-lightbox-body">
          <h4 className="ach-lightbox-title">{cert.title}</h4>
          <p className="ach-lightbox-issuer">
            <i className="fa-solid fa-building" /> {cert.issuer}
          </p>
          {cert.date && (
            <p className="ach-lightbox-date">
              <i className="fa-regular fa-calendar" /> {formatDate(cert.date)}
            </p>
          )}
          {cert.description && (
            <p className="ach-lightbox-desc">{cert.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CertificateLightbox;
