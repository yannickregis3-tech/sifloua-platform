import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createLevel, createClass, createSubject, createTrack, createProgram, updateProgram, updateProgramStatus, createModule, createLesson, updateModule, updateLesson } from "./actions";

export const dynamic = "force-dynamic";
type SearchParams = Promise<{ success?: string; error?: string }>;
const statusLabels: Record<string, string> = { DRAFT: "Brouillon", SUBMITTED: "Soumis", REVIEW: "En vérification", APPROVED: "Approuvé", PUBLISHED: "Publié", REJECTED: "Refusé", ARCHIVED: "Archivé" };
const successLabels: Record<string, string> = { niveau: "Niveau créé.", classe: "Classe créée.", matiere: "Matière créée.", filiere: "Filière créée.", programme: "Programme créé en brouillon.", "programme-modifie": "Programme modifié.", statut: "Statut du programme mis à jour.", chapitre: "Chapitre créé.", lecon: "Leçon créée en brouillon.", "chapitre-modifie": "Chapitre modifié.", "lecon-modifiee": "Leçon modifiée." };
const errorLabels: Record<string, string> = { "nom-niveau-requis": "Saisis le nom du niveau.", "creation-niveau": "Impossible de créer le niveau. Vérifie les droits et l’unicité du slug.", "classe-incomplete": "Renseigne la classe et son niveau.", "creation-classe": "Impossible de créer la classe.", "nom-matiere-requis": "Saisis le nom de la matière.", "creation-matiere": "Impossible de créer la matière.", "filiere-requise": "Saisis le nom de la filière.", "creation-filiere": "Impossible de créer la filière. Vérifie les droits et l’unicité du nom.", "programme-incomplet": "Renseigne le titre, la classe et la matière.", "creation-programme": "Impossible de créer le programme.", "modification-programme": "Impossible de modifier le programme.", "statut-invalide": "Statut invalide.", "modification-statut": "Impossible de modifier le statut du programme.", "chapitre-incomplet": "Renseigne le chapitre et son programme.", "creation-chapitre": "Impossible de créer le chapitre.", "modification-chapitre": "Impossible de modifier le chapitre.", "modification-lecon": "Impossible de modifier la leçon.", "lecon-incomplete": "Renseigne le titre de la leçon et son chapitre.", "creation-lecon": "Impossible de créer la leçon." };

