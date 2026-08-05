import React, { useState, useRef } from "react";

function AddCertificateModal({ onClose, onAdd }) {
  const EMPTY_FORM = { title: "", issuer: "", date: "", description: "", imageUrl: null };

  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setForm((f) => ({ ...f, imageUrl: url }));
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.issuer.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        id: Date.now(),
        ...form,
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        description: form.description.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ach-modal-overlay" onClick={onClose}>
      <div className="ach-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal header */}
        <div className="ach-modal-head">
          <h4 className="ach-modal-heading">
            <i className="fa-solid fa-certificate" /> Add Certificate
          </h4>
          <button
            className="ach-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Image upload */}
        <div
          className={`ach-img-upload ${imagePreview ? "ach-img-upload--filled" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          aria-label="Upload certificate image"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Certificate preview"
              className="ach-img-preview"
            />
          ) : (
            <div className="ach-img-placeholder">
              <i className="fa-solid fa-cloud-arrow-up" />
              <span>Click to upload certificate image</span>
              <span className="ach-img-sub">PNG, JPG, PDF preview — max 5 MB</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImagePick}
        />

        {/* Form fields */}
        <div className="ach-modal-fields">
          <div className="ach-modal-field">
            <label className="ach-modal-label" htmlFor="ach-title">
              Certificate / Achievement Title <span className="ach-required">*</span>
            </label>
            <input
              id="ach-title"
              className="ach-modal-input"
              placeholder="e.g. AWS Certified Solutions Architect"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="ach-modal-row">
            <div className="ach-modal-field">
              <label className="ach-modal-label" htmlFor="ach-issuer">
                Issuing Organisation <span className="ach-required">*</span>
              </label>
              <input
                id="ach-issuer"
                className="ach-modal-input"
                placeholder="e.g. Amazon Web Services"
                value={form.issuer}
                onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))}
              />
            </div>
            <div className="ach-modal-field">
              <label className="ach-modal-label" htmlFor="ach-date">
                Issue Date
              </label>
              <input
                id="ach-date"
                type="month"
                className="ach-modal-input"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>

          <div className="ach-modal-field">
            <label className="ach-modal-label" htmlFor="ach-desc">
              Description <span className="ach-optional">(optional)</span>
            </label>
            <textarea
              id="ach-desc"
              className="ach-modal-input ach-modal-textarea"
              placeholder="Briefly describe what you achieved or learned…"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="ach-modal-actions">
          <button className="ach-modal-btn ach-modal-btn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="ach-modal-btn ach-modal-btn--save"
            onClick={handleSubmit}
            disabled={saving || !form.title.trim() || !form.issuer.trim()}
          >
            {saving ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin" /> Saving…
              </>
            ) : (
              <>
                <i className="fa-solid fa-check" /> Post Certificate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCertificateModal;
