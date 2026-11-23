import { describe, it, expect, vi, beforeEach } from "vitest";

import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, } from "firebase/firestore";

import { addCategory, updateCategory, deleteCategory } from "./categoryService";

vi.mock("../firebase/config", () => ({
  db: { id: "mock-db" },
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => "mock-categories-collection"),
  addDoc: vi.fn(),
  doc: vi.fn(() => "mock-category-ref"),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => "mock-timestamp"),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("categoryService", () => {
  it("creates a category with the correct data", async () => {
    const data = {
      name: "  Packaging  ",
      description: "  Boxes and materials  ",
    };

    addDoc.mockResolvedValue({ id: "category123" });

    const result = await addCategory(data, "user123");

    expect(addDoc).toHaveBeenCalledWith(
      "mock-categories-collection",
      {
        name: "Packaging",
        description: "Boxes and materials",
        ownerId: "user123",
        createdAt: "mock-timestamp",
        updatedAt: "mock-timestamp",
      }
    );

    expect(result).toEqual({ id: "category123" });
  });

  it("rejects category creation when user is not logged in", async () => {
    await expect(
      addCategory(
        {
          name: "Packaging",
          description: "Boxes",
        },
        null
      )
    ).rejects.toThrow("You must be logged in.");

    expect(addDoc).not.toHaveBeenCalled();
  });

  it("updates an existing category", async () => {
    updateDoc.mockResolvedValue(undefined);

    const data = {
      name: "  Transport  ",
      description: "  Delivery services  ",
    };

    await updateCategory("category123", data);

    expect(doc).toHaveBeenCalledWith(
      expect.anything(),
      "categories",
      "category123"
    );

    expect(updateDoc).toHaveBeenCalledWith(
      "mock-category-ref",
      {
        name: "Transport",
        description: "Delivery services",
        updatedAt: "mock-timestamp",
      }
    );
  });

  it("deletes an existing category", async () => {
    deleteDoc.mockResolvedValue(undefined);

    await deleteCategory("category123");

    expect(doc).toHaveBeenCalledWith(
      expect.anything(),
      "categories",
      "category123"
    );

    expect(deleteDoc).toHaveBeenCalledWith(
      "mock-category-ref"
    );
  });

  it("handles Firebase errors during category creation", async () => {
    addDoc.mockRejectedValue(
      new Error("Permission denied")
    );

    await expect(
      addCategory(
        {
          name: "Packaging",
          description: "Boxes",
        },
        "user123"
      )
    ).rejects.toThrow("Permission denied");
  });

  it("handles Firebase errors during category updates", async () => {
    updateDoc.mockRejectedValue(
      new Error("Update failed")
    );

    await expect(
      updateCategory("category123", {
        name: "Transport",
        description: "Delivery",
      })
    ).rejects.toThrow("Update failed");
  });

  it("handles Firebase errors during category deletion", async () => {
    deleteDoc.mockRejectedValue(
      new Error("Delete failed")
    );

    await expect(
      deleteCategory("category123")
    ).rejects.toThrow("Delete failed");
  });
});