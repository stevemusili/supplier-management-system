import { useState } from "react";

import CategoryForm from "../categories/CategoryForm";
import CategoryTable from "../categories/CategoryTable";

import useCategories from "../../hooks/useCategories";
import useSuppliers from "../../hooks/useSuppliers";
import { useAuth } from "../../context/AuthContext";

import { addCategory, updateCategory, deleteCategory } from "../../services/categoryService";

function Categories() {
  const { user } = useAuth();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const {
    suppliers,
    loading: suppliersLoading,
    error: suppliersError,
  } = useSuppliers();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState(null);
  const [error, setError] = useState("");

  const filteredCategories = categories.filter(
    (category) =>
      category.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (category.description || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  function handleAddClick() {
    setEditingCategory(null);
    setShowForm(true);
    setError("");
  }

  function handleEdit(category) {
    setEditingCategory(category);
    setShowForm(true);
    setError("");
  }

  function handleCancel() {
    setShowForm(false);
    setEditingCategory(null);
  }

  async function handleSave(data) {
    setError("");

    try {
      if (editingCategory) {
        const oldName = editingCategory.name;

        // prevent renaming a category used by suppliers
        if (
          oldName !== data.name &&
          suppliers.some((s) => s.category === oldName)
        ) {
          throw new Error(
            "This category is in use. Reassign its suppliers before renaming it."
          );
        }

        // update existing category
        await updateCategory(editingCategory.id, data);
      } else {
        // Add new category
        await addCategory(data, user.uid);
      }

      // close form only after successful save
      setShowForm(false);
      setEditingCategory(null);

    } catch (err) {
      console.error("Category save failed:", err);

      setError(
        err.message || "Failed to save category."
      );
    }
  }

  async function handleDelete(category) {
    const supplierCount = suppliers.filter(
      (supplier) => supplier.category === category.name
    ).length;

    if (supplierCount > 0) {
      setError(
        `Cannot delete ${category.name}. It has ${supplierCount} supplier(s). Reassign them first.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${category.name}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteCategory(category.id);
    } catch (err) {
      setError(err.message || "Failed to delete category.");
    }
  }

  const loading = categoriesLoading || suppliersLoading;
  const loadError = categoriesError || suppliersError;

  return (
    <div className="min-h-screen bg-[#F8FAFC] space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-800">
          Categories
        </h1>

        <button
          type="button"
          onClick={handleAddClick}
          disabled={loading || Boolean(loadError)}
          className="bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-3 rounded-md text-sm"
        >
          + Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && !loading && !loadError && (
        <div className="max-w-2xl mx-auto">
          <CategoryForm
            key={editingCategory?.id || "new"}
            initialData={editingCategory || {}}
            existingCategories={categories}
            onSubmit={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Search */}
      <div className="max-w-md">
        <input
          type="search"
          aria-label="Search categories"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#F5F0F7] rounded-lg px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p role="status">Loading categories...</p>
      ) : loadError ? (
        <p role="alert" className="text-red-600">
          {loadError}
        </p>
      ) : (
        <CategoryTable
          categories={filteredCategories}
          suppliers={suppliers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default Categories;