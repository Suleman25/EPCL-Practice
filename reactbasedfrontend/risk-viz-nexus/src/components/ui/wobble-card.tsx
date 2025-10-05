"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type WobbleCardProps = Omit<HTMLMotionProps<'section'>, 'children'> & {
  containerClassName?: string;
  interactive?: boolean;
  children?: React.ReactNode;
};

export const WobbleCard = ({ children, containerClassName, className, interactive = true, ...rest }: WobbleCardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 20;
    const y = (clientY - (rect.top + rect.height / 2)) / 20;
    setMousePosition({ x, y });
  };

  return (
    <motion.section
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseEnter={interactive ? () => setIsHovering(true) : undefined}
      onMouseLeave={interactive ? () => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      } : undefined}
      style={{
        transform: interactive && isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
        transition: "transform 0.1s ease-out",
      }}
      className={cn(
        // Neutral default so it fits your design
        "mx-auto w-full relative rounded-xl overflow-hidden border bg-white/80 dark:bg-slate-900/60",
        containerClassName
      )}
      {...rest}
    >
      <div
        className={cn(
          "relative h-full [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.35),rgba(255,255,255,0))] sm:mx-0 sm:rounded-xl overflow-hidden"
        )}
        style={{
          boxShadow:
            "0 10px 32px rgba(34, 42, 53, 0.12), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.05), 0 4px 6px rgba(34, 42, 53, 0.08), 0 24px 108px rgba(47, 48, 55, 0.10)",
        }}
      >
        <motion.div
          style={{
            transform: interactive && isHovering
              ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.01, 1.01, 1)`
              : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
            transition: "transform 0.1s ease-out",
          }}
          className={cn("h-full p-5", className)}
        >
          {/* Optional noise overlay (no external asset required) */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10 [mask-image:radial-gradient(#fff,transparent,75%)]"
            style={{ background: "repeating-linear-gradient(45deg, rgba(0,0,0,.04) 0, rgba(0,0,0,.04) 2px, transparent 2px, transparent 4px)" }}
          />
          {children}
        </motion.div>
      </div>
    </motion.section>
  );
};
