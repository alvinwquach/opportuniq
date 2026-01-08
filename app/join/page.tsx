import { JoinClient } from "./JoinClient";

interface JoinPageProps {
  searchParams: Promise<{ token?: string; ref?: string }>;
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const params = await searchParams;
  const inviteToken = params.token ?? null;
  const urlReferralCode = params.ref ?? null;

  return <JoinClient inviteToken={inviteToken} urlReferralCode={urlReferralCode} />;
}
