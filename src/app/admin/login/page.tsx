"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAdmin } from "@/actions/auth";
import { Icon } from "@/components/ui/Icon";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAdmin({ email, password });
      if (!res.success) {
        setError(res.error || "Failed to log in.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-bold text-surface-elevated shadow-xs">
            D
          </span>
          <span className="text-xl font-bold tracking-tight text-text-primary">
            DayToday<span className="text-primary">News</span>
          </span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-text-primary">
          Editorial &amp; Staff Portal
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Sign in to manage articles, staff users, and submissions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-border bg-surface-elevated px-6 py-8 shadow-sm sm:px-10">
          {error && (
            <div className="mb-6 rounded-xl border border-error/30 bg-error/10 p-3.5 text-sm text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Staff Email
              </label>
              <div className="mt-1.5">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@daytodaynews.com"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-text-primary shadow-2xs transition-colors hover:border-text-muted/40 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">
                Password
              </label>
              <div className="mt-1.5">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3.5 text-sm text-text-primary shadow-2xs transition-colors hover:border-text-muted/40 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-surface-elevated shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-60"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in to Dashboard <Icon name="arrowRight" className="size-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-center text-xs text-text-muted">
              Default Super Admin: <span className="font-mono text-text-primary">admin@daytodaynews.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
