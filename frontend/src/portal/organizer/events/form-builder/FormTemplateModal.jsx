/**
 * Template picker for seeding a registration form.
 */
import { motion } from 'motion/react';
import { FORM_TEMPLATES } from '@/portal/organizer/events/registrationFormTemplates';
import { Sparkle, X } from '@phosphor-icons/react';

export default function FormTemplateModal({
  applyTemplate,
  setShowTemplateModal,
}) {
  return (
    <div
      className="org-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowTemplateModal(false);
      }}
    >
      <motion.div
        className="org-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ maxWidth: 580 }}
      >
        <div className="org-modal-header border-b border-[#D8D2C4] pb-3">
          <div className="flex items-center gap-2">
            <Sparkle size={18} className="text-amber-600" />
            <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#0F172A]">
              Load Registration Form Template
            </h3>
          </div>
          <button
            type="button"
            className="p-1 rounded text-gray-500 hover:text-gray-800"
            onClick={() => setShowTemplateModal(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="org-modal-body p-4 space-y-3">
          <p className="text-xs text-gray-600 leading-relaxed font-['Plus_Jakarta_Sans']">
            Choose a pre-configured template with curated questions, validation rules, and guidance tailored to your event format:
          </p>

          <div className="space-y-2.5 pt-1">
            {Object.entries(FORM_TEMPLATES).map(([key, tpl]) => (
              <div
                key={key}
                className="p-3.5 bg-white border-2 border-[#D8D2C4] hover:border-[#1A3A2A] rounded-xl flex items-center justify-between gap-3 transition-all cursor-pointer group"
                onClick={() => applyTemplate(key)}
              >
                <div className="space-y-1">
                  <h4 className="font-['Space_Grotesk'] font-bold text-xs text-[#0F172A] group-hover:text-[#1A3A2A]">
                    {tpl.name}
                  </h4>
                  <p className="text-[11px] text-gray-600 font-['Plus_Jakarta_Sans']">{tpl.desc}</p>
                  <span className="text-[10px] font-mono text-gray-500 block">
                    Includes {tpl.fields.length} curated questions
                  </span>
                </div>
                <button
                  type="button"
                  className="org-btn org-btn-secondary !py-1 !px-3 text-xs flex-shrink-0"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="org-modal-footer bg-[#FAF8F5] border-t border-[#D8D2C4] p-3 px-4 flex justify-end">
          <button
            type="button"
            className="org-btn org-btn-ghost !py-1.5 !px-3 text-xs"
            onClick={() => setShowTemplateModal(false)}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
