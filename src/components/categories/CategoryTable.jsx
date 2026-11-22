function CategoryTable({ categories, suppliers, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg p-5 overflow-x-auto">
      <table className="w-full min-w-[650px] text-left">
        <thead>
          <tr className="text-sm text-gray-800">
            <th className="pb-5">Category</th>
            <th className="pb-5">Description</th>
            <th className="pb-5">Suppliers</th>
            <th className="pb-5">Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="text-center py-8 text-gray-500"
              >
                No categories found.
              </td>
            </tr>
          ) : (
            categories.map((category) => {
              const supplierCount = suppliers.filter(
                (supplier) =>
                  supplier.category === category.name
              ).length;

              return (
                <tr
                  key={category.id}
                  className="text-sm text-gray-800"
                >
                  <td className="py-3 pr-4 font-medium">
                    {category.name}
                  </td>

                  <td className="py-3 pr-4">
                    {category.description || "—"}
                  </td>

                  <td className="py-3 pr-4">
                    {supplierCount}
                  </td>

                  <td className="py-3">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        className="text-orange-500 hover:underline"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(category)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryTable;