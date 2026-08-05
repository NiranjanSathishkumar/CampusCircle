import React, { useState, useEffect } from "react";
import "./PersonalDetailsTab.css";

const BRANCHES = [
  "Computer Engineering 1",
  "Computer Engineering 2",
  "Computer Engineering 3",
  "Information Technology 1",
  "Information Technology 2",
  "AI & Data Science",
  "AI & Machine Learning",
  "CSE (IoT, Cyber Security, & Blockchain)",
  "Electronics and Computer Science",
  "Electronics and Telecommunication Engineering",
];

const CURRENT_YEAR_NOW = new Date().getFullYear();
const ACADEMIC_ROLLOVER_MONTH = 5; // June (0-indexed)

function getAcademicCutoverYear(referenceDate = new Date()) {
  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();
  return month >= ACADEMIC_ROLLOVER_MONTH ? year : year - 1;
}

function computeCurrentYear(yearOfJoining) {
  if (!yearOfJoining || isNaN(yearOfJoining)) return { yearNum: 1, label: "1st Year", isEnrolled: true };
  const cutover = getAcademicCutoverYear();
  const yr = cutover - Number(yearOfJoining) + 1;
  
  if (yr === 1) return { yearNum: 1, label: "1st Year", isEnrolled: true };
  if (yr === 2) return { yearNum: 2, label: "2nd Year", isEnrolled: true };
  if (yr === 3) return { yearNum: 3, label: "3rd Year", isEnrolled: true };
  if (yr === 4) return { yearNum: 4, label: "4th Year", isEnrolled: true };
  if (yr > 4) return { yearNum: yr, label: "Graduate / Alumni", isEnrolled: false };
  return { yearNum: yr, label: "Incoming Student", isEnrolled: true };
}

