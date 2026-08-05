import React from 'react';

const SOCIAL_CONFIG = {
  github:    { icon: "fa-brands fa-github",    label: "GitHub",    className: "bpp-social-link--github" },
  linkedin:  { icon: "fa-brands fa-linkedin",  label: "LinkedIn",  className: "bpp-social-link--linkedin" },
  instagram: { icon: "fa-brands fa-instagram", label: "Instagram", className: "bpp-social-link--instagram" },
};

const SOCIAL_HREFS = {
  github:    (val) => `https://github.com/${val}`,
  linkedin:  (val) => `https://linkedin.com/${val}`,
  instagram: (val) => `https://instagram.com/${val}`,
};

function BuddySidebar({ student }) {
  const hasSocials = student.socials && Object.values(student.socials).some(Boolean);

  return (
    <div className="bpp-sidebar">
      {/* Quick info */}
      <div className="bpp-section">
        <h3 className="bpp-section-title">
          <i className="fa-solid fa-circle-info" />
          Quick Info
        </h3>
        <div className="bpp-quick-info">
          <div className="bpp-info-row">
            <i className="fa-solid fa-graduation-cap" />
            <span><strong>{student.branch}</strong></span>
          </div>
          <div className="bpp-info-row">
            <i className="fa-solid fa-layer-group" />
            <span><strong>{student.year}</strong></span>
          </div>
          <div className="bpp-info-row">
            <i
              className={`fa-solid ${student.online ? "fa-circle" : "fa-circle-dot"}`}
              style={{ color: student.online ? "#10b981" : "#94a3b8" }}
            />
            <span style={{ color: student.online ? "#10b981" : "#94a3b8", fontWeight: 600 }}>
              {student.online ? "Online now" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Socials */}
      {hasSocials && (
        <div className="bpp-section">
          <h3 className="bpp-section-title">
            <i className="fa-solid fa-link" />
            Social &amp; Portfolio
          </h3>
          <div className="bpp-social-list">
            {Object.entries(student.socials).map(([platform, handle]) => {
              if (!handle) return null;
              const cfg = SOCIAL_CONFIG[platform];
              if (!cfg) return null;
              return (
                <a
                  key={platform}
                  href={SOCIAL_HREFS[platform](handle)}
                  target="_blank"
                  rel="noreferrer"
                  className={`bpp-social-link ${cfg.className}`}
                >
                  <i className={cfg.icon} />
                  {cfg.label}
                  <i
                    className="fa-solid fa-arrow-up-right-from-square"
                    style={{ marginLeft: "auto", fontSize: "0.65rem", opacity: 0.45 }}
                  />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BuddySidebar;
