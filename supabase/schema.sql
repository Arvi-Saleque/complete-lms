create extension if not exists "pgcrypto";

create type public.user_role as enum ('principal', 'teacher', 'accountant', 'viewer');
create type public.student_status as enum ('active', 'left', 'graduated');
create type public.fee_category as enum ('regular', 'admission', 'exam', 'one_time', 'discount', 'other');
create type public.fee_frequency as enum ('monthly', 'yearly', 'one_time', 'exam', 'custom');
create type public.fee_status as enum ('unpaid', 'partial', 'paid');
create type public.attendance_status as enum ('present', 'absent', 'late', 'leave');
create type public.entity_type as enum ('student', 'fee', 'exam');
create type public.custom_field_type as enum ('text', 'number', 'date', 'dropdown', 'boolean');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, name)
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  roll text not null,
  class_id uuid not null references public.classes(id),
  section_id uuid references public.sections(id),
  session_year text not null,
  father_name text,
  mother_name text,
  guardian_phone text,
  address text,
  admission_date date,
  status public.student_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (roll, class_id, session_year)
);

create table public.fee_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  category public.fee_category not null default 'other',
  default_amount numeric(12, 2) not null default 0,
  frequency public.fee_frequency not null default 'one_time',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_fee_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  fee_type_id uuid not null references public.fee_types(id),
  amount numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  paid_amount numeric(12, 2) not null default 0,
  due_amount numeric(12, 2) not null default 0,
  month text,
  session_year text not null,
  due_date date,
  status public.fee_status not null default 'unpaid',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  student_fee_record_id uuid not null references public.student_fee_records(id) on delete cascade,
  amount numeric(12, 2) not null,
  payment_date date not null default current_date,
  payment_method text,
  receipt_no text,
  note text,
  created_at timestamptz not null default now()
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  date date not null,
  status public.attendance_status not null default 'present',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, date)
);

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  class_id uuid not null references public.classes(id),
  session_year text not null,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.exam_subjects (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  subject_id uuid not null references public.subjects(id),
  full_mark numeric(8, 2) not null default 100,
  pass_mark numeric(8, 2) not null default 33,
  created_at timestamptz not null default now(),
  unique (exam_id, subject_id)
);

create table public.student_marks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  subject_id uuid not null references public.subjects(id),
  written_mark numeric(8, 2) not null default 0,
  oral_mark numeric(8, 2) not null default 0,
  total_mark numeric(8, 2) not null default 0,
  grade text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, exam_id, subject_id)
);

