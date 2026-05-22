import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { createFeeTypeAction, deleteFeeTypeAction } from "@/lib/actions";
import { feeCategories, feeFrequencies } from "@/lib/options";
import { createClient } from "@/lib/supabase/server";
import { currency } from "@/lib/utils";

export default async function FeeTypesPage() {
  const supabase = await createClient();
  const { data: feeTypes } = await supabase
    .from("fee_types")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Fee Types"
        description="Add dynamic fee names such as Beton, Vorti, exam fee, session charge, or Vortuki."
      />
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add fee type</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createFeeTypeAction} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="Monthly Fee / Beton" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select id="category" name="category" defaultValue="regular">
                  {feeCategories.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select id="frequency" name="frequency" defaultValue="monthly">
                  {feeFrequencies.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_amount">Default amount</Label>
                <Input id="default_amount" name="default_amount" type="number" min="0" defaultValue="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked />
                Active
              </label>
              <Button type="submit">Save fee type</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <thead><tr><Th>Name</Th><Th>Category</Th><Th>Frequency</Th><Th>Default</Th><Th>Status</Th><Th>Delete</Th></tr></thead>
              <tbody>
                {(feeTypes ?? []).map((item) => (
                  <tr key={item.id}>
                    <Td className="font-medium">{item.name}</Td>
                    <Td>{item.category}</Td>
                    <Td>{item.frequency}</Td>
                    <Td>{currency(item.default_amount)}</Td>
                    <Td><Badge value={item.is_active ? "active" : "left"} /></Td>
                    <Td>
                      <ConfirmForm
                        action={deleteFeeTypeAction}
                        firstMessage={`Delete fee type ${item.name}? Existing fee records may block this if they still use it.`}
                        secondMessage="Final confirmation: delete this fee type?"
                      >
                        <input name="id" type="hidden" value={item.id} />
                        <Button size="sm" type="submit" variant="destructive">
                          Delete
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
