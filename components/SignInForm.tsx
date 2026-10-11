"use client";
import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/Logo";

export function SignInForm({ initialSignup }: { initialSignup: boolean }) {
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(initialSignup);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        const { data, error } = await authClient.signUp.email({
          email,
          password,
          name: agencyName.trim(),
        });

        if (error) {
          alert(error.message || "Failed to sign up.");
          setLoading(false);
          return;
        }

        // Hard redirect forces Next.js middleware to pick up the session cookie
        window.location.href = "/dashboard";
      } else {
        const { data, error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          alert(error.message || "Invalid credentials.");
          setLoading(false);
          return;
        }

        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-slate-50">
      <header className="absolute left-0 top-0 px-6 py-5">
        <Link href="/" aria-label="ReportPilot home">
          <Logo />
        </Link>
      </header>
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-slate-900">
          {isRegistering ? "Create Agency Account" : "Agency Login"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label htmlFor="agency-name" className="block text-sm font-medium text-slate-700">Agency name</label>
              <input
                id="agency-name"
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                maxLength={100}
                placeholder="e.g. Brightside Marketing"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : isRegistering ? "Sign Up" : "Sign In"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full text-sm text-indigo-600 mt-4 hover:underline"
        >
          {isRegistering ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
}