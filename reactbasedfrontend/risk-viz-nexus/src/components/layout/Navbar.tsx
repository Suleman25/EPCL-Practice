"use client";
import * as React from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function Navbar({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape when mobile menu is open
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <nav role="navigation" aria-label="Main" className={`fixed top-0 left-0 w-full pointer-events-none ${className || 'z-[90]'}`}>
      {/* Mobile overlay (click to close) */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-[80] pointer-events-auto bg-black/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={[
          "relative z-[90] mx-auto mt-3 max-w-6xl px-3 md:px-4 pointer-events-auto",
          "rounded-full ring-1 transition-all duration-300",
          scrolled
            ? "bg-white/5 dark:bg-white/5 backdrop-blur-md shadow-none ring-emerald-500/40 dark:ring-emerald-400/35"
            : "bg-white/5 dark:bg-white/5 backdrop-blur-md shadow-none ring-emerald-500/40 dark:ring-emerald-400/35",
        ].join(" ")}
      >
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <a href="#home" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200 ease-in-out">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-lime-500 shadow-md shadow-emerald-500/30" />
            <span className="hidden sm:inline text-foreground font-semibold">Safety Copilot</span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm">
            <a href="#features" className="text-foreground/80 hover:text-emerald-400 transition-colors duration-200 ease-in-out hover:scale-105 hover:shadow-lg">Features</a>
            <a href="#how" className="text-foreground/80 hover:text-emerald-400 transition-colors duration-200 ease-in-out hover:scale-105 hover:shadow-lg">Use Cases</a>
            <Link
              to="/dashboard"
              className="ml-2 lg:ml-4 inline-flex items-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground"
            >
              <span className="font-medium">Dashboard</span>
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/90 hover:bg-accent transition-all duration-200 ease-in-out"
            aria-label="Toggle menu"
            aria-controls="mobile-menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile panel */}
        <div
          className={[
            "md:hidden overflow-hidden transition-all duration-300 rounded-b-2xl bg-black/20 dark:bg-white/5 backdrop-blur-sm ring-1 ring-white/10",
            open ? "max-h-72 opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
          id="mobile-menu"
        >
          <div className="px-3 pb-4 flex flex-col gap-3 text-sm overflow-auto max-h-64">
            <a href="#features" onClick={() => setOpen(false)} className="text-foreground/85 hover:text-emerald-400 transition-colors duration-200 ease-in-out">Features</a>
            <a href="#how" onClick={() => setOpen(false)} className="text-foreground/85 hover:text-emerald-400 transition-colors duration-200 ease-in-out">Use Cases</a>
            <Link
              to="/dashboard"
              className="mt-1 inline-flex w-max items-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              <span className="font-medium">Dashboard</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
