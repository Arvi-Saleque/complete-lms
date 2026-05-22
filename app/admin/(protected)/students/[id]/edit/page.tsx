import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { StudentForm } from "@/components/admin/student-form";
import { updateStudentAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
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
        submitLabel="Save changes"
      />
    </>
  );
}
