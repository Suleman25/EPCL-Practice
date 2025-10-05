"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

type HoverBorderGradientProps = React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
  } & React.HTMLAttributes<HTMLElement>
>;

export const HoverBorderGradient = React.forwardRef<HTMLElement, HoverBorderGradientProps>(function HoverBorderGradient(
  { children, containerClassName, className, as: Tag = "button", duration = 1, clockwise = true, ...props },
  ref,
) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(24% 56% at 50% 0%, rgba(16,185,129,0.55) 0%, rgba(16,185,129,0) 100%)",
    LEFT: "radial-gradient(20% 48% at 0% 50%, rgba(16,185,129,0.55) 0%, rgba(16,185,129,0) 100%)",
    BOTTOM:
      "radial-gradient(24% 56% at 50% 100%, rgba(16,185,129,0.55) 0%, rgba(16,185,129,0) 100%)",
    RIGHT:
      "radial-gradient(20% 48% at 100% 50%, rgba(16,185,129,0.55) 0%, rgba(16,185,129,0) 100%)",
  };

  const highlight =
    "radial-gradient(80% 190% at 50% 50%, rgba(16,185,129,0.9) 0%, rgba(16,185,129,0) 70%)";

  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => {
        setDirection((prevState) => rotateDirection(prevState));
      }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered, duration]);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        // keep wrapper clean; rely on consumer for sizing/colors
        "relative flex items-center justify-center rounded-md p-[2px] overflow-visible transition duration-500",
        containerClassName
      )}
      ref={ref as any}
      {...props}
    >
      <div
        className={cn(
          // inner content takes full size; no extra padding so outer button sizing applies
          "relative z-10 w-full h-full rounded-[inherit] bg-transparent",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn("pointer-events-none absolute inset-0 z-0 rounded-[inherit] overflow-hidden")}
        style={{ filter: "blur(6px)" }}
        initial={{ background: movingMap[direction] }}
        animate={{ background: hovered ? [movingMap[direction], highlight] : movingMap[direction] }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      {/* inner mask to create border-only effect */}
      <div className="pointer-events-none absolute inset-[3px] z-0 rounded-[inherit] bg-transparent" />
    </Tag>
  );
});