export default async function AdminProgrammes({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/admin/programmes");
  const { data: profile } = await supabase.from("profiles").select("role,display_name").eq("id", user.id).maybeSingle();
  if (!profile || !["SUPER_ADMIN", "ADMIN", "FORMATEUR"].includes(profile.role)) redirect("/apprendre?message=acces-admin-requis");

  const [levelsResult, classesResult, subjectsResult, tracksResult, programsResult, modulesResult, lessonsResult] = await Promise.all([
    supabase.from("academic_levels").select("id,name,sort_order").order("sort_order"),
    supabase.from("classes").select("id,name,academic_level_id,sort_order").order("sort_order"),
    supabase.from("subjects").select("id,name").order("name"),
    supabase.from("tracks").select("id,name").order("name"),
    supabase.from("programs").select("id,title,status,class_id,subject_id,track_id,description").order("title"),
    supabase.from("modules").select("id,title,program_id,description,sort_order,status").order("sort_order"),
    supabase.from("lessons").select("id,title,module_id,status,summary,content,duration_minutes,sort_order").order("sort_order"),
  ]);
  const levels = levelsResult.data ?? [], classes = classesResult.data ?? [], subjects = subjectsResult.data ?? [], tracks = tracksResult.data ?? [], programs = programsResult.data ?? [], modules = modulesResult.data ?? [], lessons = lessonsResult.data ?? [];
  const classLabel = (id: string) => classes.find((item) => item.id === id)?.name ?? "Classe inconnue";
  const subjectLabel = (id: string) => subjects.find((item) => item.id === id)?.name ?? "Matière inconnue";

  return <main className="shell section">
    <div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"center",flexWrap:"wrap"}}>
      <Link href="/">← SIFLOUA</Link><span className="eyebrow">ESPACE PÉDAGOGIQUE · {profile.role}</span>
    </div>
    <h1 style={{fontFamily:"Manrope",fontSize:"clamp(34px,5vw,54px)",letterSpacing:"-2px"}}>Administration des programmes</h1>
    <p className="section-intro">Gère les niveaux, classes, matières, filières, programmes, chapitres et leçons depuis un seul espace. Tout nouveau contenu est enregistré en brouillon jusqu’à sa validation.</p>
    {params.success && <p role="status" className="card" style={{borderColor:"#26775a"}}>{successLabels[params.success] ?? "Modification enregistrée."}</p>}
    {params.error && <p role="alert" className="card" style={{borderColor:"#c94c38"}}>{errorLabels[params.error] ?? "Une erreur est survenue. Vérifie les champs et les permissions."}</p>}
    <div className="cards">
      <article className="card"><div className="eyebrow">STRUCTURE</div><h2>{levels.length}</h2><p>Niveaux actifs ou configurés</p></article>
      <article className="card"><div className="eyebrow">PROGRAMMES</div><h2>{programs.length}</h2><p>{programs.filter(p=>p.status==="PUBLISHED").length} publiés</p></article>
      <article className="card"><div className="eyebrow">CONTENUS</div><h2>{modules.length} chapitres · {lessons.length} leçons</h2><p>Contenus reliés aux programmes</p></article>
    </div>
    <section className="section">
      <div className="eyebrow">01 · STRUCTURE SCOLAIRE</div><h2 style={{fontFamily:"Manrope"}}>Niveaux, classes et matières</h2>
      <div className="cards">
        <article className="card"><h3>Ajouter un niveau</h3><form action={createLevel} className="admin-form"><label>Nom du niveau<input name="name" placeholder="Ex. Collège" required /></label><label>Ordre d’affichage<input name="sort_order" type="number" defaultValue="0" /></label><button className="btn primary">Créer le niveau</button></form></article>
        <article className="card"><h3>Ajouter une classe</h3><form action={createClass} className="admin-form"><label>Nom de la classe<input name="name" placeholder="Ex. 3e" required /></label><label>Niveau<select name="academic_level_id" required defaultValue=""><option value="" disabled>Choisir</option>{levels.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label><label>Ordre<input name="sort_order" type="number" defaultValue="0" /></label><button className="btn primary">Créer la classe</button></form></article>
        <article className="card"><h3>Ajouter une matière</h3><form action={createSubject} className="admin-form"><label>Nom<input name="name" placeholder="Ex. Mathématiques" required /></label><label>Description<textarea name="description" rows={2} /></label><button className="btn primary">Créer la matière</button></form></article>
        <article className="card"><h3>Ajouter une filière</h3><form action={createTrack} className="admin-form"><label>Nom de la filière<input name="name" placeholder="Ex. Série D" required /></label><label>Description<textarea name="description" rows={2} placeholder="Série, spécialité ou parcours" /></label><button className="btn primary">Créer la filière</button></form></article>
      </div>
    </section>
    <section className="section">
      <div className="eyebrow">02 · PROGRAMMES OFFICIELS</div><h2 style={{fontFamily:"Manrope"}}>Créer et gérer les programmes</h2>
      <article className="card"><form action={createProgram} className="admin-form">
        <label>Titre du programme<input name="title" placeholder="Ex. Programme de mathématiques — 3e" required /></label>
        <label>Classe<select name="class_id" required defaultValue=""><option value="" disabled>Choisir une classe</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name} · {levels.find(l=>l.id===c.academic_level_id)?.name ?? "Niveau"}</option>)}</select></label>
        <label>Matière<select name="subject_id" required defaultValue=""><option value="" disabled>Choisir une matière</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label>Filière (facultatif)<select name="track_id" defaultValue=""><option value="">Toutes / sans filière</option>{tracks.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <label>Description<textarea name="description" rows={3} placeholder="Objectifs et référence du programme" /></label>
        <button className="btn primary">Créer le programme en brouillon</button>
      </form></article>
      <div className="cards">{programs.map(p=><article className="card" key={p.id}><div className="eyebrow">{statusLabels[p.status] ?? p.status}</div><h3>{p.title}</h3><p>{classLabel(p.class_id)} · {subjectLabel(p.subject_id)}{p.track_id ? " · " + (tracks.find(t=>t.id===p.track_id)?.name ?? "Filière") : ""}</p><details style={{marginTop:12}}><summary style={{cursor:"pointer",fontWeight:700}}>Modifier le programme</summary><form action={updateProgram} className="admin-form"><input type="hidden" name="id" value={p.id}/><label>Titre<input name="title" required defaultValue={p.title}/></label><label>Classe<select name="class_id" required defaultValue={p.class_id}>{classes.map(c=><option key={c.id} value={c.id}>{c.name} · {levels.find(l=>l.id===c.academic_level_id)?.name ?? "Niveau"}</option>)}</select></label><label>Matière<select name="subject_id" required defaultValue={p.subject_id}>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Filière<select name="track_id" defaultValue={p.track_id ?? ""}><option value="">Toutes / sans filière</option>{tracks.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label><label>Description<textarea name="description" rows={3} defaultValue={p.description ?? ""}/></label><button className="btn secondary">Enregistrer les modifications</button></form></details><form action={updateProgramStatus} className="admin-form"><input type="hidden" name="id" value={p.id}/><label>Statut<select name="status" defaultValue={p.status}>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><button className="btn secondary">Mettre à jour</button></form><form action={createModule} className="admin-form"><input type="hidden" name="program_id" value={p.id}/><label>Ajouter un chapitre<input name="title" placeholder="Titre du chapitre" required/></label><label>Description<textarea name="description" rows={2}/></label><button className="btn secondary">Ajouter le chapitre</button></form><div style={{marginTop:14}}>{modules.filter(m=>m.program_id===p.id).map(m=><div key={m.id} style={{borderTop:"1px solid var(--line)",paddingTop:12,marginTop:12}}><b>{m.title}</b><details style={{marginTop:8}}><summary style={{cursor:"pointer"}}>Modifier le chapitre</summary><form action={updateModule} className="admin-form"><input type="hidden" name="id" value={m.id}/><label>Titre<input name="title" required defaultValue={m.title}/></label><label>Description<textarea name="description" rows={2} defaultValue={m.description ?? ""}/></label><label>Ordre<input type="number" name="sort_order" defaultValue={m.sort_order}/></label><button className="btn secondary">Enregistrer le chapitre</button></form></details><form action={createLesson} className="admin-form"><input type="hidden" name="module_id" value={m.id}/><label>Titre de la leçon<input name="title" required placeholder="Ex. Introduction"/></label><label>Résumé<textarea name="summary" rows={2}/></label><label>Contenu de la leçon<textarea name="content" rows={5} placeholder="Rédige le contenu textuel du cours ici."/></label><button className="btn secondary">Créer la leçon</button></form>{lessons.filter(l=>l.module_id===m.id).map(l=><details key={l.id} style={{marginTop:10,padding:10,border:"1px solid var(--line)",borderRadius:12}}><summary style={{cursor:"pointer",fontSize:13,fontWeight:700}}>{l.title} — {statusLabels[l.status] ?? l.status} · Modifier</summary><form action={updateLesson} className="admin-form"><input type="hidden" name="id" value={l.id}/><label>Titre<input name="title" required defaultValue={l.title}/></label><label>Résumé<textarea name="summary" rows={2} defaultValue={l.summary ?? ""}/></label><label>Contenu<textarea name="content" rows={6} defaultValue={typeof l.content === "object" && l.content !== null && "body" in l.content ? String(l.content.body ?? "") : ""}/></label><label>Durée (minutes)<input type="number" min="0" name="duration_minutes" defaultValue={l.duration_minutes ?? 0}/></label><label>Ordre<input type="number" name="sort_order" defaultValue={l.sort_order}/></label><button className="btn secondary">Enregistrer la leçon</button></form></details>)}</div>)}</div></article>)}</div>
    </section>
    <p className="section-intro">Connecté en tant que {profile.display_name ?? user.email}. Les opérations sont contrôlées côté serveur ; les règles RLS de Supabase restent actives.</p>
  </main>;
}
