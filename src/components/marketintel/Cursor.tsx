"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue } from "framer-motion";

type Variant = "default" | "link";

const coarsePointerQuery = "(pointer: coarse), (hover: none)";
function subscribeCoarsePointer(cb: () => void) {
  const mq = window.matchMedia(coarsePointerQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
/** True only on genuine touch-only devices (phones / tablets). */
function isTouchOnly() {
  return (
    window.matchMedia(coarsePointerQuery).matches &&
    (navigator.maxTouchPoints > 0 || "ontouchstart" in window)
  );
}

/**
 * Custom dot cursor — a single precise dot that tracks the pointer 1:1.
 * Grows + turns amber over interactive elements, dips on press.
 * No trailing ring. Auto-disabled on touch devices.
 */
export default function Cursor() {
  const enabled = useSyncExternalStore(
    subscribeCoarsePointer,
    () => !isTouchOnly(),
    () => false,
  );
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<Variant>("default");
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  useEffect(() => {
    if (isTouchOnly()) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        "a, button, [role='button'], [data-cursor]",
      );
      setVariant(el ? "link" : "default");
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    const out = (e: MouseEvent) => {
      if (!e.relatedTarget) setVisible(false);
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.documentElement.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.documentElement.removeEventListener("mouseout", out);
    };
  }, [x, y]);

  if (!enabled) return null;

  const scale = pressed ? 0.55 : variant === "link" ? 2.4 : 1;

  return (
    <motion.div
      aria-hidden
      style={{ x, y }}
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
    >
      <motion.div
        animate={{
          scale,
          opacity: visible ? 1 : 0,
          backgroundColor: variant === "link" ? "#f59e0b" : "#ffffff",
        }}
        transition={{ type: "spring", stiffness: 520, damping: 30, mass: 0.4 }}
        className="h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.85)]"
      />
    </motion.div>
  );
}
