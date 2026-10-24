import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Phone } from "lucide-react";

export default function EmergencyDisclaimer() {
  return (
    <PublicLayout>
      <div className="container py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <h1 className="font-display text-4xl font-bold">Emergency Disclaimer</h1>
          </div>

          <Card className="mb-8 border-destructive/30 bg-destructive/5">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-destructive">⚠️ This Service Is NOT For Emergencies</h2>
              <p className="mt-3 text-foreground">
                This online medical consultation service is designed for non-emergency medical queries.
                If you are experiencing a medical emergency, <strong>do not use this service</strong>.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold">If You Have an Emergency</h2>
          <div className="mt-4 space-y-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <Phone className="h-6 w-6 text-destructive" />
                <div>
                  <h3 className="font-semibold">Sri Lanka Emergency Services</h3>
                  <p className="text-2xl font-bold text-destructive">1990</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <Phone className="h-6 w-6 text-destructive" />
                <div>
                  <h3 className="font-semibold">Ambulance Service</h3>
                  <p className="text-2xl font-bold text-destructive">110</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <Phone className="h-6 w-6 text-destructive" />
                <div>
                  <h3 className="font-semibold">Police Emergency</h3>
                  <p className="text-2xl font-bold text-destructive">119</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold">Nearest Major Hospitals</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              <li>• <strong>National Hospital of Sri Lanka</strong> — Colombo (Regent Street)</li>
              <li>• <strong>Lanka Hospitals</strong> — Colombo 05</li>
              <li>• <strong>Nawaloka Hospital</strong> — Colombo 02</li>
              <li>• <strong>Asiri Hospital</strong> — Colombo 05</li>
            </ul>
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            If in doubt, always seek emergency medical care first. This platform is intended
            for scheduled, non-emergency consultations only.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
