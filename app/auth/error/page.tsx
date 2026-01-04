import { AuthErrorClient } from "./AuthErrorClient";

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string; error_description?: string }>;
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const error = params.error ?? null;
  const errorDescription = params.error_description ?? null;

  return <AuthErrorClient error={error} errorDescription={errorDescription} />;
}
