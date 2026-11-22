import { useState } from "react";

function SupplierForm({
  initialData = {},
  onSubmit,
  submitLabel = "Save Supplier",
}) {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    address: initialData.address || "",
    category: initialData.category || "",
    status: initialData.status || "Active",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Supplier name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!formData.category) {
      newErrors.category = "Select a category.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSubmitError("");

    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });
    } catch (err) {
      setSubmitError(
        err.message || "Unable to save supplier."
      );
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { name: "name", label: "Supplier Name", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Phone Number", type: "tel" },
    { name: "address", label: "Address", type: "text" },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white p-6 rounded-xl shadow-sm space-y-5"
    >
      {fields.map((field) => (
        <div key={field.name}>
          <label
            htmlFor={field.name}
            className="block mb-2 font-medium text-gray-700"
          >
            {field.label}
          </label>

          <input
            id={field.name}
            type={field.type}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            aria-invalid={Boolean(errors[field.name])}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          {errors[field.name] && (
            <p role="alert" className="text-red-600 text-sm mt-1">
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}

      <div>
        <label
          htmlFor="category"
          className="block mb-2 font-medium text-gray-700"
        >
          Category
        </label>

        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3"
        >
          <option value="">Select Category</option>
          <option value="IT Services">IT Services</option>
          <option value="Water">Water</option>
          <option value="Stationery">Stationery</option>
          <option value="Transport">Transport</option>
          <option value="Agriculture">Agriculture</option>
          <option value="Food & Beverage">Food & Beverage</option>
          <option value="Raw Materials">Raw Materials</option>
          <option value="Printing">Printing</option>
          <option value="Packaging">Packaging</option>
          <option value="Other">Other</option>
        </select>

        {errors.category && (
          <p role="alert" className="text-red-600 text-sm mt-1">
            {errors.category}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="status"
          className="block mb-2 font-medium text-gray-700"
        >
          Status
        </label>

        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {submitError && (
        <p role="alert" className="text-red-600">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default SupplierForm;