import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
    const { user } = useAuth();
    const location = useLocation();

    const pageTitles = {
        "/dashboard": "Dashboard",
        "/suppliers": "Suppliers",
        "/suppliers/new": "Add Supplier",
        "/categories": "Supplier Categories",
        "/settings": "Settings & Profile",
    };

    const pageTitle =
        pageTitles[location.pathname] ||
        (location.pathname.startsWith("/suppliers/") &&
            location.pathname.endsWith("/edit")
            ? "Edit Supplier"
            : "Supplier Management System");

    return (
        <header className="bg-white shadow-sm px-4 md:px-6 py-4 flex flex-wrap items-center justify-center font-semibold ">
            <div>
                <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                    {pageTitle}
                </h1>
                
                <p className="text-sm text-gray-500">
                    Welcome to Supplier Management System
                </p>
            </div>

            <Link
                to="/settings"
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100"
            >
                <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-semibold">
                    {(
                        user?.displayName ||
                        user?.email ||
                        "U"
                    ).charAt(0).toUpperCase()}
                </div>

                <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">
                        {user?.displayName || "User"}
                    </p>

                    <p className="text-xs text-gray-500">
                        {user?.email}
                    </p>
                </div>
            </Link>    
        </header>
    );
}

export default Navbar;