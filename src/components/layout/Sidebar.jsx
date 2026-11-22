import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function SideBar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const links = [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Suppliers", path: "/suppliers" },
        { name: "Categories", path: "/categories" },
        { name: "Settings", path: "/setting" },
    ];

    async function handleLogout() {
        setError("");

        try {
            await logout();
            navigate("/login", { replace: true });
        } catch (err) {
            setError("Logout failed. Please try again.");
        }
    }

    return (
        <div className="bg-blue-900 text-white p-6 md:w-64 md:min-h-screen flex flex-col">
            <h1 className="text-2xl font-bold mb-8">
                Supplier Management System
            </h1>

            <nav className="flex flex-wrap gap-3 md:flex-col">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `block rounded-lg px-4 py-3 ${isActive
                                ? "bg-orange-500 text-white"
                                : "hover:bg-blue-800"
                            }`
                        }
                    >
                        {link.name}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-8">
                {error && (
                    <p role="alert" className="mb-3 text-sm text-red-200">
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-800"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default SideBar;