/**
 * Wizard step 1 — title, category, description and banner art.
 */
import { motion } from 'motion/react';
import { CATEGORIES } from '@/portal/organizer/events/createEventConstants';
import { CaretRight, Image as ImageIcon, Plus, Tag, Trash, X } from '@phosphor-icons/react';

export default function IdentityStep({
  bannerPreviewUrl,
  category,
  description,
  handleAddTag,
  handleBannerFileChange,
  handleRemoveBanner,
  handleRemoveTag,
  newTagInput,
  setActiveStep,
  setCategory,
  setDescription,
  setNewTagInput,
  setTagline,
  setTitle,
  tagline,
  tags,
  title,
}) {
  return (
    <motion.div
      key="step-identity"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#D8D2C4] rounded-xl p-5 shadow-sm space-y-4"
    >
      <div className="border-b border-[#E6E1D5] pb-3">
        <h2 className="text-base font-bold font-['Space_Grotesk'] text-[#0F172A]">
          Event Identity &amp; Visual Branding
        </h2>
        <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mt-0.5">
          Define your event title, category, promotional banner art, and campus discovery keywords.
        </p>
      </div>

      {/* Title */}
      <div className="org-form-group">
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="evt-create-title" className="org-form-label mb-0">
            Event Title <span className="text-[#991B1B]">*</span>
          </label>
          <span className="text-[10px] font-mono text-gray-400">{title.length} / 100</span>
        </div>
        <input
          id="evt-create-title"
          type="text"
          maxLength={100}
          className="org-form-input !text-base !font-bold font-['Space_Grotesk']"
          placeholder="e.g. Cloud Study Jam — Google Kubernetes Engine Fundamentals"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Tagline / Subtitle */}
      <div className="org-form-group">
        <label htmlFor="evt-create-tagline" className="org-form-label">
          Short Tagline / Hook
        </label>
        <input
          id="evt-create-tagline"
          type="text"
          className="org-form-input text-xs"
          placeholder="e.g. Master container orchestration and earn verifiable Google Cloud skill badges."
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
        />
      </div>

      {/* Category Selection */}
      <div className="org-form-group">
        <label className="org-form-label">Event Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#1A3A2A]/5 border-[#1A3A2A] text-[#1A3A2A] ring-1 ring-[#1A3A2A]'
                    : 'bg-[#FAF8F5] border-[#D8D2C4] text-gray-700 hover:border-gray-400'
                }`}
                onClick={() => setCategory(cat.id)}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Poster Cover Banner */}
      <div className="org-form-group">
        <label className="org-form-label">Event Cover Poster Art</label>
        <div className="space-y-2.5">
          {bannerPreviewUrl ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-[#D8D2C4] aspect-video max-w-md shadow-xs">
              <img src={bannerPreviewUrl} alt="Banner preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemoveBanner}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-700 text-white p-1.5 rounded-full transition-colors shadow-xs"
                title="Remove banner"
                aria-label="Remove banner"
              >
                <Trash size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#D8D2C4] rounded-xl p-8 cursor-pointer hover:border-[#991B1B] hover:bg-[#FAF8F5] transition-colors max-w-md">
              <ImageIcon size={26} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-700">Click to upload banner artwork</span>
              <span className="text-[10px] font-mono text-gray-400">Recommended 16:9 ratio · PNG or JPG up to 5MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleBannerFileChange} />
            </label>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="org-form-group">
        <label className="org-form-label">Discovery Tags &amp; Topics</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="org-form-input flex-1 text-xs"
              placeholder="Type a tag and press Enter or Add (e.g. kubernetes, python, ai)"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <button
              type="button"
              className="org-btn org-btn-ghost text-xs"
              onClick={handleAddTag}
            >
              <Plus size={13} /> Add Tag
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 bg-[#FAF8F5] border border-[#D8D2C4] px-2 py-0.5 rounded-full text-xs font-mono text-gray-700"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-gray-400 hover:text-red-600 ml-0.5"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="org-form-group">
        <label htmlFor="evt-create-desc" className="org-form-label">
          Detailed Description &amp; Prerequisites
        </label>
        <textarea
          id="evt-create-desc"
          rows={5}
          className="org-form-textarea text-xs"
          placeholder="Provide comprehensive details about the session structure, prerequisites, what participants will build, and what to bring..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#E6E1D5]">
        <button
          type="button"
          className="org-btn org-btn-ghost text-xs text-gray-500 hover:text-gray-900"
          onClick={() => setActiveStep('preview')}
        >
          <span className="font-mono">⚡ Quick Preview</span>
        </button>
        <button
          type="button"
          className="org-btn org-btn-primary text-xs"
          onClick={() => setActiveStep('schedule')}
        >
          <span>Next: Schedule &amp; Venue</span>
          <CaretRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}
