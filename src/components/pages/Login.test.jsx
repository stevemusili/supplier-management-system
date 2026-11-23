
import { describe, it, expect, vi, beforeEach } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Login from "./Login";
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

let mockLogin;
let mockGoogleLogin;

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

async function fillLoginForm(user) {
  await user.type(
    screen.getByLabelText("Email"),
    "john@example.com"
  );

  await user.type(
    screen.getByLabelText("Password"),
    "password123"
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  mockLogin = vi.fn().mockResolvedValue(undefined);
  mockGoogleLogin = vi.fn().mockResolvedValue(undefined);

  useAuth.mockReturnValue({
    login: mockLogin,
    loginWithGoogle: mockGoogleLogin,
  });
});

describe("Login Page", () => {
  it("renders the login form", () => {
    renderLogin();

    expect(
      screen.getByText("Supplier Management System")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Welcome Back")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Email")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Login" })
    ).toBeInTheDocument();
  });

  it("updates email and password inputs", async () => {
    const user = userEvent.setup();

    renderLogin();

    await fillLoginForm(user);

    expect(
      screen.getByLabelText("Email")
    ).toHaveValue("john@example.com");

    expect(
      screen.getByLabelText("Password")
    ).toHaveValue("password123");
  });

  it("logs in successfully with email and password", async () => {
    const user = userEvent.setup();

    renderLogin();

    await fillLoginForm(user);

    await user.click(
      screen.getByRole("button", { name: "Login" })
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "john@example.com",
        "password123"
      );
    });

    expect(mocks.navigate).toHaveBeenCalledWith(
      "/dashboard",
      { replace: true }
    );
  });

  it("shows an error when email login fails", async () => {
    mockLogin.mockRejectedValue(
      new Error("Invalid credentials")
    );

    const user = userEvent.setup();

    renderLogin();

    await fillLoginForm(user);

    await user.click(
      screen.getByRole("button", { name: "Login" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Unable to log in. Check your credentials."
    );

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("shows loading state during login", async () => {
    let resolveLogin;

    mockLogin.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
    );

    const user = userEvent.setup();

    renderLogin();

    await fillLoginForm(user);

    await user.click(
      screen.getByRole("button", { name: "Login" })
    );

    expect(
      screen.getByRole("button", {
        name: "Please wait...",
      })
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Continue with Google",
      })
    ).toBeDisabled();

    resolveLogin();

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalled();
    });

    expect(
      screen.getByRole("button", { name: "Login" })
    ).toBeEnabled();
  });

  it("logs in successfully using Google", async () => {
    const user = userEvent.setup();

    renderLogin();

    await user.click(
      screen.getByRole("button", {
        name: "Continue with Google",
      })
    );

    await waitFor(() => {
      expect(mockGoogleLogin).toHaveBeenCalledTimes(1);
    });

    expect(mocks.navigate).toHaveBeenCalledWith(
      "/dashboard",
      { replace: true }
    );
  });

  it("shows an error when Google login fails", async () => {
    mockGoogleLogin.mockRejectedValue({
      code: "auth/network-request-failed",
    });

    const user = userEvent.setup();

    renderLogin();

    await user.click(
      screen.getByRole("button", {
        name: "Continue with Google",
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Google sign-in failed. Please try again."
    );

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("does not show an error when Google popup is closed", async () => {
    mockGoogleLogin.mockRejectedValue({
      code: "auth/popup-closed-by-user",
    });

    const user = userEvent.setup();

    renderLogin();

    await user.click(
      screen.getByRole("button", {
        name: "Continue with Google",
      })
    );

    await waitFor(() => {
      expect(mockGoogleLogin).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Continue with Google",
        })
      ).toBeEnabled();
    });

    expect(
      screen.queryByRole("alert")
    ).not.toBeInTheDocument();

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("prevents submitting an empty login form", async () => {
    const user = userEvent.setup();

    renderLogin();

    await user.click(
      screen.getByRole("button", { name: "Login" })
    );

    expect(mockLogin).not.toHaveBeenCalled();

    expect(
      screen.getByLabelText("Email")
    ).toBeInvalid();
  });

  it("displays the registration link", () => {
    renderLogin();

    const registerLink = screen.getByRole("link", {
      name: "Register",
    });

    expect(registerLink).toHaveAttribute(
      "href",
      "/register"
    );
  });
});
