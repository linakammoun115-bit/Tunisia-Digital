import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Star } from "lucide-react";
import { Button } from "../ui/button";


export function Hero() {

const defaultCards = [
  {
    id:1,
    name:"Canva Pro",
    category:"Design",
    price:"10 DT",
    oldPrice:"20 DT"
  },

  {
    id:2,
    name:"Adobe Creative Cloud Pro",
    category:"Creative",
    price:"40 DT"
  },

  {
    id:3,
    name:"Microsoft Office Professional Plus",
    category:"Productivity",
    price:"80 DT"
  }
];


const [cards,setCards] = useState(defaultCards);


useEffect(() => {

  const loadCards = () => {

    const saved = localStorage.getItem("floatingCards");

    if(saved){
      setCards(JSON.parse(saved));
    }

  };


  loadCards();


  window.addEventListener(
    "storage",
    loadCards
  );


  return () => {

    window.removeEventListener(
      "storage",
      loadCards
    );

  };


},[]);
  return (
    <section id="top" className="relative pt-32 pb-24 overflow-hidden gradient-hero">
      
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute bottom-0 -right-20 h-[500px] w-[500px] rounded-full bg-accent/30 blur-3xl animate-blob [animation-delay:4s]" />

      <div className="container relative z-10 mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT */}
        <div className="animate-fade-up">
          
          {/* TRUST BADGE */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-muted-foreground mb-6">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Trusted by 12,400+ users in Tunisia
          </div>

          {/* TITLE */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
            Get Premium <span className="gradient-text">Subscriptions</span>
            <br />
            Easily in Tunisia
          </h1>

          {/* DESCRIPTION */}
          <p className="text-lg text-muted-foreground max-w-xl mb-6 leading-relaxed">
            Unlock AI tools, streaming, creative software & productivity apps at unbeatable local
            prices. Instant delivery, secure payment, real human support.
          </p>

          {/* 🔥 URGENCY */}
          <div className="text-sm text-red-400 mb-6">
            🔥 Limited offer: Up to -50% today only
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-3 mb-10">
            
            <Button
              size="lg"
              className="gradient-primary text-primary-foreground border-0 hover:opacity-90 glow-primary text-base h-12 px-7"
              asChild
            >
              <a href="#subscriptions">
                🚀 Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="glass border-border/60 text-base h-12 px-7 hover:bg-surface-elevated"
              asChild
            >
              <a href="#how">
                <Sparkles className="mr-2 h-4 w-4" /> How it Works
              </a>
            </Button>

          </div>

          {/* TRUST ICONS */}
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              Secure payment
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-warning" />
              Instant delivery
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent fill-accent" />
              4.9/5 rating
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative animate-fade-up [animation-delay:200ms]">
          <div className="relative aspect-square max-w-lg mx-auto">

            <div className="absolute inset-0 gradient-primary rounded-full blur-3xl opacity-30 animate-pulse-glow" />

            {/* CARD 1 */}
            {/* CARD 1 */}
<div className="absolute top-10 left-0 glass rounded-2xl p-4 w-52 animate-float shadow-elegant">

  <div className="flex items-center gap-3 mb-2">

    <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
      <Sparkles className="h-5 w-5 text-primary-foreground" />
    </div>


    <div>

      <div className="text-sm font-semibold">
        {cards[0].name}
      </div>


      <div className="text-xs text-muted-foreground">
        {cards[0].category}
      </div>


    </div>


  </div>


  <div className="flex items-baseline gap-2">

    <span className="text-xl font-bold gradient-text">
      {cards[0].price}
    </span>


    {
      cards[0].oldPrice && (
        <span className="text-xs line-through text-muted-foreground">
          {cards[0].oldPrice}
        </span>
      )
    }


  </div>


</div>
            {/* CARD 2 */}
            <div className="absolute top-32 right-0 glass rounded-2xl p-4 w-56 animate-float [animation-delay:1.5s] shadow-elegant">
              <div className="flex items-center justify-between mb-2">
                <div className="px-2 py-0.5 rounded-md bg-accent/20 text-accent text-xs font-semibold">
                  POPULAR
                </div>
                <Star className="h-4 w-4 text-warning fill-warning" />
              </div>
              <div className="text-sm font-semibold mb-1">{cards[1].name}</div>
              <div className="text-xs text-muted-foreground mb-2">{cards[1].category}</div>
              <div className="text-xl font-bold gradient-text">{cards[1].price}</div>
            </div>

            {/* CARD 3 */}
            <div className="absolute bottom-10 left-8 glass rounded-2xl p-4 w-60 animate-float [animation-delay:3s] shadow-elegant">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{cards[2].name}</div>
                  <div className="text-xs text-muted-foreground">{cards[2].category}</div>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold gradient-text">{cards[2].price}</span>
                <span className="text-xs text-success">-43% off</span>
              </div>
            </div>

            {/* CENTER ORB */}
            <div className="absolute inset-1/4 rounded-full gradient-primary opacity-40 blur-2xl" />
          </div>
        </div>
      </div>

      {/* 💬 WHATSAPP FLOAT */}
      <a
        href="https://wa.me/216XXXXXXXX"
        className="fixed bottom-6 right-6 h-14 w-14 bg-green-500 rounded-full flex items-center justify-center shadow-xl z-50"
      >
        💬
      </a>
    </section>
  );
}
