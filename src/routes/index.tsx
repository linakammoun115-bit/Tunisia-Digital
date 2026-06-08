import { createFileRoute } from "@tanstack/react-router";

import { Navbar } from "../components/site/Navbar";
import { Hero } from "../components/site/Hero";
import { MarqueeStrip } from "../components/site/MarqueeStrip";
import { Subscriptions } from "../components/site/Subscriptions";
import { Categories } from "../components/site/Categories";
import { WhyUs } from "../components/site/WhyUs";
import { HowItWorks } from "../components/site/HowItWorks";
import { Testimonials } from "../components/site/Testimonials";
import { Faq } from "../components/site/Faq";
import { Contact } from "../components/site/Contact";
import { Footer } from "../components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      {
        title: "TunisiaSubs — Premium Subscriptions Easily in Tunisia",
      },
      {
        name: "description",
        content:
          "Get premium AI tools, streaming, creative & productivity subscriptions at the best local prices in Tunisia. Instant delivery, secure payment, real support.",
      },
      {
        property: "og:title",
        content: "TunisiaSubs — Premium Subscriptions in Tunisia",
      },
      {
        property: "og:description",
        content:
          "AI, streaming, creative & productivity subscriptions at unbeatable Tunisian prices. Instant activation.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <main>
        <Hero />
        <MarqueeStrip />
        <Subscriptions />
        <Categories />
        <WhyUs />
        <HowItWorks />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}