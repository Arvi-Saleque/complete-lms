import Link from "next/link";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { deleteDemoPresetAction, insertDemoPresetAction } from "@/lib/actions";
import { demoToolsEnabled } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { currency, todayIso } from "@/lib/utils";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const today = todayIso();
  const showDemoTools = demoToolsEnabled();

  const [
    students,
    activeStudents,
    feeRecords,
    todayPayments,
    presentToday,
    recentPayments,
    unpaidStudents,
    upcomingExam
  ] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("student_fee_records").select("due_amount"),
    supabase.from("payments").select("amount").eq("payment_date", today),
    supabase
      .from("attendance_records")
      .select("id", { count: "exact", head: true })
      .eq("date", today)
      .eq("status", "present"),
    supabase
      .from("payments")
      .select("amount,payment_date,receipt_no,student_fee_records(students(name),fee_types(name))")
      .order("payment_date", { ascending: false })
      .limit(5),
    supabase
      .from("student_fee_records")
      .select("due_amount,status,students(id,name,roll),fee_types(name)")
      .in("status", ["unpaid", "partial"])
      .gt("due_amount", 0)
      .limit(6),
    supabase
      .from("exams")
      .select("id,name,start_date,classes(name)")
      .gte("start_date", today)
      .order("start_date", { ascending: true })
      .limit(1)
      .maybeSingle()
  ]);

  const totalDue = (feeRecords.data ?? []).reduce(
    (sum, row) => sum + Number(row.due_amount ?? 0),
    0
  );
  const todayCollection = (todayPayments.data ?? []).reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0
  );
  const recentPaymentRows = (recentPayments.data ?? []) as any[];
  const unpaidRows = (unpaidStudents.data ?? []) as any[];
  const nextExam = upcomingExam.data as any;

  const cards = [
    ["Total students", students.count ?? 0],
    ["Active students", activeStudents.count ?? 0],
    ["Today's collection", currency(todayCollection)],
    ["Total due", currency(totalDue)],
    ["Present today", presentToday.count ?? 0]
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Daily snapshot for students, fees, hajira, and exams."
      />
      {showDemoTools ? (
        <Card className="mb-5 border-primary/20">
          <CardHeader>
            <CardTitle>Demo preset</CardTitle>
            <p className="text-sm text-muted-foreground">
              Insert a fresh demo dataset for client review. These buttons delete all school
              records first, but keep the principal login/profile.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ConfirmForm
              action={insertDemoPresetAction}
              firstMessage="This will create a fresh demo preset. If any school records already exist, they will be cleared first. Continue?"
              secondMessage="Final confirmation: insert the fresh demo data now?"
            >
              <Button type="submit">Insert fresh demo data</Button>
            </ConfirmForm>
            <ConfirmForm
              action={deleteDemoPresetAction}
              firstMessage="This will delete all school records. Continue?"
              secondMessage="Final confirmation: delete all school records now?"
            >
              <Button type="submit" variant="destructive">
                Delete all school data
              </Button>
            </ConfirmForm>
            {resolvedSearchParams.demo === "inserted" ? (
              <p className="text-sm font-medium text-emerald-700">
                Demo preset inserted. Check students, fees, attendance, exams, and results.
              </p>
            ) : null}
            {resolvedSearchParams.demo === "deleted-all" ? (
              <p className="text-sm font-medium text-red-700">
                All school records were deleted. Principal login is still available.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
      {resolvedSearchParams.demo === "disabled" ? (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Demo tools are disabled in this environment.
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Student</Th>
                  <Th>Fee</Th>
                  <Th>Amount</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {recentPaymentRows.map((payment) => (
                  <tr key={`${payment.receipt_no}-${payment.payment_date}-${payment.amount}`}>
                    <Td>{payment.student_fee_records?.students?.name ?? "Unknown"}</Td>
                    <Td>{payment.student_fee_records?.fee_types?.name ?? "Fee"}</Td>
                    <Td>{currency(payment.amount)}</Td>
                    <Td>{payment.payment_date}</Td>
                  </tr>
                ))}
                {!recentPaymentRows.length ? (
                  <tr><Td colSpan={4}>No recent payments yet.</Td></tr>
                ) : null}
              </tbody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unpaid students</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Student</Th>
                  <Th>Fee</Th>
                  <Th>Due</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {unpaidRows.map((record) => (
                  <tr key={`${record.students?.id}-${record.fee_types?.name}`}>
                    <Td>
                      <Link className="font-medium text-primary" href={`/admin/students/${record.students?.id}`}>
                        {record.students?.name ?? "Unknown"}
                      </Link>
                    </Td>
                    <Td>{record.fee_types?.name}</Td>
                    <Td>{currency(record.due_amount)}</Td>
                    <Td>
                      <Badge value={record.status} />
                    </Td>
                  </tr>
                ))}
                {!unpaidRows.length ? (
                  <tr><Td colSpan={4}>No unpaid fee records.</Td></tr>
                ) : null}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Upcoming exam</CardTitle>
        </CardHeader>
        <CardContent>
          {nextExam ? (
            <p className="text-sm">
              <Link className="font-medium text-primary" href={`/admin/exams/${nextExam.id}`}>
                {nextExam.name}
              </Link>{" "}
              for {nextExam.classes?.name} starts on {nextExam.start_date}.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming exam is scheduled.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
