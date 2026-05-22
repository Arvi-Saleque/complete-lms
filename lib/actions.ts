"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePrincipal } from "@/lib/auth";
import { deleteAllSchoolData, insertDemoPreset } from "@/lib/demo-preset";
import { calculateSubjectGrade } from "@/lib/results";
import { createClient } from "@/lib/supabase/server";
import { emptyToNull, todayIso, toNumber } from "@/lib/utils";

function feeStatus(amount: number, discount: number, paid: number) {
  const due = Math.max(amount - discount - paid, 0);
  if (due <= 0) return { due, status: "paid" };
  if (paid > 0) return { due, status: "partial" };
  return { due, status: "unpaid" };
}

function feesRedirectUrl(params: Record<string, string | null | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return query ? `/admin/fees?${query}` : "/admin/fees";
}

function resultsRedirectUrl(params: Record<string, string | null | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return query ? `/admin/results?${query}` : "/admin/results";
}

async function sectionBelongsToClass(
  supabase: Awaited<ReturnType<typeof createClient>>,
  classId: string,
  sectionId: string | null
) {
  if (!sectionId) return true;

  const { data, error } = await supabase
    .from("sections")
    .select("id")
    .eq("id", sectionId)
    .eq("class_id", classId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function insertDemoPresetAction() {
  await requirePrincipal();
  const supabase = await createClient();
  await insertDemoPreset(supabase);

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/students");
  revalidatePath("/admin/fees");
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/exams");
  revalidatePath("/admin/results");
  redirect("/admin/dashboard?demo=inserted");
}

export async function deleteDemoPresetAction() {
  await requirePrincipal();
  const supabase = await createClient();
  await deleteAllSchoolData(supabase);

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/students");
  revalidatePath("/admin/fees");
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/exams");
  revalidatePath("/admin/results");
  redirect("/admin/dashboard?demo=deleted-all");
}

export async function createStudentAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const classId = String(formData.get("class_id"));
  const sectionId = emptyToNull(formData.get("section_id"));

  if (!(await sectionBelongsToClass(supabase, classId, sectionId))) {
    redirect("/admin/students/new?error=section-class-mismatch");
  }

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    roll: String(formData.get("roll") ?? "").trim(),
    class_id: classId,
    section_id: sectionId,
    session_year: String(formData.get("session_year") ?? "").trim(),
    father_name: emptyToNull(formData.get("father_name")),
    mother_name: emptyToNull(formData.get("mother_name")),
    guardian_phone: emptyToNull(formData.get("guardian_phone")),
    address: emptyToNull(formData.get("address")),
    admission_date: emptyToNull(formData.get("admission_date")),
    status: String(formData.get("status") ?? "active")
  };

  const { error } = await supabase.from("students").insert(payload);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function updateStudentAction(id: string, formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const classId = String(formData.get("class_id"));
  const sectionId = emptyToNull(formData.get("section_id"));

  if (!(await sectionBelongsToClass(supabase, classId, sectionId))) {
    redirect(`/admin/students/${id}/edit?error=section-class-mismatch`);
  }

  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    roll: String(formData.get("roll") ?? "").trim(),
    class_id: classId,
    section_id: sectionId,
    session_year: String(formData.get("session_year") ?? "").trim(),
    father_name: emptyToNull(formData.get("father_name")),
    mother_name: emptyToNull(formData.get("mother_name")),
    guardian_phone: emptyToNull(formData.get("guardian_phone")),
    address: emptyToNull(formData.get("address")),
    admission_date: emptyToNull(formData.get("admission_date")),
    status: String(formData.get("status") ?? "active")
  };

  const { error } = await supabase.from("students").update(payload).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  redirect(`/admin/students/${id}`);
}

export async function deleteStudentAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/students");
  revalidatePath("/admin/fees");
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/results");
}

