import RecentSuppliers from "../dashboard/RecentSuppliers";
import StatCard from "../dashboard/StatCard";

function Dashboard() {

    const suppliers = [
        {
            id: 1,
            name: "Shanks Ltd",
            category: "Office Supplies",
            email: "shanks@gmail.com",
            status: "Active",
            createdAt: "2026-11-21",
        },
        {
            id: 2,
            name: "Lacoste Transport",
            category: "Transport",
            email: "lacosted@gmail.com",
            status: "Pending",
            createdAt: "2026-11-21",
        },
        {
            id: 3,
            name: "Mural Prints",
            category: "Printing",
            email: "muralprints@gmail.com",
            status: "Inactive",
            createdAt: "2026-11-21"
        }
    ];

    const categories = [
        "Office Supplies",
        "Transport",
        "Printing",
    ];

    // calculate dashboard statistics
    const totalSuppliers = suppliers.length;

    const activeSuppliers = suppliers.filter(
        (supplier) => supplier.status === "Active"
    ).length;

    const inactiveSuppliers = suppliers.filter(
        (supplier) => supplier.status === "Inactive"
    ).length;

    const totalCategories = categories.length;

    // get the 5 most recently added suppliers
    const recentSuppliers = [...suppliers]
        .sort(
            (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 5);
    return (
        <div>
            {/* dashboard heading */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Dashboard Overview
                </h1>

                <p className="text-gray-500 mt-1">
                    Monitor and manage your suppliers.
                </p> 
            </div>

            {/* dashboard cards */}
            <div className="flex justify-between mt-4 mb-6">
                <StatCard
                    title="Total Suppliers"
                    value={totalSuppliers}
                />

                <StatCard 
                    title="Active Suppliers"
                    value={activeSuppliers}
                />

                <StatCard 
                    title="Inactive Suppliers"
                    value={inactiveSuppliers}
                />

                <StatCard 
                    title="Categories"
                    value={totalCategories}
                />
            </div>

            {/* Recently Added Suppliers */}
            <RecentSuppliers suppliers={recentSuppliers} />
        </div>
    );
}

export default Dashboard;