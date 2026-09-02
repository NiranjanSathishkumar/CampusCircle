/**
 * ImageCropModal.jsx — pan/zoom crop UI shared by student avatar/banner
 * and organizer logo/banner uploads.
 * No external cropping library: a viewport div masks a plain <img>, drag repositions
 * it via pointer events, and a range slider scales it; Save reads the same
 * transform back out to draw the visible region onto an output canvas.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, MagnifyingGlassMinus, MagnifyingGlassPlus, ArrowCounterClockwise, CircleNotch } from '@phosphor-icons/react';

const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const WHEEL_STEP = 0.08;

export default function ImageCropModal({
  file,
  title,
  saveLabel = 'Save',
  shape = 'rect', // 'rect' | 'circle'
  viewportWidth,
  viewportHeight,
  outputWidth,
  outputHeight,
  onCancel,
  onConfirm, // async (blob) => void
}) {
  const [imgUrl, setImgUrl] = useState('');
  const [natural, setNatural] = useState(null); // { w, h }
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const imgRef = useRef(null);
  const dragRef = useRef(null); // single-pointer pan: {startX, startY, startOffset}
  const pinchRef = useRef(null); // two-pointer pinch: {startDist, startZoom}
  const pointersRef = useRef(new Map()); // pointerId -> {x, y}, tracks active touches for pinch

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    setNatural(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Escape cancels, same as clicking outside — but not mid-save, so an
  // in-flight upload can't be abandoned from under itself.
  useEffect(() => {
    if (!file) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSaving) onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, isSaving, onCancel]);

  const baseScale = natural ? Math.max(viewportWidth / natural.w, viewportHeight / natural.h) : 1;
  const scale = baseScale * zoom;
  const dispW = natural ? natural.w * scale : 0;
  const dispH = natural ? natural.h * scale : 0;

  // Keeps the image edge-to-edge with the viewport — never leaves a gap,
  // never lets the drag run further than the image actually extends.
  const clampOffset = useCallback(
    (next, dW = dispW, dH = dispH) => {
      const maxX = Math.max(0, (dW - viewportWidth) / 2);
      const maxY = Math.max(0, (dH - viewportHeight) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [dispW, dispH, viewportWidth, viewportHeight]
  );

  const handleImgLoad = (e) => {
    setNatural({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  };

  const pointerDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setIsDragging(true);

    const pts = Array.from(pointersRef.current.values());
    if (pts.length === 2) {
      // Second finger landed — switch from panning to pinch-zoom.
      dragRef.current = null;
      pinchRef.current = { startDist: pointerDistance(pts[0], pts[1]), startZoom: zoom };
    } else {
      dragRef.current = { startX: e.clientX, startY: e.clientY, startOffset: offset };
      pinchRef.current = null;
    }
  };

  const handlePointerMove = (e) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(pointersRef.current.values());

    if (pts.length >= 2 && pinchRef.current) {
      const ratio = pointerDistance(pts[0], pts[1]) / pinchRef.current.startDist;
      applyZoom(pinchRef.current.startZoom * ratio);
      return;
    }

    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setOffset(clampOffset({ x: dragRef.current.startOffset.x + dx, y: dragRef.current.startOffset.y + dy }));
    }
  };

  const handlePointerUp = (e) => {
    pointersRef.current.delete(e.pointerId);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }

    const remaining = Array.from(pointersRef.current.entries());
    if (remaining.length === 1) {
      // Dropped from two fingers to one — restart the pan baseline from
      // here so the image doesn't jump to match the old two-finger delta.
      const [, pos] = remaining[0];
      dragRef.current = { startX: pos.x, startY: pos.y, startOffset: offset };
      pinchRef.current = null;
    } else if (remaining.length === 0) {
      dragRef.current = null;
      pinchRef.current = null;
      setIsDragging(false);
    }
  };

  const applyZoom = (nextZoom) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(1, nextZoom));
    if (!natural) {
      setZoom(clamped);
      return;
    }
    const nextScale = baseScale * clamped;
    setZoom(clamped);
    setOffset((prev) => clampOffset(prev, natural.w * nextScale, natural.h * nextScale));
  };

  const handleWheel = (e) => {
    e.preventDefault();
    applyZoom(zoom + (e.deltaY > 0 ? -WHEEL_STEP : WHEEL_STEP));
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleSave = async () => {
    if (!imgRef.current || !natural) return;
    setIsSaving(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');

      // Same math the on-screen transform uses: locate the viewport's visible
      // window in natural-image coordinates, then draw just that region.
      const ivpX = (viewportWidth - dispW) / 2 + offset.x;
      const ivpY = (viewportHeight - dispH) / 2 + offset.y;
      const sx = -ivpX / scale;
      const sy = -ivpY / scale;
      const sWidth = viewportWidth / scale;
      const sHeight = viewportHeight / scale;

      ctx.drawImage(imgRef.current, sx, sy, sWidth, sHeight, 0, 0, outputWidth, outputHeight);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      await onConfirm(blob);
    } finally {
      setIsSaving(false);
    }
  };

  if (!file) return null;

  const zoomPct = Math.round(zoom * 100);

  return (
    <motion.div
      className="events-dialog-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget && !isSaving) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-dialog-title"
    >
      <motion.div
        className="events-dialog"
        style={{ maxWidth: Math.max(viewportWidth + 64, 380) }}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="events-dialog-header">
          <h2 className="events-dialog-title" id="crop-dialog-title">{title}</h2>
          <button className="events-dialog-close" onClick={onCancel} disabled={isSaving} aria-label="Close modal">
            <X size={15} />
          </button>
        </div>

        <div className="events-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div
            style={{
              width: viewportWidth,
              height: viewportHeight,
              maxWidth: '100%',
              borderRadius: shape === 'circle' ? 16 : 8,
              overflow: 'hidden',
              position: 'relative',
              background: '#0F172A',
              cursor: !natural ? 'wait' : isDragging ? 'grabbing' : 'grab',
              touchAction: 'none',
              border: '1px solid #D8D2C4',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onDoubleClick={handleReset}
          >
            {imgUrl && (
              /* eslint-disable-next-line jsx-a11y/alt-text */
              <img
                ref={imgRef}
                src={imgUrl}
                onLoad={handleImgLoad}
                alt="Crop preview"
                draggable={false}
                style={{
                  position: 'absolute',
                  left: (viewportWidth - dispW) / 2 + offset.x,
                  top: (viewportHeight - dispH) / 2 + offset.y,
                  width: dispW || undefined,
                  height: dispH || undefined,
                  maxWidth: 'none',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  opacity: natural ? 1 : 0,
                  transition: 'opacity 0.15s ease',
                }}
              />
            )}

            {/* Dims everything outside circular crop area */}
            {shape === 'circle' && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  boxShadow: '0 0 0 9999px rgba(15,23,42,0.6)',
                  border: '2px solid rgba(245,242,234,0.9)',
                  pointerEvents: 'none',
                }}
              />
            )}

            {!natural && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: 28, height: 28, border: '3px solid rgba(245,242,234,0.35)', borderTopColor: '#F5F2EA', borderRadius: '50%', animation: 'cc-crop-spin 0.8s linear infinite' }} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', width: '100%' }}>
            <button
              type="button"
              onClick={() => applyZoom(zoom - ZOOM_STEP)}
              title="Zoom out"
              disabled={!natural || zoom <= 1}
              style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }}
            >
              <MagnifyingGlassMinus size={16} />
            </button>
            <input
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(e) => applyZoom(Number(e.target.value))}
              disabled={!natural}
              style={{ flex: 1, accentColor: '#991B1B' }}
              aria-label="Zoom"
            />
            <button
              type="button"
              onClick={() => applyZoom(zoom + ZOOM_STEP)}
              title="Zoom in"
              disabled={!natural || zoom >= MAX_ZOOM}
              style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }}
            >
              <MagnifyingGlassPlus size={16} />
            </button>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6875rem', color: '#6B7280', width: '2.75rem', textAlign: 'right', flexShrink: 0 }}>
              {natural ? `${zoomPct}%` : '—'}
            </span>
            <button
              type="button"
              onClick={handleReset}
              title="Reset"
              disabled={!natural || (zoom === 1 && offset.x === 0 && offset.y === 0)}
              style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
            >
              <ArrowCounterClockwise size={17} />
            </button>
          </div>

          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.75rem', color: '#9CA3AF', margin: 0, textAlign: 'center' }}>
            Drag to reposition · scroll or pinch to zoom · double-click to reset
          </p>
        </div>

        <div className="events-dialog-footer">
          <button className="events-dialog-cancel" onClick={onCancel} disabled={isSaving}>Cancel</button>
          <button className="events-dialog-confirm" onClick={handleSave} disabled={isSaving || !natural}>
            {isSaving ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <CircleNotch size={14} className="animate-spin" /> Saving…
              </span>
            ) : saveLabel}
          </button>
        </div>
      </motion.div>

      <style>{`
        @keyframes cc-crop-spin { to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}
