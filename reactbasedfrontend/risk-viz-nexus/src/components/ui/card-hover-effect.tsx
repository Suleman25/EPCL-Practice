"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export type HoverItem = {
  title: string;
  description: string;
  link: string; // can be internal "/route" or external "https://..."
};

export function HoverEffect({ items, className }: { items: HoverItem[]; className?: string }) {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--x", `${x}px`);
    target.style.setProperty("--y", `${y}px`);
  };

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5", className)}>
      {items.map((item) => {
        const isInternal = item.link.startsWith("/");
        const Wrapper: any = isInternal ? Link : "a";
        const wrapperProps = isInternal
          ? { to: item.link }
          : { href: item.link, target: "_blank", rel: "noreferrer" };

        return (
          <Wrapper key={item.title} {...wrapperProps} className="group block">
            <div
              onMouseMove={onMove}
              className={cn(
                "relative rounded-xl border bg-card p-5 transition-shadow",
                "hover:shadow-lg hover:border-border/80"
              )}
            >
              {/* hover glow */}
              <div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(400px circle at var(--x) var(--y), color-mix(in oklch, var(--primary) 22%, transparent), transparent 40%)",
                }}
              />

              <div className="relative z-10">
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-foreground/70 leading-relaxed">{item.description}</p>
              </div>
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}
