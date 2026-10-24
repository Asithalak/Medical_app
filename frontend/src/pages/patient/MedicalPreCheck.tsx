import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";
import { medicalPreCheckSchema, SYMPTOM_OPTIONS, validateFile } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

export default function MedicalPreCheck() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [symptomDuration, setSymptomDuration] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [hasChronic, setHasChronic] = useState(false);
  const [chronicDetail, setChronicDetail] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const patientId = sessionStorage.getItem("patient_id");

  if (!patientId) {
    return (
      <PublicLayout>
        <div className="container py-16 text-center">
          <h2 className="text-2xl font-bold">Session Expired</h2>
          <p className="mt-2 text-muted-foreground">Please start over from the intake form.</p>
          <Button className="mt-4" onClick={() => navigate("/consultation/intake")}>Go to Intake Form</Button>
        </div>
      </PublicLayout>
    );
  }

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    for (const file of newFiles) {
      const err = validateFile(file);
      if (err) {
        toast({ title: "Invalid File", description: err, variant: "destructive" });
        return;
      }
    }
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      chief_complaint: chiefComplaint,
      symptoms,
      symptom_duration: symptomDuration,
      allergies: allergies || undefined,
      current_medications: medications || undefined,
      medical_history: medicalHistory || undefined,
      has_chronic_conditions: hasChronic,
      chronic_conditions_detail: chronicDetail || undefined,
    };

    const result = medicalPreCheckSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    // Upload files if any
    const fileUrls: string[] = [];
    for (const file of files) {
      const path = `${patientId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await api.prechecks.uploadFile(path, file);
      if (!uploadError) fileUrls.push(path);
    }

    const { data: precheckId, error } = await api.prechecks.create({
      _patient_id: patientId,
      _chief_complaint: result.data.chief_complaint,
      _symptoms: result.data.symptoms,
      _symptom_duration: result.data.symptom_duration || null,
      _allergies: result.data.allergies || null,
      _current_medications: result.data.current_medications || null,
      _medical_history: result.data.medical_history || null,
      _has_chronic_conditions: result.data.has_chronic_conditions,
      _chronic_conditions_detail: result.data.chronic_conditions_detail || null,
      _file_urls: fileUrls,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
      setLoading(false);
      return;
    }

    sessionStorage.setItem("precheck_id", precheckId);
    navigate("/consultation/select");
  };

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <Progress value={40} className="mb-6" />
          <p className="mb-2 text-sm text-muted-foreground">Step 2 of 4</p>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">Medical Pre-Check</CardTitle>
              <CardDescription>
                Help us understand your medical needs so the doctor can prepare for your consultation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Chief Complaint <span className="text-destructive">*</span></Label>
                  <Textarea
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Describe your main medical concern in detail..."
                    rows={4}
                    maxLength={2000}
                    className={errors.chief_complaint ? "border-destructive" : ""}
                  />
                  {errors.chief_complaint && <p className="mt-1 text-xs text-destructive">{errors.chief_complaint}</p>}
                </div>

                <div>
                  <Label>Symptoms <span className="text-destructive">*</span></Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SYMPTOM_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSymptom(s)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          symptoms.includes(s)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:bg-secondary"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {errors.symptoms && <p className="mt-1 text-xs text-destructive">{errors.symptoms}</p>}
                </div>

                <div>
                  <Label>How long have you had these symptoms? <span className="text-destructive">*</span></Label>
                  <Input
                    value={symptomDuration}
                    onChange={(e) => setSymptomDuration(e.target.value)}
                    placeholder="e.g., 3 days, 1 week"
                    maxLength={200}
                    className={errors.symptom_duration ? "border-destructive" : ""}
                  />
                  {errors.symptom_duration && <p className="mt-1 text-xs text-destructive">{errors.symptom_duration}</p>}
                </div>

                <div>
                  <Label>Known Allergies</Label>
                  <Textarea value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="List any known allergies..." maxLength={1000} rows={2} />
                </div>

                <div>
                  <Label>Current Medications</Label>
                  <Textarea value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="List any medications you're currently taking..." maxLength={1000} rows={2} />
                </div>

                <div>
                  <Label>Medical History</Label>
                  <Textarea value={medicalHistory} onChange={(e) => setMedicalHistory(e.target.value)} placeholder="Any relevant past medical history..." maxLength={2000} rows={3} />
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={hasChronic} onCheckedChange={setHasChronic} />
                  <Label>I have chronic medical conditions</Label>
                </div>

                {hasChronic && (
                  <div>
                    <Label>Please describe your chronic conditions</Label>
                    <Textarea value={chronicDetail} onChange={(e) => setChronicDetail(e.target.value)} placeholder="e.g., Diabetes Type 2, Hypertension..." maxLength={1000} rows={2} />
                  </div>
                )}

                <div>
                  <Label>Upload Medical Documents (optional)</Label>
                  <p className="mb-2 text-xs text-muted-foreground">PDF or images only, max 5MB each, up to 5 files</p>
                  <div className="flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-secondary">
                      <Upload className="h-4 w-4" />
                      Choose Files
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple onChange={handleFileChange} />
                    </label>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="truncate">{f.name}</span>
                          <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}>
                            <X className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Continue to Select Consultation"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
