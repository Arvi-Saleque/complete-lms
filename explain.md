# Ikra Academy Admin Panel Workflow

This admin panel has related data. Some records must exist before other records can be created. For example, a student fee record needs a student and a fee type first.

## 1. First Setup

Before using the admin panel:

1. Create the Supabase database schema from `supabase/schema.sql`.
2. Create an admin user in Supabase Auth.
3. Add that auth user to the `profiles` table with role `principal`.
4. Login from `/admin/login`.

The admin panel only allows users with `role = principal`.

## 2. Demo Data Workflow

On `/admin/dashboard` there are two preset buttons.

### Insert fresh demo data

Use this when you want to test the full UI with many records.

This button:

- Deletes existing school records.
- Keeps the principal login/profile.
- Creates demo classes, sections, students, fees, payments, attendance, exams, marks, custom fields, and notes.

### Delete all school data

Use this when you want a clean database.

This button deletes:

- Students
- Classes and sections
- Fee types
- Student fee records
- Payments
- Attendance
- Exams and subjects
- Marks/results
- Custom field definitions and values
- Notes

It does not delete the Supabase Auth user or the `profiles` principal row.

## 3. Student Workflow

Student records depend on classes and optional sections.

Required parent data:

- Class
- Optional section

Flow:

1. Go to `/admin/settings/classes`.
2. Create at least one class.
3. Create sections if needed, for example A or B.
4. Go to `/admin/students/new`.
5. Select class and section.
6. Add student information.
7. Save the student.
8. Open `/admin/students`.
9. Click **Details** to view the full student profile.

Student details show:

- Basic information
- Hajira / attendance
- Fee records
- Payment history
- Exam results
- Custom fields
- Notes

## 4. Fee Workflow

Money-related data should use fee types, not custom fields.

Parent-child relation:

```text
Fee Type -> Student Fee Record -> Payment
Student -> Student Fee Record
```

So before assigning a fee to a student, create the fee type first.

Flow:

1. Go to `/admin/settings/fee-types`.
2. Create fee types such as:
   - Monthly Fee / Beton
   - Admission Fee / Vorti Fee
   - Exam Fee / Porikkhar Fee
   - Session Charge
   - Book Fee
   - Hostel Fee
   - Transport Fee
   - Discount / Vortuki
3. Go to `/admin/fees/new`.
4. Select a student.
5. Select the fee type.
6. Enter amount, discount, paid amount, month/session, and due date.
7. Save the fee record.
8. Go to `/admin/fees`.
9. Add payments against existing fee records.

The system calculates:

- Paid amount
- Due amount
- Status: unpaid, partial, paid

## 5. Attendance / Hajira Workflow

Attendance depends on students and classes.

Parent-child relation:

```text
Class -> Students -> Attendance Records
```

Flow:

1. Go to `/admin/attendance`.
2. Select class.
3. Select date.
4. Load students.
5. Mark each student:
   - present
   - absent
   - late
   - leave
6. Add notes if needed.
7. Save attendance.

Student details show the attendance summary and recent attendance records.

## 6. Exam Result Workflow

Subjects are dynamic. Do not create Subject 1, Subject 2, etc. as fixed fields.

Parent-child relation:

```text
Subject -> Exam Subject
Class -> Exam
Exam + Subject + Student -> Student Mark
```

Flow:

1. Go to `/admin/exams/new`.
2. Create subjects if they do not exist.
3. Create an exam for a class and session.
4. Select the subjects during exam creation if you already know them. Each selected subject is assigned with full mark `100` and minimum pass mark `33` by default.
5. Open the exam details page if you need to add more subjects or change subject setup.
6. Go to `/admin/results` from **Admin -> Edit Results**.
7. Select exam.
8. Select subject, or use the subject tabs.
9. Enter marks for students. The sheet only shows active students from the class selected when the exam was created.
10. Save marks.

Minimum pass mark means the mark required to pass that subject. Student obtained marks are entered later from `/admin/results`.

Student details show exam-wise result rows.

To view or export the final exam result sheet:

1. Go to `/admin/exams`.
2. Click **Results** beside the exam.
3. Review the sheet with student name, subject marks, total, grade, and pass/fail result.
4. Click **Export exam PDF**.
5. In the browser print dialog, choose **Save as PDF**.

## 7. Reports / PDF Export Workflow

The reports page is for activity and performance summaries.

Flow:

1. Go to `/admin/reports`.
2. Select report type:
   - Daily
   - Weekly
   - Monthly
3. Select a date.
4. Click **Load report**.
5. Review:
   - Collection
   - New students
   - Fee records
   - New due
   - Marks entered
   - Attendance counts
   - Payment rows
   - Recent marks
6. Click **Export report PDF**.
7. In the browser print dialog, choose **Save as PDF**.

## 8. Custom Fields Workflow

Custom fields are for non-money extra information only.

Use custom fields for:

- Birth certificate number
- Blood group
- Previous school
- Special notes
- Any extra student metadata

Do not use custom fields for:

- Session charge
- Vortuki
- Beton
- Vorti fee
- Exam fee
- Any other money-related item

Money-related data should be a fee type.

Flow:

1. Go to `/admin/settings/custom-fields`.
2. Create a custom field definition.
3. Open a student details page from `/admin/students`.
4. Open the **Custom Fields** accordion.
5. Fill the custom field values for that student.
6. Click **Save custom fields**.

The Custom Fields settings page creates the field. The student details page stores the value.

## 9. Recommended Real-Life Data Entry Order

For a fresh academy setup, use this order:

1. Create or confirm classes and sections.
2. Create fee types.
3. Create subjects.
4. Add students.
5. Assign student fee records.
6. Add payments.
7. Mark daily attendance.
8. Create exams.
9. Assign subjects to exams.
10. Enter marks/results.
11. Add custom fields only when needed.

## 10. Important Rules

- A student fee cannot exist without a student and fee type.
- A payment cannot exist without a student fee record.
- Attendance cannot exist without a student.
- Marks cannot exist without a student, exam, and subject.
- Exam subjects must be assigned before marks entry is useful.
- Custom fields are not for fees.
- The principal profile must exist, or login will show unauthorized.

## 11. Pages Summary

```text
/admin/login
Login page.

/admin/dashboard
Overview, preset insert/delete buttons, totals, recent payments, unpaid students.

/admin/students
Student list with filters and pagination.

/admin/students/new
Create student.

/admin/students/[id]
Student details with accordion sections.

/admin/students/[id]/edit
Edit student.

/admin/fees
Fee records, payment entry, due tracking.

/admin/fees/new
Assign fee to student.

/admin/settings/fee-types
Create and manage fee types.

/admin/settings/classes
Create and manage classes and sections. Students require a class.

/admin/attendance
Edit daily hajira. This is an input/update page, not only a view page.

/admin/exams
Exam list. Use **Results** beside an exam to view/export result sheet.

/admin/exams/new
Create exam and subjects.

/admin/exams/[id]
Assign subjects to exam.

/admin/results
Edit marks by exam and subject. It shows active students from the exam class.

/admin/reports
Daily, weekly, and monthly activity reports with PDF export.

/admin/settings/custom-fields
Create non-money custom fields.
```
