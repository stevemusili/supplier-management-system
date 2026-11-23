
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { renderHook, act } from "@testing-library/react";

import { collection, query, where, onSnapshot } from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import useDashboardData from "./useDashboardData";

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
  collection: vi.fn((_db, name) => `collection-${name}`),
  query: vi.fn((collectionRef) => `query-${collectionRef}`),
  where: vi.fn(() => "mock-owner-filter"),
  onSnapshot: vi.fn(),
}));

const mockSuppliers = [
  {
    id: "supplier1",
    name: "Acme Ltd",
    status: "Active",
  },
  {
    id: "supplier2",
    name: "Zenith Tech",
    status: "Pending",
  },
];

const mockCategories = [
  {
    id: "category1",
    name: "Packaging",
  },
  {
    id: "category2",
    name: "Transport",
  },
];

// Keep track of Firestore subscriptions
let subscriptions;
let unsubscribeSuppliers;
let unsubscribeCategories;

function createSnapshot(items) {
  return {
    docs: items.map(({ id, ...data }) => ({
      id,
      data: () => data,
    })),
  };
}

function emitSnapshot(collectionName, items) {
  act(() => {
    subscriptions[collectionName].onNext(
      createSnapshot(items)
    );
  });
}

function emitError(collectionName, message) {
  act(() => {
    subscriptions[collectionName].onError(
      new Error(message)
    );
  });
}

beforeEach(() => {
  vi.clearAllMocks();

  subscriptions = {};

  unsubscribeSuppliers = vi.fn();
  unsubscribeCategories = vi.fn();

  useAuth.mockReturnValue({
    user: { uid: "user123" },
  });

  onSnapshot.mockImplementation(
    (queryRef, onNext, onError) => {
      const collectionName = queryRef.includes("suppliers")
        ? "suppliers"
        : "categories";

      subscriptions[collectionName] = {
        onNext,
        onError,
      };

      return collectionName === "suppliers"
        ? unsubscribeSuppliers
        : unsubscribeCategories;
    }
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useDashboardData", () => {
  it("starts with loading true and empty data", () => {
    const { result } = renderHook(
      () => useDashboardData()
    );

    expect(result.current).toEqual({
      suppliers: [],
      categories: [],
      loading: true,
      error: "",
    });
  });

  it("subscribes to both Firestore collections", () => {
    renderHook(() => useDashboardData());

    expect(collection).toHaveBeenCalledWith(
      expect.anything(),
      "suppliers"
    );

    expect(collection).toHaveBeenCalledWith(
      expect.anything(),
      "categories"
    );

    expect(where).toHaveBeenCalledWith(
      "ownerId",
      "==",
      "user123"
    );

    expect(query).toHaveBeenCalledTimes(2);
    expect(onSnapshot).toHaveBeenCalledTimes(2);
  });

  it("loads supplier and category data successfully", () => {
    const { result } = renderHook(
      () => useDashboardData()
    );

    emitSnapshot("suppliers", mockSuppliers);
    emitSnapshot("categories", mockCategories);

    expect(result.current.suppliers).toEqual(
      mockSuppliers
    );

    expect(result.current.categories).toEqual(
      mockCategories
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("keeps loading until both collections respond", () => {
    const { result } = renderHook(
      () => useDashboardData()
    );

    emitSnapshot("suppliers", mockSuppliers);

    expect(result.current.loading).toBe(true);

    emitSnapshot("categories", mockCategories);

    expect(result.current.loading).toBe(false);
  });

  it("keeps loading if categories respond first", () => {
    const { result } = renderHook(
      () => useDashboardData()
    );

    emitSnapshot("categories", mockCategories);

    expect(result.current.loading).toBe(true);

    emitSnapshot("suppliers", mockSuppliers);

    expect(result.current.loading).toBe(false);
  });

  it("handles empty supplier and category collections", () => {
    const { result } = renderHook(
      () => useDashboardData()
    );

    emitSnapshot("suppliers", []);
    emitSnapshot("categories", []);

    expect(result.current.suppliers).toEqual([]);
    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("handles supplier subscription errors", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(
      () => useDashboardData()
    );

    emitError("suppliers", "Permission denied");

    expect(result.current.error).toBe(
      "Unable to load dashboard data."
    );

    // Categories have not responded yet
    expect(result.current.loading).toBe(true);

    emitSnapshot("categories", mockCategories);

    expect(result.current.loading).toBe(false);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Supplier fetch error:",
      expect.any(Error)
    );
  });

  it("handles category subscription errors", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(
      () => useDashboardData()
    );

    emitSnapshot("suppliers", mockSuppliers);
    emitError("categories", "Network error");

    expect(result.current.error).toBe(
      "Unable to load dashboard data."
    );

    expect(result.current.loading).toBe(false);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Category fetch error:",
      expect.any(Error)
    );
  });

  it("does not subscribe when the user is logged out", () => {
    useAuth.mockReturnValue({
      user: null,
    });

    const { result } = renderHook(
      () => useDashboardData()
    );

    expect(result.current.suppliers).toEqual([]);
    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(false);

    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it("unsubscribes from both collections on unmount", () => {
    const { unmount } = renderHook(
      () => useDashboardData()
    );

    unmount();

    expect(unsubscribeSuppliers).toHaveBeenCalledTimes(1);
    expect(unsubscribeCategories).toHaveBeenCalledTimes(1);
  });

  it("creates new subscriptions when the user changes", () => {
    let currentUser = { uid: "user123" };

    useAuth.mockImplementation(() => ({
      user: currentUser,
    }));

    const { rerender } = renderHook(
      () => useDashboardData()
    );

    expect(onSnapshot).toHaveBeenCalledTimes(2);

    currentUser = { uid: "user456" };
    rerender();

    expect(unsubscribeSuppliers).toHaveBeenCalledTimes(1);
    expect(unsubscribeCategories).toHaveBeenCalledTimes(1);

    expect(where).toHaveBeenLastCalledWith(
      "ownerId",
      "==",
      "user456"
    );

    expect(onSnapshot).toHaveBeenCalledTimes(4);
  });

  it("resets loading and errors when the user changes", () => {
    let currentUser = { uid: "user123" };

    useAuth.mockImplementation(() => ({
      user: currentUser,
    }));

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result, rerender } = renderHook(
      () => useDashboardData()
    );

    emitError("suppliers", "Network error");
    emitSnapshot("categories", mockCategories);

    expect(result.current.error).toBe(
      "Unable to load dashboard data."
    );
    expect(result.current.loading).toBe(false);

    currentUser = { uid: "user456" };
    rerender();

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe("");

    expect(onSnapshot).toHaveBeenCalledTimes(4);
  });
});
