import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { PrintButton } from "@/components/admin/print-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { Table, Td, Th } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

export default async function ExamResultSheetPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: exam } = await supabase
    .from("exams")
    .select("*,classes(name)")
    .eq("id", resolvedParams.id)
    .maybeSingle();

  if (!exam) notFound();
  const examRow = exam as any;

  const [{ data: examSubjects }, { data: students }, { data: marks }] = await Promise.all([
      supabase
        .from("exam_subjects")
        .select("subject_id,full_mark,pass_mark,subjects(name,code)")
        .eq("exam_id", resolvedParams.id),
      supabase
        .from("students")
        .select("id,name,roll")
        .eq("class_id", examRow.class_id)
        .eq("status", "active")
        .order("roll"),
      supabase.from("student_marks").select("*").eq("exam_id", resolvedParams.id)
    ]);

  const subjectRows = (examSubjects ?? []) as any[];
  const studentRows = (students ?? []) as any[];
  const markRows = (marks ?? []) as any[];
  const marksByStudentSubject = new Map(
    markRows.map((mark) => [`${mark.student_id}:${mark.subject_id}`, mark])
  );

  const fullMarkTotal = subjectRows.reduce(
    (sum, subject) => sum + Number(subject.full_mark ?? 0),
    0
  );
  const passMarkTotal = subjectRows.reduce(
    (sum, subject) => sum + Number(subject.pass_mark ?? 0),
    0
  );

  return (
    <div className="print-page">
      <PageHeader
        title="Exam Result Sheet"
        description={`${examRow.name} • ${examRow.classes?.name ?? "Class"} • Session ${examRow.session_year}`}
      />
      <div className="mb-4 flex flex-wrap gap-2 print-hide">
        <PrintButton label="Export exam PDF" />
        <Button asChild variant="outline">
          <Link href={`/admin/exams/${resolvedParams.id}`}>Exam setup</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/results">Edit marks</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{examRow.name}</CardTitle>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
            <p>Class: {examRow.classes?.name ?? "-"}</p>
            <p>Session: {examRow.session_year}</p>
            <p>Full mark: {fullMarkTotal}</p>
            <p>Pass mark: {passMarkTotal}</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {studentRows.length && subjectRows.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>Roll</Th>
                  <Th>Name</Th>
                  {subjectRows.map((subject) => (
                    <Th key={subject.subject_id}>
                      {subject.subjects?.name}
                      <span className="block text-xs font-normal">
                        /{subject.full_mark}
                      </span>
                    </Th>
                  ))}
                  <Th>Total</Th>
                  <Th>Grade</Th>
                  <Th>Result</Th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map((student) => {
                  const subjectMarks = subjectRows.map((subject) =>
                    marksByStudentSubject.get(`${student.id}:${subject.subject_id}`)
                  );
                  const total = subjectMarks.reduce(
                    (sum, mark) => sum + Number(mark?.total_mark ?? 0),
                    0
                  );
                  const failedSubject = subjectRows.some((subject, index) => {
                    const mark = subjectMarks[index];
                    return Number(mark?.total_mark ?? 0) < Number(subject.pass_mark ?? 0);
                  });
                  const result = failedSubject || total < passMarkTotal ? "Fail" : "Pass";
                  const grade =
                    subjectMarks.find((mark) => mark?.grade)?.grade ??
                    (result === "Pass" ? "Pass" : "Fail");

                  return (
                    <tr key={student.id}>
                      <Td>{student.roll}</Td>
                      <Td className="font-medium">{student.name}</Td>
                      {subjectRows.map((subject, index) => {
                        const mark = subjectMarks[index];
                        return (
                          <Td key={subject.subject_id}>
                            {mark ? Number(mark.total_mark) : "-"}
                          </Td>
                        );
                      })}
                      <Td>{total}</Td>
                      <Td>{grade}</Td>
                      <Td className={result === "Pass" ? "text-emerald-700" : "text-red-700"}>
                        {result}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="p-4">
              <EmptyState message="No result sheet data yet. Assign subjects and enter marks first." />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