export async function createClassAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();

  const { error } = await supabase.from("classes").insert({
    name: String(formData.get("name") ?? "").trim(),
    sort_order: toNumber(formData.get("sort_order")),
    is_active: formData.get("is_active") === "on"
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings/classes");
  revalidatePath("/admin/students/new");
  revalidatePath("/admin/students");
}

export async function deleteClassAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings/classes");
  revalidatePath("/admin/students/new");
  revalidatePath("/admin/students");
}

export async function createSectionAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const classId = String(formData.get("class_id"));
  const name = String(formData.get("name") ?? "").trim();

  const { data: existing, error: existingError } = await supabase
    .from("sections")
    .select("id")
    .eq("class_id", classId)
    .ilike("name", name)
    .limit(1);
  if (existingError) throw new Error(existingError.message);

  if (existing?.length) {
    redirect("/admin/settings/classes?error=section-exists");
  }

  const { error } = await supabase.from("sections").insert({
    class_id: classId,
    name,
    is_active: formData.get("is_active") === "on"
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings/classes");
  revalidatePath("/admin/students/new");
}

export async function deleteSectionAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("sections").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings/classes");
  revalidatePath("/admin/students/new");
}

export async function createFeeTypeAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();

  const { error } = await supabase.from("fee_types").insert({
    name: String(formData.get("name") ?? "").trim(),
    description: emptyToNull(formData.get("description")),
    category: String(formData.get("category") ?? "other"),
    default_amount: toNumber(formData.get("default_amount")),
    frequency: String(formData.get("frequency") ?? "one_time"),
    is_active: formData.get("is_active") === "on"
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings/fee-types");
}

export async function deleteFeeTypeAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("fee_types").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/settings/fee-types");
  revalidatePath("/admin/fees");
}

export async function createFeeRecordAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const amount = toNumber(formData.get("amount"));
  const discount = toNumber(formData.get("discount_amount"));
  const paid = toNumber(formData.get("paid_amount"));
  const computed = feeStatus(amount, discount, 0);

  if (amount < 0 || discount < 0 || paid < 0) {
    redirect(feesRedirectUrl({ payment_error: "Fee amounts cannot be negative." }));
  }

  if (discount > amount) {
    redirect(feesRedirectUrl({ payment_error: "Discount cannot exceed fee amount." }));
  }

  if (paid > computed.due) {
    redirect(feesRedirectUrl({ payment_error: "Already paid amount cannot exceed current due amount." }));
  }

  const { data, error } = await supabase
    .from("student_fee_records")
    .insert({
      student_id: String(formData.get("student_id")),
      fee_type_id: String(formData.get("fee_type_id")),
      amount,
      discount_amount: discount,
      paid_amount: 0,
      due_amount: computed.due,
      month: emptyToNull(formData.get("month")),
      session_year: String(formData.get("session_year") ?? "").trim(),
      due_date: emptyToNull(formData.get("due_date")),
      status: computed.status,
      note: emptyToNull(formData.get("note"))
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  if (paid > 0) {
    const { error: paymentError } = await supabase.rpc("add_fee_payment", {
      p_student_fee_record_id: data.id,
      p_amount: paid,
      p_payment_date: todayIso(),
      p_note: "Initial payment"
    });
    if (paymentError) throw new Error(paymentError.message);
  }

  revalidatePath("/admin/fees");
  redirect("/admin/fees");
}

export async function deleteFeeRecordAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("student_fee_records").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/fees");
  revalidatePath("/admin/students");
}

