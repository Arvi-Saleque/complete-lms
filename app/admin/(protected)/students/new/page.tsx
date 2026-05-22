import { PageHeader } from "@/components/admin/page-header";
import { StudentForm } from "@/components/admin/student-form";
import { createStudentAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

function studentFormError(code?: string) {
  if (code === "section-class-mismatch") {
    return "The selected section does not belong to the selected class. Please choose a section from that class.";
  }
  if (code === "roll-exists") {
    return "Roll number already exists for this class, section, and session.";
  }
  return undefined;
}

export default async function NewStudentPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const [{ data: classes }, { data: sections }] = await Promise.all([
    supabase.from("classes").select("id,name").eq("is_active", true).order("sort_order"),
    supabase.from("sections").select("id,name,class_id").eq("is_active", true).order("name")
  ]);

  return (
    <>
      <PageHeader title="Add Student" description="Create a new student profile." />
      <StudentForm
        action={createStudentAction}
        classes={classes ?? []}
        sections={sections ?? []}
        error={studentFormError(resolvedSearchParams.error)}
        submitLabel="Create student"
      />
    </>
  );
}
