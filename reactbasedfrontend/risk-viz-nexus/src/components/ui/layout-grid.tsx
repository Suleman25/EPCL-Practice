"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type LayoutGridCard = {
  id: number | string;
  content: React.ReactNode;
  className?: string;
  thumbnail?: string; // optional: if omitted, use solid background
};

export function LayoutGrid({
  cards,
  className,
  rowHeightClass = "auto-rows-[22rem]",
  solidColors = [
    "bg-primary/10",
    "bg-secondary/20",
    "bg-accent/20",
    "bg-muted",
  ],
  borderOverrides,
}: {
  cards: LayoutGridCard[];
  className?: string;
  rowHeightClass?: string; // e.g., "auto-rows-[11rem]" for compact
  solidColors?: string[]; // cycle when no thumbnail
  borderOverrides?: string[]; // optional border color classes, cycles per card
}) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", rowHeightClass, "gap-4", className)}>
      {cards.map((card, idx) => (
        <GridCard key={card.id} index={idx} solidColors={solidColors} borderOverrides={borderOverrides} {...card} />
      ))}
    </div>
  );
}

function GridCard({ content, className, thumbnail, index = 0, solidColors, borderOverrides }: LayoutGridCard & { index?: number; solidColors?: string[]; borderOverrides?: string[] }) {
  const [hovered, setHovered] = React.useState(false);
  const bgCls = solidColors && solidColors.length > 0
    ? solidColors[index % solidColors.length]
    : pickSolid();
  const borderCls = borderOverrides && borderOverrides.length > 0
    ? borderOverrides[index % borderOverrides.length]
    : undefined;
  // If we are using a solid color background, make container background transparent
  const containerBg = thumbnail ? "bg-black/5" : (solidColors && solidColors.length > 0 ? "bg-transparent" : "bg-card");

  return (
    <motion.div
      data-hovered={hovered}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border",
        borderCls,
        containerBg,
        thumbnail && "[&>img]:absolute [&>img]:inset-0 [&>img]:h-full [&>img]:w-full [&>img]:object-cover",
        "shadow-card transition-all duration-700 md:duration-1000 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] hover:ring-1 hover:ring-emerald-400/30 hover:border-emerald-400/40",
        className,
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.22, ease: "anticipate", delay: Math.min(index * 0.04, 0.2) }}
    >
      {thumbnail ? (
        <img src={thumbnail} alt="" />
      ) : (
        <div className={cn("absolute inset-0", bgCls)} />
      )}

      {/* dark gradient for readability */}
      {thumbnail && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      )}

      {/* content overlay */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: hovered ? 1 : 0.95, y: hovered ? 0 : 8 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 z-10 p-5 sm:p-6 flex items-end"
      >
        <div
          className={cn(
            "space-y-2 pointer-events-none transition-colors duration-300",
            hovered ? "text-emerald-300" : (thumbnail ? "text-white/95" : "text-foreground")
          )}
        >
          {content}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Simple color cycler. Using closure to persist index across renders.
let _colorIdx = 0;
function pickSolid() {
  const palette = [
    "bg-primary/10",
    "bg-secondary/20",
    "bg-accent/20",
    "bg-muted",
    "bg-primary/15",
  ];
  const cls = palette[_colorIdx % palette.length];
  _colorIdx += 1;
  return cls;
}
