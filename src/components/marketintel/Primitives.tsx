"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 36,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.85, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  kicker,
  title,
  sub,
  align = "left",
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
  align?: "left" | "center";
}) {
  return (
    <Reveal className={align === "center" ? "text-center" : ""}>
      <div
        className={`mb-4 flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
      >
        <span className="h-px w-8 bg-gradient-to-r from-amber-400 to-transparent" />
        <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
          {kicker}
        </span>
        {align === "center" && (
          <span className="h-px w-8 bg-gradient-to-l from-amber-400 to-transparent" />
        )}
      </div>
      <h2 className="font-heading text-3xl font-bold tracking-tight text-gradient-frost sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
        {title}
      </h2>
      {sub && (
        <p
          className={`mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {sub}
        </p>
      )}
    </Reveal>
  );
}
