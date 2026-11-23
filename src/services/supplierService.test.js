
import { describe, it, expect, vi, beforeEach } from "vitest";

import { addDoc, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

import { addSupplier, getSupplierById, updateSupplier, deleteSupplier } from "./supplierService";

// Mock Firebase configuration
vi.mock("../firebase/config", () => ({
  db: { id: "mock-db" },
}));

// Mock Firestore functions
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => "mock-suppliers-collection"),
  addDoc: vi.fn(),
  doc: vi.fn(() => "mock-supplier-ref"),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => "mock-timestamp"),
}));

const mockSupplier = {
  name: "Acme Ltd",
  email: "acme@email.com",
  phone: "0712345678",
  address: "Nairobi",
  category: "Packaging",
  status: "Active",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("supplierService", () => {
  it("creates a supplier successfully", async () => {
    addDoc.mockResolvedValue({ id: "supplier123" });

    const result = await addSupplier(
      mockSupplier,
      "user123"
    );

    expect(addDoc).toHaveBeenCalledWith(
      "mock-suppliers-collection",
      {
        ...mockSupplier,
        ownerId: "user123",
        createdAt: "mock-timestamp",
        updatedAt: "mock-timestamp",
      }
    );

    expect(result).toEqual({ id: "supplier123" });
  });

  it("prevents creation without authentication", async () => {
    await expect(
      addSupplier(mockSupplier, null)
    ).rejects.toThrow("You must be logged in.");

    expect(addDoc).not.toHaveBeenCalled();
  });

  it("retrieves a supplier successfully", async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      id: "supplier123",
      data: () => ({
        ...mockSupplier,
        ownerId: "user123",
      }),
    });

    const result = await getSupplierById(
      "supplier123",
      "user123"
    );

    expect(doc).toHaveBeenCalledWith(
      expect.anything(),
      "suppliers",
      "supplier123"
    );

    expect(result).toEqual({
      id: "supplier123",
      ...mockSupplier,
      ownerId: "user123",
    });
  });

  it("throws an error when supplier is not found", async () => {
    getDoc.mockResolvedValue({
      exists: () => false,
    });

    await expect(
      getSupplierById("missing", "user123")
    ).rejects.toThrow("Supplier not found.");
  });

  it("prevents access to another user's supplier", async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      id: "supplier123",
      data: () => ({
        ...mockSupplier,
        ownerId: "anotherUser",
      }),
    });

    await expect(
      getSupplierById("supplier123", "user123")
    ).rejects.toThrow(
      "You cannot access this supplier."
    );
  });

  it("updates a supplier successfully", async () => {
    updateDoc.mockResolvedValue(undefined);

    await updateSupplier(
      "supplier123",
      mockSupplier
    );

    expect(updateDoc).toHaveBeenCalledWith(
      "mock-supplier-ref",
      {
        ...mockSupplier,
        updatedAt: "mock-timestamp",
      }
    );
  });

  it("deletes a supplier successfully", async () => {
    deleteDoc.mockResolvedValue(undefined);

    await deleteSupplier("supplier123");

    expect(deleteDoc).toHaveBeenCalledWith(
      "mock-supplier-ref"
    );
  });

  it("handles Firebase creation errors", async () => {
    addDoc.mockRejectedValue(
      new Error("Permission denied")
    );

    await expect(
      addSupplier(mockSupplier, "user123")
    ).rejects.toThrow("Permission denied");
  });

  it("handles Firebase retrieval errors", async () => {
    getDoc.mockRejectedValue(
      new Error("Network error")
    );

    await expect(
      getSupplierById("supplier123", "user123")
    ).rejects.toThrow("Network error");
  });

  it("handles Firebase update errors", async () => {
    updateDoc.mockRejectedValue(
      new Error("Update failed")
    );

    await expect(
      updateSupplier("supplier123", mockSupplier)
    ).rejects.toThrow("Update failed");
  });

  it("handles Firebase deletion errors", async () => {
    deleteDoc.mockRejectedValue(
      new Error("Delete failed")
    );

    await expect(
      deleteSupplier("supplier123")
    ).rejects.toThrow("Delete failed");
  });
});
