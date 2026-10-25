-- SIFLOUA initial schema. Review policies before production use.
create extension if not exists pgcrypto;
create type public.app_role as enum ('SUPER_ADMIN','ADMIN','FORMATEUR','APPRENANT');
create type public.content_status as enum ('DRAFT','SUBMITTED','REVIEW','APPROVED','PUBLISHED','REJECTED','ARCHIVED');

create table public.profiles(id uuid primary key references auth.users(id) on delete cascade, display_name text, role public.app_role not null default 'APPRENANT', avatar_path text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.academic_levels(id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, parent_level_id uuid references public.academic_levels(id), sort_order integer not null default 0, is_active boolean not null default true, created_at timestamptz not null default now());
create table public.classes(id uuid primary key default gen_random_uuid(), academic_level_id uuid not null references public.academic_levels(id), name text not null, slug text not null, sort_order integer not null default 0, is_active boolean not null default true, unique(academic_level_id,slug));
create table public.tracks(id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, description text, is_active boolean not null default true);
create table public.subjects(id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, description text, is_active boolean not null default true);
create table public.programs(id uuid primary key default gen_random_uuid(), class_id uuid not null references public.classes(id), subject_id uuid not null references public.subjects(id), track_id uuid references public.tracks(id), title text not null, description text, curriculum_reference text, status public.content_status not null default 'DRAFT', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.modules(id uuid primary key default gen_random_uuid(), program_id uuid not null references public.programs(id) on delete cascade, title text not null, description text, sort_order integer not null default 0, status public.content_status not null default 'DRAFT', created_at timestamptz not null default now());
create table public.lessons(id uuid primary key default gen_random_uuid(), module_id uuid not null references public.modules(id) on delete cascade, title text not null, summary text, content jsonb not null default '{}'::jsonb, duration_minutes integer, sort_order integer not null default 0, status public.content_status not null default 'DRAFT', curriculum_status text not null default 'STRUCTURED_DRAFT' check(curriculum_status in ('STRUCTURED_DRAFT','CURRICULUM_MAPPED','CONTENT_COMPLETE','QA_VALIDATED','PUBLISHED')), published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.resources(id uuid primary key default gen_random_uuid(), lesson_id uuid not null references public.lessons(id) on delete cascade, title text not null, resource_type text not null check(resource_type in ('PDF','IMAGE','AUDIO','VIDEO','LINK','FILE')), storage_key text, external_url text, created_at timestamptz not null default now(), check(storage_key is not null or external_url is not null));
create table public.questions(id uuid primary key default gen_random_uuid(), lesson_id uuid not null references public.lessons(id) on delete cascade, type text not null check(type in ('SINGLE_CHOICE','MULTIPLE_CHOICE','TRUE_FALSE','SHORT_ANSWER')), difficulty text not null default 'MEDIUM' check(difficulty in ('EASY','MEDIUM','HARD')), prompt text not null, explanation text, status public.content_status not null default 'DRAFT', created_at timestamptz not null default now());
create table public.question_answers(id uuid primary key default gen_random_uuid(), question_id uuid not null references public.questions(id) on delete cascade, answer_text text not null, is_correct boolean not null default false, sort_order integer not null default 0);
create table public.exams(id uuid primary key default gen_random_uuid(), class_id uuid references public.classes(id), title text not null, description text, duration_minutes integer not null check(duration_minutes>0), passing_score numeric(5,2) not null default 50 check(passing_score between 0 and 100), status public.content_status not null default 'DRAFT', created_at timestamptz not null default now());
create table public.exam_questions(exam_id uuid not null references public.exams(id) on delete cascade, question_id uuid not null references public.questions(id), sort_order integer not null default 0, points numeric(6,2) not null default 1 check(points>0), primary key(exam_id,question_id));
create table public.exam_attempts(id uuid primary key default gen_random_uuid(), exam_id uuid not null references public.exams(id), learner_id uuid not null references auth.users(id) on delete cascade, started_at timestamptz not null default now(), submitted_at timestamptz, score numeric(6,2), status text not null default 'IN_PROGRESS' check(status in ('IN_PROGRESS','SUBMITTED','GRADED','ABANDONED')), created_at timestamptz not null default now());
create table public.exam_attempt_answers(attempt_id uuid not null references public.exam_attempts(id) on delete cascade, question_id uuid not null references public.questions(id), selected_answer_ids uuid[] not null default '{}', free_text_answer text, is_correct boolean, points_awarded numeric(6,2), primary key(attempt_id,question_id));
create table public.progress(learner_id uuid not null references auth.users(id) on delete cascade, lesson_id uuid not null references public.lessons(id) on delete cascade, status text not null default 'NOT_STARTED' check(status in ('NOT_STARTED','IN_PROGRESS','COMPLETED')), completion_percent integer not null default 0 check(completion_percent between 0 and 100), last_opened_at timestamptz, completed_at timestamptz, primary key(learner_id,lesson_id));
create table public.audit_logs(id bigint generated always as identity primary key, actor_id uuid references auth.users(id) on delete set null, action text not null, entity_type text not null, entity_id text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());

create index classes_level_idx on public.classes(academic_level_id,sort_order);
create index programs_class_subject_idx on public.programs(class_id,subject_id);
create index modules_program_idx on public.modules(program_id,sort_order);
create index lessons_module_idx on public.lessons(module_id,sort_order);
create index questions_lesson_idx on public.questions(lesson_id,status);
create index attempts_learner_idx on public.exam_attempts(learner_id,created_at desc);

do $$ declare t text; begin
  foreach t in array array['profiles','academic_levels','classes','tracks','subjects','programs','modules','lessons','resources','questions','question_answers','exams','exam_questions','exam_attempts','exam_attempt_answers','progress','audit_logs']
  loop execute format('alter table public.%I enable row level security',t); end loop;
end $$;

create policy "profiles_read_own" on public.profiles for select to authenticated using(auth.uid()=id);
create policy "profiles_update_own" on public.profiles for update to authenticated using(auth.uid()=id) with check(auth.uid()=id);
create policy "levels_read_active" on public.academic_levels for select to anon,authenticated using(is_active=true);
create policy "classes_read_active" on public.classes for select to anon,authenticated using(is_active=true);
create policy "tracks_read_active" on public.tracks for select to anon,authenticated using(is_active=true);
create policy "subjects_read_active" on public.subjects for select to anon,authenticated using(is_active=true);
create policy "programs_read_published" on public.programs for select to anon,authenticated using(status='PUBLISHED');
create policy "modules_read_published" on public.modules for select to anon,authenticated using(status='PUBLISHED');
create policy "lessons_read_published" on public.lessons for select to anon,authenticated using(status='PUBLISHED');
create policy "resources_read_published" on public.resources for select to anon,authenticated using(exists(select 1 from public.lessons l where l.id=lesson_id and l.status='PUBLISHED'));
create policy "questions_read_published" on public.questions for select to anon,authenticated using(status='PUBLISHED');
create policy "exams_read_published" on public.exams for select to anon,authenticated using(status='PUBLISHED');
create policy "exam_questions_read_published" on public.exam_questions for select to anon,authenticated using(exists(select 1 from public.exams e where e.id=exam_id and e.status='PUBLISHED'));
create policy "attempts_read_own" on public.exam_attempts for select to authenticated using(auth.uid()=learner_id);
create policy "attempts_insert_own" on public.exam_attempts for insert to authenticated with check(auth.uid()=learner_id);
create policy "attempt_answers_read_own" on public.exam_attempt_answers for select to authenticated using(exists(select 1 from public.exam_attempts a where a.id=attempt_id and a.learner_id=auth.uid()));
create policy "progress_read_own" on public.progress for select to authenticated using(auth.uid()=learner_id);
create policy "progress_insert_own" on public.progress for insert to authenticated with check(auth.uid()=learner_id);
create policy "progress_update_own" on public.progress for update to authenticated using(auth.uid()=learner_id) with check(auth.uid()=learner_id);
-- Correct answers are intentionally not readable by learners. Scoring/admin write policies require server-side implementation.
