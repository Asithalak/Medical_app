import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  CreditCard,
  Video,
  Shield,
  Clock,
  Globe,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const features = [
  { icon: ClipboardList, title: "Simple Intake", desc: "Quick, structured medical forms designed for international patients" },
  { icon: Shield, title: "Secure & Private", desc: "Your medical data is encrypted and protected to the highest standards" },
  { icon: CreditCard, title: "Easy Payment", desc: "Secure online payment via Stripe — no cash needed" },
  { icon: Video, title: "Virtual Consult", desc: "Connect via WhatsApp or Google Meet from your hotel" },
  { icon: Clock, title: "Priority Access", desc: "Choose priority consultation for urgent medical needs" },
  { icon: Globe, title: "Multilingual", desc: "Service designed for foreign visitors from any country" },
];

const steps = [
  { num: "01", title: "Fill Your Details", desc: "Complete the intake form with your personal and medical information" },
  { num: "02", title: "Choose & Pay", desc: "Select your consultation type and make a secure online payment" },
  { num: "03", title: "Get Consulted", desc: "Receive your consultation link and connect with the doctor" },
];

export default function Index() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/20 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-accent/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="container relative py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground">
              <CheckCircle2 className="h-4 w-4 text-accent" />
              Embassy-Recommended Doctor
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Medical Consultation for{" "}
              <span className="gradient-primary-text">Foreign Visitors</span>{" "}
              in Sri Lanka
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Get professional medical advice from a trusted, embassy-recommended doctor.
              Simple intake, secure payment, virtual consultation — all from your device.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/consultation/intake">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full gradient-primary border-0 text-white text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all gap-2"
                >
                  Start Consultation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/track">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full text-base border-border"
                >
                  Track My Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-secondary/50 py-16">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold">How It Works</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Three simple steps to get the medical help you need
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.num}
                className="relative rounded-2xl gradient-primary p-8 text-white text-center"
              >
                <div className="text-4xl font-extrabold font-display text-white/30">{step.num}</div>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-white/80">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold">Why Choose Us</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:shadow-primary/5 transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary/50 py-16">
        <div className="container">
          <div className="grid gap-8 text-center md:grid-cols-3">
            <div>
              <div className="font-display text-4xl font-extrabold gradient-primary-text">500+</div>
              <p className="mt-2 text-muted-foreground">Patients Served</p>
            </div>
            <div>
              <div className="font-display text-4xl font-extrabold gradient-primary-text">15min</div>
              <p className="mt-2 text-muted-foreground">Average Wait Time</p>
            </div>
            <div>
              <div className="font-display text-4xl font-extrabold gradient-primary-text">24/7</div>
              <p className="mt-2 text-muted-foreground">Online Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 text-center">
        <div className="mx-auto max-w-2xl rounded-3xl gradient-primary p-10 md:p-14 text-white">
          <h2 className="font-display text-3xl font-bold">Need Medical Help?</h2>
          <p className="mt-3 text-white/80">
            Don't wait — start your consultation now. Our doctor is ready to help.
          </p>
          <Link to="/consultation/intake">
            <Button
              size="lg"
              className="mt-6 rounded-full bg-white text-primary hover:bg-white/90 text-base font-semibold shadow-lg"
            >
              Start Consultation Now
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
