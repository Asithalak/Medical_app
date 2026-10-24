import PublicLayout from "@/components/layout/PublicLayout";
import { ClipboardList, FileCheck, CreditCard, Video, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Step 1: Fill Intake Form",
    desc: "Provide your personal information including passport details, contact info, and emergency contact. You must give consent to proceed.",
  },
  {
    icon: FileCheck,
    title: "Step 2: Medical Pre-Check",
    desc: "Complete a structured medical questionnaire covering your symptoms, allergies, current medications, and medical history. You can optionally upload medical documents.",
  },
  {
    icon: CreditCard,
    title: "Step 3: Select & Pay",
    desc: "Choose between Priority (highest queue priority), Standard, or Short consultation with live transparent pricing. Pay securely via Stripe.",
  },
  {
    icon: Video,
    title: "Step 4: Receive Consultation Link",
    desc: "Once the doctor reviews your case, you'll receive a WhatsApp or Google Meet link. You can track your status using the tracking code provided after payment.",
  },
  {
    icon: CheckCircle,
    title: "Step 5: Get Diagnosed",
    desc: "Join your consultation at the scheduled time. The doctor will provide a diagnosis, prescription, and follow-up recommendations.",
  },
];

export default function HowItWorks() {
  return (
    <PublicLayout>
      <div className="container py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-bold">How It Works</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Getting medical help as a foreign visitor in Sri Lanka has never been easier.
          </p>

          <div className="mt-12 space-y-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1 text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
