function RecentSuppliers({ suppliers }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-5">
                Recently Added Suppliers
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full text-center">
                    <thead>
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Contact</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {suppliers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="p-6 text-center text-gray-500"
                                >
                                    No suppliers added yet.
                                </td>
                            </tr>
                        ) : (
                            suppliers.map((supplier) => (
                                <tr
                                    key={supplier.id}
                                    className="border-t border-gray-200"
                                >
                                    <td className="p-3">{supplier.name}</td>
                                    <td className="p-3">{supplier.category}</td>
                                    <td className="p-3">{supplier.email}</td>
                                    <td className={`p-3 ${supplier.status === "Active"
                                            ? "text-green-700"
                                            : supplier.status === "Pending"
                                                ? "text-orange-400"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {supplier.status}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RecentSuppliers;
