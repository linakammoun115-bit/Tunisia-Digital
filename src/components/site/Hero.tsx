import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Star,
} from "lucide-react";

import { Button } from "../ui/button";

export function Hero() {
  return (
    <section
      id="top"
      className="gradient-hero relative flex min-h-[90vh] items-center overflow-hidden py-24 pt-32"
    >
      {/* BACKGROUND */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />

      <div className="animate-blob pointer-events-none absolute left-[-5rem] top-1/4 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />

      <div className="animate-blob pointer-events-none absolute bottom-0 right-[-5rem] h-[500px] w-[500px] rounded-full bg-accent/30 blur-3xl [animation-delay:4s]" />

      {/* CENTER GLOW */}
      <div className="gradient-primary pointer-events-none absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl" />

      {/* CONTENT */}
      <div className="container relative z-10 mx-auto px-6">
        <div className="animate-fade-up mx-auto flex max-w-5xl flex-col items-center text-center">
          {/* TRUST BADGE */}
          <div className="glass mb-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />

            Trusted by 12,400+ users in Tunisia
          </div>

          {/* TITLE */}
          <h1 className="font-display mb-6 text-5xl font-bold leading-[1.05] md:text-6xl lg:text-7xl">
            Get Premium{" "}
            <span className="gradient-text">Subscriptions</span>
            <br />
            Easily in Tunisia
          </h1>

          {/* DESCRIPTION */}
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Unlock AI tools, streaming, creative software and productivity
            apps at unbeatable local prices. Instant delivery, secure payment
            and real human support.
          </p>

          {/* CTA */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="gradient-primary glow-primary h-12 border-0 px-7 text-base text-primary-foreground hover:opacity-90"
              asChild
            >
              <a href="#subscriptions">
                🚀 Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="glass h-12 border-border/60 px-7 text-base hover:bg-surface-elevated"
              asChild
            >
              <a href="#how">
                <Sparkles className="mr-2 h-4 w-4" />
                How it Works
              </a>
            </Button>
          </div>

          {/* TRUST ICONS */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              Secure payment
            </div>

            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              Instant delivery
            </div>

            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-accent text-accent" />
              4.9/5 rating
            </div>
          </div>
        </div>
      </div>

      {/* WHATSAPP */}
      <a
        href="https://wa.me/216XXXXXXXX"
        target="_blank"
        rel="noreferrer"
        aria-label="Contact WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl shadow-xl transition-transform hover:scale-110"
      >
        💬
      </a>
    </section>
  );
}
