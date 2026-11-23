import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CategoryForm from "./CategoryForm";

describe("CategoryForm", () => {
  it("renders the category form", () => {
    render(
      <CategoryForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(
      screen.getByLabelText(/category name/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/description/i)
    ).toBeInTheDocument();
  });

  it("requires a category name", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CategoryForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: /save category/i,
      })
    );

    expect(
      screen.getByText("Category name is required.")
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("prevents duplicate category names", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CategoryForm
        existingCategories={[
          { id: "1", name: "Packaging" },
        ]}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await user.type(
      screen.getByLabelText(/category name/i),
      "Packaging"
    );

    await user.click(
      screen.getByRole("button", {
        name: /save category/i,
      })
    );

    expect(
      screen.getByText("This category already exists.")
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits valid category data", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <CategoryForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await user.type(
      screen.getByLabelText(/category name/i),
      "Transport"
    );

    await user.type(
      screen.getByLabelText(/description/i),
      "Delivery services"
    );

    await user.click(
      screen.getByRole("button", {
        name: /save category/i,
      })
    );

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Transport",
      description: "Delivery services",
    });
  });
});