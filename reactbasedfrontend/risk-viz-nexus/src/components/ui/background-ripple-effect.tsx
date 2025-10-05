"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const BackgroundRippleEffect = ({
  className,
  rows = 8,
  cols = 27,
  cellSize = 56,
  interactive = false,
}: {
  className?: string;
  rows?: number;
  cols?: number;
  cellSize?: number;
  interactive?: boolean;
}) => {
  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  // Dynamically size the grid to cover the full container (entire page height)
  const [computedGrid, setComputedGrid] = useState<{ rows: number; cols: number }>({ rows, cols });

  useEffect(() => {
    const calc = () => {
      const el = ref.current;
      if (!el) return;
      const h = el.clientHeight || (el as any).offsetHeight || 0;
      const w = el.clientWidth || (el as any).offsetWidth || 0;
      if (!h || !w) return;
      const newRows = Math.ceil(h / cellSize) + 2; // small buffer so edges are covered
      const newCols = Math.ceil(w / cellSize) + 2;
      setComputedGrid({ rows: newRows, cols: newCols });
    };

    calc();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(calc) : null;
    if (ro && ref.current) ro.observe(ref.current);
    window.addEventListener("resize", calc);
    return () => {
      window.removeEventListener("resize", calc);
      ro?.disconnect();
    };
  }, [cellSize]);

  return (
    <div
      ref={ref}
      className={cn(
        // Use absolute by default; parent should be relative. Allow override via className.
        "absolute inset-0 h-full w-full",
        // Even lighter lines and no fill
        "[--cell-border-color:rgba(0,0,0,0.06)] [--cell-fill-color:transparent] [--cell-shadow-color:rgba(0,0,0,0.04)]",
        "dark:[--cell-border-color:rgba(255,255,255,0.10)] dark:[--cell-fill-color:transparent] dark:[--cell-shadow-color:rgba(255,255,255,0.04)]",
        !interactive && "pointer-events-none",
        className,
      )}
    >
      <div className="relative h-auto w-auto overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
        <DivGrid
          key={`base-${rippleKey}`}
          className=""
          rows={computedGrid.rows || rows}
          cols={computedGrid.cols || cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col });
            setRippleKey((k) => k + 1);
          }}
          interactive={interactive}
        />
      </div>
    </div>
  );
};

type DivGridProps = {
  className?: string;
  rows: number;
  cols: number;
  cellSize: number; // in pixels
  borderColor: string;
  fillColor: string;
  clickedCell: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
};

type CellStyle = React.CSSProperties & {
  ["--delay"]?: string;
  ["--duration"]?: string;
};

const DivGrid = ({
  className,
  rows = 7,
  cols = 30,
  cellSize = 56,
  borderColor = "#3f3f46",
  fillColor = "transparent",
  clickedCell = null,
  onCellClick = () => {},
  interactive = true,
}: DivGridProps) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  );

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: "auto",
  };

  return (
    <div className={cn("relative z-[3]", className)} style={gridStyle}>
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0;
        const delay = clickedCell ? Math.max(0, distance * 55) : 0; // ms
        const duration = 200 + distance * 80; // ms

        const style: CellStyle = clickedCell
          ? {
              "--delay": `${delay}ms`,
              "--duration": `${duration}ms`,
            }
          : {};

        return (
          <div
            key={idx}
            className={cn(
              "cell relative border-[0.2px] opacity-10 transition-opacity duration-150 will-change-transform hover:opacity-25 dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]",
              clickedCell && "animate-cell-ripple [animation-fill-mode:none]",
              !interactive && "pointer-events-none",
            )}
            style={{
              backgroundColor: fillColor,
              borderColor: borderColor,
              ...style,
            }}
            onClick={
              interactive ? () => onCellClick?.(rowIdx, colIdx) : undefined
            }
          />
        );
      })}
    </div>
  );
};
