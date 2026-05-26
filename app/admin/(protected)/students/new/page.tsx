import { PageHeader } from "@/components/admin/page-header";
import { StudentForm } from "@/components/admin/student-form";
import { createStudentAction } from "@/lib/actions";
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

export default async function NewStudentPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const [language, t] = await Promise.all([getAdminLanguage(), getAdminTranslator()]);
  const supabase = await createClient();
  const [{ data: classes }, { data: sections }] = await Promise.all([
    supabase.from("classes").select("id,name").eq("is_active", true).order("sort_order"),
    supabase.from("sections").select("id,name,class_id").eq("is_active", true).order("name")
  ]);

  return (
    <>
      <PageHeader title={t("Add Student")} description={t("Create a new student profile.")} />
      <StudentForm
        action={createStudentAction}
        classes={classes ?? []}
        sections={sections ?? []}
        error={studentFormError(t, resolvedSearchParams.error)}
        submitLabel={t("Create student")}
        language={language}
      />
    </>
  );
}
