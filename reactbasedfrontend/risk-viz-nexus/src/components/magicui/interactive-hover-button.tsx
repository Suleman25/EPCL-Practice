import * as React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  to?: string; // if provided, renders a Link
};

export function InteractiveHoverButton({ children, className, to }: Props) {
  const content = (
    <span className="relative z-10 font-medium">{children}</span>
  );

  return (
    <div className={cn("group relative inline-flex", className)}>
      {to ? (
        <Link
          to={to}
          className={cn(
            "relative inline-flex items-center justify-center select-none",
            // oval shape + base colors
            "rounded-full px-6 py-3 text-white bg-emerald-600",
            // smooth transitions
            "transition-[background,transform,box-shadow] duration-300 ease-out",
            // hover lift
            "hover:-translate-y-0.5 hover:bg-emerald-700",
            // focus ring
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          )}
        >
          {content}
        </Link>
      ) : (
        <button
          className={cn(
            "relative inline-flex items-center justify-center select-none",
            "rounded-full px-6 py-3 text-white bg-emerald-600",
            "transition-[background,transform,box-shadow] duration-300 ease-out",
            "hover:-translate-y-0.5 hover:bg-emerald-700",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
          )}
        >
          {content}
        </button>
      )}

      {/* animated ring (shiny outline) */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-0.5 rounded-full"
        style={{
          border: "2px solid transparent",
          background:
            "linear-gradient(#0000,#0000) padding-box, conic-gradient(rgba(34,197,94,1), rgba(34,197,94,0) 30%, rgba(16,185,129,1) 60%, rgba(16,185,129,0) 90%, rgba(34,197,94,1)) border-box",
          filter: "drop-shadow(0 0 8px rgba(16,185,129,.45))",
          animation: "spinBorder 2.6s linear infinite",
        }}
      />
      {/* sweep shine on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(115deg, transparent 0%, rgba(255,255,255,.18) 20%, rgba(255,255,255,.38) 50%, transparent 80%)",
          mask: "linear-gradient(#000 0 0)",
        }}
      />
      <style>{`
        @keyframes spinBorder { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
