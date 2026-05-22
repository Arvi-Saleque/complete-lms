import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { Input, Select } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { saveMarksAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

const gradeOptions = ["A+", "A", "A-", "B", "C", "D", "F", "Pass", "Fail"];

export default async function ResultsPage({
  searchParams
}: {
  searchParams: Promise<{ exam?: string; subject?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(Number(resolvedSearchParams.page ?? 1), 1);
  const from = (page - 1) * 20;
  const to = from + 20;
  const supabase = await createClient();
  const [{ data: exams }, { data: exam }, { data: examSubjects }, { data: subjects }] = await Promise.all([
    supabase.from("exams").select("id,name,classes(name)").order("start_date", { ascending: false }),
    resolvedSearchParams.exam
      ? supabase.from("exams").select("*,classes(name)").eq("id", resolvedSearchParams.exam).maybeSingle()
      : Promise.resolve({ data: null }),
    resolvedSearchParams.exam
      ? supabase.from("exam_subjects").select("subject_id,subjects(id,name)").eq("exam_id", resolvedSearchParams.exam)
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
        name: Array.isArray(item.subjects)
          ? item.subjects[0]?.name
          : item.subjects?.name
      }))
    : subjectRows;
  const selectedExam = resolvedSearchParams.exam;
  const selectedSubject = resolvedSearchParams.subject;

  return (
    <>
      <PageHeader title="Edit Results / Marks Entry" description="Select an exam and subject, then enter marks for active students in that exam class." />
      <Card className="mb-4">
        <CardContent className="pt-4">
          <form className="grid gap-3 md:grid-cols-4">
            <Select name="exam" required defaultValue={resolvedSearchParams.exam ?? ""}>
              <option value="">Select exam</option>
              {examRows.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.classes?.name ?? "Class"}
                </option>
              ))}
            </Select>
            <Select name="subject" required defaultValue={resolvedSearchParams.subject ?? ""}>
              <option value="">Select subject</option>
              {availableSubjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <input name="page" type="hidden" value="1" />
            <Button type="submit">Load marks sheet</Button>
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

      {resolvedSearchParams.exam && resolvedSearchParams.subject ? (
        <form action={saveMarksAction}>
          <input type="hidden" name="exam_id" value={resolvedSearchParams.exam} />
          <input type="hidden" name="subject_id" value={resolvedSearchParams.subject} />
          <Card>
            <CardContent className="p-0">
              <Table>
                <thead><tr><Th>Roll</Th><Th>Name</Th><Th>Written</Th><Th>Oral</Th><Th>Grade</Th><Th>Note</Th></tr></thead>
              <tbody>
                  {(students ?? []).map((student) => {
                    const existing = markByStudent.get(student.id);
                    return (
                      <tr key={student.id}>
                        <Td>{student.roll}</Td>
                        <Td className="font-medium">{student.name}</Td>
                        <Td><Input name={`written_${student.id}`} type="number" min="0" defaultValue={existing?.written_mark ?? 0} /></Td>
                        <Td><Input name={`oral_${student.id}`} type="number" min="0" defaultValue={existing?.oral_mark ?? 0} /></Td>
                        <Td>
                          <Select name={`grade_${student.id}`} defaultValue={existing?.grade ?? ""}>
                            <option value="">No grade</option>
                            {gradeOptions.map((grade) => (
                              <option key={grade} value={grade}>
                                {grade}
                              </option>
                            ))}
                          </Select>
                        </Td>
                        <Td><Input name={`note_${student.id}`} defaultValue={existing?.note ?? ""} /></Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              {(students ?? []).length ? (
                <div className="p-4"><Button type="submit">Save marks</Button></div>
              ) : (
                <div className="p-4">
                  <EmptyState
                    message={`No active students found for ${Array.isArray((exam as any)?.classes) ? (exam as any).classes[0]?.name : (exam as any)?.classes?.name ?? "this exam class"}. Add students to that class first, or edit/create the exam for the correct class.`}
                  />
                </div>
              )}
              <div className="flex items-center justify-between border-t p-4 text-sm text-muted-foreground">
                <span>Showing up to 20 students on this sheet.</span>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a href={`/admin/results?exam=${selectedExam}&subject=${selectedSubject}&page=${Math.max(page - 1, 1)}`}>Previous</a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={`/admin/results?exam=${selectedExam}&subject=${selectedSubject}&page=${page + 1}`}>Next</a>
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
