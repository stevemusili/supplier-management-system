import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SupplierForm from "../suppliers/SupplierForm";
import { useAuth } from "../../context/AuthContext";

import {
  addSupplier,
  getSupplierById,
  updateSupplier,
} from "../../services/supplierService";

function SupplierFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditing = Boolean(id);

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !user) return;

    let cancelled = false;

    async function fetchSupplier() {
      setLoading(true);
      setError("");

      try {
        const data = await getSupplierById(id, user.uid);

        if (!cancelled) {
          setSupplier(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSupplier();

    return () => {
      cancelled = true;
    };
  }, [id, user?.uid]);

  async function handleSave(formData) {
    if (isEditing) {
      await updateSupplier(id, formData);
    } else {
      await addSupplier(formData, user.uid);
    }

    navigate("/suppliers");
  }

  if (loading) {
    return <p>Loading supplier...</p>;
  }

  if (error) {
    return <p role="alert" className="text-red-600">{error}</p>;
  }

  return (
      <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
              {isEditing ? "Edit Supplier" : "Add Supplier"}
          </h1>

          <SupplierForm
              key={id || "new"}
              initialData={supplier || {}}
              onSubmit={handleSave}
              submitLabel={
                  isEditing ? "Update Supplier" : "Add Supplier"
              }
          />
      </div>
  );
}

export default SupplierFormPage;