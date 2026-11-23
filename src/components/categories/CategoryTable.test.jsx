import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CategoryTable from "./CategoryTable";

const categories = [
  { id: "1", name: "Packaging", description: "Boxes and Wrapping" },
  { id: "2", name: "Transport", description: "Delivery and freight" },
];

const suppliers = [
  { id: "s1", category: "Packaging" },
  { id: "s2", category: "Packaging" },
  { id: "s3", category: "Transport" },
];

describe("CategoryTable", () => {
  it("displays the correct supplier count", () => {
    render(
      <CategoryTable
        categories={categories}
        suppliers={suppliers}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const packagingRow = screen
      .getByText("Packaging")
      .closest("tr");

    const transportRow = screen
      .getByText("Transport")
      .closest("tr");

    expect(packagingRow).toHaveTextContent("2");
    expect(transportRow).toHaveTextContent("1");
  });

  it("calls onEdit when Edit is clicked", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <CategoryTable
        categories={categories}
        suppliers={suppliers}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    await user.click(
      screen.getAllByRole("button", { name: "Edit" })[0]
    );

    expect(onEdit).toHaveBeenCalledWith(categories[0]);
  });

  it("calls onDelete when Delete is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <CategoryTable
        categories={categories}
        suppliers={suppliers}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    await user.click(
      screen.getAllByRole("button", { name: "Delete" })[0]
    );

    expect(onDelete).toHaveBeenCalledWith(categories[0]);
  });
});