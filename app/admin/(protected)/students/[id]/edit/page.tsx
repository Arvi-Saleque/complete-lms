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
  if (code === "name-required") return t("Student name is required (English or Bangla).");
  if (code === "invalid-dob") return t("Invalid Date of Birth.");
  if (code === "invalid-admission-date") return t("Invalid Admission Date.");
  if (code === "invalid-class-start-date") return t("Invalid Class Start Date.");
  if (code === "invalid-age-year") return t("Age year must be between 0 and 120.");
  if (code === "invalid-age-month") return t("Age month must be between 0 and 12.");
  if (code === "invalid-age-day") return t("Age day must be between 0 and 31.");
  if (code === "invalid-gender") return t("Invalid gender selected.");
  if (code === "invalid-residential-type") return t("Invalid residential type selected.");
  if (code === "invalid-status") return t("Invalid status selected.");
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
