import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

export default function Footer() {
  return (
    <footer className="gradient-footer text-white print:hidden">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Plus className="h-4 w-4 text-white" strokeWidth={3} />
              </div>
              <span className="font-display text-lg font-bold text-white">Medi Lanka</span>
            </Link>
            <p className="mt-3 text-sm text-white/70">
              Embassy-recommended medical consultation for foreign visitors in Sri Lanka.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-white/70">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/emergency-disclaimer" className="hover:text-white transition-colors">Emergency Disclaimer</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Emergency</h4>
            <p className="text-sm text-white/70">
              For medical emergencies, call <strong className="text-white">1990</strong> (Sri Lanka Emergency) immediately.
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-white/20 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Medi Lanka. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
