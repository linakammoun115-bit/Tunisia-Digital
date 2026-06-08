import { useEffect, useState } from "react";
import { Menu, X, Sparkles, ShoppingCart, CircleUserRound } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@tanstack/react-router";

const links = [
  { href: "#subscriptions", label: "Subscriptions" },
  { href: "#categories", label: "Categories" },
  { href: "#how", label: "How it Works" },
  { href: "#faq", label: "FAQ" },
  { href: "/wheel", label: "🎁 Wheel Game" },
];

type CartItem = {
  quantity: number;
};

function getCartCount() {
  try {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  } catch {
    return 0;
  }
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    const updateCart = () => {
      setCartCount(getCartCount());
    };

    onScroll();
    updateCart();

    window.addEventListener("scroll", onScroll);
    window.addEventListener("storage", updateCart);
    window.addEventListener("cart-updated", updateCart);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("storage", updateCart);
      window.removeEventListener("cart-updated", updateCart);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 ${
        scrolled ? "glass border-b border-border/50" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        
        {/* LOGO */}
        <a href="#top" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold">
            Tunisia<span className="gradient-text">Subs</span>
          </span>
        </a>

        {/* LINKS */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          
          {/* CART */}
          <Link to="/cart" className="relative">
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 text-xs bg-primary text-white rounded-full px-1">
                {cartCount}
              </span>
            )}
          </Link>

          {/* ACCOUNT */}
          <Link to="/account">
            <CircleUserRound />
          </Link>

          {/* MENU MOBILE */}
          <button onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {open && (
        <div className="lg:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}

          <Link to="/account">Mon compte</Link>
          <Link to="/cart">Panier ({cartCount})</Link>
        </div>
      )}
    </header>
  );
}