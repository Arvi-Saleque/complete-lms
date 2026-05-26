import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { StudentForm } from "@/components/admin/student-form";
import { updateStudentAction } from "@/lib/actions";
import { getAdminLanguage, getAdminTranslator } from "@/lib/i18n-server";
import { createClient } from "@/lib/supabase/server";

function studentFormError(t: (text: string) => string, code?: string) {
  if (code === "section-class-mismatch") {
    return t("The selected section does not belong to the selected class. Please choose a section from that class.");
  }
  if (code === "roll-exists") {
    return t("Roll number already exists for this class, section, and session.");
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
  const [language, t] = await Promise.all([getAdminLanguage(), getAdminTranslator()]);
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
      <PageHeader title={t("Edit Student")} description={t("Update {name}'s profile.", { name: student.name })} />
      <StudentForm
        action={action}
        classes={classes ?? []}
        sections={sections ?? []}
        student={student}
        error={studentFormError(t, resolvedSearchParams.error)}
        submitLabel={t("Save changes")}
        language={language}
      />
    </>
  );
}
