import Link from "next/link";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { deleteExamAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export default async function ExamsPage() {
  const supabase = await createClient();
  const { data: exams } = await supabase
    .from("exams")
    .select("*,classes(name)")
    .order("start_date", { ascending: false });
  const examRows = (exams ?? []) as any[];

  return (
    <>
      <PageHeader
        title="Exams"
        description="Create exams and assign dynamic subjects."
        actionHref="/admin/exams/new"
        actionLabel="Create exam"
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <thead><tr><Th>Name</Th><Th>Class</Th><Th>Session</Th><Th>Dates</Th><Th>Actions</Th></tr></thead>
            <tbody>
              {examRows.map((exam) => (
                <tr key={exam.id}>
                  <Td className="font-medium">{exam.name}</Td>
                  <Td>{exam.classes?.name ?? "-"}</Td>
                  <Td>{exam.session_year}</Td>
                  <Td>{exam.start_date ?? "-"} to {exam.end_date ?? "-"}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline"><Link href={`/admin/exams/${exam.id}`}>Open</Link></Button>
                      <Button asChild size="sm" variant="outline"><Link href={`/admin/exams/${exam.id}/results`}>Results</Link></Button>
                      <ConfirmForm
                        action={deleteExamAction}
                        firstMessage={`Delete exam ${exam.name}? Subjects and marks for this exam will also be removed.`}
                        secondMessage="Final confirmation: delete this exam permanently?"
                      >
                        <input name="id" type="hidden" value={exam.id} />
                        <Button size="sm" type="submit" variant="destructive">
                          Delete
                        </Button>
                      </ConfirmForm>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
