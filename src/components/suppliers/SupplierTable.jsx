import { Link } from "react-router-dom";

function SupplierTable({ suppliers, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-left min-w-[750px]">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Category</th>
            <th className="p-4">Contact</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="p-6 text-center text-gray-500"
              >
                No suppliers found.
              </td>
            </tr>
          ) : (
            suppliers.map((supplier) => (
              <tr
                key={supplier.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="p-4 font-medium">
                  {supplier.name}
                </td>

                <td className="p-4">
                  {supplier.category}
                </td>

                <td className="p-4">
                  <p>{supplier.email}</p>
                  <p className="text-sm text-gray-500">
                    {supplier.phone}
                  </p>
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      supplier.status === "Active"
                        ? "text-green-700"
                        : supplier.status === "Pending"
                        ? "text-orange-400"
                        : "text-red-600"
                    }`}
                  >
                    {supplier.status}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex gap-3">
                    <Link
                      to={`/suppliers/${supplier.id}/edit`}
                      className="text-blue-700 hover:underline"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => onDelete(supplier)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SupplierTable;