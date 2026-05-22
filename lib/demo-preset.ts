import type { SupabaseClient } from "@supabase/supabase-js";

const demoSession = "DEMO-2026";
const demoPrefix = "Demo - ";

const classNames = [
  "Demo - Nurani",
  "Demo - Hifz",
  "Demo - Class 1",
  "Demo - Class 2",
  "Demo - Class 3"
];

const feeTypes = [
  ["Demo - Monthly Fee / Beton", "regular", "monthly", 900],
  ["Demo - Admission Fee / Vorti Fee", "admission", "one_time", 2500],
  ["Demo - Exam Fee / Porikkhar Fee", "exam", "exam", 550],
  ["Demo - Session Charge", "regular", "yearly", 1200],
  ["Demo - Book Fee", "one_time", "one_time", 750],
  ["Demo - Hostel Fee", "regular", "monthly", 3500],
  ["Demo - Transport Fee", "regular", "monthly", 1100],
  ["Demo - Discount / Vortuki", "discount", "custom", 0]
] as const;

const subjectNames = [
  ["Demo - Quran", "DQUR"],
  ["Demo - Bangla", "DBAN"],
  ["Demo - English", "DENG"],
  ["Demo - Mathematics", "DMAT"],
  ["Demo - Arabic", "DARB"],
  ["Demo - Hadith", "DHAD"]
] as const;

const studentNames = [
  "Abdullah Rahman",
  "Yusuf Karim",
  "Muhammad Salman",
  "Omar Faruk",
  "Hasan Mahmud",
  "Ibrahim Hossain",
  "Rayhan Islam",
  "Ayman Siddique",
  "Samiul Haque",
  "Tawhid Hasan",
  "Rafi Ahmed",
  "Musa Khan",
  "Sakib Mahdi",
  "Nabil Hossain",
  "Zayed Rahman",
  "Arham Chowdhury",
  "Mahin Islam",
  "Sohan Uddin",
  "Fahim Hasan",
  "Noman Ali",
  "Adnan Mahmud",
  "Rayan Kabir",
  "Hamza Faruk",
  "Saim Rahman",
  "Tahsin Ahmed",
  "Maruf Hossain",
  "Jubayer Hasan",
  "Khalid Islam",
  "Anas Karim",
  "Mahdi Hasan",
  "Foysal Ahmed",
  "Tasin Hossain",
  "Abrar Rahman",
  "Muntasir Ali",
  "Arafat Hossain",
  "Saad Mahmud",
  "Rashid Karim",
  "Shafiq Islam",
  "Tanvir Hasan",
  "Imran Hossain",
  "Mehedi Rahman",
  "Sabbir Ahmed",
  "Kawsar Islam",
  "Nahid Hasan",
  "Shahriar Kabir",
  "Rifat Hossain",
  "Sajid Rahman",
  "Tamim Islam",
  "Siam Mahmud",
  "Wahid Hasan"
];

function must<T>(result: { data: T; error: { message: string } | null }) {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

function byName<T extends { name: string }>(rows: T[]) {
  return new Map(rows.map((row) => [row.name, row]));
}

function chunk<T>(items: T[], size = 100) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function gradeFor(total: number) {
  if (total >= 90) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "A-";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 33) return "D";
  return "F";
}

async function deleteInChunks(
  supabase: SupabaseClient,
  table: string,
  column: string,
  ids: string[]
) {
  for (const idChunk of chunk(ids)) {
    if (idChunk.length) {
      must(await supabase.from(table).delete().in(column, idChunk));
    }
  }
}

async function idsByNamePrefix(supabase: SupabaseClient, table: string) {
  const rows = must(
    await supabase.from(table).select("id").like("name", `${demoPrefix}%`)
  ) as Array<{ id: string }>;
  return rows.map((row) => row.id);
}

