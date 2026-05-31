import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { BanglaInputHelp } from "@/components/ui/bangla-field";
import { BanglaInput } from "@/components/ui/bangla-input";
import { BanglaTextarea } from "@/components/ui/bangla-textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty";
import { Input, Label, Select } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { createCustomFieldAction, deleteCustomFieldAction } from "@/lib/actions";
import { getAdminTranslator } from "@/lib/i18n-server";
import { fieldTypes } from "@/lib/options";
import { createClient } from "@/lib/supabase/server";

export default async function CustomFieldsPage() {
  const t = await getAdminTranslator();
  const supabase = await createClient();
  const { data: fields } = await supabase
    .from("custom_field_definitions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title={t("Custom Fields")}
        description={t("Add non-money metadata fields. Use fee types for all money-related charges.")}
      />
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader><CardTitle>{t("Add custom field")}</CardTitle></CardHeader>
          <CardContent>
            <form action={createCustomFieldAction} className="space-y-3">
              <BanglaInputHelp />
              <div className="space-y-2">
                <Label htmlFor="label">{t("Label")}</Label>
                <BanglaInput id="label" name="label" required placeholder={t("Birth certificate no")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">{t("System name")}</Label>
                <Input id="name" name="name" required placeholder="birth_certificate_no" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entity_type">{t("Entity")}</Label>
                <Select id="entity_type" name="entity_type" defaultValue="student">
                  <option value="student">{t("Student")}</option>
                  <option value="fee">{t("Fee")}</option>
                  <option value="exam">{t("Exam")}</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="field_type">{t("Type")}</Label>
                <Select id="field_type" name="field_type" defaultValue="text">
                  {fieldTypes.map((item) => <option key={item} value={item}>{t(item)}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="options">{t("Options")}</Label>
                <BanglaTextarea id="options" name="options" placeholder={t("Only for dropdown fields")} />
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_required" /> {t("Required")}</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked /> {t("Active")}</label>
              <Button type="submit">{t("Save field")}</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <thead><tr><Th>{t("Label")}</Th><Th>{t("Name")}</Th><Th>{t("Entity")}</Th><Th>{t("Type")}</Th><Th>{t("Status")}</Th><Th>{t("Delete")}</Th></tr></thead>
              <tbody>
                {(fields ?? []).map((field) => (
                  <tr key={field.id}>
                    <Td className="font-medium">{field.label}</Td>
                    <Td>{field.name}</Td>
                    <Td>{t(field.entity_type)}</Td>
                    <Td>{t(field.field_type)}</Td>
                    <Td><Badge value={field.is_active ? "active" : "left"} /></Td>
                    <Td>
                      <ConfirmForm
                        action={deleteCustomFieldAction}
                        firstMessage={t("Delete custom field {label}? Saved values for this field will also be removed.", { label: field.label })}
                        secondMessage={t("Final confirmation: delete this custom field?")}
                      >
                        <input name="id" type="hidden" value={field.id} />
                        <Button size="sm" type="submit" variant="destructive">
                          {t("Delete")}
                        </Button>
                      </ConfirmForm>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {!(fields ?? []).length ? (
              <div className="p-6">
                <EmptyState message={t("No custom fields yet. Add one only for non-money metadata.")} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
