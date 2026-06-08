import { MessageCircle, ArrowRight, Clock } from "lucide-react";
import { Button } from "../ui/button";

export function Contact() {
  return (
    <section id="contact" className="relative py-24">
      <div className="container mx-auto px-6">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-background/60 p-10 backdrop-blur-xl md:p-16">
          
          {/* Background glow */}
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />

          <div className="relative grid items-center gap-10 md:grid-cols-2">
            
            {/* LEFT */}
            <div>
              <h2 className="mb-4 font-display text-4xl font-bold md:text-5xl">
                Ready to <span className="gradient-text">Get Started?</span>
              </h2>

              <p className="mb-6 leading-relaxed text-muted-foreground">
                Our Tunisian team is ready to help you choose the best plan.
                Fast answers, real humans — no waiting.
              </p>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-green-500" />
                Average reply time: under 5 minutes
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">

              {/* WhatsApp */}
              <a
                href="https://wa.me/21629734222"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact us on WhatsApp"
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                    <MessageCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-sm text-muted-foreground">
                      +216 29 734 222
                    </div>
                  </div>
                </div>

                <ArrowRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
              </a>

              {/* Messenger */}
              <a
                href="https://m.me/yourpageusername"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact us on Messenger"
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                    {/* Messenger icon custom */}
                    <svg
                      className="h-6 w-6 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.02 2 11c0 2.87 1.64 5.43 4.2 7.09V22l3.07-1.68c.88.24 1.81.37 2.73.37 5.52 0 10-4.02 10-9S17.52 2 12 2zm1.2 11.6l-2.4-2.56-4.8 2.56 5.28-5.6 2.4 2.56 4.8-2.56-5.28 5.6z" />
                    </svg>
                  </div>

                  <div>
                    <div className="font-semibold">Messenger</div>
                    <div className="text-sm text-muted-foreground">
                      Chat with our page
                    </div>
                  </div>
                </div>

                <ArrowRight className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
              </a>

              {/* CTA */}
              <Button
                size="lg"
                className="mt-2 h-12 w-full border-0 bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg transition hover:opacity-90"
                asChild
              >
                <a href="#subscriptions">
                  Browse Plans Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}