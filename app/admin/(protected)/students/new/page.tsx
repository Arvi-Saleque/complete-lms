import { PageHeader } from "@/components/admin/page-header";
import { StudentForm } from "@/components/admin/student-form";
import { createStudentAction } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export default async function NewStudentPage() {
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
        submitLabel="Create student"
      />
    </>
  );
}
