export default function ClientLoading() {
  return (
    <section className="max-w-5xl animate-pulse space-y-8" aria-busy="true" aria-label="Loading client report">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-8 w-56 rounded bg-slate-200" />
          <div className="h-4 w-64 rounded bg-slate-200" />
        </div>
        <div className="h-10 w-36 rounded bg-slate-200" />
      </div>
      <div className="space-y-5 border-y border-slate-200 py-5">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="h-52 rounded bg-slate-100" />
      </div>
      <div className="space-y-5 border-y border-slate-200 py-5">
        <div className="h-5 w-36 rounded bg-slate-200" />
        {[1, 2, 3].map((row) => (
          <div key={row} className="h-3 rounded bg-slate-100" />
        ))}
      </div>
    </section>
  );
}