
import { describe, it, expect, vi, beforeEach } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Register from "./Register";
import { useAuth } from "../../context/AuthContext";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

let mockRegister;

function renderRegister() {
  return render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );
}

async function fillRegistrationForm(user, overrides = {}) {
  const values = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    confirmPassword: "password123",
    ...overrides,
  };

  await user.type(
    screen.getByLabelText("Full Name"),
    values.name
  );

  await user.type(
    screen.getByLabelText("Email"),
    values.email
  );

  await user.type(
    screen.getByLabelText("Password", { exact: true }),
    values.password
  );

  await user.type(
    screen.getByLabelText("Confirm Password"),
    values.confirmPassword
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  mockRegister = vi.fn().mockResolvedValue(undefined);

  useAuth.mockReturnValue({
    register: mockRegister,
  });
});

describe("Register Page", () => {
  it("renders the registration form", () => {
    renderRegister();

    expect(
      screen.getByText("Supplier Management System")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Create Account")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Full Name")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Email")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password", { exact: true })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Confirm Password")
    ).toBeInTheDocument();
  });

  it("updates form fields when the user types", async () => {
    const user = userEvent.setup();

    renderRegister();
    await fillRegistrationForm(user);

    expect(screen.getByLabelText("Full Name"))
      .toHaveValue("John Doe");

    expect(screen.getByLabelText("Email"))
      .toHaveValue("john@example.com");

    expect(
      screen.getByLabelText("Password", { exact: true })
    ).toHaveValue("password123");

    expect(screen.getByLabelText("Confirm Password"))
      .toHaveValue("password123");
  });

  it("registers a new user successfully", async () => {
    const user = userEvent.setup();

    renderRegister();
    await fillRegistrationForm(user);

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        "John Doe",
        "john@example.com",
        "password123"
      );
    });

    expect(mocks.navigate).toHaveBeenCalledWith(
      "/dashboard",
      { replace: true }
    );
  });

  it("rejects mismatched passwords", async () => {
    const user = userEvent.setup();

    renderRegister();

    await fillRegistrationForm(user, {
      confirmPassword: "different123",
    });

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Passwords do not match.");

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("rejects passwords shorter than 6 characters", async () => {
    const user = userEvent.setup();

    renderRegister();

    await fillRegistrationForm(user, {
      password: "12345",
      confirmPassword: "12345",
    });

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Password must contain at least 6 characters."
    );

    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("accepts a password with exactly 6 characters", async () => {
    const user = userEvent.setup();

    renderRegister();

    await fillRegistrationForm(user, {
      password: "123456",
      confirmPassword: "123456",
    });

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        "John Doe",
        "john@example.com",
        "123456"
      );
    });
  });

  it("shows an error when email is already registered", async () => {
    mockRegister.mockRejectedValue({
      code: "auth/email-already-in-use",
    });

    const user = userEvent.setup();

    renderRegister();
    await fillRegistrationForm(user);

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "This email is already registered."
    );

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("shows a generic error when registration fails", async () => {
    mockRegister.mockRejectedValue(
      new Error("Network error")
    );

    const user = userEvent.setup();

    renderRegister();
    await fillRegistrationForm(user);

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Registration failed. Please try again."
    );

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("disables the submit button while registering", async () => {
    let resolveRegistration;

    mockRegister.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegistration = resolve;
        })
    );

    const user = userEvent.setup();

    renderRegister();
    await fillRegistrationForm(user);

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    expect(
      screen.getByRole("button", {
        name: "Creating account...",
      })
    ).toBeDisabled();

    resolveRegistration();

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith(
        "/dashboard",
        { replace: true }
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Register" })
      ).toBeEnabled();
    });
  });

  it("prevents submitting an empty form", async () => {
    const user = userEvent.setup();

    renderRegister();

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    expect(mockRegister).not.toHaveBeenCalled();

    expect(
      screen.getByLabelText("Full Name")
    ).toBeInvalid();
  });

  it("displays the login navigation link", () => {
    renderRegister();

    const loginLink = screen.getByRole("link", {
      name: "Login",
    });

    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("clears previous validation errors on a new submission", async () => {
    const user = userEvent.setup();

    renderRegister();

    await fillRegistrationForm(user, {
      confirmPassword: "wrong123",
    });

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Passwords do not match.");

    const confirmInput =
      screen.getByLabelText("Confirm Password");

    await user.clear(confirmInput);
    await user.type(confirmInput, "password123");

    await user.click(
      screen.getByRole("button", { name: "Register" })
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("alert")
      ).not.toBeInTheDocument();
    });

    expect(mockRegister).toHaveBeenCalledTimes(1);
  });
});
