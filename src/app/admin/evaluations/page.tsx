import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createExam, createQuestion, updateExamStatus } from "./actions";

export const dynamic = "force-dynamic";
type Params = Promise<{ success?: string; error?: string }>;
const labels: Record<string,string> = { question:"Question créée avec ses réponses.", examen:"Évaluation créée en brouillon.", statut:"Statut mis à jour." };
const errors: Record<string,string> = { "question-incomplete":"Complète la question et au moins deux réponses, puis indique le numéro de la bonne réponse.", "creation-question":"La question n’a pas pu être enregistrée.", "creation-reponses":"Les réponses n’ont pas pu être enregistrées.", "examen-incomplet":"Vérifie le titre, la durée et le seuil de réussite.", "creation-examen":"L’évaluation n’a pas pu être enregistrée.", "statut-invalide":"Statut non autorisé.", "modification-examen":"Impossible de modifier le statut." };
const statuses = ["DRAFT","SUBMITTED","REVIEW","APPROVED","PUBLISHED","REJECTED","ARCHIVED"];
export default async function Evaluations({searchParams}:{searchParams:Params}) {
 const params=await searchParams; const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) redirect("/connexion?next=/admin/evaluations");
 const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();
 if(!profile || !["SUPER_ADMIN","ADMIN","FORMATEUR"].includes(profile.role)) redirect("/apprendre?message=acces-admin-requis");
 const [lessonsR,classesR,examsR,questionsR,answersR]=await Promise.all([
  supabase.from("lessons").select("id,title,module_id").order("title"),
  supabase.from("classes").select("id,name").order("sort_order"),
  supabase.from("exams").select("id,title,description,class_id,duration_minutes,passing_score,status,created_at").order("created_at",{ascending:false}),
  supabase.from("questions").select("id,lesson_id,prompt,type,difficulty,explanation,status,created_at").order("created_at",{ascending:false}),
  supabase.from("question_answers").select("id,question_id,answer_text,is_correct,sort_order").order("sort_order")
 ]);
 const lessons=lessonsR.data??[], classes=classesR.data??[], exams=examsR.data??[], questions=questionsR.data??[], answers=answersR.data??[];
 const lessonName=(id:string)=>lessons.find(l=>l.id===id)?.title??"Leçon";
 return <main className="shell section">
  <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><Link href="/">← SIFLOUA</Link><Link href="/admin/programmes">Administration des programmes →</Link></div>
  <p className="eyebrow">ESPACE PÉDAGOGIQUE · {profile.role}</p><h1 style={{fontFamily:"Manrope",fontSize:"clamp(34px,5vw,52px)",letterSpacing:"-2px"}}>Examens et évaluations</h1>
  <p className="section-intro">Prépare une banque de QCM et crée les évaluations. Tout nouvel élément reste en brouillon jusqu’à sa validation.</p>
  {params.success&&<p role="status" className="card" style={{borderColor:"#26775a"}}>{labels[params.success]??"Opération réussie."}</p>}
  {params.error&&<p role="alert" className="card" style={{borderColor:"#c94c38"}}>{errors[params.error]??"Une erreur est survenue. Vérifie les champs et les permissions."}</p>}
  <div className="cards"><article className="card"><div className="eyebrow">BANQUE</div><h2>{questions.length}</h2><p>Questions enregistrées</p></article><article className="card"><div className="eyebrow">ÉVALUATIONS</div><h2>{exams.length}</h2><p>{exams.filter(e=>e.status==="PUBLISHED").length} publiées</p></article><article className="card"><div className="eyebrow">CONTENU</div><h2>{lessons.length}</h2><p>Leçons disponibles pour associer des questions</p></article></div>
  <section className="section"><p className="eyebrow">01 · BANQUE DE QUESTIONS</p><h2 style={{fontFamily:"Manrope"}}>Créer une question à choix multiples</h2>
   <article className="card"><form action={createQuestion} className="admin-form">
    <label>Leçon associée<select name="lesson_id" required defaultValue=""><option value="" disabled>Choisir une leçon</option>{lessons.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}</select></label>
    <label>Énoncé<textarea name="prompt" rows={4} required placeholder="Écris la question…"/></label>
    <label>Réponses (une par ligne, au moins deux)<textarea name="answers" rows={5} required placeholder={"Réponse A\nRéponse B\nRéponse C\nRéponse D"}/></label>
    <label>Numéro de la bonne réponse<input name="correct_index" type="number" min="1" defaultValue="1" required/></label>
    <label>Difficulté<select name="difficulty" defaultValue="MEDIUM"><option value="EASY">Facile</option><option value="MEDIUM">Moyenne</option><option value="HARD">Difficile</option></select></label>
    <label>Explication de la correction<textarea name="explanation" rows={3} placeholder="Explique pourquoi cette réponse est correcte."/></label>
    <input type="hidden" name="type" value="MCQ"/><button className="btn primary">Enregistrer la question</button>
   </form></article>
   <div className="cards">{questions.map(q=><article className="card" key={q.id}><div className="eyebrow">{q.status??"Question"} · {q.difficulty??"Difficulté non définie"}</div><h3>{q.prompt}</h3><p>Leçon : {lessonName(q.lesson_id)}</p><ol>{answers.filter(a=>a.question_id===q.id).map(a=><li key={a.id} style={{marginBottom:6}}>{a.answer_text} {a.is_correct?"✓ Bonne réponse":""}</li>)}</ol>{q.explanation&&<details><summary>Voir l’explication</summary><p>{q.explanation}</p></details>}</article>)}</div>
  </section>
  <section className="section"><p className="eyebrow">02 · ÉVALUATIONS</p><h2 style={{fontFamily:"Manrope"}}>Créer une évaluation</h2>
   <article className="card"><form action={createExam} className="admin-form"><label>Titre<input name="title" required placeholder="Ex. Évaluation de mathématiques — 3e"/></label><label>Description<textarea name="description" rows={3}/></label><label>Classe (facultatif)<select name="class_id" defaultValue=""><option value="">Toutes les classes / non précisée</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Durée en minutes<input name="duration_minutes" type="number" min="1" defaultValue="60" required/></label><label>Seuil de réussite (%)<input name="passing_score" type="number" min="0" max="100" defaultValue="50" required/></label><button className="btn primary">Créer en brouillon</button></form></article>
   <div className="cards">{exams.map(e=><article className="card" key={e.id}><div className="eyebrow">{e.status}</div><h3>{e.title}</h3><p>{e.description||"Aucune description."}</p><p>{classes.find(c=>c.id===e.class_id)?.name??"Classe non précisée"} · {e.duration_minutes??60} min · réussite à {e.passing_score??50}%</p><form action={updateExamStatus} className="admin-form"><input type="hidden" name="id" value={e.id}/><label>Statut<select name="status" defaultValue={e.status}>{statuses.map(s=><option key={s} value={s}>{s}</option>)}</select></label><button className="btn secondary">Mettre à jour</button></form></article>)}</div>
  </section>
 </main>;
}