import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock recharts to avoid SSR issues in tests
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

// Import the actual component (not the dynamic wrapper)
import { DashboardDemo } from "@/components/landing/DashboardDemo";

describe.skip("DashboardDemo Component", () => {
  it("renders without crashing", () => {
    render(<DashboardDemo />);
    expect(screen.getByText("Your Decision Command Center")).toBeInTheDocument();
  });

  it("renders the sidebar with all navigation tabs", () => {
    render(<DashboardDemo />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Diagnose")).toBeInTheDocument();
    expect(screen.getByText("Issues")).toBeInTheDocument();
    expect(screen.getByText("Groups")).toBeInTheDocument();
    expect(screen.getByText("Calendar")).toBeInTheDocument();
    expect(screen.getByText("Finances")).toBeInTheDocument();
    expect(screen.getByText("Guides")).toBeInTheDocument();
  });

  it("renders the New Issue button", () => {
    render(<DashboardDemo />);
    expect(screen.getByText("New Issue")).toBeInTheDocument();
  });

  it("renders the OpportunIQ logo", () => {
    render(<DashboardDemo />);
    expect(screen.getByText("OpportunIQ")).toBeInTheDocument();
  });

  it("shows dashboard tab content by default", () => {
    render(<DashboardDemo />);
    expect(screen.getByText("Welcome back, Alex")).toBeInTheDocument();
  });

  it("switches to Issues tab when clicked", async () => {
    render(<DashboardDemo />);

    const issuesTab = screen.getByRole("button", { name: /Issues/i });
    fireEvent.click(issuesTab);

    await waitFor(() => {
      // Issues tab should show issue-related content
      expect(screen.getByText(/Issue Pipeline/i)).toBeInTheDocument();
    });
  });

  it("switches to Diagnose tab when clicked", async () => {
    render(<DashboardDemo />);

    const diagnoseTab = screen.getByRole("button", { name: /Diagnose/i });
    fireEvent.click(diagnoseTab);

    await waitFor(() => {
      // Diagnose tab should show new diagnosis button
      expect(screen.getByText("New Diagnosis")).toBeInTheDocument();
    });
  });

  it("switches to New Issue tab when button clicked", async () => {
    render(<DashboardDemo />);

    const newIssueButton = screen.getByRole("button", { name: /New Issue/i });
    fireEvent.click(newIssueButton);

    await waitFor(() => {
      expect(screen.getByText("Report New Issue")).toBeInTheDocument();
    });
  });

  it("displays the time value stat in sidebar", () => {
    render(<DashboardDemo />);
    expect(screen.getByText("$45/hr")).toBeInTheDocument();
  });

  it("displays the net saved stat in sidebar", () => {
    render(<DashboardDemo />);
    expect(screen.getByText("$272")).toBeInTheDocument();
  });

  it("renders the CTA link below the demo", () => {
    render(<DashboardDemo />);
    expect(screen.getByText(/Learn how decisions compound over time/i)).toBeInTheDocument();
  });
});

describe.skip("DashboardDemo Tab Navigation", () => {
  it("highlights the active tab", () => {
    render(<DashboardDemo />);

    const dashboardTab = screen.getByRole("button", { name: /Dashboard/i });
    expect(dashboardTab).toHaveClass("bg-blue-50");
  });

  it("switches tabs correctly through all tabs", async () => {
    render(<DashboardDemo />);

    const tabs = ["Dashboard", "Diagnose", "Issues", "Groups", "Calendar", "Finances", "Guides"];

    for (const tabName of tabs) {
      const tab = screen.getByRole("button", { name: new RegExp(tabName, "i") });
      fireEvent.click(tab);

      await waitFor(() => {
        expect(tab).toHaveClass("bg-blue-50");
      });
    }
  });
});

describe.skip("DashboardDemo Accessibility", () => {
  it("all navigation buttons are accessible via keyboard", () => {
    render(<DashboardDemo />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("type", "button");
    });
  });

  it("has proper section heading", () => {
    render(<DashboardDemo />);

    const heading = screen.getByRole("heading", { name: /Your Decision Command Center/i });
    expect(heading).toBeInTheDocument();
  });
});
