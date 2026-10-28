import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plus } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-5 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl print:hidden">
      <div className="flex h-14 items-center justify-between rounded-full bg-white/80 px-4 shadow-lg shadow-primary/5 backdrop-blur-xl border border-white/40 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-logo">
            <Plus className="h-4 w-4 text-white" strokeWidth={3} />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            Medi Lanka
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:bg-secondary ${
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 md:flex shrink-0">
          <Link to="/login">
            <Button variant="ghost" size="sm" className="rounded-full text-sm">
              Doctor Login
            </Button>
          </Link>
          <Link to="/consultation/intake">
            <Button
              size="sm"
              className="rounded-full gradient-primary border-0 text-white text-sm shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-shadow"
            >
              Start Consultation
            </Button>
          </Link>
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-4 pt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-border" />
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full rounded-full">
                  Doctor Login
                </Button>
              </Link>
              <Link to="/consultation/intake" onClick={() => setOpen(false)}>
                <Button className="w-full rounded-full gradient-primary border-0 text-white">
                  Start Consultation
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
