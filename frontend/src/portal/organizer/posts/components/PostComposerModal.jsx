import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import {
  ChatCircle,
  CircleNotch,
  CloudArrowUp,
  Eye,
  FileDoc,
  FilePdf,
  FilePpt,
  FileText,
  FileXls,
  GlobeSimple,
  Heart,
  Image as ImageIcon,
  Paperclip,
  PencilSimple,
  ShieldCheck,
  VideoCamera,
  Warning,
  X,
} from '@phosphor-icons/react';
import {
  ACCEPTED_ATTACHMENT_EXT,
  ACCEPTED_ATTACHMENT_TYPES,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE,
  TYPE_CONFIG,
} from '@/portal/organizer/posts/postsConstants';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';

const KIND_ICON = { image: ImageIcon, video: VideoCamera, pdf: FilePdf, doc: FileDoc, ppt: FilePpt, xls: FileXls, document: FileText };
const KIND_COLOR = { image: '#0D9488', video: '#4C1D95', pdf: '#991B1B', doc: '#1E3A5F', ppt: '#B45309', xls: '#166534', document: '#6B7280' };

const extOf = (name = '') => (name.split('.').pop() || '').toLowerCase();

const kindFromExt = (ext) => {
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'mov'].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'doc';
  if (['ppt', 'pptx'].includes(ext)) return 'ppt';
  if (['xls', 'xlsx'].includes(ext)) return 'xls';
  return 'document';
};

