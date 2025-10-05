"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface TypewriterHeadingProps {
  prefix: string;
  word?: string; // single word mode
  words?: string[]; // loop over words
  speed?: number; // ms per character typing
  deleteSpeed?: number; // ms per character deleting
  pauseMs?: number; // pause after full word
  loop?: boolean;
  className?: string;
  cursorClassName?: string;
}

export function TypewriterHeading({
  prefix,
  word,
  words,
  speed = 60,
  deleteSpeed = 40,
  pauseMs = 900,
  loop = true,
  className,
  cursorClassName,
}: TypewriterHeadingProps) {
  const list = React.useMemo(() => (words && words.length > 0 ? words : word ? [word] : []), [word, words]);
  const [index, setIndex] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);
  const [showCursor, setShowCursor] = React.useState(true);

  const current = list[index] ?? "";
  const typed = current.slice(0, count);

  React.useEffect(() => {
    const id = setInterval(() => setShowCursor((s) => !s), 500);
    return () => clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (!current) return;

    if (!deleting && count < current.length) {
      const t = setTimeout(() => setCount((c) => c + 1), speed);
      return () => clearTimeout(t);
    }

    if (!deleting && count === current.length) {
      const t = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }

    if (deleting && count > 0) {
      const t = setTimeout(() => setCount((c) => c - 1), deleteSpeed);
      return () => clearTimeout(t);
    }

    if (deleting && count === 0) {
      if (list.length <= 1 || !loop) return; // stop at first word if not looping
      setDeleting(false);
      setIndex((i) => (i + 1) % list.length);
    }
  }, [current, count, deleting, list.length, loop, speed, deleteSpeed, pauseMs]);

  return (
    <h1 className={cn("font-extrabold leading-tight", className)}>
      {prefix}
      <span className="text-emerald-700">{typed}</span>
      <span className={cn("inline-block w-[1ch] -ml-[1ch]", cursorClassName)}>
        {showCursor ? "|" : "\u00A0"}
      </span>
    </h1>
  );
}
