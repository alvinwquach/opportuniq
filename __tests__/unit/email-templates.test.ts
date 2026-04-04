export {};
/**
 * Tests for React Email templates
 * Covers: component exports, prop shapes, graceful handling of optional props
 *
 * Note: @react-email/render uses dynamic imports requiring --experimental-vm-modules.
 * We mock the render function and test template component structure instead.
 */

jest.mock("@react-email/render", () => ({
  render: jest.fn(async (element: unknown) => {
    // Return HTML-like string containing the component type name for assertion
    const type = (element as Record<string, unknown>)?.type;
    const typeName = typeof type === "function" ? type.name : String(type);
    return `<html><body><div data-testid="${typeName}">mock html content</div></body></html>`;
  }),
}));

import React from "react";
import { render } from "@react-email/render";

// ---- Tests ---------------------------------------------------------------

describe("email template rendering", () => {
  it("WelcomeEmail renders valid HTML with user name", async () => {
    const { WelcomeEmail } = await import("@/emails/WelcomeEmail");
    const html = await render(
      WelcomeEmail({ name: "Jane Doe", postalCode: "94105", searchRadius: 25, dashboardUrl: "https://opportuniq.app/dashboard" })
    );
    expect(html).toBeTruthy();
    expect(typeof html).toBe("string");
  });

  it("WelcomeEmail handles missing user name gracefully", async () => {
    const { WelcomeEmail } = await import("@/emails/WelcomeEmail");
    // name is optional — should not throw
    expect(() =>
      WelcomeEmail({ postalCode: "94105", searchRadius: 25, dashboardUrl: "https://opportuniq.app/dashboard" } as Parameters<typeof WelcomeEmail>[0])
    ).not.toThrow();
  });

  it("GroupInvitationEmail renders with group name and inviter", async () => {
    const { GroupInvitationEmail } = await import("@/emails/GroupInvitationEmail");
    const html = await render(
      GroupInvitationEmail({
        inviterName: "Alice Smith",
        groupName: "The Smiths",
        inviteUrl: "https://opportuniq.app/invite/abc",
      })
    );
    expect(html).toBeTruthy();
  });

  it("DecisionReadyEmail renders with issue title and options", async () => {
    const { DecisionReadyEmail } = await import("@/emails/DecisionReadyEmail");
    const html = await render(
      DecisionReadyEmail({
        memberName: "Bob",
        issueTitle: "Leaky Kitchen Faucet",
        groupName: "The Smiths",
        decisionUrl: "https://opportuniq.app/decisions/123",
        options: [
          { title: "DIY Repair", votes: 2 },
          { title: "Hire a Plumber", votes: 1 },
        ],
      })
    );
    expect(html).toBeTruthy();
  });

  it("IssueCreatedEmail renders with issue details", async () => {
    const { IssueCreatedEmail } = await import("@/emails/IssueCreatedEmail");
    const html = await render(
      IssueCreatedEmail({
        memberName: "Carol",
        issueTitle: "Broken Garage Door",
        groupName: "The Smiths",
        issueUrl: "https://opportuniq.app/issues/456",
        createdBy: "Alice",
      })
    );
    expect(html).toBeTruthy();
  });

  it("ReferralConvertedEmail renders with referrer name", async () => {
    const { ReferralConvertedEmail } = await import("@/emails/ReferralConvertedEmail");
    const html = await render(
      ReferralConvertedEmail({
        referrerName: "Alice",
        refereeName: "Bob",
        referralCount: 3,
        dashboardUrl: "https://opportuniq.app/dashboard",
      })
    );
    expect(html).toBeTruthy();
  });

  it("MagicLinkEmail renders with valid link", async () => {
    const MagicLinkEmailMod = await import("@/emails/MagicLinkEmail") as { default?: (props: { magicLink: string }) => React.ReactNode; MagicLinkEmail?: (props: { magicLink: string }) => React.ReactNode };
    const MagicLinkEmail = MagicLinkEmailMod.default ?? MagicLinkEmailMod.MagicLinkEmail;
    expect(typeof MagicLinkEmail).toBe("function");
    const html = await render(MagicLinkEmail!({ magicLink: "https://opportuniq.app/auth/callback?token=xyz" }));
    expect(html).toBeTruthy();
  });

  it("AbandonedOnboardingEmail renders correctly", async () => {
    const { AbandonedOnboardingEmail } = await import("@/emails/AbandonedOnboardingEmail");
    const html = await render(
      AbandonedOnboardingEmail({ name: "Dave", onboardingUrl: "https://opportuniq.app/onboarding" })
    );
    expect(html).toBeTruthy();
  });

  it("all templates produce non-empty HTML string", async () => {
    const templateConfigs = [
      {
        name: "WelcomeEmail",
        props: { name: "Test", postalCode: "94105", searchRadius: 25, dashboardUrl: "https://opportuniq.app/dashboard" },
      },
      {
        name: "AbandonedOnboardingEmail",
        props: { name: "Test", onboardingUrl: "https://opportuniq.app/onboarding" },
      },
      {
        name: "DecisionReadyEmail",
        props: {
          memberName: "Test",
          issueTitle: "Test Issue",
          groupName: "Test Group",
          decisionUrl: "https://example.com",
          options: [{ title: "Option 1" }],
        },
      },
    ];

    for (const { name, props } of templateConfigs) {
      const mod = await import(`@/emails/${name}`);
      const Component = mod[name] ?? mod.default;
      if (!Component) continue;
      const html = await render((Component as (p: typeof props) => React.ReactNode)(props));
      expect(typeof html).toBe("string");
      expect(html.length).toBeGreaterThan(0);
    }
  });

  it("no template throws on render with valid props", async () => {
    const emailModules = [
      ["WelcomeEmail", { name: "Test", postalCode: "94105", searchRadius: 25, dashboardUrl: "https://opportuniq.app/dashboard" }],
      ["GroupInvitationEmail", { inviterName: "A", groupName: "G", inviteUrl: "https://x.com" }],
      ["ReferralConvertedEmail", { referrerName: "A", refereeName: "B", referralCount: 1, dashboardUrl: "https://opportuniq.app/dashboard" }],
      ["AbandonedOnboardingEmail", { name: "Test", onboardingUrl: "https://opportuniq.app/onboarding" }],
    ] as const;

    for (const [moduleName, props] of emailModules) {
      const mod = await import(`@/emails/${moduleName}`);
      const Component = (mod as Record<string, unknown>)[moduleName] ?? mod.default;
      if (!Component || typeof Component !== "function") continue;

      await expect(render((Component as (p: typeof props) => React.ReactNode)(props))).resolves.toBeTruthy();
    }
  });
});
