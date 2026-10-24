import PublicLayout from "@/components/layout/PublicLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "Who is the doctor?", a: "Our doctor is an embassy-recommended medical professional based in Sri Lanka, specializing in treating foreign visitors and travelers." },
  { q: "Do I need to create an account?", a: "No, account creation is optional. You can complete the entire consultation process using just the tracking code you receive after submitting your information." },
  { q: "What types of consultation are available?", a: "We offer three types: Priority (highest queue priority for urgent conditions), Standard (comprehensive assessment), and Short (quick queries or prescription follow-ups). Up-to-date pricing is displayed directly when booking." },
  { q: "How do I pay?", a: "Payment is made securely online via Stripe. We accept all major credit and debit cards. Your card details are never stored on our system." },
  { q: "How will I receive the consultation?", a: "After payment, the doctor will review your case and share a WhatsApp or Google Meet link. You'll see this link on your status tracking page." },
  { q: "Is my medical data secure?", a: "Yes. All data is transmitted over HTTPS, sensitive fields are encrypted, and access is strictly controlled. Only the doctor and authorized staff can view your medical records." },
  { q: "What if I have a medical emergency?", a: "This service is NOT for emergencies. If you have a medical emergency, call 1990 (Sri Lanka Emergency Services) or go to the nearest hospital immediately." },
  { q: "Can I get a prescription?", a: "Yes, the doctor can provide prescriptions as part of the consultation. These can be used at local pharmacies in Sri Lanka." },
  { q: "How long do I wait for a consultation?", a: "Wait times vary. Priority consultations are handled first. You can track your position using the tracking code." },
  { q: "Can I cancel and get a refund?", a: "Please contact us for cancellation and refund requests. Refunds are handled on a case-by-case basis." },
];

export default function FAQ() {
  return (
    <PublicLayout>
      <div className="container py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Find answers to common questions about our medical consultation service.
          </p>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </PublicLayout>
  );
}