export async function addPaymentAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const recordId = String(formData.get("student_fee_record_id"));
  const amount = toNumber(formData.get("amount"));
  const page = String(formData.get("page") ?? "");
  const paymentDate = emptyToNull(formData.get("payment_date")) ?? todayIso();

  if (amount <= 0) {
    redirect(feesRedirectUrl({
      page,
      payment_error: "Payment amount must be greater than 0."
    }));
  }

  const { data: record, error: recordError } = await supabase
    .from("student_fee_records")
    .select("id,due_amount,status")
    .eq("id", recordId)
    .single();
  if (recordError || !record) {
    redirect(feesRedirectUrl({
      page,
      payment_error: "Fee record was not found."
    }));
  }

  if (record.status === "paid" || Number(record.due_amount ?? 0) <= 0) {
    redirect(feesRedirectUrl({
      page,
      payment_error: "This fee record is already fully paid."
    }));
  }

  if (amount > Number(record.due_amount ?? 0)) {
    redirect(feesRedirectUrl({
      page,
      payment_error: "Payment amount cannot exceed current due amount."
    }));
  }

  const { error: paymentError } = await supabase.rpc("add_fee_payment", {
    p_student_fee_record_id: recordId,
    p_amount: amount,
    p_payment_date: paymentDate,
    p_note: emptyToNull(formData.get("note"))
  });
  if (paymentError) {
    redirect(feesRedirectUrl({
      page,
      payment_error: paymentError.message
    }));
  }

  revalidatePath("/admin/fees");
  revalidatePath("/admin/students");
  revalidatePath("/admin/dashboard");
  redirect(feesRedirectUrl({ page, payment: "success" }));
}

export async function saveAttendanceAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const date = String(formData.get("date"));
  const rows = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("status_"))
    .map(([key, value]) => ({
      student_id: key.replace("status_", ""),
      date,
      status: String(value),
      note: emptyToNull(formData.get(`note_${key.replace("status_", "")}`))
    }));

  if (rows.length) {
    const { error } = await supabase
      .from("attendance_records")
      .upsert(rows, { onConflict: "student_id,date" });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/attendance");
  revalidatePath("/admin/dashboard");
}

export async function createSubjectAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const { error } = await supabase.from("subjects").insert({
    name: String(formData.get("name") ?? "").trim(),
    code: emptyToNull(formData.get("code"))
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/exams/new");
}

export async function deleteSubjectAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error: marksError } = await supabase
    .from("student_marks")
    .delete()
    .eq("subject_id", id);
  if (marksError) throw new Error(marksError.message);

  const { error: examSubjectsError } = await supabase
    .from("exam_subjects")
    .delete()
    .eq("subject_id", id);
  if (examSubjectsError) throw new Error(examSubjectsError.message);

  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/exams/new");
  revalidatePath("/admin/exams");
  revalidatePath("/admin/results");
}

export async function createExamAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const subjectIds = Array.from(
    new Set(formData.getAll("subject_ids").map((value) => String(value)))
  ).filter(Boolean);

  const { data, error } = await supabase
    .from("exams")
    .insert({
      name: String(formData.get("name") ?? "").trim(),
      class_id: String(formData.get("class_id")),
      session_year: String(formData.get("session_year") ?? "").trim(),
      start_date: emptyToNull(formData.get("start_date")),
      end_date: emptyToNull(formData.get("end_date"))
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  if (subjectIds.length) {
    const { error: subjectError } = await supabase.from("exam_subjects").insert(
      subjectIds.map((subjectId) => ({
        exam_id: data.id,
        subject_id: subjectId,
        full_mark: 100,
        pass_mark: 33
      }))
    );
    if (subjectError) throw new Error(subjectError.message);
  }

  revalidatePath("/admin/exams");
  redirect(`/admin/exams/${data.id}`);
}

export async function deleteExamAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("exams").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/exams");
  revalidatePath("/admin/results");
}

