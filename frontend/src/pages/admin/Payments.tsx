import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/services/api";
import { Download } from "lucide-react";

interface PaymentRow {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  stripe_payment_id: string | null;
  created_at: string;
  consultations: {
    patients: { full_name: string; email: string };
    consultation_types: { display_name: string };
  };
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.payments.getAll().then(({ data }) => {
      if (data) setPayments(data as unknown as PaymentRow[]);
      setLoading(false);
    });
  }, []);

  const exportCSV = () => {
    const rows = [["Date", "Patient", "Email", "Type", "Amount", "Status", "Stripe ID"]];
    payments.forEach((p) => {
      rows.push([
        new Date(p.created_at).toLocaleDateString(),
        p.consultations.patients.full_name,
        p.consultations.patients.email,
        p.consultations.consultation_types.display_name,
        `$${(p.amount_cents / 100).toFixed(2)}`,
        p.status,
        p.stripe_payment_id || "",
      ]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Payment Records</h1>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Card className="mt-6">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{p.consultations.patients.full_name}</TableCell>
                    <TableCell>{p.consultations.consultation_types.display_name}</TableCell>
                    <TableCell className="font-medium">${(p.amount_cents / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "completed" ? "default" : "secondary"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No payment records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
