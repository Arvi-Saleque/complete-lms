export const languages = ["en", "bn"] as const;

export type AdminLanguage = (typeof languages)[number];

export const defaultLanguage: AdminLanguage = "en";

export function isAdminLanguage(value: unknown): value is AdminLanguage {
  return value === "en" || value === "bn";
}

const bn = {
  "Ikra Academy": "ইকরা একাডেমি",
  "Ikra Academy Admin": "ইকরা একাডেমি অ্যাডমিন",
  "Student, fees, attendance, and results admin panel":
    "শিক্ষার্থী, ফি, হাজিরা এবং ফলাফলের অ্যাডমিন প্যানেল",
  "Admin panel": "অ্যাডমিন প্যানেল",
  "Signed in as {name}": "{name} হিসেবে সাইন ইন করেছেন",
  Logout: "লগআউট",
  View: "দেখুন",
  Admin: "অ্যাডমিন",
  Settings: "সেটিংস",
  Language: "ভাষা",
  English: "ইংরেজি",
  Bangla: "বাংলা",
  Dashboard: "ড্যাশবোর্ড",
  Students: "শিক্ষার্থী",
  Fees: "ফি",
  Exams: "পরীক্ষা",
  Reports: "রিপোর্ট",
  "Add Student": "শিক্ষার্থী যোগ করুন",
  "Edit Hajira": "হাজিরা সম্পাদনা",
  "Edit Results": "ফলাফল সম্পাদনা",
  Classes: "ক্লাস",
  "Fee Types": "ফির ধরন",
  "Custom Fields": "কাস্টম ফিল্ড",
  "Daily snapshot for students, fees, hajira, and exams.":
    "শিক্ষার্থী, ফি, হাজিরা এবং পরীক্ষার দৈনিক সারাংশ।",
  "Demo preset": "ডেমো ডেটা",
  "Insert a fresh demo dataset for client review. These buttons delete all school records first, but keep the principal login/profile.":
    "ক্লায়েন্ট রিভিউয়ের জন্য নতুন ডেমো ডেটা দিন। এই বাটনগুলো আগে সব স্কুল রেকর্ড মুছে ফেলবে, তবে প্রিন্সিপালের লগইন/প্রোফাইল থাকবে।",
  "Insert fresh demo data": "নতুন ডেমো ডেটা দিন",
  "Delete all school data": "সব স্কুল ডেটা মুছুন",
  "Demo preset inserted. Check students, fees, attendance, exams, and results.":
    "ডেমো ডেটা যুক্ত হয়েছে। শিক্ষার্থী, ফি, হাজিরা, পরীক্ষা এবং ফলাফল দেখুন।",
  "All school records were deleted. Principal login is still available.":
    "সব স্কুল রেকর্ড মুছে ফেলা হয়েছে। প্রিন্সিপালের লগইন এখনো আছে।",
  "Total students": "মোট শিক্ষার্থী",
  "Active students": "সক্রিয় শিক্ষার্থী",
  "Today's collection": "আজকের আদায়",
  "Total due": "মোট বকেয়া",
  "Present today": "আজ উপস্থিত",
  "Recent payments": "সাম্প্রতিক পেমেন্ট",
  Student: "শিক্ষার্থী",
  Fee: "ফি",
  Amount: "পরিমাণ",
  Date: "তারিখ",
  Unknown: "অজানা",
  "No recent payments yet.": "এখনো কোনো সাম্প্রতিক পেমেন্ট নেই।",
  "Unpaid students": "বকেয়া শিক্ষার্থী",
  Due: "বকেয়া",
  Status: "স্ট্যাটাস",
  "No unpaid fee records.": "কোনো বকেয়া ফি রেকর্ড নেই।",
  "Upcoming exam": "আসন্ন পরীক্ষা",
  "for {className} starts on {date}.": "{className}-এর জন্য {date} তারিখে শুরু হবে।",
  "No upcoming exam is scheduled.": "কোনো আসন্ন পরীক্ষা নির্ধারিত নেই।",
  "This will create a fresh demo preset. If any school records already exist, they will be cleared first. Continue?":
    "এটি নতুন ডেমো ডেটা তৈরি করবে। কোনো স্কুল রেকর্ড থাকলে আগে সেগুলো মুছে যাবে। চালিয়ে যাবেন?",
  "Final confirmation: insert the fresh demo data now?":
    "চূড়ান্ত নিশ্চিতকরণ: এখন নতুন ডেমো ডেটা যোগ করবেন?",
  "This will delete all school records. Continue?":
    "এটি সব স্কুল রেকর্ড মুছে ফেলবে। চালিয়ে যাবেন?",
  "Final confirmation: delete all school records now?":
    "চূড়ান্ত নিশ্চিতকরণ: এখন সব স্কুল রেকর্ড মুছবেন?",
  "Search, filter, and open full student records.":
    "শিক্ষার্থী রেকর্ড খুঁজুন, ফিল্টার করুন এবং খুলুন।",
  "Add student": "শিক্ষার্থী যোগ করুন",
  "Search name or roll": "নাম বা রোল খুঁজুন",
  "All classes": "সব ক্লাস",
  Session: "সেশন",
  "All statuses": "সব স্ট্যাটাস",
  Active: "সক্রিয়",
  Left: "চলে গেছে",
  Graduated: "স্নাতক",
  Filter: "ফিল্টার",
  Name: "নাম",
  Roll: "রোল",
  Class: "ক্লাস",
  Section: "শাখা",
  Actions: "অ্যাকশন",
  Details: "বিস্তারিত",
  "Mark left": "চলে গেছে করুন",
  "No students found. Add a student or change the filters.":
    "কোনো শিক্ষার্থী পাওয়া যায়নি। শিক্ষার্থী যোগ করুন বা ফিল্টার পরিবর্তন করুন।",
  "Mark {name} as left? Fees, payments, attendance, marks, and notes will be kept.":
    "{name}-কে চলে গেছে হিসেবে চিহ্নিত করবেন? ফি, পেমেন্ট, হাজিরা, নম্বর এবং নোট রাখা হবে।",
  "Final confirmation: mark this student as left?":
    "চূড়ান্ত নিশ্চিতকরণ: এই শিক্ষার্থীকে চলে গেছে হিসেবে চিহ্নিত করবেন?",
  "Create a new student profile.": "নতুন শিক্ষার্থী প্রোফাইল তৈরি করুন।",
  "Create student": "শিক্ষার্থী তৈরি করুন",
  "The selected section does not belong to the selected class. Please choose a section from that class.":
    "নির্বাচিত শাখাটি নির্বাচিত ক্লাসের নয়। অনুগ্রহ করে সেই ক্লাসের একটি শাখা নির্বাচন করুন।",
  "Roll number already exists for this class, section, and session.":
    "এই ক্লাস, শাখা এবং সেশনে রোল নম্বরটি আগে থেকেই আছে।",
  "Edit Student": "শিক্ষার্থী সম্পাদনা",
  "Update {name}'s profile.": "{name}-এর প্রোফাইল আপডেট করুন।",
  "Save changes": "পরিবর্তন সংরক্ষণ করুন",
  "Student name": "শিক্ষার্থীর নাম",
  "Select class": "ক্লাস নির্বাচন করুন",
  "No classes found. Create one in": "কোনো ক্লাস পাওয়া যায়নি। তৈরি করুন",
  "Classes & Sections": "ক্লাস ও শাখা",
  "No section": "শাখা নেই",
  "Session / Year": "সেশন / বছর",
  "Father name": "পিতার নাম",
  "Mother name": "মাতার নাম",
  "Guardian phone": "অভিভাবকের ফোন",
  "Admission date": "ভর্তির তারিখ",
  Address: "ঠিকানা",
  "Edit student": "শিক্ষার্থী সম্পাদনা",
  "Roll {roll} - {className} - Session {session}":
    "রোল {roll} - {className} - সেশন {session}",
  "No class": "ক্লাস নেই",
  "Basic Information": "মৌলিক তথ্য",
  Father: "পিতা",
  Mother: "মাতা",
  Phone: "ফোন",
  "Hajira / Attendance": "হাজিরা / উপস্থিতি",
  "Fee Statement": "ফি বিবরণী",
  "Print statement": "বিবরণী প্রিন্ট করুন",
  "Total amount": "মোট পরিমাণ",
  "Total discount": "মোট ছাড়",
  "Total paid": "মোট পরিশোধ",
  Month: "মাস",
  Discount: "ছাড়",
  Paid: "পরিশোধ",
  "Payment history": "পেমেন্ট ইতিহাস",
  Receipt: "রসিদ",
  Note: "নোট",
  "No fee records yet.": "এখনো কোনো ফি রেকর্ড নেই।",
  "Payment History": "পেমেন্ট ইতিহাস",
  "Exam Results": "পরীক্ষার ফলাফল",
  "Total {obtained}/{full} - {percentage} - Grade {grade}":
    "মোট {obtained}/{full} - {percentage} - গ্রেড {grade}",
  Subject: "বিষয়",
  Written: "লিখিত",
  Oral: "মৌখিক",
  Total: "মোট",
  Grade: "গ্রেড",
  "No exam results yet.": "এখনো কোনো পরীক্ষার ফলাফল নেই।",
  "Select value": "মান নির্বাচন করুন",
  Yes: "হ্যাঁ",
  No: "না",
  "Save custom fields": "কাস্টম ফিল্ড সংরক্ষণ করুন",
  "No student custom fields defined. Create fields in Admin > Custom Fields first.":
    "শিক্ষার্থীর কোনো কাস্টম ফিল্ড নেই। আগে Admin > Custom Fields থেকে ফিল্ড তৈরি করুন।",
  Notes: "নোট",
  "Write a note about this student": "এই শিক্ষার্থী সম্পর্কে নোট লিখুন",
  "Add note": "নোট যোগ করুন",
  Delete: "মুছুন",
  "Delete this note?": "এই নোট মুছবেন?",
  "Final confirmation: delete this note permanently?":
    "চূড়ান্ত নিশ্চিতকরণ: এই নোট স্থায়ীভাবে মুছবেন?",
  "No notes yet.": "এখনো কোনো নোট নেই।",
  "Back to students": "শিক্ষার্থীতে ফিরে যান",
  "Track student dues, partial payments, and paid fees.":
    "শিক্ষার্থীর বকেয়া, আংশিক পেমেন্ট এবং পরিশোধিত ফি ট্র্যাক করুন।",
  "Add fee": "ফি যোগ করুন",
  "Payment saved and fee balance updated.": "পেমেন্ট সংরক্ষিত হয়েছে এবং ফি ব্যালেন্স আপডেট হয়েছে।",
  "Total billed": "মোট বিল",
  "Total collected": "মোট আদায়",
  "Unpaid records": "অপরিশোধিত রেকর্ড",
  "Partial records": "আংশিক রেকর্ড",
  Filters: "ফিল্টার",
  "All sections": "সব শাখা",
  "Session / year": "সেশন / বছর",
  "All fee types": "সব ফির ধরন",
  Unpaid: "অপরিশোধিত",
  Partial: "আংশিক",
  "All months": "সব মাস",
  "Student name or roll": "শিক্ষার্থীর নাম বা রোল",
  Apply: "প্রয়োগ",
  Clear: "মুছুন",
  Payment: "পেমেন্ট",
  "Roll {roll} - {className}": "রোল {roll} - {className}",
  "Month: {month} - Session: {session} - Due: {due}":
    "মাস: {month} - সেশন: {session} - বকেয়া তারিখ: {due}",
  "Saving...": "সংরক্ষণ হচ্ছে...",
  "Add payment": "পেমেন্ট যোগ করুন",
  "Fully paid": "সম্পূর্ণ পরিশোধিত",
  "Delete this fee record? Related payments will also be removed.":
    "এই ফি রেকর্ড মুছবেন? সংশ্লিষ্ট পেমেন্টও মুছে যাবে।",
  "Final confirmation: delete this fee record permanently?":
    "চূড়ান্ত নিশ্চিতকরণ: এই ফি রেকর্ড স্থায়ীভাবে মুছবেন?",
  "No fee records match these filters.": "এই ফিল্টারে কোনো ফি রেকর্ড পাওয়া যায়নি।",
  "Create Fee Record": "ফি রেকর্ড তৈরি করুন",
  "Assign a dynamic fee to a student. Amount can come from the selected fee type.":
    "একজন শিক্ষার্থীকে ডাইনামিক ফি বরাদ্দ করুন। নির্বাচিত ফির ধরন থেকে পরিমাণ আসতে পারে।",
  "This fee record already exists for this student, fee type, month, and session.":
    "এই শিক্ষার্থী, ফির ধরন, মাস এবং সেশনের জন্য ফি রেকর্ড আগে থেকেই আছে।",
  "Select student": "শিক্ষার্থী নির্বাচন করুন",
  "Roll {roll}": "রোল {roll}",
  "Fee type": "ফির ধরন",
  "Select fee": "ফি নির্বাচন করুন",
  "Selecting a fee type fills the amount from that fee type's default amount.":
    "ফির ধরন নির্বাচন করলে ওই ফির ডিফল্ট পরিমাণ বসে যাবে।",
  "Discount / Vortuki": "ছাড় / ভর্তুকি",
  "Already paid": "আগে পরিশোধিত",
  "No month / one-time": "মাস নেই / এককালীন",
  "Session year": "সেশন বছর",
  "Due date": "বকেয়া তারিখ",
  "Create fee record": "ফি রেকর্ড তৈরি করুন",
  "Payment Receipt": "পেমেন্ট রসিদ",
  "Receipt {receiptNo}": "রসিদ {receiptNo}",
  "Print receipt": "রসিদ প্রিন্ট করুন",
  "Back to fees": "ফিতে ফিরে যান",
  "Student details": "শিক্ষার্থীর বিস্তারিত",
  "Official payment receipt": "অফিশিয়াল পেমেন্ট রসিদ",
  "Receipt number": "রসিদ নম্বর",
  "Payment date": "পেমেন্ট তারিখ",
  "Received by": "গ্রহণ করেছেন",
  Principal: "প্রিন্সিপাল",
  "Payment method": "পেমেন্ট পদ্ধতি",
  "Class / Section": "ক্লাস / শাখা",
  "Month / Session": "মাস / সেশন",
  "Payment amount": "পেমেন্ট পরিমাণ",
  "Mark or update daily attendance by class and date.":
    "ক্লাস ও তারিখ অনুযায়ী দৈনিক হাজিরা দিন বা আপডেট করুন।",
  "Edit Hajira / Attendance": "হাজিরা / উপস্থিতি সম্পাদনা",
  "Select a class and date to load the attendance sheet.":
    "হাজিরা শিট লোড করতে ক্লাস ও তারিখ নির্বাচন করুন।",
  "No active students found for {className}{sectionText}.":
    "{className}{sectionText}-এর জন্য কোনো সক্রিয় শিক্ষার্থী পাওয়া যায়নি।",
  ", section {sectionName}": ", শাখা {sectionName}",
  "this class": "এই ক্লাস",
  "Load students": "শিক্ষার্থী লোড করুন",
  "Loading students...": "শিক্ষার্থী লোড হচ্ছে...",
  "Save attendance": "হাজিরা সংরক্ষণ করুন",
  "Saving attendance...": "হাজিরা সংরক্ষণ হচ্ছে...",
  "Showing all {count} active students for {className}{sectionText}.":
    "{className}{sectionText}-এর সব {count} জন সক্রিয় শিক্ষার্থী দেখানো হচ্ছে।",
  "the selected class": "নির্বাচিত ক্লাস",
  "Activity Reports": "কার্যক্রম রিপোর্ট",
  "Daily, weekly, and monthly activity/performance summary.":
    "দৈনিক, সাপ্তাহিক এবং মাসিক কার্যক্রম/পারফরম্যান্স সারাংশ।",
  Daily: "দৈনিক",
  Weekly: "সাপ্তাহিক",
  Monthly: "মাসিক",
  "Load report": "রিপোর্ট লোড করুন",
  "Export report PDF": "রিপোর্ট PDF এক্সপোর্ট করুন",
  "{period} Report": "{period} রিপোর্ট",
  "{start} to {end}": "{start} থেকে {end}",
  Collection: "আদায়",
  "New students": "নতুন শিক্ষার্থী",
  "Fee records": "ফি রেকর্ড",
  "New due": "নতুন বকেয়া",
  "Marks entered": "নম্বর এন্ট্রি",
  Payments: "পেমেন্ট",
  "No payments found for this period.": "এই সময়ে কোনো পেমেন্ট পাওয়া যায়নি।",
  "Recent Marks": "সাম্প্রতিক নম্বর",
  Mark: "নম্বর",
  "No marks found for this period.": "এই সময়ে কোনো নম্বর পাওয়া যায়নি।",
  "Edit Results / Marks Entry": "ফলাফল / নম্বর এন্ট্রি সম্পাদনা",
  "Select an exam and subject, then enter marks for active students in that exam class.":
    "পরীক্ষা ও বিষয় নির্বাচন করে সেই পরীক্ষার ক্লাসের সক্রিয় শিক্ষার্থীদের নম্বর দিন।",
  "Marks saved. Total, grade, and pass/fail are calculated automatically.":
    "নম্বর সংরক্ষিত হয়েছে। মোট, গ্রেড এবং পাশ/ফেল স্বয়ংক্রিয়ভাবে হিসাব হয়েছে।",
  "Select exam": "পরীক্ষা নির্বাচন করুন",
  "Select subject": "বিষয় নির্বাচন করুন",
  "Load marks sheet": "নম্বর শিট লোড করুন",
  "Select an exam and subject to load the marks entry sheet.":
    "নম্বর এন্ট্রি শিট লোড করতে পরীক্ষা ও বিষয় নির্বাচন করুন।",
  "No subjects are assigned to this exam yet. Open the exam setup page and assign subjects first.":
    "এই পরীক্ষায় এখনো কোনো বিষয় বরাদ্দ নেই। আগে পরীক্ষা সেটআপ পেজ খুলে বিষয় বরাদ্দ করুন।",
  "Auto grade": "স্বয়ংক্রিয় গ্রেড",
  Result: "ফলাফল",
  "After save": "সংরক্ষণের পরে",
  "Save marks": "নম্বর সংরক্ষণ করুন",
  "Saving marks...": "নম্বর সংরক্ষণ হচ্ছে...",
  "Full mark: {fullMark}. Minimum pass mark: {passMark}. Grade is calculated after saving.":
    "পূর্ণ নম্বর: {fullMark}. ন্যূনতম পাশ নম্বর: {passMark}. সংরক্ষণের পরে গ্রেড হিসাব হবে।",
  "No active students found for {className}. Add students to that class first, or edit/create the exam for the correct class.":
    "{className}-এর জন্য কোনো সক্রিয় শিক্ষার্থী পাওয়া যায়নি। আগে ওই ক্লাসে শিক্ষার্থী যোগ করুন, অথবা সঠিক ক্লাসের জন্য পরীক্ষা সম্পাদনা/তৈরি করুন।",
  "this exam class": "এই পরীক্ষার ক্লাস",
  "Showing up to 20 students on this sheet.": "এই শিটে সর্বোচ্চ ২০ জন শিক্ষার্থী দেখানো হচ্ছে।",
  Previous: "আগের",
  Next: "পরের",
  "Create exams and assign dynamic subjects.": "পরীক্ষা তৈরি করুন এবং ডাইনামিক বিষয় বরাদ্দ করুন।",
  Exam: "পরীক্ষা",
  "Create Exam": "পরীক্ষা তৈরি করুন",
  "Create exam": "পরীক্ষা তৈরি করুন",
  Dates: "তারিখসমূহ",
  Open: "খুলুন",
  Results: "ফলাফল",
  "Delete exam {name}? Subjects and marks for this exam will also be removed.":
    "{name} পরীক্ষা মুছবেন? এই পরীক্ষার বিষয় ও নম্বরও মুছে যাবে।",
  "Final confirmation: delete this exam permanently?":
    "চূড়ান্ত নিশ্চিতকরণ: এই পরীক্ষা স্থায়ীভাবে মুছবেন?",
  "No exams yet. Create an exam, then assign subjects and enter marks.":
    "এখনো কোনো পরীক্ষা নেই। পরীক্ষা তৈরি করে বিষয় বরাদ্দ করুন এবং নম্বর দিন।",
  "Set up an exam, then assign subjects on the exam page.":
    "পরীক্ষা সেটআপ করুন, তারপর পরীক্ষার পেজে বিষয় বরাদ্দ করুন।",
  "Exam details": "পরীক্ষার বিস্তারিত",
  "Exam name": "পরীক্ষার নাম",
  "First Term Exam": "প্রথম সাময়িক পরীক্ষা",
  "Start date": "শুরুর তারিখ",
  "End date": "শেষ তারিখ",
  "Assign subjects now": "এখন বিষয় বরাদ্দ করুন",
  "Selected subjects will be added with full mark 100 and minimum pass mark 33.":
    "নির্বাচিত বিষয়গুলো পূর্ণ নম্বর ১০০ এবং ন্যূনতম পাশ নম্বর ৩৩ সহ যুক্ত হবে।",
  "No subjects yet. Add subjects from the panel on the right first.":
    "এখনো কোনো বিষয় নেই। আগে ডান পাশের প্যানেল থেকে বিষয় যোগ করুন।",
  Subjects: "বিষয়সমূহ",
  "Subject name": "বিষয়ের নাম",
  Code: "কোড",
  "Add subject": "বিষয় যোগ করুন",
  "Delete subject {name}? Existing exam subjects or marks may block this if they still use it.":
    "{name} বিষয় মুছবেন? বিদ্যমান পরীক্ষার বিষয় বা নম্বর এটি ব্যবহার করলে বাধা দিতে পারে।",
  "Final confirmation: delete this subject?":
    "চূড়ান্ত নিশ্চিতকরণ: এই বিষয় মুছবেন?",
  "Session {session}": "সেশন {session}",
  "Full mark": "পূর্ণ নম্বর",
  "Minimum pass mark": "ন্যূনতম পাশ নম্বর",
  "This is the required mark to pass, not the student's obtained mark.":
    "এটি পাশ করার জন্য প্রয়োজনীয় নম্বর, শিক্ষার্থীর প্রাপ্ত নম্বর নয়।",
  "Assign subject": "বিষয় বরাদ্দ করুন",
  "Minimum pass": "ন্যূনতম পাশ",
  "Remove {name} from this exam? Related marks may also need cleanup.":
    "এই পরীক্ষা থেকে {name} সরাবেন? সংশ্লিষ্ট নম্বরও পরিষ্কার করতে হতে পারে।",
  "Final confirmation: remove this exam subject?":
    "চূড়ান্ত নিশ্চিতকরণ: এই পরীক্ষার বিষয় সরাবেন?",
  "Exam Result Sheet": "পরীক্ষার ফলাফল শিট",
  "{examName} - {className} - Session {session}":
    "{examName} - {className} - সেশন {session}",
  "Export exam PDF": "পরীক্ষার PDF এক্সপোর্ট করুন",
  "Exam setup": "পরীক্ষা সেটআপ",
  "Edit marks": "নম্বর সম্পাদনা",
  "Class: {className}": "ক্লাস: {className}",
  "Session: {session}": "সেশন: {session}",
  "Subjects: {count}": "বিষয়: {count}",
  "Full mark: {mark}": "পূর্ণ নম্বর: {mark}",
  Position: "মেধাক্রম",
  Percentage: "শতাংশ",
  "No result sheet data yet. Assign subjects and enter marks first.":
    "এখনো ফলাফল শিটের ডেটা নেই। আগে বিষয় বরাদ্দ করুন এবং নম্বর দিন।",
  "Create classes first, then add sections. Students depend on these records.":
    "আগে ক্লাস তৈরি করুন, তারপর শাখা যোগ করুন। শিক্ষার্থীরা এই রেকর্ডের ওপর নির্ভর করে।",
  "That section already exists for the selected class. Use a different section name for that class.":
    "নির্বাচিত ক্লাসে এই শাখা আগে থেকেই আছে। ওই ক্লাসের জন্য আলাদা শাখার নাম ব্যবহার করুন।",
  "Add class": "ক্লাস যোগ করুন",
  "Class name": "ক্লাসের নাম",
  "Class 1": "ক্লাস ১",
  "Sort order": "সাজানোর ক্রম",
  "Save class": "ক্লাস সংরক্ষণ করুন",
  "Add section": "শাখা যোগ করুন",
  "Section name": "শাখার নাম",
  "Save section": "শাখা সংরক্ষণ করুন",
  Sort: "ক্রম",
  "Delete class {name}? Students, sections, exams, and related records may block this if they still use it.":
    "{name} ক্লাস মুছবেন? শিক্ষার্থী, শাখা, পরীক্ষা এবং সংশ্লিষ্ট রেকর্ড এটি ব্যবহার করলে বাধা দিতে পারে।",
  "Final confirmation: delete this class?":
    "চূড়ান্ত নিশ্চিতকরণ: এই ক্লাস মুছবেন?",
  "No classes yet. Create a class before adding students.":
    "এখনো কোনো ক্লাস নেই। শিক্ষার্থী যোগ করার আগে একটি ক্লাস তৈরি করুন।",
  Sections: "শাখাসমূহ",
  "Delete section {name}? Students using it may need editing first.":
    "{name} শাখা মুছবেন? এটি ব্যবহার করা শিক্ষার্থীদের আগে সম্পাদনা করতে হতে পারে।",
  "Final confirmation: delete this section?":
    "চূড়ান্ত নিশ্চিতকরণ: এই শাখা মুছবেন?",
  "No sections yet. Sections are optional, but useful for student grouping.":
    "এখনো কোনো শাখা নেই। শাখা ঐচ্ছিক, তবে শিক্ষার্থী গ্রুপিংয়ের জন্য কাজে লাগে।",
  "Add dynamic fee names such as Beton, Vorti, exam fee, session charge, or Vortuki.":
    "বেতন, ভর্তি, পরীক্ষা ফি, সেশন চার্জ বা ভর্তুকির মতো ডাইনামিক ফির নাম যোগ করুন।",
  "Add fee type": "ফির ধরন যোগ করুন",
  "Monthly Fee / Beton": "মাসিক ফি / বেতন",
  Category: "ক্যাটাগরি",
  Frequency: "ফ্রিকোয়েন্সি",
  "Default amount": "ডিফল্ট পরিমাণ",
  Description: "বিবরণ",
  "Save fee type": "ফির ধরন সংরক্ষণ করুন",
  Default: "ডিফল্ট",
  "Delete fee type {name}? Existing fee records may block this if they still use it.":
    "{name} ফির ধরন মুছবেন? বিদ্যমান ফি রেকর্ড এটি ব্যবহার করলে বাধা দিতে পারে।",
  "Final confirmation: delete this fee type?":
    "চূড়ান্ত নিশ্চিতকরণ: এই ফির ধরন মুছবেন?",
  "No fee types yet. Add the first fee type from the form.":
    "এখনো কোনো ফির ধরন নেই। ফর্ম থেকে প্রথম ফির ধরন যোগ করুন।",
  "Add non-money metadata fields. Use fee types for all money-related charges.":
    "টাকার বাইরের মেটাডেটা ফিল্ড যোগ করুন। টাকা-সম্পর্কিত সব চার্জের জন্য ফির ধরন ব্যবহার করুন।",
  "Add custom field": "কাস্টম ফিল্ড যোগ করুন",
  Label: "লেবেল",
  "Birth certificate no": "জন্ম নিবন্ধন নম্বর",
  "System name": "সিস্টেম নাম",
  Entity: "এনটিটি",
  Type: "ধরন",
  Options: "অপশন",
  "Only for dropdown fields": "শুধু ড্রপডাউন ফিল্ডের জন্য",
  Required: "আবশ্যক",
  "Save field": "ফিল্ড সংরক্ষণ করুন",
  "Delete custom field {label}? Saved values for this field will also be removed.":
    "{label} কাস্টম ফিল্ড মুছবেন? এই ফিল্ডের সংরক্ষিত মানও মুছে যাবে।",
  "Final confirmation: delete this custom field?":
    "চূড়ান্ত নিশ্চিতকরণ: এই কাস্টম ফিল্ড মুছবেন?",
  "No custom fields yet. Add one only for non-money metadata.":
    "এখনো কোনো কাস্টম ফিল্ড নেই। শুধু টাকার বাইরের মেটাডেটার জন্য একটি যোগ করুন।",
  "Admin Login": "অ্যাডমিন লগইন",
  "Sign in with the Supabase principal account.":
    "Supabase প্রিন্সিপাল অ্যাকাউন্ট দিয়ে সাইন ইন করুন।",
  "Add Supabase values to": "Supabase মান যোগ করুন",
  ", run the SQL schema, then restart the dev server.":
    ", SQL schema চালান, তারপর dev server রিস্টার্ট করুন।",
  "Supabase environment variables are missing.":
    "Supabase environment variable অনুপস্থিত।",
  "Fee amounts cannot be negative.": "ফির পরিমাণ ঋণাত্মক হতে পারে না।",
  "Discount cannot exceed fee amount.": "ছাড় ফির পরিমাণের বেশি হতে পারে না।",
  "Already paid amount cannot exceed current due amount.":
    "আগে পরিশোধিত পরিমাণ বর্তমান বকেয়ার বেশি হতে পারে না।",
  "Payment amount must be greater than 0.": "পেমেন্ট পরিমাণ ০-এর বেশি হতে হবে।",
  "Fee record was not found.": "ফি রেকর্ড পাওয়া যায়নি।",
  "This fee record is already fully paid.": "এই ফি রেকর্ড ইতিমধ্যে সম্পূর্ণ পরিশোধিত।",
  "Payment amount cannot exceed current due amount.":
    "পেমেন্ট পরিমাণ বর্তমান বকেয়ার বেশি হতে পারে না।",
  "This subject is not assigned to the selected exam.":
    "এই বিষয়টি নির্বাচিত পরীক্ষায় বরাদ্দ নেই।",
  "Marks cannot be negative.": "নম্বর ঋণাত্মক হতে পারে না।",
  "Written and oral marks cannot exceed the subject full mark.":
    "লিখিত ও মৌখিক নম্বর বিষয়ের পূর্ণ নম্বরের বেশি হতে পারে না।",
  Email: "ইমেইল",
  Password: "পাসওয়ার্ড",
  Login: "লগইন",
  "Confirm action": "অ্যাকশন নিশ্চিত করুন",
  "Final confirmation": "চূড়ান্ত নিশ্চিতকরণ",
  "This action can affect related records.":
    "এই অ্যাকশন সংশ্লিষ্ট রেকর্ডে প্রভাব ফেলতে পারে।",
  "What will happen": "যা ঘটবে",
  "Related child records may also be deleted or changed, for example fees, payments, attendance, marks, subject links, notes, or custom field values.":
    "সংশ্লিষ্ট child রেকর্ডও মুছে যেতে বা পরিবর্তন হতে পারে, যেমন ফি, পেমেন্ট, হাজিরা, নম্বর, বিষয়ের লিংক, নোট বা কাস্টম ফিল্ডের মান।",
  Cancel: "বাতিল",
  Continue: "চালিয়ে যান",
  "Confirm final action": "চূড়ান্ত অ্যাকশন নিশ্চিত করুন",
  "Page {page} of {pages}": "পৃষ্ঠা {page} / {pages}",
  "Go to": "যান",
  "Page {page}": "পৃষ্ঠা {page}",
  Go: "যান",
  "Export PDF": "PDF এক্সপোর্ট করুন",
  "not entered": "এন্ট্রি হয়নি",
  unknown: "অজানা",
  cash: "নগদ",
  active: "সক্রিয়",
  left: "চলে গেছে",
  graduated: "স্নাতক",
  paid: "পরিশোধিত",
  partial: "আংশিক",
  unpaid: "অপরিশোধিত",
  present: "উপস্থিত",
  absent: "অনুপস্থিত",
  late: "দেরি",
  leave: "ছুটি",
  pass: "পাশ",
  fail: "ফেল",
  incomplete: "অসম্পূর্ণ",
  regular: "নিয়মিত",
  admission: "ভর্তি",
  exam: "পরীক্ষা",
  one_time: "এককালীন",
  discount: "ছাড়",
  other: "অন্যান্য",
  monthly: "মাসিক",
  yearly: "বার্ষিক",
  custom: "কাস্টম",
  text: "টেক্সট",
  number: "সংখ্যা",
  date: "তারিখ",
  dropdown: "ড্রপডাউন",
  boolean: "বুলিয়ান",
  student: "শিক্ষার্থী",
  fee: "ফি",
  January: "জানুয়ারি",
  February: "ফেব্রুয়ারি",
  March: "মার্চ",
  April: "এপ্রিল",
  May: "মে",
  June: "জুন",
  July: "জুলাই",
  August: "আগস্ট",
  September: "সেপ্টেম্বর",
  October: "অক্টোবর",
  November: "নভেম্বর",
  December: "ডিসেম্বর"
} as const;

type TranslationKey = keyof typeof bn;

export function translate(
  language: AdminLanguage,
  text: string,
  values?: Record<string, string | number | null | undefined>
) {
  const template = language === "bn" ? bn[text as TranslationKey] ?? text : text;
  if (!values) return template;

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value ?? "")),
    template
  );
}

export function translator(language: AdminLanguage) {
  return (
    text: string,
    values?: Record<string, string | number | null | undefined>
  ) => translate(language, text, values);
}

export function translateValue(language: AdminLanguage, value: string | null | undefined) {
  const label = value ?? "unknown";
  const translated = translate(language, label);
  return translated === label ? translate(language, label.replaceAll("_", " ")) : translated;
}

export function translateOption(language: AdminLanguage, value: string) {
  return translate(language, value);
}
