import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock } from "lucide-react";

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const consultationId = sessionStorage.getItem("consultation_id");
  const trackingCode = sessionStorage.getItem("tracking_code");
  const priceCents = parseInt(sessionStorage.getItem("selected_type_price") || "0");
  const typeName = sessionStorage.getItem("selected_type_name") || "Consultation";

  if (!consultationId || !trackingCode) {
    return (
      <PublicLayout>
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold">Session Expired</h2>
          <Button className="mt-4" onClick={() => navigate("/consultation/intake")}>Start Over</Button>
        </div>
      </PublicLayout>
    );
  }

  const handlePayment = async () => {
    setLoading(true);

    const { error } = await api.payments.process({
      consultation_id: consultationId,
      amount_cents: priceCents,
      currency: "usd",
      stripe_payment_id: `sim_${Date.now()}`,
    });

    if (error) {
      toast({ title: "Payment Failed", description: "Please try again.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Clear session data
    sessionStorage.removeItem("patient_id");
    sessionStorage.removeItem("precheck_id");
    sessionStorage.removeItem("consultation_id");
    sessionStorage.removeItem("selected_type_price");
    sessionStorage.removeItem("selected_type_name");

    navigate(`/track?code=${trackingCode}`);
  };

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-lg">
          <Progress value={80} className="mb-6" />
          <p className="mb-2 text-sm text-muted-foreground">Step 4 of 4</p>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Payment</CardTitle>
              <CardDescription>Complete your payment to confirm the consultation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-secondary p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{typeName}</span>
                  <span className="text-2xl font-bold text-primary">${(priceCents / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Your tracking code will be:</p>
                <p className="mt-1 font-mono text-lg font-bold text-foreground">{trackingCode}</p>
                <p className="mt-1">Save this code to track your consultation status.</p>
              </div>

              <Button className="w-full" size="lg" onClick={handlePayment} disabled={loading}>
                {loading ? "Processing Payment..." : `Pay $${(priceCents / 100).toFixed(2)}`}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Secured by Stripe · PCI-DSS Compliant
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
