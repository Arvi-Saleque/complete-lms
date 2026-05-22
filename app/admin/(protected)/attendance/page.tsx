import { AttendanceFilterForm } from "@/components/admin/attendance-filter-form";
import { PageHeader } from "@/components/admin/page-header";
import { PendingButton } from "@/components/admin/pending-button";
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
  searchParams: Promise<{ class?: string; section?: string; date?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const date = resolvedSearchParams.date ?? todayIso();
  const selectedClassId = resolvedSearchParams.class ?? "";
  const requestedSectionId = resolvedSearchParams.section ?? "";

  const [{ data: classes }, { data: sections }] = await Promise.all([
    supabase.from("classes").select("id,name").eq("is_active", true).order("sort_order"),
    supabase.from("sections").select("id,name,class_id").eq("is_active", true).order("name")
  ]);
  const selectedSectionId =
    (sections ?? []).some(
      (section) => section.id === requestedSectionId && section.class_id === selectedClassId
    )
      ? requestedSectionId
      : "";

  let studentQuery = selectedClassId
    ? supabase
        .from("students")
        .select("id,name,roll,section_id")
        .eq("class_id", selectedClassId)
        .eq("status", "active")
        .order("roll")
    : null;

  if (studentQuery && selectedSectionId) {
    studentQuery = studentQuery.eq("section_id", selectedSectionId);
  }

  const { data: students } = studentQuery ? await studentQuery : { data: [] };
  const studentIds = (students ?? []).map((student) => student.id);
  const { data: records } = studentIds.length
    ? await supabase
        .from("attendance_records")
        .select("*")
        .eq("date", date)
        .in("student_id", studentIds)
    : { data: [] };

  const byStudent = new Map((records ?? []).map((row) => [row.student_id, row]));
  const selectedClass = (classes ?? []).find((item) => item.id === selectedClassId);
  const selectedSection = (sections ?? []).find((item) => item.id === selectedSectionId);

  return (
    <>
      <PageHeader title="Edit Hajira / Attendance" description="Mark or update daily attendance by class and date." />
      <Card className="mb-4">
        <CardContent className="pt-4">
          <AttendanceFilterForm
            classes={classes ?? []}
            date={date}
            sections={sections ?? []}
            selectedClassId={selectedClassId}
            selectedSectionId={selectedSectionId}
          />
        </CardContent>
      </Card>

      {!selectedClassId ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Select a class and date to load the attendance sheet.
          </CardContent>
        </Card>
      ) : null}

      {selectedClassId && !(students ?? []).length ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No active students found for {selectedClass?.name ?? "this class"}
            {selectedSection ? `, section ${selectedSection.name}` : ""}.
          </CardContent>
        </Card>
      ) : null}

      {selectedClassId && (students ?? []).length ? (
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
                <PendingButton pendingLabel="Saving attendance..." type="submit">
                  Save attendance
                </PendingButton>
                <p className="mt-2 text-sm text-muted-foreground">
                  Showing all {(students ?? []).length} active students for {selectedClass?.name ?? "the selected class"}
                  {selectedSection ? `, section ${selectedSection.name}` : ""}.
                </p>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : null}
    </>
  );
}
