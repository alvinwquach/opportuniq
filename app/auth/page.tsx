import { AuthForm } from "./AuthForm";

interface AuthPageProps {
  searchParams: Promise<{ token?: string; group?: string }>;
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const inviteToken = params.token ?? null;
  const groupName = params.group ?? null;

  return <AuthForm inviteToken={inviteToken} groupName={groupName} />;
}
