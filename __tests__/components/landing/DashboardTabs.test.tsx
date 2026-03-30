import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock recharts
jest.mock("recharts", () => ({
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ComposedChart: ({ children }: { children: React.ReactNode }) => <div data-testid="composed-chart">{children}</div>,
}));

import { DashboardTab } from "@/components/landing/dashboard-demo/tabs/DashboardTab";
import { DiagnoseTab } from "@/components/landing/dashboard-demo/tabs/DiagnoseTab";
import { IssuesTab } from "@/components/landing/dashboard-demo/tabs/IssuesTab";
import { GroupsTab } from "@/components/landing/dashboard-demo/tabs/GroupsTab";
import { CalendarTab } from "@/components/landing/dashboard-demo/tabs/CalendarTab";
import { FinancesTab } from "@/components/landing/dashboard-demo/tabs/FinancesTab";
import { GuidesTab } from "@/components/landing/dashboard-demo/tabs/GuidesTab";
import { NewIssueTab } from "@/components/landing/dashboard-demo/tabs/NewIssueTab";

describe.skip("DashboardTab", () => {
  it("renders welcome message", () => {
    render(<DashboardTab />);
    expect(screen.getByText("Welcome back, Alex")).toBeInTheDocument();
  });

  it("renders quick stats", () => {
    render(<DashboardTab />);
    expect(screen.getByText("Budget Left")).toBeInTheDocument();
    expect(screen.getByText("DIY Saved")).toBeInTheDocument();
    expect(screen.getByText("Time Saved")).toBeInTheDocument();
    expect(screen.getByText("Issues Fixed")).toBeInTheDocument();
  });

  it("renders quick diagnose section", () => {
    render(<DashboardTab />);
    expect(screen.getByText("Quick Diagnose")).toBeInTheDocument();
    expect(screen.getByText("Photo")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Voice")).toBeInTheDocument();
  });

  it("renders weather section", () => {
    render(<DashboardTab />);
    expect(screen.getByText("45°F")).toBeInTheDocument();
    expect(screen.getByText("San Jose, CA")).toBeInTheDocument();
  });

  it("renders savings trend chart", () => {
    render(<DashboardTab />);
    expect(screen.getByText("DIY Savings Trend")).toBeInTheDocument();
  });

  it("renders recent decisions", () => {
    render(<DashboardTab />);
    expect(screen.getByText("Recent Decisions")).toBeInTheDocument();
  });
});

describe.skip("DiagnoseTab", () => {
  it("renders AI-powered diagnosis section", () => {
    render(<DiagnoseTab />);
    expect(screen.getByText("AI-Powered Diagnosis")).toBeInTheDocument();
  });

  it("renders input methods", () => {
    render(<DiagnoseTab />);
    expect(screen.getByPlaceholderText(/describe your home issue/i)).toBeInTheDocument();
  });
});

describe.skip("IssuesTab", () => {
  it("renders issue pipeline", () => {
    render(<IssuesTab />);
    expect(screen.getByText("Issue Pipeline")).toBeInTheDocument();
  });

  it("renders status columns", () => {
    render(<IssuesTab />);
    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Investigating")).toBeInTheDocument();
  });
});

describe.skip("GroupsTab", () => {
  it("renders group section", () => {
    render(<GroupsTab />);
    expect(screen.getByText("Home - Oak Street")).toBeInTheDocument();
  });

  it("renders member information", () => {
    render(<GroupsTab />);
    expect(screen.getByText(/Alex/)).toBeInTheDocument();
    expect(screen.getByText(/Jordan/)).toBeInTheDocument();
  });
});

describe.skip("CalendarTab", () => {
  it("renders calendar header", () => {
    render(<CalendarTab />);
    expect(screen.getByText(/January 2025/i)).toBeInTheDocument();
  });

  it("renders upcoming events", () => {
    render(<CalendarTab />);
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
  });
});

describe.skip("FinancesTab", () => {
  it("renders finance overview", () => {
    render(<FinancesTab />);
    // Check for finance-related content
    expect(screen.getByText(/Overview/i)).toBeInTheDocument();
  });

  it("renders budget information", () => {
    render(<FinancesTab />);
    expect(screen.getByText(/Budget/i)).toBeInTheDocument();
  });
});

describe.skip("GuidesTab", () => {
  it("renders guides section", () => {
    render(<GuidesTab />);
    expect(screen.getByText(/DIY Guides/i)).toBeInTheDocument();
  });

  it("renders guide items", () => {
    render(<GuidesTab />);
    expect(screen.getByText(/Water Heater/i)).toBeInTheDocument();
  });
});

describe.skip("NewIssueTab", () => {
  it("renders create new issue form", () => {
    render(<NewIssueTab />);
    expect(screen.getByText("Create New Issue")).toBeInTheDocument();
  });

  it("renders issue title input", () => {
    render(<NewIssueTab />);
    expect(screen.getByPlaceholderText(/issue title/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<NewIssueTab />);
    expect(screen.getByRole("button", { name: /create issue/i })).toBeInTheDocument();
  });
});
