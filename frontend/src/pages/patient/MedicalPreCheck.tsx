import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";
import { medicalPreCheckSchema, SYMPTOM_OPTIONS, validateFile } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  RefreshCw,
  CloudUpload,
} from "lucide-react";

interface UploadItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  previewUrl?: string;
  errorMsg?: string;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function MedicalPreCheck() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [symptomDuration, setSymptomDuration] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [hasChronic, setHasChronic] = useState(false);
  const [chronicDetail, setChronicDetail] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadItem[]>([]);
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

  const uploadSingleFile = async (item: UploadItem) => {
    const uploadPath = `${patientId}/${Date.now()}-${item.name}`;
    const { data: uploadedUrl, error } = await api.prechecks.uploadFile(uploadPath, item.file);

    setUploadedFiles((prev) =>
      prev.map((f) => {
        if (f.id !== item.id) return f;
        if (error || !uploadedUrl) {
          return {
            ...f,
            status: 'error',
            errorMsg: error?.message || 'Upload failed. Please try again.',
          };
        }
        return {
          ...f,
          status: 'completed',
          url: uploadedUrl,
          errorMsg: undefined,
        };
      })
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (uploadedFiles.length + selectedFiles.length > 5) {
      toast({
        title: "File Limit Exceeded",
        description: "You can upload a maximum of 5 files in total.",
        variant: "destructive",
      });
      e.target.value = '';
      return;
    }

    const newItems: UploadItem[] = [];
    for (const file of selectedFiles) {
      const err = validateFile(file);
      if (err) {
        toast({ title: `Invalid File: ${file.name}`, description: err, variant: "destructive" });
        continue;
      }

      const item: UploadItem = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      };
      newItems.push(item);
    }

    if (newItems.length > 0) {
      setUploadedFiles((prev) => [...prev, ...newItems]);
      // Immediately start background Cloudinary upload
      newItems.forEach((item) => {
        uploadSingleFile(item);
      });
    }

    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const retryFile = (id: string) => {
    const item = uploadedFiles.find((f) => f.id === id);
    if (!item) return;

    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'uploading', errorMsg: undefined } : f))
    );
    uploadSingleFile(item);
  };

  // State checks for blocking progression
  const isUploading = uploadedFiles.some((f) => f.status === 'uploading');
  const hasErrors = uploadedFiles.some((f) => f.status === 'error');
  const completedFiles = uploadedFiles.filter((f) => f.status === 'completed' && f.url);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block submission if files are still actively uploading
    if (isUploading) {
      toast({
        title: "Uploading in Progress",
        description: "Please wait until all documents finish uploading before continuing.",
        variant: "destructive",
      });
      return;
    }

    // Block if any failed files are left unresolved
    if (hasErrors) {
      toast({
        title: "Failed Documents Detected",
        description: "Please retry or remove failed files to continue.",
        variant: "destructive",
      });
      return;
    }

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

    // Extract Cloudinary URLs from successfully uploaded documents
    const fileUrls: string[] = completedFiles.map((f) => f.url as string);

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

                {/* Cloudinary Document Upload Section */}
                <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Upload Medical Documents (optional)</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        PDF or images only (JPG, PNG, WebP), max 5MB each, up to 5 files
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      {uploadedFiles.length}/5 files
                    </span>
                  </div>

                  {uploadedFiles.length < 5 && (
                    <div>
                      <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 px-6 py-6 text-center transition-all hover:border-primary/50 hover:bg-muted/40">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                          <CloudUpload className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          Choose Files or Drag & Drop
                        </span>
                        <span className="mt-1 text-xs text-muted-foreground">
                          Prescriptions, lab reports, or symptom photos
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          multiple
                          disabled={isUploading || uploadedFiles.length >= 5}
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  )}

                  {/* Uploaded File List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {uploadedFiles.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between rounded-lg border p-3 text-sm transition-colors ${
                            item.status === 'completed'
                              ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20'
                              : item.status === 'error'
                              ? 'border-destructive/30 bg-destructive/5'
                              : 'border-primary/30 bg-primary/5'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Thumbnail or Icon */}
                            {item.previewUrl ? (
                              <img
                                src={item.previewUrl}
                                alt={item.name}
                                className="h-10 w-10 rounded object-cover border shrink-0 bg-background"
                              />
                            ) : item.type === 'application/pdf' ? (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 font-bold text-xs">
                                PDF
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                                <FileText className="h-5 w-5" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-foreground text-xs sm:text-sm">{item.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <span>{formatBytes(item.size)}</span>
                                <span>•</span>
                                {item.status === 'uploading' && (
                                  <span className="flex items-center gap-1 text-primary font-medium">
                                    <Loader2 className="h-3 w-3 animate-spin shrink-0" /> Uploading to Cloudinary...
                                  </span>
                                )}
                                {item.status === 'completed' && (
                                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                    <CheckCircle2 className="h-3 w-3 shrink-0" /> Uploaded
                                  </span>
                                )}
                                {item.status === 'error' && (
                                  <span className="flex items-center gap-1 text-destructive font-medium truncate">
                                    <AlertCircle className="h-3 w-3 shrink-0" /> {item.errorMsg || 'Upload failed'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 ml-2 shrink-0">
                            {item.status === 'error' && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                onClick={() => retryFile(item.id)}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" /> Retry
                              </Button>
                            )}
                            {item.status === 'completed' && item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Open uploaded document in new tab"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(item.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Remove file"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit / Proceed Section */}
                <div className="space-y-2 pt-2">
                  {isUploading && (
                    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary animate-pulse">
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      <span>
                        Uploading documents in progress... You cannot proceed to the next step until the upload is completed.
                      </span>
                    </div>
                  )}

                  {hasErrors && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>
                        Some documents failed to upload. Please retry them or remove them before continuing.
                      </span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full py-6 text-base font-semibold shadow-md transition-all"
                    disabled={loading || isUploading || hasErrors}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Saving Medical Pre-Check...
                      </span>
                    ) : isUploading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Uploading Documents... Please Wait
                      </span>
                    ) : hasErrors ? (
                      <span className="flex items-center gap-2 text-destructive-foreground">
                        Resolve Failed Uploads to Continue
                      </span>
                    ) : (
                      "Continue to Select Consultation"
                    )}
                  </Button>

                  {!isUploading && !loading && uploadedFiles.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground">
                      Document upload is optional. You can proceed without uploading any files.
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
