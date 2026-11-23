
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { renderHook, act, waitFor } from "@testing-library/react";

import { collection, query, where, onSnapshot } from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import useSuppliers from "./useSuppliers";

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

const mockSuppliers = [
  {
    id: "supplier1",
    name: "Acme Ltd",
    category: "Packaging",
    status: "Active",
  },
  {
    id: "supplier2",
    name: "Zenith Tech",
    category: "IT Services",
    status: "Pending",
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

describe("useSuppliers", () => {
  it("starts with loading set to true", () => {
    const { result } = renderHook(() => useSuppliers());

    expect(result.current.loading).toBe(true);
    expect(result.current.suppliers).toEqual([]);
    expect(result.current.error).toBe("");
  });

  it("subscribes to the logged-in user's suppliers", () => {
    renderHook(() => useSuppliers());

    expect(collection).toHaveBeenCalledWith(
      expect.anything(),
      "suppliers"
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

  it("loads suppliers from Firestore successfully", async () => {
    const { result } = renderHook(() => useSuppliers());

    act(() => {
      snapshotCallback({
        docs: mockSuppliers.map((supplier) => ({
          id: supplier.id,
          data: () => ({
            name: supplier.name,
            category: supplier.category,
            status: supplier.status,
          }),
        })),
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.suppliers).toEqual(mockSuppliers);
    expect(result.current.error).toBe("");
  });

  it("handles an empty supplier collection", async () => {
    const { result } = renderHook(() => useSuppliers());

    act(() => {
      snapshotCallback({
        docs: [],
      });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.suppliers).toEqual([]);
  });

  it("handles Firestore subscription errors", async () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useSuppliers());

    act(() => {
      errorCallback(new Error("Permission denied"));
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      "Failed to load suppliers."
    );

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("does not subscribe when the user is logged out", async () => {
    useAuth.mockReturnValue({
      user: null,
    });

    const { result } = renderHook(() => useSuppliers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.suppliers).toEqual([]);
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it("unsubscribes when the component unmounts", () => {
    const { unmount } = renderHook(() => useSuppliers());

    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it("resubscribes when the authenticated user changes", () => {
    let currentUser = { uid: "user123" };

    useAuth.mockImplementation(() => ({
      user: currentUser,
    }));

    const { rerender } = renderHook(() => useSuppliers());

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
});
