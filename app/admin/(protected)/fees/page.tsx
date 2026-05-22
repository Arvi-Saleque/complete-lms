import Link from "next/link";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Pagination } from "@/components/admin/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { PendingButton } from "@/components/admin/pending-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { addPaymentAction, deleteFeeRecordAction } from "@/lib/actions";
import { pageFromSearch, rangeForPage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import { currency, todayIso } from "@/lib/utils";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

type FeeSearchParams = {
  page?: string;
  class?: string;
  section?: string;
  session?: string;
  fee_type?: string;
  status?: string;
  month?: string;
  due_from?: string;
  due_to?: string;
  search?: string;
  payment?: string;
  payment_error?: string;
};

function applyFeeFilters(query: any, filters: FeeSearchParams, studentIds: string[] | null) {
  let nextQuery = query;

  if (studentIds) nextQuery = nextQuery.in("student_id", studentIds);
  if (filters.session) nextQuery = nextQuery.eq("session_year", filters.session);
  if (filters.fee_type) nextQuery = nextQuery.eq("fee_type_id", filters.fee_type);
  if (filters.status) nextQuery = nextQuery.eq("status", filters.status);
  if (filters.month) nextQuery = nextQuery.eq("month", filters.month);
  if (filters.due_from) nextQuery = nextQuery.gte("due_date", filters.due_from);
  if (filters.due_to) nextQuery = nextQuery.lte("due_date", filters.due_to);

  return nextQuery;
}

export default async function FeesPage({
  searchParams
}: {
  searchParams: Promise<FeeSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = pageFromSearch(resolvedSearchParams.page);
  const { from, to } = rangeForPage(page);
  const supabase = await createClient();
  const hasStudentFilter = Boolean(
    resolvedSearchParams.class ||
      resolvedSearchParams.section ||
      resolvedSearchParams.search?.trim()
  );

  const [{ data: classes }, { data: sections }, { data: feeTypes }] = await Promise.all([
    supabase.from("classes").select("id,name").eq("is_active", true).order("sort_order"),
    supabase.from("sections").select("id,name,class_id").eq("is_active", true).order("name"),
    supabase.from("fee_types").select("id,name").eq("is_active", true).order("name")
  ]);

  let studentIds: string[] | null = null;
  if (hasStudentFilter) {
    let studentQuery = supabase.from("students").select("id");
    if (resolvedSearchParams.class) {
      studentQuery = studentQuery.eq("class_id", resolvedSearchParams.class);
    }
    if (resolvedSearchParams.section) {
      studentQuery = studentQuery.eq("section_id", resolvedSearchParams.section);
    }
    if (resolvedSearchParams.search?.trim()) {
      const search = resolvedSearchParams.search.trim().replace(/[(),]/g, " ");
      studentQuery = studentQuery.or(`name.ilike.%${search}%,roll.ilike.%${search}%`);
    }

    const { data: studentMatches } = await studentQuery;
    studentIds = (studentMatches ?? []).map((student) => student.id);
  }

  const noStudentMatches = hasStudentFilter && !studentIds?.length;
  const selectText =
    "*,students(id,name,roll,class_id,section_id,classes(name),sections(name)),fee_types(id,name,category)";
  const recordsResult = noStudentMatches
    ? { data: [], count: 0 }
    : await applyFeeFilters(
        supabase.from("student_fee_records").select(selectText, { count: "exact" }),
        resolvedSearchParams,
        studentIds
      )
        .order("created_at", { ascending: false })
        .range(from, to);

  const summaryResult = noStudentMatches
    ? { data: [] }
    : await applyFeeFilters(
        supabase.from("student_fee_records").select("amount,paid_amount,due_amount,status"),
        resolvedSearchParams,
        studentIds
      );

  const recordRows = (recordsResult.data ?? []) as any[];
  const summaryRows = (summaryResult.data ?? []) as Array<{
    amount: number | string | null;
    paid_amount: number | string | null;
    due_amount: number | string | null;
    status: string | null;
  }>;
  const totalBilled = summaryRows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const totalCollected = summaryRows.reduce((sum, row) => sum + Number(row.paid_amount ?? 0), 0);
  const totalDue = summaryRows.reduce((sum, row) => sum + Number(row.due_amount ?? 0), 0);
  const unpaidCount = summaryRows.filter((row) => row.status === "unpaid").length;
  const partialCount = summaryRows.filter((row) => row.status === "partial").length;
  const selectedClassId = resolvedSearchParams.class ?? "";
  const sectionRows = (sections ?? []).filter((section) =>
    selectedClassId ? section.class_id === selectedClassId : true
  );

  return (
    <>
      <PageHeader
        title="Fees"
        description="Track student dues, partial payments, and paid fees."
        actionHref="/admin/fees/new"
        actionLabel="Add fee"
      />
      {resolvedSearchParams.payment === "success" ? (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Payment saved and fee balance updated.
        </div>
      ) : null}
      {resolvedSearchParams.payment_error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {resolvedSearchParams.payment_error}
        </div>
      ) : null}

      <div className="mb-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Total billed", currency(totalBilled)],
          ["Total collected", currency(totalCollected)],
          ["Total due", currency(totalDue)],
          ["Unpaid records", String(unpaidCount)],
          ["Partial records", String(partialCount)]
        ].map(([label, value]) => (
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

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            <Select name="class" defaultValue={selectedClassId}>
              <option value="">All classes</option>
              {(classes ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Select name="section" defaultValue={resolvedSearchParams.section ?? ""}>
              <option value="">All sections</option>
              {sectionRows.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Input name="session" placeholder="Session / year" defaultValue={resolvedSearchParams.session ?? ""} />
            <Select name="fee_type" defaultValue={resolvedSearchParams.fee_type ?? ""}>
              <option value="">All fee types</option>
              {(feeTypes ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Select name="status" defaultValue={resolvedSearchParams.status ?? ""}>
              <option value="">All statuses</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </Select>
            <Select name="month" defaultValue={resolvedSearchParams.month ?? ""}>
              <option value="">All months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </Select>
            <Input name="due_from" type="date" defaultValue={resolvedSearchParams.due_from ?? ""} />
            <Input name="due_to" type="date" defaultValue={resolvedSearchParams.due_to ?? ""} />
            <Input name="search" placeholder="Student name or roll" defaultValue={resolvedSearchParams.search ?? ""} />
            <div className="flex gap-2">
              <Button className="flex-1" type="submit">Apply</Button>
              <Button asChild className="flex-1" variant="outline">
                <Link href="/admin/fees">Clear</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Student</Th>
                <Th>Fee</Th>
                <Th>Total</Th>
                <Th>Paid</Th>
                <Th>Due</Th>
                <Th>Status</Th>
                <Th>Payment</Th>
                <Th>Delete</Th>
              </tr>
            </thead>
            <tbody>
              {recordRows.map((record) => {
                const dueAmount = Number(record.due_amount ?? 0);

                return (
                  <tr key={record.id}>
                    <Td>
                      <Link className="font-medium text-primary" href={`/admin/students/${record.students?.id}`}>
                        {record.students?.name ?? "Unknown"}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Roll {record.students?.roll ?? "-"} - {record.students?.classes?.name ?? "-"}
                        {record.students?.sections?.name ? ` - ${record.students.sections.name}` : ""}
                      </p>
                    </Td>
                    <Td>
                      <details>
                        <summary className="cursor-pointer font-medium">{record.fee_types?.name}</summary>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Month: {record.month ?? "-"} - Session: {record.session_year} - Due: {record.due_date ?? "-"}
                        </p>
                        {record.note ? <p className="mt-1 text-xs">{record.note}</p> : null}
                      </details>
                    </Td>
                    <Td>{currency(record.amount)}</Td>
                    <Td>{currency(record.paid_amount)}</Td>
                    <Td>{currency(record.due_amount)}</Td>
                    <Td><Badge value={record.status} /></Td>
                    <Td className="min-w-72">
                      {dueAmount > 0 ? (
                        <form action={addPaymentAction} className="grid grid-cols-2 gap-2">
                          <input type="hidden" name="student_fee_record_id" value={record.id} />
                          <input type="hidden" name="page" value={String(page)} />
                          <Input
                            max={dueAmount}
                            min="1"
                            name="amount"
                            placeholder="Amount"
                            required
                            type="number"
                          />
                          <Input name="payment_date" type="date" defaultValue={todayIso()} required />
                          <Select name="payment_method" defaultValue="cash">
                            <option value="cash">Cash</option>
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                            <option value="bank">Bank</option>
                            <option value="other">Other</option>
                          </Select>
                          <Textarea className="col-span-2 min-h-16" name="note" placeholder="Note" />
                          <PendingButton className="col-span-2" pendingLabel="Saving..." size="sm" type="submit">
                            Add payment
                          </PendingButton>
                        </form>
                      ) : (
                        <p className="text-sm font-medium text-emerald-700">Fully paid</p>
                      )}
                    </Td>
                    <Td>
                      <ConfirmForm
                        action={deleteFeeRecordAction}
                        firstMessage="Delete this fee record? Related payments will also be removed."
                        secondMessage="Final confirmation: delete this fee record permanently?"
                      >
                        <input name="id" type="hidden" value={record.id} />
                        <Button size="sm" type="submit" variant="destructive">
                          Delete
                        </Button>
                      </ConfirmForm>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          {!recordRows.length ? (
            <div className="p-6 text-sm text-muted-foreground">No fee records match these filters.</div>
          ) : null}
          <Pagination
            count={recordsResult.count}
            page={page}
            pathname="/admin/fees"
            searchParams={{
              ...resolvedSearchParams,
              payment: undefined,
              payment_error: undefined
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
