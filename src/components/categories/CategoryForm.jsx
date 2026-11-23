import { useState } from "react";

function CategoryForm({ initialData = {}, onSubmit, onCancel, existingCategories = [] }) {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(
    initialData.description || ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(initialData.id);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const cleanName = name.trim();

    if (!cleanName) {
      setError("Category name is required.");
      return;
    }

    const duplicate = existingCategories.some(
      (category) =>
        category.name.toLowerCase() ===
          cleanName.toLowerCase() &&
        category.id !== initialData.id
    );

    if (duplicate) {
      setError("This category already exists.");
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        name: cleanName,
        description: description.trim(),
      });
    } catch (err) {
      setError(err.message || "Failed to save category.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#D9D9D9] rounded-lg p-6 md:p-8 space-y-5"
    >
      <h2 className="text-lg font-semibold text-gray-800">
        {isEditing ? "Edit Category" : "Add Category"}
      </h2>

      <div>
        <label
          htmlFor="categoryName"
          className="block text-sm mb-2"
        >
          Category Name
        </label>

        <input
          id="categoryName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Packaging"
          className="w-full bg-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="categoryDescription"
          className="block text-sm mb-2"
        >
          Description
        </label>

        <textarea
          id="categoryDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this category"
          rows={3}
          className="w-full bg-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-5 py-2 rounded-md"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded-md"
        >
          {loading
            ? "Saving..."
            : isEditing
            ? "Update Category"
            : "Save Category"}
        </button>
      </div>
    </form>
  );
}

export default CategoryForm;