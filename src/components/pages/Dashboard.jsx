import RecentSuppliers from "../dashboard/RecentSuppliers";
import StatCard from "../dashboard/StatCard";
import useDashboardData from "../../hooks/useDashboardData";

function Dashboard() {
    // import the custom hook
    const { suppliers, categories, loading, error } = useDashboardData();

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
        .sort((a, b) => {
            const dateA = a.createdAt?.toMillis?.() ?? 0;
            const dateB = b.createdAt?.toMillis?.() ?? 0;
            return dateB - dateA;
        })
        .slice(0, 5);

        if (loading) {
            return (
                <div role="status" className="p-6 text-gray-600">
                    Loading Dashboard...
                </div>
            );
        }

        if (error) {
            return (
                <div role="alert" className="p-6 text-red-600">
                    {error}
                </div>
            );
        }

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