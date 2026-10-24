import PublicLayout from "@/components/layout/PublicLayout";

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <div className="container py-16">
        <div className="prose prose-slate mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <h2>1. Information We Collect</h2>
          <p>We collect personal information including your name, passport details, contact information, and medical data necessary to provide medical consultation services.</p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide medical consultation services</li>
            <li>To communicate with you regarding your consultation</li>
            <li>To process payments securely via Stripe</li>
            <li>To maintain medical records as required by law</li>
          </ul>

          <h2>3. Data Protection</h2>
          <p>All data is transmitted securely using HTTPS/TLS 1.2+. Sensitive fields such as passport numbers and phone numbers are masked in display. Access to medical records is strictly limited to the treating doctor and authorized staff.</p>

          <h2>4. Payment Security</h2>
          <p>Payments are processed through Stripe, a PCI-DSS compliant payment processor. We never store your card details on our system.</p>

          <h2>5. Data Retention</h2>
          <p>Medical records are retained for the period required by Sri Lankan medical regulations. You may request review or deletion of your data by contacting us.</p>

          <h2>6. Third-Party Sharing</h2>
          <p>We do not sell or share your personal data with third parties except as required for payment processing (Stripe) or as required by law.</p>

          <h2>7. Your Rights</h2>
          <ul>
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (subject to legal requirements)</li>
            <li>Withdraw consent at any time</li>
          </ul>

          <h2>8. Contact</h2>
          <p>For questions about this privacy policy, please contact us at info@medconsult.lk.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
