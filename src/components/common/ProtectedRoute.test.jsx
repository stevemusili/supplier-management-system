import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../../context/AuthContext";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<h1>Dashboard Page</h1>}
          />
        </Route>

        <Route
          path="/login"
          element={<h1>Login Page</h1>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("allows authenticated users to access dashboard", () => {
    useAuth.mockReturnValue({
      user: { uid: "user123" },
      loading: false,
    });

    renderProtectedRoute();

    expect(
      screen.getByText("Dashboard Page")
    ).toBeInTheDocument();
  });

  it("redirects unauthenticated users to login", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    renderProtectedRoute();

    expect(
      screen.getByText("Login Page")
    ).toBeInTheDocument();
  });

  it("shows loading while checking authentication", () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    renderProtectedRoute();

    expect(
      screen.getByText(/checking authentication/i)
    ).toBeInTheDocument();
  });
});