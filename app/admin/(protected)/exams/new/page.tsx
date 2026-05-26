import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { createExamAction, createSubjectAction, deleteSubjectAction } from "@/lib/actions";
import { getAdminTranslator } from "@/lib/i18n-server";
import { currentBangladeshYear } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function NewExamPage() {
  const t = await getAdminTranslator();
  const supabase = await createClient();
  const [{ data: classes }, { data: subjects }] = await Promise.all([
    supabase.from("classes").select("id,name").eq("is_active", true).order("sort_order"),
    supabase.from("subjects").select("*").order("name")
  ]);

  return (
    <>
      <PageHeader title={t("Create Exam")} description={t("Set up an exam, then assign subjects on the exam page.")} />
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><CardTitle>{t("Exam details")}</CardTitle></CardHeader>
          <CardContent>
            <form action={createExamAction} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("Exam name")}</Label>
                <Input id="name" name="name" required placeholder={t("First Term Exam")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class_id">{t("Class")}</Label>
                <Select id="class_id" name="class_id" required>
                  <option value="">{t("Select class")}</option>
                  {(classes ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session_year">{t("Session year")}</Label>
                <Input id="session_year" name="session_year" required defaultValue={currentBangladeshYear()} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">{t("Start date")}</Label>
                <Input id="start_date" name="start_date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">{t("End date")}</Label>
                <Input id="end_date" name="end_date" type="date" />
              </div>
              <div className="space-y-3 md:col-span-2">
                <div>
                  <Label>{t("Assign subjects now")}</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("Selected subjects will be added with full mark 100 and minimum pass mark 33.")}
                  </p>
                </div>
                {(subjects ?? []).length ? (
                  <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-2 lg:grid-cols-3">
                    {(subjects ?? []).map((subject) => (
                      <label className="flex items-center gap-2 text-sm" key={subject.id}>
                        <input name="subject_ids" type="checkbox" value={subject.id} />
                        {subject.name}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                    {t("No subjects yet. Add subjects from the panel on the right first.")}
                  </p>
                )}
              </div>
              <div className="md:col-span-2"><Button type="submit">{t("Create exam")}</Button></div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("Subjects")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <form action={createSubjectAction} className="grid gap-2">
              <Input name="name" required placeholder={t("Subject name")} />
              <Input name="code" placeholder={t("Code")} />
              <Button type="submit" variant="secondary">{t("Add subject")}</Button>
            </form>
            <Table>
              <thead><tr><Th>{t("Name")}</Th><Th>{t("Code")}</Th><Th>{t("Delete")}</Th></tr></thead>
              <tbody>
                {(subjects ?? []).map((subject) => (
                  <tr key={subject.id}>
                    <Td>{subject.name}</Td>
                    <Td>{subject.code ?? "-"}</Td>
                    <Td>
                      <ConfirmForm
                        action={deleteSubjectAction}
                        firstMessage={t("Delete subject {name}? Existing exam subjects or marks may block this if they still use it.", { name: subject.name })}
                        secondMessage={t("Final confirmation: delete this subject?")}
                      >
                        <input name="id" type="hidden" value={subject.id} />
                        <Button size="sm" type="submit" variant="destructive">
                          {t("Delete")}
                        </Button>
                      </ConfirmForm>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
