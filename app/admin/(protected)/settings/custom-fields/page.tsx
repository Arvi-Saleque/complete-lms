import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Table, Td, Th } from "@/components/ui/table";
import { createCustomFieldAction, deleteCustomFieldAction } from "@/lib/actions";
import { fieldTypes } from "@/lib/options";
import { createClient } from "@/lib/supabase/server";

export default async function CustomFieldsPage() {
  const supabase = await createClient();
  const { data: fields } = await supabase
    .from("custom_field_definitions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Custom Fields"
        description="Add non-money metadata fields. Use fee types for all money-related charges."
      />
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader><CardTitle>Add custom field</CardTitle></CardHeader>
          <CardContent>
            <form action={createCustomFieldAction} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input id="label" name="label" required placeholder="Birth certificate no" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">System name</Label>
                <Input id="name" name="name" required placeholder="birth_certificate_no" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entity_type">Entity</Label>
                <Select id="entity_type" name="entity_type" defaultValue="student">
                  <option value="student">Student</option>
                  <option value="fee">Fee</option>
                  <option value="exam">Exam</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="field_type">Type</Label>
                <Select id="field_type" name="field_type" defaultValue="text">
                  {fieldTypes.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="options">Options</Label>
                <Textarea id="options" name="options" placeholder="Only for dropdown fields" />
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_required" /> Required</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" defaultChecked /> Active</label>
              <Button type="submit">Save field</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <Table>
              <thead><tr><Th>Label</Th><Th>Name</Th><Th>Entity</Th><Th>Type</Th><Th>Status</Th><Th>Delete</Th></tr></thead>
              <tbody>
                {(fields ?? []).map((field) => (
                  <tr key={field.id}>
                    <Td className="font-medium">{field.label}</Td>
                    <Td>{field.name}</Td>
                    <Td>{field.entity_type}</Td>
                    <Td>{field.field_type}</Td>
                    <Td><Badge value={field.is_active ? "active" : "left"} /></Td>
                    <Td>
                      <ConfirmForm
                        action={deleteCustomFieldAction}
                        firstMessage={`Delete custom field ${field.label}? Saved values for this field will also be removed.`}
                        secondMessage="Final confirmation: delete this custom field?"
                      >
                        <input name="id" type="hidden" value={field.id} />
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
