-- SIFLOUA security hardening and automatic learner profiles.
-- Keep profile role changes out of client-controlled updates.
drop policy if exists "profiles_update_own" on public.profiles;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Apprenant'
    ),
    'APPRENANT'::public.app_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

-- Cover foreign-key lookups identified by the Supabase performance advisor.
create index if not exists academic_levels_parent_level_idx on public.academic_levels(parent_level_id);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_id);
create index if not exists exam_attempt_answers_question_idx on public.exam_attempt_answers(question_id);
create index if not exists exam_attempts_exam_idx on public.exam_attempts(exam_id);
create index if not exists exam_questions_question_idx on public.exam_questions(question_id);
create index if not exists exams_class_idx on public.exams(class_id);
create index if not exists programs_subject_idx on public.programs(subject_id);
create index if not exists programs_track_idx on public.programs(track_id);
create index if not exists progress_lesson_idx on public.progress(lesson_id);
create index if not exists question_answers_question_idx on public.question_answers(question_id);
create index if not exists resources_lesson_idx on public.resources(lesson_id);

-- Use stable per-query auth evaluation in row-level policies.
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles
for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "attempts_read_own" on public.exam_attempts;
create policy "attempts_read_own" on public.exam_attempts
for select to authenticated using ((select auth.uid()) = learner_id);

drop policy if exists "attempts_insert_own" on public.exam_attempts;
create policy "attempts_insert_own" on public.exam_attempts
for insert to authenticated with check ((select auth.uid()) = learner_id);

drop policy if exists "attempt_answers_read_own" on public.exam_attempt_answers;
create policy "attempt_answers_read_own" on public.exam_attempt_answers
for select to authenticated using (
  exists (
    select 1 from public.exam_attempts a
    where a.id = attempt_id and a.learner_id = (select auth.uid())
  )
);

drop policy if exists "progress_read_own" on public.progress;
create policy "progress_read_own" on public.progress
for select to authenticated using ((select auth.uid()) = learner_id);

drop policy if exists "progress_insert_own" on public.progress;
create policy "progress_insert_own" on public.progress
for insert to authenticated with check ((select auth.uid()) = learner_id);

drop policy if exists "progress_update_own" on public.progress;
create policy "progress_update_own" on public.progress
for update to authenticated
using ((select auth.uid()) = learner_id)
with check ((select auth.uid()) = learner_id);
