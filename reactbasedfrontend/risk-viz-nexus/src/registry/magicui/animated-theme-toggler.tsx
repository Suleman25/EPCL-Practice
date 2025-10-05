import * as React from "react";
import { Moon, Sun } from "lucide-react";

// Simple class-based theme toggler compatible with Tailwind's darkMode: ['class']
export function AnimatedThemeToggler() {
  const [isDark, setIsDark] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Ensure DOM reflects state on mount and when state changes
  React.useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Keep in sync with system changes if no explicit preference
  React.useEffect(() => {
    const m = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!m) return;
    const onChange = (e: MediaQueryListEvent) => {
      const explicit = localStorage.getItem("theme");
      if (!explicit) setIsDark(e.matches);
    };
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, []);

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setIsDark((v) => !v)}
      className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10 hover:bg-white/15 transition"
    >
      {/* Icons crossfade/rotate */}
      <Sun
        className={`absolute h-5 w-5 text-amber-300 transition-all duration-300 ${
          isDark ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 text-emerald-300 transition-all duration-300 ${
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
        }`}
      />
      {/* subtle inner glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          boxShadow: isDark
            ? "inset 0 0 20px rgba(16,185,129,0.25)"
            : "inset 0 0 18px rgba(251,191,36,0.22)",
        }}
      />
    </button>
  );
}

export default AnimatedThemeToggler;
