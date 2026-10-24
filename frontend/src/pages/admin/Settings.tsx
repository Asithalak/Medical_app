import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface ConsultationType {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price_cents: number;
  duration_minutes: number;
  priority_score: number;
  is_active: boolean;
}

export default function AdminSettings() {
  const [types, setTypes] = useState<ConsultationType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    api.consultations.getTypes().then(({ data }) => {
      if (data) setTypes(data as ConsultationType[]);
      setLoading(false);
    });
  }, []);

  const updateType = (id: string, field: string, value: any) => {
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const save = async (type: ConsultationType) => {
    const { data, error } = await api.consultations.updateType(type.id, {
      display_name: type.display_name,
      description: type.description,
      price_cents: type.price_cents,
      duration_minutes: type.duration_minutes,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    } else {
      if (data) {
        setTypes((prev) => prev.map((t) => (t.id === type.id ? { ...t, ...data } : t)));
      }
      toast({
        title: "Pricing Saved Live",
        description: `${type.display_name} is now $${(type.price_cents / 100).toFixed(0)} (${type.duration_minutes} min) live on the patient portal.`,
      });
    }
  };

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl font-bold">Pricing & Settings</h1>
      <p className="mt-2 text-muted-foreground">Manage consultation types, pricing, and durations. Changes reflect immediately on the patient consultation page.</p>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {types.map((type) => (
            <Card key={type.id}>
              <CardHeader>
                <CardTitle className="text-lg">{type.name.toUpperCase()}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={type.display_name}
                    onChange={(e) => updateType(type.id, "display_name", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={type.description || ""}
                    onChange={(e) => updateType(type.id, "description", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={isNaN(type.price_cents) ? "" : type.price_cents / 100}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        updateType(type.id, "price_cents", isNaN(val) ? 0 : Math.round(val * 100));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={type.duration_minutes || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        updateType(type.id, "duration_minutes", isNaN(val) ? 0 : val);
                      }}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={() => save(type)}>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
