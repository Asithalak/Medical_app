import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";
import { Clock, CheckCircle2, Video, AlertCircle, Search } from "lucide-react";

interface TrackingData {
  consultation_id: string;
  status: string;
  consultation_link: string | null;
  consultation_type: string;
  patient_name: string;
  created_at: string;
  scheduled_at: string | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending Payment", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  paid: { label: "Paid — Awaiting Doctor", color: "bg-blue-100 text-blue-800", icon: Clock },
  scheduled: { label: "Scheduled", color: "bg-indigo-100 text-indigo-800", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-green-100 text-green-800", icon: Video },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800", icon: CheckCircle2 },
  referred: { label: "Referred", color: "bg-purple-100 text-purple-800", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

export default function StatusTracking() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchParams.get("code")) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setSearched(true);

    const { data: result } = await api.consultations.getByTrackingCode(code.trim());

    if (result && result.length > 0) {
      setData(result[0] as TrackingData);
    } else {
      setData(null);
    }
    setLoading(false);
  };

  const status = data ? statusConfig[data.status] || statusConfig.pending : null;

  return (
    <PublicLayout>
      <div className="container py-16">
        <div className="mx-auto max-w-lg">
          <h1 className="text-center font-display text-3xl font-bold">Track Your Consultation</h1>
          <p className="mt-2 text-center text-muted-foreground">
            Enter your tracking code to see the status of your consultation.
          </p>

          <div className="mt-8 flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter tracking code..."
              className="font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {loading && (
            <div className="mt-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          )}

          {searched && !loading && !data && (
            <Card className="mt-8">
              <CardContent className="p-6 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">Consultation Not Found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please check your tracking code and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {data && status && (
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Consultation Status</CardTitle>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient</span>
                    <span className="font-medium">{data.patient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{data.consultation_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted</span>
                    <span className="font-medium">{new Date(data.created_at).toLocaleDateString()}</span>
                  </div>
                  {data.scheduled_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scheduled</span>
                      <span className="font-medium">{new Date(data.scheduled_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {data.consultation_link && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
                    <Video className="mx-auto h-8 w-8 text-primary" />
                    <h3 className="mt-2 font-semibold">Your Consultation Link</h3>
                    <a
                      href={data.consultation_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-primary underline"
                    >
                      Join Consultation
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
