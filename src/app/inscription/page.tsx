"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Signup() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName.trim() },
          emailRedirectTo: `${window.location.origin}/connexion`,
        },
      });
      if (authError) throw authError;
      if (data.session) {
        router.push("/apprendre");
        router.refresh();
      } else {
        setNotice("Compte créé. Consulte ta boîte e-mail pour confirmer ton adresse avant de te connecter.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Création du compte impossible. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell section">
      <Link href="/">← Accueil</Link>
      <article className="card" style={{ maxWidth: 460, margin: "48px auto" }}>
        <div className="eyebrow">TON PARCOURS COMMENCE ICI</div>
        <h1 style={{ fontFamily: "Manrope" }}>Créer un compte</h1>
        <p>Un compte pour apprendre à ton rythme et suivre tes progrès.</p>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, marginTop: 24 }}>
          <label style={{ display: "grid", gap: 7, fontSize: 14, fontWeight: 700 }}>
            Nom complet
            <input autoComplete="name" required maxLength={100} value={displayName} onChange={(event) => setDisplayName(event.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 7, fontSize: 14, fontWeight: 700 }}>
            Adresse e-mail
            <input autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 7, fontSize: 14, fontWeight: 700 }}>
            Mot de passe (8 caractères minimum)
            <input autoComplete="new-password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} style={inputStyle} />
          </label>
          {error && <p role="alert" style={{ color: "#b42318", margin: 0 }}>{error}</p>}
          {notice && <p role="status" style={{ color: "var(--green)", margin: 0 }}>{notice}</p>}
          <button className="btn primary" disabled={loading} type="submit" style={{ border: 0, cursor: loading ? "wait" : "pointer", width: "100%" }}>
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>
        <p style={{ marginTop: 24 }}>Déjà inscrit ? <Link href="/connexion" style={{ color: "var(--green)", fontWeight: 700 }}>Se connecter</Link></p>
      </article>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  border: "1px solid var(--line)",
  borderRadius: 10,
  background: "#fff",
  color: "var(--ink)",
  font: "inherit",
};
