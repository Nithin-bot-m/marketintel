"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, Sparkles } from "lucide-react";
import { Reveal } from "./Primitives";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      return;
    }
    setState("done");
  };

  return (
    <section id="newsletter" className="relative py-24 sm:py-28">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="conic-border relative overflow-hidden rounded-[2rem]">
            <div className="glass-strong relative overflow-hidden px-6 py-14 text-center sm:px-14 sm:py-16">
              {/* glows */}
              <div className="pointer-events-none absolute -top-24 left-1/4 h-56 w-56 rounded-full bg-amber-400/15 blur-[90px]" />
              <div className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-56 rounded-full bg-violet-500/15 blur-[90px]" />

              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 16 }}
                className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_40px_rgba(245,158,11,0.45)]"
              >
                <Sparkles className="h-7 w-7 text-black" />
              </motion.div>

              <h2 className="font-heading mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                The Global FX Wrap lands ahead of the <span className="text-gradient-gold">London crossover.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                One concise briefing. Daily currency drivers, ForexFactory calendar releases,
                CFTC speculative positioning, and XAU/USD technical levels — distilled from official
                central bank releases in a 4-minute read. Free forever.
              </p>

              <AnimatePresence mode="wait">
                {state !== "done" ? (
                  <motion.form
                    key="form"
                    exit={{ opacity: 0, y: -14 }}
                    onSubmit={submit}
                    className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
                  >
                    <div className="glass flex-1 rounded-full px-5 focus-within:border-amber-400/50">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setState("idle");
                        }}
                        placeholder="you@example.com"
                        aria-label="Email address"
                        className="h-12 w-full bg-transparent text-sm text-white placeholder:text-muted-foreground/60 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-7 text-sm font-bold text-black shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_46px_rgba(245,158,11,0.55)]"
                    >
                      Subscribe
                      <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mx-auto mt-9 flex max-w-md items-center justify-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-6 py-4"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <p className="text-sm font-semibold text-emerald-200">
                      You&apos;re in. First wrap lands at 06:30 GMT ahead of London open.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {state === "error" && (
                <p className="mt-3 text-xs text-rose-400">Please enter a valid email address.</p>
              )}

              <p className="mt-6 text-[11px] text-muted-foreground/70">
                No spam, no &quot;tips&quot;, no pump-and-dump — unsubscribe anytime.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
