import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

export function ImageViewerModal({ open, onClose, images, title }) {
  const visibleImages = useMemo(() => (images ?? []).filter(Boolean), [images]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || !visibleImages.length) {
    return null;
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[999] bg-slate-950/75 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      <div
        className="relative h-full w-full p-2 sm:p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/70 px-3 py-1 text-sm font-bold text-white ring-1 ring-white/20"
          aria-label="Close image viewer"
        >
          ✕
        </button>

        <div
          className={`mx-auto h-full max-w-7xl overflow-auto rounded-2xl border border-white/10 bg-black/35 p-2 shadow-2xl sm:p-3 ${
            visibleImages.length > 1 ? "grid grid-cols-1 gap-2 md:grid-cols-2" : "grid grid-cols-1"
          }`}
        >
          {visibleImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="flex min-h-0 items-center justify-center overflow-hidden rounded-xl bg-black/60"
            >
              <img
                src={image}
                alt={`${title} page ${index + 1}`}
                className="h-auto max-h-[82vh] w-auto max-w-full object-contain"
                loading="eager"
              />
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
