import { redirect } from "next/navigation";

export default function HomePage() {
  // Instantly route traffic to the protected SaaS area
  redirect("/dashboard");
}