export async function addExamSubjectAction(examId: string, formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const { error } = await supabase.from("exam_subjects").insert({
    exam_id: examId,
    subject_id: String(formData.get("subject_id")),
    full_mark: toNumber(formData.get("full_mark")),
    pass_mark: toNumber(formData.get("pass_mark"))
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/exams/${examId}`);
}

export async function deleteExamSubjectAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const examId = String(formData.get("exam_id"));

  const { error } = await supabase.from("exam_subjects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/exams/${examId}`);
  revalidatePath("/admin/results");
}

export async function saveMarksAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const examId = String(formData.get("exam_id"));
  const subjectId = String(formData.get("subject_id"));
  const page = String(formData.get("page") ?? "1");

  const { data: examSubject, error: examSubjectError } = await supabase
    .from("exam_subjects")
    .select("full_mark,pass_mark")
    .eq("exam_id", examId)
    .eq("subject_id", subjectId)
    .maybeSingle();

  if (examSubjectError) throw new Error(examSubjectError.message);
  if (!examSubject) {
    redirect(resultsRedirectUrl({
      exam: examId,
      subject: subjectId,
      page,
      result_error: "This subject is not assigned to the selected exam."
    }));
  }

  const fullMark = Number(examSubject.full_mark ?? 0);
  const passMark = Number(examSubject.pass_mark ?? 0);
  const rows = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("written_"))
    .map(([key]) => {
      const studentId = key.replace("written_", "");
      const written = toNumber(formData.get(`written_${studentId}`));
      const oral = toNumber(formData.get(`oral_${studentId}`));
      const total = written + oral;
      return {
        student_id: studentId,
        exam_id: examId,
        subject_id: subjectId,
        written_mark: written,
        oral_mark: oral,
        total_mark: total,
        grade: calculateSubjectGrade(total, fullMark, passMark),
        note: emptyToNull(formData.get(`note_${studentId}`))
      };
    });

  if (rows.some((row) => Number(row.written_mark) < 0 || Number(row.oral_mark) < 0)) {
    redirect(resultsRedirectUrl({
      exam: examId,
      subject: subjectId,
      page,
      result_error: "Marks cannot be negative."
    }));
  }

  if (rows.some((row) => Number(row.total_mark) > fullMark)) {
    redirect(resultsRedirectUrl({
      exam: examId,
      subject: subjectId,
      page,
      result_error: "Written and oral marks cannot exceed the subject full mark."
    }));
  }

  if (rows.length) {
    const { error } = await supabase
      .from("student_marks")
      .upsert(rows, { onConflict: "student_id,exam_id,subject_id" });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/results");
  revalidatePath(`/admin/exams/${examId}/results`);
  revalidatePath("/admin/students");
  redirect(resultsRedirectUrl({ exam: examId, subject: subjectId, page, result: "saved" }));
}

export async function createCustomFieldAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const { error } = await supabase.from("custom_field_definitions").insert({
    name: String(formData.get("name") ?? "").trim(),
    label: String(formData.get("label") ?? "").trim(),
    entity_type: String(formData.get("entity_type") ?? "student"),
    field_type: String(formData.get("field_type") ?? "text"),
    options: emptyToNull(formData.get("options")),
    is_required: formData.get("is_required") === "on",
    is_active: formData.get("is_active") === "on"
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings/custom-fields");
}

export async function deleteCustomFieldAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase
    .from("custom_field_definitions")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/settings/custom-fields");
  revalidatePath("/admin/students");
}

export async function saveStudentCustomFieldsAction(studentId: string, formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const rows = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("custom_"))
    .map(([key, value]) => ({
      field_definition_id: key.replace("custom_", ""),
      entity_id: studentId,
      value: String(value ?? "").trim()
    }));

  if (rows.length) {
    const { error } = await supabase
      .from("custom_field_values")
      .upsert(rows, { onConflict: "field_definition_id,entity_id" });
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/students/${studentId}`);
}

export async function addStudentNoteAction(studentId: string, formData: FormData) {
  const { user } = await requirePrincipal();
  const supabase = await createClient();
  const note = String(formData.get("note") ?? "").trim();

  if (!note) return;

  const { error } = await supabase.from("notes").insert({
    student_id: studentId,
    note,
    created_by: user.id
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/students/${studentId}`);
}

export async function deleteStudentNoteAction(studentId: string, formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/students/${studentId}`);
}
