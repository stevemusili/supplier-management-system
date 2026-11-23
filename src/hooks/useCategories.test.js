
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { renderHook, act, waitFor } from "@testing-library/react";

import { collection, query, where, onSnapshot } from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import useCategories from "./useCategories";

// Mock Firebase configuration
vi.mock("../firebase/config", () => ({
  db: { id: "mock-db" },
}));

// Mock authentication
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock Firestore
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => "mock-collection"),
  query: vi.fn(() => "mock-query"),
  where: vi.fn(() => "mock-where"),
  onSnapshot: vi.fn(),
}));

const mockCategories = [
  {
    id: "category1",
    name: "Packaging",
    description: "Boxes and materials",
  },
  {
    id: "category2",
    name: "Transport",
    description: "Delivery services",
  },
];

let snapshotCallback;
let errorCallback;
let unsubscribe;

beforeEach(() => {
  vi.clearAllMocks();

  snapshotCallback = undefined;
  errorCallback = undefined;
  unsubscribe = vi.fn();

  useAuth.mockReturnValue({
    user: { uid: "user123" },
  });

  onSnapshot.mockImplementation(
    (_query, onNext, onError) => {
      snapshotCallback = onNext;
      errorCallback = onError;
      return unsubscribe;
    }
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useCategories", () => {
  it("starts with loading set to true", () => {
    const { result } = renderHook(() => useCategories());

    expect(result.current.loading).toBe(true);
    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBe("");
  });

  it("subscribes to the logged-in user's categories", () => {
    renderHook(() => useCategories());

    expect(collection).toHaveBeenCalledWith(
      expect.anything(),
      "categories"
    );

    expect(where).toHaveBeenCalledWith(
      "ownerId",
      "==",
      "user123"
    );

    expect(query).toHaveBeenCalledWith(
      "mock-collection",
      "mock-where"
    );

    expect(onSnapshot).toHaveBeenCalledWith(
      "mock-query",
      expect.any(Function),
      expect.any(Function)
    );
  });

  it("loads categories successfully", async () => {
    const { result } = renderHook(() => useCategories());

    act(() => {
      snapshotCallback({
        docs: mockCategories.map((category) => ({
          id: category.id,
          data: () => ({
            name: category.name,
            description: category.description,
          }),
        })),
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.error).toBe("");
  });

  it("handles an empty category collection", async () => {
    const { result } = renderHook(() => useCategories());

    act(() => {
      snapshotCallback({
        docs: [],
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toEqual([]);
  });

  it("handles Firestore subscription errors", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useCategories());

    act(() => {
      errorCallback(new Error("Permission denied"));
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      "Failed to load categories."
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Category fetch error:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("does not subscribe when the user is logged out", async () => {
    useAuth.mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.categories).toEqual([]);
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it("unsubscribes when the component unmounts", () => {
    const { unmount } = renderHook(() => useCategories());

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("resubscribes when the authenticated user changes", () => {
    let currentUser = { uid: "user123" };

    useAuth.mockImplementation(() => ({
      user: currentUser,
    }));

    const { rerender } = renderHook(() => useCategories());

    expect(onSnapshot).toHaveBeenCalledTimes(1);

    currentUser = { uid: "user456" };

    rerender();

    expect(unsubscribe).toHaveBeenCalledTimes(1);

    expect(where).toHaveBeenLastCalledWith(
      "ownerId",
      "==",
      "user456"
    );

    expect(onSnapshot).toHaveBeenCalledTimes(2);
  });

  it("resets loading and errors when the user changes", async () => {
    let currentUser = { uid: "user123" };

    useAuth.mockImplementation(() => ({
      user: currentUser,
    }));

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result, rerender } = renderHook(
      () => useCategories()
    );

    // Simulate an initial Firebase error
    act(() => {
      errorCallback(new Error("Network error"));
    });

    expect(result.current.error).toBe(
      "Failed to load categories."
    );

    expect(result.current.loading).toBe(false);

    // Switch to another authenticated user
    currentUser = { uid: "user456" };

    rerender();

    // The hook should reset its state
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe("");

    consoleSpy.mockRestore();
  });
});
