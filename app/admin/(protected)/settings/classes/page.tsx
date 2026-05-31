import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { BanglaInputHelp } from "@/components/ui/bangla-field";
import { BanglaInput } from "@/components/ui/bangla-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import {
  createClassAction,
  createSectionAction,
  deleteClassAction,
  deleteSectionAction
} from "@/lib/actions";
import { getAdminTranslator } from "@/lib/i18n-server";
import { createClient } from "@/lib/supabase/server";

function settingsError(t: (text: string) => string, code?: string) {
  if (code === "section-exists") {
    return t("That section already exists for the selected class. Use a different section name for that class.");
  }
  return undefined;
}

export default async function ClassesSettingsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const t = await getAdminTranslator();
  const supabase = await createClient();
  const [{ data: classes }, { data: sections }] = await Promise.all([
    supabase.from("classes").select("*").order("sort_order"),
    supabase.from("sections").select("*,classes(name)").order("name")
  ]);

  const classRows = (classes ?? []) as any[];
  const sectionRows = (sections ?? []) as any[];
  const error = settingsError(t, resolvedSearchParams.error);

  return (
    <>
      <PageHeader
        title={t("Classes & Sections")}
        description={t("Create classes first, then add sections. Students depend on these records.")}
      />
      {error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Add class")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createClassAction} className="space-y-3">
                <BanglaInputHelp />
                <div className="space-y-2">
                  <Label htmlFor="name">{t("Class name")}</Label>
                  <BanglaInput id="name" name="name" required placeholder={t("Class 1")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">{t("Sort order")}</Label>
                  <Input id="sort_order" name="sort_order" type="number" defaultValue="0" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input name="is_active" type="checkbox" defaultChecked />
                  {t("Active")}
                </label>
                <Button type="submit">{t("Save class")}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("Add section")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createSectionAction} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="class_id">{t("Class")}</Label>
                  <Select id="class_id" name="class_id" required>
                    <option value="">{t("Select class")}</option>
                    {classRows.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section_name">{t("Section name")}</Label>
                  <BanglaInput id="section_name" name="name" required placeholder="A" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input name="is_active" type="checkbox" defaultChecked />
                  {t("Active")}
                </label>
                <Button type="submit">{t("Save section")}</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Classes")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <thead>
                  <tr>
                    <Th>{t("Name")}</Th>
                    <Th>{t("Sort")}</Th>
                    <Th>{t("Status")}</Th>
                    <Th>{t("Delete")}</Th>
                  </tr>
                </thead>
                <tbody>
                  {classRows.map((item) => (
                    <tr key={item.id}>
                      <Td className="font-medium">{item.name}</Td>
                      <Td>{item.sort_order}</Td>
                      <Td>
                        <Badge value={item.is_active ? "active" : "left"} />
                      </Td>
                      <Td>
                        <ConfirmForm
                          action={deleteClassAction}
                          firstMessage={t("Delete class {name}? Students, sections, exams, and related records may block this if they still use it.", { name: item.name })}
                          secondMessage={t("Final confirmation: delete this class?")}
                        >
                          <input name="id" type="hidden" value={item.id} />
                          <Button size="sm" type="submit" variant="destructive">
                            {t("Delete")}
                          </Button>
                        </ConfirmForm>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {!classRows.length ? (
                <p className="p-4 text-sm text-muted-foreground">
                  {t("No classes yet. Create a class before adding students.")}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("Sections")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <thead>
                  <tr>
                    <Th>{t("Section")}</Th>
                    <Th>{t("Class")}</Th>
                    <Th>{t("Status")}</Th>
                    <Th>{t("Delete")}</Th>
                  </tr>
                </thead>
                <tbody>
                  {sectionRows.map((item) => (
                    <tr key={item.id}>
                      <Td className="font-medium">{item.name}</Td>
                      <Td>{item.classes?.name ?? "-"}</Td>
                      <Td>
                        <Badge value={item.is_active ? "active" : "left"} />
                      </Td>
                      <Td>
                        <ConfirmForm
                          action={deleteSectionAction}
                          firstMessage={t("Delete section {name}? Students using it may need editing first.", { name: item.name })}
                          secondMessage={t("Final confirmation: delete this section?")}
                        >
                          <input name="id" type="hidden" value={item.id} />
                          <Button size="sm" type="submit" variant="destructive">
                            {t("Delete")}
                          </Button>
                        </ConfirmForm>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {!sectionRows.length ? (
                <p className="p-4 text-sm text-muted-foreground">
                  {t("No sections yet. Sections are optional, but useful for student grouping.")}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
