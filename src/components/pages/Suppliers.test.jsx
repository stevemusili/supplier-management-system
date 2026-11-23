
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Suppliers from "./Suppliers";
import useSuppliers from "../../hooks/useSuppliers";
import { deleteSupplier } from "../../services/supplierService";

// Mock the supplier hook
vi.mock("../../hooks/useSuppliers", () => ({
  default: vi.fn(),
}));

// Mock Firebase delete function
vi.mock("../../services/supplierService", () => ({
  deleteSupplier: vi.fn(),
}));

// Mock SupplierTable to isolate page functionality
vi.mock("../suppliers/SupplierTable", () => ({
  default: ({ suppliers, onDelete }) => (
    <div>
      {suppliers.map((supplier) => (
        <div key={supplier.id}>
          <span>{supplier.name}</span>
          <button onClick={() => onDelete(supplier)}>
            Delete {supplier.name}
          </button>
        </div>
      ))}
    </div>
  ),
}));

const mockSuppliers = [
  {
    id: "1",
    name: "Acme Ltd",
    email: "acmeltd@gmail.com",
    phone: "0712345678",
    category: "Packaging",
    status: "Active",
  },
  {
    id: "2",
    name: "Zenith Tech",
    email: "zenithtech3@gmail.com",
    phone: "0798765432",
    category: "IT Services",
    status: "Inactive",
  },
  {
    id: "3",
    name: "Savanna Print",
    email: "savanna@gmail.com",
    phone: "0700111222",
    category: "Printing",
    status: "Pending",
  },
];

function renderSuppliers() {
  return render(
    <MemoryRouter>
      <Suppliers />
    </MemoryRouter>
  );
}

beforeEach(() => {
  useSuppliers.mockReturnValue({
    suppliers: mockSuppliers,
    loading: false,
    error: "",
  });

  deleteSupplier.mockResolvedValue(undefined);
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

describe("Suppliers Page", () => {
  it("displays all suppliers", () => {
    renderSuppliers();

    expect(screen.getByText("Acme Ltd")).toBeInTheDocument();
    expect(screen.getByText("Zenith Tech")).toBeInTheDocument();
    expect(screen.getByText("Savanna Print")).toBeInTheDocument();

    expect(
      screen.getByText("Showing 3 of 3 suppliers")
    ).toBeInTheDocument();
  });

  it("searches suppliers by name", async () => {
    const user = userEvent.setup();
    renderSuppliers();

    await user.type(
      screen.getByRole("searchbox", {
        name: /search suppliers/i,
      }),
      "Acme"
    );

    expect(screen.getByText("Acme Ltd")).toBeInTheDocument();
    expect(screen.queryByText("Zenith Tech")).not.toBeInTheDocument();

    expect(
      screen.getByText("Showing 1 of 3 suppliers")
    ).toBeInTheDocument();
  });

  it("searches suppliers by email", async () => {
    const user = userEvent.setup();
    renderSuppliers();

    await user.type(
      screen.getByRole("searchbox", {
        name: /search suppliers/i,
      }),
      "zenithtech3@gmail.com"
    );

    expect(screen.getByText("Zenith Tech")).toBeInTheDocument();
    expect(screen.queryByText("Acme Ltd")).not.toBeInTheDocument();
  });

  it("searches suppliers by phone", async () => {
    const user = userEvent.setup();
    renderSuppliers();

    await user.type(
      screen.getByRole("searchbox", {
        name: /search suppliers/i,
      }),
      "0700111222"
    );

    expect(screen.getByText("Savanna Print")).toBeInTheDocument();
    expect(screen.queryByText("Acme Ltd")).not.toBeInTheDocument();
  });

  it("filters suppliers by category", async () => {
    const user = userEvent.setup();
    renderSuppliers();

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: /filter by category/i,
      }),
      "Packaging"
    );

    expect(screen.getByText("Acme Ltd")).toBeInTheDocument();
    expect(screen.queryByText("Zenith Tech")).not.toBeInTheDocument();
    expect(screen.queryByText("Savanna Print")).not.toBeInTheDocument();
  });

  it("filters suppliers by status", async () => {
    const user = userEvent.setup();
    renderSuppliers();

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: /filter by status/i,
      }),
      "Inactive"
    );

    expect(screen.getByText("Zenith Tech")).toBeInTheDocument();
    expect(screen.queryByText("Acme Ltd")).not.toBeInTheDocument();
  });

  it("combines search and status filters", async () => {
    const user = userEvent.setup();
    renderSuppliers();

    await user.type(
      screen.getByRole("searchbox", {
        name: /search suppliers/i,
      }),
      "Acme"
    );

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: /filter by status/i,
      }),
      "Inactive"
    );

    expect(screen.queryByText("Acme Ltd")).not.toBeInTheDocument();

    expect(
      screen.getByText("Showing 0 of 3 suppliers")
    ).toBeInTheDocument();
  });

  it("deletes a supplier after confirmation", async () => {
    const user = userEvent.setup();
    renderSuppliers();

    await user.click(
      screen.getByRole("button", {
        name: "Delete Acme Ltd",
      })
    );

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(deleteSupplier).toHaveBeenCalledWith("1");
    });
  });

  it("does not delete when confirmation is cancelled", async () => {
    vi.mocked(window.confirm).mockReturnValue(false);

    const user = userEvent.setup();
    renderSuppliers();

    await user.click(
      screen.getByRole("button", {
        name: "Delete Acme Ltd",
      })
    );

    expect(deleteSupplier).not.toHaveBeenCalled();
  });

  it("shows an error when deletion fails", async () => {
    deleteSupplier.mockRejectedValue(
      new Error("Firebase error")
    );

    const user = userEvent.setup();
    renderSuppliers();

    await user.click(
      screen.getByRole("button", {
        name: "Delete Acme Ltd",
      })
    );

    expect(
      await screen.findByText("Failed to delete supplier.")
    ).toBeInTheDocument();
  });

  it("shows a loading message", () => {
    useSuppliers.mockReturnValue({
      suppliers: [],
      loading: true,
      error: "",
    });

    renderSuppliers();

    expect(
      screen.getByText("Loading suppliers...")
    ).toBeInTheDocument();
  });

  it("shows an error when loading suppliers fails", () => {
    useSuppliers.mockReturnValue({
      suppliers: [],
      loading: false,
      error: "Failed to load suppliers.",
    });

    renderSuppliers();

    expect(
      screen.getByText("Failed to load suppliers.")
    ).toBeInTheDocument();
  });

  it("provides a link to add a supplier", () => {
    renderSuppliers();

    expect(
      screen.getByRole("link", {
        name: /add supplier/i,
      })
    ).toHaveAttribute("href", "/suppliers/new");
  });
});