// Existing attachments only carry a coarse image/video/document type from the
// API, so documents are further split into pdf/doc/ppt/xls by filename for icon purposes.
const kindOfExisting = (attachment) => {
  if (attachment.type === 'image' || attachment.type === 'video') return attachment.type;
  return kindFromExt(extOf(attachment.filename));
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function PostComposerModal({ draft, onChange, onClose, onSave, saving, communityName }) {
  const modalRef = useRef(null);
  const discardModalRef = useRef(null);
  const objectUrlsRef = useRef(new Set());
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState('');

  const visibleExisting = draft.existingAttachments.filter((a) => !draft.removedAttachmentIds.includes(a._id));
  const attachmentCount = visibleExisting.length + draft.newFiles.length;

  const isDirty = Boolean(
    draft.title.trim() || draft.body.trim() || draft.newFiles.length > 0 || draft.removedAttachmentIds.length > 0,
  );

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  useFocusTrap(modalRef, !showDiscardConfirm, handleCloseAttempt);
  useFocusTrap(discardModalRef, showDiscardConfirm, () => setShowDiscardConfirm(false));

  const handleSaveAction = (isPublished) => {
    if (saving || !draft.title.trim() || !draft.body.trim()) return;
    onSave(draft, isPublished);
  };

  // Revokes every blob: preview URL this modal instance created, whenever it unmounts.
  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;

    let currentCount = attachmentCount;
    const accepted = [];
    let error = '';

    for (const file of incoming) {
      if (currentCount >= MAX_ATTACHMENTS) {
        error = `Attachment limit reached (max ${MAX_ATTACHMENTS} per post).`;
        break;
      }
      const kind = ACCEPTED_ATTACHMENT_TYPES[file.type];
      if (!kind) {
        error = `"${file.name}" isn't a supported file type.`;
        continue;
      }
      if (file.size > MAX_ATTACHMENT_SIZE) {
        error = `"${file.name}" exceeds the ${Math.round(MAX_ATTACHMENT_SIZE / (1024 * 1024))}MB limit.`;
        continue;
      }
      const previewUrl = kind === 'image' ? URL.createObjectURL(file) : '';
      if (previewUrl) objectUrlsRef.current.add(previewUrl);
      accepted.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file, previewUrl, kind });
      currentCount += 1;
    }

    if (accepted.length) onChange({ ...draft, newFiles: [...draft.newFiles, ...accepted] });
    setFileError(error);
  };

  const handleFileInput = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  };

  const removeNewFile = (id) => {
    const target = draft.newFiles.find((f) => f.id === id);
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl);
      objectUrlsRef.current.delete(target.previewUrl);
    }
    onChange({ ...draft, newFiles: draft.newFiles.filter((f) => f.id !== id) });
    setFileError('');
  };

  const removeExistingAttachment = (id) => {
    onChange({ ...draft, removedAttachmentIds: [...draft.removedAttachmentIds, id] });
    setFileError('');
  };

  // First image across existing + newly-picked attachments becomes the feed cover.
  const coverUrl =
    visibleExisting.find((a) => kindOfExisting(a) === 'image')?.url ||
    draft.newFiles.find((f) => f.kind === 'image')?.previewUrl ||
    '';

  return (
    <div className="org-modal-overlay" onClick={(e) => e.target === e.currentTarget && handleCloseAttempt()}>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2 }}
        className="org-modal org-post-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
      >
        {/* Modal Header */}
        <div className="org-modal-header">
          <div>
            <h2 className="org-modal-title" id="post-modal-title">
              {draft.id ? 'Edit Announcement' : 'Compose Announcement'}
            </h2>
            <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mt-0.5">
              Publish updates to student Discover feed & send follower alerts.
            </p>
          </div>
          <button className="org-icon-btn" onClick={handleCloseAttempt} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Modal Navigation Tabs (Edit Form vs Live Preview) */}
        <div className="org-post-modal-tabs">
          <button
            type="button"
            className={`org-post-modal-tab ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            <PencilSimple size={14} />
            <span>Composer Form</span>
          </button>
          <button
            type="button"
            className={`org-post-modal-tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={14} />
            <span>Live Student Discover Preview</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="org-modal-body">
          {activeTab === 'edit' ? (
            <div className="space-y-4">
              {/* Type Select */}
              <div className="org-form-group">
                <label className="org-form-label">Post Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const active = draft.type === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onChange({ ...draft, type: key })}
                        className={`org-type-select-btn ${active ? 'active' : ''}`}
                        style={{
                          borderColor: active ? cfg.color : undefined,
                          backgroundColor: active ? cfg.bg : undefined,
                          color: active ? cfg.color : undefined,
                        }}
                      >
                        <Icon size={14} weight={active ? 'fill' : 'regular'} />
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="org-form-group">
                <label htmlFor="post-title" className="org-form-label">
                  Headline Title <span className="text-[#991B1B]">*</span>
                </label>
                <input
                  id="post-title"
                  className="org-form-input"
                  value={draft.title}
                  onChange={(e) => onChange({ ...draft, title: e.target.value })}
                  placeholder="e.g. HackCampus 2026 Applications Officially Open"
                  maxLength={200}
                />
              </div>

              {/* Body */}
              <div className="org-form-group">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="post-body" className="org-form-label">
                    Post Body Content <span className="text-[#991B1B]">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-gray-400">
                    {draft.body.length}/3000 chars
                  </span>
                </div>
                <textarea
                  id="post-body"
                  className="org-form-textarea"
                  rows={4}
                  value={draft.body}
                  onChange={(e) => onChange({ ...draft, body: e.target.value })}
                  placeholder="Write clear, engaging announcements for students…"
                  maxLength={3000}
                />
              </div>

              {/* Attachments */}
              <div className="org-form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="org-form-label">
                    Attachments <span className="org-form-hint normal-case">(optional)</span>
                  </label>
                  <span className="text-[11px] font-mono text-gray-400">
                    {attachmentCount}/{MAX_ATTACHMENTS}
                  </span>
                </div>

                <label
                  className={`org-attach-dropzone ${dragActive ? 'active' : ''} ${attachmentCount >= MAX_ATTACHMENTS ? 'disabled' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (attachmentCount < MAX_ATTACHMENTS) setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED_ATTACHMENT_EXT}
                    onChange={handleFileInput}
                    disabled={attachmentCount >= MAX_ATTACHMENTS}
                    className="sr-only"
                  />
                  <CloudArrowUp size={22} />
                  <span className="org-attach-dropzone-title">
                    {attachmentCount >= MAX_ATTACHMENTS ? 'Attachment limit reached' : 'Drop files here, or click to browse'}
                  </span>
                  <span className="org-attach-dropzone-hint">
                    Images, video, PDF, DOC, PPT, XLS · up to {MAX_ATTACHMENTS} files · {Math.round(MAX_ATTACHMENT_SIZE / (1024 * 1024))}MB each
                  </span>
                </label>

                {fileError && (
                  <p className="org-attach-error">
                    <Warning size={13} /> {fileError}
                  </p>
                )}

                {attachmentCount > 0 && (
                  <div className="org-attach-grid">
                    {visibleExisting.map((a) => {
                      const kind = kindOfExisting(a);
                      const Icon = KIND_ICON[kind] || FileText;
                      return (
                        <div className="org-attach-item" key={a._id}>
                          {kind === 'image' ? (
                            <img src={a.url} alt={a.filename || 'Attachment'} className="org-attach-thumb" />
                          ) : (
                            <div className="org-attach-icon" style={{ color: KIND_COLOR[kind], backgroundColor: `${KIND_COLOR[kind]}18` }}>
                              <Icon size={22} />
                            </div>
                          )}
                          <span className="org-attach-name" title={a.filename}>
                            {a.filename || kind}
                          </span>
                          <button
                            type="button"
                            className="org-attach-remove"
                            onClick={() => removeExistingAttachment(a._id)}
                            aria-label="Remove attachment"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}

                    {draft.newFiles.map((f) => {
                      const Icon = KIND_ICON[f.kind] || FileText;
                      return (
                        <div className="org-attach-item org-attach-item--new" key={f.id}>
                          {f.previewUrl ? (
                            <img src={f.previewUrl} alt={f.file.name} className="org-attach-thumb" />
                          ) : (
                            <div className="org-attach-icon" style={{ color: KIND_COLOR[f.kind], backgroundColor: `${KIND_COLOR[f.kind]}18` }}>
                              <Icon size={22} />
                            </div>
                          )}
                          <span className="org-attach-name" title={f.file.name}>
                            {f.file.name}
                          </span>
                          <span className="org-attach-size">{formatSize(f.file.size)}</span>
                          <button
                            type="button"
                            className="org-attach-remove"
                            onClick={() => removeNewFile(f.id)}
                            aria-label="Remove file"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Live Student Discover Feed Preview Mode */
            <div className="org-discover-preview-container">
              <div className="org-discover-preview-header">
                <span className="org-discover-preview-tag">
                  <Eye size={12} /> Student Discover Feed View
                </span>
              </div>

              <div className="org-discover-card-mock">
                <div className="org-discover-card-head">
                  <div className="org-discover-avatar">⚡</div>
                  <div>
                    <span className="org-discover-comm-name">
                      {communityName} <ShieldCheck size={13} className="inline text-[#0D9488]" />
                    </span>
                    <span className="org-discover-time">Just now · Followers</span>
                  </div>
                  <span className="org-discover-type-chip font-mono">
                    {TYPE_CONFIG[draft.type]?.label || 'Announcement'}
                  </span>
                </div>

                {coverUrl && (
                  <div className="org-discover-card-img-wrap">
                    <img
                      src={coverUrl}
                      alt={draft.title ? `Cover photo for ${draft.title}` : 'Announcement attachment preview'}
                      className="org-discover-card-img"
                    />
                  </div>
                )}

                <div className="org-discover-card-content">
                  <h4 className="org-discover-card-title">
                    {draft.title || 'Untitled Announcement Headline'}
                  </h4>
                  <p className="org-discover-card-body">
                    {draft.body || 'Post body content preview will appear here as you type in the composer form...'}
                  </p>

                  {attachmentCount > 0 && (
                    <div className="org-discover-attach-chip">
                      <Paperclip size={12} /> {attachmentCount} attachment{attachmentCount === 1 ? '' : 's'}
                    </div>
                  )}

                  <div className="org-discover-card-actions-row">
                    <span className="org-discover-action-item">
                      <Heart size={14} /> 0 Likes
                    </span>
                    <span className="org-discover-action-item">
                      <ChatCircle size={14} /> 0 Comments
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="org-modal-footer">
          <button type="button" className="org-btn org-btn-ghost" onClick={handleCloseAttempt}>
            Cancel
          </button>

          <button
            type="button"
            className="org-btn org-btn-secondary"
            onClick={() => handleSaveAction(false)}
            disabled={saving}
          >
            {saving ? <CircleNotch size={14} className="animate-spin" /> : null}
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            className="org-btn org-btn-primary"
            onClick={() => handleSaveAction(true)}
            disabled={!draft.title.trim() || !draft.body.trim() || saving}
          >
            {saving ? (
              <CircleNotch size={15} className="animate-spin" />
            ) : (
              <GlobeSimple size={15} />
            )}
            <span>
              {saving
                ? 'Publishing…'
                : draft.isPublished
                ? 'Update Post'
                : 'Publish to Feed'}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Discard Confirmation */}
      {showDiscardConfirm && (
        <div
          className="org-modal-overlay"
          style={{ zIndex: 1100 }}
          onClick={(e) => e.target === e.currentTarget && setShowDiscardConfirm(false)}
        >
          <motion.div
            ref={discardModalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="org-modal"
            style={{ maxWidth: 420 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="discard-post-title"
          >
            <div className="org-modal-header">
              <div className="flex items-center gap-2 text-amber-700">
                <Warning size={20} weight="bold" />
                <h2 className="org-modal-title text-amber-900" id="discard-post-title">
                  Discard Unsaved Draft?
                </h2>
              </div>
              <button
                className="org-icon-btn"
                onClick={() => setShowDiscardConfirm(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="org-modal-body">
              <p className="text-xs text-gray-600 leading-relaxed font-['Plus_Jakarta_Sans']">
                You have unsaved changes in this announcement draft. Are you sure you want to discard your work and close?
              </p>
            </div>
            <div className="org-modal-footer">
              <button
                type="button"
                className="org-btn org-btn-ghost"
                onClick={() => setShowDiscardConfirm(false)}
              >
                Keep Editing
              </button>
              <button
                type="button"
                className="org-btn org-btn-danger-solid"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
              >
                Discard Draft
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
