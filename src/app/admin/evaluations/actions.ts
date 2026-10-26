"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/admin/evaluations");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["SUPER_ADMIN", "ADMIN", "FORMATEUR"].includes(profile.role)) redirect("/apprendre?message=acces-admin-requis");
  return supabase;
}
export async function createQuestion(formData: FormData) {
  const supabase = await requireAdmin();
  const lesson_id = String(formData.get("lesson_id") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const type = String(formData.get("type") ?? "MCQ");
  const difficulty = String(formData.get("difficulty") ?? "MEDIUM");
  const explanation = String(formData.get("explanation") ?? "").trim() || null;
  const answers = String(formData.get("answers") ?? "").split("\n").map(v=>v.trim()).filter(Boolean);
  const correctIndex = Number(formData.get("correct_index") ?? 0);
  if (!lesson_id || !prompt || answers.length < 2 || !Number.isInteger(correctIndex) || correctIndex < 1 || correctIndex > answers.length) redirect("/admin/evaluations?error=question-incomplete");
  const { data: question, error } = await supabase.from("questions").insert({ lesson_id, prompt, type, difficulty, explanation, status: "DRAFT" }).select("id").single();
  if (error || !question) redirect("/admin/evaluations?error=creation-question");
  const rows = answers.map((answer_text,i)=>({question_id:question.id,answer_text,is_correct:i+1===correctIndex,sort_order:i+1}));
  const { error: answerError } = await supabase.from("question_answers").insert(rows);
  if (answerError) {
    await supabase.from("questions").delete().eq("id",question.id);
    redirect("/admin/evaluations?error=creation-reponses");
  }
  revalidatePath("/admin/evaluations");
  redirect("/admin/evaluations?success=question");
}
export async function createExam(formData: FormData) {
  const supabase = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const class_id = String(formData.get("class_id") ?? "").trim() || null;
  const duration_minutes = Number(formData.get("duration_minutes") ?? 60);
  const passing_score = Number(formData.get("passing_score") ?? 50);
  if (!title || !Number.isInteger(duration_minutes) || duration_minutes < 1 || !Number.isFinite(passing_score) || passing_score < 0 || passing_score > 100) redirect("/admin/evaluations?error=examen-incomplet");
  const { error } = await supabase.from("exams").insert({title,description,class_id,duration_minutes,passing_score,status:"DRAFT"});
  revalidatePath("/admin/evaluations");
  redirect(error ? "/admin/evaluations?error=creation-examen" : "/admin/evaluations?success=examen");
}
export async function updateExamStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = ["DRAFT","SUBMITTED","REVIEW","APPROVED","PUBLISHED","REJECTED","ARCHIVED"];
  if (!id || !allowed.includes(status)) redirect("/admin/evaluations?error=statut-invalide");
  const { error } = await supabase.from("exams").update({status: status as "DRAFT"|"SUBMITTED"|"REVIEW"|"APPROVED"|"PUBLISHED"|"REJECTED"|"ARCHIVED"}).eq("id",id);
  revalidatePath("/admin/evaluations");
  redirect(error ? "/admin/evaluations?error=modification-examen" : "/admin/evaluations?success=statut");
}
