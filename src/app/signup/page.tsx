"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-sm mx-auto mt-24 p-6">
        <h1 className="text-xl font-semibold mb-4">Check your email</h1>
        <p>We sent a confirmation link to {email}. Follow it to finish signing up.</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-24 p-6">
      <h1 className="text-xl font-semibold mb-4">Sign up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>
        {error && (
          <p role="alert" className="text-red-600 text-sm">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="border rounded px-3 py-2 disabled:opacity-50"
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
