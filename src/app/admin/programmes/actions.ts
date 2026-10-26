"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/admin/programmes");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["SUPER_ADMIN", "ADMIN", "FORMATEUR"].includes(profile.role)) redirect("/apprendre?message=acces-admin-requis");
  return supabase;
}
function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export async function createLevel(formData: FormData) {
  const supabase = await requireAdmin(); const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/programmes?error=nom-niveau-requis");
  const { error } = await supabase.from("academic_levels").insert({ name, slug: slugify(name), sort_order: Number(formData.get("sort_order") ?? 0) });
  revalidatePath("/admin/programmes"); redirect(error ? "/admin/programmes?error=creation-niveau" : "/admin/programmes?success=niveau");
}
export async function createClass(formData: FormData) {
  const supabase = await requireAdmin(); const name = String(formData.get("name") ?? "").trim(); const academic_level_id = String(formData.get("academic_level_id") ?? "");
  if (!name || !academic_level_id) redirect("/admin/programmes?error=classe-incomplete");
  const { error } = await supabase.from("classes").insert({ name, slug: slugify(name), academic_level_id, sort_order: Number(formData.get("sort_order") ?? 0) });
  revalidatePath("/admin/programmes"); redirect(error ? "/admin/programmes?error=creation-classe" : "/admin/programmes?success=classe");
}
export async function createSubject(formData: FormData) {
  const supabase = await requireAdmin(); const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/programmes?error=nom-matiere-requis");
  const { error } = await supabase.from("subjects").insert({ name, slug: slugify(name), description: String(formData.get("description") ?? "").trim() || null });
  revalidatePath("/admin/programmes"); redirect(error ? "/admin/programmes?error=creation-matiere" : "/admin/programmes?success=matiere");
}
export async function createTrack(formData: FormData) {
  const supabase = await requireAdmin(); const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/admin/programmes?error=filiere-requise");
  const { error } = await supabase.from("tracks").insert({ name, slug: slugify(name), description: String(formData.get("description") ?? "").trim() || null });
  revalidatePath("/admin/programmes"); redirect(error ? "/admin/programmes?error=creation-filiere" : "/admin/programmes?success=filiere");
}
export async function createProgram(formData: FormData) {
  const supabase = await requireAdmin(); const title = String(formData.get("title") ?? "").trim(); const class_id = String(formData.get("class_id") ?? ""); const subject_id = String(formData.get("subject_id") ?? ""); const track_id = String(formData.get("track_id") ?? "").trim() || null;
  if (!title || !class_id || !subject_id) redirect("/admin/programmes?error=programme-incomplet");
  const { error } = await supabase.from("programs").insert({ title, class_id, subject_id, track_id, description: String(formData.get("description") ?? "").trim() || null, status: "DRAFT" });
  revalidatePath("/admin/programmes"); redirect(error ? "/admin/programmes?error=creation-programme" : "/admin/programmes?success=programme");
}
export async function updateProgram(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const class_id = String(formData.get("class_id") ?? "");
  const subject_id = String(formData.get("subject_id") ?? "");
  const track_id = String(formData.get("track_id") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!id || !title || !class_id || !subject_id) redirect("/admin/programmes?error=programme-incomplet");
  const { error } = await supabase.from("programs").update({ title, class_id, subject_id, track_id, description }).eq("id", id);
  revalidatePath("/admin/programmes");
  redirect(error ? "/admin/programmes?error=modification-programme" : "/admin/programmes?success=programme-modifie");
}
export async function updateProgramStatus(formData: FormData) {
  const supabase = await requireAdmin(); const id = String(formData.get("id") ?? ""); const status = String(formData.get("status") ?? "");
  const allowed = ["DRAFT", "SUBMITTED", "REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"] as const;
  if (!id || !allowed.includes(status as typeof allowed[number])) redirect("/admin/programmes?error=statut-invalide");
  const { error } = await supabase.from("programs").update({ status: status as typeof allowed[number] }).eq("id", id);
  revalidatePath("/admin/programmes"); redirect(error ? "/admin/programmes?error=modification-statut" : "/admin/programmes?success=statut");
}
export async function createModule(formData: FormData) {
  const supabase = await requireAdmin(); const title = String(formData.get("title") ?? "").trim(); const program_id = String(formData.get("program_id") ?? "");
  if (!title || !program_id) redirect("/admin/programmes?error=chapitre-incomplet");
  const { error } = await supabase.from("modules").insert({ title, program_id, description: String(formData.get("description") ?? "").trim() || null, status: "DRAFT" });
  revalidatePath("/admin/programmes"); redirect(error ? "/admin/programmes?error=creation-chapitre" : "/admin/programmes?success=chapitre");
}
export async function createLesson(formData: FormData) {
  const supabase = await requireAdmin(); const title = String(formData.get("title") ?? "").trim(); const module_id = String(formData.get("module_id") ?? "");
  if (!title || !module_id) redirect("/admin/programmes?error=lecon-incomplete");
  const { error } = await supabase.from("lessons").insert({ title, module_id, summary: String(formData.get("summary") ?? "").trim() || null, content: { format: "html", body: String(formData.get("content") ?? "").trim() }, curriculum_status: "STRUCTURED_DRAFT", status: "DRAFT" });
  revalidatePath("/admin/programmes"); redirect(error ? "/admin/programmes?error=creation-lecon" : "/admin/programmes?success=lecon");
}

export async function updateModule(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const sort_order = Number(formData.get("sort_order") ?? 0);
  if (!id || !title) redirect("/admin/programmes?error=chapitre-incomplet");
  const { error } = await supabase.from("modules").update({ title, description, sort_order }).eq("id", id);
  revalidatePath("/admin/programmes");
  redirect(error ? "/admin/programmes?error=modification-chapitre" : "/admin/programmes?success=chapitre-modifie");
}
export async function updateLesson(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim() || null;
  const body = String(formData.get("content") ?? "").trim();
  const duration = Number(formData.get("duration_minutes") ?? 0);
  const sort_order = Number(formData.get("sort_order") ?? 0);
  if (!id || !title) redirect("/admin/programmes?error=lecon-incomplete");
  const { error } = await supabase.from("lessons").update({
    title, summary, content: { format: "html", body }, duration_minutes: duration > 0 ? duration : null, sort_order
  }).eq("id", id);
  revalidatePath("/admin/programmes");
  redirect(error ? "/admin/programmes?error=modification-lecon" : "/admin/programmes?success=lecon-modifiee");
}
