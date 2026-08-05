import React, { useState } from "react";
import "./SocialLinks.css";

/**
 * SocialLinks – lets students connect & display their social media handles.
 *
 * Props:
 *   links    {object}  – { github, linkedin, instagram, discord, twitter,
 *                          leetcode, portfolio, youtube }  (all optional strings)
 *   onSave   {func}    – async fn(updatedLinks) called when the user saves
 *   editable {bool}    – show edit controls (default true)
 */

const PLATFORMS = [
  {
    key: "github",
    label: "GitHub",
    icon: "fa-brands fa-github",
    placeholder: "username",
    baseUrl: "https://github.com/",
    color: "#24292e",
    bg: "#f6f8fa",
    border: "#d0d7de",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: "fa-brands fa-linkedin-in",
    placeholder: "in/your-name",
    baseUrl: "https://linkedin.com/",
    color: "#0077b5",
    bg: "#e8f4fd",
    border: "#bfdbf7",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: "fa-brands fa-instagram",
    placeholder: "username",
    baseUrl: "https://instagram.com/",
    color: "#e1306c",
    bg: "#fdf0f4",
    border: "#f5c6d8",
  },
  {
    key: "discord",
    label: "Discord",
    icon: "fa-brands fa-discord",
    placeholder: "username or server invite",
    baseUrl: "https://discord.com/users/",
    color: "#5865f2",
    bg: "#f0f1ff",
    border: "#c5c8fa",
  },
  {
    key: "twitter",
    label: "X / Twitter",
    icon: "fa-brands fa-x-twitter",
    placeholder: "handle (without @)",
    baseUrl: "https://x.com/",
    color: "#000000",
    bg: "#f7f7f7",
    border: "#d4d4d4",
  },
  {
    key: "leetcode",
    label: "LeetCode",
    icon: "fa-solid fa-code",
    placeholder: "username",
    baseUrl: "https://leetcode.com/",
    color: "#ffa116",
    bg: "#fff8ee",
    border: "#ffd8a0",
  },
  {
    key: "portfolio",
    label: "Portfolio",
    icon: "fa-solid fa-globe",
    placeholder: "https://yoursite.com",
    baseUrl: "",
    color: "#5B4FE9",
    bg: "#f0f0fc",
    border: "#c7c2f5",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: "fa-brands fa-youtube",
    placeholder: "@channelname",
    baseUrl: "https://youtube.com/",
    color: "#ff0000",
    bg: "#fff0f0",
    border: "#ffbebe",
  },
];

function SocialLinks({
  links = {},
  onSave = async () => {},
  editable = true,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...links });
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setDraft({ ...links });
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft({ ...links });
    setEditing(false);
  };

  const handleSave = async () => {
    // Strip blank values
    const cleaned = Object.fromEntries(
      Object.entries(draft).filter(([, v]) => v && v.trim() !== "")
    );
    setSaving(true);
    try {
      await onSave(cleaned);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  const buildHref = (platform, value) => {
    if (!value) return "#";
    if (platform.key === "portfolio") return value.startsWith("http") ? value : `https://${value}`;
    if (platform.key === "discord") return value.startsWith("http") ? value : `${platform.baseUrl}${value}`;
    return `${platform.baseUrl}${value}`;
  };

  // Platforms that have a value set
  const filledPlatforms = PLATFORMS.filter((p) => links[p.key]?.trim());
  const hasAny = filledPlatforms.length > 0;

  return (
    <div className="sl-card">
      {/* ── Header ── */}
      <div className="sl-header">
        <div className="sl-title-wrap">
          <i className="fa-solid fa-share-nodes sl-title-icon" />
          <h3 className="sl-title">Social Links</h3>
        </div>
        {editable && !editing && (
          <button className="sl-edit-btn" onClick={startEdit} aria-label="Edit social links">
            <i className="fa-solid fa-pen" />
            <span>{hasAny ? "Edit" : "Add Links"}</span>
          </button>
        )}
      </div>

      {/* ── Display mode ── */}
      {!editing && (
        <>
          {!hasAny ? (
            <div className="sl-empty">
              <div className="sl-empty-icons">
                {["fa-brands fa-github", "fa-brands fa-linkedin-in", "fa-brands fa-instagram", "fa-brands fa-discord"].map((ic) => (
                  <span key={ic} className="sl-empty-icon-bubble">
                    <i className={ic} />
                  </span>
                ))}
              </div>
              <p className="sl-empty-title">No social links yet</p>
              {editable && (
                <p className="sl-empty-sub">
                  Click <strong>Add Links</strong> to let people find you online.
                </p>
              )}
            </div>
          ) : (
            <div className="sl-chips">
              {filledPlatforms.map((p) => (
                <a
                  key={p.key}
                  href={buildHref(p, links[p.key])}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sl-chip"
                  style={{
                    "--sl-color": p.color,
                    "--sl-bg": p.bg,
                    "--sl-border": p.border,
                  }}
                  title={`${p.label}: ${links[p.key]}`}
                >
                  <span className="sl-chip-icon-wrap">
                    <i className={p.icon} />
                  </span>
                  <span className="sl-chip-info">
                    <span className="sl-chip-label">{p.label}</span>
                    <span className="sl-chip-value">{links[p.key]}</span>
                  </span>
                  <i className="fa-solid fa-arrow-up-right-from-square sl-chip-arrow" />
                </a>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Edit mode ── */}
      {editing && (
        <div className="sl-edit-form">
          <div className="sl-edit-grid">
            {PLATFORMS.map((p) => (
              <div
                key={p.key}
                className="sl-edit-row"
                style={{ "--sl-color": p.color, "--sl-bg": p.bg, "--sl-border": p.border }}
              >
                <div className="sl-edit-icon-wrap">
                  <i className={p.icon} />
                </div>
                <div className="sl-edit-field">
                  <label className="sl-edit-label" htmlFor={`sl-${p.key}`}>
                    {p.label}
                  </label>
                  <input
                    id={`sl-${p.key}`}
                    className="sl-edit-input"
                    value={draft[p.key] || ""}
                    placeholder={p.placeholder}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [p.key]: e.target.value }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="sl-edit-actions">
            <button className="sl-btn sl-btn--cancel" onClick={cancelEdit}>
              Cancel
            </button>
            <button
              className="sl-btn sl-btn--save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <><i className="fa-solid fa-circle-notch fa-spin" /> Saving…</>
              ) : (
                <><i className="fa-solid fa-check" /> Save Links</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SocialLinks;
