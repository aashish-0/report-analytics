"use client";

export function GenerateMonthlyReportButton() {
  return (
    <button
      onClick={() => alert("Triggering headless browser to generate PDF...")}
      className="rounded-md bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
    >
      Generate Monthly Report
    </button>
  );
}