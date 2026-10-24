import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { maskPassport, maskPhone } from "@/lib/validators";
import { Eye, Send, RefreshCw, Users, Clock, CheckCircle2 } from "lucide-react";

interface ConsultationRow {
  id: string;
  status: string;
  priority_score: number;
  consultation_link: string | null;
  diagnosis: string | null;
  prescription: string | null;
  recommendations: string | null;
  follow_up_notes: string | null;
  created_at: string;
  patients: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    nationality: string;
    passport_number: string;
    hotel_address: string | null;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    tracking_code: string;
  };
  consultation_types: {
    display_name: string;
    name: string;
  };
  medical_prechecks: {
    chief_complaint: string;
    symptoms: string[];
    symptom_duration: string;
    allergies: string | null;
    current_medications: string | null;
    medical_history: string | null;
    has_chronic_conditions: boolean;
    chronic_conditions_detail: string | null;
  } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  scheduled: "bg-indigo-100 text-indigo-800",
  in_progress: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  referred: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function DoctorDashboard() {
  const [consultations, setConsultations] = useState<ConsultationRow[]>([]);
  const [selected, setSelected] = useState<ConsultationRow | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [consultLink, setConsultLink] = useState("");
  const [diagnosisForm, setDiagnosisForm] = useState({ diagnosis: "", prescription: "", recommendations: "", follow_up_notes: "" });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConsultations = useCallback(async () => {
    const { data } = await api.consultations.getQueue();
    if (data) setConsultations(data as unknown as ConsultationRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConsultations();
    const interval = setInterval(fetchConsultations, 30000);
    return () => clearInterval(interval);
  }, [fetchConsultations]);

  const openDetail = (c: ConsultationRow) => {
    setSelected(c);
    setConsultLink(c.consultation_link || "");
    setDiagnosisForm({
      diagnosis: c.diagnosis || "",
      prescription: c.prescription || "",
      recommendations: c.recommendations || "",
      follow_up_notes: c.follow_up_notes || "",
    });
    setShowDetail(true);
  };

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status };
    if (status === "in_progress") updates.started_at = new Date().toISOString();
    if (status === "completed") updates.completed_at = new Date().toISOString();

    await api.consultations.update(id, updates);
    toast({ title: "Status Updated" });
    fetchConsultations();
    setShowDetail(false);
  };

  const saveLink = async (id: string) => {
    await api.consultations.update(id, { consultation_link: consultLink });
    toast({ title: "Consultation Link Saved" });
    fetchConsultations();
  };

  const saveDiagnosis = async (id: string) => {
    await api.consultations.update(id, diagnosisForm);
    toast({ title: "Diagnosis Saved" });
    fetchConsultations();
  };

  const stats = {
    total: consultations.length,
    waiting: consultations.filter((c) => c.status === "paid").length,
    inProgress: consultations.filter((c) => c.status === "in_progress").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">Consultation Queue</h1>
          <Button variant="outline" size="sm" onClick={fetchConsultations}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <Clock className="h-8 w-8 text-medical-warning" />
              <div>
                <p className="text-2xl font-bold">{stats.waiting}</p>
                <p className="text-sm text-muted-foreground">Waiting</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <CheckCircle2 className="h-8 w-8 text-medical-success" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : consultations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No active consultations in the queue.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {consultations.map((c) => (
              <Card key={c.id} className="transition-colors hover:bg-secondary/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      c.consultation_types.name === "priority"
                        ? "bg-destructive/10 text-destructive"
                        : c.consultation_types.name === "standard"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {c.priority_score}
                    </div>
                    <div>
                      <p className="font-medium">{c.patients.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.consultation_types.display_name} · {c.patients.nationality}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusColors[c.status]}>{c.status.replace("_", " ")}</Badge>
                    <Button variant="outline" size="sm" onClick={() => openDetail(c)}>
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {selected.patients.full_name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Patient Info */}
                <div>
                  <h3 className="mb-2 font-semibold">Patient Info</h3>
                  <div className="grid gap-2 text-sm md:grid-cols-2">
                    <div><span className="text-muted-foreground">Email:</span> {selected.patients.email}</div>
                    <div><span className="text-muted-foreground">Phone:</span> {maskPhone(selected.patients.phone)}</div>
                    <div><span className="text-muted-foreground">DOB:</span> {selected.patients.date_of_birth}</div>
                    <div><span className="text-muted-foreground">Nationality:</span> {selected.patients.nationality}</div>
                    <div><span className="text-muted-foreground">Passport:</span> {maskPassport(selected.patients.passport_number)}</div>
                    <div><span className="text-muted-foreground">Tracking:</span> <span className="font-mono">{selected.patients.tracking_code}</span></div>
                  </div>
                </div>

                {/* Medical Info */}
                {selected.medical_prechecks && (
                  <div>
                    <h3 className="mb-2 font-semibold">Medical Pre-Check</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-muted-foreground">Chief Complaint:</span> {selected.medical_prechecks.chief_complaint}</div>
                      <div><span className="text-muted-foreground">Symptoms:</span> {selected.medical_prechecks.symptoms?.join(", ")}</div>
                      <div><span className="text-muted-foreground">Duration:</span> {selected.medical_prechecks.symptom_duration}</div>
                      {selected.medical_prechecks.allergies && <div><span className="text-muted-foreground">Allergies:</span> {selected.medical_prechecks.allergies}</div>}
                      {selected.medical_prechecks.current_medications && <div><span className="text-muted-foreground">Medications:</span> {selected.medical_prechecks.current_medications}</div>}
                      {selected.medical_prechecks.medical_history && <div><span className="text-muted-foreground">History:</span> {selected.medical_prechecks.medical_history}</div>}
                      {selected.medical_prechecks.has_chronic_conditions && <div><span className="text-muted-foreground">Chronic:</span> {selected.medical_prechecks.chronic_conditions_detail}</div>}
                    </div>
                  </div>
                )}

                {/* Consultation Link */}
                <div>
                  <h3 className="mb-2 font-semibold">Consultation Link</h3>
                  <div className="flex gap-2">
                    <Input
                      value={consultLink}
                      onChange={(e) => setConsultLink(e.target.value)}
                      placeholder="WhatsApp or Google Meet link..."
                    />
                    <Button size="sm" onClick={() => saveLink(selected.id)}>
                      <Send className="mr-1 h-4 w-4" /> Save
                    </Button>
                  </div>
                </div>

                {/* Diagnosis Form */}
                <div>
                  <h3 className="mb-2 font-semibold">Diagnosis & Notes</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Diagnosis</Label>
                      <Textarea value={diagnosisForm.diagnosis} onChange={(e) => setDiagnosisForm((f) => ({ ...f, diagnosis: e.target.value }))} rows={3} />
                    </div>
                    <div>
                      <Label>Prescription</Label>
                      <Textarea value={diagnosisForm.prescription} onChange={(e) => setDiagnosisForm((f) => ({ ...f, prescription: e.target.value }))} rows={2} />
                    </div>
                    <div>
                      <Label>Recommendations</Label>
                      <Textarea value={diagnosisForm.recommendations} onChange={(e) => setDiagnosisForm((f) => ({ ...f, recommendations: e.target.value }))} rows={2} />
                    </div>
                    <div>
                      <Label>Follow-up Notes</Label>
                      <Textarea value={diagnosisForm.follow_up_notes} onChange={(e) => setDiagnosisForm((f) => ({ ...f, follow_up_notes: e.target.value }))} rows={2} />
                    </div>
                    <Button onClick={() => saveDiagnosis(selected.id)}>Save Diagnosis</Button>
                  </div>
                </div>

                {/* Status Actions */}
                <div>
                  <h3 className="mb-2 font-semibold">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.status === "paid" && (
                      <Button onClick={() => updateStatus(selected.id, "in_progress")}>Start Consultation</Button>
                    )}
                    {selected.status === "in_progress" && (
                      <>
                        <Button onClick={() => updateStatus(selected.id, "completed")} className="bg-medical-success hover:bg-medical-success/90">Mark Completed</Button>
                        <Button variant="outline" onClick={() => updateStatus(selected.id, "referred")}>Refer Patient</Button>
                      </>
                    )}
                    <Button variant="destructive" onClick={() => updateStatus(selected.id, "cancelled")}>Cancel</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
