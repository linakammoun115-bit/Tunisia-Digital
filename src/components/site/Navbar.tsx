import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Sparkles,
  ShoppingCart,
  CircleUserRound,
} from "lucide-react";
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
        scrolled
          ? "glass border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">
            Tunisia<span className="text-primary">Subs</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.href}
                to={link.href}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link
            to="/cart"
            className="relative hover:text-primary transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link
            to="/account"
            className="hover:text-primary transition-colors"
          >
            <CircleUserRound className="w-6 h-6" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background px-6 py-4">
          <div className="flex flex-col gap-4">
            {links.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="hover:text-primary"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="hover:text-primary"
                >
                  {link.label}
                </a>
              )
            )}

            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="hover:text-primary"
            >
              Mon compte
            </Link>

            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              className="hover:text-primary"
            >
              Panier ({cartCount})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
