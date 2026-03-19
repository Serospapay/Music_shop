"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPriceUah } from "@/lib/format";

export type CarouselSlide = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  category: string;
};

const AUTO_DEG_PER_FRAME = 0.055;
const DRAG_SENSITIVITY = 0.2;
const MOMENTUM_DECAY = 0.965;
const FRONT_HIGHLIGHT_DEG = 22;

function useCarouselRadius() {
  const [radius, setRadius] = useState(300);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setRadius(168);
      } else if (w < 640) {
        setRadius(200);
      } else if (w < 900) {
        setRadius(248);
      } else if (w < 1200) {
        setRadius(290);
      } else {
        setRadius(330);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return radius;
}

function frontIndexForRotation(rotation: number, n: number, anglePer: number) {
  let bestI = 0;
  let bestD = Infinity;
  for (let i = 0; i < n; i++) {
    const a = ((i * anglePer + rotation) % 360) + 360;
    const norm = a % 360;
    const dist = Math.min(norm, 360 - norm);
    if (dist < bestD) {
      bestD = dist;
      bestI = i;
    }
  }
  return { index: bestI, distanceDeg: bestD };
}

export function ProductCarousel3D({ slides }: { slides: CarouselSlide[] }) {
  const [rotation, setRotation] = useState(0);
  const drag = useRef({ active: false, lastX: 0 });
  const velocityRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const radius = useCarouselRadius();

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }
    if (reducedMotion) {
      return;
    }

    let id: number;
    const step = () => {
      if (!drag.current.active) {
        const v = velocityRef.current;
        if (Math.abs(v) > 0.02) {
          setRotation((r) => r + v);
          velocityRef.current *= MOMENTUM_DECAY;
        } else {
          velocityRef.current = 0;
          setRotation((r) => r + AUTO_DEG_PER_FRAME);
        }
      }
      id = requestAnimationFrame(step);
      rafRef.current = id;
    };

    id = requestAnimationFrame(step);
    rafRef.current = id;
    return () => {
      cancelAnimationFrame(id);
      rafRef.current = null;
    };
  }, [slides.length, reducedMotion]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    drag.current = { active: true, lastX: e.clientX };
    velocityRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active) {
      return;
    }
    const dx = e.clientX - drag.current.lastX;
    drag.current.lastX = e.clientX;
    velocityRef.current = velocityRef.current * 0.4 + dx * 0.35;
    setRotation((r) => r + dx * DRAG_SENSITIVITY);
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current.active = false;
  }, []);

  const stepBy = useCallback(
    (dir: -1 | 1) => {
      if (slides.length < 2) {
        return;
      }
      const anglePer = 360 / slides.length;
      setRotation((r) => r + dir * anglePer);
      velocityRef.current = 0;
    },
    [slides.length],
  );

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }
    const anglePer = 360 / slides.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        stepBy(1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        stepBy(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length, stepBy]);

  const n = slides.length;
  const anglePer = n > 0 ? 360 / n : 0;
  const { index: frontIdx, distanceDeg } = useMemo(
    () => (n > 0 ? frontIndexForRotation(rotation, n, anglePer) : { index: 0, distanceDeg: 0 }),
    [rotation, n, anglePer],
  );
  const isFrontLit = distanceDeg < FRONT_HIGHLIGHT_DEG;

  if (slides.length === 0) {
    return null;
  }

  if (reducedMotion && slides.length >= 1) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h2 className="font-display text-2xl font-normal text-white sm:text-3xl">Огляд товарів</h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-400">
            Спрощена сітка (увага до зменшення руху в системі). Усі позиції з каталогу.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {slides.map((s) => (
            <Link
              key={s.id}
              href={`/product/${s.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-950/80 shadow-card transition duration-300 hover:border-brand-400/45 hover:shadow-brand-sm"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={s.imageUrl}
                  alt={s.name}
                  fill
                  className="object-cover brightness-[0.92] transition duration-500 group-hover:scale-[1.03] group-hover:brightness-105"
                  sizes="(max-width:640px) 50vw, 200px"
                />
              </div>
              <div className="border-t border-white/[0.05] bg-surface-950/50 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{s.category}</p>
                <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-white">{s.name}</p>
                <p className="mt-2 text-sm font-semibold text-brand-200">{formatPriceUah(s.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (slides.length === 1) {
    const s = slides[0];
    return (
      <div className="mx-auto max-w-sm">
        <Link
          href={`/product/${s.slug}`}
          className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-950/80 shadow-card transition duration-300 hover:border-brand-400/45 hover:shadow-brand-sm"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={s.imageUrl}
              alt={s.name}
              fill
              className="object-cover brightness-[0.92] transition duration-500 group-hover:scale-[1.03] group-hover:brightness-105"
              sizes="(max-width:640px) 100vw, 400px"
            />
          </div>
          <div className="border-t border-white/[0.05] bg-surface-950/50 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{s.category}</p>
            <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-white">{s.name}</p>
            <p className="mt-2 text-sm font-semibold text-brand-200">{formatPriceUah(s.price)}</p>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-normal text-white sm:text-3xl">Огляд товарів</h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-400">
            Реальні позиції з каталогу. Перетягніть, використайте стрілки на клавіатурі або кнопки — також працює
            автоматичне обертання.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">3D · {n} карток</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => stepBy(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-500/20 bg-surface-950/60 text-zinc-200 backdrop-blur-sm transition hover:border-brand-400/40 hover:bg-surface-950/80 hover:text-white"
              aria-label="Повернути карусель ліворуч"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => stepBy(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-brand-500/20 bg-surface-950/60 text-zinc-200 backdrop-blur-sm transition hover:border-brand-400/40 hover:bg-surface-950/80 hover:text-white"
              aria-label="Повернути карусель праворуч"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative mx-auto cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ perspective: "1100px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="relative mx-auto h-[min(58vh,520px)] w-full max-w-5xl sm:h-[min(62vh,580px)]"
          style={{ perspective: "inherit" }}
        >
          <div className="absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d]">
            {slides.map((s, i) => {
              const angle = i * anglePer;
              const isFront = i === frontIdx && isFrontLit;
              return (
                <div
                  key={s.id}
                  className="absolute left-0 top-0 w-[min(78vw,280px)] origin-center [transform-style:preserve-3d] sm:w-[300px] lg:w-[320px]"
                  style={{
                    transform: `
                      translate(-50%, -50%)
                      rotateY(${angle + rotation}deg)
                      translateZ(${radius}px)
                      rotateY(${-angle - rotation}deg)
                    `,
                  }}
                >
                  <Link
                    href={`/product/${s.slug}`}
                    className={`block overflow-hidden rounded-2xl border bg-surface-950/80 shadow-card transition duration-300 hover:border-brand-400/45 ${
                      isFront
                        ? "border-brand-400/50 shadow-brand ring-1 ring-brand-400/25"
                        : "border-white/[0.06] hover:border-brand-500/20 hover:shadow-brand-sm"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={s.imageUrl}
                        alt={s.name}
                        fill
                        className={`object-cover transition duration-500 ${isFront ? "brightness-105" : "brightness-[0.92]"}`}
                        sizes="(max-width:640px) 78vw, 320px"
                        draggable={false}
                      />
                    </div>
                    <div className="border-t border-white/[0.05] bg-surface-950/50 p-3 sm:p-4">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{s.category}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-white">{s.name}</p>
                      <p className="mt-2 text-sm font-semibold text-brand-200">{formatPriceUah(s.price)}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
