export function combinePresentAddress(fields: {
  present_village?: string | null;
  present_post_office?: string | null;
  present_post_code?: string | null;
  present_upazila?: string | null;
  present_district?: string | null;
}) {
  const parts = [
    fields.present_village,
    fields.present_post_office,
    fields.present_post_code,
    fields.present_upazila,
    fields.present_district
  ];

  return parts
    .map((p) => (p ?? "").trim())
    .filter((p) => p.length > 0)
    .join(", ");
}
