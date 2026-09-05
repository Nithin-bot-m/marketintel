"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type Variant = "default" | "link" | "label";

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
 * Custom dot cursor — instant gold dot + spring-loaded trailing ring.
 * Expands over interactive elements, shows a label when elements
 * declare data-cursor-label. Auto-disabled on touch devices.
 */
export default function Cursor() {
  const enabled = useSyncExternalStore(
    subscribeCoarsePointer,
    () => !isTouchOnly(),
    () => false,
  );
  const [visible, setVisible] = useState(false);
  const [variant, setVariant] = useState<Variant>("default");
  const [label, setLabel] = useState("");
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 24, mass: 0.55 });
  const ry = useSpring(y, { stiffness: 260, damping: 24, mass: 0.55 });

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
      ) as HTMLElement | null;
      if (!el) {
        setVariant("default");
        setLabel("");
        return;
      }
      const lbl = el.getAttribute("data-cursor-label");
      if (lbl) {
        setVariant("label");
        setLabel(lbl);
      } else {
        setVariant("link");
        setLabel("");
      }
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

  const ringSize = variant === "label" ? 76 : variant === "link" ? 52 : 34;
  const ringScale = pressed ? 0.82 : 1;
  const dotScale = pressed ? 0.6 : variant === "label" ? 0 : 1;

  return (
    <>
      {/* trailing ring */}
      <motion.div
        aria-hidden
        style={{ x: rx, y: ry }}
        className="pointer-events-none fixed left-0 top-0 z-[9998]"
      >
        <motion.div
          animate={{
            width: ringSize,
            height: ringSize,
            scale: ringScale,
            opacity: visible ? 1 : 0,
            backgroundColor:
              variant === "label" ? "rgba(245,158,11,0.96)" : "rgba(245,158,11,0)",
            borderColor:
              variant === "label"
                ? "rgba(245,158,11,0)"
                : variant === "link"
                  ? "rgba(245,158,11,0.75)"
                  : "rgba(255,255,255,0.45)",
        }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
        >
          <motion.span
            animate={{ opacity: variant === "label" ? 1 : 0, scale: variant === "label" ? 1 : 0.5 }}
            transition={{ duration: 0.18 }}
            className="select-none text-[9px] font-bold uppercase tracking-[0.2em] text-black"
          >
            {label}
          </motion.span>
        </motion.div>
      </motion.div>

      {/* instant dot */}
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[9999]"
      >
        <motion.div
          animate={{
            scale: dotScale,
            opacity: visible ? 1 : 0,
            backgroundColor: variant === "link" ? "#f59e0b" : "#ffffff",
          }}
          transition={{ duration: 0.15 }}
          className="h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]"
        />
      </motion.div>
    </>
  );
}
