import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { saveAttendanceAction } from "@/lib/actions";
import { attendanceStatuses } from "@/lib/options";
import { createClient } from "@/lib/supabase/server";
import { todayIso } from "@/lib/utils";

export default async function AttendancePage({
  searchParams
}: {
  searchParams: Promise<{ class?: string; date?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Math.max(Number(resolvedSearchParams.page ?? 1), 1);
  const from = (page - 1) * 20;
  const to = from + 20;
  const supabase = await createClient();
  const date = resolvedSearchParams.date ?? todayIso();
  const [{ data: classes }, { data: students }, { data: records }] = await Promise.all([
    supabase.from("classes").select("id,name").eq("is_active", true).order("sort_order"),
    resolvedSearchParams.class
      ? supabase
          .from("students")
          .select("id,name,roll")
          .eq("class_id", resolvedSearchParams.class)
          .eq("status", "active")
          .order("roll")
          .range(from, to)
      : Promise.resolve({ data: [] }),
    resolvedSearchParams.class
      ? supabase.from("attendance_records").select("*").eq("date", date)
      : Promise.resolve({ data: [] })
  ]);

  const byStudent = new Map((records ?? []).map((row) => [row.student_id, row]));

  return (
    <>
      <PageHeader title="Edit Hajira / Attendance" description="Mark or update daily attendance by class and date." />
      <Card className="mb-4">
        <CardContent className="pt-4">
          <form className="grid gap-3 md:grid-cols-4">
            <Select name="class" required defaultValue={resolvedSearchParams.class ?? ""}>
              <option value="">Select class</option>
              {(classes ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </Select>
            <Input name="date" type="date" defaultValue={date} />
            <input name="page" type="hidden" value="1" />
            <Button type="submit">Load students</Button>
          </form>
        </CardContent>
      </Card>
      {resolvedSearchParams.class ? (
        <form action={saveAttendanceAction}>
          <input type="hidden" name="date" value={date} />
          <Card>
            <CardContent className="p-0">
              <Table>
                <thead><tr><Th>Roll</Th><Th>Name</Th><Th>Status</Th><Th>Note</Th></tr></thead>
                <tbody>
                  {(students ?? []).map((student) => {
                    const existing = byStudent.get(student.id);
                    return (
                      <tr key={student.id}>
                        <Td>{student.roll}</Td>
                        <Td className="font-medium">{student.name}</Td>
                        <Td>
                          <Select name={`status_${student.id}`} defaultValue={existing?.status ?? "present"}>
                            {attendanceStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </Select>
                        </Td>
                        <Td>
                          <Input name={`note_${student.id}`} defaultValue={existing?.note ?? ""} />
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <div className="p-4">
                <Button type="submit">Save attendance</Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  Showing students {from + 1}-{Math.min(to, from + (students ?? []).length)}. Use class sections for smaller sheets.
                </p>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : null}
    </>
  );
}
