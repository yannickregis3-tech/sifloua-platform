import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const fallbackLevels = [
  { title: "Maternelle & primaire", description: "Éveil, langage, lecture et fondamentaux.", slug: "primaire" },
  { title: "Collège", description: "De la 6e à la 3e, avec préparation au BEPC.", slug: "college" },
  { title: "Lycée", description: "Seconde, Première et Terminale, parcours par série.", slug: "lycee" },
  { title: "Supérieur & CPGE", description: "BTS et classes préparatoires.", slug: "superieur" },
  { title: "Concours", description: "Préparation aux concours et recrutements.", slug: "concours" },
];

export const dynamic = "force-dynamic";

export default async function Learn() {
  let levels = fallbackLevels;
  let catalogReady = false;
  let publishedPrograms = 0;
  let publishedLessons = 0;

  try {
    const supabase = await createClient();
    const [{ data: dbLevels, error: levelsError }, { count: programCount }, { count: lessonCount }] = await Promise.all([
      supabase.from("academic_levels").select("id,name,slug,sort_order").eq("is_active", true).order("sort_order"),
      supabase.from("programs").select("id", { count: "exact", head: true }).eq("status", "PUBLISHED"),
      supabase.from("lessons").select("id", { count: "exact", head: true }).eq("status", "PUBLISHED"),
    ]);
    if (!levelsError && dbLevels?.length) {
      levels = dbLevels.map((level) => ({
        title: level.name,
        description: fallbackLevels.find((item) => item.slug === level.slug)?.description ?? "Cours, exercices et ressources organisés par niveau.",
        slug: level.slug,
      }));
      catalogReady = true;
    }
    publishedPrograms = programCount ?? 0;
    publishedLessons = lessonCount ?? 0;
  } catch {
    // Le catalogue reste consultable même si la connexion à la base est momentanément indisponible.
  }

  return (
    <main className="shell section">
      <Link href="/">← Retour à l’accueil</Link>
      <div className="eyebrow" style={{ marginTop: 40 }}>CHOISIS TON PARCOURS</div>
      <h1 style={{ fontFamily: "Manrope", fontSize: "clamp(38px,6vw,60px)", letterSpacing: "-2px" }}>Où veux-tu progresser ?</h1>
      <p className="section-intro">
        Explore les parcours scolaires et les préparations aux concours. Les cours publiés seront accessibles dès leur validation pédagogique.
      </p>
      <div className="cards">
        {levels.map((level) => (
          <article className="card" key={level.slug}>
            <div className="eyebrow">PARCOURS</div>
            <h3>{level.title}</h3>
            <p>{level.description}</p>
            <small>{catalogReady ? "Parcours connecté au catalogue" : "Parcours en préparation"}</small>
          </article>
        ))}
      </div>
      <section className="section" style={{ paddingBottom: 20 }}>
        <div className="eyebrow">CATALOGUE PÉDAGOGIQUE</div>
        <h2 style={{ fontFamily: "Manrope", fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-1.5px" }}>Des contenus organisés, du primaire aux concours.</h2>
        <p className="section-intro">
          Chaque cours sera structuré par niveau, classe, série si nécessaire, matière, programme, chapitre et leçon. Les exercices, sujets d’examen et ressources seront rattachés aux leçons correspondantes.
        </p>
        <div className="cards">
          <article className="card"><h3>{publishedPrograms}</h3><p>Programmes publiés</p></article>
          <article className="card"><h3>{publishedLessons}</h3><p>Leçons publiées</p></article>
          <article className="card"><h3>BEPC · BAC · BTS</h3><p>Préparations prévues dans le catalogue évolutif.</p></article>
        </div>
      </section>
      <div className="actions">
        <Link className="btn primary" href="/inscription">Créer un compte</Link>
        <Link className="btn secondary" href="/connexion">Se connecter</Link>
      </div>
    </main>
  );
}
