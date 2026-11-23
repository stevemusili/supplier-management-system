
import { describe, it, expect, vi, beforeEach } from "vitest";

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";

import SupplierFormPage from "./SupplierFormPage";
import { useAuth } from "../../context/AuthContext";

import { addSupplier, getSupplierById, updateSupplier } from "../../services/supplierService";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  params: { id: undefined },
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    useNavigate: () => mocks.navigate,
    useParams: () => mocks.params,
  };
});

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../services/supplierService", () => ({
  addSupplier: vi.fn(),
  getSupplierById: vi.fn(),
  updateSupplier: vi.fn(),
}));

// Mock the child form to test the page's behavior
vi.mock("../suppliers/SupplierForm", () => ({
    default: ({ initialData, onSubmit, submitLabel }) => (
        <div data-testid="supplier-form">
            <p data-testid="initial-name">
                {initialData.name || "No supplier"}
            </p>

            <button
                onClick={async () => {
                    try {
                        await onSubmit({
                            name: "Test Supplier",
                            email: "test@example.com",
                            status: "Active",
                        });
                    } catch {
                        // The mock catches expected service failures.
                    }
                }}
            >
                {submitLabel}
            </button>
        </div>
  ),
}));

const formData = {
  name: "Test Supplier",
  email: "test@example.com",
  status: "Active",
};

const existingSupplier = {
  id: "supplier123",
  name: "Existing Supplier",
  email: "existing@example.com",
  status: "Inactive",
};

function renderPage() {
  return render(
    <MemoryRouter>
      <SupplierFormPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  mocks.params = { id: undefined };

  useAuth.mockReturnValue({
    user: { uid: "user123" },
  });

  addSupplier.mockResolvedValue({ id: "newSupplier" });
  updateSupplier.mockResolvedValue(undefined);
  getSupplierById.mockResolvedValue(existingSupplier);
});

describe("SupplierFormPage", () => {
  it("renders the Add Supplier page in create mode", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Add Supplier" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Add Supplier" })
    ).toBeInTheDocument();

    expect(screen.getByTestId("initial-name"))
      .toHaveTextContent("No supplier");
  });

  it("does not fetch a supplier in create mode", () => {
    renderPage();

    expect(getSupplierById).not.toHaveBeenCalled();
  });

  it("creates a supplier successfully", async () => {
    renderPage();

    fireEvent.click(
      screen.getByRole("button", { name: "Add Supplier" })
    );

    await waitFor(() => {
      expect(addSupplier).toHaveBeenCalledWith(
        formData,
        "user123"
      );
    });

    expect(mocks.navigate).toHaveBeenCalledWith(
      "/suppliers"
    );
  });

  it("displays loading while fetching an existing supplier", () => {
    mocks.params = { id: "supplier123" };

    getSupplierById.mockReturnValue(
      new Promise(() => {})
    );

    renderPage();

    expect(
      screen.getByText("Loading supplier...")
    ).toBeInTheDocument();
  });

  it("fetches the supplier using its ID and user ID", async () => {
    mocks.params = { id: "supplier123" };

    renderPage();

    await waitFor(() => {
      expect(getSupplierById).toHaveBeenCalledWith(
        "supplier123",
        "user123"
      );
    });
  });

  it("renders the Edit Supplier page with existing data", async () => {
    mocks.params = { id: "supplier123" };

    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: "Edit Supplier",
      })
    ).toBeInTheDocument();

    expect(screen.getByTestId("initial-name"))
      .toHaveTextContent("Existing Supplier");

    expect(
      screen.getByRole("button", { name: "Update Supplier" })
    ).toBeInTheDocument();
  });

  it("updates an existing supplier successfully", async () => {
    mocks.params = { id: "supplier123" };

    renderPage();

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Update Supplier",
      })
    );

    await waitFor(() => {
      expect(updateSupplier).toHaveBeenCalledWith(
        "supplier123",
        formData
      );
    });

    expect(addSupplier).not.toHaveBeenCalled();

    expect(mocks.navigate).toHaveBeenCalledWith(
      "/suppliers"
    );
  });

  it("displays an error when fetching a supplier fails", async () => {
    mocks.params = { id: "supplier123" };

    getSupplierById.mockRejectedValue(
      new Error("Supplier not found.")
    );

    renderPage();

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Supplier not found.");

    expect(
      screen.queryByTestId("supplier-form")
    ).not.toBeInTheDocument();
  });

  it("does not fetch supplier data without an authenticated user", () => {
    mocks.params = { id: "supplier123" };

    useAuth.mockReturnValue({
      user: null,
    });

    renderPage();

    expect(getSupplierById).not.toHaveBeenCalled();
  });

  it("does not navigate when creating a supplier fails", async () => {
    addSupplier.mockRejectedValue(
      new Error("Permission denied")
    );

    renderPage();

    // The mock form catches the rejected promise
    // through the button event for this test.
    const button = screen.getByRole("button", {
      name: "Add Supplier",
    });

    const unhandledRejection = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    fireEvent.click(button);

    await waitFor(() => {
      expect(addSupplier).toHaveBeenCalled();
    });

    expect(mocks.navigate).not.toHaveBeenCalled();

    unhandledRejection.mockRestore();
  });

  it("cleans up when unmounted before fetching finishes", async () => {
    mocks.params = { id: "supplier123" };

    let resolveFetch;

    getSupplierById.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    const { unmount } = renderPage();

    expect(
      screen.getByText("Loading supplier...")
    ).toBeInTheDocument();

    unmount();

    await act(async () => {
      resolveFetch(existingSupplier);
    });

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("does not navigate when updating a supplier fails", async () => {
    mocks.params = { id: "supplier123" };

    updateSupplier.mockRejectedValue(
      new Error("Update failed")
    );

    renderPage();

    const button = await screen.findByRole("button", {
      name: "Update Supplier",
    });

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    fireEvent.click(button);

    await waitFor(() => {
      expect(updateSupplier).toHaveBeenCalled();
    });

    expect(mocks.navigate).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