function PersonalDetailsTab({ userDetails, onSave, onDeleteAccount }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    prnNo: "",
    branch: BRANCHES[0],
    yearOfJoining: 2024,
    bio: "",
    interestTags: [],
    skills: [],
    education: [],
    socialLinks: [
      { platform: "linkedin", url: "" },
      { platform: "github", url: "" },
      { platform: "instagram", url: "" },
    ],
  });

  const [tagInput, setTagInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [eduInput, setEduInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (userDetails) {
      setFormData({
        name: userDetails.name || "",
        email: userDetails.email || "",
        rollNo: userDetails.rollNo || "",
        prnNo: userDetails.prnNo || "",
        branch: userDetails.branch || BRANCHES[0],
        yearOfJoining: userDetails.yearOfJoining || 2024,
        bio: userDetails.bio || "",
        interestTags: Array.isArray(userDetails.interestTags) ? userDetails.interestTags : [],
        skills: Array.isArray(userDetails.skills) ? userDetails.skills : [],
        education: Array.isArray(userDetails.education) ? userDetails.education : [],
        socialLinks: [
          { platform: "linkedin", url: getSocialUrl(userDetails.socialLinks, "linkedin") },
          { platform: "github", url: getSocialUrl(userDetails.socialLinks, "github") },
          { platform: "instagram", url: getSocialUrl(userDetails.socialLinks, "instagram") },
        ],
      });
    }
  }, [userDetails]);

  function getSocialUrl(links, platform) {
    if (!Array.isArray(links)) return "";
    const found = links.find((l) => l.platform === platform);
    return found ? found.url : "";
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform, url) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((item) =>
        item.platform === platform ? { ...item, url } : item
      ),
    }));
  };

  /* ── Tag & Item Handlers ──────── */
  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase().replace(/^#/, "");
      if (val && !formData.interestTags.includes(val)) {
        setFormData((prev) => ({ ...prev, interestTags: [...prev.interestTags, val] }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      interestTags: prev.interestTags.filter((t) => t !== tag),
    }));
  };

  const handleAddSkill = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !formData.skills.includes(val)) {
        setFormData((prev) => ({ ...prev, skills: [...prev.skills, val] }));
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleAddEdu = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = eduInput.trim();
      if (val && !formData.education.includes(val)) {
        setFormData((prev) => ({ ...prev, education: [...prev.education, val] }));
      }
      setEduInput("");
    }
  };

  const handleRemoveEdu = (eduIndex) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== eduIndex),
    }));
  };

  /* ── Submit Handler ────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSaving(true);
    setSaveSuccess(false);

    // Basic frontend validation matching user schema
    if (!formData.name.trim()) {
      setErrorMsg("Full Name is required.");
      setSaving(false);
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg("Email address is required.");
      setSaving(false);
      return;
    }
    if (!formData.rollNo.trim()) {
      setErrorMsg("Roll Number is required.");
      setSaving(false);
      return;
    }
    if (!formData.prnNo.trim()) {
      setErrorMsg("PRN Number is required.");
      setSaving(false);
      return;
    }
    const yoj = Number(formData.yearOfJoining);
    if (!yoj || yoj < 2015 || yoj > CURRENT_YEAR_NOW) {
      setErrorMsg(`Year of Joining must be between 2015 and ${CURRENT_YEAR_NOW}.`);
      setSaving(false);
      return;
    }

    try {
      if (onSave) {
        await onSave({
          ...formData,
          rollNo: formData.rollNo.toUpperCase().trim(),
          prnNo: formData.prnNo.toUpperCase().trim(),
          yearOfJoining: yoj,
          socialLinks: formData.socialLinks.filter((l) => l.url.trim() !== ""),
        });
      }
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to save personal details.");
    } finally {
      setSaving(false);
    }
  };

  const computedInfo = computeCurrentYear(formData.yearOfJoining);

  return (
    <div className="pdetails-container">
      {/* Top Banner Header */}
      <div className="pdetails-header">
        <div className="pdetails-header-text">
          <h2 className="pdetails-title">
            <i className="fa-solid fa-address-card pdetails-title-icon" /> Personal Details
          </h2>
          <p className="pdetails-subtitle">
            Manage your academic identity, personal background, and discover tags strictly synced with your student record.
          </p>
        </div>

        <div className="pdetails-header-actions">
          {!isEditing ? (
            <button
              type="button"
              className="pdetails-btn pdetails-btn--edit"
              onClick={() => setIsEditing(true)}
            >
              <i className="fa-solid fa-pen-to-square" /> Edit Details
            </button>
          ) : (
            <button
              type="button"
              className="pdetails-btn pdetails-btn--cancel"
              onClick={() => {
                setIsEditing(false);
                setErrorMsg("");
              }}
            >
              <i className="fa-solid fa-xmark" /> Cancel
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="pdetails-alert pdetails-alert--success">
          <i className="fa-solid fa-circle-check" /> Personal details updated successfully!
        </div>
      )}

      {errorMsg && (
        <div className="pdetails-alert pdetails-alert--error">
          <i className="fa-solid fa-circle-exclamation" /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="pdetails-form">
        {/* SECTION 1: IDENTITY & CONTACT */}
        <div className="pdetails-section">
          <div className="pdetails-section-head">
            <i className="fa-solid fa-user pdetails-sec-icon" />
            <h3 className="pdetails-sec-title">Identity & Contact Info</h3>
          </div>
          <div className="pdetails-grid">
            <div className="pdetails-field">
              <label htmlFor="pd-name" className="pdetails-label">
                Full Name <span className="pdetails-req">*</span>
              </label>
              {isEditing ? (
                <input
                  id="pd-name"
                  type="text"
                  className="pdetails-input"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Niranjan Sathishkumar"
                  required
                />
              ) : (
                <div className="pdetails-val-display">{formData.name || "—"}</div>
              )}
            </div>

            <div className="pdetails-field">
              <label htmlFor="pd-email" className="pdetails-label">
                Student Email <span className="pdetails-req">*</span>
              </label>
              {isEditing ? (
                <input
                  id="pd-email"
                  type="email"
                  className="pdetails-input"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="student@campus.edu"
                  required
                />
              ) : (
                <div className="pdetails-val-display pdetails-val-display--email">
                  <i className="fa-regular fa-envelope" /> {formData.email || "—"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: ACADEMIC IDENTITY */}
        <div className="pdetails-section">
          <div className="pdetails-section-head">
            <i className="fa-solid fa-graduation-cap pdetails-sec-icon" />
            <h3 className="pdetails-sec-title">Academic Identity</h3>
            <div className="pdetails-badges-row">
              <span className="pdetails-badge pdetails-badge--year">
                <i className="fa-solid fa-calendar-day" /> {computedInfo.label}
              </span>
              <span className={`pdetails-badge ${computedInfo.isEnrolled ? "pdetails-badge--active" : "pdetails-badge--inactive"}`}>
                {computedInfo.isEnrolled ? "Enrolled Student" : "Alumni"}
              </span>
            </div>
          </div>

          <div className="pdetails-grid">
            <div className="pdetails-field">
              <label htmlFor="pd-rollNo" className="pdetails-label">
                Roll Number <span className="pdetails-req">*</span>
              </label>
              {isEditing ? (
                <input
                  id="pd-rollNo"
                  type="text"
                  className="pdetails-input pdetails-input--code"
                  value={formData.rollNo}
                  onChange={(e) => handleChange("rollNo", e.target.value.toUpperCase())}
                  placeholder="e.g. 21102B0001"
                  required
                />
              ) : (
                <div className="pdetails-val-display pdetails-val-display--code">
                  {formData.rollNo || "—"}
                </div>
              )}
            </div>

            <div className="pdetails-field">
              <label htmlFor="pd-prnNo" className="pdetails-label">
                PRN Number <span className="pdetails-req">*</span>
              </label>
              {isEditing ? (
                <input
                  id="pd-prnNo"
                  type="text"
                  className="pdetails-input pdetails-input--code"
                  value={formData.prnNo}
                  onChange={(e) => handleChange("prnNo", e.target.value.toUpperCase())}
                  placeholder="e.g. 1202100155"
                  required
                />
              ) : (
                <div className="pdetails-val-display pdetails-val-display--code">
                  {formData.prnNo || "—"}
                </div>
              )}
            </div>

            <div className="pdetails-field pdetails-field--span2">
              <label htmlFor="pd-branch" className="pdetails-label">
                Branch / Department <span className="pdetails-req">*</span>
              </label>
              {isEditing ? (
                <select
                  id="pd-branch"
                  className="pdetails-input pdetails-select"
                  value={formData.branch}
                  onChange={(e) => handleChange("branch", e.target.value)}
                  required
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="pdetails-val-display">
                  <i className="fa-solid fa-building-columns pdetails-val-icon" /> {formData.branch || "—"}
                </div>
              )}
            </div>

            <div className="pdetails-field">
              <label htmlFor="pd-yearOfJoining" className="pdetails-label">
                Year of Joining <span className="pdetails-req">*</span>
              </label>
              {isEditing ? (
                <input
                  id="pd-yearOfJoining"
                  type="number"
                  min="2015"
                  max={CURRENT_YEAR_NOW}
                  className="pdetails-input"
                  value={formData.yearOfJoining}
                  onChange={(e) => handleChange("yearOfJoining", e.target.value)}
                  required
                />
              ) : (
                <div className="pdetails-val-display">{formData.yearOfJoining || "—"}</div>
              )}
            </div>

            <div className="pdetails-field">
              <label className="pdetails-label">Calculated Academic Standing</label>
              <div className="pdetails-val-display pdetails-val-display--highlight">
                {computedInfo.label} ({computedInfo.isEnrolled ? "Active Coursework" : "Completed"})
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: DISCOVER PERSONALIZATION */}
        <div className="pdetails-section">
          <div className="pdetails-section-head">
            <i className="fa-solid fa-compass pdetails-sec-icon" />
            <h3 className="pdetails-sec-title">Discover Interest Tags</h3>
          </div>
          <p className="pdetails-sec-desc">
            Tags used by the Discover engine for personalized event, buddy, and club recommendations.
          </p>

          <div className="pdetails-field">
            {isEditing && (
              <div className="pdetails-tag-input-wrap">
                <i className="fa-solid fa-hashtag pdetails-tag-prefix" />
                <input
                  type="text"
                  className="pdetails-input pdetails-input--tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type interest tag (e.g. webdev, ai, robotics) and press Enter…"
                />
              </div>
            )}

            <div className="pdetails-tags-list">
              {formData.interestTags.length === 0 ? (
                <span className="pdetails-empty-tags">No interest tags added yet.</span>
              ) : (
                formData.interestTags.map((tag) => (
                  <span key={tag} className="pdetails-tag-pill">
                    #{tag}
                    {isEditing && (
                      <button
                        type="button"
                        className="pdetails-tag-remove"
                        onClick={() => handleRemoveTag(tag)}
                        title={`Remove #${tag}`}
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: PROFILE & BACKGROUND */}
        <div className="pdetails-section">
          <div className="pdetails-section-head">
            <i className="fa-solid fa-id-card-clip pdetails-sec-icon" />
            <h3 className="pdetails-sec-title">Profile & Educational Background</h3>
          </div>

          <div className="pdetails-field">
            <div className="pdetails-label-row">
              <label htmlFor="pd-bio" className="pdetails-label">
                Short Bio
              </label>
              {isEditing && (
                <span className="pdetails-char-count">
                  {formData.bio.length}/300 chars
                </span>
              )}
            </div>
            {isEditing ? (
              <textarea
                id="pd-bio"
                className="pdetails-input pdetails-textarea"
                maxLength={300}
                rows={3}
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Share a short summary about yourself, your passion, or projects…"
              />
            ) : (
              <div className="pdetails-val-display pdetails-val-display--bio">
                {formData.bio || "No bio added yet."}
              </div>
            )}
          </div>

          {/* SKILLS */}
          <div className="pdetails-field" style={{ marginTop: "16px" }}>
            <label className="pdetails-label">Skills & Tech Stack</label>
            {isEditing && (
              <div className="pdetails-tag-input-wrap">
                <i className="fa-solid fa-code pdetails-tag-prefix" />
                <input
                  type="text"
                  className="pdetails-input pdetails-input--tag"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Type skill (e.g. React, Python, Figma) and press Enter…"
                />
              </div>
            )}

            <div className="pdetails-tags-list">
              {formData.skills.length === 0 ? (
                <span className="pdetails-empty-tags">No skills listed.</span>
              ) : (
                formData.skills.map((skill) => (
                  <span key={skill} className="pdetails-skill-pill">
                    {skill}
                    {isEditing && (
                      <button
                        type="button"
                        className="pdetails-tag-remove"
                        onClick={() => handleRemoveSkill(skill)}
                        title={`Remove ${skill}`}
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* EDUCATION BACKGROUND */}
          <div className="pdetails-field" style={{ marginTop: "16px" }}>
            <label className="pdetails-label">Education Background</label>
            {isEditing && (
              <div className="pdetails-tag-input-wrap">
                <i className="fa-solid fa-building-columns pdetails-tag-prefix" />
                <input
                  type="text"
                  className="pdetails-input pdetails-input--tag"
                  value={eduInput}
                  onChange={(e) => setEduInput(e.target.value)}
                  onKeyDown={handleAddEdu}
                  placeholder="Add education qualification (e.g. Higher Secondary Certificate - 92%) and press Enter…"
                />
              </div>
            )}

            <ul className="pdetails-edu-list">
              {formData.education.length === 0 ? (
                <li className="pdetails-empty-tags">No education details added.</li>
              ) : (
                formData.education.map((edu, idx) => (
                  <li key={idx} className="pdetails-edu-item">
                    <i className="fa-solid fa-award pdetails-edu-icon" />
                    <span className="pdetails-edu-text">{edu}</span>
                    {isEditing && (
                      <button
                        type="button"
                        className="pdetails-edu-remove"
                        onClick={() => handleRemoveEdu(idx)}
                        title="Remove entry"
                      >
                        <i className="fa-solid fa-trash-can" />
                      </button>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* SECTION 5: SOCIAL LINKS */}
        <div className="pdetails-section">
          <div className="pdetails-section-head">
            <i className="fa-solid fa-globe pdetails-sec-icon" />
            <h3 className="pdetails-sec-title">Social Links</h3>
          </div>

          <div className="pdetails-grid">
            <div className="pdetails-field">
              <label htmlFor="pd-social-linkedin" className="pdetails-label">
                LinkedIn
              </label>
              {isEditing ? (
                <div className="pdetails-input-icon-wrap">
                  <i className="fa-brands fa-linkedin pdetails-field-icon" />
                  <input
                    id="pd-social-linkedin"
                    type="url"
                    className="pdetails-input pdetails-input--icon"
                    value={getSocialUrl(formData.socialLinks, "linkedin")}
                    onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              ) : (
                <div className="pdetails-val-display pdetails-val-display--social">
                  <i className="fa-brands fa-linkedin pdetails-social-icon pdetails-social-icon--linkedin" />
                  {getSocialUrl(formData.socialLinks, "linkedin") ? (
                    <a
                      href={getSocialUrl(formData.socialLinks, "linkedin")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdetails-social-link"
                    >
                      {getSocialUrl(formData.socialLinks, "linkedin")}
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              )}
            </div>

            <div className="pdetails-field">
              <label htmlFor="pd-social-github" className="pdetails-label">
                GitHub
              </label>
              {isEditing ? (
                <div className="pdetails-input-icon-wrap">
                  <i className="fa-brands fa-github pdetails-field-icon" />
                  <input
                    id="pd-social-github"
                    type="url"
                    className="pdetails-input pdetails-input--icon"
                    value={getSocialUrl(formData.socialLinks, "github")}
                    onChange={(e) => handleSocialChange("github", e.target.value)}
                    placeholder="https://github.com/username"
                  />
                </div>
              ) : (
                <div className="pdetails-val-display pdetails-val-display--social">
                  <i className="fa-brands fa-github pdetails-social-icon pdetails-social-icon--github" />
                  {getSocialUrl(formData.socialLinks, "github") ? (
                    <a
                      href={getSocialUrl(formData.socialLinks, "github")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdetails-social-link"
                    >
                      {getSocialUrl(formData.socialLinks, "github")}
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              )}
            </div>

            <div className="pdetails-field pdetails-field--span2">
              <label htmlFor="pd-social-instagram" className="pdetails-label">
                Instagram
              </label>
              {isEditing ? (
                <div className="pdetails-input-icon-wrap">
                  <i className="fa-brands fa-instagram pdetails-field-icon" />
                  <input
                    id="pd-social-instagram"
                    type="url"
                    className="pdetails-input pdetails-input--icon"
                    value={getSocialUrl(formData.socialLinks, "instagram")}
                    onChange={(e) => handleSocialChange("instagram", e.target.value)}
                    placeholder="https://instagram.com/username"
                  />
                </div>
              ) : (
                <div className="pdetails-val-display pdetails-val-display--social">
                  <i className="fa-brands fa-instagram pdetails-social-icon pdetails-social-icon--instagram" />
                  {getSocialUrl(formData.socialLinks, "instagram") ? (
                    <a
                      href={getSocialUrl(formData.socialLinks, "instagram")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdetails-social-link"
                    >
                      {getSocialUrl(formData.socialLinks, "instagram")}
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 6: DANGER ZONE */}
        <div className="pdetails-danger-card">
          <div className="pdetails-danger-header">
            <h3 className="pdetails-danger-title">Danger Zone</h3>
            <p className="pdetails-danger-desc">
              Once you delete your academic profile, there is no going back. Please be certain.
            </p>
          </div>
          <button
            type="button"
            className="pdetails-btn-danger"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete your academic profile? This action cannot be undone.")) {
                if (onDeleteAccount) onDeleteAccount();
              }
            }}
          >
            Delete Account
          </button>
        </div>

        {/* BOTTOM FORM ACTIONS */}
        {isEditing && (
          <div className="pdetails-actions-bar">
            <button
              type="button"
              className="pdetails-btn pdetails-btn--cancel"
              onClick={() => {
                setIsEditing(false);
                setErrorMsg("");
              }}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pdetails-btn pdetails-btn--save"
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" /> Saving Changes…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk" /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default PersonalDetailsTab;

