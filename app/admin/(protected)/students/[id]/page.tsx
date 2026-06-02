import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { PrintButton } from "@/components/admin/print-button";
import { AccordionItem } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { BanglaInputHelp } from "@/components/ui/bangla-field";
import { BanglaInput } from "@/components/ui/bangla-input";
import { BanglaTextarea } from "@/components/ui/bangla-textarea";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty";
import { Input, Label, Select } from "@/components/ui/form";
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
import { getAdminLanguage, getAdminTranslator } from "@/lib/i18n-server";
import { createClient } from "@/lib/supabase/server";
import { currency } from "@/lib/utils";
import { genderOptions, residentialTypeOptions } from "@/lib/students/constants";

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const [language, t] = await Promise.all([getAdminLanguage(), getAdminTranslator()]);
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
  const { data: classExams } = await supabase
    .from("exams")
    .select("id,name")
    .eq("class_id", studentRow.class_id)
    .eq("session_year", studentRow.session_year)
    .order("start_date", { ascending: false });
  const examRows = (classExams ?? []) as Array<{ id: string; name: string }>;
  const examIds = examRows.map((exam) => exam.id);
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
      examName: examRows.find((exam) => exam.id === examId)?.name ?? t("Exam"),
      result
    };
  }).filter((examResult) => examResult.result);

  const attendanceSummary = (attendance ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title={studentRow.name}
        description={t("Roll {roll} - {className} - Session {session}", {
          roll: studentRow.roll,
          className: studentRow.classes?.name ?? t("No class"),
          session: studentRow.session_year
        })}
        actionHref={`/admin/students/${studentRow.id}/edit`}
        actionLabel={t("Edit student")}
      />
      <div className="space-y-3">
        <AccordionItem title={t("Basic Information")} defaultOpen>
          <div className="space-y-6">
            {/* 1. সংক্ষিপ্ত তথ্য */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-semibold text-lg">১. সংক্ষিপ্ত তথ্য</h3>
              <dl className="grid gap-3 text-sm md:grid-cols-3">
                <div><dt className="text-muted-foreground">নাম</dt><dd>{studentRow.name || "—"}</dd></div>
                <div><dt className="text-muted-foreground">রোল</dt><dd>{studentRow.roll || "—"}</dd></div>
                <div><dt className="text-muted-foreground">ক্লাস</dt><dd>{studentRow.classes?.name || "—"}</dd></div>
                <div><dt className="text-muted-foreground">শাখা</dt><dd>{studentRow.sections?.name || "—"}</dd></div>
                <div><dt className="text-muted-foreground">সেশন / বছর</dt><dd>{studentRow.session_year || "—"}</dd></div>
                <div><dt className="text-muted-foreground">স্ট্যাটাস</dt><dd><Badge value={studentRow.status} /></dd></div>
                <div><dt className="text-muted-foreground">অভিভাবকের ফোন</dt><dd>{studentRow.guardian_phone || "—"}</dd></div>
                <div className="md:col-span-2"><dt className="text-muted-foreground">ঠিকানা</dt><dd>{studentRow.address || "—"}</dd></div>
              </dl>
            </div>

            {/* 2. ফরম ও শ্রেণির তথ্য */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-semibold text-lg">২. ফরম ও শ্রেণির তথ্য</h3>
              <dl className="grid gap-3 text-sm md:grid-cols-3">
                <div><dt className="text-muted-foreground">ট্র্যাকিং নম্বর</dt><dd>{studentRow.tracking_no || "—"}</dd></div>
                <div><dt className="text-muted-foreground">ফরম গ্রহণের তারিখ</dt><dd>{studentRow.form_received_date || "—"}</dd></div>
                <div><dt className="text-muted-foreground">ফরম জমা দেওয়ার তারিখ</dt><dd>{studentRow.form_submitted_date || "—"}</dd></div>
                <div><dt className="text-muted-foreground">ভর্তির শ্রেণী</dt><dd>{studentRow.classes?.name || "—"}</dd></div>
                <div><dt className="text-muted-foreground">শাখা</dt><dd>{studentRow.sections?.name || "—"}</dd></div>
                <div><dt className="text-muted-foreground">সেশন / বছর</dt><dd>{studentRow.session_year || "—"}</dd></div>
                <div><dt className="text-muted-foreground">রোল</dt><dd>{studentRow.roll || "—"}</dd></div>
                <div><dt className="text-muted-foreground">স্ট্যাটাস</dt><dd><Badge value={studentRow.status} /></dd></div>
                <div><dt className="text-muted-foreground">আবাসিক ধরন</dt><dd>{residentialTypeOptions.find((o) => o.value === studentRow.residential_type)?.label || "—"}</dd></div>
              </dl>
            </div>

            {/* 3. শিক্ষার্থীর তথ্য */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-semibold text-lg">৩. শিক্ষার্থীর তথ্য</h3>
              <dl className="grid gap-3 text-sm md:grid-cols-3">
                <div><dt className="text-muted-foreground">শিক্ষার্থীর নাম বাংলা</dt><dd>{studentRow.student_name_bn || "—"}</dd></div>
                <div><dt className="text-muted-foreground">শিক্ষার্থীর নাম ইংরেজি</dt><dd>{studentRow.student_name_en || "—"}</dd></div>
                <div><dt className="text-muted-foreground">জন্ম নিবন্ধন নম্বর</dt><dd>{studentRow.birth_certificate_no || "—"}</dd></div>
                <div><dt className="text-muted-foreground">জন্ম তারিখ</dt><dd>{studentRow.date_of_birth || "—"}</dd></div>
                <div>
                  <dt className="text-muted-foreground">বয়স</dt>
                  <dd>
                    {[
                      studentRow.age_day ? `${studentRow.age_day} দিন` : null,
                      studentRow.age_month ? `${studentRow.age_month} মাস` : null,
                      studentRow.age_year ? `${studentRow.age_year} বছর` : null
                    ]
                      .filter(Boolean)
                      .join(" ") || "—"}
                  </dd>
                </div>
                <div><dt className="text-muted-foreground">লিঙ্গ</dt><dd>{genderOptions.find((o) => o.value === studentRow.gender)?.label || "—"}</dd></div>
              </dl>
            </div>

            {/* 4. পিতার তথ্য */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-semibold text-lg">৪. পিতার তথ্য</h3>
              <dl className="grid gap-3 text-sm md:grid-cols-3">
                <div><dt className="text-muted-foreground">পিতার নাম বাংলা</dt><dd>{studentRow.father_name_bn || "—"}</dd></div>
                <div><dt className="text-muted-foreground">পিতার নাম ইংরেজি</dt><dd>{studentRow.father_name_en || "—"}</dd></div>
                <div><dt className="text-muted-foreground">পিতার এনআইডি নম্বর</dt><dd>{studentRow.father_nid || "—"}</dd></div>
                <div><dt className="text-muted-foreground">মোবাইল নং-১</dt><dd>{studentRow.father_mobile_1 || "—"}</dd></div>
                <div><dt className="text-muted-foreground">মোবাইল নং-২</dt><dd>{studentRow.father_mobile_2 || "—"}</dd></div>
                <div><dt className="text-muted-foreground">মোবাইল নং-৩</dt><dd>{studentRow.father_mobile_3 || "—"}</dd></div>
                <div><dt className="text-muted-foreground">হোয়াটসঅ্যাপ আছে যে নম্বরে</dt><dd>{studentRow.father_whatsapp_number || "—"}</dd></div>
                <div><dt className="text-muted-foreground">পিতার অবস্থান</dt><dd>{studentRow.father_profession_type === "local" ? "দেশে" : studentRow.father_profession_type === "abroad" ? "প্রবাসে" : (studentRow.father_profession_type || studentRow.father_occupation || "—")}</dd></div>
                <div><dt className="text-muted-foreground">পেশার বিবরণ</dt><dd>{studentRow.father_profession_details || "—"}</dd></div>
                <div><dt className="text-muted-foreground">শিক্ষাগত যোগ্যতা</dt><dd>{studentRow.father_education || "—"}</dd></div>
              </dl>
            </div>

            {/* 5. মাতার তথ্য */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-semibold text-lg">৫. মাতার তথ্য</h3>
              <dl className="grid gap-3 text-sm md:grid-cols-3">
                <div><dt className="text-muted-foreground">মাতার নাম বাংলা</dt><dd>{studentRow.mother_name_bn || "—"}</dd></div>
                <div><dt className="text-muted-foreground">মাতার নাম ইংরেজি</dt><dd>{studentRow.mother_name_en || "—"}</dd></div>
                <div><dt className="text-muted-foreground">মাতার এনআইডি নম্বর</dt><dd>{studentRow.mother_nid || "—"}</dd></div>
                <div><dt className="text-muted-foreground">মোবাইল নং</dt><dd>{studentRow.mother_mobile || studentRow.mother_mobile_1 || "—"}</dd></div>
                <div><dt className="text-muted-foreground">মায়ের পেশা</dt><dd>{studentRow.mother_profession_type || studentRow.mother_occupation || "—"}</dd></div>
                <div><dt className="text-muted-foreground">শিক্ষাগত যোগ্যতা</dt><dd>{studentRow.mother_education || "—"}</dd></div>
              </dl>
            </div>

            {/* 6. বর্তমান ঠিকানা */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-semibold text-lg">৬. বর্তমান ঠিকানা</h3>
              <dl className="grid gap-3 text-sm md:grid-cols-3">
                <div><dt className="text-muted-foreground">গ্রাম</dt><dd>{studentRow.present_village || "—"}</dd></div>
                <div><dt className="text-muted-foreground">পোস্ট</dt><dd>{studentRow.present_post_office || "—"}</dd></div>
                <div><dt className="text-muted-foreground">পোস্ট ওয়ার্ড নং / ইউনিয়ন</dt><dd>{studentRow.present_post_code || "—"}</dd></div>
                <div><dt className="text-muted-foreground">থানা / উপজেলা</dt><dd>{studentRow.present_upazila || "—"}</dd></div>
                <div><dt className="text-muted-foreground">জেলা</dt><dd>{studentRow.present_district || "—"}</dd></div>
              </dl>
            </div>

            {/* 7. স্থায়ী ঠিকানা */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-semibold text-lg">৭. স্থায়ী ঠিকানা</h3>
              <dl className="grid gap-3 text-sm md:grid-cols-3">
                <div><dt className="text-muted-foreground">গ্রাম</dt><dd>{studentRow.permanent_village || "—"}</dd></div>
                <div><dt className="text-muted-foreground">পোস্ট</dt><dd>{studentRow.permanent_post_office || "—"}</dd></div>
                <div><dt className="text-muted-foreground">পোস্ট ওয়ার্ড নং / ইউনিয়ন</dt><dd>{studentRow.permanent_post_code || "—"}</dd></div>
                <div><dt className="text-muted-foreground">থানা / উপজেলা</dt><dd>{studentRow.permanent_upazila || "—"}</dd></div>
                <div><dt className="text-muted-foreground">জেলা</dt><dd>{studentRow.permanent_district || "—"}</dd></div>
              </dl>
            </div>

            {/* 8. সংযুক্ত কাগজ-পত্র */}
            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-semibold text-lg">৮. সংযুক্ত কাগজ-পত্র</h3>
              <dl className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                <div><dt className="text-muted-foreground">জন্মনিবন্ধনের কপি</dt><dd>{studentRow.docs_birth_certificate ? "✅ জমা দেওয়া হয়েছে" : "❌ দেওয়া হয়নি"}</dd></div>
                <div><dt className="text-muted-foreground">মার্কশীটের কপি</dt><dd>{studentRow.docs_previous_marksheet ? "✅ জমা দেওয়া হয়েছে" : "❌ দেওয়া হয়নি"}</dd></div>
                <div><dt className="text-muted-foreground">অভিভাবকের ছবি</dt><dd>{studentRow.docs_guardian_photo ? "✅ জমা দেওয়া হয়েছে" : "❌ দেওয়া হয়নি"}</dd></div>
                <div><dt className="text-muted-foreground">অভিভাবকের এনআইডি</dt><dd>{studentRow.docs_guardian_nid ? "✅ জমা দেওয়া হয়েছে" : "❌ দেওয়া হয়নি"}</dd></div>
              </dl>
            </div>
          </div>
        </AccordionItem>
        <AccordionItem title={t("Hajira / Attendance")}>
          <div className="mb-3 flex gap-2 text-sm">
            {["present", "absent", "late", "leave"].map((status) => (
              <span key={status} className="rounded-md bg-secondary px-2 py-1 capitalize">
                {t(status)}: {attendanceSummary[status] ?? 0}
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
        <AccordionItem title={t("Fee Statement")} defaultOpen>
          <div className="mb-4 flex flex-wrap gap-2 print-hide">
            <PrintButton label={t("Print statement")} />
          </div>
          <div className="mb-4 grid gap-3 md:grid-cols-4">
            {[
              [t("Total amount"), currency(feeTotals.amount)],
              [t("Total discount"), currency(feeTotals.discount)],
              [t("Total paid"), currency(feeTotals.paid)],
              [t("Total due"), currency(feeTotals.due)]
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
                    <Th>{t("Fee")}</Th>
                    <Th>{t("Month")}</Th>
                    <Th>{t("Amount")}</Th>
                    <Th>{t("Discount")}</Th>
                    <Th>{t("Paid")}</Th>
                    <Th>{t("Due")}</Th>
                    <Th>{t("Status")}</Th>
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
                <h3 className="mb-2 font-medium">{t("Payment history")}</h3>
                <Table>
                  <thead>
                    <tr>
                      <Th>{t("Date")}</Th>
                      <Th>{t("Fee")}</Th>
                      <Th>{t("Amount")}</Th>
                      <Th>{t("Receipt")}</Th>
                      <Th>{t("Note")}</Th>
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
          ) : <EmptyState message={t("No fee records yet.")} />}
        </AccordionItem>
        <AccordionItem title={t("Payment History")}>
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
        <AccordionItem title={t("Exam Results")}>
          {examResults.length ? (
            <div className="space-y-4">
              {examResults.map(({ examId, examName, result }) => (
                <div className="rounded-md border" key={examId}>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
                    <div>
                      <p className="font-medium">{examName}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("Total {obtained}/{full} - {percentage} - Grade {grade}", {
                          obtained: formatMark(result.totalObtained),
                          full: formatMark(result.totalFullMarks),
                          percentage: formatPercentage(result.percentage),
                          grade: result.grade
                        })}
                      </p>
                    </div>
                    <Badge value={result.status.toLowerCase()} />
                  </div>
                  <Table>
                    <thead>
                      <tr>
                        <Th>{t("Subject")}</Th>
                        <Th>{t("Written")}</Th>
                        <Th>{t("Oral")}</Th>
                        <Th>{t("Total")}</Th>
                        <Th>{t("Grade")}</Th>
                        <Th>{t("Status")}</Th>
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
                          <Td>{subject.grade}</Td>
                          <Td><Badge value={subject.status.toLowerCase()} /></Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ))}
            </div>
          ) : <EmptyState message={t("No exam results yet.")} />}
        </AccordionItem>
        <AccordionItem title={t("Custom Fields")}>
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
                      <option value="">{t("Select value")}</option>
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
                  ) : field.field_type === "boolean" ? (
                    <Select
                      id={`custom_${field.id}`}
                      name={`custom_${field.id}`}
                      defaultValue={customValueByField.get(field.id) ?? ""}
                    >
                      <option value="">{t("Select value")}</option>
                      <option value="true">{t("Yes")}</option>
                      <option value="false">{t("No")}</option>
                    </Select>
                  ) : (
                    field.field_type === "text" ? (
                      <BanglaInput
                        id={`custom_${field.id}`}
                        name={`custom_${field.id}`}
                        defaultValue={customValueByField.get(field.id) ?? ""}
                      />
                    ) : (
                      <Input
                        id={`custom_${field.id}`}
                        name={`custom_${field.id}`}
                        type={field.field_type}
                        defaultValue={customValueByField.get(field.id) ?? ""}
                      />
                    )
                  )}
                </div>
              ))}
              <div className="md:col-span-2">
                <Button type="submit">{t("Save custom fields")}</Button>
              </div>
            </form>
          ) : <EmptyState message={t("No student custom fields defined. Create fields in Admin > Custom Fields first.")} />}
        </AccordionItem>
        <AccordionItem title={t("Notes")}>
          <form action={addNote} className="mb-4 space-y-3">
            <BanglaInputHelp />
            <BanglaTextarea name="note" placeholder={t("Write a note about this student")} required />
            <Button type="submit">{t("Add note")}</Button>
          </form>
          {noteRows.length ? (
            <div className="space-y-2">
              {noteRows.map((note) => (
                <div key={note.id} className="flex items-start justify-between gap-3 rounded-md bg-secondary p-3 text-sm">
                  <div>
                    <p>{note.note}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(note.created_at).toLocaleString(language === "bn" ? "bn-BD" : "en-BD", {
                        timeZone: "Asia/Dhaka"
                      })}
                    </p>
                  </div>
                  <ConfirmForm
                    action={deleteNote}
                    firstMessage={t("Delete this note?")}
                    secondMessage={t("Final confirmation: delete this note permanently?")}
                  >
                    <input name="id" type="hidden" value={note.id} />
                    <Button size="sm" type="submit" variant="destructive">
                      {t("Delete")}
                    </Button>
                  </ConfirmForm>
                </div>
              ))}
            </div>
          ) : <EmptyState message={t("No notes yet.")} />}
        </AccordionItem>
      </div>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link href="/admin/students">{t("Back to students")}</Link>
        </Button>
      </div>
    </>
  );
}
