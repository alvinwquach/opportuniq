import { SignupClient } from "./SignupClient";

interface SignupPageProps {
  searchParams: Promise<{ token?: string; group?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const inviteToken = params.token ?? null;
  const groupName = params.group ?? null;

  return <SignupClient inviteToken={inviteToken} groupName={groupName} />;
}
