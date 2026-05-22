export const studentStatuses = ["active", "left", "graduated"] as const;
export const feeCategories = [
  "regular",
  "admission",
  "exam",
  "one_time",
  "discount",
  "other"
] as const;
export const feeFrequencies = [
  "monthly",
  "yearly",
  "one_time",
  "exam",
  "custom"
] as const;
export const feeStatuses = ["unpaid", "partial", "paid"] as const;
export const attendanceStatuses = ["present", "absent", "late", "leave"] as const;
export const fieldTypes = ["text", "number", "date", "dropdown", "boolean"] as const;
