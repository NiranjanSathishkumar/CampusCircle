/**
 * Profile identity, bio, skills and danger-zone controls.
 */
import { BRANCH_OPTIONS } from '@/mocks/profile.mock';
import { GithubLogo, InstagramLogo, LinkedinLogo, PencilSimple, X } from '@phosphor-icons/react';

export default function PersonalDetailsTab({
  formData,
  formErrors,
  handleAddEducation,
  handleAddSkill,
  handleAddTag,
  handleCancelEditing,
  handleFormChange,
  handleRemoveEducation,
  handleRemoveSkill,
  handleRemoveTag,
  handleSaveProfile,
  handleSocialChange,
  handleStartEditing,
  isEditing,
  isSaving,
  newEduInput,
  newSkillInput,
  newTagInput,
  profileData,
  setNewEduInput,
  setNewSkillInput,
  setNewTagInput,
  setShowDangerModal,
  standing,
}) {
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <div className="profile-section-header">
        <div>
          <h2 className="profile-section-title">Academic & Personal Profile</h2>
          <p className="profile-section-desc">
            Manage your official student identity, academic standing, skills, and contact handles.
          </p>
        </div>
        {!isEditing ? (
          <button className="btn-primary" onClick={handleStartEditing} style={{ fontSize: '0.8125rem' }}>
            <PencilSimple size={14} />
            Edit Details
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={handleCancelEditing} style={{ fontSize: '0.8125rem' }}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleSaveProfile} disabled={isSaving} style={{ fontSize: '0.8125rem' }}>
              {isSaving ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {!isEditing ? (
        /* ── VIEW MODE ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Identity Grid */}
          <div className="profile-details-grid">
            <div className="profile-detail-card">
              <span className="profile-detail-label">Full Name</span>
              <p className="profile-detail-value">{profileData.name || '—'}</p>
            </div>
            <div className="profile-detail-card">
              <span className="profile-detail-label">Student Email</span>
              <p className="profile-detail-value">{profileData.email || '—'}</p>
            </div>
            <div className="profile-detail-card">
              <span className="profile-detail-label">Roll Number</span>
              <p className="profile-detail-value" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {profileData.rollNo || '—'}
              </p>
            </div>
            <div className="profile-detail-card">
              <span className="profile-detail-label">PRN Number</span>
              <p className="profile-detail-value" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {profileData.prnNo || '—'}
              </p>
            </div>
            <div className="profile-detail-card">
              <span className="profile-detail-label">Branch / Department</span>
              <p className="profile-detail-value">{profileData.branch || '—'}</p>
            </div>
            <div className="profile-detail-card">
              <span className="profile-detail-label">Year of Joining & Standing</span>
              <p className="profile-detail-value">
                {profileData.yearOfJoining} ({standing.standing} · {standing.status})
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="profile-detail-card">
            <span className="profile-detail-label">About / Bio</span>
            <p className={`profile-detail-value ${!profileData.bio ? 'empty' : ''}`} style={{ lineHeight: 1.6 }}>
              {profileData.bio || 'No bio added yet'}
            </p>
          </div>

          {/* Interest Tags */}
          <div className="profile-detail-card">
            <span className="profile-detail-label">Interest Tags</span>
            {profileData.interestTags?.length > 0 ? (
              <div className="profile-tags-wrap">
                {profileData.interestTags.map(tag => (
                  <span key={tag} className="profile-tag-chip">{tag}</span>
                ))}
              </div>
            ) : (
              <p className="profile-detail-value empty">No interest tags added</p>
            )}
          </div>

          {/* Skills */}
          <div className="profile-detail-card">
            <span className="profile-detail-label">Skills & Technology Stack</span>
            {profileData.skills?.length > 0 ? (
              <div className="profile-tags-wrap">
                {profileData.skills.map(skill => (
                  <span key={skill} className="profile-skill-chip">{skill}</span>
                ))}
              </div>
            ) : (
              <p className="profile-detail-value empty">No skills listed yet</p>
            )}
          </div>

          {/* Education */}
          <div className="profile-detail-card">
            <span className="profile-detail-label">Educational Background</span>
            {profileData.education?.length > 0 ? (
              <ul style={{ paddingLeft: '1.25rem', margin: 0, color: '#374151', fontSize: '0.875rem', lineHeight: 1.6 }}>
                {profileData.education.map((edu, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>{edu}</li>
                ))}
              </ul>
            ) : (
              <p className="profile-detail-value empty">No educational background added</p>
            )}
          </div>

          {/* Social Links */}
          <div className="profile-detail-card">
            <span className="profile-detail-label">Social & Professional Links</span>
            {Object.keys(profileData.socialLinks || {}).length > 0 ? (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: 4 }}>
                {profileData.socialLinks.linkedin && (
                  <a href={profileData.socialLinks.linkedin} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                    <LinkedinLogo size={15} style={{ color: '#0A66C2' }} />
                    LinkedIn
                  </a>
                )}
                {profileData.socialLinks.github && (
                  <a href={profileData.socialLinks.github} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                    <GithubLogo size={15} />
                    GitHub
                  </a>
                )}
                {profileData.socialLinks.instagram && (
                  <a href={profileData.socialLinks.instagram} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                    <InstagramLogo size={15} style={{ color: '#E4405F' }} />
                    Instagram
                  </a>
                )}
              </div>
            ) : (
              <p className="profile-detail-value empty">No social links provided</p>
            )}
          </div>

          {/* Danger Zone */}
          <div className="danger-zone-card">
            <div>
              <p className="danger-zone-title">Danger Zone</p>
              <p className="danger-zone-desc">Permanently remove your account, student profile, and media from CampusCircle.</p>
            </div>
            <button className="btn-danger" onClick={() => setShowDangerModal(true)}>
              Delete Account
            </button>
          </div>
        </div>
      ) : (
        /* ── EDIT MODE ── */
        <div className="profile-edit-form">
          {formErrors._global && (
            <div className="events-conflict-notice" style={{ background: 'rgba(153,27,27,0.08)', borderColor: 'rgba(153,27,27,0.25)', marginBottom: '1rem' }} role="alert">
              <p className="events-conflict-text" style={{ color: '#991B1B' }}>{formErrors._global}</p>
            </div>
          )}
          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label className="profile-form-label">Full Name *</label>
              <input
                type="text"
                className="profile-form-input"
                value={formData.name}
                onChange={e => handleFormChange('name', e.target.value)}
              />
              {formErrors.name && <span style={{ color: '#991B1B', fontSize: '0.75rem' }}>{formErrors.name}</span>}
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Student Email *</label>
              <input
                type="email"
                className="profile-form-input"
                value={formData.email}
                onChange={e => handleFormChange('email', e.target.value)}
              />
              {formErrors.email && <span style={{ color: '#991B1B', fontSize: '0.75rem' }}>{formErrors.email}</span>}
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Roll Number</label>
              <input
                type="text"
                className="profile-form-input"
                value={formData.rollNo}
                onChange={e => handleFormChange('rollNo', e.target.value)}
                placeholder="e.g. 121A1042"
              />
              {formErrors.rollNo && <span style={{ color: '#991B1B', fontSize: '0.75rem' }}>{formErrors.rollNo}</span>}
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">PRN Number</label>
              <input
                type="text"
                className="profile-form-input"
                value={formData.prnNo}
                onChange={e => handleFormChange('prnNo', e.target.value)}
                placeholder="e.g. 2022016401234567"
              />
              {formErrors.prnNo && <span style={{ color: '#991B1B', fontSize: '0.75rem' }}>{formErrors.prnNo}</span>}
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Branch / Department *</label>
              <select
                className="profile-form-select"
                value={formData.branch || ''}
                onChange={e => handleFormChange('branch', e.target.value)}
              >
                <option value="">Select Branch</option>
                {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {formErrors.branch && <span style={{ color: '#991B1B', fontSize: '0.75rem' }}>{formErrors.branch}</span>}
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Year of Joining * (2015–{currentYear})</label>
              <input
                type="number"
                min="2015"
                max={currentYear}
                className="profile-form-input"
                value={formData.yearOfJoining}
                onChange={e => handleFormChange('yearOfJoining', e.target.value)}
              />
              {formErrors.yearOfJoining && <span style={{ color: '#991B1B', fontSize: '0.75rem' }}>{formErrors.yearOfJoining}</span>}
            </div>
          </div>

          {/* Bio with 300 char counter */}
          <div className="profile-form-group">
            <label className="profile-form-label">Bio / Summary (Max 300 characters)</label>
            <textarea
              className="profile-form-textarea"
              maxLength={300}
              value={formData.bio}
              onChange={e => handleFormChange('bio', e.target.value)}
              placeholder="Tell verified peers about yourself…"
            />
            <div className={`bio-counter ${formData.bio?.length >= 300 ? 'limit' : ''}`}>
              {formData.bio?.length || 0} / 300 characters
            </div>
          </div>

          {/* Interest Tags */}
          <div className="profile-form-group">
            <label className="profile-form-label">Interest Tags (Press Enter or comma to add)</label>
            <input
              type="text"
              className="profile-form-input"
              placeholder="Type interest tag e.g. webdev, ai/ml, robotics…"
              value={newTagInput}
              onChange={e => setNewTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            <div className="profile-editable-chips">
              {formData.interestTags?.map(tag => (
                <span key={tag} className="profile-editable-chip">
                  {tag}
                  <button className="profile-chip-remove" onClick={() => handleRemoveTag(tag)} aria-label={`Remove tag ${tag}`}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="profile-form-group">
            <label className="profile-form-label">Skills & Tech Stack (Press Enter or comma to add)</label>
            <input
              type="text"
              className="profile-form-input"
              placeholder="Type skill e.g. React, Node.js, Python…"
              value={newSkillInput}
              onChange={e => setNewSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
            />
            <div className="profile-editable-chips">
              {formData.skills?.map(skill => (
                <span key={skill} className="profile-editable-chip">
                  {skill}
                  <button className="profile-chip-remove" onClick={() => handleRemoveSkill(skill)} aria-label={`Remove skill ${skill}`}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Education Entries */}
          <div className="profile-form-group">
            <label className="profile-form-label">Educational Background (Press Enter to add)</label>
            <input
              type="text"
              className="profile-form-input"
              placeholder="Add education qualification…"
              value={newEduInput}
              onChange={e => setNewEduInput(e.target.value)}
              onKeyDown={handleAddEducation}
            />
            <ul style={{ paddingLeft: '1.25rem', marginTop: 8, fontSize: '0.8125rem' }}>
              {formData.education?.map((edu, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>
                  <span>{edu}</span>
                  <button
                    onClick={() => handleRemoveEducation(idx)}
                    style={{ background: 'none', border: 'none', color: '#991B1B', marginLeft: 8, cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label className="profile-form-label">LinkedIn URL</label>
              <input
                type="url"
                className="profile-form-input"
                value={formData.socialLinks?.linkedin || ''}
                onChange={e => handleSocialChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
              {formErrors.linkedin && <span style={{ color: '#991B1B', fontSize: '0.75rem' }}>{formErrors.linkedin}</span>}
            </div>
            <div className="profile-form-group">
              <label className="profile-form-label">GitHub URL</label>
              <input
                type="url"
                className="profile-form-input"
                value={formData.socialLinks?.github || ''}
                onChange={e => handleSocialChange('github', e.target.value)}
                placeholder="https://github.com/username"
              />
              {formErrors.github && <span style={{ color: '#991B1B', fontSize: '0.75rem' }}>{formErrors.github}</span>}
            </div>
            <div className="profile-form-group">
              <label className="profile-form-label">Instagram URL</label>
              <input
                type="url"
                className="profile-form-input"
                value={formData.socialLinks?.instagram || ''}
                onChange={e => handleSocialChange('instagram', e.target.value)}
                placeholder="https://instagram.com/username"
              />
              {formErrors.instagram && <span style={{ color: '#991B1B', fontSize: '0.75rem' }}>{formErrors.instagram}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="profile-form-actions">
            <button className="btn-secondary" onClick={handleCancelEditing}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
