"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type BoxesProps = {
  className?: string;
  /** Auto color pulses even without hover */
  autoAnimate?: boolean;
  /** Enable per-cell hover highlight */
  hoverEnabled?: boolean;
};

export const BoxesCore = ({ className, autoAnimate = true, hoverEnabled = true, ...rest }: BoxesProps) => {
  // Reduced density for performance and clearer animations
  const rows = new Array(24).fill(1);
  const cols = new Array(28).fill(1);
  const colors = [
    "#93c5fd",
    "#f9a8d4",
    "#86efac",
    "#fde047",
    "#fca5a5",
    "#d8b4fe",
    "#93c5fd",
    "#a5b4fc",
    "#c4b5fd",
  ];
  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
  const baseColorFor = (i: number, j: number) => colors[(i + j) % colors.length];

  return (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={cn(
        "pointer-events-none absolute -top-1/4 left-1/4 z-0 flex h-full w-full -translate-x-1/2 -translate-y-1/2 p-4",
        className,
      )}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div
          key={`row` + i}
          className="relative h-10 w-20 border-l border-slate-500 dark:border-slate-700"
        >
          {cols.map((_, j) => {
            const delay = ((i * cols.length + j) % 20) * 0.15;
            const base = baseColorFor(i, j);

            return (
              <motion.div
                key={`col` + j}
                className="relative h-10 w-20 border-t border-r border-slate-500 dark:border-slate-700"
                style={{ willChange: "background-color, opacity" }}
                animate={
                  autoAnimate
                    ? { backgroundColor: ["transparent", base, "transparent"], opacity: [0, 1, 0] }
                    : undefined
                }
                transition={
                  autoAnimate
                    ? { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay, repeatType: "loop" as const }
                    : undefined
                }
                whileHover={
                  hoverEnabled
                    ? { backgroundColor: getRandomColor(), transition: { duration: 0 } }
                    : undefined
                }
              >
                {j % 2 === 0 && i % 2 === 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="pointer-events-none absolute -top-[14px] -left-[22px] h-6 w-10 stroke-[1px] text-slate-400 dark:text-slate-700"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                  </svg>
                ) : null}
              </motion.div>
            );
          })}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