create table public.custom_field_definitions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  label text not null,
  entity_type public.entity_type not null default 'student',
  field_type public.custom_field_type not null default 'text',
  options text,
  is_required boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.custom_field_values (
  id uuid primary key default gen_random_uuid(),
  field_definition_id uuid not null references public.custom_field_definitions(id) on delete cascade,
  entity_id uuid not null,
  value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (field_definition_id, entity_id)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  note text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index students_class_session_idx on public.students(class_id, session_year);
create index students_status_idx on public.students(status);
create index fee_records_student_idx on public.student_fee_records(student_id);
create index fee_records_status_idx on public.student_fee_records(status);
create index payments_date_idx on public.payments(payment_date);
create index attendance_date_idx on public.attendance_records(date);
create index marks_exam_subject_idx on public.student_marks(exam_id, subject_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_classes_updated_at before update on public.classes for each row execute function public.set_updated_at();
create trigger set_sections_updated_at before update on public.sections for each row execute function public.set_updated_at();
create trigger set_students_updated_at before update on public.students for each row execute function public.set_updated_at();
create trigger set_fee_types_updated_at before update on public.fee_types for each row execute function public.set_updated_at();
create trigger set_fee_records_updated_at before update on public.student_fee_records for each row execute function public.set_updated_at();
create trigger set_attendance_updated_at before update on public.attendance_records for each row execute function public.set_updated_at();
create trigger set_exams_updated_at before update on public.exams for each row execute function public.set_updated_at();
create trigger set_subjects_updated_at before update on public.subjects for each row execute function public.set_updated_at();
create trigger set_marks_updated_at before update on public.student_marks for each row execute function public.set_updated_at();
create trigger set_custom_field_definitions_updated_at before update on public.custom_field_definitions for each row execute function public.set_updated_at();
create trigger set_custom_field_values_updated_at before update on public.custom_field_values for each row execute function public.set_updated_at();

create or replace function public.is_principal()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'principal'
  );
$$;

create or replace function public.add_fee_payment(
  p_student_fee_record_id uuid,
  p_amount numeric,
  p_payment_date date,
  p_note text default null
)
returns table (
  payment_id uuid,
  paid_amount numeric,
  due_amount numeric,
  fee_status public.fee_status
)
language plpgsql
security definer
set search_path = public
as $$
declare
  fee_record public.student_fee_records%rowtype;
  current_paid numeric(12, 2);
  next_paid numeric(12, 2);
  next_due numeric(12, 2);
  base_due numeric(12, 2);
  inserted_payment_id uuid;
  generated_receipt_no text;
begin
  if not public.is_principal() then
    raise exception 'Only principal users can add payments.';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Payment amount must be greater than 0.';
  end if;

  select *
  into fee_record
  from public.student_fee_records
  where id = p_student_fee_record_id
  for update;

  if not found then
    raise exception 'Fee record was not found.';
  end if;

  select coalesce(sum(amount), 0)
  into current_paid
  from public.payments
  where student_fee_record_id = p_student_fee_record_id;

  base_due := greatest(fee_record.amount - fee_record.discount_amount - current_paid, 0);

  if base_due <= 0 then
    raise exception 'This fee record is already fully paid.';
  end if;

  if p_amount > base_due then
    raise exception 'Payment amount cannot exceed current due amount.';
  end if;

  generated_receipt_no := 'R-' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS');

  insert into public.payments (
    student_fee_record_id,
    amount,
    payment_date,
    payment_method,
    receipt_no,
    note
  )
  values (
    p_student_fee_record_id,
    p_amount,
    coalesce(p_payment_date, current_date),
    'cash',
    generated_receipt_no,
    p_note
  )
  returning id into inserted_payment_id;

  select coalesce(sum(amount), 0)
  into next_paid
  from public.payments
  where student_fee_record_id = p_student_fee_record_id;

  next_due := greatest(fee_record.amount - fee_record.discount_amount - next_paid, 0);

  update public.student_fee_records
  set
    paid_amount = next_paid,
    due_amount = next_due,
    status = case
      when next_due <= 0 then 'paid'::public.fee_status
      when next_paid > 0 then 'partial'::public.fee_status
      else 'unpaid'::public.fee_status
    end
  where id = p_student_fee_record_id;

  return query
  select
    inserted_payment_id,
    next_paid,
    next_due,
    case
      when next_due <= 0 then 'paid'::public.fee_status
      when next_paid > 0 then 'partial'::public.fee_status
      else 'unpaid'::public.fee_status
    end;
end;
$$;

grant execute on function public.add_fee_payment(uuid, numeric, date, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.sections enable row level security;
alter table public.students enable row level security;
alter table public.fee_types enable row level security;
alter table public.student_fee_records enable row level security;
alter table public.payments enable row level security;
alter table public.attendance_records enable row level security;
alter table public.exams enable row level security;
alter table public.subjects enable row level security;
alter table public.exam_subjects enable row level security;
alter table public.student_marks enable row level security;
alter table public.custom_field_definitions enable row level security;
alter table public.custom_field_values enable row level security;
alter table public.notes enable row level security;

create policy "Profiles are visible to owner or principal" on public.profiles
  for select using (auth.uid() = id or public.is_principal());
create policy "Principals manage profiles" on public.profiles
  for all using (public.is_principal()) with check (public.is_principal());

create policy "Principals manage classes" on public.classes for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage sections" on public.sections for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage students" on public.students for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage fee types" on public.fee_types for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage fee records" on public.student_fee_records for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage payments" on public.payments for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage attendance" on public.attendance_records for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage exams" on public.exams for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage subjects" on public.subjects for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage exam subjects" on public.exam_subjects for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage marks" on public.student_marks for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage custom fields" on public.custom_field_definitions for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage custom values" on public.custom_field_values for all using (public.is_principal()) with check (public.is_principal());
create policy "Principals manage notes" on public.notes for all using (public.is_principal()) with check (public.is_principal());

insert into public.classes (name, sort_order) values
  ('Nurani', 1),
  ('Hifz', 2),
  ('Class 1', 3),
  ('Class 2', 4),
  ('Class 3', 5),
  ('Class 4', 6),
  ('Class 5', 7)
on conflict (name) do nothing;

insert into public.fee_types (name, description, category, default_amount, frequency) values
  ('Monthly Fee / Beton', 'Regular monthly student fee', 'regular', 0, 'monthly'),
  ('Admission Fee / Vorti Fee', 'One-time admission fee', 'admission', 0, 'one_time'),
  ('Exam Fee / Porikkhar Fee', 'Exam-related fee', 'exam', 0, 'exam'),
  ('Session Charge', 'Yearly session charge', 'regular', 0, 'yearly'),
  ('Book Fee', 'Books and materials', 'one_time', 0, 'one_time'),
  ('Hostel Fee', 'Hostel charge', 'regular', 0, 'monthly'),
  ('Transport Fee', 'Transport charge', 'regular', 0, 'monthly'),
  ('Other Fee', 'Other manual fee', 'other', 0, 'custom'),
  ('Discount / Vortuki', 'Discount or subsidy record', 'discount', 0, 'custom')
on conflict (name) do nothing;

insert into public.subjects (name, code) values
  ('Quran', 'QUR'),
  ('Bangla', 'BAN'),
  ('English', 'ENG'),
  ('Mathematics', 'MATH'),
  ('Arabic', 'ARB')
on conflict (name) do nothing;

-- After creating an auth user in Supabase Auth, run this with that user's UUID:
-- insert into public.profiles (id, full_name, role)
-- values ('AUTH_USER_UUID_HERE', 'Principal', 'principal')
-- on conflict (id) do update set role = 'principal', full_name = excluded.full_name;
