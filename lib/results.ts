export type ExamSubjectRow = {
  subject_id: string;
  full_mark: number | string | null;
  pass_mark: number | string | null;
  subjects?: { name?: string | null; code?: string | null } | null;
};

export type StudentRow = {
  id: string;
  name: string;
  roll: string;
};

export type StudentMarkRow = {
  student_id: string;
  subject_id: string;
  written_mark?: number | string | null;
  oral_mark?: number | string | null;
  total_mark?: number | string | null;
  grade?: string | null;
  note?: string | null;
};

export type SubjectResult = {
  subjectId: string;
  subjectName: string;
  fullMark: number;
  passMark: number;
  writtenMark: number;
  oralMark: number;
  totalMark: number;
  percentage: number;
  grade: string;
  status: "Pass" | "Fail" | "Not entered";
  mark?: StudentMarkRow;
};

export type StudentExamResult = {
  student: StudentRow;
  subjects: SubjectResult[];
  totalObtained: number;
  totalFullMarks: number;
  percentage: number;
  grade: string;
  status: "Pass" | "Fail" | "Incomplete";
  position: number | null;
};

export function gradeFromPercentage(percentage: number) {
  if (percentage >= 80) return "A+";
  if (percentage >= 70) return "A";
  if (percentage >= 60) return "A-";
  if (percentage >= 50) return "B";
  if (percentage >= 40) return "C";
  if (percentage >= 33) return "D";
  return "F";
}

export function calculateSubjectGrade(totalMark: number, fullMark: number, passMark: number) {
  if (totalMark < passMark) return "F";
  return gradeFromPercentage(fullMark > 0 ? (totalMark / fullMark) * 100 : 0);
}

export function formatMark(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function formatPercentage(value: number) {
  return `${value.toFixed(2)}%`;
}

export function calculateExamResults({
  students,
  examSubjects,
  marks
}: {
  students: StudentRow[];
  examSubjects: ExamSubjectRow[];
  marks: StudentMarkRow[];
}) {
  const marksByStudentSubject = new Map(
    marks.map((mark) => [`${mark.student_id}:${mark.subject_id}`, mark])
  );

  const results: StudentExamResult[] = students.map((student) => {
    const subjects = examSubjects.map((subject) => {
      const mark = marksByStudentSubject.get(`${student.id}:${subject.subject_id}`);
      const fullMark = Number(subject.full_mark ?? 0);
      const passMark = Number(subject.pass_mark ?? 0);
      const hasMark = Boolean(mark);
      const writtenMark = Number(mark?.written_mark ?? 0);
      const oralMark = Number(mark?.oral_mark ?? 0);
      const totalMark = writtenMark + oralMark;
      const percentage = fullMark > 0 ? (totalMark / fullMark) * 100 : 0;
      const status = !hasMark ? "Not entered" : totalMark >= passMark ? "Pass" : "Fail";

      return {
        subjectId: subject.subject_id,
        subjectName: subject.subjects?.name ?? "Subject",
        fullMark,
        passMark,
        writtenMark,
        oralMark,
        totalMark,
        percentage,
        grade:
          status === "Not entered" ? "Not entered" : status === "Pass" ? gradeFromPercentage(percentage) : "F",
        status,
        mark
      } satisfies SubjectResult;
    });

    const totalObtained = subjects.reduce((sum, subject) => sum + subject.totalMark, 0);
    const totalFullMarks = subjects.reduce((sum, subject) => sum + subject.fullMark, 0);
    const percentage = totalFullMarks > 0 ? (totalObtained / totalFullMarks) * 100 : 0;
    const hasMissingSubject =
      !subjects.length || subjects.some((subject) => subject.status === "Not entered");
    const failedAnySubject = subjects.some((subject) => subject.status === "Fail");
    const status = hasMissingSubject ? "Incomplete" : failedAnySubject ? "Fail" : "Pass";

    return {
      student,
      subjects,
      totalObtained,
      totalFullMarks,
      percentage,
      grade: status === "Incomplete" ? "Incomplete" : status === "Pass" ? gradeFromPercentage(percentage) : "F",
      status,
      position: null
    } satisfies StudentExamResult;
  });

  const sorted = [...results].sort((a, b) => {
    if (a.status !== b.status) {
      const order = { Pass: 0, Fail: 1, Incomplete: 2 };
      return order[a.status] - order[b.status];
    }
    if (b.totalObtained !== a.totalObtained) return b.totalObtained - a.totalObtained;
    return a.student.roll.localeCompare(b.student.roll, undefined, { numeric: true });
  });

  let previousPassedTotal: number | null = null;
  let previousRank = 0;
  let passedIndex = 0;
  sorted.forEach((result) => {
    if (result.status !== "Pass") {
      result.position = null;
      return;
    }

    passedIndex += 1;
    if (previousPassedTotal === result.totalObtained) {
      result.position = previousRank;
    } else {
      result.position = passedIndex;
      previousRank = passedIndex;
      previousPassedTotal = result.totalObtained;
    }
  });

  return sorted;
}
