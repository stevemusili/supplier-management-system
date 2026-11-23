
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import Categories from "./Categories";
import useCategories from "../../hooks/useCategories";
import useSuppliers from "../../hooks/useSuppliers";
import { useAuth } from "../../context/AuthContext";

import { addCategory, updateCategory, deleteCategory } from "../../services/categoryService";

// Mock Firebase-dependent hooks and context
vi.mock("../../hooks/useCategories", () => ({
  default: vi.fn(),
}));

vi.mock("../../hooks/useSuppliers", () => ({
  default: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../services/categoryService", () => ({
  addCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

// Mock child components to test the Categories page
vi.mock("../categories/CategoryForm", () => ({
  default: ({
    initialData,
    onSubmit,
    onCancel,
  }) => (
    <div>
      <p>
        {initialData?.id
          ? `Editing ${initialData.name}`
          : "Adding Category"}
      </p>

      <button
        onClick={() =>
          onSubmit({
            name: initialData?.id
              ? initialData.name
              : "Stationery",
            description: "Office supplies",
          })
        }
      >
        Save Category
      </button>

      <button onClick={onCancel}>
        Cancel
      </button>

            <button
                onClick={async () => {
                    try {
                        await onSubmit({
                            name: "Updated Packaging",
                            description: "Updated description",
                        });
                    } catch (error) {
                    }
                }}
            >
                Rename Category
            </button>
    </div>
  ),
}));

vi.mock("../categories/CategoryTable", () => ({
  default: ({
    categories,
    suppliers,
    onEdit,
    onDelete,
  }) => (
    <div>
      <p>Category Table</p>

      {categories.map((category) => {
        const count = suppliers.filter(
          (supplier) =>
            supplier.category === category.name
        ).length;

        return (
          <div key={category.id}>
            <span>{category.name}</span>
            <span>
              {count} supplier(s)
            </span>

            <button
              onClick={() => onEdit(category)}
            >
              Edit {category.name}
            </button>

            <button
              onClick={() => onDelete(category)}
            >
              Delete {category.name}
            </button>
          </div>
        );
      })}
    </div>
  ),
}));

const mockCategories = [
  {
    id: "1",
    name: "Packaging",
    description: "Boxes and materials",
  },
  {
    id: "2",
    name: "Transport",
    description: "Delivery services",
  },
  {
    id: "3",
    name: "IT Services",
    description: "Computer support",
  },
];

const mockSuppliers = [
  {
    id: "s1",
    name: "Acme Ltd",
    category: "Packaging",
  },
  {
    id: "s2",
    name: "Zenith Tech",
    category: "Packaging",
  },
  {
    id: "s3",
    name: "Savanna Print",
    category: "Transport",
  },
];

function renderCategories() {
  return render(<Categories />);
}

beforeEach(() => {
  useAuth.mockReturnValue({
    user: { uid: "user123" },
  });

  useCategories.mockReturnValue({
    categories: mockCategories,
    loading: false,
    error: "",
  });

  useSuppliers.mockReturnValue({
    suppliers: mockSuppliers,
    loading: false,
    error: "",
  });

  addCategory.mockResolvedValue(undefined);
  updateCategory.mockResolvedValue(undefined);
  deleteCategory.mockResolvedValue(undefined);

  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Categories Page", () => {
  it("displays all categories", () => {
    renderCategories();

    expect(
      screen.getByText("Packaging")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Transport")
    ).toBeInTheDocument();

    expect(
      screen.getByText("IT Services")
    ).toBeInTheDocument();
  });

  it("displays the correct supplier counts", () => {
    renderCategories();

    expect(
      screen.getByText("2 supplier(s)")
    ).toBeInTheDocument();

    expect(
      screen.getByText("1 supplier(s)")
    ).toBeInTheDocument();

    expect(
      screen.getByText("0 supplier(s)")
    ).toBeInTheDocument();
  });

  it("searches categories by name", async () => {
    const user = userEvent.setup();
    renderCategories();

    await user.type(
      screen.getByRole("searchbox", {
        name: /search categories/i,
      }),
      "Packaging"
    );

    expect(
      screen.getByText("Packaging")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Transport")
    ).not.toBeInTheDocument();
  });

  it("searches categories by description", async () => {
    const user = userEvent.setup();
    renderCategories();

    await user.type(
      screen.getByRole("searchbox", {
        name: /search categories/i,
      }),
      "Computer"
    );

    expect(
      screen.getByText("IT Services")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Packaging")
    ).not.toBeInTheDocument();
  });

  it("opens the Add Category form", async () => {
    const user = userEvent.setup();
    renderCategories();

    await user.click(
      screen.getByRole("button", {
        name: /add category/i,
      })
    );

    expect(
      screen.getByText("Adding Category")
    ).toBeInTheDocument();
  });

  it("adds a new category", async () => {
    const user = userEvent.setup();
    renderCategories();

    await user.click(
      screen.getByRole("button", {
        name: /add category/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save Category",
      })
    );

    await waitFor(() => {
      expect(addCategory).toHaveBeenCalledWith(
        {
          name: "Stationery",
          description: "Office supplies",
        },
        "user123"
      );
    });

    expect(
      screen.queryByText("Adding Category")
    ).not.toBeInTheDocument();
  });

  it("opens the Edit Category form", async () => {
    const user = userEvent.setup();
    renderCategories();

    await user.click(
      screen.getByRole("button", {
        name: "Edit Packaging",
      })
    );

    expect(
      screen.getByText("Editing Packaging")
    ).toBeInTheDocument();
  });

  it("updates an existing category", async () => {
    const user = userEvent.setup();
    renderCategories();

    await user.click(
      screen.getByRole("button", {
        name: "Edit Packaging",
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save Category",
      })
    );

    await waitFor(() => {
      expect(updateCategory).toHaveBeenCalledWith(
        "1",
        {
          name: "Packaging",
          description: "Office supplies",
        }
      );
    });
  });

  it("prevents renaming a category used by suppliers", async () => {
    const user = userEvent.setup();
    renderCategories();

    await user.click(
      screen.getByRole("button", {
        name: "Edit Packaging",
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Rename Category",
      })
    );

    expect(
      await screen.findByText(
        "This category is in use. Reassign its suppliers before renaming it."
      )
    ).toBeInTheDocument();

    expect(updateCategory).not.toHaveBeenCalled();

    // Form should remain open
    expect(
      screen.getByText("Editing Packaging")
    ).toBeInTheDocument();
  });

  it("cancels the category form", async () => {
    const user = userEvent.setup();
    renderCategories();

    await user.click(
      screen.getByRole("button", {
        name: /add category/i,
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Cancel",
      })
    );

    expect(
      screen.queryByText("Adding Category")
    ).not.toBeInTheDocument();
  });

  it("prevents deleting a category with suppliers", async () => {
    const user = userEvent.setup();
    renderCategories();

    await user.click(
      screen.getByRole("button", {
        name: "Delete Packaging",
      })
    );

    expect(
      screen.getByText(
        /Cannot delete Packaging.*2 supplier/i
      )
    ).toBeInTheDocument();

    expect(deleteCategory).not.toHaveBeenCalled();
  });

  it("deletes an unused category", async () => {
    const user = userEvent.setup();
    renderCategories();

    await user.click(
      screen.getByRole("button", {
        name: "Delete IT Services",
      })
    );

    await waitFor(() => {
      expect(deleteCategory).toHaveBeenCalledWith("3");
    });
  });

  it("does not delete when confirmation is cancelled", async () => {
    vi.mocked(window.confirm).mockReturnValue(false);

    const user = userEvent.setup();
    renderCategories();

    await user.click(
      screen.getByRole("button", {
        name: "Delete IT Services",
      })
    );

    expect(deleteCategory).not.toHaveBeenCalled();
  });

  it("shows an error when deletion fails", async () => {
    deleteCategory.mockRejectedValue(
      new Error("Permission denied")
    );

    const user = userEvent.setup();
    renderCategories();

    await user.click(
      screen.getByRole("button", {
        name: "Delete IT Services",
      })
    );

    expect(
      await screen.findByText("Permission denied")
    ).toBeInTheDocument();
  });

  it("shows a loading message", () => {
    useCategories.mockReturnValue({
      categories: [],
      loading: true,
      error: "",
    });

    renderCategories();

    expect(
      screen.getByText("Loading categories...")
    ).toBeInTheDocument();
  });

  it("shows a loading error", () => {
    useCategories.mockReturnValue({
      categories: [],
      loading: false,
      error: "Failed to load categories.",
    });

    renderCategories();

    expect(
      screen.getByText("Failed to load categories.")
    ).toBeInTheDocument();
  });
});
