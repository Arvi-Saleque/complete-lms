import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { StudentForm } from "@/components/admin/student-form";
import { updateStudentAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

function studentFormError(code?: string) {
  if (code === "section-class-mismatch") {
    return "The selected section does not belong to the selected class. Please choose a section from that class.";
  }
  return undefined;
}

export default async function EditStudentPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();
  const [{ data: student }, { data: classes }, { data: sections }] = await Promise.all([
    supabase.from("students").select("*").eq("id", resolvedParams.id).maybeSingle(),
    supabase.from("classes").select("id,name").eq("is_active", true).order("sort_order"),
    supabase.from("sections").select("id,name,class_id").eq("is_active", true).order("name")
  ]);

  if (!student) notFound();
  const action = updateStudentAction.bind(null, resolvedParams.id);

  return (
    <>
      <PageHeader title="Edit Student" description={`Update ${student.name}'s profile.`} />
      <StudentForm
        action={action}
        classes={classes ?? []}
        sections={sections ?? []}
        student={student}
        error={studentFormError(resolvedSearchParams.error)}
        submitLabel="Save changes"
      />
    </>
  );
}
