import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { ArrowClockwise, Camera, PaperPlaneTilt, Plus, X } from '@phosphor-icons/react';
import { POST_TYPES } from '@/features/discover/discoverConstants';
import Avatar from '@/features/discover/components/DiscoverAvatar';

/* ─────────────────────────────────────────────────────────────
   ORGANIZER COMPOSE PANEL
   ───────────────────────────────────────────────────────────── */

const CHAR_LIMIT = 2000;

const CHAR_WARN = 1800;

export default function ComposePanel({ organizer, onPublish }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [type, setType] = useState('Announcement');
  const [tagsInput, setTagsInput] = useState('');
  const [images, setImages] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const fileRef = useRef(null);

  const handlePublish = async () => {
    if (!body.trim()) return;
    setPublishing(true);
    await new Promise(r => setTimeout(r, 700));
    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    onPublish({ body: body.trim(), type, tags, images });
    setBody(''); setType('Announcement'); setTagsInput(''); setImages([]);
    setPublishing(false); setOpen(false);
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...urls]);
    e.target.value = '';
  };

  const discard = () => { setOpen(false); setBody(''); setType('Announcement'); setTagsInput(''); setImages([]); };

  return (
    <div className={`compose-box ${open ? 'compose-box-active' : ''}`}>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#E8E3D8] transition-colors text-left"
        >
          <Avatar name={organizer.name} color={organizer.color} size={36} />
          <span className="flex-1 text-sm text-[#6B7280] font-sans font-medium">Post an announcement, event, or update for your club...</span>
          <span className="px-3 py-1.5 bg-[#991B1B] text-white rounded-sm font-mono text-[0.6rem] uppercase tracking-wider flex items-center gap-1 font-bold">
            <Plus size={12} /> Create
          </span>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 md:p-5">
              {/* Identity Header */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={organizer.name} color={organizer.color} size={38} />
                <div>
                  <p className="font-display font-bold text-[#0F172A] text-sm">{organizer.name}</p>
                  <p className="font-mono text-[0.5rem] text-[#991B1B] uppercase tracking-wider font-bold">
                    {organizer.community} · Club Organizer
                  </p>
                </div>
              </div>

              {/* Post Type Selector */}
              <div className="mb-3">
                <label className="font-mono text-[0.5rem] text-[#6B7280] uppercase tracking-wider block mb-1.5">Select Post Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {POST_TYPES.map(pt => (
                    <button
                      key={pt.id}
                      onClick={() => setType(pt.id)}
                      className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider text-[0.55rem] px-2.5 py-1.5 border rounded-sm transition-all active:scale-95 ${type === pt.id ? 'text-white border-transparent shadow-sm' : 'border-[#D8D2C4] bg-[#F5F2EA] text-[#6B7280] hover:border-[#9CA3AF]'}`}
                      style={type === pt.id ? { backgroundColor: pt.color, borderColor: pt.color } : {}}
                    >
                      <pt.icon size={10} weight="fill" />{pt.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Post Content Input */}
              <div className="mb-3">
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value.slice(0, CHAR_LIMIT))}
                  placeholder="Share details about your upcoming event, workshop, or announcement..."
                  rows={4}
                  className="w-full px-3.5 py-3 text-sm bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#991B1B] resize-none transition-colors leading-relaxed"
                />
                <div className={`flex justify-end mt-1 font-mono text-[0.52rem] ${body.length >= CHAR_WARN ? 'text-[#991B1B] font-bold' : 'text-[#9CA3AF]'}`}>
                  {body.length} / {CHAR_LIMIT}
                </div>
              </div>

              {/* Attached Images Preview */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-16 h-16 object-cover rounded-sm border border-[#D8D2C4]" />
                      <button
                        onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                        aria-label="Remove image"
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#991B1B] text-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags Field */}
              <div className="mb-4">
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="Tags: hackathon, coding, workshop (comma-separated)"
                  className="w-full px-3 py-2 text-xs bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#991B1B] transition-colors"
                />
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#D8D2C4]">
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-2 border border-[#D8D2C4] rounded-sm text-xs font-mono uppercase tracking-wider text-[#6B7280] hover:text-[#0F172A] hover:border-[#9CA3AF] transition-colors bg-[#F5F2EA]"
                >
                  <Camera size={14} /> Add Images
                </button>
                <button
                  onClick={discard}
                  className="px-3 py-2 border border-[#D8D2C4] rounded-sm text-xs font-mono uppercase tracking-wider text-[#6B7280] hover:text-[#991B1B] hover:border-[#991B1B] transition-colors bg-[#F5F2EA]"
                >
                  Discard
                </button>
                <button
                  onClick={handlePublish}
                  disabled={!body.trim() || publishing}
                  className="ml-auto flex items-center gap-2 px-5 py-2 bg-[#991B1B] text-white rounded-sm text-xs font-mono uppercase tracking-wider font-bold disabled:opacity-40 hover:bg-[#7F1D1D] transition-colors active:scale-[0.98] shadow-sm"
                >
                  {publishing ? <><ArrowClockwise size={14} className="animate-spin" /> Publishing...</> : <><PaperPlaneTilt size={14} /> Publish Post</>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