export async function deleteDemoPreset(supabase: SupabaseClient) {
  const classIds = await idsByNamePrefix(supabase, "classes");
  const feeTypeIds = await idsByNamePrefix(supabase, "fee_types");
  const subjectIds = await idsByNamePrefix(supabase, "subjects");
  const fieldIds = await idsByNamePrefix(supabase, "custom_field_definitions");

  const studentRows = must(
    await supabase.from("students").select("id").eq("session_year", demoSession)
  ) as Array<{ id: string }>;
  const studentIds = studentRows.map((row) => row.id);

  const examRows = must(
    await supabase.from("exams").select("id").eq("session_year", demoSession)
  ) as Array<{ id: string }>;
  const examIds = examRows.map((row) => row.id);

  const feeRecordIds = new Set<string>();
  for (const studentChunk of chunk(studentIds)) {
    const rows = must(
      await supabase.from("student_fee_records").select("id").in("student_id", studentChunk)
    ) as Array<{ id: string }>;
    rows.forEach((row) => feeRecordIds.add(row.id));
  }
  for (const feeTypeChunk of chunk(feeTypeIds)) {
    const rows = must(
      await supabase.from("student_fee_records").select("id").in("fee_type_id", feeTypeChunk)
    ) as Array<{ id: string }>;
    rows.forEach((row) => feeRecordIds.add(row.id));
  }

  const feeRecordIdList = [...feeRecordIds];
  await deleteInChunks(supabase, "payments", "student_fee_record_id", feeRecordIdList);
  await deleteInChunks(supabase, "student_marks", "student_id", studentIds);
  await deleteInChunks(supabase, "student_marks", "exam_id", examIds);
  await deleteInChunks(supabase, "attendance_records", "student_id", studentIds);
  await deleteInChunks(supabase, "custom_field_values", "entity_id", studentIds);
  await deleteInChunks(supabase, "custom_field_values", "field_definition_id", fieldIds);
  await deleteInChunks(supabase, "notes", "student_id", studentIds);
  await deleteInChunks(supabase, "exam_subjects", "exam_id", examIds);
  await deleteInChunks(supabase, "student_fee_records", "id", feeRecordIdList);
  await deleteInChunks(supabase, "exams", "id", examIds);
  await deleteInChunks(supabase, "students", "id", studentIds);
  await deleteInChunks(supabase, "sections", "class_id", classIds);
  await deleteInChunks(supabase, "classes", "id", classIds);
  await deleteInChunks(supabase, "fee_types", "id", feeTypeIds);
  await deleteInChunks(supabase, "subjects", "id", subjectIds);
  await deleteInChunks(supabase, "custom_field_definitions", "id", fieldIds);
}

