import { PageHeader } from "@/components/admin/page-header";
import { PrintButton } from "@/components/admin/print-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import {
  addDaysIso,
  bangladeshDateRangeToUtc,
  currency,
  monthRangeIso,
  todayIso
} from "@/lib/utils";

function rangeFor(period: string, dateText: string) {
  if (period === "weekly") {
    const date = new Date(`${dateText}T12:00:00+06:00`);
    const start = addDaysIso(dateText, -date.getUTCDay());
    return { start, end: addDaysIso(start, 6), label: "Weekly" };
  }
  if (period === "monthly") {
    return { ...monthRangeIso(dateText), label: "Monthly" };
  }
  return { start: dateText, end: dateText, label: "Daily" };
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const period = resolvedSearchParams.period ?? "daily";
  const date = resolvedSearchParams.date ?? todayIso();
  const range = rangeFor(period, date);
  const createdAtRange = bangladeshDateRangeToUtc(range.start, range.end);
  const supabase = await createClient();

  const [
    { data: payments },
    { data: attendance },
    { data: feeRecords },
    { data: marks },
    { data: createdStudents }
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("amount,payment_date,student_fee_records(students(name,roll),fee_types(name))")
      .gte("payment_date", range.start)
      .lte("payment_date", range.end)
      .order("payment_date", { ascending: false }),
    supabase
      .from("attendance_records")
      .select("status,date,students(name,roll)")
      .gte("date", range.start)
      .lte("date", range.end),
    supabase
      .from("student_fee_records")
      .select("amount,paid_amount,due_amount,status,created_at")
      .gte("created_at", createdAtRange.start)
      .lte("created_at", createdAtRange.end),
    supabase
      .from("student_marks")
      .select("total_mark,grade,created_at,students(name,roll),subjects(name),exams(name)")
      .gte("created_at", createdAtRange.start)
      .lte("created_at", createdAtRange.end)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("students")
      .select("id,name,roll,created_at")
      .gte("created_at", createdAtRange.start)
      .lte("created_at", createdAtRange.end)
  ]);

  const paymentRows = (payments ?? []) as any[];
  const attendanceRows = (attendance ?? []) as any[];
  const feeRows = feeRecords ?? [];
  const markRows = (marks ?? []) as any[];
  const totalCollection = paymentRows.reduce(
    (sum, payment) => sum + Number(payment.amount ?? 0),
    0
  );
  const totalDueCreated = feeRows.reduce(
    (sum, fee) => sum + Number(fee.due_amount ?? 0),
    0
  );
  const attendanceSummary = attendanceRows.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="print-page">
      <PageHeader
        title="Activity Reports"
        description="Daily, weekly, and monthly activity/performance summary."
      />
      <Card className="mb-4 print-hide">
        <CardContent className="pt-4">
          <form className="grid gap-3 md:grid-cols-4">
            <Select name="period" defaultValue={period}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
            <Input name="date" type="date" defaultValue={date} />
            <Button type="submit">Load report</Button>
            <PrintButton label="Export report PDF" />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{range.label} Report</CardTitle>
          <p className="text-sm text-muted-foreground">
            {range.start} to {range.end}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Collection</p>
              <p className="text-xl font-semibold">{currency(totalCollection)}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">New students</p>
              <p className="text-xl font-semibold">{createdStudents?.length ?? 0}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Fee records</p>
              <p className="text-xl font-semibold">{feeRows.length}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">New due</p>
              <p className="text-xl font-semibold">{currency(totalDueCreated)}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Marks entered</p>
              <p className="text-xl font-semibold">{markRows.length}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
            {["present", "absent", "late", "leave"].map((status) => (
              <div className="rounded-md border p-3" key={status}>
                <p className="text-xs capitalize text-muted-foreground">{status}</p>
                <p className="text-xl font-semibold">{attendanceSummary[status] ?? 0}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <thead><tr><Th>Date</Th><Th>Student</Th><Th>Fee</Th><Th>Amount</Th></tr></thead>
              <tbody>
                {paymentRows.slice(0, 20).map((payment, index) => (
                  <tr key={`${payment.payment_date}-${index}`}>
                    <Td>{payment.payment_date}</Td>
                    <Td>{payment.student_fee_records?.students?.name ?? "-"}</Td>
                    <Td>{payment.student_fee_records?.fee_types?.name ?? "-"}</Td>
                    <Td>{currency(payment.amount)}</Td>
                  </tr>
                ))}
                {!paymentRows.length ? (
                  <tr><Td colSpan={4}>No payments found for this period.</Td></tr>
                ) : null}
              </tbody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Marks</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <thead><tr><Th>Student</Th><Th>Exam</Th><Th>Subject</Th><Th>Mark</Th><Th>Grade</Th></tr></thead>
              <tbody>
                {markRows.slice(0, 20).map((mark, index) => (
                  <tr key={`${mark.created_at}-${index}`}>
                    <Td>{mark.students?.name ?? "-"}</Td>
                    <Td>{mark.exams?.name ?? "-"}</Td>
                    <Td>{mark.subjects?.name ?? "-"}</Td>
                    <Td>{mark.total_mark}</Td>
                    <Td>{mark.grade ?? "-"}</Td>
                  </tr>
                ))}
                {!markRows.length ? (
                  <tr><Td colSpan={5}>No marks found for this period.</Td></tr>
                ) : null}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
