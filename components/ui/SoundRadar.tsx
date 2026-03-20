"use client";

import { useId } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

export type SoundRadarDatum = {
  subject: string;
  score: number;
  fullMark: number;
};

type SoundRadarProps = {
  data: SoundRadarDatum[];
  title?: string;
  subtitle?: string;
  className?: string;
};

/** Акцент: «студійне золото» + холодний підсвіт (аудіо-естетика) */
const STROKE = "#e8c49a";
const FILL = "#c4925e";
const GRID = "rgba(212, 165, 116, 0.22)";
const AXIS_TICK = "#9ca3af";

export function SoundRadar({ data, title, subtitle, className }: SoundRadarProps) {
  const gradId = useId().replace(/:/g, "");

  if (!data.length) {
    return null;
  }

  const maxDomain = Math.max(...data.map((d) => d.fullMark), 10);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-brand-500/25 bg-gradient-to-br from-surface-900/95 via-surface-950 to-[#07080c] p-4 shadow-[0_0_0_1px_rgba(212,165,116,0.08),0_24px_64px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-brand-500/8 blur-3xl"
        aria-hidden
      />

      <div className="relative z-[1]">
        {title ? (
          <h3 className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">{title}</h3>
        ) : null}
        {subtitle ? <p className="mt-1 text-xs text-zinc-500 sm:text-sm">{subtitle}</p> : null}

        <div className="mt-4 h-[min(22rem,55vw)] w-full min-h-[240px] sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="52%" outerRadius="72%" data={data}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={FILL} stopOpacity={0.75} />
                  <stop offset="100%" stopColor="#7eb8da" stopOpacity={0.35} />
                </linearGradient>
              </defs>

              <PolarGrid gridType="polygon" stroke={GRID} strokeWidth={1} radialLines />

              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: AXIS_TICK, fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
              />

              <PolarRadiusAxis
                angle={90}
                domain={[0, maxDomain]}
                tickCount={5}
                tick={{ fill: "rgba(113,113,122,0.85)", fontSize: 10 }}
                axisLine={false}
                stroke="rgba(63,63,70,0.5)"
              />

              <Radar
                name="Оцінка"
                dataKey="score"
                stroke={STROKE}
                strokeWidth={2.25}
                fill={`url(#${gradId})`}
                fillOpacity={0.55}
                dot={{
                  r: 3,
                  strokeWidth: 2,
                  stroke: STROKE,
                  fill: "#0c0c0f",
                }}
                isAnimationActive
                animationDuration={900}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-center text-[11px] leading-snug text-zinc-600 sm:text-xs">
          Шкала 0–{maxDomain}. Демо-профіль для візуалізації; пізніше можна підставити дані з каталогу.
        </p>
      </div>
    </div>
  );
}
