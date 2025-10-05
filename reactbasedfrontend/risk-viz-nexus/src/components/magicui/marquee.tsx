import * as React from "react";
import { cn } from "@/lib/utils";

export type MarqueeProps = React.PropsWithChildren<{
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
  gap?: string; // e.g. '1rem', '16px', '1.25rem'
}>;

// Lightweight marquee compatible with MagicUI API shape used in the snippet.
// Uses CSS keyframes defined inline and duplicates children to make a seamless loop.
export function Marquee({ children, reverse, pauseOnHover, className, gap }: MarqueeProps) {
  const [paused, setPaused] = React.useState(false);
  const items = React.Children.toArray(children ?? []);
  if (items.length === 0) return null;

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      {/* Keyframes local to this component */}
      <style>{`
        @keyframes _marquee_ {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="flex w-max"
        style={{
          animation: `\_marquee_ var(--duration, 20s) linear infinite`,
          animationDirection: reverse ? ("reverse" as const) : ("normal" as const),
          animationPlayState: paused ? ("paused" as const) : ("running" as const),
          gap: gap ?? "1rem",
        }}
      >
        {[...items, ...items].map((child, i) => (
          <div key={i} className="shrink-0">
            {child as React.ReactElement}
          </div>
        ))}
      </div>
    </div>
  );
}
