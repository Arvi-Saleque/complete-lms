import { ConfirmForm } from "@/components/admin/confirm-form";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
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
import { createClient } from "@/lib/supabase/server";

export default async function ClassesSettingsPage() {
  const supabase = await createClient();
  const [{ data: classes }, { data: sections }] = await Promise.all([
    supabase.from("classes").select("*").order("sort_order"),
    supabase.from("sections").select("*,classes(name)").order("name")
  ]);

  const classRows = (classes ?? []) as any[];
  const sectionRows = (sections ?? []) as any[];

  return (
    <>
      <PageHeader
        title="Classes & Sections"
        description="Create classes first, then add sections. Students depend on these records."
      />
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add class</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createClassAction} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Class name</Label>
                  <Input id="name" name="name" required placeholder="Class 1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort order</Label>
                  <Input id="sort_order" name="sort_order" type="number" defaultValue="0" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input name="is_active" type="checkbox" defaultChecked />
                  Active
                </label>
                <Button type="submit">Save class</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add section</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createSectionAction} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="class_id">Class</Label>
                  <Select id="class_id" name="class_id" required>
                    <option value="">Select class</option>
                    {classRows.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section_name">Section name</Label>
                  <Input id="section_name" name="name" required placeholder="A" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input name="is_active" type="checkbox" defaultChecked />
                  Active
                </label>
                <Button type="submit">Save section</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <thead>
                  <tr>
                    <Th>Name</Th>
                    <Th>Sort</Th>
                    <Th>Status</Th>
                    <Th>Delete</Th>
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
                          firstMessage={`Delete class ${item.name}? Students, sections, exams, and related records may block this if they still use it.`}
                          secondMessage="Final confirmation: delete this class?"
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
              {!classRows.length ? (
                <p className="p-4 text-sm text-muted-foreground">
                  No classes yet. Create a class before adding students.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <thead>
                  <tr>
                    <Th>Section</Th>
                    <Th>Class</Th>
                    <Th>Status</Th>
                    <Th>Delete</Th>
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
                          firstMessage={`Delete section ${item.name}? Students using it may need editing first.`}
                          secondMessage="Final confirmation: delete this section?"
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
              {!sectionRows.length ? (
                <p className="p-4 text-sm text-muted-foreground">
                  No sections yet. Sections are optional, but useful for student grouping.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
