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
import { createFeeTypeAction, deleteFeeTypeAction } from "@/lib/actions";
import { getAdminTranslator } from "@/lib/i18n-server";
import { feeCategories, feeFrequencies } from "@/lib/options";
import { createClient } from "@/lib/supabase/server";
import { currency } from "@/lib/utils";

export default async function FeeTypesPage() {
  const t = await getAdminTranslator();
  const supabase = await createClient();
  const { data: feeTypes } = await supabase
    .from("fee_types")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title={t("Fee Types")}
        description={t("Add dynamic fee names such as Beton, Vorti, exam fee, session charge, or Vortuki.")}
      />
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("Add fee type")}</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createFeeTypeAction} className="space-y-3">
              <BanglaInputHelp />
              <div className="space-y-2">
                <Label htmlFor="name">{t("Name")}</Label>
                <BanglaInput id="name" name="name" required placeholder={t("Monthly Fee / Beton")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">{t("Category")}</Label>
                <Select id="category" name="category" defaultValue="regular">
                  {feeCategories.map((item) => <option key={item} value={item}>{t(item)}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">{t("Frequency")}</Label>
                <Select id="frequency" name="frequency" defaultValue="monthly">
                  {feeFrequencies.map((item) => <option key={item} value={item}>{t(item)}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_amount">{t("Default amount")}</Label>
                <Input id="default_amount" name="default_amount" type="number" min="0" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("Description")}</Label>
                <BanglaTextarea id="description" name="description" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked />
                {t("Active")}
              </label>
              <Button type="submit">{t("Save fee type")}</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <thead><tr><Th>{t("Name")}</Th><Th>{t("Category")}</Th><Th>{t("Frequency")}</Th><Th>{t("Default")}</Th><Th>{t("Status")}</Th><Th>{t("Delete")}</Th></tr></thead>
              <tbody>
                {(feeTypes ?? []).map((item) => (
                  <tr key={item.id}>
                    <Td className="font-medium">{item.name}</Td>
                    <Td>{t(item.category)}</Td>
                    <Td>{t(item.frequency)}</Td>
                    <Td>{currency(item.default_amount)}</Td>
                    <Td><Badge value={item.is_active ? "active" : "left"} /></Td>
                    <Td>
                      <ConfirmForm
                        action={deleteFeeTypeAction}
                        firstMessage={t("Delete fee type {name}? Existing fee records may block this if they still use it.", { name: item.name })}
                        secondMessage={t("Final confirmation: delete this fee type?")}
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
            {!(feeTypes ?? []).length ? (
              <div className="p-6">
                <EmptyState message={t("No fee types yet. Add the first fee type from the form.")} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
