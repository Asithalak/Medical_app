import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, Loader2, Sparkles, AlertCircle } from "lucide-react";

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
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  // New Pricing Plan Form State
  const [newPlan, setNewPlan] = useState({
    display_name: "",
    name: "",
    description: "",
    price: 75,
    duration_minutes: 20,
    priority_score: 30,
  });

  const loadTypes = async () => {
    setLoading(true);
    const { data } = await api.consultations.getTypes();
    if (data) {
      setTypes(data as ConsultationType[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTypes();
  }, []);

  const updateType = (id: string, field: string, value: any) => {
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const save = async (type: ConsultationType) => {
    setSavingId(type.id);
    const { data, error } = await api.consultations.updateType(type.id, {
      display_name: type.display_name,
      description: type.description,
      price_cents: type.price_cents,
      duration_minutes: type.duration_minutes,
      priority_score: type.priority_score,
    });

    setSavingId(null);

    if (error) {
      toast({ title: "Error Saving Plan", description: error.message || "Failed to save.", variant: "destructive" });
    } else {
      if (data) {
        setTypes((prev) => prev.map((t) => (t.id === type.id ? { ...t, ...data } : t)));
      }
      toast({
        title: "Pricing Saved Live",
        description: `"${type.display_name}" is now $${(type.price_cents / 100).toFixed(0)} (${type.duration_minutes} min) live on the patient portal.`,
      });
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.display_name.trim()) {
      toast({ title: "Display Name Required", description: "Please enter a plan name.", variant: "destructive" });
      return;
    }

    setCreating(true);
    const priceCents = Math.round(Number(newPlan.price) * 100);

    const { data, error } = await api.consultations.createType({
      display_name: newPlan.display_name.trim(),
      name: newPlan.name.trim() || undefined,
      description: newPlan.description.trim() || null,
      price_cents: priceCents,
      duration_minutes: Number(newPlan.duration_minutes) || 15,
      priority_score: Number(newPlan.priority_score) || 20,
    });

    setCreating(false);

    if (error || !data) {
      toast({
        title: "Failed to Add Plan",
        description: error?.message || "Could not create consultation plan.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "New Pricing Plan Added",
      description: `"${data.display_name}" is now active and selectable by patients.`,
    });

    setShowAddModal(false);
    setNewPlan({
      display_name: "",
      name: "",
      description: "",
      price: 75,
      duration_minutes: 20,
      priority_score: 30,
    });

    loadTypes();
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the "${name}" consultation plan?`)) {
      return;
    }

    setDeletingId(id);
    const { success, error } = await api.consultations.deleteType(id);
    setDeletingId(null);

    if (error || !success) {
      toast({ title: "Delete Failed", description: error?.message || "Could not delete plan.", variant: "destructive" });
    } else {
      setTypes((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Plan Removed", description: `"${name}" plan has been deleted.` });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Pricing & Consultation Plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage consultation types, fees, and durations. Changes reflect immediately on the patient booking portal.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="shrink-0 gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Pricing Plan
        </Button>
      </div>

      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading consultation pricing plans...</p>
        </div>
      ) : types.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold text-base">No Consultation Plans Found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              No active pricing plans are configured. Click the button below to add your first consultation type.
            </p>
            <Button onClick={() => setShowAddModal(true)} className="mt-4 gap-1.5">
              <Plus className="h-4 w-4" /> Add Pricing Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => (
            <Card key={type.id} className="relative flex flex-col justify-between shadow-xs transition-all hover:shadow-md border-border/80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="font-mono text-xs uppercase tracking-wider">
                    {type.name || "PLAN"}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                      Priority: {type.priority_score || 0}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(type.id, type.display_name)}
                      disabled={deletingId === type.id}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="Delete this plan"
                    >
                      {deletingId === type.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <CardTitle className="text-lg font-bold mt-2">
                  {type.display_name}
                </CardTitle>
                <CardDescription className="text-xs">
                  ${(type.price_cents / 100).toFixed(0)} USD · {type.duration_minutes} minutes
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-1 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium">Display Name</Label>
                    <Input
                      value={type.display_name}
                      className="mt-1"
                      onChange={(e) => updateType(type.id, "display_name", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Description</Label>
                    <Textarea
                      value={type.description || ""}
                      className="mt-1 text-xs"
                      onChange={(e) => updateType(type.id, "description", e.target.value)}
                      rows={3}
                      placeholder="Explain what this consultation type covers..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium">Price ($ USD)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        className="mt-1"
                        value={isNaN(type.price_cents) ? "" : type.price_cents / 100}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          updateType(type.id, "price_cents", isNaN(val) ? 0 : Math.round(val * 100));
                        }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Duration (min)</Label>
                      <Input
                        type="number"
                        min="1"
                        className="mt-1"
                        value={type.duration_minutes || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          updateType(type.id, "duration_minutes", isNaN(val) ? 0 : val);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Queue Priority Score (0 - 100)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="1000"
                      className="mt-1"
                      value={type.priority_score || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        updateType(type.id, "priority_score", isNaN(val) ? 0 : val);
                      }}
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Higher numbers appear earlier in the doctor consultation queue.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    className="w-full gap-2 shadow-xs"
                    onClick={() => save(type)}
                    disabled={savingId === type.id}
                  >
                    {savingId === type.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {savingId === type.id ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Pricing Plan Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreatePlan}>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg">Add New Pricing Plan</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                Create a new consultation package. Once created, patients can choose this plan on the booking form.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 py-4 text-sm">
              <div>
                <Label htmlFor="plan-name" className="text-xs font-semibold">
                  Plan Display Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="plan-name"
                  placeholder="e.g., Emergency Video Consultation, Specialist Review"
                  value={newPlan.display_name}
                  onChange={(e) => setNewPlan((p) => ({ ...p, display_name: e.target.value }))}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="plan-code" className="text-xs font-semibold">
                  Code Slug (optional)
                </Label>
                <Input
                  id="plan-code"
                  placeholder="e.g., emergency_care (auto-generated if empty)"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 font-mono text-xs"
                />
              </div>

              <div>
                <Label htmlFor="plan-desc" className="text-xs font-semibold">
                  Description
                </Label>
                <Textarea
                  id="plan-desc"
                  placeholder="Describe who this consultation is ideal for and what services are included..."
                  value={newPlan.description}
                  onChange={(e) => setNewPlan((p) => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="plan-price" className="text-xs font-semibold">
                    Price ($ USD) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="plan-price"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="75"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="plan-duration" className="text-xs font-semibold">
                    Duration (Minutes) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="plan-duration"
                    type="number"
                    min="1"
                    placeholder="20"
                    value={newPlan.duration_minutes}
                    onChange={(e) => setNewPlan((p) => ({ ...p, duration_minutes: parseInt(e.target.value, 10) || 15 }))}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="plan-priority" className="text-xs font-semibold">
                  Queue Priority Score (0 - 100)
                </Label>
                <Input
                  id="plan-priority"
                  type="number"
                  min="0"
                  max="1000"
                  placeholder="30"
                  value={newPlan.priority_score}
                  onChange={(e) => setNewPlan((p) => ({ ...p, priority_score: parseInt(e.target.value, 10) || 0 }))}
                  className="mt-1"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Default priority ranking in the doctor's queue (e.g. Standard: 50, Priority: 100).
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} disabled={creating}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="gap-1.5">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? "Creating..." : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
