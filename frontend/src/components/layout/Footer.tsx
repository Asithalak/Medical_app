import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#012f49] via-[#014972] to-[#0168a3] text-white overflow-hidden print:hidden">
      {/* Background CHAT DR watermark */}
      <div
        className="absolute inset-x-0 bottom-2 md:bottom-3 flex justify-center pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <span className="text-[110px] sm:text-[160px] md:text-[210px] lg:text-[260px] font-black tracking-[0.06em] text-[#00243a] opacity-25 uppercase leading-none whitespace-nowrap">
          CHAT DR
        </span>
      </div>

      <div className="container relative z-10 mx-auto px-6 py-12 md:py-16 max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 items-start">
          {/* Brand Info (Col 1) */}
          <div className="lg:col-span-5 pr-0 lg:pr-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/image 26.svg"
                alt="ChatDr Logo"
                className="h-11 sm:h-12 w-auto object-contain"
              />
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-white">
                Medi Lanka / Embassy care
              </span>
            </Link>
            <p className="mt-3.5 text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-sm">
              Dedicated private telemedicine sanctuary for international diplomatic staff, foreign passport holders, and travelers visiting sri lanka.
            </p>
          </div>

          {/* Quick Links (Col 2) */}
          <div className="lg:col-span-2">
            <h4 className="mb-3 text-sm font-semibold text-white">
              Quick Links
            </h4>
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-slate-300">
              <Link to="/how-it-works" className="hover:text-white transition-colors">
                How it works
              </Link>
              <Link to="/faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
              <Link to="/contact" className="hover:text-white transition-colors">
                Contact us
              </Link>
            </div>
          </div>

          {/* Legal (Col 3) */}
          <div className="lg:col-span-2">
            <h4 className="mb-3 text-sm font-semibold text-white">
              Legal
            </h4>
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-slate-300">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">
                Privacy policy
              </Link>
              <Link to="/emergency-disclaimer" className="hover:text-white transition-colors">
                Emergency disclaimer
              </Link>
            </div>
          </div>

          {/* Emergency (Col 4) */}
          <div className="lg:col-span-3">
            <h4 className="mb-3 text-sm font-semibold text-white">
              Emergency
            </h4>
            <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-medium text-slate-900 shadow-md">
              <Phone className="h-4 w-4 text-emerald-600 shrink-0 fill-emerald-600" />
              <span>National Emergency Service: 1990 (Suwa Seriya)</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar without horizontal border line */}
        <div className="mt-14 md:mt-18 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-300/90">
          <div>
            © 2025 Medi Lanka Healthcare. All Rights Reserved. Colombo, Sri Lanka.
          </div>
          <div className="flex items-center gap-6 text-slate-300/90">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>Terms Of Care</span>
            <span>Consular Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
