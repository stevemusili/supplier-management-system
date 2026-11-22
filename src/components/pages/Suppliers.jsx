import { useState } from "react";
import { Link } from "react-router-dom";

import SupplierTable from "../suppliers/SupplierTable";
import useSuppliers from "../../hooks/useSuppliers";
import { deleteSupplier } from "../../services/supplierService";

function Suppliers() {
  const { suppliers, loading, error } = useSuppliers();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [selectedStatus, setSelectedStatus] =
    useState("All");
  const [deleteError, setDeleteError] = useState("");

  // Get available categories
  const categories = [
    ...new Set(suppliers.map((s) => s.category)),
  ].filter(Boolean).sort();

  // Search and filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const searchTerm = search.toLowerCase().trim();

    const matchesSearch =
      supplier.name?.toLowerCase().includes(searchTerm) ||
      supplier.email?.toLowerCase().includes(searchTerm) ||
      supplier.phone?.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "All" ||
      supplier.category === selectedCategory;

    const matchesStatus =
      selectedStatus === "All" ||
      supplier.status === selectedStatus;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus
    );
  });

  async function handleDelete(supplier) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${supplier.name}?`
    );

    if (!confirmed) return;

    setDeleteError("");

    try {
      await deleteSupplier(supplier.id);
    } catch (err) {
      console.error(err);
      setDeleteError("Failed to delete supplier.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Suppliers
          </h1>

          <p className="text-gray-500">
            Manage your supplier records.
          </p>
        </div>

        <Link
          to="/suppliers/new"
          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-lg"
        >
          + Add Supplier
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="search"
          placeholder="Search suppliers..."
          aria-label="Search suppliers"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg p-3"
        />

        <select
          aria-label="Filter by category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-lg p-3"
        >
          <option value="All">All Categories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 rounded-lg p-3"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Supplier Count */}
      <p className="text-sm text-gray-600">
        Showing {filteredSuppliers.length} of{" "}
        {suppliers.length} suppliers
      </p>

      {deleteError && (
        <p role="alert" className="text-red-600">
          {deleteError}
        </p>
      )}

      {loading ? (
        <p role="status">Loading suppliers...</p>
      ) : error ? (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      ) : (
        <SupplierTable
          suppliers={filteredSuppliers}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default Suppliers;