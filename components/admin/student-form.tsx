"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { studentStatuses } from "@/lib/options";
import { currentBangladeshYear } from "@/lib/utils";
import { translator, translateOption, type AdminLanguage } from "@/lib/i18n";
import Link from "next/link";

type StudentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  classes: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string; class_id: string }>;
  student?: Record<string, any>;
  submitLabel: string;
  error?: string;
  language: AdminLanguage;
};

export function StudentForm({
  action,
  classes,
  sections,
  student,
  submitLabel,
  error,
  language
}: StudentFormProps) {
  const t = translator(language);
  const initialClassId = student?.class_id ?? "";
  const initialSectionId =
    student?.section_id &&
    sections.some(
      (section) => section.id === student.section_id && section.class_id === initialClassId
    )
      ? student.section_id
      : "";
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId);
  const classSections = useMemo(
    () =>
      sections
        .filter((section) => section.class_id === selectedClassId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [sections, selectedClassId]
  );

  return (
    <form action={action} className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-2">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:col-span-2">
          {error}
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="name">{t("Student name")}</Label>
        <Input id="name" name="name" required defaultValue={student?.name ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="roll">{t("Roll")}</Label>
        <Input id="roll" name="roll" required defaultValue={student?.roll ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="class_id">{t("Class")}</Label>
        <Select
          id="class_id"
          name="class_id"
          required
          value={selectedClassId}
          onChange={(event) => {
            const nextClassId = event.target.value;
            setSelectedClassId(nextClassId);
            const currentSection = sections.find((section) => section.id === selectedSectionId);
            if (!currentSection || currentSection.class_id !== nextClassId) {
              setSelectedSectionId("");
            }
          }}
        >
          <option value="">{t("Select class")}</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        {!classes.length ? (
          <p className="text-xs text-muted-foreground">
            {t("No classes found. Create one in")}{" "}
            <Link className="font-medium text-primary" href="/admin/settings/classes">
              {t("Classes & Sections")}
            </Link>
            .
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="section_id">{t("Section")}</Label>
        <Select
          id="section_id"
          name="section_id"
          value={selectedSectionId}
          onChange={(event) => setSelectedSectionId(event.target.value)}
          disabled={!selectedClassId || !classSections.length}
        >
          <option value="">{t("No section")}</option>
          {classSections.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="session_year">{t("Session / Year")}</Label>
        <Input
          id="session_year"
          name="session_year"
          required
          defaultValue={student?.session_year ?? currentBangladeshYear()}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">{t("Status")}</Label>
        <Select id="status" name="status" defaultValue={student?.status ?? "active"}>
          {studentStatuses.map((status) => (
            <option key={status} value={status}>
              {translateOption(language, status)}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="father_name">{t("Father name")}</Label>
        <Input id="father_name" name="father_name" defaultValue={student?.father_name ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mother_name">{t("Mother name")}</Label>
        <Input id="mother_name" name="mother_name" defaultValue={student?.mother_name ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="guardian_phone">{t("Guardian phone")}</Label>
        <Input
          id="guardian_phone"
          name="guardian_phone"
          defaultValue={student?.guardian_phone ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admission_date">{t("Admission date")}</Label>
        <Input
          id="admission_date"
          name="admission_date"
          type="date"
          defaultValue={student?.admission_date ?? ""}
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">{t("Address")}</Label>
        <Textarea id="address" name="address" defaultValue={student?.address ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">{t(submitLabel)}</Button>
      </div>
    </form>
  );
}
