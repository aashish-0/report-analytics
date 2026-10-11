import { SignInForm } from "@/components/SignInForm";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  return <SignInForm initialSignup={mode === "signup"} />;
}