export async function deleteAllSchoolData(supabase: SupabaseClient) {
  must(await supabase.from("payments").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("student_marks").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("attendance_records").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("custom_field_values").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("notes").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("exam_subjects").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("student_fee_records").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("exams").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("students").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("sections").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("classes").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("fee_types").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("subjects").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  must(await supabase.from("custom_field_definitions").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
}

export async function insertDemoPreset(supabase: SupabaseClient) {
  await deleteAllSchoolData(supabase);

  must(
    await supabase
      .from("classes")
      .upsert(
        classNames.map((name, index) => ({
          name,
          sort_order: 100 + index,
          is_active: true
        })),
        { onConflict: "name" }
      )
  );
  const classes = must(
    await supabase.from("classes").select("id,name").in("name", classNames)
  ) as Array<{ id: string; name: string }>;
  const classMap = byName(classes);

  const sectionRows = classNames.flatMap((className) =>
    ["A", "B"].map((section) => ({
      class_id: classMap.get(className)!.id,
      name: section,
      is_active: true
    }))
  );
  must(await supabase.from("sections").upsert(sectionRows, { onConflict: "class_id,name" }));
  const sections = must(
    await supabase.from("sections").select("id,name,class_id").in("class_id", classes.map((row) => row.id))
  ) as Array<{ id: string; name: string; class_id: string }>;

  must(
    await supabase.from("fee_types").upsert(
      feeTypes.map(([name, category, frequency, defaultAmount]) => ({
        name,
        description: `${name.replace(demoPrefix, "")} for demo checking`,
        category,
        frequency,
        default_amount: defaultAmount,
        is_active: true
      })),
      { onConflict: "name" }
    )
  );
  const feeRows = must(
    await supabase.from("fee_types").select("id,name,default_amount").in("name", feeTypes.map(([name]) => name))
  ) as Array<{ id: string; name: string; default_amount: number }>;
  const feeMap = byName(feeRows);

  must(
    await supabase.from("subjects").upsert(
      subjectNames.map(([name, code]) => ({ name, code })),
      { onConflict: "name" }
    )
  );
  const subjects = must(
    await supabase.from("subjects").select("id,name").in("name", subjectNames.map(([name]) => name))
  ) as Array<{ id: string; name: string }>;

  const students = studentNames.map((name, index) => {
    const className = classNames[index % classNames.length];
    const classId = classMap.get(className)!.id;
    const sectionName = index % 2 === 0 ? "A" : "B";
    const section = sections.find((row) => row.class_id === classId && row.name === sectionName);
    return {
      name,
      roll: `D${String(index + 1).padStart(3, "0")}`,
      class_id: classId,
      section_id: section?.id ?? null,
      session_year: demoSession,
      father_name: `Demo Guardian ${index + 1}`,
      mother_name: `Demo Mother ${index + 1}`,
      guardian_phone: `01999${String(index + 1).padStart(6, "0")}`,
      address: `${index + 10} Demo Road, Dhaka`,
      admission_date: dateOffset(-((index % 20) + 1)),
      status: index % 17 === 0 ? "left" : "active"
    };
  });
  must(await supabase.from("students").upsert(students, { onConflict: "roll,class_id,session_year" }));
  const studentRows = must(
    await supabase
      .from("students")
      .select("id,name,roll,class_id,status")
      .eq("session_year", demoSession)
  ) as Array<{ id: string; name: string; roll: string; class_id: string; status: string }>;

  const feeRecordRows = studentRows.flatMap((student, index) => {
    const monthly = Number(feeMap.get("Demo - Monthly Fee / Beton")!.default_amount);
    const exam = Number(feeMap.get("Demo - Exam Fee / Porikkhar Fee")!.default_amount);
    const session = Number(feeMap.get("Demo - Session Charge")!.default_amount);
    const book = Number(feeMap.get("Demo - Book Fee")!.default_amount);
    const transport = Number(feeMap.get("Demo - Transport Fee")!.default_amount);
    const hostel = Number(feeMap.get("Demo - Hostel Fee")!.default_amount);
    const paidMonthly = index % 3 === 0 ? monthly : index % 3 === 1 ? 400 : 0;
    const paidExam = index % 4 === 0 ? exam : 0;
    const discount = index % 5 === 0 ? 150 : 0;
    const baseRows = [
      {
        student_id: student.id,
        fee_type_id: feeMap.get("Demo - Monthly Fee / Beton")!.id,
        amount: monthly,
        discount_amount: discount,
        paid_amount: paidMonthly,
        due_amount: Math.max(monthly - discount - paidMonthly, 0),
        month: ["January", "February", "March", "April"][index % 4],
        session_year: demoSession,
        due_date: dateOffset((index % 10) - 5),
        status: Math.max(monthly - discount - paidMonthly, 0) === 0 ? "paid" : paidMonthly > 0 ? "partial" : "unpaid",
        note: "Demo monthly fee"
      },
      {
        student_id: student.id,
        fee_type_id: feeMap.get("Demo - Exam Fee / Porikkhar Fee")!.id,
        amount: exam,
        discount_amount: 0,
        paid_amount: paidExam,
        due_amount: exam - paidExam,
        month: null,
        session_year: demoSession,
        due_date: dateOffset((index % 12) + 3),
        status: exam - paidExam === 0 ? "paid" : paidExam > 0 ? "partial" : "unpaid",
        note: "Demo exam fee"
      },
      {
        student_id: student.id,
        fee_type_id: feeMap.get("Demo - Session Charge")!.id,
        amount: session,
        discount_amount: 0,
        paid_amount: index % 2 === 0 ? session : 0,
        due_amount: index % 2 === 0 ? 0 : session,
        month: null,
        session_year: demoSession,
        due_date: dateOffset((index % 14) - 7),
        status: index % 2 === 0 ? "paid" : "unpaid",
        note: "Demo session charge"
      }
    ];

    if (index % 3 === 0) {
      baseRows.push({
        student_id: student.id,
        fee_type_id: feeMap.get("Demo - Book Fee")!.id,
        amount: book,
        discount_amount: 0,
        paid_amount: index % 6 === 0 ? book : 250,
        due_amount: index % 6 === 0 ? 0 : book - 250,
        month: null,
        session_year: demoSession,
        due_date: dateOffset((index % 9) + 1),
        status: index % 6 === 0 ? "paid" : "partial",
        note: "Demo book fee"
      });
    }

    if (index % 4 === 0) {
      const paidTransport = index % 8 === 0 ? transport : 0;
      baseRows.push({
        student_id: student.id,
        fee_type_id: feeMap.get("Demo - Transport Fee")!.id,
        amount: transport,
        discount_amount: 0,
        paid_amount: paidTransport,
        due_amount: transport - paidTransport,
        month: ["January", "February", "March", "April"][index % 4],
        session_year: demoSession,
        due_date: dateOffset((index % 10) - 3),
        status: paidTransport === transport ? "paid" : "unpaid",
        note: "Demo transport fee"
      });
    }

    if (index % 10 === 0) {
      baseRows.push({
        student_id: student.id,
        fee_type_id: feeMap.get("Demo - Hostel Fee")!.id,
        amount: hostel,
        discount_amount: 0,
        paid_amount: 1500,
        due_amount: hostel - 1500,
        month: ["January", "February", "March", "April"][index % 4],
        session_year: demoSession,
        due_date: dateOffset(4),
        status: "partial",
        note: "Demo hostel fee"
      });
    }

    return baseRows;
  });
  must(await supabase.from("student_fee_records").insert(feeRecordRows));
  const feeRecords = must(
    await supabase
      .from("student_fee_records")
      .select("id,student_id,fee_type_id,paid_amount")
      .eq("session_year", demoSession)
  ) as Array<{ id: string; student_id: string; fee_type_id: string; paid_amount: number }>;

  const paymentRows = feeRecords
    .filter((record) => Number(record.paid_amount) > 0)
    .map((record, index) => ({
      student_fee_record_id: record.id,
      amount: record.paid_amount,
      payment_date: dateOffset(-(index % 21)),
      payment_method: index % 3 === 0 ? "cash" : index % 3 === 1 ? "bkash" : "bank",
      receipt_no: `DEMO-R-${String(index + 1).padStart(4, "0")}`,
      note: "Demo receipt"
    }));
  must(await supabase.from("payments").insert(paymentRows));

  const attendanceRows = studentRows.flatMap((student, studentIndex) =>
    Array.from({ length: 12 }).map((_, dayIndex) => ({
      student_id: student.id,
      date: dateOffset(-dayIndex),
      status:
        (studentIndex + dayIndex) % 13 === 0
          ? "absent"
          : (studentIndex + dayIndex) % 9 === 0
            ? "late"
            : (studentIndex + dayIndex) % 17 === 0
              ? "leave"
              : "present",
      note: (studentIndex + dayIndex) % 13 === 0 ? "Demo absence note" : null
    }))
  );
  must(await supabase.from("attendance_records").upsert(attendanceRows, { onConflict: "student_id,date" }));

  const examRows = classNames.flatMap((className) => [
    {
      name: `${className} First Term`,
      class_id: classMap.get(className)!.id,
      session_year: demoSession,
      start_date: dateOffset(-30),
      end_date: dateOffset(-24)
    },
    {
      name: `${className} Final Exam`,
      class_id: classMap.get(className)!.id,
      session_year: demoSession,
      start_date: dateOffset(30),
      end_date: dateOffset(37)
    }
  ]);
  must(await supabase.from("exams").insert(examRows));
  const exams = must(
    await supabase.from("exams").select("id,name,class_id").eq("session_year", demoSession)
  ) as Array<{ id: string; name: string; class_id: string }>;

  const examSubjectRows = exams.flatMap((exam) =>
    subjects.map((subject) => ({
      exam_id: exam.id,
      subject_id: subject.id,
      full_mark: 100,
      pass_mark: 33
    }))
  );
  must(await supabase.from("exam_subjects").insert(examSubjectRows));

  const markRows = exams.flatMap((exam, examIndex) => {
    const classStudents = studentRows.filter((student) => student.class_id === exam.class_id);
    return classStudents.flatMap((student, studentIndex) =>
      subjects.map((subject, subjectIndex) => {
        const written = 25 + ((studentIndex * 7 + subjectIndex * 5 + examIndex * 3) % 65);
        const oral = subjectIndex === 0 ? 5 + (studentIndex % 10) : 0;
        const total = Math.min(written + oral, 100);
        return {
          student_id: student.id,
          exam_id: exam.id,
          subject_id: subject.id,
          written_mark: written,
          oral_mark: oral,
          total_mark: total,
          grade: gradeFor(total),
          note: total < 33 ? "Below minimum pass mark" : total < 55 ? "Needs improvement" : null
        };
      })
    );
  });
  must(await supabase.from("student_marks").insert(markRows));

  const customFields = must(
    await supabase
      .from("custom_field_definitions")
      .upsert(
        [
          {
            name: "demo_birth_certificate_no",
            label: "Demo Birth Certificate No",
            entity_type: "student",
            field_type: "text",
            is_required: false,
            is_active: true
          },
          {
            name: "demo_nid",
            label: "Demo NID",
            entity_type: "student",
            field_type: "number",
            is_required: false,
            is_active: true
          },
          {
            name: "demo_blood_group",
            label: "Demo Blood Group",
            entity_type: "student",
            field_type: "dropdown",
            options: "A+,A-,B+,B-,O+,O-,AB+,AB-",
            is_required: false,
            is_active: true
          },
          {
            name: "demo_previous_school",
            label: "Demo Previous School",
            entity_type: "student",
            field_type: "text",
            is_required: false,
            is_active: true
          }
        ],
        { onConflict: "name" }
      )
      .select("id,name")
  ) as Array<{ id: string; name: string }>;
  const fieldMap = byName(customFields);
  const customValueRows = studentRows.slice(0, 30).flatMap((student, index) => [
    {
      field_definition_id: fieldMap.get("demo_birth_certificate_no")!.id,
      entity_id: student.id,
      value: `DEMO-BC-${String(index + 1).padStart(5, "0")}`
    },
    {
      field_definition_id: fieldMap.get("demo_nid")!.id,
      entity_id: student.id,
      value: `200${String(index + 1).padStart(7, "0")}`
    },
    {
      field_definition_id: fieldMap.get("demo_blood_group")!.id,
      entity_id: student.id,
      value: ["A+", "B+", "O+", "AB+"][index % 4]
    },
    {
      field_definition_id: fieldMap.get("demo_previous_school")!.id,
      entity_id: student.id,
      value: index % 2 === 0 ? "Demo Ideal Madrasa" : "Demo Primary School"
    }
  ]);
  must(await supabase.from("custom_field_values").upsert(customValueRows, { onConflict: "field_definition_id,entity_id" }));

  must(
    await supabase.from("notes").insert(
      studentRows.slice(0, 20).map((student, index) => ({
        student_id: student.id,
        note:
          index % 2 === 0
            ? "Demo note: guardian requested a monthly update."
            : "Demo note: teacher flagged this student for follow-up."
      }))
    )
  );
}

export { demoSession };
