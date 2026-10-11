import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/Logo";

const STEPS = [
  {
    title: "Connect once",
    body: "Link each client's Meta Ads account a single time.",
    icon: <path d="M12 22v-5M9 8V2M15 8V2M18 8v5a6 6 0 0 1-12 0V8Z" />,
  },
  {
    title: "Pick metrics",
    body: "Choose spend, CPA, ROAS, clicks or impressions per client.",
    icon: <path d="M3 3v18h18M8 17v-5M13 17V8M18 17v-9" />,
  },
  {
    title: "One-click PDF",
    body: "Generate a clean, branded monthly report ready to send.",
    icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h8" />,
  },
];

export default async function HomePage() {
  // Signed-in agencies skip the marketing page
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav aria-label="Account" className="flex items-center gap-2">
          <Link href="/sign-in" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900">
            Log in
          </Link>
          <Link
            href="/sign-in?mode=signup"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 transition"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600">For marketing agencies</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
          Stop hand-building monthly ad reports.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          ReportPilot turns your clients&apos; Meta Ads data into polished, branded PDF reports — in one click.
        </p>
        <div className="mt-8">
          <Link
            href="/sign-in?mode=signup"
            className="inline-block rounded-md bg-indigo-600 px-6 py-3 font-medium text-white shadow hover:bg-indigo-700 transition"
          >
            Create your agency account
          </Link>
        </div>

        <section aria-labelledby="how" className="mt-24">
          <h2 id="how" className="sr-only">How it works</h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      {s.icon}
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-slate-500">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
