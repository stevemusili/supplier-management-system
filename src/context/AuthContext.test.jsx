
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { render, screen, act, waitFor } from "@testing-library/react";

import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, updateProfile } from "firebase/auth";

import { AuthProvider, useAuth } from "./AuthContext";
import { auth } from "../firebase/config";

// Mock Firebase configuration
vi.mock("../firebase/config", () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock Firebase Authentication
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(function () {
    return { providerId: "google.com" };
  }),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}));

let authCallback;
let unsubscribe;

// Test component that exposes context values
function TestConsumer() {
  const {
    user,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
  } = useAuth();

  return (
    <div>
      <p data-testid="loading">
        {loading ? "Loading" : "Ready"}
      </p>

      <p data-testid="user">
        {user ? user.email : "No user"}
      </p>

      <button
        onClick={() =>
          register(
            "John Doe",
            "john@example.com",
            "password123"
          )
        }
      >
        Register
      </button>

      <button
        onClick={() =>
          login("john@example.com", "password123")
        }
      >
        Login
      </button>

      <button onClick={() => loginWithGoogle()}>
        Google Login
      </button>

      <button onClick={() => logout()}>
        Logout
      </button>
    </div>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  auth.currentUser = null;
  authCallback = undefined;
  unsubscribe = vi.fn();

  onAuthStateChanged.mockImplementation(
    (_auth, callback) => {
      authCallback = callback;
      return unsubscribe;
    }
  );

  createUserWithEmailAndPassword.mockResolvedValue({
    user: {
      uid: "user123",
      email: "john@example.com",
    },
  });

  updateProfile.mockResolvedValue(undefined);

  signInWithEmailAndPassword.mockResolvedValue({
    user: {
      uid: "user123",
      email: "john@example.com",
    },
  });

  signInWithPopup.mockResolvedValue({
    user: {
      uid: "google123",
      email: "google@example.com",
    },
  });

  signOut.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AuthContext", () => {
  it("starts with loading true and no user", () => {
    renderAuthProvider();

    expect(screen.getByTestId("loading")).toHaveTextContent(
      "Loading"
    );

    expect(screen.getByTestId("user")).toHaveTextContent(
      "No user"
    );
  });

  it("subscribes to Firebase authentication changes", () => {
    renderAuthProvider();

    expect(onAuthStateChanged).toHaveBeenCalledWith(
      auth,
      expect.any(Function)
    );
  });

  it("updates the user when Firebase authentication succeeds", () => {
    renderAuthProvider();

    act(() => {
      authCallback({
        uid: "user123",
        email: "john@example.com",
      });
    });

    expect(screen.getByTestId("loading")).toHaveTextContent(
      "Ready"
    );

    expect(screen.getByTestId("user")).toHaveTextContent(
      "john@example.com"
    );
  });

  it("handles a logged-out authentication state", () => {
    renderAuthProvider();

    act(() => {
      authCallback(null);
    });

    expect(screen.getByTestId("loading")).toHaveTextContent(
      "Ready"
    );

    expect(screen.getByTestId("user")).toHaveTextContent(
      "No user"
    );
  });

  it("registers a new user successfully", async () => {
    const mockUser = {
      uid: "user123",
      email: "john@example.com",
    };

    auth.currentUser = mockUser;

    renderAuthProvider();

    await act(async () => {
      screen.getByRole("button", {
        name: "Register",
      }).click();
    });

    expect(createUserWithEmailAndPassword)
      .toHaveBeenCalledWith(
        auth,
        "john@example.com",
        "password123"
      );

    expect(updateProfile).toHaveBeenCalledWith(
      mockUser,
      {
        displayName: "John Doe",
      }
    );

    expect(screen.getByTestId("user")).toHaveTextContent(
      "john@example.com"
    );
  });

  it("logs in with email and password", async () => {
    renderAuthProvider();

    await act(async () => {
      screen.getByRole("button", {
        name: "Login",
      }).click();
    });

    expect(signInWithEmailAndPassword)
      .toHaveBeenCalledWith(
        auth,
        "john@example.com",
        "password123"
      );
  });

  it("logs in using Google", async () => {
    renderAuthProvider();

    await act(async () => {
      screen.getByRole("button", {
        name: "Google Login",
      }).click();
    });

    expect(GoogleAuthProvider).toHaveBeenCalled();

    expect(signInWithPopup).toHaveBeenCalledWith(
      auth,
      expect.objectContaining({
        providerId: "google.com",
      })
    );
  });

  it("logs out successfully", async () => {
    renderAuthProvider();

    await act(async () => {
      screen.getByRole("button", {
        name: "Logout",
      }).click();
    });

    expect(signOut).toHaveBeenCalledWith(auth);
  });

  it("unsubscribes when the provider unmounts", () => {
    const { unmount } = renderAuthProvider();

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("throws an error when useAuth is used outside AuthProvider", () => {
    function InvalidConsumer() {
      useAuth();
      return <p>Invalid</p>;
    }

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() =>
      render(<InvalidConsumer />)
    ).toThrow(
      "useAuth must be used within AuthProvider"
    );

    consoleSpy.mockRestore();
  });

  it("propagates registration errors", async () => {
    createUserWithEmailAndPassword.mockRejectedValue(
      new Error("Email already in use")
    );

    // Test component that handles rejected promises
    function RegistrationErrorConsumer() {
      const { register } = useAuth();

      return (
        <button
          onClick={async () => {
            try {
              await register(
                "John Doe",
                "john@example.com",
                "password123"
              );
            } catch (error) {
              // Expected Firebase error
            }
          }}
        >
          Register With Error
        </button>
      );
    }

    render(
      <AuthProvider>
        <RegistrationErrorConsumer />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByRole("button", {
        name: "Register With Error",
      }).click();
    });

    await waitFor(() => {
      expect(createUserWithEmailAndPassword)
        .toHaveBeenCalledTimes(1);
    });

    expect(updateProfile).not.toHaveBeenCalled();
  });
});
