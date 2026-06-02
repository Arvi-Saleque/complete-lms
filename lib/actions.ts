"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePrincipal } from "@/lib/auth";
import { normalizeBanglaText } from "@/lib/bangla/bijoy-to-unicode";
import { deleteAllSchoolData, insertDemoPreset } from "@/lib/demo-preset";
import { calculateSubjectGrade } from "@/lib/results";
import { createClient } from "@/lib/supabase/server";
import { emptyToNull, todayIso, toNumber, parseOptionalInteger } from "@/lib/utils";

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

async function studentRollExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  roll: string,
  classId: string,
  sectionId: string | null,
  sessionYear: string,
  excludeStudentId?: string
) {
  let query = supabase
    .from("students")
    .select("id")
    .eq("roll", roll)
    .eq("class_id", classId)
    .eq("session_year", sessionYear)
    .limit(1);

  query = sectionId ? query.eq("section_id", sectionId) : query.is("section_id", null);

  if (excludeStudentId) {
    query = query.neq("id", excludeStudentId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return Boolean(data?.length);
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

function getBangla(formData: FormData, key: string, existing?: any) {
  if (!formData.has(key)) return existing ? existing[key] : null;
  return emptyToNull(normalizeBanglaText(formData.get(key)));
}

function isValidDate(dateStr?: string | null) {
  if (!dateStr) return true;
  const ts = Date.parse(dateStr);
  return !isNaN(ts);
}

function getString(formData: FormData, key: string, existing?: any) {
  if (!formData.has(key)) return existing ? existing[key] : null;
  return emptyToNull(formData.get(key));
}

function getInt(formData: FormData, key: string, existing?: any) {
  if (!formData.has(key)) return existing ? existing[key] : null;
  return parseOptionalInteger(formData.get(key));
}

function getBool(formData: FormData, key: string, existing?: any) {
  if (!formData.has(key)) return existing ? existing[key] : false;
  return formData.get(key) === "true";
}

function buildStudentPayload(formData: FormData, existingStudent?: any) {
  const sameAsPresent = getBool(formData, "same_as_present_address", existingStudent);

  const classId = formData.has("class_id") ? String(formData.get("class_id")) : existingStudent?.class_id;
  const sectionId = formData.has("section_id") ? emptyToNull(formData.get("section_id")) : existingStudent?.section_id;
  const sessionYear = formData.has("session_year") ? String(formData.get("session_year")).trim() : existingStudent?.session_year;
  const roll = formData.has("roll") ? String(formData.get("roll")).trim() : existingStudent?.roll;
  const status = formData.has("status") ? String(formData.get("status")) : existingStudent?.status;

  const student_name_bn = getBangla(formData, "student_name_bn", existingStudent);
  const student_name_en = getString(formData, "student_name_en", existingStudent);
  
  const present_village = getBangla(formData, "present_village", existingStudent);
  const present_post_office = getBangla(formData, "present_post_office", existingStudent);
  const present_post_code = getString(formData, "present_post_code", existingStudent);
  const present_upazila = getBangla(formData, "present_upazila", existingStudent);
  const present_district = getBangla(formData, "present_district", existingStudent);

  const father_name_bn = getBangla(formData, "father_name_bn", existingStudent);
  const father_name_en = getString(formData, "father_name_en", existingStudent);
  const mother_name_bn = getBangla(formData, "mother_name_bn", existingStudent);
  const mother_name_en = getString(formData, "mother_name_en", existingStudent);
  const father_mobile_1 = getString(formData, "father_mobile_1", existingStudent);
  const father_mobile_2 = getString(formData, "father_mobile_2", existingStudent);
  const mother_mobile_1 = getString(formData, "mother_mobile_1", existingStudent);
  const mother_mobile_2 = getString(formData, "mother_mobile_2", existingStudent);

  const fallbackName = formData.has("name") ? getBangla(formData, "name", existingStudent) : existingStudent?.name;
  const derivedName = student_name_bn ?? student_name_en ?? fallbackName;
  
  if (!derivedName) {
    return { error: "name-required" };
  }

  const dob = getString(formData, "date_of_birth", existingStudent);
  if (!isValidDate(dob)) return { error: "invalid-dob" };
  
  const formReceivedDate = getString(formData, "form_received_date", existingStudent);
  if (!isValidDate(formReceivedDate)) return { error: "invalid-form-received-date" };

  const formSubmittedDate = getString(formData, "form_submitted_date", existingStudent);
  if (!isValidDate(formSubmittedDate)) return { error: "invalid-form-submitted-date" };

  const age_year = getInt(formData, "age_year", existingStudent);
  if (age_year !== null && (age_year < 0 || age_year > 120)) return { error: "invalid-age-year" };

  const age_month = getInt(formData, "age_month", existingStudent);
  if (age_month !== null && (age_month < 0 || age_month > 12)) return { error: "invalid-age-month" };

  const age_day = getInt(formData, "age_day", existingStudent);
  if (age_day !== null && (age_day < 0 || age_day > 31)) return { error: "invalid-age-day" };

  const gender = getString(formData, "gender", existingStudent);
  if (gender !== null && !["male", "female"].includes(gender)) return { error: "invalid-gender" };

  const residential_type = getString(formData, "residential_type", existingStudent);
  const validRes = ["residential", "non_residential", "daycare", "transport", "with_guardian"];
  if (residential_type !== null && !validRes.includes(residential_type)) return { error: "invalid-residential-type" };

  const validStatuses = ["active", "left", "graduated"];
  if (status && !validStatuses.includes(status)) return { error: "invalid-status" };

  const fallbackFather = formData.has("father_name") ? getBangla(formData, "father_name", existingStudent) : existingStudent?.father_name;
  const derivedFather = father_name_bn ?? father_name_en ?? fallbackFather;
  
  const fallbackMother = formData.has("mother_name") ? getBangla(formData, "mother_name", existingStudent) : existingStudent?.mother_name;
  const derivedMother = mother_name_bn ?? mother_name_en ?? fallbackMother;

  const mother_mobile = getString(formData, "mother_mobile", existingStudent);
  
  const fallbackPhone = formData.has("guardian_phone") ? getString(formData, "guardian_phone", existingStudent) : existingStudent?.guardian_phone;
  const derivedPhone = father_mobile_1 ?? mother_mobile_1 ?? mother_mobile ?? father_mobile_2 ?? mother_mobile_2 ?? fallbackPhone;

  const permanent_village = sameAsPresent ? present_village : getBangla(formData, "permanent_village", existingStudent);
  const permanent_post_office = sameAsPresent ? present_post_office : getBangla(formData, "permanent_post_office", existingStudent);
  const permanent_post_code = sameAsPresent ? present_post_code : getString(formData, "permanent_post_code", existingStudent);
  const permanent_upazila = sameAsPresent ? present_upazila : getBangla(formData, "permanent_upazila", existingStudent);
  const permanent_district = sameAsPresent ? present_district : getBangla(formData, "permanent_district", existingStudent);

  let derivedAddress = existingStudent?.address;
  if (formData.has("present_village") || formData.has("present_post_office") || formData.has("present_district") || formData.has("present_upazila") || formData.has("present_post_code")) {
    const presentParts = [present_village, present_post_office, present_post_code, present_upazila, present_district].filter(Boolean);
    if (presentParts.length > 0) {
      derivedAddress = presentParts.join(", ");
    } else {
      derivedAddress = formData.has("address") ? getBangla(formData, "address", existingStudent) : existingStudent?.address;
    }
  } else {
    derivedAddress = formData.has("address") ? getBangla(formData, "address", existingStudent) : existingStudent?.address;
  }

  const payload = {
    class_id: classId,
    section_id: sectionId,
    session_year: sessionYear,
    roll: roll,
    status: status,

    name: derivedName,
    father_name: derivedFather,
    mother_name: derivedMother,
    guardian_phone: derivedPhone,
    address: derivedAddress,

    student_name_bn,
    student_name_en,
    birth_certificate_no: getString(formData, "birth_certificate_no", existingStudent),
    date_of_birth: dob,
    age_day,
    age_month,
    age_year,
    gender,
    tracking_no: getString(formData, "tracking_no", existingStudent),
    residential_type,
    
    form_received_date: formReceivedDate,
    form_submitted_date: formSubmittedDate,

    // Father
    father_name_bn,
    father_name_en,
    father_nid: getString(formData, "father_nid", existingStudent),
    father_mobile_1,
    father_mobile_2,
    father_mobile_3: getString(formData, "father_mobile_3", existingStudent),
    father_whatsapp_number: getString(formData, "father_whatsapp_number", existingStudent),
    father_occupation: getBangla(formData, "father_occupation", existingStudent),
    father_profession_type: getBangla(formData, "father_profession_type", existingStudent),
    father_profession_details: getBangla(formData, "father_profession_details", existingStudent),
    father_education: getBangla(formData, "father_education", existingStudent),

    // Mother
    mother_name_bn,
    mother_name_en,
    mother_nid: getString(formData, "mother_nid", existingStudent),
    mother_mobile,
    mother_mobile_1,
    mother_mobile_2,
    mother_occupation: getBangla(formData, "mother_occupation", existingStudent),
    mother_profession_type: getBangla(formData, "mother_profession_type", existingStudent),
    mother_education: getBangla(formData, "mother_education", existingStudent),

    // Addresses
    present_village,
    present_post_office,
    present_post_code,
    present_upazila,
    present_district,

    permanent_village,
    permanent_post_office,
    permanent_post_code,
    permanent_upazila,
    permanent_district,
    
    docs_birth_certificate: formData.get("docs_birth_certificate") === "on",
    docs_previous_marksheet: formData.get("docs_previous_marksheet") === "on",
    docs_guardian_photo: formData.get("docs_guardian_photo") === "on",
    docs_guardian_nid: formData.get("docs_guardian_nid") === "on",

    same_as_present_address: sameAsPresent
  };

  return { payload };
}

export async function createStudentAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();

  const { payload, error: payloadError } = buildStudentPayload(formData);
  if (payloadError) {
    redirect(`/admin/students/new?error=${payloadError}`);
  }

  if (!(await sectionBelongsToClass(supabase, payload!.class_id, payload!.section_id))) {
    redirect("/admin/students/new?error=section-class-mismatch");
  }

  if (
    await studentRollExists(
      supabase,
      payload!.roll,
      payload!.class_id,
      payload!.section_id,
      payload!.session_year
    )
  ) {
    redirect("/admin/students/new?error=roll-exists");
  }

  const { error } = await supabase.from("students").insert(payload!);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function updateStudentAction(id: string, formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();

  const { data: existingStudent } = await supabase.from("students").select("*").eq("id", id).single();
  if (!existingStudent) throw new Error("Student not found");

  const { payload, error: payloadError } = buildStudentPayload(formData, existingStudent);
  if (payloadError) {
    redirect(`/admin/students/${id}/edit?error=${payloadError}`);
  }

  if (!(await sectionBelongsToClass(supabase, payload!.class_id, payload!.section_id))) {
    redirect(`/admin/students/${id}/edit?error=section-class-mismatch`);
  }

  if (
    await studentRollExists(
      supabase,
      payload!.roll,
      payload!.class_id,
      payload!.section_id,
      payload!.session_year,
      id
    )
  ) {
    redirect(`/admin/students/${id}/edit?error=roll-exists`);
  }

  const { error } = await supabase.from("students").update(payload!).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${id}`);
  redirect(`/admin/students/${id}`);
}

export async function deleteStudentAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("students").update({ status: "left" }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/students");
  revalidatePath("/admin/fees");
  revalidatePath("/admin/attendance");
  revalidatePath("/admin/results");
  revalidatePath(`/admin/students/${id}`);
}

export async function createClassAction(formData: FormData) {
  await requirePrincipal();
  const supabase = await createClient();

  const { error } = await supabase.from("classes").insert({
    name: normalizeBanglaText(formData.get("name")) ?? "",
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
  const name = normalizeBanglaText(formData.get("name")) ?? "";

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
    name: normalizeBanglaText(formData.get("name")) ?? "",
    description: normalizeBanglaText(formData.get("description")),
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
  const studentId = String(formData.get("student_id"));
  const feeTypeId = String(formData.get("fee_type_id"));
  const sessionYear = String(formData.get("session_year") ?? "").trim();
  const month = emptyToNull(formData.get("month"));

  if (amount < 0 || discount < 0 || paid < 0) {
    redirect(feesRedirectUrl({ payment_error: "Fee amounts cannot be negative." }));
  }

  if (discount > amount) {
    redirect(feesRedirectUrl({ payment_error: "Discount cannot exceed fee amount." }));
  }

  if (paid > computed.due) {
    redirect(feesRedirectUrl({ payment_error: "Already paid amount cannot exceed current due amount." }));
  }

  const { data: feeType, error: feeTypeError } = await supabase
    .from("fee_types")
    .select("category,frequency")
    .eq("id", feeTypeId)
    .maybeSingle();
  if (feeTypeError) throw new Error(feeTypeError.message);

  const allowFlexibleDuplicates =
    feeType?.category === "other" || feeType?.frequency === "custom";

  if (!allowFlexibleDuplicates) {
    let duplicateQuery = supabase
      .from("student_fee_records")
      .select("id")
      .eq("student_id", studentId)
      .eq("fee_type_id", feeTypeId)
      .eq("session_year", sessionYear)
      .limit(1);

    duplicateQuery = month ? duplicateQuery.eq("month", month) : duplicateQuery.is("month", null);
    const { data: duplicateRows, error: duplicateError } = await duplicateQuery;
    if (duplicateError) throw new Error(duplicateError.message);
    if (duplicateRows?.length) {
      redirect("/admin/fees/new?error=duplicate-fee");
    }
  }

  const { data, error } = await supabase
    .from("student_fee_records")
    .insert({
      student_id: studentId,
      fee_type_id: feeTypeId,
      amount,
      discount_amount: discount,
      paid_amount: 0,
      due_amount: computed.due,
      month,
      session_year: sessionYear,
      due_date: emptyToNull(formData.get("due_date")),
      status: computed.status,
      note: normalizeBanglaText(formData.get("note"))
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

  const { data: paymentRows, error: paymentError } = await supabase.rpc("add_fee_payment", {
    p_student_fee_record_id: recordId,
    p_amount: amount,
    p_payment_date: paymentDate,
    p_note: normalizeBanglaText(formData.get("note"))
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
  const paymentId = Array.isArray(paymentRows) ? paymentRows[0]?.payment_id : null;
  if (paymentId) {
    redirect(`/admin/fees/receipts/${paymentId}`);
  }

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
      note: normalizeBanglaText(formData.get(`note_${key.replace("status_", "")}`))
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
    name: normalizeBanglaText(formData.get("name")) ?? "",
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
      name: normalizeBanglaText(formData.get("name")) ?? "",
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
      const writtenValue = String(formData.get(`written_${studentId}`) ?? "").trim();
      const oralValue = String(formData.get(`oral_${studentId}`) ?? "").trim();
      const note = normalizeBanglaText(formData.get(`note_${studentId}`));
      if (!writtenValue && !oralValue && !note) return null;
      const written = toNumber(writtenValue);
      const oral = toNumber(oralValue);
      const total = written + oral;
      return {
        student_id: studentId,
        exam_id: examId,
        subject_id: subjectId,
        written_mark: written,
        oral_mark: oral,
        total_mark: total,
        grade: calculateSubjectGrade(total, fullMark, passMark),
        note
      };
    })
    .filter((row) => row !== null);

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
    label: normalizeBanglaText(formData.get("label")) ?? "",
    entity_type: String(formData.get("entity_type") ?? "student"),
    field_type: String(formData.get("field_type") ?? "text"),
    options: normalizeBanglaText(formData.get("options")),
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
      value: normalizeBanglaText(value) ?? ""
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
  const note = normalizeBanglaText(formData.get("note"));

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
