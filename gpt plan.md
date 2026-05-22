Build a simple but scalable Madrasa Student Admin Panel using Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth, and Supabase Postgres.

The app should be hosted on Vercel later, so avoid local-only storage and avoid hardcoded data. All data must come from the database.

Main goal:
Create an admin panel where a principal/teacher can manage students, attendance/hajira, fees/accounts, payments, dynamic fee types, custom fields, and exam results.

Core requirements:

1. Authentication
- Create /admin/login page.
- Use Supabase Auth email/password login.
- Protect all /admin routes.
- Add role support: principal, teacher, accountant, viewer.
- For MVP, principal can access everything.

2. Student Management
Create student CRUD:
- name
- roll
- class
- section
- session/year
- fatherName
- motherName
- guardianPhone
- address
- admissionDate
- status: active/left/graduated

Pages:
- /admin/students
- /admin/students/new
- /admin/students/[id]
- /admin/students/[id]/edit

Student list UI:
- searchable table
- filter by class/session/status
- action button to view details

Student details UI:
Use a clean card + accordion layout:
- Basic Information
- Hajira / Attendance
- Fee Records
- Payment History
- Exam Results
- Custom Fields
- Notes

3. Fee System
Do not hardcode fee columns like beton, vorti, exam fee, session charge, etc.
Create a dynamic FeeType model.

Default fee types:
- Monthly Fee / Beton
- Admission Fee / Vorti Fee
- Exam Fee / Porikkhar Fee
- Session Charge
- Book Fee
- Hostel Fee
- Transport Fee
- Other Fee
- Discount / Vortuki

Fee type fields:
- name
- description
- category: regular/admission/exam/one_time/discount/other
- defaultAmount
- frequency: monthly/yearly/one_time/exam/custom
- isActive

Student fee record fields:
- studentId
- feeTypeId
- amount
- discountAmount
- paidAmount
- dueAmount
- month
- sessionYear
- dueDate
- status: unpaid/partial/paid
- note

Payment fields:
- studentFeeRecordId
- amount
- paymentDate
- paymentMethod
- receiptNo
- note

Fee UI:
- /admin/fees
- /admin/fees/new
- /admin/settings/fee-types

Fee list:
Show table with student name, class, fee type, total amount, paid, due, status.
Add accordion expansion for full breakdown.

4. Attendance / Hajira
Create attendance_records table:
- studentId
- date
- status: present/absent/late/leave
- note

Attendance page:
- /admin/attendance
- Select class
- Select date
- Show students in a table
- Present/Absent toggle
- Save attendance

Student details page should show attendance summary.

5. Exam Result System
Do not hardcode Subject 1, Subject 2, Subject 3.
Create dynamic exam and subject system.

Tables:
- exams: name, classId, sessionYear, startDate, endDate
- subjects: name, code
- exam_subjects: examId, subjectId, fullMark, passMark
- student_marks: studentId, examId, subjectId, writtenMark, oralMark, totalMark, grade, note

Pages:
- /admin/exams
- /admin/exams/new
- /admin/exams/[id]
- /admin/results

Marks entry UI:
- Select exam
- Select class
- Select subject
- Show all students in a table
- Input marks
- Save marks

Student details page should show exam-wise result accordion.

6. Custom Fields
Create custom fields for future extra data.
Use this for non-money information only.
Money-related things must be fee types, not custom fields.

custom_field_definitions:
- name
- label
- entityType: student/fee/exam
- fieldType: text/number/date/dropdown/boolean
- options
- isRequired
- isActive

custom_field_values:
- fieldDefinitionId
- entityId
- value

Create /admin/settings/custom-fields page.

7. Dashboard
Create /admin/dashboard with:
- total students
- active students
- today’s collection
- total due
- present today
- recent payments
- unpaid students
- upcoming exam

8. UI Design
Keep the UI clean, simple, and professional.
Use:
- sidebar navigation
- topbar
- cards
- tables
- accordions
- dialogs/forms
- badges for paid/unpaid/partial
- responsive layout

Do not overdesign with too many effects.
This is an admin panel, so clarity is more important than decoration.

9. Technical Rules
- Use TypeScript strictly.
- Use reusable components.
- No hardcoded demo data in final pages.
- All table data must come from Supabase.
- Use server-side protected routes where possible.
- Add loading states, empty states, and error states.
- Add form validation.
- Keep database schema scalable.

First implement:
1. Supabase connection
2. Auth
3. Admin layout
4. Student CRUD
5. Fee types
6. Student fee records
7. Student details accordion
Then continue with attendance and exam results.