"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CLIENTS } from "@/lib/report-data";

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full p-4">
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
        Reports
      </h2>
      <Link
        href={'/dashboard'}
        className={`mb-6 block rounded-md px-4 py-2 transition-colors ${
          pathname === '/dashboard'
            ? "bg-indigo-50 text-indigo-700 font-medium"
            : "text-slate-700 hover:bg-slate-100"
        }`}
        aria-current={pathname === '/dashboard' ? "page" : undefined}
      >
        Overview
      </Link>
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
        Active Clients
      </h2>
      <ul className="space-y-2">
        {CLIENTS.map((client) => {
          const href = `/${client.slug}`;
          const isActive = pathname === href;

          return (
          <li key={client.id}>
            <Link
              href={href}
              className={`block w-full rounded-md px-4 py-2 transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {client.name}
            </Link>
          </li>
          );
        })}
      </ul>
    </div>
  );
}