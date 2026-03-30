/**
 * Fixtures for email template and sending tests
 */

export const SAMPLE_USER = {
  id: "user-abc",
  email: "user@example.com",
  name: "Jane Doe",
};

export const SAMPLE_GROUP = {
  id: "group-xyz",
  name: "The Smith Household",
};

export const SAMPLE_ISSUE = {
  id: "issue-001",
  title: "Leaky Kitchen Faucet",
  description: "The faucet under the sink has been dripping for a week.",
  category: "home_repair",
};

export const SAMPLE_DECISION_OPTIONS = [
  { title: "DIY Repair", votes: 3 },
  { title: "Hire a Plumber", votes: 1 },
  { title: "Defer", votes: 0 },
];

export const SAMPLE_INVITE_URL = "https://opportuniq.app/invite/abc123";

export const SAMPLE_MAGIC_LINK = "https://opportuniq.app/auth/callback?token=xyz789";

export const SAMPLE_REFERRAL_CODE = "REF6X9";
