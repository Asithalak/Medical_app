import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#041d2d] text-white overflow-hidden print:hidden">
      {/* Background CHAT DR watermark */}
      <div
        className="absolute inset-x-0 bottom-1 flex justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <span className="text-[85px] sm:text-[130px] md:text-[170px] lg:text-[210px] font-black tracking-widest text-[#0b2d42] opacity-40 uppercase leading-none">
          CHAT DR
        </span>
      </div>

      <div className="container relative z-10 mx-auto px-4 py-12 md:py-16 max-w-5xl">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="md:pr-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0284c7]/20 border border-[#0284c7]/40">
                <img
                  src="/logo-icon.svg"
                  alt="ChatDr Logo"
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span className="font-display text-sm font-bold tracking-tight text-white">
                Medi Lanka / Embassy care
              </span>
            </Link>
            <p className="mt-3.5 text-xs text-slate-400 leading-relaxed">
              Dedicated private telemedicine sanctuary for international diplomatic staff, foreign passport holders, and travellers visiting sri lanka.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400">
              <Link to="/how-it-works" className="hover:text-white transition-colors">
                How It Works
              </Link>
              <Link to="/faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Legal
            </h4>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/emergency-disclaimer" className="hover:text-white transition-colors">
                Emergency disclaimer
              </Link>
            </div>
          </div>

          {/* Emergency */}
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Emergency
            </h4>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] text-slate-200 shadow-sm">
              <Phone className="h-3 w-3 text-sky-400 shrink-0" />
              <span>National Emergency Service : 1990 (Suwa Seriya)</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} Medi Lanka Healthcare. All Rights Reserved. Colombo, Sri Lanka.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>Terms Of Care</span>
            <span>Complaints Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
