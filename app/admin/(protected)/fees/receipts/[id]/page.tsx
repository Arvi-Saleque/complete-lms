import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { PrintButton } from "@/components/admin/print-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { currency } from "@/lib/utils";

export default async function PaymentReceiptPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const [
    { data: payment },
    { data: profile }
  ] = await Promise.all([
    supabase
      .from("payments")
      .select(
        "*,student_fee_records(amount,month,session_year,note,students(id,name,roll,classes(name),sections(name)),fee_types(name))"
      )
      .eq("id", resolvedParams.id)
      .maybeSingle(),
    auth.user
      ? supabase.from("profiles").select("full_name").eq("id", auth.user.id).maybeSingle()
      : Promise.resolve({ data: null })
  ]);

  if (!payment) notFound();
  const paymentRow = payment as any;
  const feeRecord = paymentRow.student_fee_records;
  const student = feeRecord?.students;
  const receiptNo = paymentRow.receipt_no ?? `R-${String(paymentRow.id).slice(0, 8).toUpperCase()}`;

  return (
    <div className="print-page">
      <PageHeader title="Payment Receipt" description={`Receipt ${receiptNo}`} />
      <div className="mb-4 flex gap-2 print-hide">
        <PrintButton label="Print receipt" />
        <Button asChild variant="outline">
          <Link href="/admin/fees">Back to fees</Link>
        </Button>
        {student?.id ? (
          <Button asChild variant="outline">
            <Link href={`/admin/students/${student.id}`}>Student details</Link>
          </Button>
        ) : null}
      </div>

      <Card className="mx-auto max-w-3xl">
        <CardHeader className="border-b text-center">
          <CardTitle className="text-2xl">Madrasa Name Placeholder</CardTitle>
          <p className="text-sm text-muted-foreground">Official payment receipt</p>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Receipt number</p>
              <p className="font-medium">{receiptNo}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment date</p>
              <p className="font-medium">{paymentRow.payment_date}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Received by</p>
              <p className="font-medium">{profile?.full_name ?? "Principal"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment method</p>
              <p className="font-medium capitalize">{paymentRow.payment_method ?? "cash"}</p>
            </div>
          </div>

          <Table>
            <tbody>
              <tr><Td className="font-medium">Student</Td><Td>{student?.name ?? "-"}</Td></tr>
              <tr><Td className="font-medium">Roll</Td><Td>{student?.roll ?? "-"}</Td></tr>
              <tr><Td className="font-medium">Class / Section</Td><Td>{student?.classes?.name ?? "-"} / {student?.sections?.name ?? "-"}</Td></tr>
              <tr><Td className="font-medium">Fee type</Td><Td>{feeRecord?.fee_types?.name ?? "-"}</Td></tr>
              <tr><Td className="font-medium">Month / Session</Td><Td>{feeRecord?.month ?? "-"} / {feeRecord?.session_year ?? "-"}</Td></tr>
              <tr><Td className="font-medium">Payment amount</Td><Td className="text-lg font-semibold">{currency(paymentRow.amount)}</Td></tr>
              <tr><Td className="font-medium">Note</Td><Td>{paymentRow.note ?? "-"}</Td></tr>
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
