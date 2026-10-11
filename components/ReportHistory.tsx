"use client";
import { useEffect, useState } from "react";
import { periodLabel } from "@/lib/reports/metrics";

interface ReportRow {
  id: string;
  period: string;
  createdAt: string;
}

export function ReportHistory({ clientId, refreshKey }: { clientId: string; refreshKey: number }) {
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/clients/${clientId}/reports`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        setError(false);
        setRows(data);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [clientId, refreshKey]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Report History</h3>
      {error ? (
        <p role="alert" className="text-sm text-red-600">Couldn&apos;t load reports.</p>
      ) : rows === null ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">No reports yet. Generate the first one above.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2 font-medium">Period</th>
              <th className="py-2 font-medium">Created</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3 font-medium text-slate-900">{periodLabel(r.period)}</td>
                <td className="py-3 text-slate-500">
                  {new Date(r.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                </td>
                <td className="py-3 text-right">
                  <a
                    href={`/api/clients/${clientId}/reports/${r.id}`}
                    className="text-indigo-600 hover:underline"
                    aria-label={`Download report for ${periodLabel(r.period)}`}
                  >
                    Download
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
