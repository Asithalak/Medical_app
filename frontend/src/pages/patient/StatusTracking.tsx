import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { api } from "@/services/api";
import type { TrackingData } from "@/types/database";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  CheckCircle2,
  Video,
  AlertCircle,
  Search,
  Copy,
  Check,
  User,
  Activity,
  FileText,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ShieldAlert,
  Pill,
  Stethoscope,
  ExternalLink,
  Printer,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  Plus,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending Payment", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  paid: { label: "Paid — Awaiting Doctor", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
  scheduled: { label: "Scheduled", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-green-100 text-green-800 border-green-200", icon: Video },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800 border-gray-200", icon: CheckCircle2 },
  referred: { label: "Referred", color: "bg-purple-100 text-purple-800 border-purple-200", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
};

export default function StatusTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initialCode = searchParams.get("code");
    if (initialCode) {
      executeSearch(initialCode);
    }
  }, []);

  const executeSearch = async (trackingCodeToSearch: string) => {
    if (!trackingCodeToSearch.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const { data: result } = await api.consultations.getByTrackingCode(trackingCodeToSearch.trim());

      if (result && result.length > 0) {
        setData(result[0] as TrackingData);
      } else {
        setData(null);
      }
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!code.trim()) return;
    setSearchParams({ code: code.trim().toUpperCase() });
    executeSearch(code.trim());
  };

  const handleCopyCode = () => {
    const codeToCopy = data?.tracking_code || code;
    if (!codeToCopy) return;
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    toast({
      title: "Copied to Clipboard",
      description: `Tracking code ${codeToCopy} copied.`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const status = data ? statusConfig[data.status] || statusConfig.pending : null;
  const StatusIcon = status?.icon || Clock;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasDoctorNotes = !!(
    data?.diagnosis ||
    data?.prescription ||
    data?.recommendations ||
    data?.follow_up_notes
  );

  return (
    <PublicLayout>
      <div className="container py-12 md:py-16 print:p-0 print:py-4 print:max-w-none">
        <div className="mx-auto max-w-3xl print:max-w-none">
          {/* Header - Hidden in Print/PDF */}
          <div className="text-center print:hidden">
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Track Your Consultation
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter your tracking code to see the status and all submitted details of your consultation.
            </p>
          </div>

          {/* Search Box - Hidden in Print/PDF */}
          <div className="mx-auto mt-8 max-w-lg print:hidden">
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit tracking code (e.g. 8C0BAE)..."
                className="font-mono text-base uppercase tracking-wider"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading} className="px-5">
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Your tracking code was displayed after completing your intake form and payment.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-12 flex flex-col items-center justify-center gap-3 print:hidden">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Retrieving consultation details...</p>
            </div>
          )}

          {/* Not Found */}
          {searched && !loading && !data && (
            <Card className="mt-8 border-destructive/20 bg-destructive/5 print:hidden">
              <CardContent className="p-8 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold">Consultation Not Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We could not find any consultation matching code <span className="font-mono font-bold">{code}</span>.
                  Please verify your tracking code and try again.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Button variant="outline" asChild>
                    <Link to="/contact">Need Help?</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/consultation/intake">Start New Consultation</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consultation Details */}
          {data && status && (
            <div className="mt-8 space-y-6 print:mt-0 print:space-y-4">
              {/* Primary Card: Consultation Status & Summary */}
              <Card className="shadow-sm print:shadow-none print:border-none">
                {/* Official Letterhead Header - Visible ONLY in Print/PDF */}
                <div className="hidden print:flex items-center justify-between border-b pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                      <Plus className="h-6 w-6 text-white" strokeWidth={3} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-display leading-tight text-foreground">Medi Lanka</h2>
                      <p className="text-xs text-muted-foreground">Telemedicine Consultation Summary & Receipt</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold text-foreground">
                      Tracking Code: <span className="font-mono text-sm font-bold text-primary">{data.tracking_code || code}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Issued: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                <CardHeader className="border-b bg-card pb-4 print:pb-2 print:border-b-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="font-display text-xl font-bold">Consultation Status</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Tracking Code:</span>
                        <span className="font-mono font-semibold text-foreground">
                          {data.tracking_code || code}
                        </span>
                        <button
                          onClick={handleCopyCode}
                          className="inline-flex items-center text-primary transition-colors hover:text-primary/80 print:hidden"
                          title="Copy tracking code"
                        >
                          {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    <Badge className={`${status.color} border px-3 py-1 text-xs font-semibold shadow-none flex items-center gap-1.5`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 pt-5 print:space-y-4 print:pt-4">
                  {/* Top Key Attributes (Matches original view layout) */}
                  <div className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Patient</span>
                      <span className="font-medium text-foreground">{data.patient_name}</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium text-foreground">
                        {data.consultation_type}
                        {data.duration_minutes ? ` (${data.duration_minutes} mins)` : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-border/40">
                      <span className="text-muted-foreground">Submitted</span>
                      <span className="font-medium text-foreground">{formatDate(data.created_at)}</span>
                    </div>

                    {data.scheduled_at && (
                      <div className="flex items-center justify-between py-1 border-b border-border/40">
                        <span className="text-muted-foreground">Scheduled Time</span>
                        <span className="font-medium text-primary">{formatDateTime(data.scheduled_at)}</span>
                      </div>
                    )}

                    {data.price_cents !== undefined && (
                      <div className="flex items-center justify-between py-1 border-b border-border/40 print:border-b">
                        <span className="text-muted-foreground">Fee Paid</span>
                        <span className="font-medium text-foreground">${(data.price_cents / 100).toFixed(2)} USD</span>
                      </div>
                    )}
                  </div>

                  {/* Video Call Alert if Link Available */}
                  {data.consultation_link && (
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center print:border print:bg-white">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary print:hidden">
                        <Video className="h-6 w-6" />
                      </div>
                      <h3 className="mt-3 font-display font-semibold text-foreground print:mt-0">Your Video Consultation Room is Ready</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Secure telemedicine meeting room link for your consultation.
                      </p>
                      <a
                        href={data.consultation_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-colors print:hidden"
                      >
                        <Video className="h-4 w-4" />
                        Join Video Consultation
                        <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                      </a>
                      <p className="hidden print:block font-mono text-xs text-primary mt-2 break-all">
                        {data.consultation_link}
                      </p>
                    </div>
                  )}

                  {/* Doctor Notes & Diagnosis Section (if provided) */}
                  {hasDoctorNotes && (
                    <div className="rounded-xl border border-medical-success/30 bg-medical-success/5 p-5 print:border print:bg-white">
                      <div className="flex items-center gap-2 font-display text-base font-semibold text-medical-success">
                        <Stethoscope className="h-5 w-5" />
                        Doctor's Clinical Summary & Prescription
                      </div>
                      <div className="mt-4 space-y-3 text-sm">
                        {data.diagnosis && (
                          <div>
                            <span className="font-semibold text-foreground">Diagnosis: </span>
                            <span className="text-foreground/90">{data.diagnosis}</span>
                          </div>
                        )}
                        {data.prescription && (
                          <div>
                            <span className="font-semibold text-foreground">Prescription: </span>
                            <span className="text-foreground/90">{data.prescription}</span>
                          </div>
                        )}
                        {data.recommendations && (
                          <div>
                            <span className="font-semibold text-foreground">Recommendations: </span>
                            <span className="text-foreground/90">{data.recommendations}</span>
                          </div>
                        )}
                        {data.follow_up_notes && (
                          <div>
                            <span className="font-semibold text-foreground">Follow-up: </span>
                            <span className="text-foreground/90">{data.follow_up_notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SCREEN VIEW: Tabbed Navigation (Hidden when printing/PDF) */}
                  <div className="print:hidden">
                    <Separator className="mb-4" />
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Submitted Consultation Details
                    </h3>

                    <Tabs defaultValue="medical" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
                        <TabsTrigger value="medical" className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <Activity className="h-4 w-4" />
                          Medical Pre-Check
                        </TabsTrigger>
                        <TabsTrigger value="patient" className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <User className="h-4 w-4" />
                          Patient Profile
                        </TabsTrigger>
                        <TabsTrigger value="summary" className="flex items-center gap-1.5 text-xs sm:text-sm col-span-2 md:col-span-1">
                          <FileText className="h-4 w-4" />
                          Consultation Info
                        </TabsTrigger>
                      </TabsList>

                      {/* Tab 1: Medical Pre-Check Details */}
                      <TabsContent value="medical" className="mt-4 space-y-4">
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Chief Complaint
                          </div>
                          <p className="mt-1.5 text-base font-medium text-foreground">
                            {data.chief_complaint || "No chief complaint recorded."}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs font-semibold uppercase text-muted-foreground">
                            Reported Symptoms
                          </span>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {data.symptoms && data.symptoms.length > 0 ? (
                              data.symptoms.map((symptom, idx) => (
                                <Badge key={idx} variant="secondary" className="px-2.5 py-1 text-xs font-medium">
                                  {symptom}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">None specified</span>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-3 rounded-lg border p-4 text-sm md:grid-cols-2">
                          <div>
                            <span className="text-muted-foreground block text-xs">Symptom Duration:</span>
                            <span className="font-medium text-foreground">
                              {data.symptom_duration
                                ? `${data.symptom_duration} ${
                                    isNaN(Number(data.symptom_duration)) ? "" : "days"
                                  }`
                                : "Not specified"}
                            </span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-xs">Known Allergies:</span>
                            <span className="font-medium text-foreground">
                              {data.allergies || "No known allergies"}
                            </span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-xs">Current Medications:</span>
                            <span className="font-medium text-foreground">
                              {data.current_medications || "None"}
                            </span>
                          </div>

                          <div>
                            <span className="text-muted-foreground block text-xs">Medical History:</span>
                            <span className="font-medium text-foreground">
                              {data.medical_history || "None"}
                            </span>
                          </div>

                          <div className="md:col-span-2">
                            <span className="text-muted-foreground block text-xs">Chronic Conditions:</span>
                            <span className="font-medium text-foreground">
                              {data.has_chronic_conditions
                                ? data.chronic_conditions_detail || "Yes, reported"
                                : "None reported"}
                            </span>
                          </div>
                        </div>

                        {data.file_urls && data.file_urls.length > 0 && (
                          <div className="rounded-lg border p-4">
                            <span className="text-xs font-semibold uppercase text-muted-foreground block mb-2">
                              Attached Medical Files / Reports ({data.file_urls.length})
                            </span>
                            <div className="space-y-1.5">
                              {data.file_urls.map((fileUrl, idx) => {
                                const fileName = fileUrl.split("/").pop() || `Attachment ${idx + 1}`;
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-xs"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" />
                                      <span className="truncate font-medium">{fileName}</span>
                                    </div>
                                    <a
                                      href={fileUrl.startsWith("http") ? fileUrl : `http://localhost:5000${fileUrl}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline font-semibold ml-2 shrink-0 flex items-center gap-1"
                                    >
                                      View <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      {/* Tab 2: Patient Information */}
                      <TabsContent value="patient" className="mt-4 space-y-4">
                        <div className="rounded-lg border p-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            Personal & Contact Details
                          </h4>
                          <div className="grid gap-3 text-sm md:grid-cols-2">
                            <div>
                              <span className="text-muted-foreground block text-xs">Full Name:</span>
                              <span className="font-medium text-foreground">{data.patient_name}</span>
                            </div>

                            <div>
                              <span className="text-muted-foreground block text-xs">Email:</span>
                              <span className="font-medium text-foreground flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                {data.patient_email || "N/A"}
                              </span>
                            </div>

                            <div>
                              <span className="text-muted-foreground block text-xs">Phone:</span>
                              <span className="font-medium text-foreground flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                {data.patient_phone || "N/A"}
                              </span>
                            </div>

                            <div>
                              <span className="text-muted-foreground block text-xs">Date of Birth:</span>
                              <span className="font-medium text-foreground flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatDate(data.date_of_birth)}
                              </span>
                            </div>

                            <div>
                              <span className="text-muted-foreground block text-xs">Nationality:</span>
                              <span className="font-medium text-foreground capitalize">
                                {data.nationality || "N/A"}
                              </span>
                            </div>

                            <div>
                              <span className="text-muted-foreground block text-xs">Passport Number:</span>
                              <span className="font-mono font-medium text-foreground">
                                {data.passport_number || "N/A"}
                                {data.passport_expiry && ` (Exp: ${formatDate(data.passport_expiry)})`}
                              </span>
                            </div>

                            <div className="md:col-span-2">
                              <span className="text-muted-foreground block text-xs">Hotel / Address in Sri Lanka:</span>
                              <span className="font-medium text-foreground flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                {data.hotel_address || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="rounded-lg border bg-muted/20 p-4">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                            <ShieldAlert className="h-4 w-4 text-primary" />
                            Emergency Contact
                          </h4>
                          <div className="grid gap-3 text-sm md:grid-cols-3">
                            <div>
                              <span className="text-muted-foreground block text-xs">Contact Name:</span>
                              <span className="font-medium text-foreground">
                                {data.emergency_contact_name || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Phone:</span>
                              <span className="font-medium text-foreground">
                                {data.emergency_contact_phone || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-xs">Relationship:</span>
                              <span className="font-medium text-foreground capitalize">
                                {data.emergency_contact_relationship || "Designated Contact"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Tab 3: Consultation Info & Receipt */}
                      <TabsContent value="summary" className="mt-4 space-y-4">
                        <div className="rounded-lg border p-4 text-sm space-y-3">
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Consultation ID</span>
                            <span className="font-mono text-xs">{data.consultation_id}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Service Type</span>
                            <span className="font-medium">{data.consultation_type}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Estimated Consultation Duration</span>
                            <span className="font-medium">{data.duration_minutes || 20} minutes</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Submission Date & Time</span>
                            <span className="font-medium">{formatDateTime(data.created_at)}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Current Status</span>
                            <span className="font-semibold text-primary">{status.label}</span>
                          </div>
                          {data.scheduled_at && (
                            <div className="flex justify-between border-b pb-2">
                              <span className="text-muted-foreground">Scheduled Doctor Session</span>
                              <span className="font-semibold text-indigo-600">
                                {formatDateTime(data.scheduled_at)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1">
                            <span className="font-semibold">Total Paid</span>
                            <span className="font-bold text-foreground">
                              ${((data.price_cents || 10000) / 100).toFixed(2)} USD
                            </span>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* PRINT/PDF VIEW: Complete Medical & Patient Report (Visible ONLY in Print/PDF) */}
                  <div className="hidden print:block space-y-4 pt-2">
                    {/* Section 1: Patient Information */}
                    <div className="border rounded-lg p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        1. Patient & Travel Information
                      </h4>
                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div>
                          <span className="text-muted-foreground">Full Name: </span>
                          <span className="font-semibold text-foreground">{data.patient_name}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email: </span>
                          <span className="font-semibold text-foreground">{data.patient_email || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone: </span>
                          <span className="font-semibold text-foreground">{data.patient_phone || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date of Birth: </span>
                          <span className="font-semibold text-foreground">{formatDate(data.date_of_birth)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nationality: </span>
                          <span className="font-semibold text-foreground capitalize">{data.nationality || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Passport: </span>
                          <span className="font-mono font-semibold text-foreground">
                            {data.passport_number || "N/A"}
                            {data.passport_expiry && ` (Exp: ${formatDate(data.passport_expiry)})`}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Hotel / Stay Address: </span>
                          <span className="font-semibold text-foreground">{data.hotel_address || "N/A"}</span>
                        </div>
                        <div className="col-span-2 pt-1 border-t">
                          <span className="text-muted-foreground">Emergency Contact: </span>
                          <span className="font-semibold text-foreground">
                            {data.emergency_contact_name || "N/A"} ({data.emergency_contact_phone || "N/A"} - {data.emergency_contact_relationship || "Designated Contact"})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Medical Pre-Check */}
                    <div className="border rounded-lg p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        2. Medical Pre-Check Details
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="font-bold text-foreground">Chief Complaint: </span>
                          <span className="font-semibold text-foreground">{data.chief_complaint || "None"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reported Symptoms: </span>
                          <span className="font-semibold text-foreground">
                            {data.symptoms && data.symptoms.length > 0 ? data.symptoms.join(", ") : "None reported"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-muted-foreground">Duration: </span>
                            <span className="font-semibold text-foreground">
                              {data.symptom_duration ? `${data.symptom_duration} days` : "Not specified"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Known Allergies: </span>
                            <span className="font-semibold text-foreground">{data.allergies || "No known allergies"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Current Medications: </span>
                            <span className="font-semibold text-foreground">{data.current_medications || "None"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Medical History: </span>
                            <span className="font-semibold text-foreground">{data.medical_history || "None"}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Chronic Conditions: </span>
                            <span className="font-semibold text-foreground">
                              {data.has_chronic_conditions ? data.chronic_conditions_detail || "Yes, reported" : "None reported"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Consultation Summary & Receipt */}
                    <div className="border rounded-lg p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                        3. Service & Transaction Receipt
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Consultation ID: </span>
                          <span className="font-mono text-foreground">{data.consultation_id}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Service Type: </span>
                          <span className="font-semibold text-foreground">{data.consultation_type}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Submitted At: </span>
                          <span className="font-semibold text-foreground">{formatDateTime(data.created_at)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Paid: </span>
                          <span className="font-bold text-foreground">
                            ${((data.price_cents || 10000) / 100).toFixed(2)} USD
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer note for printed summary */}
                    <div className="pt-3 text-center text-[10px] text-muted-foreground border-t">
                      Medi Lanka Telemedicine · Verified Consultation Intake & Status Record · For Emergency Services call 1990
                    </div>
                  </div>

                  {/* Actions row - Hidden in Print/PDF */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 print:hidden">
                    <Button variant="default" size="sm" onClick={handlePrintPdf} className="gap-1.5 shadow-sm">
                      <Download className="h-4 w-4" />
                      <Printer className="h-4 w-4" />
                      Download PDF / Print Summary
                    </Button>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/contact">Support / Assistance</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/consultation/intake">Book Another Consultation</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
