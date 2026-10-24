import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";
import { patientIntakeSchema, type PatientIntakeForm } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function IntakeForm() {
  const [form, setForm] = useState<Partial<PatientIntakeForm>>({ consent_given: false as any });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = patientIntakeSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { data: sessionData } = await api.auth.getSession();
    const { data, error } = await api.patients.create({
      _full_name: result.data.full_name,
      _email: result.data.email,
      _phone: result.data.phone,
      _date_of_birth: result.data.date_of_birth,
      _nationality: result.data.nationality,
      _passport_number: result.data.passport_number,
      _passport_expiry: result.data.passport_expiry || null,
      _hotel_address: result.data.hotel_address || null,
      _emergency_contact_name: result.data.emergency_contact_name,
      _emergency_contact_phone: result.data.emergency_contact_phone,
      _emergency_contact_relationship: result.data.emergency_contact_relationship || null,
      _consent_given: result.data.consent_given,
      _user_id: sessionData?.session?.user?.id || null,
    });

    if (error || !data || data.length === 0) {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Store patient info in sessionStorage for the flow
    const patient = data[0];
    sessionStorage.setItem("patient_id", patient.id);
    sessionStorage.setItem("tracking_code", patient.tracking_code);
    navigate("/consultation/medical-precheck");
  };

  const Field = ({ name, label, type = "text", required = true, placeholder = "" }: any) => (
    <div>
      <Label htmlFor={name}>{label}{required && <span className="text-destructive"> *</span>}</Label>
      <Input
        id={name}
        type={type}
        value={(form as any)[name] || ""}
        onChange={(e) => update(name, e.target.value)}
        placeholder={placeholder}
        className={errors[name] ? "border-destructive" : ""}
      />
      {errors[name] && <p className="mt-1 text-xs text-destructive">{errors[name]}</p>}
    </div>
  );

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <Progress value={20} className="mb-6" />
          <p className="mb-2 text-sm text-muted-foreground">Step 1 of 4</p>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">Patient Information</CardTitle>
              <CardDescription>
                Please fill in your details accurately. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Personal Details</h3>
                  <Field name="full_name" label="Full Name (as on passport)" placeholder="John Smith" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field name="email" label="Email Address" type="email" placeholder="john@example.com" />
                    <Field name="phone" label="Phone Number" placeholder="+1 234 567 8901" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field name="date_of_birth" label="Date of Birth" type="date" />
                    <Field name="nationality" label="Nationality" placeholder="British" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Passport Details</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field name="passport_number" label="Passport Number" placeholder="AB1234567" />
                    <Field name="passport_expiry" label="Passport Expiry Date" type="date" required={false} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Accommodation</h3>
                  <div>
                    <Label htmlFor="hotel_address">Hotel / Accommodation Address</Label>
                    <Textarea
                      id="hotel_address"
                      value={form.hotel_address || ""}
                      onChange={(e) => update("hotel_address", e.target.value)}
                      placeholder="Hotel name and address in Sri Lanka"
                      maxLength={500}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Emergency Contact</h3>
                  <Field name="emergency_contact_name" label="Contact Name" placeholder="Jane Smith" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field name="emergency_contact_phone" label="Contact Phone" placeholder="+1 234 567 8901" />
                    <Field name="emergency_contact_relationship" label="Relationship" required={false} placeholder="Spouse" />
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="consent"
                      checked={form.consent_given === true}
                      onCheckedChange={(checked) => update("consent_given", checked === true ? true : undefined)}
                    />
                    <Label htmlFor="consent" className="text-sm leading-relaxed">
                      I consent to the collection and processing of my personal and medical data for the purpose
                      of receiving medical consultation. I have read and agree to the{" "}
                      <Link to="/privacy-policy" className="text-primary underline" target="_blank">
                        Privacy Policy
                      </Link>.
                    </Label>
                  </div>
                  {errors.consent_given && (
                    <p className="text-xs text-destructive">{errors.consent_given}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Continue to Medical Pre-Check"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
