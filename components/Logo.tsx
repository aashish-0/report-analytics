// Paper-plane mark on an indigo tile, plus the product name
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const tile = size === "lg" ? "h-10 w-10 rounded-xl" : "h-8 w-8 rounded-lg";
  const icon = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <span className="flex items-center gap-2 font-extrabold tracking-tight text-slate-900">
      <span className={`flex items-center justify-center bg-indigo-600 text-white ${tile}`}>
        <svg
          className={icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M22 2 11 13" />
          <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
        </svg>
      </span>
      <span className={size === "lg" ? "text-xl" : "text-lg"}>ReportPilot</span>
    </span>
  );
}
