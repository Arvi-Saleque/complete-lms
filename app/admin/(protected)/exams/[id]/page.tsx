import { notFound } from "next/navigation";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { addExamSubjectAction, deleteExamSubjectAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export default async function ExamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  const [{ data: exam }, { data: examSubjects }, { data: subjects }] = await Promise.all([
    supabase.from("exams").select("*,classes(name)").eq("id", resolvedParams.id).maybeSingle(),
    supabase.from("exam_subjects").select("*,subjects(name,code)").eq("exam_id", resolvedParams.id),
    supabase.from("subjects").select("*").order("name")
  ]);

  if (!exam) notFound();
  const examRow = exam as any;
  const examSubjectRows = (examSubjects ?? []) as any[];
  const action = addExamSubjectAction.bind(null, resolvedParams.id);

  return (
    <>
      <PageHeader
        title={examRow.name}
        description={`${examRow.classes?.name ?? "Class"} • Session ${examRow.session_year}`}
      />
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader><CardTitle>Add subject</CardTitle></CardHeader>
          <CardContent>
            <form action={action} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="subject_id">Subject</Label>
                <Select id="subject_id" name="subject_id" required>
                  <option value="">Select subject</option>
                  {(subjects ?? []).map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_mark">Full mark</Label>
                <Input id="full_mark" name="full_mark" type="number" defaultValue="100" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass_mark">Minimum pass mark</Label>
                <Input id="pass_mark" name="pass_mark" type="number" defaultValue="33" required />
                <p className="text-xs text-muted-foreground">
                  This is the required mark to pass, not the student&apos;s obtained mark.
                </p>
              </div>
              <Button type="submit">Assign subject</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <thead><tr><Th>Subject</Th><Th>Code</Th><Th>Full mark</Th><Th>Minimum pass</Th><Th>Delete</Th></tr></thead>
              <tbody>
                {examSubjectRows.map((item) => (
                  <tr key={item.id}>
                    <Td>{item.subjects?.name}</Td>
                    <Td>{item.subjects?.code ?? "-"}</Td>
                    <Td>{item.full_mark}</Td>
                    <Td>{item.pass_mark}</Td>
                    <Td>
                      <ConfirmForm
                        action={deleteExamSubjectAction}
                        firstMessage={`Remove ${item.subjects?.name} from this exam? Related marks may also need cleanup.`}
                        secondMessage="Final confirmation: remove this exam subject?"
                      >
                        <input name="id" type="hidden" value={item.id} />
                        <input name="exam_id" type="hidden" value={resolvedParams.id} />
                        <Button size="sm" type="submit" variant="destructive">
                          Delete
                        </Button>
                      </ConfirmForm>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
