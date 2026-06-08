import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"

type FaqItem = {
  id: string;
  q: string;
  a: string;
};

const faqs: FaqItem[] = [
  {
    id: "delivery-time",
    q: "How fast will I receive my subscription?",
    a: "Most orders are delivered within 5–15 minutes after payment confirmation. Bundle plans may take up to 1 hour during peak times.",
  },
  {
    id: "payment-methods",
    q: "What payment methods do you accept?",
    a: "We accept D17, e-Dinar, bank transfers (BIAT, BNA, Attijari, etc.), and international Visa / Mastercard.",
  },
  {
    id: "official-subscriptions",
    q: "Are these subscriptions official?",
    a: "We are an independent marketplace that resells access to premium digital services. We are not affiliated with any of the original brands shown.",
  },
  {
    id: "subscription-stops",
    q: "What if my subscription stops working?",
    a: "We offer free replacement during the warranty period (30 days to lifetime depending on your plan). Just contact us on WhatsApp.",
  },
  {
    id: "refund-policy",
    q: "Can I cancel or get a refund?",
    a: "You can cancel any plan anytime. We offer a 7-day satisfaction guarantee on first-time orders.",
  },
  {
    id: "international-clients",
    q: "Do you support clients outside Tunisia?",
    a: "Our service is optimized for Tunisia, but we also accept international clients who pay by card.",
  },
];

function FaqCard({ item }: { item: FaqItem }) {
  return (
    <AccordionItem
      value={item.id}
      className="overflow-hidden rounded-2xl border border-white/10 bg-background/60 px-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
    >
      <AccordionTrigger className="py-5 text-left font-display text-base font-semibold leading-6 hover:no-underline">
        {item.q}
      </AccordionTrigger>
      <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
        {item.a}
      </AccordionContent>
    </AccordionItem>
  );
}

export function Faq() {
  return (
    <section id="faq" className="relative py-24" aria-labelledby="faq-heading">
      <div className="container mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <h2
            id="faq-heading"
            className="mb-4 font-display text-4xl font-bold md:text-5xl"
          >
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            Everything you need to know before getting started.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((item) => (
            <FaqCard key={item.id} item={item} />
          ))}
        </Accordion>
      </div>
    </section>
  );
}