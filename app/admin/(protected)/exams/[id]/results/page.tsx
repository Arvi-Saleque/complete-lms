import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { PrintButton } from "@/components/admin/print-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { Table, Td, Th } from "@/components/ui/table";
import {
  calculateExamResults,
  formatMark,
  formatPercentage,
  type ExamSubjectRow,
  type StudentMarkRow,
  type StudentRow
} from "@/lib/results";
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

  const subjectRows = ((examSubjects ?? []) as any[]).map((subject) => ({
    ...subject,
    subjects: Array.isArray(subject.subjects) ? subject.subjects[0] : subject.subjects
  })) as ExamSubjectRow[];
  const studentRows = (students ?? []) as StudentRow[];
  const markRows = (marks ?? []) as StudentMarkRow[];
  const resultRows = calculateExamResults({
    students: studentRows,
    examSubjects: subjectRows,
    marks: markRows
  });
  const fullMarkTotal = subjectRows.reduce(
    (sum, subject) => sum + Number(subject.full_mark ?? 0),
    0
  );

  return (
    <div className="print-page">
      <PageHeader
        title="Exam Result Sheet"
        description={`${examRow.name} - ${examRow.classes?.name ?? "Class"} - Session ${examRow.session_year}`}
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
            <p>Subjects: {subjectRows.length}</p>
            <p>Full mark: {formatMark(fullMarkTotal)}</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {studentRows.length && subjectRows.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>Position</Th>
                  <Th>Roll</Th>
                  <Th>Name</Th>
                  {subjectRows.map((subject) => (
                    <Th key={subject.subject_id}>
                      {subject.subjects?.name}
                      <span className="block text-xs font-normal">
                        /{formatMark(Number(subject.full_mark ?? 0))}
                      </span>
                    </Th>
                  ))}
                  <Th>Total</Th>
                  <Th>Percentage</Th>
                  <Th>Grade</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {resultRows.map((result) => (
                  <tr key={result.student.id}>
                    <Td>{result.position ?? "-"}</Td>
                    <Td>{result.student.roll}</Td>
                    <Td className="font-medium">{result.student.name}</Td>
                    {result.subjects.map((subject) => (
                      <Td key={subject.subjectId}>
                        {subject.mark ? (
                          <>
                            <span>{formatMark(subject.totalMark)}</span>
                            <span className="block text-xs text-muted-foreground">
                              {subject.grade} - {subject.status}
                            </span>
                          </>
                        ) : (
                          "-"
                        )}
                      </Td>
                    ))}
                    <Td>
                      {formatMark(result.totalObtained)}/{formatMark(result.totalFullMarks)}
                    </Td>
                    <Td>{formatPercentage(result.percentage)}</Td>
                    <Td>{result.grade}</Td>
                    <Td><Badge value={result.status.toLowerCase()} /></Td>
                  </tr>
                ))}
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
