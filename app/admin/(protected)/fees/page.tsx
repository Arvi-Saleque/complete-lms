import Link from "next/link";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { Pagination } from "@/components/admin/pagination";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { addPaymentAction, deleteFeeRecordAction } from "@/lib/actions";
import { pageFromSearch, rangeForPage } from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import { currency, todayIso } from "@/lib/utils";

export default async function FeesPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = pageFromSearch(resolvedSearchParams.page);
  const { from, to } = rangeForPage(page);
  const supabase = await createClient();
  const recordsResult = await supabase
    .from("student_fee_records")
    .select("*,students(id,name,roll,classes(name)),fee_types(name,category)", {
      count: "exact"
    })
    .order("created_at", { ascending: false })
    .range(from, to);
  const recordRows = (recordsResult.data ?? []) as any[];

  return (
    <>
      <PageHeader
        title="Fees"
        description="Track student dues, partial payments, and paid fees."
        actionHref="/admin/fees/new"
        actionLabel="Add fee"
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Student</Th><Th>Fee</Th><Th>Total</Th><Th>Paid</Th><Th>Due</Th><Th>Status</Th><Th>Payment</Th><Th>Delete</Th>
              </tr>
            </thead>
            <tbody>
              {recordRows.map((record) => (
                <tr key={record.id}>
                  <Td>
                    <Link className="font-medium text-primary" href={`/admin/students/${record.students?.id}`}>
                      {record.students?.name ?? "Unknown"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Roll {record.students?.roll ?? "-"} • {record.students?.classes?.name ?? "-"}
                    </p>
                  </Td>
                  <Td>
                    <details>
                      <summary className="cursor-pointer font-medium">{record.fee_types?.name}</summary>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Month: {record.month ?? "-"} • Session: {record.session_year} • Due: {record.due_date ?? "-"}
                      </p>
                      {record.note ? <p className="mt-1 text-xs">{record.note}</p> : null}
                    </details>
                  </Td>
                  <Td>{currency(record.amount)}</Td>
                  <Td>{currency(record.paid_amount)}</Td>
                  <Td>{currency(record.due_amount)}</Td>
                  <Td><Badge value={record.status} /></Td>
                  <Td className="min-w-72">
                    <form action={addPaymentAction} className="grid grid-cols-2 gap-2">
                      <input type="hidden" name="student_fee_record_id" value={record.id} />
                      <Input name="amount" type="number" min="1" placeholder="Amount" required />
                      <Input name="payment_date" type="date" defaultValue={todayIso()} required />
                      <Textarea className="col-span-2 min-h-16" name="note" placeholder="Note" />
                      <Button className="col-span-2" size="sm" type="submit">Add payment</Button>
                    </form>
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
              ))}
            </tbody>
          </Table>
          {!recordRows.length ? (
            <div className="p-6 text-sm text-muted-foreground">No fee records yet.</div>
          ) : null}
          <Pagination
            count={recordsResult.count}
            page={page}
            pathname="/admin/fees"
            searchParams={resolvedSearchParams}
          />
        </CardContent>
      </Card>
    </>
  );
}
