import { ArrowsOut } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   IMAGE GRID (in post card)
   ───────────────────────────────────────────────────────────── */

export default function PostImageGrid({ images, onImageClick }) {
  if (!images || images.length === 0) return null;
  const count = images.length;

  if (count === 1) {
    return (
      <div className="post-grid-1 group relative cursor-pointer" onClick={() => onImageClick(0)}>
        <img src={images[0]} alt="Post image" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
        <div className="absolute inset-0 bg-[#0F172A]/0 group-hover:bg-[#0F172A]/20 transition-colors flex items-center justify-center">
          <ArrowsOut size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="post-grid-2">
        {images.map((img, i) => (
          <div key={i} className="relative group cursor-pointer overflow-hidden" onClick={() => onImageClick(i)}>
            <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
            <div className="absolute inset-0 bg-[#0F172A]/0 group-hover:bg-[#0F172A]/20 transition-colors flex items-center justify-center">
              <ArrowsOut size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="post-grid-3">
        <div className="relative group cursor-pointer overflow-hidden" onClick={() => onImageClick(0)}>
          <img src={images[0]} alt="Image 1" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
          <div className="absolute inset-0 bg-[#0F172A]/0 group-hover:bg-[#0F172A]/20 transition-colors flex items-center justify-center">
            <ArrowsOut size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="post-grid-3-right">
          {images.slice(1, 3).map((img, i) => (
            <div key={i} className="relative group cursor-pointer overflow-hidden" onClick={() => onImageClick(i + 1)}>
              <img src={img} alt={`Image ${i + 2}`} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
              <div className="absolute inset-0 bg-[#0F172A]/0 group-hover:bg-[#0F172A]/20 transition-colors flex items-center justify-center">
                <ArrowsOut size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4 or more
  const extra = count - 4;
  return (
    <div className="post-grid-4">
      {images.slice(0, 4).map((img, i) => (
        <div key={i} className="relative group cursor-pointer overflow-hidden" onClick={() => onImageClick(i)}>
          <img src={img} alt={`Image ${i + 1}`} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
          {i === 3 && extra > 0 ? (
            <div className="absolute inset-0 bg-[#0F172A]/70 flex items-center justify-center">
              <span className="font-display font-bold text-white text-lg">+{extra}</span>
            </div>
          ) : (
            <div className="absolute inset-0 bg-[#0F172A]/0 group-hover:bg-[#0F172A]/20 transition-colors flex items-center justify-center">
              <ArrowsOut size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
