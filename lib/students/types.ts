export interface Student {
  id?: string;
  created_at?: string;
  name: string;
  roll: string;
  class_id: string;
  section_id?: string | null;
  session_year: string;
  status: string;
  admission_date?: string | null;

  // Existing summary fields
  father_name?: string | null;
  mother_name?: string | null;
  guardian_phone?: string | null;
  address?: string | null;

  // New detailed optional fields
  student_name_bn?: string | null;
  student_name_en?: string | null;
  birth_certificate_no?: string | null;
  date_of_birth?: string | null;
  age_day?: number | null;
  age_month?: number | null;
  age_year?: number | null;
  gender?: string | null;
  class_start_date?: string | null;
  tracking_no?: string | null;
  residential_type?: string | null;
  
  form_received_date?: string | null;
  form_submitted_date?: string | null;

  // Father
  father_name_bn?: string | null;
  father_name_en?: string | null;
  father_nid?: string | null;
  father_mobile_1?: string | null;
  father_mobile_2?: string | null;
  father_mobile_3?: string | null;
  father_whatsapp_number?: string | null;
  father_occupation?: string | null;
  father_profession_type?: string | null;
  father_profession_details?: string | null;
  father_education?: string | null;

  // Mother
  mother_name_bn?: string | null;
  mother_name_en?: string | null;
  mother_nid?: string | null;
  mother_mobile?: string | null;
  mother_mobile_1?: string | null;
  mother_mobile_2?: string | null;
  mother_occupation?: string | null;
  mother_profession_type?: string | null;
  mother_education?: string | null;

  // Present address
  present_village?: string | null;
  present_post_office?: string | null;
  present_post_code?: string | null;
  present_upazila?: string | null;
  present_district?: string | null;

  // Permanent address
  permanent_village?: string | null;
  permanent_post_office?: string | null;
  permanent_post_code?: string | null;
  permanent_upazila?: string | null;
  permanent_district?: string | null;

  // Documents
  docs_birth_certificate?: boolean | null;
  docs_previous_marksheet?: boolean | null;
  docs_guardian_photo?: boolean | null;
  docs_guardian_nid?: boolean | null;

  // Other
  same_as_present_address?: boolean | null;
}
