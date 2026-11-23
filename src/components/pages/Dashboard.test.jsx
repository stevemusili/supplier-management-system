
import { describe, it, expect, vi, beforeEach } from "vitest";

import { render, screen, within } from "@testing-library/react";

import Dashboard from "./Dashboard";
import useDashboardData from "../../hooks/useDashboardData";

// Mock the custom hook
vi.mock("../../hooks/useDashboardData", () => ({
  default: vi.fn(),
}));

// Mock child components to test Dashboard independently
vi.mock("../dashboard/StatCard", () => ({
  default: ({ title, value }) => (
    <div data-testid="stat-card">
      <span>{title}</span>
      <span data-testid="stat-value">{value}</span>
    </div>
  ),
}));

vi.mock("../dashboard/RecentSuppliers", () => ({
  default: ({ suppliers }) => (
    <div data-testid="recent-suppliers">
      {suppliers.map((supplier) => (
        <p key={supplier.id}>{supplier.name}</p>
      ))}
    </div>
  ),
}));

const mockSuppliers = [
  {
    id: "supplier1",
    name: "Acme Ltd",
    status: "Active",
    createdAt: { toMillis: () => 1000 },
  },
  {
    id: "supplier2",
    name: "Zenith Tech",
    status: "Inactive",
    createdAt: { toMillis: () => 3000 },
  },
  {
    id: "supplier3",
    name: "Global Traders",
    status: "Active",
    createdAt: { toMillis: () => 2000 },
  },
];

const mockCategories = [
  { id: "category1", name: "Packaging" },
  { id: "category2", name: "Transport" },
];

function setDashboardData(overrides = {}) {
  useDashboardData.mockReturnValue({
    suppliers: mockSuppliers,
    categories: mockCategories,
    loading: false,
    error: "",
    ...overrides,
  });
}

function getStatValue(title) {
  const cards = screen.getAllByTestId("stat-card");

  const card = cards.find((element) =>
    within(element).queryByText(title)
  );

  expect(card).toBeDefined();

  return within(card).getByTestId("stat-value");
}

beforeEach(() => {
  vi.clearAllMocks();
  setDashboardData();
});

describe("Dashboard Page", () => {
  it("displays loading state", () => {
    setDashboardData({ loading: true });

    render(<Dashboard />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading Dashboard..."
    );

    expect(
      screen.queryByText("Dashboard Overview")
    ).not.toBeInTheDocument();
  });

  it("displays an error when data loading fails", () => {
    setDashboardData({
      error: "Unable to load dashboard data.",
    });

    render(<Dashboard />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to load dashboard data."
    );

    expect(
      screen.queryByText("Dashboard Overview")
    ).not.toBeInTheDocument();
  });

  it("prioritizes loading over errors", () => {
    setDashboardData({
      loading: true,
      error: "Unable to load dashboard data.",
    });

    render(<Dashboard />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders the dashboard heading", () => {
    render(<Dashboard />);

    expect(
      screen.getByRole("heading", {
        name: "Dashboard Overview",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Monitor and manage your suppliers.")
    ).toBeInTheDocument();
  });

  it("displays the total number of suppliers", () => {
    render(<Dashboard />);

    expect(getStatValue("Total Suppliers")).toHaveTextContent(
      "3"
    );
  });

  it("calculates active and inactive suppliers correctly", () => {
    render(<Dashboard />);

    expect(getStatValue("Active Suppliers")).toHaveTextContent(
      "2"
    );

    expect(getStatValue("Inactive Suppliers")).toHaveTextContent(
      "1"
    );
  });

  it("displays the total number of categories", () => {
    render(<Dashboard />);

    expect(getStatValue("Categories")).toHaveTextContent(
      "2"
    );
  });

  it("handles empty supplier and category collections", () => {
    setDashboardData({
      suppliers: [],
      categories: [],
    });

    render(<Dashboard />);

    expect(getStatValue("Total Suppliers")).toHaveTextContent(
      "0"
    );

    expect(getStatValue("Active Suppliers")).toHaveTextContent(
      "0"
    );

    expect(getStatValue("Inactive Suppliers")).toHaveTextContent(
      "0"
    );

    expect(getStatValue("Categories")).toHaveTextContent(
      "0"
    );

    expect(
      screen.getByTestId("recent-suppliers")
    ).toBeEmptyDOMElement();
  });

  it("sorts recent suppliers from newest to oldest", () => {
    render(<Dashboard />);

    const recent = screen.getByTestId("recent-suppliers");

    const names = within(recent)
      .getAllByText(/Acme Ltd|Zenith Tech|Global Traders/)
      .map((element) => element.textContent);

    expect(names).toEqual([
      "Zenith Tech",
      "Global Traders",
      "Acme Ltd",
    ]);
  });

  it("displays only the five most recent suppliers", () => {
    const suppliers = Array.from(
      { length: 7 },
      (_, index) => ({
        id: `supplier${index + 1}`,
        name: `Supplier ${index + 1}`,
        status: "Active",
        createdAt: {
          toMillis: () => (index + 1) * 1000,
        },
      })
    );

    setDashboardData({ suppliers });

    render(<Dashboard />);

    const recent = screen.getByTestId("recent-suppliers");

    expect(within(recent).getAllByText(/Supplier \d+/))
      .toHaveLength(5);

    expect(
      within(recent).queryByText("Supplier 1")
    ).not.toBeInTheDocument();

    expect(
      within(recent).queryByText("Supplier 2")
    ).not.toBeInTheDocument();

    expect(
      within(recent).getAllByText(/Supplier \d+/)
        .map((element) => element.textContent)
    ).toEqual([
      "Supplier 7",
      "Supplier 6",
      "Supplier 5",
      "Supplier 4",
      "Supplier 3",
    ]);
  });

  it("handles suppliers without creation timestamps", () => {
    setDashboardData({
      suppliers: [
        {
          id: "supplier1",
          name: "No Date Supplier",
          status: "Active",
        },
        {
          id: "supplier2",
          name: "Dated Supplier",
          status: "Inactive",
          createdAt: { toMillis: () => 5000 },
        },
        {
          id: "supplier3",
          name: "Null Date Supplier",
          status: "Active",
          createdAt: null,
        },
      ],
    });

    render(<Dashboard />);

    const recent = screen.getByTestId("recent-suppliers");

    const names = within(recent)
      .getAllByText(/Supplier/)
      .map((element) => element.textContent);

    expect(names).toEqual([
      "Dated Supplier",
      "No Date Supplier",
      "Null Date Supplier",
    ]);
  });
});
