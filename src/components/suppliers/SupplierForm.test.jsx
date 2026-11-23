import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SupplierForm from "./SupplierForm";
import useCategories from "../../hooks/useCategories";

vi.mock("../../hooks/useCategories", () => ({
  default: vi.fn(),
}));

const categories = [
  { id: "1", name: "IT Services" },
  { id: "2", name: "Packaging" },
];

function setup(onSubmit = vi.fn()) {
  useCategories.mockReturnValue({
    categories,
    loading: false,
    error: "",
  });

  render(<SupplierForm onSubmit={onSubmit} />);
  return onSubmit;
}

describe("SupplierForm", () => {
  it("renders supplier form fields", () => {
    setup();

    expect(
      screen.getByLabelText(/supplier name/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/^email$/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/phone number/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/^address$/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/^category$/i)
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    const onSubmit = setup();

    await user.click(
      screen.getByRole("button", {
        name: /save supplier/i,
      })
    );

    expect(
      screen.getByText("Supplier name is required.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Email is required.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Select a valid category.")
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const user = userEvent.setup();
    setup();

    await user.type(
      screen.getByLabelText(/^email$/i),
      "invalid-email"
    );

    await user.click(
      screen.getByRole("button", {
        name: /save supplier/i,
      })
    );

    expect(
      screen.getByText("Enter a valid email address.")
    ).toBeInTheDocument();
  });

  it("submits valid supplier data", async () => {
    const user = userEvent.setup();
    const onSubmit = setup();

    await user.type(
      screen.getByLabelText(/supplier name/i),
      "Acme Ltd"
    );

    await user.type(
      screen.getByLabelText(/^email$/i),
      "acme@gmail.com"
    );

    await user.type(
      screen.getByLabelText(/phone number/i),
      "0712345678"
    );

    await user.type(
      screen.getByLabelText(/^address$/i),
      "Nairobi"
    );

    await user.selectOptions(
      screen.getByLabelText(/^category$/i),
      "Packaging"
    );

    await user.click(
      screen.getByRole("button", {
        name: /save supplier/i,
      })
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Acme Ltd",
        email: "acme@gmail.com",
        phone: "0712345678",
        address: "Nairobi",
        category: "Packaging",
        status: "Active",
      })
    );
  });
});