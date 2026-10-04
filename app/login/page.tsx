"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  const input = "w-full rounded-xl border border-slate-200 bg-white p-3";

  return (
    <main className="grid min-h-[70vh] place-items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="soft-card w-full max-w-sm space-y-4 p-6"
      >
        <div>
          <p className="eyebrow">Axion Gadgets</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            Admin login
          </h1>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={input}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="btn-blue w-full disabled:opacity-50">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}