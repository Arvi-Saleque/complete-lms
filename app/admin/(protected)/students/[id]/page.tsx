import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { PrintButton } from "@/components/admin/print-button";
import { AccordionItem } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import {
  addStudentNoteAction,
  deleteStudentNoteAction,
  saveStudentCustomFieldsAction
} from "@/lib/actions";
import {
  calculateExamResults,
  formatMark,
  formatPercentage,
  type ExamSubjectRow,
  type StudentMarkRow
} from "@/lib/results";
import { createClient } from "@/lib/supabase/server";
import { currency } from "@/lib/utils";

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const [
    { data: student },
    { data: fees },
    { data: payments },
    { data: attendance },
    { data: marks },
    { data: customFields },
    { data: customFieldDefinitions },
    { data: notes }
  ] = await Promise.all([
    supabase
      .from("students")
      .select("*,classes(name),sections(name)")
      .eq("id", resolvedParams.id)
      .maybeSingle(),
    supabase
      .from("student_fee_records")
      .select("*,fee_types(name)")
      .eq("student_id", resolvedParams.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("*,student_fee_records!inner(student_id,fee_types(name))")
      .eq("student_fee_records.student_id", resolvedParams.id)
      .order("payment_date", { ascending: false }),
    supabase
      .from("attendance_records")
      .select("*")
      .eq("student_id", resolvedParams.id)
      .order("date", { ascending: false })
      .limit(30),
    supabase
      .from("student_marks")
      .select("*,exams(id,name),subjects(name)")
      .eq("student_id", resolvedParams.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("custom_field_values")
      .select("field_definition_id,value,custom_field_definitions(label,entity_type)")
      .eq("entity_id", resolvedParams.id),
    supabase
      .from("custom_field_definitions")
      .select("*")
      .eq("entity_type", "student")
      .eq("is_active", true)
      .order("label"),
    supabase.from("notes").select("*").eq("student_id", resolvedParams.id).order("created_at", { ascending: false })
  ]);

  if (!student) notFound();
  const studentRow = student as any;
  const feeRows = (fees ?? []) as any[];
  const paymentRows = (payments ?? []) as any[];
  const markRows = (marks ?? []) as any[];
  const examIds = Array.from(
    new Set(markRows.map((mark) => mark.exams?.id).filter(Boolean))
  );
  const { data: examSubjects } = examIds.length
    ? await supabase
        .from("exam_subjects")
        .select("exam_id,subject_id,full_mark,pass_mark,subjects(name,code)")
        .in("exam_id", examIds)
    : { data: [] };
  const examSubjectRows = ((examSubjects ?? []) as any[]).map((subject) => ({
    ...subject,
    subjects: Array.isArray(subject.subjects) ? subject.subjects[0] : subject.subjects
  })) as Array<ExamSubjectRow & { exam_id: string }>;
  const customFieldRows = (customFields ?? []) as any[];
  const customFieldDefinitionRows = (customFieldDefinitions ?? []) as any[];
  const noteRows = (notes ?? []) as any[];
  const customValueByField = new Map(
    customFieldRows.map((field) => [field.field_definition_id, field.value ?? ""])
  );
  const saveCustomFields = saveStudentCustomFieldsAction.bind(null, studentRow.id);
  const addNote = addStudentNoteAction.bind(null, studentRow.id);
  const deleteNote = deleteStudentNoteAction.bind(null, studentRow.id);
  const feeTotals = feeRows.reduce(
    (totals, fee) => ({
      amount: totals.amount + Number(fee.amount ?? 0),
      discount: totals.discount + Number(fee.discount_amount ?? 0),
      paid: totals.paid + Number(fee.paid_amount ?? 0),
      due: totals.due + Number(fee.due_amount ?? 0)
    }),
    { amount: 0, discount: 0, paid: 0, due: 0 }
  );
  const examResults = examIds.map((examId) => {
    const examMarks = markRows.filter((mark) => mark.exams?.id === examId);
    const subjectRows = examSubjectRows.filter((subject) => subject.exam_id === examId);
    const result = calculateExamResults({
      students: [{ id: studentRow.id, name: studentRow.name, roll: studentRow.roll }],
      examSubjects: subjectRows,
      marks: examMarks as StudentMarkRow[]
    })[0];

    return {
      examId,
      examName: examMarks[0]?.exams?.name ?? "Exam",
      result
    };
  });

  const attendanceSummary = (attendance ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title={studentRow.name}
        description={`Roll ${studentRow.roll} • ${studentRow.classes?.name ?? "No class"} • Session ${studentRow.session_year}`}
        actionHref={`/admin/students/${studentRow.id}/edit`}
        actionLabel="Edit student"
      />
      <div className="space-y-3">
        <AccordionItem title="Basic Information" defaultOpen>
          <dl className="grid gap-3 text-sm md:grid-cols-3">
            <div><dt className="text-muted-foreground">Class</dt><dd>{studentRow.classes?.name ?? "-"}</dd></div>
            <div><dt className="text-muted-foreground">Section</dt><dd>{studentRow.sections?.name ?? "-"}</dd></div>
            <div><dt className="text-muted-foreground">Status</dt><dd><Badge value={studentRow.status} /></dd></div>
            <div><dt className="text-muted-foreground">Father</dt><dd>{studentRow.father_name ?? "-"}</dd></div>
            <div><dt className="text-muted-foreground">Mother</dt><dd>{studentRow.mother_name ?? "-"}</dd></div>
            <div><dt className="text-muted-foreground">Phone</dt><dd>{studentRow.guardian_phone ?? "-"}</dd></div>
            <div className="md:col-span-3"><dt className="text-muted-foreground">Address</dt><dd>{studentRow.address ?? "-"}</dd></div>
          </dl>
        </AccordionItem>
        <AccordionItem title="Hajira / Attendance">
          <div className="mb-3 flex gap-2 text-sm">
            {["present", "absent", "late", "leave"].map((status) => (
              <span key={status} className="rounded-md bg-secondary px-2 py-1 capitalize">
                {status}: {attendanceSummary[status] ?? 0}
              </span>
            ))}
          </div>
          <Table>
            <tbody>
              {(attendance ?? []).map((row) => (
                <tr key={row.id}>
                  <Td>{row.date}</Td>
                  <Td><Badge value={row.status} /></Td>
                  <Td>{row.note ?? ""}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </AccordionItem>
        <AccordionItem title="Fee Statement" defaultOpen>
          <div className="mb-4 flex flex-wrap gap-2 print-hide">
            <PrintButton label="Print statement" />
          </div>
          <div className="mb-4 grid gap-3 md:grid-cols-4">
            {[
              ["Total amount", currency(feeTotals.amount)],
              ["Total discount", currency(feeTotals.discount)],
              ["Total paid", currency(feeTotals.paid)],
              ["Total due", currency(feeTotals.due)]
            ].map(([label, value]) => (
              <div className="rounded-md border p-3" key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
          {feeRows.length ? (
            <div className="space-y-4">
              <Table>
                <thead>
                  <tr>
                    <Th>Fee</Th>
                    <Th>Month</Th>
                    <Th>Amount</Th>
                    <Th>Discount</Th>
                    <Th>Paid</Th>
                    <Th>Due</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {feeRows.map((fee) => (
                    <tr key={fee.id}>
                      <Td>{fee.fee_types?.name}</Td>
                      <Td>{fee.month ?? "-"}</Td>
                      <Td>{currency(fee.amount)}</Td>
                      <Td>{currency(fee.discount_amount)}</Td>
                      <Td>{currency(fee.paid_amount)}</Td>
                      <Td>{currency(fee.due_amount)}</Td>
                      <Td><Badge value={fee.status} /></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div>
                <h3 className="mb-2 font-medium">Payment history</h3>
                <Table>
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>Fee</Th>
                      <Th>Amount</Th>
                      <Th>Receipt</Th>
                      <Th>Note</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRows.map((payment) => (
                      <tr key={payment.id}>
                        <Td>{payment.payment_date}</Td>
                        <Td>{payment.student_fee_records?.fee_types?.name}</Td>
                        <Td>{currency(payment.amount)}</Td>
                        <Td>
                          <Link className="font-medium text-primary" href={`/admin/fees/receipts/${payment.id}`}>
                            {payment.receipt_no ?? `R-${String(payment.id).slice(0, 8).toUpperCase()}`}
                          </Link>
                        </Td>
                        <Td>{payment.note ?? "-"}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          ) : <EmptyState message="No fee records yet." />}
        </AccordionItem>
        <AccordionItem title="Payment History">
          <Table>
            <tbody>
              {paymentRows.map((payment) => (
                <tr key={payment.id}>
                  <Td>{payment.payment_date}</Td>
                  <Td>{payment.student_fee_records?.fee_types?.name}</Td>
                  <Td>{currency(payment.amount)}</Td>
                  <Td>
                    <Link className="font-medium text-primary" href={`/admin/fees/receipts/${payment.id}`}>
                      {payment.receipt_no ?? `R-${String(payment.id).slice(0, 8).toUpperCase()}`}
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </AccordionItem>
        <AccordionItem title="Exam Results">
          {examResults.length ? (
            <div className="space-y-4">
              {examResults.map(({ examId, examName, result }) => (
                <div className="rounded-md border" key={examId}>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
                    <div>
                      <p className="font-medium">{examName}</p>
                      <p className="text-sm text-muted-foreground">
                        Total {formatMark(result.totalObtained)}/{formatMark(result.totalFullMarks)} - {formatPercentage(result.percentage)} - Grade {result.grade}
                      </p>
                    </div>
                    <Badge value={result.status.toLowerCase()} />
                  </div>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Subject</Th>
                        <Th>Written</Th>
                        <Th>Oral</Th>
                        <Th>Total</Th>
                        <Th>Grade</Th>
                        <Th>Status</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.subjects.map((subject) => (
                        <tr key={subject.subjectId}>
                          <Td>{subject.subjectName}</Td>
                          <Td>{subject.mark ? formatMark(subject.writtenMark) : "-"}</Td>
                          <Td>{subject.mark ? formatMark(subject.oralMark) : "-"}</Td>
                          <Td>
                            {subject.mark
                              ? `${formatMark(subject.totalMark)}/${formatMark(subject.fullMark)}`
                              : "-"}
                          </Td>
                          <Td>{subject.mark ? subject.grade : "-"}</Td>
                          <Td>{subject.mark ? <Badge value={subject.status.toLowerCase()} /> : "-"}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))}
            </div>
          ) : <EmptyState message="No exam results yet." />}
        </AccordionItem>
        <AccordionItem title="Custom Fields">
          {customFieldDefinitionRows.length ? (
            <form action={saveCustomFields} className="grid gap-4 md:grid-cols-2">
              {customFieldDefinitionRows.map((field) => (
                <div className="space-y-2" key={field.id}>
                  <Label htmlFor={`custom_${field.id}`}>{field.label}</Label>
                  {field.field_type === "dropdown" ? (
                    <Select
                      id={`custom_${field.id}`}
                      name={`custom_${field.id}`}
                      defaultValue={customValueByField.get(field.id) ?? ""}
                    >
                      <option value="">Select value</option>
                      {String(field.options ?? "")
                        .split(",")
                        .map((option) => option.trim())
                        .filter(Boolean)
                        .map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                    </Select>
                  ) : (
                    <Input
                      id={`custom_${field.id}`}
                      name={`custom_${field.id}`}
                      type={
                        field.field_type === "number"
                          ? "number"
                          : field.field_type === "date"
                            ? "date"
                            : "text"
                      }
                      defaultValue={customValueByField.get(field.id) ?? ""}
                    />
                  )}
                </div>
              ))}
              <div className="md:col-span-2">
                <Button type="submit">Save custom fields</Button>
              </div>
            </form>
          ) : <EmptyState message="No student custom fields defined. Create fields in Admin > Custom Fields first." />}
        </AccordionItem>
        <AccordionItem title="Notes">
          <form action={addNote} className="mb-4 space-y-3">
            <Textarea name="note" placeholder="Write a note about this student" required />
            <Button type="submit">Add note</Button>
          </form>
          {noteRows.length ? (
            <div className="space-y-2">
              {noteRows.map((note) => (
                <div key={note.id} className="flex items-start justify-between gap-3 rounded-md bg-secondary p-3 text-sm">
                  <div>
                    <p>{note.note}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleString("en-BD")}
                    </p>
                  </div>
                  <ConfirmForm
                    action={deleteNote}
                    firstMessage="Delete this note?"
                    secondMessage="Final confirmation: delete this note permanently?"
                  >
                    <input name="id" type="hidden" value={note.id} />
                    <Button size="sm" type="submit" variant="destructive">
                      Delete
                    </Button>
                  </ConfirmForm>
                </div>
              ))}
            </div>
          ) : <EmptyState message="No notes yet." />}
        </AccordionItem>
      </div>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link href="/admin/students">Back to students</Link>
        </Button>
      </div>
    </>
  );
}
