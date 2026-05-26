import { PageHeader } from "@/components/admin/page-header";
import { PendingButton } from "@/components/admin/pending-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { Input, Select } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { saveMarksAction } from "@/lib/actions";
import { getAdminTranslator } from "@/lib/i18n-server";
import { pageFromSearch, rangeForPage } from "@/lib/pagination";
import { calculateSubjectGrade } from "@/lib/results";
import { createClient } from "@/lib/supabase/server";

export default async function ResultsPage({
  searchParams
}: {
  searchParams: Promise<{
    exam?: string;
    subject?: string;
    page?: string;
    result?: string;
    result_error?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const t = await getAdminTranslator();
  const page = pageFromSearch(resolvedSearchParams.page);
  const { from, to } = rangeForPage(page);
  const supabase = await createClient();
  const [{ data: exams }, { data: exam }, { data: examSubjects }, { data: subjects }] = await Promise.all([
    supabase.from("exams").select("id,name,classes(name)").order("start_date", { ascending: false }),
    resolvedSearchParams.exam
      ? supabase.from("exams").select("*,classes(name)").eq("id", resolvedSearchParams.exam).maybeSingle()
      : Promise.resolve({ data: null }),
    resolvedSearchParams.exam
      ? supabase
          .from("exam_subjects")
          .select("subject_id,full_mark,pass_mark,subjects(id,name)")
          .eq("exam_id", resolvedSearchParams.exam)
      : Promise.resolve({ data: [] }),
    supabase.from("subjects").select("id,name").order("name")
  ]);

  const [{ data: students }, { data: marks }] = await Promise.all([
    exam
      ? supabase
          .from("students")
          .select("id,name,roll")
          .eq("class_id", exam.class_id)
          .eq("status", "active")
          .order("roll")
          .range(from, to)
      : Promise.resolve({ data: [] }),
    resolvedSearchParams.exam && resolvedSearchParams.subject
      ? supabase
          .from("student_marks")
          .select("*")
          .eq("exam_id", resolvedSearchParams.exam)
          .eq("subject_id", resolvedSearchParams.subject)
      : Promise.resolve({ data: [] })
  ]);

  const markByStudent = new Map((marks ?? []).map((mark) => [mark.student_id, mark]));
  const examRows = (exams ?? []) as any[];
  const examSubjectRows = (examSubjects ?? []) as any[];
  const subjectRows = (subjects ?? []) as any[];
  const availableSubjects = examSubjectRows.length
    ? examSubjectRows.map((item) => ({
        id: item.subject_id,
        fullMark: Number(item.full_mark ?? 0),
        passMark: Number(item.pass_mark ?? 0),
        name: Array.isArray(item.subjects)
          ? item.subjects[0]?.name
          : item.subjects?.name
      }))
    : subjectRows;
  const selectedExam = resolvedSearchParams.exam;
  const selectedSubject = resolvedSearchParams.subject;
  const selectedExamSubject = examSubjectRows.find((item) => item.subject_id === selectedSubject);
  const fullMark = Number(selectedExamSubject?.full_mark ?? 0);
  const passMark = Number(selectedExamSubject?.pass_mark ?? 0);

  return (
    <>
      <PageHeader title={t("Edit Results / Marks Entry")} description={t("Select an exam and subject, then enter marks for active students in that exam class.")} />
      {resolvedSearchParams.result === "saved" ? (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {t("Marks saved. Total, grade, and pass/fail are calculated automatically.")}
        </div>
      ) : null}
      {resolvedSearchParams.result_error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {t(resolvedSearchParams.result_error)}
        </div>
      ) : null}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <form className="grid gap-3 md:grid-cols-4">
            <Select name="exam" required defaultValue={resolvedSearchParams.exam ?? ""}>
              <option value="">{t("Select exam")}</option>
              {examRows.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.classes?.name ?? t("Class")}
                </option>
              ))}
            </Select>
            <Select name="subject" required defaultValue={resolvedSearchParams.subject ?? ""}>
              <option value="">{t("Select subject")}</option>
              {availableSubjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <input name="page" type="hidden" value="1" />
            <Button type="submit">{t("Load marks sheet")}</Button>
          </form>
        </CardContent>
      </Card>

      {selectedExam && availableSubjects.length ? (
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {availableSubjects.map((item) => {
            const params = new URLSearchParams({
              exam: selectedExam,
              subject: item.id,
              page: "1"
            });
            const active = selectedSubject === item.id;
            return (
              <Button asChild key={item.id} size="sm" variant={active ? "default" : "outline"}>
                <a href={`/admin/results?${params.toString()}`}>{item.name}</a>
              </Button>
            );
          })}
        </div>
      ) : null}

      {!resolvedSearchParams.exam ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState message={t("Select an exam and subject to load the marks entry sheet.")} />
          </CardContent>
        </Card>
      ) : null}

      {resolvedSearchParams.exam && !availableSubjects.length ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState message={t("No subjects are assigned to this exam yet. Open the exam setup page and assign subjects first.")} />
          </CardContent>
        </Card>
      ) : null}

      {resolvedSearchParams.exam && resolvedSearchParams.subject ? (
        <form action={saveMarksAction}>
          <input type="hidden" name="exam_id" value={resolvedSearchParams.exam} />
          <input type="hidden" name="subject_id" value={resolvedSearchParams.subject} />
          <input type="hidden" name="page" value={String(page)} />
          <Card>
            <CardContent className="p-0">
              <Table>
                <thead>
                  <tr>
                    <Th>{t("Roll")}</Th>
                    <Th>{t("Name")}</Th>
                    <Th>{t("Written")}</Th>
                    <Th>{t("Oral")}</Th>
                    <Th>{t("Total")}</Th>
                    <Th>{t("Auto grade")}</Th>
                    <Th>{t("Result")}</Th>
                    <Th>{t("Note")}</Th>
                  </tr>
                </thead>
              <tbody>
                  {(students ?? []).map((student) => {
                    const existing = markByStudent.get(student.id);
                    const total = Number(existing?.total_mark ?? 0);
                    const autoGrade = calculateSubjectGrade(total, fullMark, passMark);
                    const status = total >= passMark ? "pass" : "fail";
                    return (
                      <tr key={student.id}>
                        <Td>{student.roll}</Td>
                        <Td className="font-medium">{student.name}</Td>
                        <Td><Input name={`written_${student.id}`} type="number" min="0" max={fullMark} defaultValue={existing?.written_mark ?? ""} placeholder="0" /></Td>
                        <Td><Input name={`oral_${student.id}`} type="number" min="0" max={fullMark} defaultValue={existing?.oral_mark ?? ""} placeholder="0" /></Td>
                        <Td>{existing ? total : "-"}</Td>
                        <Td>{existing ? autoGrade : t("After save")}</Td>
                        <Td>{existing ? <Badge value={status} /> : <Badge value="not entered" />}</Td>
                        <Td><Input name={`note_${student.id}`} defaultValue={existing?.note ?? ""} /></Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              {(students ?? []).length ? (
                <div className="p-4">
                  <PendingButton pendingLabel={t("Saving marks...")} type="submit">
                    {t("Save marks")}
                  </PendingButton>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("Full mark: {fullMark}. Minimum pass mark: {passMark}. Grade is calculated after saving.", {
                      fullMark,
                      passMark
                    })}
                  </p>
                </div>
              ) : (
                <div className="p-4">
                  <EmptyState
                    message={t("No active students found for {className}. Add students to that class first, or edit/create the exam for the correct class.", {
                      className: Array.isArray((exam as any)?.classes) ? (exam as any).classes[0]?.name : (exam as any)?.classes?.name ?? t("this exam class")
                    })}
                  />
                </div>
              )}
              <div className="flex items-center justify-between border-t p-4 text-sm text-muted-foreground">
                <span>{t("Showing up to 20 students on this sheet.")}</span>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a href={`/admin/results?exam=${selectedExam}&subject=${selectedSubject}&page=${Math.max(page - 1, 1)}`}>{t("Previous")}</a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={`/admin/results?exam=${selectedExam}&subject=${selectedSubject}&page=${page + 1}`}>{t("Next")}</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : null}
    </>
  );
}
