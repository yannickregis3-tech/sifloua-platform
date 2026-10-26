"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push("/apprendre");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Connexion impossible. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell section">
      <Link href="/">← Accueil</Link>
      <article className="card" style={{ maxWidth: 460, margin: "48px auto" }}>
        <div className="eyebrow">HEUREUX DE TE REVOIR</div>
        <h1 style={{ fontFamily: "Manrope" }}>Connexion</h1>
        <p>Retrouve tes cours, tes exercices et ta progression.</p>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, marginTop: 24 }}>
          <label style={{ display: "grid", gap: 7, fontSize: 14, fontWeight: 700 }}>
            Adresse e-mail
            <input autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 7, fontSize: 14, fontWeight: 700 }}>
            Mot de passe
            <input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} style={inputStyle} />
          </label>
          {error && <p role="alert" style={{ color: "#b42318", margin: 0 }}>{error}</p>}
          <button className="btn primary" disabled={loading} type="submit" style={{ border: 0, cursor: loading ? "wait" : "pointer", width: "100%" }}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p style={{ marginTop: 24 }}>Pas encore de compte ? <Link href="/inscription" style={{ color: "var(--green)", fontWeight: 700 }}>Créer un compte</Link></p>
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
