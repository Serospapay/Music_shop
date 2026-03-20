"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Maximize2, X } from "lucide-react";

type ProductHeroMediaProps = {
  images: string[];
  productName: string;
};

const MAX_TILT = 5;

export function ProductHeroMedia({ images, productName }: ProductHeroMediaProps) {
  const list = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const u of images) {
      const t = u.trim();
      if (!t || seen.has(t)) {
        continue;
      }
      seen.add(t);
      out.push(t);
    }
    return out;
  }, [images]);

  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [lightbox, setLightbox] = useState(false);
  const [pointerFine, setPointerFine] = useState(false);

  const mainSrc = list[active] ?? list[0] ?? "";

  useEffect(() => {
    setActive(0);
  }, [list]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setPointerFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduce || !pointerFine || !wrapRef.current) {
        return;
      }
      const r = wrapRef.current.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      setTilt({
        x: Math.max(-1, Math.min(1, -py)) * MAX_TILT,
        y: Math.max(-1, Math.min(1, px)) * MAX_TILT,
      });
    },
    [reduce, pointerFine],
  );

  const onLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!lightbox) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(false);
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  const tiltStyle =
    reduce || !pointerFine
      ? undefined
      : {
          transform: `perspective(920px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
          transformStyle: "preserve-3d" as const,
        };

  if (!mainSrc) {
    return (
      <div className="ui-frame flex aspect-square w-full max-w-2xl items-center justify-center lg:max-w-none">
        <p className="text-sm text-zinc-500">Немає зображення для товару</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <motion.div
          ref={wrapRef}
          className="ui-frame group relative aspect-square w-full max-w-2xl cursor-zoom-in overflow-hidden lg:max-w-none"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-lg border border-brand-500/25 bg-surface-950/75 px-2.5 py-1.5 text-xs font-medium text-zinc-200 opacity-0 backdrop-blur-sm transition hover:border-brand-400/45 hover:text-white group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 md:opacity-90"
            aria-label="Відкрити зображення на весь екран"
          >
            <Maximize2 className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="hidden sm:inline">На весь екран</span>
          </button>

          <div
            className="relative h-full w-full transition-[transform] duration-200 ease-out will-change-transform"
            style={tiltStyle}
          >
            <Image
              key={mainSrc}
              src={mainSrc}
              alt={productName}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              draggable={false}
            />
          </div>

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-950/50 via-transparent to-surface-950/10 opacity-70"
            aria-hidden
          />
        </motion.div>

        {list.length > 1 ? (
          <div className="flex max-w-2xl flex-wrap gap-2 lg:max-w-none">
            {list.map((src, idx) => (
              <button
                key={src}
                type="button"
                onClick={() => setActive(idx)}
                className={`relative h-16 w-16 overflow-hidden rounded-xl border transition sm:h-[4.5rem] sm:w-[4.5rem] ${
                  idx === active
                    ? "border-brand-400/40 ring-1 ring-brand-400/30"
                    : "border-brand-500/15 opacity-80 hover:border-brand-400/40 hover:opacity-100"
                }`}
                aria-label={`Мініатюра ${idx + 1} з ${list.length}`}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {lightbox ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Зображення: ${productName}`}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-surface-950/95 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightbox(false)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 rounded-full border border-brand-500/30 bg-surface-950/90 p-2.5 text-zinc-200 transition hover:border-brand-400/50 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox(false);
              }}
              aria-label="Закрити перегляд"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
            <motion.div
              className="relative h-full max-h-[min(88dvh,900px)] w-full max-w-5xl"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={mainSrc}
                alt={productName}
                fill
                className="object-contain"
                sizes="100vw"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
