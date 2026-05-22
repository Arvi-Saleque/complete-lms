"use client";

import { useMemo, useState } from "react";
import { PendingButton } from "@/components/admin/pending-button";
import { Input, Label, Select } from "@/components/ui/form";

type AttendanceFilterFormProps = {
  classes: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string; class_id: string }>;
  selectedClassId: string;
  selectedSectionId: string;
  date: string;
};

export function AttendanceFilterForm({
  classes,
  sections,
  selectedClassId,
  selectedSectionId,
  date
}: AttendanceFilterFormProps) {
  const [classId, setClassId] = useState(selectedClassId);
  const [sectionId, setSectionId] = useState(selectedSectionId);
  const classSections = useMemo(
    () =>
      sections
        .filter((section) => section.class_id === classId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [classId, sections]
  );

  return (
    <form className="grid gap-3 md:grid-cols-4">
      <div className="space-y-2">
        <Label htmlFor="class">Class</Label>
        <Select
          id="class"
          name="class"
          required
          value={classId}
          onChange={(event) => {
            setClassId(event.target.value);
            setSectionId("");
          }}
        >
          <option value="">Select class</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="section">Section</Label>
        <Select
          disabled={!classId || !classSections.length}
          id="section"
          name="section"
          value={sectionId}
          onChange={(event) => setSectionId(event.target.value)}
        >
          <option value="">All sections</option>
          {classSections.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" defaultValue={date} />
      </div>
      <div className="flex items-end">
        <PendingButton className="w-full" pendingLabel="Loading students..." type="submit">
          Load students
        </PendingButton>
      </div>
    </form>
  );
}
