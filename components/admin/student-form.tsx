"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BanglaInputHelp } from "@/components/ui/bangla-field";
import { BanglaInput } from "@/components/ui/bangla-input";
import { Input, Label, Select } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currentBangladeshYear } from "@/lib/utils";
import { type AdminLanguage } from "@/lib/i18n";
import Link from "next/link";
import type { Student } from "@/lib/students/types";
import { genderOptions, residentialTypeOptions, studentStatusOptions } from "@/lib/students/constants";

type StudentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  classes: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string; class_id: string }>;
  student?: Partial<Student>;
  submitLabel?: string;
  error?: string;
  language: AdminLanguage;
};

export function StudentForm({
  action,
  classes,
  sections,
  student,
  error
}: StudentFormProps) {
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
  const [sameAsPresent, setSameAsPresent] = useState(student?.same_as_present_address ?? false);

  const classSections = useMemo(
    () =>
      sections
        .filter((section) => section.class_id === selectedClassId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [sections, selectedClassId]
  );

  const isEdit = !!student?.id;
  const buttonText = isEdit ? "শিক্ষার্থী আপডেট করুন" : "শিক্ষার্থী তৈরি করুন";

  return (
    <form action={action} className="grid gap-6">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <BanglaInputHelp />

      {/* 1. ভর্তি / একাডেমিক তথ্য */}
      <Card>
        <CardHeader>
          <CardTitle>১. ভর্তি / একাডেমিক তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tracking_no">ট্র্যাকিং নম্বর</Label>
            <Input id="tracking_no" name="tracking_no" defaultValue={student?.tracking_no ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admission_date">ভর্তির তারিখ</Label>
            <Input id="admission_date" name="admission_date" type="date" defaultValue={student?.admission_date?.slice(0, 10) ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class_start_date">ক্লাস শুরুর তারিখ</Label>
            <Input id="class_start_date" name="class_start_date" type="date" defaultValue={student?.class_start_date?.slice(0, 10) ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class_id">ক্লাস</Label>
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
              <option value="">ক্লাস নির্বাচন করুন</option>
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            {!classes.length ? (
              <p className="text-xs text-muted-foreground">
                কোনো ক্লাস পাওয়া যায়নি।{" "}
                <Link className="font-medium text-primary" href="/admin/settings/classes">
                  Classes & Sections
                </Link>
                -এ গিয়ে তৈরি করুন।
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="section_id">শাখা</Label>
            <Select
              id="section_id"
              name="section_id"
              value={selectedSectionId}
              onChange={(event) => setSelectedSectionId(event.target.value)}
              disabled={!selectedClassId || !classSections.length}
            >
              <option value="">শাখা নেই</option>
              {classSections.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="session_year">সেশন / বছর</Label>
            <Input
              id="session_year"
              name="session_year"
              required
              defaultValue={student?.session_year ?? currentBangladeshYear()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roll">রোল</Label>
            <Input id="roll" name="roll" required defaultValue={student?.roll ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">স্ট্যাটাস</Label>
            <Select id="status" name="status" defaultValue={student?.status ?? "active"}>
              {studentStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="residential_type">আবাসিক ধরন</Label>
            <Select id="residential_type" name="residential_type" defaultValue={student?.residential_type ?? ""}>
              <option value="">আবাসিক ধরন নির্বাচন করুন</option>
              {residentialTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 2. শিক্ষার্থীর তথ্য */}
      <Card>
        <CardHeader>
          <CardTitle>২. শিক্ষার্থীর তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="student_name_bn">শিক্ষার্থীর নাম বাংলা</Label>
            <BanglaInput id="student_name_bn" name="student_name_bn" required defaultValue={student?.student_name_bn ?? student?.name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="student_name_en">শিক্ষার্থীর নাম ইংরেজি</Label>
            <Input id="student_name_en" name="student_name_en" defaultValue={student?.student_name_en ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_certificate_no">জন্ম নিবন্ধন নম্বর</Label>
            <Input id="birth_certificate_no" name="birth_certificate_no" defaultValue={student?.birth_certificate_no ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">জন্ম তারিখ</Label>
            <Input id="date_of_birth" name="date_of_birth" type="date" defaultValue={student?.date_of_birth?.slice(0, 10) ?? ""} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor="age_year">বয়স - বছর</Label>
              <Input id="age_year" name="age_year" type="number" defaultValue={student?.age_year ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age_month">মাস</Label>
              <Input id="age_month" name="age_month" type="number" defaultValue={student?.age_month ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age_day">দিন</Label>
              <Input id="age_day" name="age_day" type="number" defaultValue={student?.age_day ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">লিঙ্গ</Label>
            <Select id="gender" name="gender" defaultValue={student?.gender ?? ""}>
              <option value="">লিঙ্গ নির্বাচন করুন</option>
              {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 3. পিতার তথ্য */}
      <Card>
        <CardHeader>
          <CardTitle>৩. পিতার তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="father_name_bn">পিতার নাম বাংলা</Label>
            <BanglaInput id="father_name_bn" name="father_name_bn" defaultValue={student?.father_name_bn ?? student?.father_name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="father_name_en">পিতার নাম ইংরেজি</Label>
            <Input id="father_name_en" name="father_name_en" defaultValue={student?.father_name_en ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="father_nid">পিতার এনআইডি নম্বর</Label>
            <Input id="father_nid" name="father_nid" defaultValue={student?.father_nid ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="father_mobile_1">মোবাইল নম্বর ১</Label>
            <Input id="father_mobile_1" name="father_mobile_1" defaultValue={student?.father_mobile_1 ?? student?.guardian_phone ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="father_mobile_2">মোবাইল নম্বর ২</Label>
            <Input id="father_mobile_2" name="father_mobile_2" defaultValue={student?.father_mobile_2 ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="father_occupation">পেশা</Label>
            <BanglaInput id="father_occupation" name="father_occupation" defaultValue={student?.father_occupation ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="father_education">শিক্ষাগত যোগ্যতা</Label>
            <BanglaInput id="father_education" name="father_education" defaultValue={student?.father_education ?? ""} />
          </div>
        </CardContent>
      </Card>

      {/* 4. মাতার তথ্য */}
      <Card>
        <CardHeader>
          <CardTitle>৪. মাতার তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mother_name_bn">মাতার নাম বাংলা</Label>
            <BanglaInput id="mother_name_bn" name="mother_name_bn" defaultValue={student?.mother_name_bn ?? student?.mother_name ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mother_name_en">মাতার নাম ইংরেজি</Label>
            <Input id="mother_name_en" name="mother_name_en" defaultValue={student?.mother_name_en ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mother_nid">মাতার এনআইডি নম্বর</Label>
            <Input id="mother_nid" name="mother_nid" defaultValue={student?.mother_nid ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mother_mobile_1">মোবাইল নম্বর ১</Label>
            <Input id="mother_mobile_1" name="mother_mobile_1" defaultValue={student?.mother_mobile_1 ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mother_mobile_2">মোবাইল নম্বর ২</Label>
            <Input id="mother_mobile_2" name="mother_mobile_2" defaultValue={student?.mother_mobile_2 ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mother_occupation">পেশা</Label>
            <BanglaInput id="mother_occupation" name="mother_occupation" defaultValue={student?.mother_occupation ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mother_education">শিক্ষাগত যোগ্যতা</Label>
            <BanglaInput id="mother_education" name="mother_education" defaultValue={student?.mother_education ?? ""} />
          </div>
        </CardContent>
      </Card>

      {/* 5. বর্তমান ঠিকানা */}
      <Card>
        <CardHeader>
          <CardTitle>৫. বর্তমান ঠিকানা</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="present_village">গ্রাম</Label>
            <BanglaInput id="present_village" name="present_village" defaultValue={student?.present_village ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="present_post_office">ডাকঘর</Label>
            <BanglaInput id="present_post_office" name="present_post_office" defaultValue={student?.present_post_office ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="present_post_code">পোস্ট কোড</Label>
            <Input id="present_post_code" name="present_post_code" defaultValue={student?.present_post_code ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="present_upazila">থানা / উপজেলা</Label>
            <BanglaInput id="present_upazila" name="present_upazila" defaultValue={student?.present_upazila ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="present_district">জেলা</Label>
            <BanglaInput id="present_district" name="present_district" defaultValue={student?.present_district ?? ""} />
          </div>
        </CardContent>
      </Card>

      {/* 6. স্থায়ী ঠিকানা */}
      <Card>
        <CardHeader>
          <CardTitle>৬. স্থায়ী ঠিকানা</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="same_as_present_address"
              name="same_as_present_address"
              checked={sameAsPresent}
              onChange={(e) => setSameAsPresent(e.target.checked)}
              className="size-4 rounded border-gray-300"
              value="true"
            />
            <Label htmlFor="same_as_present_address">স্থায়ী ঠিকানা বর্তমান ঠিকানার মতো</Label>
          </div>
          
          <div className={`grid gap-4 md:grid-cols-2 ${sameAsPresent ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="space-y-2">
              <Label htmlFor="permanent_village">গ্রাম</Label>
              <BanglaInput id="permanent_village" name="permanent_village" defaultValue={student?.permanent_village ?? ""} tabIndex={sameAsPresent ? -1 : 0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanent_post_office">ডাকঘর</Label>
              <BanglaInput id="permanent_post_office" name="permanent_post_office" defaultValue={student?.permanent_post_office ?? ""} tabIndex={sameAsPresent ? -1 : 0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanent_post_code">পোস্ট কোড</Label>
              <Input id="permanent_post_code" name="permanent_post_code" defaultValue={student?.permanent_post_code ?? ""} tabIndex={sameAsPresent ? -1 : 0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanent_upazila">থানা / উপজেলা</Label>
              <BanglaInput id="permanent_upazila" name="permanent_upazila" defaultValue={student?.permanent_upazila ?? ""} tabIndex={sameAsPresent ? -1 : 0} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanent_district">জেলা</Label>
              <BanglaInput id="permanent_district" name="permanent_district" defaultValue={student?.permanent_district ?? ""} tabIndex={sameAsPresent ? -1 : 0} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Button type="submit" size="lg">{buttonText}</Button>
      </div>
    </form>
  );
}
