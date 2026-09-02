import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Download, Link as LinkIcon, X } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   IMAGE LIGHTBOX
   ───────────────────────────────────────────────────────────── */

export default function ImageLightbox({ images, startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setCurrent(i => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setCurrent(i => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [images.length, onClose]);

  const copyLink = () => {
    navigator.clipboard.writeText(images[current]).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col bg-[#0A0A0A]/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b border-white/10">
        <span className="font-mono text-xs text-white/50 uppercase tracking-widest">
          {current + 1} of {images.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomed(z => !z)}
            className="px-3 py-1.5 border border-white/20 rounded-sm text-white/70 hover:text-white hover:border-white/40 transition-colors font-mono text-[0.6rem] uppercase tracking-wider active:scale-95"
          >
            {zoomed ? 'Fit' : 'Zoom'}
          </button>
          <a
            href={images[current]}
            download
            className="p-2 border border-white/20 rounded-sm text-white/70 hover:text-white hover:border-white/40 transition-colors active:scale-95"
            title="Download image"
          >
            <Download size={14} />
          </a>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 rounded-sm text-white/70 hover:text-white hover:border-white/40 transition-colors font-mono text-[0.6rem] uppercase tracking-wider active:scale-95"
          >
            {copied ? 'Copied!' : <><LinkIcon size={13} /> Copy</>}
          </button>
          <button
            onClick={onClose}
            aria-label="Close lightbox"
            className="p-2 border border-white/20 rounded-sm text-white/70 hover:text-white hover:border-white/40 transition-colors active:scale-95 ml-2"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden p-6 md:p-12">
        <button
          onClick={() => setCurrent(i => Math.max(0, i - 1))}
          disabled={current === 0}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 rounded-sm flex items-center justify-center text-white/80 bg-black/40 hover:text-white hover:border-white/50 transition-colors disabled:opacity-20 z-10"
        >
          <ArrowLeft size={18} />
        </button>

        <motion.img
          key={current}
          src={images[current]}
          alt={`Image ${current + 1} of ${images.length}`}
          className={`rounded-sm shadow-2xl transition-all duration-300 ${zoomed ? 'max-h-none max-w-none scale-125 cursor-zoom-out' : 'max-h-full max-w-full object-contain cursor-zoom-in'}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          onClick={() => setZoomed(z => !z)}
        />

        <button
          onClick={() => setCurrent(i => Math.min(images.length - 1, i + 1))}
          disabled={current === images.length - 1}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 rounded-sm flex items-center justify-center text-white/80 bg-black/40 hover:text-white hover:border-white/50 transition-colors disabled:opacity-20 z-10"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex-shrink-0 px-6 py-3 flex gap-2 justify-center overflow-x-auto border-t border-white/10">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`View image ${i + 1}`}
              className={`flex-shrink-0 w-12 h-9 rounded-sm overflow-hidden border-2 transition-all ${i === current ? 'border-[#991B1B] opacity-100 scale-105' : 'border-white/20 opacity-40 hover:opacity-80'}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
