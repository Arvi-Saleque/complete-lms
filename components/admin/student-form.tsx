import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { studentStatuses } from "@/lib/options";
import Link from "next/link";

type StudentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  classes: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string; class_id: string }>;
  student?: Record<string, any>;
  submitLabel: string;
};

export function StudentForm({
  action,
  classes,
  sections,
  student,
  submitLabel
}: StudentFormProps) {
  const distinctSections = Array.from(
    new Map(sections.map((item) => [item.name.toLowerCase(), item])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <form action={action} className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="name">Student name</Label>
        <Input id="name" name="name" required defaultValue={student?.name ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="roll">Roll</Label>
        <Input id="roll" name="roll" required defaultValue={student?.roll ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="class_id">Class</Label>
        <Select id="class_id" name="class_id" required defaultValue={student?.class_id ?? ""}>
          <option value="">Select class</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        {!classes.length ? (
          <p className="text-xs text-muted-foreground">
            No classes found. Create one in{" "}
            <Link className="font-medium text-primary" href="/admin/settings/classes">
              Classes & Sections
            </Link>
            .
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="section_id">Section</Label>
        <Select id="section_id" name="section_id" defaultValue={student?.section_id ?? ""}>
          <option value="">No section</option>
          {distinctSections.map((item) => (
            <option key={item.name} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="session_year">Session / Year</Label>
        <Input
          id="session_year"
          name="session_year"
          required
          defaultValue={student?.session_year ?? new Date().getFullYear()}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={student?.status ?? "active"}>
          {studentStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="father_name">Father name</Label>
        <Input id="father_name" name="father_name" defaultValue={student?.father_name ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mother_name">Mother name</Label>
        <Input id="mother_name" name="mother_name" defaultValue={student?.mother_name ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="guardian_phone">Guardian phone</Label>
        <Input
          id="guardian_phone"
          name="guardian_phone"
          defaultValue={student?.guardian_phone ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admission_date">Admission date</Label>
        <Input
          id="admission_date"
          name="admission_date"
          type="date"
          defaultValue={student?.admission_date ?? ""}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={student?.address ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
