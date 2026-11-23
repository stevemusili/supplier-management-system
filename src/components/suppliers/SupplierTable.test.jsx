import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import SupplierTable from "./SupplierTable";

const suppliers = [
  {
    id: "1",
    name: "Acme Ltd",
    category: "Packaging",
    email: "acmeltd@gmail.com",
    phone: "0712345678",
    status: "Active",
  },
  {
    id: "2",
    name: "Zenith Tech",
    category: "IT Services",
    email: "zenithtech3@gmail.com.com",
    phone: "0723154768",
    status: "Pending",
  },
];

function renderTable(onDelete = vi.fn()) {
  render(
    <MemoryRouter>
      <SupplierTable
        suppliers={suppliers}
        onDelete={onDelete}
      />
    </MemoryRouter>
  );

  return onDelete;
}

describe("SupplierTable", () => {
  it("displays supplier names", () => {
    renderTable();

    expect(
      screen.getByText("Acme Ltd")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Zenith Tech")
    ).toBeInTheDocument();
  });

  it("displays supplier categories", () => {
    renderTable();

    expect(
      screen.getByText("Packaging")
    ).toBeInTheDocument();

    expect(
      screen.getByText("IT Services")
    ).toBeInTheDocument();
  });

  it("displays supplier statuses", () => {
    renderTable();

    expect(
      screen.getByText("Active")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Pending")
    ).toBeInTheDocument();
  });

  it("calls onDelete when Delete is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = renderTable();

    const deleteButtons = screen.getAllByRole(
      "button",
      { name: /delete/i }
    );

    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(
      suppliers[0]
    );
  });

  it("provides an edit link for each supplier", () => {
    renderTable();

    const editLinks = screen.getAllByRole(
      "link",
      { name: /edit/i }
    );

    expect(editLinks[0]).toHaveAttribute(
      "href",
      "/suppliers/1/edit"
    );

    expect(editLinks[1]).toHaveAttribute(
      "href",
      "/suppliers/2/edit"
    );
  });
});