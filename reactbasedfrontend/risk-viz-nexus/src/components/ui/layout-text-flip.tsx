// components/ui/layout-text-flip.tsx
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function LayoutTextFlip({
  text,
  words,
  duration = 3000,
  className,
  textClassName,
  pillClassName,
}: {
  text: string;
  words: string[];
  duration?: number;
  className?: string; // container classes
  textClassName?: string; // main text classes
  pillClassName?: string; // flipping pill classes
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);
    return () => clearInterval(interval);
  }, [words.length, duration]);

  return (
    <div className={cn("flex flex-wrap gap-3 items-start", className)}>
      <motion.span layoutId="subtext" className={cn("font-bold tracking-tight drop-shadow-lg", textClassName)}>
        {text}
      </motion.span>

      <motion.span
        layout
        className={cn(
          "relative w-fit overflow-hidden rounded-md border border-transparent bg-white px-4 py-2 font-sans font-bold tracking-tight text-black shadow-sm ring shadow-black/10 ring-black/10 drop-shadow-lg dark:bg-neutral-900 dark:text-white dark:shadow-sm dark:ring-1 dark:shadow-white/10 dark:ring-white/10",
          pillClassName
        )}
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={currentIndex}
            initial={{ y: -40, filter: "blur(10px)" }}
            animate={{ y: 0, filter: "blur(0px)" }}
            exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block whitespace-nowrap"
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </div>
  );
}
